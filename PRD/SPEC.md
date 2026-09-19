# 馬拉松配速手環 (PaceBand) — PRD v3.0.2 等級規格書

> 建立日期:2026-09-19 · Sean 從 Vercel deploy artifact 重建

## §1 產品概述

### 1.1 問題陳述
跑馬拉松時,選手要記住每公里的配速時間。A4 列印紙手環是把配速表 (Goal Time / Pace Band) 列印在手腕,比賽當天不用手機也能即時看到目標時間。

### 1.2 目標使用者
- **Primary — 全馬 / 半馬選手**:目標 4-6 小時完賽,要看到 5K / 10K / 15K / 20K / 21K / 25K / 30K / 35K / 40K / 42K 的 split time
- **Secondary — 初馬 / 健跑**:目標 6-7 小時,簡化版即可

### 1.3 核心價值主張
> 印一張 A4 → 戴上手腕 → 比賽當天不用滑手機也能看到 split time。

### 1.4 Non-Goals
- ❌ 運動手錶 / 穿戴裝置
- ❌ GPS 即時追蹤
- ❌ 報名 / 賽事管理
- ❌ 多語 (僅繁中)

---

## §2 主要場景

| 場景 | 輸入 | 輸出 | 成功條件 |
|---|---|---|---|
| 設定目標時間 | 總時間 (4:00:00) | 每公里 split | formatTime H:MM:SS 格式 |
| 列印紙手環 | 一頁 A4 | 一張 bracelet.html 可列印 | 210mm × 297mm |
| 預覽 | 一頁 / 列印 | 雙模式頁面 | 美觀可讀 |

---

## §3 FR

- FR-001: 目標時間輸入 (HH:MM:SS)
- FR-002: 計算每公里 split time (Garmin / Strava 格式)
- FR-003: A4 列印專用 bracelet.html (1 頁)
- FR-004: 預覽頁 (mobile / desktop responsive)
- FR-005: PWA (service worker 離線可用)
- FR-006: SEO (sitemap.xml + robots.txt + manifest)

## §4 NFR

- 載入 < 1s
- 離線可開
- formatTime 永遠 H:MM:SS (Garmin / Strava convention)

## §5 技術棧

- 純靜態 HTML + CSS (無 build step)
- Service Worker (offline-first PWA)
- vercel.json 設定 cache headers

## §6 DoD

- [x] FR 全部通過
- [x] A4 列印版面 210mm × 297mm
- [x] PWA manifest + sw.js
- [x] sitemap.xml + robots.txt
- [x] Vercel deploy READY

## §7 Non-Goals

- ❌ 運動手錶
- ❌ GPS 追蹤
- ❌ 多語

---

## §8 重建備註 (2026-09-19)

本 repo 從 Vercel deploy artifact 重建:
- 原本 repo `openclawsean024-create/marathon-pace-bracelet` 已不存在
- Vercel project `prj_IZGiHcWkFLD11HjuIrbkxvJ5Dskv` 仍有 3 個 production deployments
- 最新 deploy SHA `12c3ff5cc720550da185796b394bab3c9429b2fd` (feat: dedicated bracelet.html for 1-page A4 cuttable print)
- 本 SPEC 為從 Vercel deployment 倒推重建 + SPEC v3.0.2 結構
