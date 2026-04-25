// Linux Tutor Web App
// 全局变量
let currentSessionId = null;
let currentPage = 'learn';
let currentCategory = null;
let currentScenario = null;
let currentTaskIndex = 0;
let quizQuestions = [];
let currentQuizIndex = 0;
let quizScore = 0;

// 初始化
$(document).ready(function() {
    initApp();
});

function initApp() {
    // 检测是否在 iframe 中
    if (window.self !== window.top) {
        // 在 iframe 中，显示返回按钮
        $('#back-to-ripple').show();
        // 添加 iframe 样式类
        $('body').addClass('in-iframe');
    }

    // 绑定导航
    $('.nav-item').click(function(e) {
        e.preventDefault();
        const page = $(this).data('page');
        switchPage(page);
    });

    // 搜索功能
    $('#search-input').on('keyup', function(e) {
        if (e.key === 'Enter') {
            searchCommands($(this).val());
        }
    });

    // 加载分类
    loadCategories();
}

// 返回主平台函数
function goBackToRipple() {
    if (window.parent !== window) {
        window.parent.location.href = '/';
    } else {
        window.location.href = '/';
    }
}

// 页面切换
function switchPage(page) {
    currentPage = page;
    $('.nav-item').removeClass('active');
    $(`.nav-item[data-page="${page}"]`).addClass('active');
    $('.page').removeClass('active');
    $('#page-' + page).addClass('active');

    // 更新标题
    const titles = {
        'learn': '学习模式',
        'practice': '练习模式',
        'quiz': '测验模式'
    };
    $('#page-title').text(titles[page]);

    // 加载页面数据
    if (page === 'practice') {
        loadScenarios();
    } else if (page === 'learn') {
        showCategories();
    }
}

// ============ 学习模式 ============

// 加载分类
function loadCategories() {
    $.get('/api/categories', function(data) {
        renderCategories(data);
    });
}

// 渲染分类
function renderCategories(categories) {
    const grid = $('#category-grid');
    grid.empty();

    categories.forEach(cat => {
        const card = `
            <div class="category-card" onclick="showCommands('${cat.key}')">
                <div class="icon">${cat.icon}</div>
                <h3>${cat.name}</h3>
                <p>${cat.description}</p>
                <span class="count">${cat.count} 个命令</span>
            </div>
        `;
        grid.append(card);
    });
}

// 显示分类
function showCategories() {
    $('#category-grid').show();
    $('#command-list-container').hide();
    $('#command-detail').hide();
    currentCategory = null;
}

// 显示命令列表
function showCommands(category) {
    currentCategory = category;
    $.get(`/api/commands/${category}`, function(data) {
        renderCommandList(data);
        $('#category-grid').hide();
        $('#command-list-container').show();
        $('#command-detail').hide();
    });
}

// 渲染命令列表
function renderCommandList(commands) {
    const list = $('#command-list');
    list.empty();

    commands.forEach(cmd => {
        const item = `
            <div class="command-item" onclick="showCommandDetail('${cmd.name}')">
                <span class="cmd-name">${cmd.name}</span>
                <span class="cmd-desc">${cmd.desc}</span>
                <span class="cmd-syntax">${cmd.syntax}</span>
            </div>
        `;
        list.append(item);
    });
}

// 返回命令列表
function showCommandList() {
    $('#command-detail').hide();
    $('#command-list-container').show();
}

// 显示命令详情
function showCommandDetail(name) {
    $.get(`/api/command/${name}`, function(cmd) {
        renderCommandDetail(cmd);
        $('#command-list-container').hide();
        $('#command-detail').show();
    });
}

