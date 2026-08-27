# 寫入終端機的 tty

控制序列要送到終端機的 tty 才會生效。前景執行的程式直接寫 stdout 或 `/dev/tty` 即可，
但背景程序、hook、被工具產生的子程序往往沒有 controlling terminal，這時兩種寫法都失效。


## `/dev/tty` 的前提

`/dev/tty` 是「呼叫者的 controlling terminal」這個概念的別名，不是固定裝置。
程序沒有 controlling terminal 時，開啟它會失敗：

    printf '\033]0;x\007' > /dev/tty
    # bash: /dev/tty: Device not configured

同樣的原因，`tty` 指令會回報 not a tty，`ps -o tty= -p $$` 會回 `??`。


## `test -w /dev/tty` 是假訊號

這是最容易誤導的一點：

    [ -w /dev/tty ] && echo yes

即使程序沒有 controlling terminal，這行還是會輸出 `yes`。
`test -w` 只對路徑做 `access(2)` 檢查，而 `/dev/tty` 這個節點的權限是 0666，
對任何使用者都可寫。它檢查的是權限位元，不是「開啟後真的連得到終端機」。

所以不能用它來判斷能不能寫入終端機。要判斷就直接嘗試開啟並檢查結果。


## 往上找有 tty 的祖先

可靠的作法是走 process tree，找到第一個有真實 tty 的祖先程序，
再直接寫該裝置的絕對路徑：

    find_tty() {
      local pid=$$ t
      while [ -n "$pid" ] && [ "$pid" != "1" ] && [ "$pid" != "0" ]; do
        t=$(ps -o tty= -p "$pid" 2>/dev/null | tr -d ' ')
        if [ -n "$t" ] && [ "$t" != "??" ]; then echo "$t"; return 0; fi
        pid=$(ps -o ppid= -p "$pid" 2>/dev/null | tr -d ' ')
      done
      return 1
    }

    tty_name=$(find_tty) || exit 0
    printf '\033]0;標題\007' > "/dev/$tty_name"

前提是確實有這樣一個祖先。背景服務、cron、daemon 完全脫離終端機，
爬到 init 也找不到，這時應該安靜結束而不是報錯 —— 沒有終端機可更新是正常狀況，不是故障。

若已知父程序就是那個有 tty 的程式，`ps -o tty= -p $PPID` 就夠了，不必爬。
但這個假設很脆弱，中間多一層 wrapper 就會失效，共用的腳本還是用爬的。


## 重導向順序

抑制開啟失敗的錯誤訊息時，順序會影響結果：

    printf 'x' > /dev/tty 2>/dev/null    # 錯誤訊息仍會出現
    printf 'x' 2>/dev/null > /dev/tty    # 正確抑制

重導向由左至右套用。第一種寫法在 `/dev/tty` 失敗時，stderr 還沒被轉向，
訊息會照常輸出。要先關掉 stderr 再嘗試開啟。


## 驗證方式

這類程式碼失敗時沒有訊號，所以要主動留下痕跡。在寫入前記錄解析結果：

    echo "$(date +%T) tty=[$tty_name] target=[$1]" >> /tmp/debug.log

依此可以區分三種失敗：記錄檔不存在表示程式根本沒被執行；
`tty=[]` 表示爬 process tree 失敗；兩者都正常但畫面沒反應，表示寫到了錯的裝置。
沒有這層記錄的話，三種情況的外在表現完全相同。
