<template>
  <el-config-provider :locale="zhCn">
    <router-view />
  </el-config-provider>
</template>

<script setup lang="ts">
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
</script>

<style>
#app {
  width: 100%;
  min-height: 100vh;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  touch-action: auto;
  -webkit-text-size-adjust: 100%;
  -ms-text-size-adjust: 100%;
}

html,
body {
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
  touch-action: auto;
}

body {
  color: #1f2a44;
  background: #e9edf5;
  font-family: "SF Pro Display", "PingFang SC", "Helvetica Neue", sans-serif;
}

.el-dialog {
  max-width: 95vw;
  border-radius: 32px !important;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.78);
  box-shadow:
    0 24px 56px rgba(148, 163, 184, 0.16),
    inset 0 1px 0 rgba(255, 255, 255, 0.92);
}

.el-dialog__header,
.el-dialog__body,
.el-dialog__footer {
  background: rgba(255, 255, 255, 0.94);
}

.el-card {
  border-radius: 32px !important;
  border: 1px solid rgba(255, 255, 255, 0.72) !important;
  box-shadow:
    0 20px 40px rgba(148, 163, 184, 0.14),
    inset 0 1px 0 rgba(255, 255, 255, 0.92) !important;
}

.el-card__header,
.el-card__body {
  background: rgba(255, 255, 255, 0.92);
}

.el-button {
  border-radius: 999px !important;
  min-height: 40px;
  padding-inline: 18px;
  font-weight: 600;
  box-shadow: 0 10px 24px rgba(148, 163, 184, 0.12);
  transition:
    transform 220ms cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 220ms cubic-bezier(0.22, 1, 0.36, 1),
    background-color 220ms cubic-bezier(0.22, 1, 0.36, 1),
    border-color 220ms cubic-bezier(0.22, 1, 0.36, 1);
}

.el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 28px rgba(148, 163, 184, 0.16);
}

.el-button.is-link {
  min-height: auto;
  padding-inline: 6px;
  box-shadow: none;
}

.el-button--small {
  min-height: 34px;
  padding-inline: 14px;
}

.el-button--large {
  min-height: 44px;
  padding-inline: 22px;
}

.el-input__wrapper,
.el-select__wrapper,
.el-textarea__inner,
.el-date-editor.el-input__wrapper,
.el-date-editor .el-input__wrapper,
.el-input-number,
.el-input-number .el-input__wrapper {
  border-radius: 22px !important;
  background: rgba(255, 255, 255, 0.94) !important;
  box-shadow:
    inset 0 0 0 1px rgba(226, 232, 240, 0.95),
    0 10px 24px rgba(148, 163, 184, 0.08) !important;
}

.el-input__wrapper.is-focus,
.el-select__wrapper.is-focused,
.el-textarea__inner:focus,
.el-date-editor .el-input__wrapper.is-focus {
  box-shadow:
    inset 0 0 0 1px rgba(124, 92, 255, 0.35),
    0 12px 26px rgba(124, 92, 255, 0.08) !important;
}

.el-table {
  --el-table-border-color: rgba(226, 232, 240, 0.9);
  --el-table-header-bg-color: rgba(248, 250, 252, 0.9);
  --el-table-tr-bg-color: rgba(255, 255, 255, 0.64);
  --el-table-row-hover-bg-color: rgba(124, 92, 255, 0.05);
  border-radius: 28px !important;
  overflow: hidden;
}

.el-table::before,
.el-table__inner-wrapper::before {
  display: none !important;
}

.el-table th.el-table__cell {
  padding-block: 16px !important;
  color: #4f5d75;
  font-weight: 700;
}

.el-table td.el-table__cell {
  padding-block: 15px !important;
}

.el-table__header-wrapper,
.el-table__body-wrapper,
.el-table__fixed,
.el-table__fixed-right {
  border-radius: 28px !important;
}

.el-pagination {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding-top: 8px;
}

.el-pagination .btn-prev,
.el-pagination .btn-next,
.el-pagination .el-pager li,
.el-pagination .el-pagination__sizes .el-select__wrapper,
.el-pagination .el-input__wrapper {
  border-radius: 999px !important;
}

.el-pagination .btn-prev,
.el-pagination .btn-next,
.el-pagination .el-pager li {
  min-width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow:
    inset 0 0 0 1px rgba(226, 232, 240, 0.95),
    0 10px 20px rgba(148, 163, 184, 0.08);
}

