# @loadingio/debounce.js

## 簡介

debounce.js 是一個輕量級的防抖（debounce）工具，支持 Promise、作用域保留和靈活的延遲控制。

## 核心概念

防抖（Debounce）是一種限制函數執行頻率的技術。當函數被頻繁調用時，防抖確保函數只在最後一次調用後的指定延遲時間執行。

```javascript
// 沒有防抖：每次輸入都會觸發
input.addEventListener('input', () => searchAPI(input.value))

// 有防抖：停止輸入 500ms 後才執行
const debouncedSearch = debounce(() => searchAPI(input.value), 500)
input.addEventListener('input', debouncedSearch)
```

## 主要功能

### 1. 基本用法

```javascript
const myFunc = debounce(function(p1, p2) {
  console.log('執行', p1, p2)
}, 500)  // 預設延遲 500ms

myFunc('hello', 'world')
myFunc('hello', 'world')  // 前一次調用被取消
// 500ms 後只執行最後一次調用
```

### 2. 靈活的參數順序

支持兩種參數順序：

```javascript
// 方式 1: 函數在前，延遲在後
const func1 = debounce(function() { ... }, 300)

// 方式 2: 延遲在前，函數在後
const func2 = debounce(300, function() { ... })
```

### 3. Promise 支持

防抖函數返回 Promise，可以在執行完成後做後續處理：

```javascript
const myFunc = debounce(function() {
  return 'result'
}, 500)

myFunc().then((ret) => {
  console.log(ret)  // 'result'
})
```

如果包裝的函數返回 Promise，debounce 會等待該 Promise 完成：

```javascript
const asyncFunc = debounce(async function() {
  const data = await fetch('/api/data')
  return data.json()
})

asyncFunc().then(result => console.log(result))
```

### 4. 簡單延遲

只需要延遲一段時間時，可以省略函數參數：

```javascript
debounce(300).then(() => {
  console.log('300ms 後執行')
})

// 等同於
new Promise(resolve => setTimeout(resolve, 300))
```

### 5. 清除待執行調用

使用 `clear()` 取消尚未執行的函數調用：

```javascript
const func = debounce(() => console.log('執行'), 1000)

func()
func.clear()  // 取消調用，不會執行
```

### 6. 立即執行（繞過防抖）

使用 `now()` 方法立即執行函數，並取消之前的待執行調用：

```javascript
const func = debounce(() => console.log('執行'), 1000)

func()  // 設置 1 秒後執行
func().now()  // 立即執行，並取消之前的調用
```

### 7. 動態覆蓋延遲時間

使用 `delay()` 方法臨時修改延遲時間：

```javascript
const func = debounce(() => console.log('執行'), 500)

func()  // 使用預設的 500ms
func.delay(300)()  // 這次使用 300ms
func()  // 恢復使用 500ms
```

### 8. 取消單次調用

每次調用返回的 Promise 都有 `cancel()` 方法：

```javascript
const func = debounce(() => console.log('執行'), 500)

const promise = func()
promise.cancel()  // 取消這次調用
```

### 9. 保留對象方法作用域

在對象方法中使用時，`this` 會正確指向對象實例：

```javascript
const obj = {
  value: 1,
  updateValue: debounce(function(newValue) {
    this.value = newValue  // this 正確指向 obj
  }, 500)
}

obj.updateValue(2)
```

## API 參考

### 建構函數

```javascript
debounce(function, delay?)
debounce(delay, function)
debounce(delay)  // 簡單延遲
```

- `function`: 要防抖的函數
- `delay`: 延遲時間（毫秒），預設 500ms

### 返回函數的方法

- `func()`: 調用防抖函數，返回 Promise
- `func.clear()`: 清除所有待執行的調用
- `func.delay(ms)`: 臨時設置延遲時間，返回函數本身（可鏈式調用）

### Promise 方法

每次調用返回的 Promise 額外提供：

- `promise.now()`: 立即執行函數，取消之前的調用
- `promise.cancel()`: 取消這次調用

## 使用場景

### 1. 搜尋框輸入

```javascript
const searchInput = document.querySelector('#search')
const debouncedSearch = debounce((query) => {
  fetch(`/api/search?q=${query}`)
    .then(res => res.json())
    .then(results => displayResults(results))
}, 300)

searchInput.addEventListener('input', (e) => {
  debouncedSearch(e.target.value)
})
```

### 2. 視窗大小調整

```javascript
const handleResize = debounce(() => {
  console.log('視窗大小:', window.innerWidth, window.innerHeight)
  recalculateLayout()
}, 250)

window.addEventListener('resize', handleResize)
```

### 3. 表單自動儲存

```javascript
const autoSave = debounce(async (formData) => {
  await fetch('/api/save', {
    method: 'POST',
    body: JSON.stringify(formData)
  })
  showNotification('已自動儲存')
}, 2000)

formElement.addEventListener('input', () => {
  const data = new FormData(formElement)
  autoSave(Object.fromEntries(data))
})
```

### 4. 滾動事件處理

```javascript
const handleScroll = debounce(() => {
  const scrollPercent = (window.scrollY / document.body.scrollHeight) * 100
  updateProgressBar(scrollPercent)
}, 100)

window.addEventListener('scroll', handleScroll)
```

### 5. API 請求限流

```javascript
const fetchData = debounce(async (id) => {
  const response = await fetch(`/api/data/${id}`)
  return response.json()
}, 500)

// 連續調用只會發送最後一次請求
fetchData(1)
fetchData(2)
fetchData(3)  // 只有這個會執行

fetchData(4).then(data => {
  console.log('獲取數據:', data)
})
```

### 6. 緊急情況立即執行

```javascript
const saveData = debounce(async (data) => {
  await fetch('/api/save', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}, 3000)

// 正常編輯：3 秒後自動儲存
editor.addEventListener('input', () => saveData(editor.value))

// 用戶點擊儲存按鈕：立即執行
saveButton.addEventListener('click', () => {
  saveData(editor.value).now()
})
```

## 注意事項

### Promise Polyfill

debounce.js 依賴 Promise API，在不支持 Promise 的瀏覽器（如 IE）中需要使用 polyfill：

```html
<!-- 在載入 debounce.js 之前引入 Promise polyfill -->
<script src="https://cdn.jsdelivr.net/npm/promise-polyfill@8/dist/polyfill.min.js"></script>
<script src="path/to/debounce.js"></script>
```

### 記憶體管理

如果不再需要防抖函數，記得清除事件監聽器以避免記憶體洩漏：

```javascript
const handler = debounce(() => { ... })
element.addEventListener('input', handler)

// 清理時
element.removeEventListener('input', handler)
handler.clear()  // 清除待執行的調用
```

## 與 Throttle 的區別

- **Debounce（防抖）**: 在事件停止觸發後的 N 毫秒執行函數
  - 適用於：搜尋輸入、表單驗證、視窗大小調整

- **Throttle（節流）**: 每 N 毫秒最多執行一次函數
  - 適用於：滾動事件、鼠標移動、動畫幀更新

## 來源

- 原始檔案: `src/@loadingio/debounce.js/`
- README: [src/@loadingio/debounce.js/README.md](/workspace/src/@loadingio/debounce.js/README.md)
- 實作: [src/@loadingio/debounce.js/index.js](/workspace/src/@loadingio/debounce.js/index.js)
