# Web版本入口
from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
import json
import sys
sys.path.insert(0, ".")

from commands.data import COMMAND_DB, get_commands_by_category, search_commands
from commands.categories import CATEGORIES
from simulator.sandbox import CommandSimulator

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# 存储用户的模拟器会话
user_sessions = {}


@app.route('/')
def index():
    """主页"""
    return render_template('index.html')


@app.route('/api/categories')
def api_categories():
    """获取所有分类"""
    result = []
    for key, cat in CATEGORIES.items():
        count = len(get_commands_by_category(key))
        result.append({
            "key": key,
            "name": cat["name"],
            "icon": cat["icon"],
            "description": cat["description"],
            "count": count
        })
    return jsonify(result)


@app.route('/api/commands/<category>')
def api_commands_by_category(category):
    """获取分类下的命令"""
    commands = get_commands_by_category(category)
    result = []
    for name, cmd in commands.items():
        result.append({
            "name": name,
            "desc": cmd["desc"],
            "syntax": cmd["syntax"]
        })
    return jsonify(result)


@app.route('/api/command/<name>')
def api_command_detail(name):
    """获取命令详情"""
    cmd = COMMAND_DB.get(name)
    if not cmd:
        return jsonify({"error": "Command not found"}), 404
    return jsonify(cmd)


@app.route('/api/search')
def api_search():
    """搜索命令"""
    keyword = request.args.get('q', '')
    results = search_commands(keyword)
    result_list = []
    for name, cmd in results.items():
        result_list.append({
            "name": name,
            "desc": cmd["desc"],
            "category": cmd["category"]
        })
    return jsonify(result_list)


@app.route('/api/terminal/init')
def api_terminal_init():
    """初始化终端会话"""
    import uuid
    session_id = str(uuid.uuid4())
    user_sessions[session_id] = CommandSimulator()
    return jsonify({
        "session_id": session_id,
        "cwd": "/home/user",
        "message": "Terminal ready"
    })


@app.route('/api/terminal/exec', methods=['POST'])
def api_terminal_exec():
    """执行终端命令"""
    data = request.json
    session_id = data.get('session_id')
    command = data.get('command', '')

    if not session_id or session_id not in user_sessions:
        return jsonify({"error": "Invalid session"}), 400

    simulator = user_sessions[session_id]
    success, output, error = simulator.execute(command)

    return jsonify({
        "success": success,
        "output": output,
        "error": error,
        "cwd": simulator.fs.cwd
    })


from modes.practice import PRACTICE_SCENARIOS


@app.route('/api/scenarios')
def api_scenarios():
    """获取练习场景列表"""
    result = []
    for s in PRACTICE_SCENARIOS:
        result.append({
            "id": s.id,
            "title": s.title,
            "description": s.description,
            "difficulty": s.difficulty,
            "task_count": len(s.tasks)
        })
    return jsonify(result)


@app.route('/api/scenario/<int:scenario_id>')
def api_scenario_detail(scenario_id):
    """获取场景详情"""
    for s in PRACTICE_SCENARIOS:
        if s.id == scenario_id:
            # 只返回可序列化的数据（移除check函数）
            tasks = []
            for t in s.tasks:
                tasks.append({
                    "prompt": t.prompt,
                    "hint": t.hint,
                    "success_msg": t.success_msg
                })
            return jsonify({
                "id": s.id,
                "title": s.title,
                "description": s.description,
                "difficulty": s.difficulty,
                "tasks": tasks
            })
    return jsonify({"error": "Scenario not found"}), 404


@app.route('/api/scenario/<int:scenario_id>/check', methods=['POST'])
def api_scenario_check(scenario_id):
    """检查练习答案"""
    data = request.json
    task_idx = data.get('task_idx', 0)
    command = data.get('command', '')

    for s in PRACTICE_SCENARIOS:
        if s.id == scenario_id:
            if task_idx >= len(s.tasks):
                return jsonify({"error": "Invalid task index"}), 400

            task = s.tasks[task_idx]
            # 检查命令是否正确
            is_correct = task.check(command)

            return jsonify({
                "correct": is_correct,
                "success_msg": task.success_msg if is_correct else None,
                "hint": task.hint if not is_correct else None,
                "explanation_on_correct": task.explanation_on_correct if is_correct else None,
                "explanation_on_wrong": task.explanation_on_wrong if not is_correct else None,
                "correct_patterns": task.correct_patterns if not is_correct else None
            })
    return jsonify({"error": "Scenario not found"}), 404


from modes.quiz import QUIZ_QUESTIONS

# 存储当前会话的题目映射（简化版，实际应使用session或缓存）
quiz_sessions = {}

@app.route('/api/quiz/questions')
def api_quiz_questions():
    """获取测验题目"""
    import random

    # 获取题目数量参数，默认10题
    num = request.args.get('num', 10, type=int)
    num = min(max(num, 1), len(QUIZ_QUESTIONS))  # 限制在有效范围

    # 获取session_id
    session_id = request.args.get('session_id') or request.remote_addr

    # 随机选择题目
    questions = random.sample(QUIZ_QUESTIONS, num)

    # 保存题目映射关系
    quiz_sessions[session_id] = questions

    # 只返回题目，不包含答案
    result = []
    for i, q in enumerate(questions):
        q_copy = {
            "id": i,  # 前端使用的ID
            "type": q["type"],
            "question": q["question"],
            "explain": q["explain"]
        }
        if q["type"] == "choice":
            q_copy["options"] = q["options"]
        result.append(q_copy)
    return jsonify(result)


@app.route('/api/quiz/answer', methods=['POST'])
def api_quiz_answer():
    """提交答案"""
    data = request.json
    question_id = data.get('question_id')
    answer = data.get('answer')

    # 获取session_id
    session_id = request.args.get('session_id') or request.remote_addr

    # 获取当前会话的题目列表
    if session_id not in quiz_sessions:
        return jsonify({"error": "Session expired, please get questions again"}), 400

    session_questions = quiz_sessions[session_id]

    if question_id is None or question_id >= len(session_questions):
        return jsonify({"error": "Invalid question"}), 400

    q = session_questions[question_id]
    correct = False
    correct_answer = q["answer"]

    if q["type"] == "choice":
        # choice类型的答案是索引
        try:
            answer_idx = int(answer)
            correct = (answer_idx == correct_answer)
            correct_answer = q["options"][correct_answer]
        except (ValueError, TypeError):
            correct = False
    elif q["type"] == "truefalse":
        # 判断题
        try:
            answer_bool = str(answer).lower() in ['true', 't', '1', 'yes']
            correct = (answer_bool == correct_answer)
            correct_answer = "正确" if correct_answer else "错误"
        except:
            correct = False
    else:
        # fill类型或其他
        if isinstance(correct_answer, list):
            correct = answer.lower() in [a.lower() for a in correct_answer]
        else:
            correct = answer.lower() == correct_answer.lower()

    return jsonify({
        "correct": correct,
        "correct_answer": correct_answer,
        "explain": q["explain"]
    })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
