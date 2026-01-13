# proxise

## 簡介

proxise 提供 Promise Proxy 機制，讓你可以在 Promise 函數外部輕鬆地解析（resolve）或拒絕（reject）Promise。

## 核心概念

傳統的 Promise 需要在建構函數內部呼叫 resolve/reject：

```javascript
new Promise((resolve, reject) => {
  // 必須在這裡決定何時 resolve
  setTimeout(() => resolve('done'), 1000)
})
```

proxise 讓你可以在外部控制 Promise 的解析：

```javascript
somefunc = proxise(() => {
  if (ready) return Promise.resolve('some value')
  // 否則返回 undefined，proxise 會創建並排隊一個 Promise
})

somefunc().then(v => console.log(v))
// 稍後在其他地方...
somefunc.resolve('some value')  // 解析所有排隊的 Promise
```

## 主要功能

### 1. 基本用法

將函數包裝在 proxise 中：

```javascript
const untilUserClick = proxise(() => {})
untilUserClick().then(() => console.log('user clicked'))

document.body.addEventListener('click', () => {
  untilUserClick.resolve()
})
```

### 2. 條件性返回 Promise

proxise 根據包裝函數的返回值決定行為：

- **返回 Promise**: 直接使用該 Promise
- **返回其他值或 undefined**: 創建新 Promise 並排隊，等待手動解析

```javascript
const getData = proxise((useCache) => {
  if (useCache && cachedData) {
    return Promise.resolve(cachedData)  // 立即返回
  }
  // 否則等待 getData.resolve() 被調用
})
```

### 3. 超時設置

可以設置超時時間（毫秒）：

```javascript
// 參數順序 1: 函數在前
const func1 = proxise(() => {}, 3000)

// 參數順序 2: 超時在前
const func2 = proxise(3000, () => {})

// 3 秒後如果未解析，Promise 會被拒絕並拋出 timeout 錯誤
```

### 4. proxise.once - 確保只執行一次

`proxise.once` 適用於初始化場景，確保包裝的函數最多執行一次：

```javascript
const init = proxise.once(() => {
  console.log("只會執行一次")
  // 執行初始化邏輯
})

// 多次調用都會等待同一個初始化完成
init().then(() => console.log('完成 1'))
init().then(() => console.log('完成 2'))  // 不會再次執行初始化
```

#### 自定義返回值

可以指定初始化完成後的返回值：

```javascript
// 使用函數動態返回
const init = proxise.once(
  () => { /* 初始化邏輯 */ },
  () => "return me"
)

// 使用固定值
const init = proxise.once(
  () => { /* 初始化邏輯 */ },
  "fixed value"
)
```

### 5. 批量解析

所有排隊等待的 Promise 會在調用 resolve/reject 時一次性全部解析：

```javascript
const waitSignal = proxise(() => {})

// 創建多個等待中的 Promise
waitSignal().then(() => console.log('Promise 1'))
waitSignal().then(() => console.log('Promise 2'))
waitSignal().then(() => console.log('Promise 3'))

// 一次性解析所有等待中的 Promise
waitSignal.resolve('done')  // 所有 3 個 Promise 都會被解析
```

## 主要 API

### 建構函數

```javascript
proxise(function, timeout?)
proxise(timeout, function)
```

- `function`: 被包裝的函數
- `timeout`: 可選的超時時間（毫秒）

### 返回函數的方法

- `func.resolve(value)`: 解析所有排隊的 Promise
- `func.reject(error)`: 拒絕所有排隊的 Promise

### 靜態方法

- `proxise.once(function, returnValue?)`: 創建只執行一次的 proxise 函數
  - `returnValue`: 可選，指定初始化後的返回值（可以是值或函數）

## proxise.once 運作機制

`proxise.once` 的內部邏輯等同於：

```javascript
const _init = () => { /* 實際邏輯 */ }
const init = proxise(() => {
  if (init.inited) return Promise.resolve()
  if (init.initing) return  // 等待中

  init.initing = true
  return Promise.resolve()
    .then(() => _init())
    .finally(() => init.initing = false)
    .then(() => init.inited = true)
    .then(() => init.resolve())
    .catch(err => init.reject(err))
})
```

## 使用場景

### 1. 等待用戶互動

```javascript
const waitForConfirm = proxise(() => {})
waitForConfirm().then(() => proceedWithAction())

confirmButton.addEventListener('click', () => waitForConfirm.resolve())
cancelButton.addEventListener('click', () => waitForConfirm.reject())
```

### 2. 延遲初始化

```javascript
const initDatabase = proxise.once(async () => {
  await connectToDb()
  await runMigrations()
})

// 在多個地方調用，但只會初始化一次
async function queryUsers() {
  await initDatabase()
  return db.query('SELECT * FROM users')
}
```

### 3. 條件性異步操作

```javascript
const loadData = proxise((forceRefresh) => {
  if (!forceRefresh && cache.has('data')) {
    return Promise.resolve(cache.get('data'))
  }
  // 等待外部調用 loadData.resolve(data)
})

// API 請求完成後
fetch('/api/data')
  .then(res => res.json())
  .then(data => {
    cache.set('data', data)
    loadData.resolve(data)
  })
```

### 4. 資源就緒通知

```javascript
const resourceReady = proxise(() => {})

// 多個模組等待資源
moduleA.then(() => resourceReady().then(startModuleA))
moduleB.then(() => resourceReady().then(startModuleB))

// 資源載入完成後通知所有等待者
loadResource().then(resource => {
  resourceReady.resolve(resource)
})
```

## 優勢

1. **簡化異步流程控制**: 不需要在 Promise 構造器內處理所有邏輯
2. **提高代碼可讀性**: 將 Promise 的創建和解析分離
3. **適合事件驅動**: 很適合等待用戶操作或外部事件
4. **避免重複執行**: `proxise.once` 確保初始化邏輯只執行一次

## 來源

- 原始檔案: `src/proxise/`
- README: [src/proxise/README.md](/workspace/src/proxise/README.md)
- 實作: [src/proxise/index.js](/workspace/src/proxise/index.js)
