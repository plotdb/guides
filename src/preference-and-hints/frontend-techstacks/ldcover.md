# ldcover

cover / 對話框元件。底層是 cover（遮罩 + 置中容器 + 進出動畫 + z-index 管理 + promise 型
`get()` / `set()`）。3.6.0 起在其上提供對話框 helper，作為瀏覽器原生
`alert` / `confirm` / `prompt` 的替代（原生對話框會被 headless / 自動化擋住，也無法套用站台樣式）。

概覽與選用原則見 [index.md](index.md)。同屬 loading.io 家族，相關前端工具見
[../../framework/@loadingio/index.md](../../framework/@loadingio/index.md)。


## 對話框 helper

    await ldcover.alert('訊息')
    ok = await ldcover.confirm({title: '刪除', msg: '確定？', okText: '刪除', variant: 'danger'})
    name = await ldcover.prompt({title: '改名', msg: '新名稱', isRequired: true})

`confirm` 回傳 true / false，`prompt` 回傳字串 / null（取消或 escape）。第一參數可以是訊息
（字串 / DOM node）或含 `msg` 的 options 物件。

通用型 `ldcover.dialog({title, msg, fields, options})` 回傳 `{value, fields}`，可做多按鈕、
多輸入欄位、以 option 的 `action` 開巢狀對話框等。


## 主題

結構樣式固定在 `.ldcv.builtin`；視覺樣式由 `theme` 選項決定，內建：

 - `generic`：無視覺樣式（預設），自行以 class hook 上樣式。
 - `default`：中性外觀，無依賴。
 - `bootstrap`：注入 bootstrap 的 class（需頁面已載入 bootstrap css）。

可註冊自訂主題對齊自家 CSS 框架，例如 Tailwind：

    ldcover.dialog.themes.tailwind =
      input: 'border rounded px-3 py-2 w-full'
      button:
        primary: 'px-4 py-2 rounded bg-blue-600 text-white'
        danger: 'px-4 py-2 rounded bg-red-600 text-white'
    ldcover.dialog.theme('tailwind')

主題名稱也會加在 `.ldcv` root（`.ldcv.builtin.tailwind`），卡片外框、遮罩等可用 CSS
定義在該 selector 下。除非用 `bootstrap` 主題，否則不需 bootstrap。


## 接入慣例

 - CDN 載入（發佈時檔案在套件根目錄，不在 `dist/`）：

        https://cdn.jsdelivr.net/npm/ldcover@3.6.0/index.min.js
        https://cdn.jsdelivr.net/npm/ldcover@3.6.0/index.min.css

 - 建議包一層薄封裝集中處理主題與 i18n：註冊一次自家主題並設為預設
   `ldcover.dialog.theme(...)`；`alert` / `confirm` / `prompt` 的預設按鈕文字是
   `OK` / `Cancel`，非英文專案在未指定時應帶入本地語言的 `okText` / `cancelText`。
