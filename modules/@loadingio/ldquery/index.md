# @loadingio/ldquery

## 簡介

ldquery 是一個輕量級的 DOM 操作工具庫，提供 Vanilla JS 的簡潔 API，同時包含增強的 fetch 和 XMLHttpRequest 包裝。

## 核心概念

ldquery 提供三種調用方式：

```javascript
// 方式 1: 直接調用函數
ld$.find(document.body, '.btn', 0)

// 方式 2: 省略 document 參數
ld$.find('.btn', 0)  // 等同於 ld$.find(document, '.btn', 0)

// 方式 3: 包裝器風格（鏈式調用）
ld$(document.body).find('.btn', 0)
```

## DOM 操作 API

### find(node, selector, index)

查詢 DOM 元素的簡化方法：

```javascript
// 返回單個元素（index = 0）
const btn = ld$.find(document, '.btn', 0)

// 返回所有匹配元素的陣列（省略 index）
const allBtns = ld$.find(document, '.btn')

// 返回第 n 個元素
const thirdBtn = ld$.find(document, '.btn', 2)
```

### index(node)

取得節點在父節點 childNodes 中的索引：

```javascript
const element = document.querySelector('#myElement')
const position = ld$.index(element)  // 例如: 3
```

### child(node)

以陣列形式返回節點的所有子節點：

```javascript
const children = ld$.child(document.body)
// 等同於 Array.from(document.body.childNodes)
```

### parent(node, selector, endNode)

向上搜尋符合選擇器的父節點：

```javascript
const form = ld$.parent(inputElement, 'form')
// 找到最近的 form 父元素

const container = ld$.parent(element, '.container', document.body)
// 搜尋到 body 為止
```

### attr(node, name, value)

讀取或設置屬性：

```javascript
// 讀取屬性
const id = ld$.attr(element, 'id')

// 設置單個屬性
ld$.attr(element, 'id', 'new-id')

// 批量設置屬性（使用物件）
ld$.attr(element, {
  'data-id': '123',
  'data-name': 'test',
  'disabled': 'true'
})
```

### cls(node, o, p, n)

靈活的 class 操作：

```javascript
// 方式 1: 使用物件（class 名稱 / 開關對）
ld$.cls(element, {
  'active': true,
  'disabled': false,
  'hidden': shouldHide
})

// 方式 2: 使用布林值與正負 class 列表
ld$.cls(element, true, 'active', 'inactive')
// true: 加上 'active'，移除 'inactive'

ld$.cls(element, false, 'active', 'inactive')
// false: 移除 'active'，加上 'inactive'

// 支持陣列
ld$.cls(element, condition, ['class1', 'class2'], ['class3', 'class4'])
```

### on(node, name, callback)

添加事件監聽器：

```javascript
ld$.on(button, 'click', (evt) => {
  console.log('按鈕被點擊')
})
```

### remove(node)

從父節點移除元素：

```javascript
ld$.remove(element)
// 等同於 element.parentNode.removeChild(element)
```

### insertAfter(node, newNode, oldNode)

在指定節點後插入新節點：

```javascript
ld$.insertAfter(container, newElement, existingElement)
// newElement 會被插入到 existingElement 之後
```

### create(options)

創建新的 DOM 元素：

```javascript
const div = ld$.create({
  name: 'div',
  className: ['container', 'main'],
  attr: {
    'id': 'my-div',
    'data-value': '123'
  },
  style: {
    color: 'red',
    padding: '10px'
  },
  text: 'Hello World',  // 或使用 html
  html: '<span>HTML content</span>'
})

// SVG 元素
const circle = ld$.create({
  name: 'circle',
  ns: 'svg',  // 或使用完整命名空間 'http://www.w3.org/2000/svg'
  attr: {
    cx: 50,
    cy: 50,
    r: 40
  }
})
```

### json(data)

安全的 JSON 解析：

```javascript
const obj = ld$.json('{"name": "test"}')  // 返回物件
const invalid = ld$.json('invalid json')   // 返回原始字串
```

## Fetch API

ldquery 提供增強的 fetch 包裝，支持更好的錯誤處理和額外選項。

### 基本用法

```javascript
ld$.fetch(url, rawOptions, ldqOptions)
  .then(response => { ... })
  .catch(error => {
    console.log(error.code)  // HTTP 狀態碼
    console.log(error.data)  // 原始回應
    console.log(error.json)  // 解析的 JSON（如果有）
  })
```

### Raw Options（標準 fetch 選項）

```javascript
ld$.fetch('/api/data', {
  method: 'POST',
  body: JSON.stringify({data: 1}),
  headers: {
    'Content-Type': 'application/json'
  }
})
```

### LDQ Options（ldquery 額外選項）

#### type: 指定回應類型

```javascript
ld$.fetch('/api/data', {}, {type: 'json'})
  .then(data => console.log(data))  // 自動解析為 JSON

ld$.fetch('/api/text', {}, {type: 'text'})
  .then(text => console.log(text))  // 返回文字
```

#### json: 簡化 JSON 傳送

```javascript
// 使用 json 選項
ld$.fetch('/api/save', {}, {
  json: {data: 1, name: 'test'}
})

// 等同於
ld$.fetch('/api/save', {
  body: JSON.stringify({data: 1, name: 'test'}),
  headers: {'Content-Type': 'application/json; charset=UTF-8'}
})
```