// 渲染命令详情
function renderCommandDetail(cmd) {
    const container = $('#command-detail-content');
    container.empty();

    // 选项表格
    let optionsHtml = '';
    if (cmd.options && cmd.options.length > 0) {
        optionsHtml = `
            <div class="detail-section">
                <h3><i class="fas fa-sliders-h"></i> 选项</h3>
                <table class="options-table">
                    ${cmd.options.map(opt => `
                        <tr>
                            <td>${opt.flag}</td>
                            <td>${opt.desc}</td>
                        </tr>
                    `).join('')}
                </table>
            </div>
        `;
    }

    // 示例
    let examplesHtml = '';
    if (cmd.examples && cmd.examples.length > 0) {
        examplesHtml = `
            <div class="detail-section">
                <h3><i class="fas fa-code"></i> 示例</h3>
                ${cmd.examples.map(ex => `
                    <div class="example-box">
                        <code>$ ${ex.cmd}</code>
                        <p>${ex.desc}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // 备注
    let noteHtml = '';
    if (cmd.note) {
        noteHtml = `
            <div class="detail-section">
                <h3><i class="fas fa-lightbulb"></i> 提示</h3>
                <p style="color: var(--warning);">${cmd.note}</p>
            </div>
        `;
    }

    const html = `
        <h2>${cmd.name}</h2>
        <span class="category">${cmd.category}</span>
        <div class="syntax">${cmd.syntax}</div>
        <div class="detail-section">
            <h3><i class="fas fa-info-circle"></i> 描述</h3>
            <p>${cmd.desc}</p>
        </div>
        ${optionsHtml}
        ${examplesHtml}
        ${noteHtml}
    `;

    container.html(html);
}

// 搜索命令
function searchCommands(keyword) {
    if (!keyword) return;

    $.get(`/api/search?q=${encodeURIComponent(keyword)}`, function(data) {
        renderCommandList(data);
        $('#category-grid').hide();
        $('#command-list-container').show();
        $('#command-detail').hide();
    });
}

// ============ 练习模式 ============

// 加载场景
function loadScenarios() {
    $.get('/api/scenarios', function(data) {
        renderScenarios(data);
    });
}

// 渲染场景列表
function renderScenarios(scenarios) {
    const list = $('#scenario-list');
    list.empty();

    scenarios.forEach(s => {
        const difficultyClass = s.difficulty === '简单' ? 'easy' :
                               s.difficulty === '中等' ? 'medium' : 'hard';

        const card = `
            <div class="scenario-card" onclick="startScenario(${s.id})">
                <h3>${s.title}</h3>
                <p>${s.description}</p>
                <div class="meta">
                    <span class="difficulty ${difficultyClass}">${s.difficulty}</span>
                    <span class="tasks"><i class="fas fa-tasks"></i> ${s.task_count} 个任务</span>
                </div>
            </div>
        `;
        list.append(card);
    });
}

// 返回场景列表
function showScenarioList() {
    $('#scenario-list').show();
    $('#practice-area').hide();
    currentScenario = null;
}

// 开始场景
function startScenario(id) {
    $.get(`/api/scenario/${id}`, function(data) {
        currentScenario = data;
        currentTaskIndex = 0;
        renderPractice();
        $('#scenario-list').hide();
        $('#practice-area').show();
    });
}

// 渲染练习界面
function renderPractice() {
    $('#scenario-title').text(currentScenario.title);
    $('#scenario-desc').text(currentScenario.description);
    $('#scenario-difficulty').text(currentScenario.difficulty)
        .attr('class', 'difficulty ' + (currentScenario.difficulty === '简单' ? 'easy' :
                                        currentScenario.difficulty === '中等' ? 'medium' : 'hard'));

    // 渲染任务进度
    renderTaskProgress();

    // 初始化练习终端（作为新任务，完全清屏）
    initPracticeTerminal(true);
}

// 渲染任务进度
function renderTaskProgress() {
    const container = $('#task-progress');
    container.empty();

    currentScenario.tasks.forEach((task, idx) => {
        const status = idx < currentTaskIndex ? 'completed' :
                      idx === currentTaskIndex ? 'active' : '';
        const icon = idx < currentTaskIndex ? 'fa-check-circle' :
                    idx === currentTaskIndex ? 'fa-circle' : 'fa-circle';

        const item = `
            <div class="task-item ${status}">
                <i class="fas ${icon}"></i>
                <span>${task.prompt}</span>
            </div>
        `;
        container.append(item);
    });
}

// 初始化练习终端
function initPracticeTerminal(isNewTask = false) {
    const terminal = $('#practice-terminal');

    // 首次初始化，构建终端结构
    if (terminal.children().length === 0) {
        terminal.html(`
            <div class="terminal-window">
                <div class="terminal-titlebar">
                    <div class="terminal-buttons">
                        <span class="tbtn close"></span>
                        <span class="tbtn minimize"></span>
                        <span class="tbtn maximize"></span>
                    </div>
                    <div class="terminal-title">user@linux: ~</div>
                </div>
                <div class="terminal-content">
                    <div class="terminal-output" id="practice-output"></div>
                </div>
            </div>
        `);
    }

    // 获取当前任务
    const task = currentScenario.tasks[currentTaskIndex];

    // 如果是新题目或首次加载，完全清屏并显示任务（不显示提示/答案）
    if (isNewTask || $('#practice-output').children().length === 0) {
        $('#practice-output').empty();
        appendToPractice(`[任务 ${currentTaskIndex + 1}/${currentScenario.tasks.length}]`, 'task-header');
        appendToPractice(`${task.prompt}`, 'task');
        appendToPractice('', 'spacer');
    }

    // 添加输入行（如果还没有）
    if ($('#practice-input-line').length === 0) {
        $('#practice-output').append(`
            <div class="terminal-input-line" id="practice-input-line">
                <span class="prompt" id="practice-prompt">user@linux:~$</span>
                <input type="text" id="practice-input" autofocus autocomplete="off" spellcheck="false">
            </div>
        `);
    }

    // 更新提示符显示当前路径
    updatePracticePrompt();

    // 绑定输入
    $('#practice-input').off('keydown').on('keydown', function(e) {
        if (e.key === 'Enter') {
            const cmd = $(this).val();
            if (cmd.trim()) {
                $(this).val('');
                executePracticeCommand(cmd);
            }
        }
    }).focus();
}

// 更新练习终端提示符
function updatePracticePrompt() {
    // 练习模式下固定显示 ~，因为不涉及实际目录切换
    $('#practice-prompt').text('user@linux:~$');
}

// 执行练习命令
function executePracticeCommand(command) {
    const inputLine = $('#practice-input-line');
    const promptText = $('#practice-prompt').text();

    // 移除输入行
    inputLine.remove();

    // 显示命令（带提示符）
    appendToPractice(`${promptText} ${command}`, 'command-line');

    // 检查是否是当前任务的正确命令
    const task = currentScenario.tasks[currentTaskIndex];

    // 发送命令到后端验证
    $.ajax({
        url: `/api/scenario/${currentScenario.id}/check`,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            task_idx: currentTaskIndex,
            command: command
        }),
        success: function(response) {
            if (response.correct) {
                // 答对了：显示输出和知识点
                appendToPractice('', 'spacer');
                appendToPractice(response.success_msg, 'success');
                appendToPractice(`知识点: ${response.explanation_on_correct}`, 'explain');

                // 检查是否是最后一题
                const isLastTask = (currentTaskIndex + 1) >= currentScenario.tasks.length;

                if (isLastTask) {
                    // 最后一题：延迟显示完成弹窗
                    setTimeout(() => {
                        currentTaskIndex++;
                        renderTaskProgress();
                        showPracticeCompleteModal();
                    }, 800);
                } else {
                    // 不是最后一题：显示成功弹窗，点击后进入下一题
                    setTimeout(() => {
                        showPracticeSuccessModal(response.success_msg, response.explanation_on_correct, function() {
                            currentTaskIndex++;
                            renderTaskProgress();
                            initPracticeTerminal(true);
                        });
                    }, 500);
                }
            } else {
                // 答错了：显示错误解释和提示
                appendToPractice('', 'spacer');
                appendToPractice(`bash: command not found or invalid: ${command}`, 'error');
                if (response.explanation_on_wrong) {
                    appendToPractice(response.explanation_on_wrong, 'error-hint');
                }
                // 错了才给提示
                if (response.hint) {
                    appendToPractice(`提示: ${response.hint}`, 'hint');
                }

                // 重新添加输入行，让用户继续输入
                addInputLine();
            }
        },
        error: function() {
            appendToPractice('验证失败，请重试', 'error');
            addInputLine();
        }
    });
}

