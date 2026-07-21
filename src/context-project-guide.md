# Context 目錄結構指南

定義 `context/` 目錄下各子目錄的用途與使用方式。


## context/shared

共用上下文資訊，由外部 repo 匯入，通常以 symlink 方式建立。

若需調整其中的原則，應找來源 repo 修改，並可先與 user 確認。


## context/project

存放專案相關資訊，結構如下：

 - `index.md` — 基本資訊與 quick guide 摘要
 - `spec.md` — 定義預計系統的規格與設計
 - `features.md` — 說明目前系統已有的機制與功能
 - `logs/` — 工作記錄，以 `yyyymmdd-<brief>.md` 命名

若 `spec.md` 或 `features.md` 內容較多，可分別延伸為 `spec/` 或 `features/` 資料夾，但需在對應的 md 檔中說明其結構。

其它檔案可視專案需求自行規劃。


## context/cached

存放暫時性檔案，例如臨時呈現資料或說明用的 HTML 等。

`context/cached` 預設不進 git，建議在 `.gitignore` 加入：

    context/cached
