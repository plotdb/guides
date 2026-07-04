# Framework Index

| Scope | 功能 | 文件 |
|-------|------|------|
| `@plotdb` | 核心基礎設施：block 模組系統、表單驗證、OT 資料同步、config UI 生成、build server（srcbuild）、前端依賴安裝（fedep） | [@plotdb/index.md](@plotdb/index.md) |
| `@makeform` | 表單 widget blocks：radio、checkbox、choice、共用 term 編輯器 | [@makeform/index.md](@makeform/index.md) |
| `@grantdash` | 應用層：composer（表單設計器，作為 makeform blocks 的 host） | [@grantdash/index.md](@grantdash/index.md) |
| `@loadingio` | 前端工具：DOM 操作（ldquery）、防抖（debounce.js） | [@loadingio/index.md](@loadingio/index.md) |
| `ldview` | Headless HTML 模板引擎，用 `ld` 屬性綁定 JS handler，支援循環、巢狀、遞歸視圖 | [ldview/index.md](ldview/index.md) |
| `proxise` | Promise Proxy：在函數外部 resolve/reject，`proxise.once` 保證只執行一次的初始化 | [proxise/index.md](proxise/index.md) |
| `servebase` | 基於 Express.js 伺服器框架：啟動/停止/重啟、路由模組、viewlocals、多 server 環境、Node.js 版本 | [servebase/index.md](servebase/index.md) |
| `fedep` | 前端依賴安裝工具；`publish -g` 可自動更新 release branch 並建立 GitHub release（release notes 從 CHANGELOG.md 讀取） | [fedep/index.md](fedep/index.md) |
