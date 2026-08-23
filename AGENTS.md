# AGENTS.md

个人记账 PWA（零依赖、单文件应用，无构建）。UI 与注释全部使用简体中文。

## 架构（不读代码会猜错的部分）

- 所有应用代码都在 `index.html`：`<head>` 内 `<style>` 是全部 CSS，文末 `<script>` 是全部 JS。事件绑定用 inline `onclick="fn()"` 全局函数，无模块、无 import。新增功能写进同一文件，遵循同一模式。
- 无 package.json、无构建、无测试、无 CI、无 lint。`sw.js` = 离线缓存 Service Worker；`manifest.json` = PWA 配置。
- 数据只存浏览器 `localStorage`：键 `my_account_data`（记录数组）与 `my_account_settings`（固定收入）。记录结构 `{ id, desc, amount, type: 'income'|'expense', date, createdAt }`。清除浏览器数据 = 永久丢失。

## 数据与输入规则

- `date` 必须是本地时区 `YYYY-MM-DD`（`getToday()`，index.html:614），不是 UTC——统计按 date 字符串分组，用 `toISOString()` 会错位；`createdAt` 才用 ISO。
- 所有动态拼接的 HTML 必须经 `escapeHtml()`（index.html:648）转义——v1.3 曾因此修过 XSS，不要再引入。
- 输入解析必须兼容 `parseSmartInput()`（index.html:624）：备注+金额一句输入（`买水果15`）与逗号金额（`1,234.56`）。
- 不要用原生 `confirm()`/`prompt()`（iOS 兼容问题，v1.3 修复）——用内置 `showConfirm()` / `showFixedIncomePrompt()` 模态框。
- 隐藏的 `#hiddenDateInput` 是日期范围筛选的双步选择器（`showPicker()` 降级 `click()`），不是记账日期输入。

## 发版陷阱（最容易漏）

- 版本号要同步 3 处：`index.html` 的 about-version 文本（约 :547）、onload 的 `console.log`（约 :1415）、`README.md` 版本历史。
- 改动 `index.html` 或静态资源后，必须 bump `sw.js` 的 `CACHE_NAME`（当前 `account-book-v6`，sw.js:1）。导航请求缓存优先秒开，后台静默刷新缓存供下次启动；发版新鲜度靠 CACHE_NAME bump 触发的全量重装保证。白名单静态资源仍 cache-first，旧缓存只在 SW 更新（activate）时清理。

## 本地预览 / 验证 / 部署

- 无自动化测试，改动用浏览器手动验证或 Playwright MCP 做浏览器 QA（历史 QA 记录在 `.playwright-mcp/`）。
- 本地起服务：`npx serve .` 或 `python -m http.server 8080`。Service Worker 需要 http(s) 环境，`file://` 下不注册。
- 部署：推 GitHub → Vercel 自动部署（`https://my-account-book-opal.vercel.app`）。验证线上效果用无痕窗口或 bump CACHE_NAME。

## 其他

- 编码风格遵循用户级配置 `C:\Users\Mayn\.config\opencode\AGENTS.md`（中文回复、2 空格缩进、camelCase、动词开头函数名、过程文件放 `C:\ProgramData\opencode-temp`、外网失败时用本机代理 `127.0.0.1:7688`）。
- `.omo/`（工作流产物）与 `.playwright-mcp/`（QA 记录）已 gitignore，不要提交。
