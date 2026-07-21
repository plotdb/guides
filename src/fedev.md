# 前端測試環境設置指南


## 1. 環境啟動

使用 `@zbryikt/template` 模組啟動開發伺服器：

    npx server -r web -p 8080 -o true

參數說明：
 - `-r web`: 指定 web root 目錄
 - `-p 8080`: 指定伺服器 port（預設為 8080）
 - `-o true`: 啟動時自動開啟瀏覽器


## 2. 專案結構

前端程式碼位於 `web/src/pug`，使用以下技術堆疊：
 - Pug: HTML 模板引擎
 - Stylus: CSS 預處理器
 - LiveScript: JavaScript 預處理器


### 2.1 內嵌語法

重要：`:stylus` 和 `:lsc` 等 filter 只負責直譯（transpile），仍需包在對應的 HTML tag 內。

正確寫法：

    style(type="text/css"): :stylus
      .my-class
        color: red
        padding: 10px

    script(type="module"): :lsc
      console.log "Hello World"
      document.addEventListener 'DOMContentLoaded', ->
        console.log 'Page loaded'

錯誤寫法（缺少 style/script tag）：

    // 錯誤：這樣不會產生正確的 HTML
    :stylus
      .my-class
        color: red

    :lsc
      console.log "Hello World"


## 3. 依賴模組

專案使用的核心模組（均可透過 npm 安裝）：

 - `bootstrap@4.6.1`
 - `@loadingio/bootstrap.ext`
 - `@loadingio/debounce.js`
 - `proxise`
 - `@loadingio/ldquery`
 - `ldview`
 - `ldiconfont`
 - `@plotdb/semver`
 - `@plotdb/block`
 - `@plotdb/rescope`
 - `@plotdb/csscope`
 - `fedep`


### 3.1 安裝模組規範

安裝新模組時，除非有特定版本需求（如 `bootstrap`），否則應使用 `npm install --save <package>@latest` 或直接 `npm install --save <package>` 來獲取最新版本，避免手動指定版本號。


## 4. 前端資源管理 (fedep)


### 4.1 初始化配置

    npx fedep init

此命令會更新 `package.json`，記載需要複製到 `web/static/assets/` 的模組 dist 檔案。


### 4.2 複製資源檔案

    npx fedep

執行後，前端可透過以下路徑存取檔案：

    /assets/lib/<modname>/main/<file>


## 5. Pug 內建輔助函式

`@zbryikt/template` 的 Pug builder 提供便利的資源引入函式：


### 5.1 引入 CSS

    +css([
      {name: 'bootstrap', version: '4.6.1', path: 'index.min.css'},
      {name: 'custom-lib'},
      {url: 'https://cdn.example.com/style.css'}
    ])


### 5.2 引入 JavaScript

    +script([
      {name: 'jquery', version: '3.6.0', path: 'index.min.js'},
      {name: 'my-script'},
      {url: 'https://cdn.example.com/script.js'}
    ])


### 5.3 參數說明

陣列中每個物件支援兩種格式：


#### 格式 1：本地模組引用

 - `name`：模組名稱。預設值：(必填)
 - `version`：版本號。預設值：`"main"`
 - `path`：檔案路徑。預設值：`index.min.css` 或 `index.min.js`

自動生成網址：`/assets/lib/{name}/{version}/{path}`


#### 格式 2：外部 URL 引用

 - `url`：完整的外部資源網址

直接使用提供的 URL。
