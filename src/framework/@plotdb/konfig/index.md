# @plotdb/konfig

依 config schema（meta object）自動生成對應 UI 的工具。

原始碼：`plotdb/projects/konfig/src/index.ls`


## Meta Schema 格式

    meta =
      val:  {type: \text,    name: "選項值"}
      mode: {type: \choice,  name: "模式", values: [{name: "A", value: "a"}, ...]}
      show: {type: \boolean, name: "顯示"}
      num:  {type: \number,  name: "數量"}

 - Leaf node：有 `type` 的欄位，對應一個 UI widget
 - Branch node：沒有 `type` 的物件，作為容器（分 tab 用）
 - `values`：choice 型態的選項，格式為 `[{value, name}]`


## 核心 API

    kfg = new konfig {root, meta, view: \simple, manager, typemap}
    kfg.on \change, (v) -> # v 是完整 config object（每次值變動時觸發）
    kfg.init!              # 非同步初始化（載入 bundle、建立 ctrl widgets）
    kfg.meta {meta, config: saved-config}  # 更新 schema 並同時設定初始值
    kfg.set {val: "foo"}   # 設定值（等待 ensure-built 後才執行）
    kfg.get!               # 取得目前值（同步）


## 初始化模式

正確初始化並帶入既有值的方式：

    # 建立時不傳 meta（或傳空 meta）
    kfg = new konfig {root: node, view: \simple, manager, typemap}
    kfg.on \change, (v) ~> node._ctx.config = v  # 值變動時更新 ctx

    saved-config = ctx.config or {}  # 在 init 前捕捉，避免 @update! 洗掉
    kfg.init!
      .then ~> kfg.meta {meta, config: saved-config}
      # meta() 在 build 過程中就設定 config，@update! 觸發時 _val 已正確

為什麼不在 init 後直接 set？
`build()` 末尾呼叫 `@update!`，會觸發 change 事件（帶空的 `_val = {}`），若此時 config 存在 ctx 上，會被洗掉。改用 `meta({meta, config})` 讓 config 在 build 過程中就設好，避免此問題。


## View 模式

 - `\simple`：Flat list，所有欄位排成一列；需要 `[ld-each="ctrl"]` 元素在 root 內
 - `\default`：分 tab
 - `\recurse`：巢狀 tab

Simple view 的 `ctrl` 容器需手動建立（konfig 不會自動建）：

    ctrl-el = document.createElement \div
    ctrl-el.setAttribute \ld-each, \ctrl
    node.appendChild ctrl-el  # 先加進 DOM，再建立 konfig
    kfg = new konfig {root: node, view: \simple, ...}


## Typemap

讓 konfig 知道如何把 field type name 對應到 block BID：

    typemap = (name) ->
      name: \@plotdb/konfig, version: \main, path: "bootstrap/#name"
      # 例：type "number" → @plotdb/konfig@main/bootstrap/number

沒有 typemap 時，konfig 嘗試用預設方式解析，通常找不到 widget。


## Bundle

`konfig.widget.bootstrap.min.js` 是一個預打包的 bundle，包含所有內建 widget（text、number、choice、boolean 等）。必須在 dependencies 中宣告才能載入：

    dependencies: [
    * name: \@plotdb/konfig
    * name: \@plotdb/konfig, path: "konfig.widget.bootstrap.min.js"
    ]


## Manager

若在 block 系統中使用，需傳入 manager 讓 konfig 能解析 widget block：

    kfg = new konfig {root, meta, view: \simple, manager, typemap}

konfig 會把 manager chain 到自己內部的 manager，先從外部 manager 找，找不到再用自己的（bundle）。