.el-pagination .el-pager li.is-active {
  background: linear-gradient(135deg, #7c5cff, #8b5cf6 60%, #a855f7);
  color: #fff;
  box-shadow: 0 12px 24px rgba(124, 92, 255, 0.2);
}

.search-header,
.filters,
.toolbar {
  padding: 14px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(255, 255, 255, 0.76);
  box-shadow:
    0 14px 30px rgba(148, 163, 184, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.page-intro,
.hero-strip,
.practice-intro,
.quiz-header,
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  min-height: 82px;
  margin-bottom: 16px !important;
  padding: 2px 0 10px !important;
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  border-radius: 0 !important;
}

.intro-copy h1,
.intro-copy h2,
.hero-copy h1,
.hero-copy h2,
.practice-copy h1,
.practice-copy h2,
.quiz-header-copy h1,
.quiz-header-copy h2,
.page-header h1,
.page-header h2,
.page-title {
  margin: 0 0 8px !important;
  color: #16233b !important;
  font-size: 24px !important;
  line-height: 1.15 !important;
  letter-spacing: -0.03em;
  font-weight: 800 !important;
}

.intro-copy p,
.hero-copy p,
.practice-copy p,
.quiz-header-copy p,
.page-subtitle {
  margin: 0 !important;
  max-width: 720px;
  color: #627089 !important;
  font-size: 13px !important;
  line-height: 1.65 !important;
}

.intro-action,
.practice-intro-actions .el-button,
.quiz-progress .el-button,
.hero-strip .el-button,
.page-header .el-button {
  align-self: center;
}

@media screen and (max-width: 768px) {
  .page-intro,
  .hero-strip,
  .practice-intro,
  .quiz-header,
  .page-header {
    min-height: auto;
    gap: 12px;
    margin-bottom: 14px !important;
    padding-bottom: 8px !important;
  }

  .intro-copy h1,
  .intro-copy h2,
  .hero-copy h1,
  .hero-copy h2,
  .practice-copy h1,
  .practice-copy h2,
  .quiz-header-copy h1,
  .quiz-header-copy h2,
  .page-header h1,
  .page-header h2,
  .page-title {
    font-size: 20px !important;
  }

  .intro-copy p,
  .hero-copy p,
  .practice-copy p,
  .quiz-header-copy p,
  .page-subtitle {
    font-size: 12px !important;
  }
}

@media screen and (max-width: 768px) {
  html {
    font-size: 14px;
  }

  .el-main {
    padding: 10px !important;
  }

  .el-card__body {
    padding: 12px !important;
  }

  .el-table {
    width: 100%;
    overflow-x: auto;
  }

  .el-pagination {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 5px;
  }

  .el-pagination .el-pagination__total,
  .el-pagination .el-pagination__sizes {
    display: none !important;
  }

  .el-button-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .el-button-group .el-button {
    margin-left: 0 !important;
  }

  .el-form--inline .el-form-item {
    display: flex;
    flex-direction: column;
    margin-right: 0;
    width: 100%;
  }

  .el-form--inline .el-form-item__content {
    width: 100%;
    margin-left: 0 !important;
  }

  .el-input,
  .el-select,
  .el-date-editor {
    width: 100% !important;
  }

  .el-descriptions--horizontal .el-descriptions__body .el-descriptions__table {
    display: flex;
    flex-direction: column;
  }

  .el-descriptions--horizontal .el-descriptions__body .el-descriptions__table tbody,
  .el-descriptions--horizontal .el-descriptions__body .el-descriptions__table tr {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .el-descriptions--horizontal .el-descriptions__body .el-descriptions__table td {
    width: 100% !important;
    padding: 8px 0;
  }

  .el-dialog {
    width: 95vw !important;
    margin: 10px auto !important;
  }

  .el-upload {
    width: 100%;
  }

  .el-upload-dragger {
    width: 100% !important;
  }
}

@media screen and (max-width: 480px) {
  html {
    font-size: 13px;
  }

  .el-card__header {
    padding: 12px !important;
  }

  .el-card__body {
    padding: 10px !important;
  }

  .el-tag {
    font-size: 12px;
    padding: 0 8px;
    height: 24px;
    line-height: 22px;
  }

  .el-button {
    padding: 8px 12px;
    font-size: 13px;
  }

  .el-button--small {
    padding: 6px 10px;
    font-size: 12px;
  }
}
</style>
