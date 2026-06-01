# @plotdb/block

前端模組化系統基礎。每個 block 是可動態載入的 UI 模組，由 `pkg`（宣告）與 `init`（邏輯）組成。


## BID（Block Identifier）

格式：`name@version/path`，簡寫 `name:path`（省略 version）。
例：`@plotdb/form:valdef/choice`、`@grantdash/composer:block/metainfo`。

BID 也可作為純識別字串（type tag）使用，不一定對應實際存在的 block 檔案。


## Block 結構

    module.exports =
      pkg:
        name: \@my/block              # 本 block 名稱
        extend: name: \@other/block   # 繼承另一個 block
        host: name: \@grantdash/composer  # 宿主環境
        dependencies: [
        * name: \ldview
        * name: \@plotdb/form
        * name: \@plotdb/konfig, path: "konfig.widget.bootstrap.min.js"
        ]
      init: ({root, ctx, t, i18n, pubsub, data, parent, manager}) ->
        # root    — 掛載的 DOM 元素
        # ctx     — 依賴注入物件，key 為 pkg 末段（@plotdb/form → ctx.form）
        # t       — i18n 翻譯函式
        # i18n    — i18n 實例（可監聽 languageChanged）
        # pubsub  — block 內部事件匯流排
        # manager — block manager（可載入其他 block）
        # parent  — 父 block 的 interface（若有繼承）


## Block Manager

    # 動態載入一個 block
    manager.get({name, version, path})
      .then (block) -> block.create {data: meta}
      .then (b) -> b.attach {root}; b.interface!

 - `manager.chain(other-mgr)` — fallback 到另一個 manager
 - block 的 `interface()` 方法回傳對外公開的 API 物件


## Host Interface（hitf）

Host（如 composer）在 attach block 時，會將自己的 interface 設定在 block instance 的 `@hitf` 上。

    # 在 block init 中使用（lazy 取得，因 attach 在 init 之後）
    hitf = ~> @hitf
    hitf!totext(label)   # 將 richtext/i18n 物件轉為純文字字串
    hitf!wrap(obj)       # 包裝成 richtext 格式
    hitf!edit(...)       # 開啟 richtext 編輯器
    hitf!render(...)     # ldview handler，將 richtext 渲染到 DOM


## Plug（插槽機制）

父 block DOM 用 `<plug name="xxx">` 宣告插槽；子 block 用 `[plug=xxx]` 屬性填入對應插槽。

父 block（例如 `prj.tdb/index.pug`）：

    .application: .inner
      .main
        plug(name="form")
      .side
        plug(name="toc")

子 block（`index.pug`）：

    div(plug="form")
      .my-form ...

    div(plug="toc")
      .my-toc ...

未被填入的 `<plug>` 會保留其內部的 fallback DOM（若有）。


## `extend.dom` 選項

在 `pkg.extend` 中可指定 `dom` 欄位，控制子 DOM 與父 DOM 的合併方式。

 - `true`（預設）— 子 DOM 的 `[plug=xxx]` 填入父 DOM 的對應插槽，其餘沿用父版面
 - `false` — 忽略子 DOM，完全使用父 DOM
 - `\overwrite` — 子 DOM 直接取代父 DOM，bypass 插槽邏輯，往上繼續傳遞

預設 plug 模式：

    extend: name: \@grantdash/prj.tdb

overwrite 模式：

    extend: {name: \@grantdash/prj.tdb, dom: \overwrite}

使用 `dom: \overwrite` 時：

 - 子的整個 DOM tree 直接當作最終輸出，父 DOM 完全不使用
 - 父的 JavaScript（`init`）仍然執行；父 JS 所依賴的 `ld=` binding 若需運作，仍需在子 DOM 中自行提供
 - 子 DOM 不再需要 `[plug=xxx]` 屬性（插槽機制已被繞過）
 - CSS：繼承父 CSS，但跳過父 block 自身的第一個 scope


## `extend.style` 選項

在 `pkg.extend` 中可指定 `style` 欄位，控制 CSS scope 繼承方式。

 - `true`（預設）— 繼承所有父 CSS scope
 - `false` — 不繼承父 CSS
 - `\overwrite` — 跳過父 block 自身 CSS，只繼承更上層


## 注意事項

 - `extend` 讓子 block 在 `init` 裡透過 `parent` 取得父 block 的 interface，可覆寫或擴充行為
 - `dependencies` 中的 block 在 `ctx` 取用時，key 為 package name 的最後一段（去掉 scope）
 - `host` 宣告讓 block 系統知道要在哪個宿主環境執行