// 添加输入行到终端
function addInputLine() {
    const output = $('#practice-output');
    output.append(`
        <div class="terminal-input-line" id="practice-input-line">
            <span class="prompt" id="practice-prompt">user@linux:~$</span>
            <input type="text" id="practice-input" autofocus autocomplete="off" spellcheck="false">
        </div>
    `);
    updatePracticePrompt();
    $('#practice-input').on('keydown', function(e) {
        if (e.key === 'Enter') {
            const cmd = $(this).val();
            if (cmd.trim()) {
                $(this).val('');
                executePracticeCommand(cmd);
            }
        }
    }).focus();
}

// 添加内容到练习终端
function appendToPractice(text, type) {
    const output = $('#practice-output');
    let className = 'terminal-line';
    if (type) className += ' ' + type;

    const line = $(`<div class="${className}"></div>`);
    line.text(text);
    output.append(line);
    output.scrollTop(output[0].scrollHeight);
}

// ============ 测验模式 ============

// 开始测验（带选项）
function startQuizWithOptions() {
    const num = parseInt($('#quiz-num-select').val()) || 10;
    startQuiz(num);
}

// 开始测验
function startQuiz(numQuestions = 10) {
    $('#quiz-start').hide();
    $('#quiz-result').hide();
    $('#quiz-question').show();

    currentQuizIndex = 0;
    quizScore = 0;

    // 加载题目，支持自定义数量
    $.get(`/api/quiz/questions?num=${numQuestions}`, function(data) {
        quizQuestions = data;
        renderQuestion();
    });
}

