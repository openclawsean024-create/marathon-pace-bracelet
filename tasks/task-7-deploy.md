# Task 7：Vercel 部署 + 驗收

## 目標
將完成的 Next.js App 部署至 Vercel，並通知 Sophia 驗收。

## 部署步驟

### 1. 安裝 Vercel CLI（如需要）
```bash
npm install -g vercel
```

### 2. 登入並部署
```bash
cd /home/sean/.openclaw/workspace/workspaces/alan/marathon-pace-wristband
vercel --prod
```

### 3. 設定環境變數（如需要）
```bash
vercel env add NEXT_PUBLIC_BASE_URL
```

### 4. 驗證部署
- 確認首頁可存取
- 測試 PDF 下載功能
- 確認各賽道/策略/時間組合正確

## 通知 Sophia 驗收

使用 `agentToAgent(to: "sophia", message: <驗收請求>)` 格式：

```markdown
# 驗收任務：馬拉松配速手環產生器

## 部署 URL
https://[project].vercel.app

## 變更摘要
- ✅ 配速計算引擎（負分段/均速/保守起步）
- ✅ 4種賽道（台北/台中/宜蘭/澎湖）含真實高度圖
- ✅ A4 PDF 手環下載（正面配速+背面補給）
- ✅ QR Code 模組（可選）
- ✅ 3種完賽時間（3:30/4:00/4:30/5:00）

## 測試方法
1. 選擇「目標時間」+「賽道」+「配速策略」
2. 點擊「下載 PDF」按鈕
3. 確認 PDF 內容正確

## Screenshot
[嵌入截圖]

## 等待 Sophia 驗收結果
```

## 失敗時通知 Dva

如有任何問題：
```
agentToAgent(to: "dva", message: <blocked_by_error 說明>)
```

## 實作後 Commit
```
git add -A && git commit -m "Task 7: Deploy to Vercel"
git push origin main
```
