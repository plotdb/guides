# @plotdb/form

表單驗證框架，定義 widget、opset、op、term 等核心概念。

原始碼：`plotdb/projects/form/src/`


## 核心概念


### widget

表單欄位實例，管理值、驗證、事件。

    w = new form.widget {root, mod}
    w.value!             # 取得目前值（programmatic 用）
    w.content!           # 取得顯示用值（validate 內部使用）
    w.valdef!            # 回傳 valdef BID string 或 null
    w.valspec!           # 回傳 {values: [{key, label, value}]} 等 metadata
    w.validate!          # 執行所有 term 驗證
    w.serialize!         # 序列化（含 id、term 等）

重要：`validate()` 使用 `v = @content!`，不是 `value()`。這是歷史設計，廣泛依賴，不應更動。


### opset

一組驗證規則的集合：

    form.opset.register
      id: \choice
      valdef: ["@plotdb/form:valdef/choice"]  # null = 只支援 generic
      i18n: {...}
      convert: (v) -> ...   # normalize widget value 供 op.func 使用
      ops:
        is:
          func: (v, cfg) -> bool
          config: (valspec) ->  # 可以是 function，接受 valspec 回傳 schema object
            val: type: \choice, name: \val, values: valspec?values or []

    form.opset.list {valdef: "..."}  # 依 valdef 過濾可用的 opset
    form.opset.get "choice"          # 取得指定 opset

opset 過濾規則：
 - opset 無 `valdef` 欄位 → 只在 widget 是 generic（valdef = null）時顯示
 - opset 有 `valdef: [...]` → 只在 widget 的 valdef 在清單中時顯示


### op

單一驗證規則：

    op.func(v, cfg)       # 驗證函式，回傳 bool 或 Promise<bool>
    op.get-config(valspec)  # 取得 config schema（若 config 是 function 則帶入 valspec）
    op.config-default(valspec)  # 取得 config 預設值

`config` 欄位可以是 object 或 function：
 - Object：靜態 schema，`{type: \text, name: "..."}`
 - Function：接受 `valspec`，動態決定型態與選項（如 choice opset 依 valspec.values 決定是 text 還是 choice）


### term

一筆驗證條件，序列化格式：

    {id, enabled, opset, op, config, msg}

 - `id` — 隨機 string，由 `form.term` constructor 自動生成（若無則產生），保證序列化後穩定（sharedb 安全）
 - `enabled` — 是否啟用
 - `opset` / `op` — 指向 form.opset / form.op 的 id
 - `config` — op 的參數值
 - `msg` — 驗證失敗時的自訂訊息


### valdef

Widget value 型別識別子（BID string）：

 - `null`：視同 `@plotdb/form:valdef/generic`，向下相容
 - `"@plotdb/form:valdef/choice"`：radio / checkbox / choice 共用

BID 只是 identifier，不需要有對應的實際 block 存在。


### valspec

Widget 對外暴露的 value metadata，供 term 編輯器使用：

    widget.valspec!  # 回傳 {values: [{key, label, value}, ...]}

 - `label` 是純文字字串（由 widget 透過 `hitf!totext` 預先轉換）
 - 下游（opset、term editor）拿到的 label 已是 string，不需知道 richtext 格式


## 內建 opset 清單

 - `list`：generic。說明：陣列長度驗證（count-max/min/range）
 - `file`：generic。說明：檔案大小、數量、副檔名
 - `image`：generic。說明：圖片尺寸、像素
 - `string`：generic。說明：文字包含、排除、email、url、regex
 - `length`：generic。說明：字數長度（含多種計算方式）
 - `number`：generic。說明：數值比較
 - `date`：generic。說明：日期、年齡
 - `choice`：valdef/choice。說明：選項比較：is / is-not / is-any


### choice opset 特別說明

 - `convert(v)` 統一 normalize 選項值（舊字串或新 `{key,value,label}` 物件都轉成 key string）
 - `is` / `is-not` — 比對單一 key，config 依 valspec.values 決定是 text input 還是 choice picker
 - `is-any` — 比對多個 key；config 是 text（comma-separated）或 choice；func 中自動 parse 逗號分隔字串