// 渲染题目
function renderQuestion() {
    const q = quizQuestions[currentQuizIndex];

    // 更新进度
    $('#quiz-progress-text').text(`${currentQuizIndex + 1}/${quizQuestions.length}`);
    $('#quiz-progress-fill').css('width', `${((currentQuizIndex + 1) / quizQuestions.length) * 100}%`);

    // 渲染题目
    $('#quiz-question-text').text(q.question);

    // 渲染选项
    const optionsContainer = $('#quiz-options');
    optionsContainer.empty();

    if (q.type === 'choice') {
        q.options.forEach((opt, idx) => {
            const option = `
                <div class="quiz-option" onclick="answerQuiz(${idx})">
                    <span class="letter">${String.fromCharCode(65 + idx)}</span>
                    <span>${opt}</span>
                </div>
            `;
            optionsContainer.append(option);
        });
    } else if (q.type === 'truefalse') {
        // 判断题：显示对/错按钮
        const trueFalseOptions = `
            <div class="quiz-option truefalse-option" onclick="answerQuiz(true)">
                <span class="letter"><i class="fas fa-check"></i></span>
                <span>正确</span>
            </div>
            <div class="quiz-option truefalse-option" onclick="answerQuiz(false)">
                <span class="letter"><i class="fas fa-times"></i></span>
                <span>错误</span>
            </div>
        `;
        optionsContainer.html(trueFalseOptions);
    } else {
        // 填空题 - 优化样式
        optionsContainer.html(`
            <div class="quiz-input-wrapper">
                <input type="text" class="quiz-input" id="fill-answer" placeholder="请输入你的答案..." autocomplete="off">
                <button class="btn-primary quiz-submit-btn" onclick="submitFillAnswer()">
                    <i class="fas fa-paper-plane"></i> 提交答案
                </button>
            </div>
        `);
        // 绑定回车键提交
        setTimeout(() => {
            $('#fill-answer').on('keypress', function(e) {
                if (e.key === 'Enter') {
                    submitFillAnswer();
                }
            }).focus();
        }, 100);
    }

    // 清除之前的反馈信息
    $('#quiz-feedback').remove();
}

