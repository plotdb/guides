# @plotdb/srcbuild

前端 build server。監聽 `web/src/` 下的源碼，自動編譯輸出到 `web/static/`，同時提供靜態檔案服務。


## 啟動指令

    npx server -r web -o .

`-r web` 以 `web/` 為根目錄，`-o .` 監聽 `.`（專案根目錄）的原始碼變動。


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

 - Pug inline `include:lsc index.ls` 中的 JS 是 編譯時 處理，不是執行時；適合放頁面初始化邏輯
 - `<script type="module">` 中的 `include:lsc` 支援 ES module 語法（`import` 等）
 - `+script` 產生的 script 標籤預設加 `defer`；需要 `async` 可在 object 中加 `async: true`
