# ldview

Headless、logic-less 的 HTML 模板引擎，透過 `ld` 屬性做 JS Selector 綁定。


## 安裝與引用

    npm install ldview

    <script src="path-to-ldview/index.min.js"></script>


## 核心概念

用 `ld` 屬性命名元素，在 JS 中用 handler 對應處理邏輯：

    div(ld="plan free")
    div(ld="plan month")

    const view = new ldview({
      root: document.body,
      handler: {
        plan: ({node, names, name, idx, ctx}) => {
          node.style.display = names.includes(currentPlan) ? 'block' : 'none'
        }
      }
    })

多個 config 物件可合併傳入：`new ldview({root: ...}, {handler: ...})`


## Handler 類型

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


## Handler 參數

 - `node`：當前 DOM 節點
 - `names`：節點上所有 ld 名稱 ( 空格分隔陣列 )
 - `name`：本次匹配的 handler 名稱
 - `idx`：節點索引
 - `local`：節點生命週期內的本地資料存儲
 - `ctx`：view 層級的上下文資料 ( ld-each 的 item view 中即為該筆資料 )
 - `data`：ld-each 節點綁定的資料項
 - `evt`：事件物件 ( action handler )
 - `ctxs`：父層 view 的上下文列表，由內而外排序 ( 巢狀 ld-each 請見下方「巢狀 ld-each 的 ctx / ctxs」 )
 - `views`：view 鏈，`views[0]` 為當前 view


## 循環渲染 ( ld-each )

    .shelf: div(ld-each="book")
      .name(ld="name")
      .author(ld="author")

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

ld-each 的 `view` 欄位支援所有一般 view 設定 ( init、handler、text、action… )。

ld-each 定義的位置：與一般 handler 相同，放在該節點所屬 view 的 `handler` 下。若要巢狀，
就放進外層 ld-each 的 `view.handler` 裡：

    .prj(ld-each="project")
      .cell(ld-each="option")
        span(ld="count")
        .judges: .judge(ld-each="judge"): div(ld="name")

    handler: project:
      list: ~> @prjs
      view: handler: option:
        list: ~> @options
        view:
          text: count: ...
          handler: judge:                 # 巢狀 ld-each 放這裡
            list: ...
            view: text: name: ...


## 巢狀 ld-each 的 ctx / ctxs

`ctx` 與 `ctxs` 的值取決於「函式屬於哪一層 view」，這是巢狀時最容易踩錯的地方：

 - 在 **`list`** ( ld-each 的容器層，屬於外層 view )：
   `ctx` = **外層那一筆**資料，`ctxs` = 更外層的 context 陣列 ( `ctxs.0` 是外層的外層 )
 - 在 **`view` 內的 handler / text** ( 每一筆的 item view )：
   `ctx` = **本筆**資料，`ctxs` = `[外層那筆, 再外層那筆, ...]` ( `ctxs.0` 是外層 )
 - `key` 不吃 context：它收到的是**該筆資料本身** ( `key: -> it.id` )

以上面的三層為例：

    handler: judge:
      # 這裡是 option 這層 view 的容器函式：
      #   ctx    = option ( 外層那筆 )
      #   ctxs.0 = project ( 再外層 )
      list: ({ctx, ctxs}) ~>
        [opt, prj] = [ctx, ctxs.0]
        ...
      key: -> it.key                    # 參數是該筆資料，不是 {ctx, ctxs}
      view: text: name: ({ctx, ctxs}) ~>
        # 這裡是 judge item view：
        #   ctx    = judge ( 本筆 )
        #   ctxs   = [option, project, ...]
        ctx.name

換句話說，**同一個 `ctxs.0` 在 `list` 裡與在 `view` 裡差一層**。若在 `list` 裡誤用
`ctxs.0` 當外層資料，拿到的會是更外層的東西 ( 或 `undefined` )，清單就會整個空掉。

需要外層資料做後續計算時，建議在 `list` 就把它算好塞進回傳的項目裡，item view 只負責顯示，
可避免再去追 `ctxs` 的層數：

    list: ({ctx, ctxs}) ~>
      [opt, prj] = [ctx, ctxs.0]
      users.filter(...).map (u) ~> {user: u, weight: @get-weight {user: u, prj}}
    view: text: name: ({ctx}) ~> "#{ctx.user.name} (#{ctx.weight}x)"

