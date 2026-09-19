# 馬拉松配速手環 (PaceBand)

> v3.0.2 fleet 升級 · Sean 2026-09-19
> 從 Vercel deploy artifact 重建 (原 repo 已刪除)

## 線上版

https://marathon-pace-bracelet.vercel.app/

## 什麼是這個

純前端靜態網站:輸入目標時間 → 算每公里 split → 列印成 A4 紙手環。比賽當天戴手腕用。

## 結構

```
marathon-pace-bracelet/
├── PRD/SPEC.md
├── PRD/CHANGELOG.md
├── .github/workflows/ci.yml
├── src/
│   ├── index.html
│   ├── bracelet.html (referenced; original truncated in Vercel)
│   ├── printable.html (referenced; original truncated in Vercel)
│   ├── manifest.webmanifest
│   ├── og-image.svg (referenced; original truncated in Vercel)
│   ├── robots.txt
│   ├── sitemap.xml
│   ├── sw.js (service worker)
│   └── vercel.json
└── README.md
```

## 重建紀錄

- 2026-09-19: 原 repo `openclawsean024-create/marathon-pace-bracelet` 已不存在
- 從 Vercel deployment `dpl_AyFzPhG7DukTQzMg4Jnr535sCigL` (commit 12c3ff5c) 倒推檔案結構
- 重新建立 repo + 補 SPEC + CI workflow
- 5 個完整檔案從 Vercel 還原（robots.txt / sitemap.xml / sw.js / vercel.json / manifest.webmanifest）
- 4 個 HTML/SVG 檔案 Vercel response 被截斷（> 30KB），本 repo 提供簡化重建版

## 規格

詳見 [`PRD/SPEC.md`](./PRD/SPEC.md)
