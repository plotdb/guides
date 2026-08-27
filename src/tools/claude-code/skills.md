# Skill

Skill 是一組打包好的指示，讓某類任務有固定的處理方式。使用者可以用斜線指令呼叫，
模型也會依 `description` 自行判斷何時該用。

一個 skill 是一個目錄，裡面放 `SKILL.md`：

    ---
    name: example-task
    description: 這個 skill 做什麼、什麼情況下該用。
    user-invocable: true
    ---

    # 標題

    要執行的步驟與注意事項。

同目錄可以放其他檔案，載入器只要求 `SKILL.md` 存在。
把相關文件放在旁邊，並在 `SKILL.md` 裡連過去，模型跟著讀得到完整脈絡。


## 目錄不能巢狀

載入器只讀 skill 目錄的直接子項，對每一個找 `<名字>/SKILL.md`，不遞迴。
所以下面這種分層的路徑不會被發現：

    ~/.claude/skills/@company/tools/example/SKILL.md

skill 名稱取自 frontmatter 的 `name:`，沒有才退回目錄名，而且會經過
`[^a-zA-Z0-9_-]` 的過濾，所以 `@` 與 `/` 本來就進不了名稱。

真正的命名空間機制是外掛 (plugin)，呼叫時是 `plugin:skill` 的形式，
但需要 marketplace 與 `plugin.json`。少數幾個 skill 不值得為此建立外掛，
用名稱前綴表達分類即可 —— `terminal-title` 而不是 `title`，
順便降低跟內建或其他來源撞名的機會。


## 支援 symlink

載入時會對路徑做 `realpath`，所以 skill 目錄可以是指向別處的 symlink。
要把 skill 納入版本控制時，可以讓 repo 作為唯一來源，再從 `~/.claude/skills/` 連過去：

    ln -sfn <repo>/skills/<name> ~/.claude/skills/<name>

symlink 的目錄名要跟 `SKILL.md` 裡的 `name:` 一致，那決定了斜線指令怎麼打。

需要注意的是，同樣叫 skill 但透過共享團隊記憶同步的那一種有不同限制，
其中包含不載入 symlink。兩者是不同的載入路徑，不要把限制混為一談。


## 放置範圍

 - `~/.claude/skills/`：所有專案都能用
 - `<專案>/.claude/skills/`：只在該專案內有效

依賴本機環境的 skill (例如需要特定腳本或設定才能運作的) 不適合放進共用的
專案 repo —— 對沒有那些設定的人來說是無效的。這類 skill 留在使用者層級，
repo 裡只保留「怎麼建立這套環境」的文件。

新增或修改 skill 後要重開工作階段才會載入。


## 撰寫 description

`description` 決定模型什麼時候會自己想到用這個 skill，所以要寫進觸發情境，
而不只是描述功能。使用者可能怎麼開口、有哪些同義的說法，都值得列進去。

如果這個 skill 是用來取代某個行不通的內建作法，把那件事寫明。
否則模型會先去試那個內建作法，失敗後才可能找到這裡。
