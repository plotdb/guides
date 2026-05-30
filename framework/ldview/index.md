# ldview

Headless、logic-less 的 HTML 模板引擎，透過 `ld` 屬性做 JS Selector 綁定。

## 安裝與引用

```bash
npm install ldview
```

```html
<script src="path-to-ldview/index.min.js"></script>
```

## 核心概念

用 `ld` 屬性命名元素，在 JS 中用 handler 對應處理邏輯：

```pug
div(ld="plan free")
div(ld="plan month")
```

```javascript
const view = new ldview({
  root: document.body,
  handler: {
    plan: ({node, names, name, idx, ctx}) => {
      node.style.display = names.includes(currentPlan) ? 'block' : 'none'
    }
  }
})
```

多個 config 物件可合併傳入：`new ldview({root: ...}, {handler: ...})`

## Handler 類型

```javascript
new ldview({
  root: someNode,
  init:    { selector: ({node}) => {} },   // 只執行一次
  handler: { selector: ({node}) => {} },   // 每次 render 執行
  text:    { selector: ({node}) => 'text content' },
  style:   { selector: ({node}) => ({color: 'red'}) },
  attr:    { selector: ({node}) => ({href: '...'}) },
  action: {
    click:     { selector: ({node, evt}) => {} },
    mousedown: { selector: ({node, evt}) => {} }
  }
})
```

## Handler 參數

| 參數 | 說明 |
|------|------|
| `node` | 當前 DOM 節點 |
| `names` | 節點上所有 ld 名稱（空格分隔陣列） |
| `name` | 本次匹配的 handler 名稱 |
| `idx` | 節點索引 |
| `local` | 節點生命週期內的本地資料存儲 |
| `ctx` | view 層級的上下文資料 |
| `data` | ld-each 節點綁定的資料項 |
| `evt` | 事件物件（action handler） |
| `ctxs` | 父層 view 的上下文列表 |
| `views` | view 鏈，`views[0]` 為當前 view |

## 循環渲染（ld-each）

```pug
.shelf: div(ld-each="book")
  .name(ld="name")
  .author(ld="author")
```

```javascript
new ldview({
  handler: {
    book: {
      list: () => myBookList,
      key: (it) => it.id,        // 穩定 key，選用
      view: {
        text: {
          name: ({ctx}) => ctx.name,
          author: ({ctx}) => ctx.author
        }
      }
    }
  }
})
```

ld-each 的 `view` 欄位支援所有一般 view 設定（init、handler、text、action…）。

## 部分渲染

```javascript
view.render(['name'])                              // 只更新特定 ld 名稱
view.render({name: 'book', key: [key1, key2]})    // 只更新特定 key 的 ld-each 項
```

## 作用域隔離（ld-scope）

防止父 view 選取到子 view 內的元素：

```pug
div(ld="name")
div(ld-scope, ld="userInfo"): div(ld="name")   // 內部 name 不被外層選到
```

也可使用 ldview 的 pug mixin：

```pug
include /path-to-ldview/index.pug
+scope("userInfo")
  div(ld="name")
```

## 前綴（prefix）與混合視圖

需要混合多個 view 而不用 ld-scope 隔離時，用 `naked-scope` + `prefix()` 函數：

```pug
+scope("userInfo").naked-scope
  div(ld=prefix("name"))   // 輸出 ld="userInfo$name"
```

```javascript
new ldview({ prefix: 'userInfo', handler: { name: ... } })
```

## 遞歸視圖

```javascript
const cfg = {}
cfg.handler = {
  child: {
    list: ({ctx}) => ctx.children,
    view: cfg   // 自我引用
  }
}
// ctx 不要放在 cfg 裡，否則遞歸時會無限展開
const rootCfg = Object.assign({root: rootEl, ctx: myData}, cfg)
new ldview(rootCfg)
```

遞歸 DOM 需用 `template` 選項提供範本：

```javascript
new ldview({
  template: document.querySelector('.template'),
  ...cfg
})
```

## 主要 API

| API | 說明 |
|-----|------|
| `new ldview(cfg, ...)` | 建立 view，可傳多個 config 合併 |
| `view.render(names?)` | 渲染，省略 names 則全部更新 |
| `view.init()` | 手動初始化，返回 Promise |
| `view.get(name)` | 取得第一個匹配節點 |
| `view.getAll(name)` | 取得所有匹配節點 |
| `view.ctx(value?)` | 取得或設置 context |
| `view.on(event, cb)` | 監聽 view 事件 |
| `view.fire(event, ...args)` | 觸發 view 事件 |
| `view.bindEachNode({container, name, node, idx})` | 手動加入 ld-each 節點（不更新資料） |
| `view.unbindEachNode({container, name, node?, idx?})` | 手動移除 ld-each 節點 |
| `ldview.merge(a, b, ...)` | 合併 config 物件（靜態方法） |

## 設定選項速查

| 欄位 | 說明 |
|------|------|
| `root` | View 根節點 |
| `handler/init/text/style/attr/action` | 各類型 handler |
| `ctx` | 初始上下文資料 |
| `prefix` | 配合 naked-scope 使用的前綴名稱 |
| `global` | `true` 時改用 `pd`/`pd-each`（跨 ld-scope 存取） |
| `initRender` | 建立後自動 render，預設 `true` |
| `template` | 遞歸/嵌套 view 用的範本 DOM |
