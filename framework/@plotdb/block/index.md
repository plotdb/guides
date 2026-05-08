# @plotdb/block

前端模組化系統基礎。每個 block 是可動態載入的 UI 模組，由 `pkg`（宣告）與 `init`（邏輯）組成。

## BID（Block Identifier）

格式：`name@version/path`，簡寫 `name:path`（省略 version）。  
例：`@plotdb/form:valdef/choice`、`@grantdash/composer:block/metainfo`。

BID 也可作為純識別字串（type tag）使用，不一定對應實際存在的 block 檔案。

## Block 結構

```ls
module.exports =
  pkg:
    name: \@my/block              # 本 block 名稱
    extend: name: \@other/block   # 繼承另一個 block（可覆寫）
    host: name: \@grantdash/composer  # 宿主環境
    dependencies: [
    * name: \ldview
    * name: \@plotdb/form
    * name: \@plotdb/konfig, path: "konfig.widget.bootstrap.min.js"  # 指定子路徑
    ]
  init: ({root, ctx, t, i18n, pubsub, data, parent, manager}) ->
    # root    — 掛載的 DOM 元素
    # ctx     — 依賴注入物件，key 為 pkg 末段（@plotdb/form → ctx.form）
    # t       — i18n 翻譯函式
    # i18n    — i18n 實例（可監聽 languageChanged）
    # pubsub  — block 內部事件匯流排
    # manager — block manager（可載入其他 block）
    # parent  — 父 block 的 interface（若有繼承）
```

## Block Manager

```ls
# 動態載入一個 block
manager.get({name, version, path})
  .then (block) -> block.create {data: meta}
  .then (b) -> b.attach {root}; b.interface!
```

- `manager.chain(other-mgr)` — fallback 到另一個 manager
- Block 的 `interface()` 方法回傳對外公開的 API 物件

## Host Interface（hitf）

Host（如 composer）在 attach block 時，會將自己的 interface 設定在 block instance 的 `@hitf` 上。

```ls
# 在 block init 中使用（lazy 取得，因 attach 在 init 之後）
hitf = ~> @hitf
hitf!totext(label)   # 將 richtext/i18n 物件轉為純文字字串
hitf!wrap(obj)       # 包裝成 richtext 格式
hitf!edit(...)       # 開啟 richtext 編輯器
hitf!render(...)     # ldview handler，將 richtext 渲染到 DOM
```

## 注意事項

- `extend` 讓子 block 在 `init` 裡透過 `parent` 取得父 block 的 interface，可覆寫或擴充行為
- `dependencies` 中的 block 在 `ctx` 取用時，key 為 package name 的最後一段（去掉 scope）
- `host` 宣告讓 block 系統知道要在哪個宿主環境執行