#### params: 簡化查詢字串

```javascript
// 使用 params 選項
ld$.fetch('/api/search', {}, {
  params: {q: 'some text', page: 2}
})

// 等同於
ld$.fetch('/api/search?q=some%20text&page=2', {}, {})
```

#### timeout: 設置超時

```javascript
ld$.fetch('/api/slow', {}, {
  timeout: 5000  // 5 秒超時，預設 40 秒
})
.catch(err => {
  if (err.id === 1006) {
    console.log('請求超時')
  }
})
```

#### noDefaultHeaders: 停用全局 headers

```javascript
ld$.fetch('/api/data', {}, {
  noDefaultHeaders: true
})
```

### 全局 Headers

設置所有請求共用的 headers：

```javascript
ld$.fetch.headers['X-CSRF-TOKEN'] = csrfToken
ld$.fetch.headers['Authorization'] = 'Bearer ' + token
```

### 錯誤處理

fetch 返回的錯誤物件包含：

```javascript
catch(error => {
  error.name     // 'lderror'
  error.id       // 錯誤代碼
  error.code     // HTTP 狀態碼
  error.data     // 原始回應數據
  error.json     // 解析的 JSON（如果有）
  error.message  // 錯誤訊息
})
```

如果伺服器返回 ldError 格式的錯誤：

```json
{
  "name": "lderror",
  "id": 1001,
  "message": "Validation failed"
}
```

這個物件會被直接用於構造 Error 物件。

## XMLHttpRequest API

XMLHttpRequest 包裝與 fetch 類似，但支持進度追蹤。

### 基本用法

```javascript
ld$.xhr(url, rawOptions, ldqOptions)
  .then(response => { ... })
  .catch(error => { ... })
```

### 進度追蹤

```javascript
ld$.xhr('/api/upload', {
  method: 'POST',
  body: formData
}, {
  progress: ({percent, val, len}) => {
    console.log(`上傳進度: ${(percent * 100).toFixed(1)}%`)
    console.log(`已上傳: ${val} / 總大小: ${len}`)
    updateProgressBar(percent)
  }
})
.then(result => console.log('上傳完成', result))
```

## 使用場景

### 1. 簡化 DOM 查詢

```javascript
// 傳統方式
const buttons = Array.from(document.querySelectorAll('.btn'))

// ldquery 方式
const buttons = ld$.find('.btn')
```

### 2. 動態 Class 管理

```javascript
const toggleMenu = (isOpen) => {
  ld$.cls(menuElement, {
    'menu-open': isOpen,
    'menu-closed': !isOpen
  })
}
```

### 3. API 請求與錯誤處理

```javascript
async function loadUserData(userId) {
  try {
    const user = await ld$.fetch(`/api/users/${userId}`, {}, {
      type: 'json',
      timeout: 5000
    })
    return user
  } catch (error) {
    if (error.code === 404) {
      console.log('用戶不存在')
    } else if (error.id === 1006) {
      console.log('請求超時')
    } else {
      console.log('未知錯誤:', error.message)
    }
    throw error
  }
}
```

### 4. 表單提交

```javascript
const submitForm = async (formElement) => {
  const formData = new FormData(formElement)
  const data = Object.fromEntries(formData)

  return ld$.fetch('/api/submit', {}, {
    json: data,
    timeout: 10000
  })
}
```

### 5. 檔案上傳進度

```javascript
const uploadFile = (file) => {
  const formData = new FormData()
  formData.append('file', file)

  return ld$.xhr('/api/upload', {
    method: 'POST',
    body: formData
  }, {
    progress: ({percent}) => {
      const progressBar = ld$.find('#progress-bar', 0)
      progressBar.style.width = (percent * 100) + '%'
    }
  })
}
```

### 6. 鏈式 DOM 操作

```javascript
const element = ld$(document.createElement('div'))
element.attr('id', 'my-element')
element.cls({'active': true, 'hidden': false})
element.on('click', () => console.log('clicked'))
```

## 相容性注意事項

ldquery 使用以下現代 Web API，在舊瀏覽器可能需要 polyfill：

1. **fetch API**: IE 和舊版 Edge (≤13) 不支持
   - 解決方案: 使用 [fetch polyfill](https://github.com/github/fetch)

2. **classList**: IE 支持不完整
   - 解決方案: 使用 [classList polyfill](https://github.com/eligrey/classList.js)

3. **Array.from**: IE 不支持
   - 解決方案: 使用 [core-js](https://github.com/zloirock/core-js)

Polyfill 引入範例：

```html
<script src="https://cdn.jsdelivr.net/npm/core-js@3/bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/whatwg-fetch@3/dist/fetch.umd.js"></script>
<script src="path/to/ldquery.js"></script>
```

## 擴展原生 DOM（選用）

可以將 ldquery 的方法混入原生 DOM 原型（不建議在生產環境使用）：

```javascript
// 在 LiveScript 語法中
HTMLElement.prototype <<< ld$obj.prototype

// 之後可以這樣使用
document.body.find('.btn', 0)
element.attr('id', 'new-id')
```

## 來源

- 原始檔案: `src/@loadingio/ldquery/`
- README: [src/@loadingio/ldquery/README.md](/workspace/src/@loadingio/ldquery/README.md)
- 實作: [src/@loadingio/ldquery/index.js](/workspace/src/@loadingio/ldquery/index.js)
