# @loadingio/ldquery

輕量 DOM 工具庫，提供 DOM 操作、class 管理與 fetch/xhr 包裝。

## 安裝與引用

```bash
npm install @loadingio/ldquery
```

```html
<script src="https://cdn.jsdelivr.net/gh/loadingio/ldquery@v1.1.3/dist/ldq.min.js"></script>
```

## 三種調用風格

```javascript
ld$.find(document.body, '.btn', 0)   // 直接呼叫
ld$.find('.btn', 0)                  // 省略 document 參數
ld$(document.body).find('.btn', 0)   // 包裝器鏈式風格
```

## DOM API

| 函數 | 說明 |
|------|------|
| `find(node, selector, index)` | querySelector 簡化版。省略 index 返回陣列，有 index 返回單元素 |
| `index(node)` | 節點在父節點 childNodes 中的索引 |
| `child(node)` | 子節點陣列（等同 `Array.from(node.childNodes)`） |
| `parent(node, selector, endNode?)` | 向上找符合 selector 的祖先，找不到返回 null |
| `attr(node, name, value?)` | 讀取或設置屬性；value 為物件時批量設置 |
| `cls(node, o, p?, n?)` | class 操作：o 為物件時用 `{className: bool}`；o 為 bool 時 p=正類 n=負類 |
| `on(node, name, callback)` | addEventListener 包裝 |
| `remove(node)` | 從父節點移除 |
| `insertAfter(node, newNode, oldNode)` | 在 oldNode 後插入 newNode |
| `create(options)` | 建立 DOM 元素，支援 `name/className/attr/style/text/html/ns` |
| `json(data)` | 安全 JSON 解析，失敗返回原始字串 |

## Fetch 包裝

```javascript
ld$.fetch(url, rawOptions, ldqOptions)
  .then(data => ...)
  .catch(err => {
    err.code   // HTTP 狀態碼
    err.data   // 原始回應
    err.json   // 解析後的 JSON（若有）
  })
```

**ldqOptions 常用欄位：**

| 選項 | 說明 |
|------|------|
| `type` | 回應類型：`'json'` 或 `'text'`，自動解析 |
| `json` | 直接傳物件，自動設 Content-Type 並 stringify |
| `params` | 物件轉 query string 附在 URL |
| `timeout` | 逾時毫秒數，預設 40000。逾時 `err.id === 1006` |
| `noDefaultHeaders` | `true` 跳過全局 headers |

**全局 headers：**

```javascript
ld$.fetch.headers['X-CSRF-TOKEN'] = token
```

## XHR 包裝（帶進度）

```javascript
ld$.xhr(url, rawOptions, {
  progress: ({percent, val, len}) => updateProgressBar(percent)
})
```

與 fetch 用法相同，額外支援 `progress` callback。

## 注意事項

- 依賴 `fetch API`、`classList`、`Array.from`，IE 需 polyfill
- `cls` 的 p/n 參數支援字串或陣列
