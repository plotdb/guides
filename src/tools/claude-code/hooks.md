# Hook

Hook 是在特定事件觸發時執行的指令，定義在 `settings.json` 的 `hooks` 欄位。
需要「每次發生某件事就自動做某事」的功能時只能用 hook，寫在提詞或記憶裡沒有用 ——
那些是給模型讀的，不是給執行環境用的。


## 執行環境

Hook 沒有 controlling terminal。這表示 `/dev/tty` 開不起來、`ps -o tty= -p $$` 回 `??`、
`tty` 指令回報 not a tty。要與終端機互動的 hook 必須自行取得目標裝置，
作法見 [../terminal/tty-access.md](../terminal/tty-access.md)。

Hook 的標準輸入是事件的 JSON 資料。任何預期從 stdin 讀取終端機的指令都會失效 ——
`tty` 之所以失敗，正是因為它檢查的是 stdin。要取用事件資料用 `jq` 解析 stdin。

工作目錄是專案根目錄，所以 `basename "$PWD"` 之類的用法可以取得專案名稱。


## 事件與時機

這次用到的四個，涵蓋一輪對話的完整狀態變化：

 - `UserPromptSubmit`：使用者送出訊息時，一輪一次
 - `PostToolUse`：每次工具執行後，一輪多次
 - `Notification`：通知事件，可用 matcher 篩選，例如 `permission_prompt`
 - `Stop`：正常結束時。失敗 (例如額度用盡) 走 `StopFailure`，是不同事件

設計狀態指示這類功能時，要注意「一輪一次」的事件無法涵蓋中途的狀態變化。
例如權限提示出現後改成等待狀態，若只靠 `UserPromptSubmit` 設定執行中狀態，
權限授予後就沒有東西把狀態改回來，會一路停在等待中直到該輪結束。
補法是加上 `PostToolUse`，讓每次工具執行後都重設一次。


## `async`

`PostToolUse` 跑在熱路徑上，每次工具呼叫都會觸發。Hook 預設同步執行，會擋住工具流程，
所以這類 hook 應該加 `async`：

    {
      "type": "command",
      "command": "~/.claude/hooks/example.sh",
      "async": true
    }

一輪只觸發一次的事件不需要，同步執行的延遲可以忽略。

判斷依據是觸發頻率，不是指令本身多快。即使指令只需十幾毫秒，
乘上一輪數十次工具呼叫仍會累積成可感知的延遲。


## 設定的載入

`settings.json` 改動後不會立即生效，要開一次 `/hooks` 或重啟才會重新載入。
Hook 指向的腳本則是每次執行都重讀，改腳本立即生效。

排查 hook 沒有動作時，先分清楚是哪一種：改了設定沒重載，跟腳本本身有問題，
表現完全一樣。

修改 `settings.json` 要合併而非覆寫。同一個事件下可以有多組 hook，
各自有獨立的 matcher，直接替換整個陣列會刪掉其他功能。
改完用 `jq` 驗證語法 —— 格式錯誤會讓整個檔案的設定全部失效，而且是靜默的。


## 除錯

Hook 失敗不會顯示錯誤。指令不存在、路徑錯誤、腳本內部出錯，畫面上都看不出來。

要確認 hook 有沒有被執行，在指令前面加一段留下痕跡的動作：

    echo "$(date +%T) fired" >> /tmp/hook-check.txt

記錄檔沒有內容表示 hook 根本沒被觸發，通常是設定沒有重載或 matcher 不符。
有內容但沒有預期效果，問題就在腳本裡面。

腳本放在 `~/.claude/hooks/`，設定中用 `~/.claude/hooks/x.sh` 這種相對於家目錄的路徑，
不要寫死絕對路徑。