// 回答选择题/判断题
function answerQuiz(answer) {
    const q = quizQuestions[currentQuizIndex];

    // 发送答案到后端验证
    $.ajax({
        url: '/api/quiz/answer',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            question_id: currentQuizIndex,
            answer: answer
        }),
        success: function(response) {
            const isCorrect = response.correct;

            if (isCorrect) quizScore++;

            // 显示对错样式
            const options = $('.quiz-option');
            if (q.type === 'truefalse') {
                // 判断题：高亮选中的按钮
                options.each(function() {
                    const optAnswer = $(this).attr('onclick').includes('true') ? true : false;
                    if (optAnswer === answer) {
                        $(this).addClass(isCorrect ? 'correct' : 'wrong');
                    }
                    if (!isCorrect && optAnswer === response.correct_answer) {
                        $(this).addClass('correct');
                    }
                });
            } else {
                // 选择题
                options.eq(answer).addClass(isCorrect ? 'correct' : 'wrong');
                if (!isCorrect && q.type === 'choice') {
                    const correctIdx = q.options.indexOf(response.correct_answer);
                    if (correctIdx >= 0) {
                        options.eq(correctIdx).addClass('correct');
                    }
                }
            }

            // 禁用点击
            options.off('click');
            options.css('cursor', 'default');

            if (isCorrect) {
                // 答对了：页内显示成功，不弹窗
                showQuizFeedback(true, response.explain);
                // 1.5秒后自动下一题
                setTimeout(() => {
                    nextQuizQuestion();
                }, 1500);
            } else {
                // 答错了：页内显示错误提示（醒目）
                showQuizFeedback(false, response.explain, response.correct_answer);
                // 2秒后自动下一题
                setTimeout(() => {
                    nextQuizQuestion();
                }, 2500);
            }
        },
        error: function() {
            alert('提交答案失败，请重试');
        }
    });
}

// 显示测验反馈（页内）
function showQuizFeedback(isCorrect, explain, correctAnswer) {
    $('#quiz-feedback').remove();

    if (isCorrect) {
        // 成功提示
        const feedbackHtml = `
            <div id="quiz-feedback" class="quiz-feedback success">
                <i class="fas fa-check-circle"></i>
                <div class="feedback-content">
                    <div class="feedback-title">回答正确！</div>
                    ${explain ? `<div class="explain">${explain}</div>` : ''}
                </div>
            </div>
        `;
        $('#quiz-options').after(feedbackHtml);
    } else {
        // 错误提示 - 更醒目
        const feedbackHtml = `
            <div id="quiz-feedback" class="quiz-feedback error">
                <i class="fas fa-exclamation-circle"></i>
                <div class="feedback-content">
                    <div class="feedback-title">回答错误！</div>
                    ${correctAnswer ? `<div style="color: var(--text-primary); margin-bottom: 8px;"><strong>正确答案：</strong>${correctAnswer}</div>` : ''}
                    ${explain ? `<div class="explain">${explain}</div>` : ''}
                </div>
            </div>
        `;
        $('#quiz-options').after(feedbackHtml);
    }
}

// 下一题
function nextQuizQuestion() {
    currentQuizIndex++;
    if (currentQuizIndex >= quizQuestions.length) {
        showQuizResult();
    } else {
        renderQuestion();
    }
}

