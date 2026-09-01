# @plotdb/srcbuild

前端 build server。監聽 `web/src/` 下的源碼，自動編譯輸出到 `web/static/`，同時提供靜態檔案服務。


## 使用方式

### CLI 模式 ( 純前端，無自訂 API )

    npx server -r web -o .

`-r web` 以 `web/` 為根目錄，`-o .` 監聽 `.` ( 專案根目錄 ) 的原始碼變動。


### Programmatic 整合模式 ( Express + 自訂 API )

當專案需要自訂 API ( 如 `/api/*` )，用 `srcbuild.lsp()` 與 Express 合併成單一 server。

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
 - 若 server 啟動後 `web/static/` 沒有產出，可 `touch web/src/pug/index.pug` 手動觸發一次 build


## 目錄對應

 - `web/src/pug/*.pug` -> `web/static/*.html`：Pug → HTML
 - `web/src/ls/*.ls` -> `web/static/js/*.js`：LiveScript → JS

Pug 中的 inline 區塊由 filter 處理：

 - `:lsc` → LiveScript 編譯後 minify，嵌入 `<script type="module">` 或一般 script
 - `:stylus` → Stylus 編譯後 minify，嵌入 `<style>`


## lib.pug mixins ( 自動注入 )

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


### 直接指定 URL

除了 `{name}` 形式，也可以給 `{url}`，用來引用本專案自己編出來的檔案：

    +script([{url: "/js/site.min.js"}])
    +css([{url: "/css/reset.min.css"}])

這類 URL 會經過 content addressing（見下），`{name}` 形式的 vendor 檔則不會——
它們不是 srcbuild 編出來的，路徑上本來就帶版本。


## Content Addressing（0.1.0+）

生成的檔案名字不變而內容會變，所以它的 URL 不能被長期快取。開啟後 srcbuild 會依內容
算 hash，給同一個檔第二個名字，那個名字才能設 `immutable`：

    srcbuild.lsp {hash: {enabled: true, mode: 'query'}}

    filename 模式  /js/site.4b6ac41e1bea.min.js     多產一個檔，可 immutable，要清舊代
    query 模式     /js/site.min.js?v=4b6ac41e1bea   不多產檔，不會 404

**預設關閉**，而且在伺服器（nginx）設對之前開了沒有意義。不帶 hash 的原始檔名兩種模式
下都一定會寫、而且永遠是最新的。

涵蓋 `lsc` / `stylus` / `bundle` 的產出，經由 `+script` / `+css` mixin 與 `:bundle`
filter 生效。對照表存在 `<base>/.bundle-dep/manifest.json`，它同時記錄「哪個 pug 檔
嵌了哪個 URL」——因為生成的資產不在任何頁面的 pug 相依圖裡，hash 變動時只有這張表能
找回該重新 render 的頁面。

細節（兩種模式的取捨、manifest 結構、保留策略）見 srcbuild 的 `README.md`。


## Pug 編譯細節

 - `@/` 前綴 → 從 `base` ( 專案根 ) resolve
 - `@static/` 前綴 → 從 `desdir` ( static/ ) resolve
 - 檔案頂端有 `//- module` → 跳過 ( 純 mixin 檔，不輸出 HTML )
 - 檔案頂端有 `//- view` → 只輸出 view JS，不輸出 HTML


## 重要設計

 - Pug inline `include:lsc index.ls` 中的 JS 是編譯時處理，不是執行時；適合放頁面初始化邏輯
 - `<script type="module">` 中的 `include:lsc` 支援 ES module 語法 ( `import` 等 )
 - `+script` 產生的 script 標籤預設加 `defer`；需要 `async` 可在 object 中加 `async: true`
 - **`lib.pug` 是用路徑注入、從專案根（`base`）解析的**。所以 `<base>/node_modules`
   底下的那份 srcbuild 永遠贏過根目錄的，跟正在跑的是哪個版本無關。舊版留在那裡會讓
   `lib.pug` 的新功能靜默失效——頁面照樣編譯、沒有任何錯誤。0.1.2 起啟動時會 warn
   並印出兩邊路徑。升版時記得所有裝了 srcbuild 的地方一起升。
