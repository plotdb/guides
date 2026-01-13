# ldview

## 簡介

ldview 是一個 headless、logic-less 的 HTML 模板引擎，透過 JavaScript 函數綁定來操控 DOM 元素。

## 核心概念

### ld 屬性選擇器

類似於 CSS Selector，ldview 使用 `ld` 屬性來命名元素，並在 JavaScript 中為這些元素分配處理器：

```pug
div(ld="plan free")
div(ld="plan month")
```

```javascript
view = new ldview({
  root: document.body,
  handler: {
    plan: ({node, names, name, idx, ctx}) -> {
      node.style.display = (currentPlan === name) ? 'block' : 'none'
    }
  }
})
```

## 主要功能

### 1. 處理器類型

- **handler**: 通用處理函數
- **init**: 初始化處理器（只執行一次）
- **action**: 事件處理器（click、mousedown 等）
- **text**: 文字內容處理
- **style**: 樣式處理
- **attr**: 屬性處理

### 2. 循環渲染 (ld-each)

支持列表數據的動態渲染：

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
      key: (it) => it.id,  // 穩定更新用的 key getter
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

### 3. 嵌套視圖

支持在選擇器內嵌套子視圖，提供更好的模組化：

```javascript
viewcfg = {text: {name: ({ctx}) => ctx.name}}
new ldview({
  handler: {
    userInfo: viewcfg,
    classInfo: viewcfg
  }
})
```

### 4. 作用域隔離 (ld-scope)

使用 `ld-scope` 屬性隔離不同視圖的選擇器：

```pug
div(ld="name")
div(ld-scope, ld="userInfo"): div(ld="name")
div(ld-scope, ld="classInfo"): div(ld="name")
```

### 5. 遞歸視圖

支持透過 template 選項創建遞歸結構：

```javascript
cfg = {}
cfg.handler = {
  child: {
    list: ({ctx}) => ctx.children,
    view: cfg  // 自我引用
  }
}
```

### 6. 部分渲染

只更新特定元素而非全部：

```javascript
view.render(['name'])  // 只更新 ld="name" 的元素
view.render({name: 'book', key: [key1, key2]})  // 只更新特定 key 的 ld-each 項目
```

## 主要 API

### 建構與初始化

- `new ldview(config)`: 創建新視圖
- `view.init()`: 手動初始化（返回 Promise）
- `view.render(names)`: 渲染視圖

### 元素訪問

- `view.get(name)`: 取得第一個匹配的元素
- `view.getAll(name)`: 取得所有匹配的元素

### 上下文管理

- `view.ctx(value)`: 設置或取得上下文數據
- `view.ctxs(value)`: 設置或取得父級上下文列表

### 事件系統

- `view.on(eventName, callback)`: 監聽視圖事件
- `view.fire(eventName, ...args)`: 觸發視圖事件

### ld-each 節點操作

- `view.bindEachNode({container, name, node, idx})`: 綁定循環節點
- `view.unbindEachNode({container, name, node, idx})`: 解綁循環節點

## 處理器參數

處理器函數接收以下參數：

- `node`: 當前 DOM 節點
- `names`: 當前節點的所有 ld 名稱（空格分隔）
- `name`: 匹配的處理器名稱
- `idx`: 節點索引
- `local`: 本地數據存儲（節點生命週期內）
- `ctx`: 視圖級別的上下文數據
- `ctxs`: 父級視圖的上下文列表
- `data`: ld-each 綁定的數據項
- `evt`: 事件對象（事件處理器）
- `views`: 視圖鏈（包含當前及祖先視圖）

## 配置選項

- `root`: 視圖根節點
- `handler`: 處理器對象
- `action`: 事件處理器對象
- `text`/`style`/`attr`: 專用處理器
- `init`: 初始化處理器
- `ctx`: 上下文數據
- `prefix`: 前綴名稱（配合作用域使用）
- `global`: 使用 `pd` 屬性代替 `ld`（全局模式）
- `initRender`: 是否自動初始化後渲染（預設 true）
- `template`: 模板 DOM（用於遞歸視圖）

## 使用場景

- 動態列表渲染與更新
- 表單狀態管理
- 複雜的 UI 組件
- 需要細粒度控制的模板渲染
- 遞歸數據結構顯示（如樹狀結構）

## 來源

- 原始檔案: `src/ldview/`
- README: [src/ldview/README.md](/workspace/src/ldview/README.md)
- 實作: [src/ldview/index.js](/workspace/src/ldview/index.js)
