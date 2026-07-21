# @loadingio/debounce.js

防抖工具，支援 Promise、作用域保留與靈活延遲控制。


## 安裝與引用

    npm install @loadingio/debounce.js


## 基本用法

    const func = debounce(function(p1, p2) { ... }, 500)  // 預設 500ms
    func(arg1, arg2)

    // 參數順序可互換
    const func2 = debounce(300, function() { ... })


## 主要功能

    // 僅作為延遲計時器
    debounce(300).then(() => { ... })

    // Promise 支援：取得函數返回值
    func().then(ret => { ... })

    // 清除待執行的呼叫
    func.clear()

    // 立即執行，取消之前排隊的呼叫
    func().now()

    // 動態覆寫這次呼叫的延遲
    func.delay(300)()

    // 取消單次呼叫（每次 func() 返回的 Promise）
    const p = func()
    p.cancel()


## 物件方法作用域

`this` 會正確綁定到呼叫物件：

    const obj = {
      value: 1,
      update: debounce(function(v) { this.value = v }, 300)
    }
    obj.update(2)


## API 速查

 - `debounce(fn, delay?)` / `debounce(delay, fn)` — 建立防抖函數
 - `debounce(delay)` — 純計時器，返回 Promise
 - `deb.clear()` — 清除所有待執行呼叫
 - `deb.delay(ms)` — 臨時設定延遲，返回 deb 本身（可鏈式）
 - `deb()` — 呼叫防抖函數，返回 Promise
 - `deb().now()` — 立即執行
 - `deb().cancel()` — 取消此次呼叫


## 注意事項

 - 依賴 Promise API，IE 需 polyfill
 - 清除事件監聽時記得呼叫 `handler.clear()` 防止記憶體洩漏