### 防呆：list 會在資料還沒備妥時被呼叫

`init()` 與 `render()` 走的是同一套 `_prerender`，都會呼叫 `procEach` → `list`，因此 `list`
可能在資料尚未載入、外層 context 還是 `null` 時就被呼叫到；context 鏈的最尾端本來就常是 `null`
( root view 沒給 `ctx`，往下傳就是 `[null]` )。

要特別小心的是：一般 handler / text 的例外會被 `_render` 的 try/catch 接住 ( 印出
`[ldview] failed when rendering ...` 後才 rethrow )，但 **`list` 的例外不在那個 try/catch 內**，
會同步往外拋穿 `procEach` 與 `init()`／`render()`——結果是整個 view 初始化中斷，畫面整片沒出來，
而不只是該欄位空白。務必先擋掉：

    list: ({ctx, ctxs}) ~>
      [opt, prj] = [ctx, (ctxs or []).0]
      if !opt or !prj => return []
      ...

### 定義層級放錯不會報錯

`update` 掃到 `ld-each` 節點時，若該 view 的 `handler` 沒有同名項目就直接略過 ( 也不會把節點換成
comment proxy )。症狀是**範本原封不動留在畫面上**、沒有任何錯誤訊息——巢狀時若把 `judge` 誤放在
外層 `handler` 而不是 `option` 的 `view.handler` 裡，就會看到這個現象。

想確認實際拿到什麼，直接把整包參數存到 `window` 觀察最快
( `console.log` 在多次 render 下會被洗版 )：

    list: (o) ~>
      window.__dbg = (window.__dbg or []) ++ [o]
      ...


## 部分渲染

    view.render(['name'])                              // 只更新特定 ld 名稱
    view.render({name: 'book', key: [key1, key2]})    // 只更新特定 key 的 ld-each 項


## 作用域隔離 ( ld-scope )

防止父 view 選取到子 view 內的元素：

    div(ld="name")
    div(ld-scope, ld="userInfo"): div(ld="name")   // 內部 name 不被外層選到

也可使用 ldview 的 pug mixin：

    include /path-to-ldview/index.pug
    +scope("userInfo")
      div(ld="name")


## 前綴 ( prefix ) 與混合視圖

需要混合多個 view 而不用 ld-scope 隔離時，用 `naked-scope` + `prefix()` 函數：

    +scope("userInfo").naked-scope
      div(ld=prefix("name"))   // 輸出 ld="userInfo$name"

    new ldview({ prefix: 'userInfo', handler: { name: ... } })


## 遞歸視圖

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

遞歸 DOM 需用 `template` 選項提供範本：

    new ldview({
      template: document.querySelector('.template'),
      ...cfg
    })


## 主要 API

 - `new ldview(cfg, ...)`：建立 view，可傳多個 config 合併
 - `view.render(names?)`：渲染，省略 names 則全部更新
 - `view.init()`：手動初始化，返回 Promise
 - `view.get(name)`：取得第一個匹配節點
 - `view.getAll(name)`：取得所有匹配節點
 - `view.ctx(value?)`：取得或設置 context
 - `view.on(event, cb)`：監聽 view 事件
 - `view.fire(event, ...args)`：觸發 view 事件
 - `view.bindEachNode({container, name, node, idx})`：手動加入 ld-each 節點 ( 不更新資料 )
 - `view.unbindEachNode({container, name, node?, idx?})`：手動移除 ld-each 節點
 - `ldview.merge(a, b, ...)`：合併 config 物件 ( 靜態方法 )


## 設定選項速查

 - `root`：View 根節點
 - `handler/init/text/style/attr/action`：各類型 handler
 - `ctx`：初始上下文資料
 - `prefix`：配合 naked-scope 使用的前綴名稱
 - `global`：`true` 時改用 `pd`/`pd-each` ( 跨 ld-scope 存取 )
 - `initRender`：建立後自動 render，預設 `true`
 - `template`：遞歸/嵌套 view 用的範本 DOM
