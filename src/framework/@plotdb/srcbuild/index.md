# @plotdb/srcbuild

前端 build server。監聽 `web/src/` 下的源碼，自動編譯輸出到 `web/static/`，同時提供靜態檔案服務。


## 使用方式

### CLI 模式（純前端，無自訂 API）

    npx server -r web -o .

`-r web` 以 `web/` 為根目錄，`-o .` 監聽 `.`（專案根目錄）的原始碼變動。


### Programmatic 整合模式（Express + 自訂 API）

當專案需要自訂 API（如 `/api/*`），用 `srcbuild.lsp()` 與 Express 合併成單一 server。

`server.ls`：

    require! <[express path @plotdb/srcbuild]>

    app = express!
    app.use express.json!
    app.use express.urlencoded {extended: true}

    (require \./api) {app}

    app.use \/, express.static \web/static

    port = process.env.PORT or 3000

    Promise.resolve!
      .then ->
        new Promise (res, rej) ->
          s = app.listen port, (e) ->
            if e => return rej e
            console.log "listening on port #{s.address!port}"
            res s
      .then ->
        srcbuild.lsp {base: \web}

`api/index.ls` 慣例：export 一個接收 `{app}` 的 function：

    module.exports = ({app}) ->
      app.get \/api/hello, (req, res) ->
        res.json {ok: true}

啟動：

    PORT=<預計port> lsc server.ls

注意事項：

 - `srcbuild.lsp({base})` 只負責 watch + compile，HTTP 由 Express 自己 serve
 - 靜態檔案從 `web/static/` serve；srcbuild 自動把 `web/src/pug/*.pug` 編譯到 `web/static/*.html`
 - API routes 必須在 `express.static` 之前掛載，否則會被靜態 middleware 攔截
 - `lsp()` 在 listen 之後呼叫，確保 port 正常後才開始 watch


## 目錄對應

 - `web/src/pug/*.pug` -> `web/static/*.html`：Pug → HTML
 - `web/src/ls/*.ls` -> `web/static/js/*.js`：LiveScript → JS

Pug 中的 inline 區塊由 filter 處理：

 - `:lsc` → LiveScript 編譯後 minify，嵌入 `<script type="module">` 或一般 script
 - `:stylus` → Stylus 編譯後 minify，嵌入 `<style>`


## lib.pug mixins（自動注入）

srcbuild 在每個 Pug 編譯時自動插入 `lib.pug`，提供以下 mixin：


### `+script(list)`

產生 `<script>` 標籤，路徑格式為：

    /assets/lib/<name>/<version|main>/<path|index.min.js>

    +script([
      {name: "ldview"},                                        // → /assets/lib/ldview/main/index.min.js
      {name: "bootstrap", path: "dist/js/bootstrap.min.js"},  // 自訂 path
      {name: "mylib", version: "1.2.3"}                       // 指定版本
    ])


### `+css(list)`

產生 `<link rel="stylesheet">` 標籤，路徑格式為：

    /assets/lib/<name>/<version|main>/<path|index.min.css>

    +css([
      {name: "bootstrap", path: "dist/css/bootstrap.min.css"},
      {name: "@loadingio/bootstrap.ext"}
    ])


## Pug 編譯細節

 - `@/` 前綴 → 從 `base`（專案根）resolve
 - `@static/` 前綴 → 從 `desdir`（static/）resolve
 - 檔案頂端有 `//- module` → 跳過（純 mixin 檔，不輸出 HTML）
 - 檔案頂端有 `//- view` → 只輸出 view JS，不輸出 HTML


## 重要設計

 - Pug inline `include:lsc index.ls` 中的 JS 是編譯時處理，不是執行時；適合放頁面初始化邏輯
 - `<script type="module">` 中的 `include:lsc` 支援 ES module 語法（`import` 等）
 - `+script` 產生的 script 標籤預設加 `defer`；需要 `async` 可在 object 中加 `async: true`