// 提交填空答案
function submitFillAnswer() {
    const answer = $('#fill-answer').val().trim();
    if (!answer) {
        $('#fill-answer').addClass('shake');
        setTimeout(() => $('#fill-answer').removeClass('shake'), 500);
        return;
    }

    // 发送答案到后端验证
    $.ajax({
        url: '/api/quiz/answer',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            question_id: currentQuizIndex,
            answer: answer
        }),
        success: function(response) {
            const isCorrect = response.correct;

            if (isCorrect) quizScore++;

            // 禁用输入和按钮
            $('#fill-answer').prop('disabled', true);
            $('.quiz-submit-btn').prop('disabled', true).css('opacity', '0.5');

            if (isCorrect) {
                $('#fill-answer').css('border-color', 'var(--success)');
                showQuizFeedback(true, response.explain);
                setTimeout(() => {
                    nextQuizQuestion();
                }, 1500);
            } else {
                $('#fill-answer').css('border-color', 'var(--error)');
                showQuizFeedback(false, response.explain, response.correct_answer);
                setTimeout(() => {
                    nextQuizQuestion();
                }, 2500);
            }
        },
        error: function() {
            alert('提交答案失败，请重试');
        }
    });
}

// 显示测验结果
function showQuizResult() {
    $('#quiz-question').hide();
    $('#quiz-result').show();

    const percentage = Math.round((quizScore / quizQuestions.length) * 100);
    let grade = '';
    let color = '';

    if (percentage >= 90) {
        grade = '优秀！🌟';
        color = 'var(--success)';
    } else if (percentage >= 70) {
        grade = '良好！👍';
        color = 'var(--primary)';
    } else if (percentage >= 60) {
        grade = '及格 😊';
        color = 'var(--warning)';
    } else {
        grade = '继续加油 💪';
        color = 'var(--error)';
    }

    $('#score-display').html(`
        <div style="color: ${color}; margin-bottom: 10px;">${grade}</div>
        <div>${quizScore} / ${quizQuestions.length}</div>
        <div style="font-size: 24px; color: var(--text-secondary); margin-top: 10px;">${percentage}%</div>
    `);
}

// ============ 练习模式弹窗 ============

// 显示练习成功弹窗
function showPracticeSuccessModal(message, explain, onContinue) {
    // 移除已存在的弹窗
    $('.practice-modal-overlay').remove();

    const modalHtml = `
        <div class="practice-modal-overlay" onclick="if(event.target===this)closePracticeModal()">
            <div class="practice-modal success-modal">
                <div class="modal-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="modal-title">回答正确！</div>
                <div class="modal-message">${message}</div>
                ${explain ? `<div class="modal-explain"><i class="fas fa-lightbulb"></i> ${explain}</div>` : ''}
                <button class="modal-btn btn-success" onclick="closePracticeModal(); if(${typeof onContinue === 'function'}) { (${onContinue})(); }">
                    <i class="fas fa-arrow-right"></i> 继续下一题
                </button>
            </div>
        </div>
    `;

    $('body').append(modalHtml);

    // 动画显示
    setTimeout(() => {
        $('.practice-modal-overlay').addClass('show');
    }, 10);
}

// 显示练习完成弹窗
function showPracticeCompleteModal() {
    $('.practice-modal-overlay').remove();

    const modalHtml = `
        <div class="practice-modal-overlay">
            <div class="practice-modal complete-modal">
                <div class="modal-icon">
                    <i class="fas fa-trophy"></i>
                </div>
                <div class="modal-title">场景完成！</div>
                <div class="modal-message">恭喜你已完成「${currentScenario.title}」的所有任务</div>
                <div class="modal-actions">
                    <button class="modal-btn btn-secondary" onclick="closePracticeModal(); showScenarioList();">
                        <i class="fas fa-list"></i> 返回场景列表
                    </button>
                    <button class="modal-btn btn-primary" onclick="closePracticeModal(); startScenario(${currentScenario.id});">
                        <i class="fas fa-redo"></i> 重新练习
                    </button>
                </div>
            </div>
        </div>
    `;

    $('body').append(modalHtml);

    setTimeout(() => {
        $('.practice-modal-overlay').addClass('show');
    }, 10);
}

// 关闭练习弹窗
function closePracticeModal() {
    $('.practice-modal-overlay').removeClass('show');
    setTimeout(() => {
        $('.practice-modal-overlay').remove();
    }, 300);
}

