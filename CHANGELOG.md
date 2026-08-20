# Change Logs

## master

 - 新增 `framework/ldcover` 指南：get / set / cancel 的取值模式（`set` 沒有對應事件，
   取值只能 await `get()`）、`data` 事件傳入資料、`resident` / `inPlace` / `container`
   的 DOM 生命週期與判斷準則（疊加由 `autoZ` / `zmgr` 處理，`inPlace: false` 是給
   root 被祖先困住的情況，巢狀 cover 為常見案例）、z-index 管理、常用選項與事件
 - servebase: 更新 stop/restart, 補 log / service / cachestamp（見 76ee429，補記）


## v0.3.1

 - update fedep guide: add "發布組合與安裝端效果" section — npm vs github release vs no-dist publish combinations and their consumer-side effects (`#master` vs `#release` / tag)
 - update @plotdb/block guide:
   - add "Block 檔案格式" section: html-based definition, auto-scoped style with `:scope` for root, shared `this` across init/interface, headless mode
   - fix `parent` description: it is the parent factory object; call `parent.interface!` to get the parent API
   - expand manager notes: registry function, `from()` returns `{instance, interface}` and does not forward data, `create({data, root})` behavior
 - update preference-and-hints folder for frontend-techstacks hint
 - try to add subfolder rules in context-project-guide
 - context-project-guide: generalize subfolder rules — status subfolders (done/hold/drop) and year-based archive apply to all subdirs (logs/, tasks/, ...); order is status first, then year (e.g. tasks/done/2025/0101-foo.md)


## v0.3.0

 - rename src/*.md with numeric prefixes for ordered reference (breaking: 舊檔名引用需更新)：
   - `context-project-guide.md` → `1.context-project-guide.md`
   - `fedev.md` → `2.fedev.md`
   - `version-control.md` → `3.version-control.md`
   - `md-style-guide.md` → `4.md-style-guide.md`
   - `tool-guide.md` → `5.tool-guide.md`
   - `docker-environment.md` → `6.docker-environment.md`
   - `js-coding-guide.md` → `7.js-coding-guide.md`
   - `stylus-style-guide.md` → `8.stylus-style-guide.md`
   - `lsc-coding-guide.md` → `9.lsc-coding-guide.md`


## v0.2.0

 - init -g: use ~/.context/@plotdb/guides instead of npm global root; auto-clone if not found
 - add npm run link to symlink current repo to ~/.context/@plotdb/guides


## v0.1.1

 - add tool-guide.md: node version management, n → volta migration


## v0.1.0

 - rewrite cli.js init: add -g/--global mode, auto-update .gitignore, create context/index.json, fix/repair symlink handling
 - add context/project to repo


## v0.0.5

 - add context-project-guide.md


## v0.0.4

 - add version-control.md
 - consolidate fedep docs from `@plotdb/fedep` to `framework/fedep`
 - follow md-style-guide in fedep and version-control docs


## v0.0.3

 - fix path issue when initing


## v0.0.2

 - use relative instead of absolute path to build symlink from context/shared to `node_modules`


## v0.0.1

 - init release
