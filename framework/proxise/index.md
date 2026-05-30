# proxise

Promise Proxy 機制，讓你在 Promise 函數外部呼叫 resolve/reject。

## 安裝與引用

```bash
npm install proxise
```

## 核心概念

proxise 包裝函數根據其回傳值決定行為：
- **返回 Promise** → 直接使用該 Promise
- **返回 undefined 或其他值** → 建立新 Promise 並排入等待佇列，直到手動呼叫 `.resolve()` 或 `.reject()`

```javascript
const waitClick = proxise(() => {})
waitClick().then(() => console.log('clicked'))
document.body.addEventListener('click', () => waitClick.resolve())
```

## 批量解析

多個等待中的 Promise 會在 `.resolve()` 時一次全部解析：

```javascript
waitClick().then(() => console.log('A'))
waitClick().then(() => console.log('B'))
waitClick.resolve()  // A 和 B 都解析
```

## 條件性返回

```javascript
const getData = proxise((useCache) => {
  if (useCache && cache) return Promise.resolve(cache)
  // 否則等待 getData.resolve(data) 被呼叫
})
```

## proxise.once — 只執行一次的初始化

確保包裝函數最多執行一次，所有呼叫者共享同一個完成事件：

```javascript
const init = proxise.once(async () => {
  await connectToDb()
})

// 多處呼叫都安全，只會初始化一次
await init()
```

**指定回傳值：**

```javascript
const init = proxise.once(
  () => { /* 初始化 */ },
  () => "return value"   // 或直接傳值 "return value"
)
```

## API

- `proxise(fn, timeout?)` / `proxise(timeout, fn)` — 建立 proxise 函數
- `func()` — 呼叫，返回 Promise
- `func.resolve(value)` — 解析所有排隊的 Promise
- `func.reject(error)` — 拒絕所有排隊的 Promise
- `proxise.once(fn, returnValue?)` — 建立只執行一次的 proxise 函數

## 典型使用場景

- 等待使用者操作（確認、點擊）再繼續
- 延遲初始化（資料庫、第三方 SDK）
- 資源就緒通知（多個模組等同一資源）
