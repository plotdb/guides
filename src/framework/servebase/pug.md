# servebase Pug 開發

servebase 專案的 `frontend/<name>/src/pug/` 目錄由 `@plotdb/srcbuild` 監聽並編譯。


## 語言選擇

不同專案可能混用 pug + livescript 或 pug + 純 JS。若選擇不使用 livescript：

 - inline script 用 `script(type="module").` 加 JS 內容
 - 不使用 `:lsc` filter，不使用 `include:lsc`


## `base.pug` 標準 include 順序

`base.pug` 開頭需依序 include 以下三個；順序影響 mixin 可用範圍，缺一會造成 render 錯誤：

    include @/@loadingio/bootstrap.ext/index.pug
    include @/ldview/index.pug
    include /modules/common.pug

`common.pug` 的內容：

    //- module
    include @/@loadingio/bootstrap.ext/index.pug
    include @/@servebase/pugutil/index.pug


## mixin 來源

 - `+css(arr)` / `+script(arr)`：`@plotdb/srcbuild/dist/lib.pug`。由 srcbuild 的 `postParse` hook 自動插入，僅作用於 `doctype html` 開頭的模板，不需手動 include。
 - `+scope(name)`：`ldview/index.pug`。必須在 `base.pug` 中明確 `include @/ldview/index.pug`。
 - `+i()` / `+meta()` / `+register-locals()`：`@servebase/pugutil/index.pug`。


## `+scope` 漏 include 的錯誤

忘記 `include @/ldview/index.pug` 時，render 會丟出：

    Cannot read properties of undefined (reading 'call')

原因是 pug 編譯輸出中的 `pug_mixins["scope"].call(...)` 找不到定義。加回 include 即可解決。


## `@/` 路徑解析

srcbuild pug plugin 把 `@/foo` 解析為 `require.resolve("foo", { paths: [base] })`，其中 `base` 為 `frontend/<name>` 目錄。Node.js module resolution 會向上追溯到 root `node_modules/`，因此 `frontend/<name>/` 下不需要獨立建立 `node_modules`。


## 前端依賴 (fedep)

`frontend/<name>/package.json` 設定 `frontendDependencies`，執行 fedep 時使用 root 的 `node_modules`：

    cd frontend/<name>
    ../../node_modules/.bin/fedep

套件安裝於 root，`frontend/<name>/` 不做獨立 `npm install`。詳見 [fedep guide](../fedep/index.md)。


## 套件 `dir` 欄位

`@servebase/*` 系列套件需指定 `dir: "dist"`，否則 fedep 會複製整個套件目錄 (包含 src)：

    { "name": "@servebase/auth", "dir": "dist" }
