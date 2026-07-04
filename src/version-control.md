# Version Control 慣例


## CHANGELOG.md

每次實作完，請先將變更依 feature / bug fix / tweak 分類整理至 `CHANGELOG.md`。

格式以 `## v(semver)` 分隔各版本，最新尚未進版的變更放在最前面的 `## master` section：

    ## master

     - upgrade dependencies


    ## v0.0.2

     - features:
       - add anchor editing feature
     - tweaks:
       - require holding space to drag viewport
     - bug fix:
       - fix typo in variable name


    ## v0.0.1

     - init release


## Commit

被要求 commit 時：

 1. `git diff` 確認目前尚未送交的變更範圍
 2. 摘要整理後更新 `CHANGELOG.md` 的 `## master` section
 3. `git add` 相關檔案後 commit


## Tag / Release

被要求 tag 時：

 1. 查閱最後一次 tag（`git tag --sort=-v:refname | head -1`）
 2. 依本次修改決定 major / minor / patch 升版：
    - patch：bug fix、小 tweak
    - minor：新 feature、較大幅度改動
    - major：破壞性變更、架構重寫
 3. 將 `CHANGELOG.md` 的 `## master` section 改為該版本號（如 `## v0.1.0`）
 4. 選擇以下其中一種方式建立 release：


### 方式 A：手動 git tag

    git add CHANGELOG.md && git commit -m "release vX.Y.Z"
    git tag vX.Y.Z
    git push origin vX.Y.Z

建 GitHub release 需另外在 UI 或 `gh release create` 手動操作。


### 方式 B：fedep publish（推薦，可自動建 GitHub release）

前提：

 - `package.json` 的 `version` 欄位需與 CHANGELOG.md 版本一致
 - `gh` CLI 已安裝並登入（`gh auth login`）
 - 已 commit 所有變更（包含更新後的 CHANGELOG.md 和 `package.json`）

更新 `package.json` version 欄位後：

    git add CHANGELOG.md package.json && git commit -m "release vX.Y.Z"

    # web 專案（無 dist 資料夾）
    npx fedep publish -g --skip-dist

    # 有 dist 的 npm 套件
    npx fedep publish -g

fedep 會自動：

 1. 確保 `release` branch 存在（本地 + 遠端）
 2. 更新 release branch（`git worktree` + push）
 3. 執行 `gh release create vX.Y.Z --notes-file -`，release notes 從 CHANGELOG.md 對應版本 section 讀取

詳細 fedep 文件見：[framework/fedep/index.md](framework/fedep/index.md)


## package.json version 欄位

使用 fedep publish 時，`package.json` 的 `version` 必須對應 CHANGELOG.md 的版本。建議每次 release 前同步更新：

    {
      "version": "0.1.0"
    }
