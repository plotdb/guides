---
name: conversation-summarizer
description: 總結整個對話階段的討論、執行任務和產出成果，生成結構化摘要作為未來對話的引言和交接文檔。當用戶說「請摘要」「總結對話」「summarize」時使用此 skill。
user-invocable: true
---

# Conversation Summarizer

You are tasked with creating a comprehensive summary of the entire conversation session that can serve as a handoff document for future conversations.

## Your Task

Analyze the complete conversation history and create a structured summary that captures:

### 1. 對話概覽 (Conversation Overview)
- 簡要說明這個對話階段的主要目的和背景
- 時間範圍和對話的整體脈絡

### 2. 討論內容 (Discussions)
- 主要討論的主題和問題
- 重要的決策點和選擇的方案
- 技術架構或設計的討論
- 用戶的需求和偏好

### 3. 執行的任務 (Tasks Executed)
按時間順序列出主要執行的任務，包括：
- 創建或修改的文件
- 執行的命令或腳本
- 安裝的依賴或工具
- 配置的設定
- 修復的問題

### 4. 產出成果 (Deliverables)
明確列出這個對話階段的具體產出：
- **代碼產品**: 新功能、模組、或完整應用
- **文檔**: README、指南、或說明文件
- **配置**: 環境設定、部署配置
- **概念學習**: 用戶學到的新知識或技能
- **經驗教訓**: 遇到的陷阱、最佳實踐、注意事項

### 5. 當前狀態 (Current State)
- 項目的當前狀態和進度
- 已完成的功能和待完成的項目
- 已知的問題或技術債
- 代碼庫的關鍵結構和組織方式

### 6. 後續步驟 (Next Steps)
如果用戶有提到未來計劃或後續工作：
- 計劃中的功能或改進
- 需要解決的問題
- 建議的優先順序
- 潛在的挑戰和考慮事項

## Output Format

請使用清晰的中文撰寫摘要，使用 Markdown 格式，包含：
- 適當的標題層級
- 項目符號列表
- 代碼區塊（如有需要）
- 文件路徑引用（使用 `file_path:line_number` 格式）

## Important Guidelines

1. **準確性**: 基於實際對話內容，不要臆測或添加未討論的內容
2. **完整性**: 涵蓋所有重要的討論點和執行任務
3. **簡潔性**: 保持簡潔但信息豐富，避免過度細節
4. **可操作性**: 提供足夠的上下文，讓新的對話能夠無縫接續
5. **結構化**: 使用清晰的結構，便於快速掃描和理解

## File Output Instructions

**CRITICAL**: You MUST save the summary to a file following these steps:

1. **Create directory** (if not exists):
   - Use Bash to create: `mkdir -p context/project/session-summary/`

2. **Generate timestamp**:
   - Format: `yyyymmdd-hhmmss` (e.g., `20260112-143025`)
   - Use Bash command: `date +%Y%m%d-%H%M%S`

3. **Save summary to file**:
   - File path: `context/project/session-summary/{timestamp}.md`
   - Use the Write tool to save the complete summary

4. **Confirm to user**:
   - After saving, inform the user of the exact file path where the summary was saved

## Example Output Structure

```markdown
# 對話摘要：[項目名稱或主題]

## 對話概覽
[簡要說明...]

## 主要討論內容
- 討論了...
- 決定使用...因為...
- ...

## 執行的任務

### 環境設置
- 安裝了...
- 配置了...

### 功能開發
1. 創建 `src/components/Feature.tsx` - 實現...
2. 修改 `src/App.tsx:45` - 添加...

### 問題修復
- 修復了...問題，原因是...

## 產出成果

### 代碼產品
- ✅ 完成了...功能
- ✅ 實現了...模組

### 學習成果
- 理解了...概念
- 掌握了...技術

### 經驗教訓
- ⚠️ 注意...
- 💡 最佳實踐：...

## 當前狀態
- 項目可以正常運行
- 主要功能已實現：[列表]
- 代碼結構：[說明]

## 後續步驟
1. 計劃添加...功能
2. 需要優化...
3. 建議...

---
📅 摘要生成時間：[當前日期]
```

開始分析對話並生成摘要。
