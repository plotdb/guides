# @makeform/common

所有 makeform widget 共用的基礎 block。其他 widget（radio、checkbox、choice）都 `extend: name: \@makeform/common`。

原始碼：`makeform/blocks/common/src/`

## Term 編輯器（`src/term/`）

管理 widget 的驗證條件（term list）的對話框 block。

### 架構

- 是一個獨立的 block，由 `@makeform/common` 在 interface 中暴露
- 用 `ldcover` 作為對話框容器
- 透過 `ldcv.on 'data'` 接收 `{terms, widget}` 開啟；透過 `ldcv.set term: mod.terms` 關閉並傳出更新後的 terms

### 關鍵實作細節

**Term list 的 key**：term 物件本身沒有 id 欄位（`@plotdb/form` 定義），但 `form.term` constructor 現在會自動生成 `id`（若無則產生），且 `serialize()` 會輸出 id。ldview 的 `term` ld-each 用 `it.id` 作為 key。

**op-cfg-root handler**：動態建立 `@plotdb/konfig` instance，依當前 op 的 `get-config(valspec)` 生成 UI。

```ls
"op-cfg-root": ({node, ctx}) ~>
  node._ctx = ctx     # 每次 render 更新，供 change listener 用
  op = opset.get-op ctx.op
  valspec = get-valspec!   # mod.widget?.valspec!
  cfg-schema = op?get-config(valspec) or {}
  meta = {}
  for k, v of cfg-schema => meta[k] = {} <<< v <<< {name: v.name or k}
  # op 或 opset 改變時，重置 config（只在已有舊 kfg 時）
  op-changed = node._last-op != ctx.op or node._last-opset != ctx.opset
  if op-changed and node._kfg => ctx.config = {}
  if !node._kfg
    # 初次建立：init 後用 meta({meta, config}) 設定初始值
    saved-config = ctx.config or {}
    node._kfg = new konfig {root: node, view: \simple, manager, typemap}
    node._kfg.on \change, (v) ~> node._ctx.config = v
    node._kfg.init!.then ~> node._kfg.meta {meta, config: saved-config}
  else if op-changed
    node._kfg.meta {meta, config: (ctx.config or {})}
  else
    node._kfg.set (ctx.config or {})
```

**為何用 `meta({meta, config})` 而非 `init` 後 `set`**：  
`konfig.build()` 末尾呼叫 `@update!`，會用空值觸發 change event 洗掉 `ctx.config`。改用 `meta({meta, config})` 讓 config 在 build 過程中就設好，`@update!` 觸發時 `_val` 已正確。

**op-changed 判斷**：`node._last-op` / `node._last-opset` 存在 DOM node 上。第一次 render 時 `_last-op` 是 `undefined`，所以 `op-changed` 永遠為 true。解法：`if op-changed and node._kfg => ctx.config = {}` — 只在已有舊 kfg 時才清空 config，init 時保留原值。

**Delete handler**：用 `findIndex` 比對 id（非 reference），sharedb 重建物件後仍能正確刪除：
```ls
delete: ({ctx, views}) ->
  idx = mod.terms.findIndex -> it.id == ctx.id
  if ~idx => mod.terms.splice idx, 1
  views.1.render!
```

### Typemap

term 內的 konfig 用自訂 typemap 指向 `@makeform/common` 的 konfig widget：

```ls
typemap = (name) ->
  name: \@makeform/common, version: \main, path: "term/konfig/#name/index.html"
```
