# Task 4：手環 PDF 版型產生器

## 目標
產生 A4 橫式 PDF，包含手環正面（配速分段）、背面（補給提醒）、裁切線。

## 詳細規格

### 1. 安裝 jsPDF
```bash
npm install jspdf
```

### 2. 建立 `src/lib/pdf-generator.ts`

#### 2.1 手環尺寸（公制 mm，A4 landscape）
```
A4 寬度：297mm
可用於手環：~250mm（左右各留 20mm 裁切線）
手環格子數：10 格（5K, 10K, 15K, 半程, 25K, 30K, 35K, 40K, 42.2K, 策略/提示）
每格寬度：250/10 = 25mm
手環高度：20mm
```

#### 2.2 PDF 結構（兩頁）
**Page 1：正面（主要配速資訊）**
```
抬頭列：「目標 4:00:00 | 台北馬拉松 | 負分段策略」
高度圖（迷你 elevation chart，120px 高）
分段表格（10 格，含里程/分段時間/累積時間/配速）
```

**Page 2：背面（補給提醒）**
```
補給時間表
賽道特殊標記（橋樑位置等）
QR Code（如啟用）
```

#### 2.3 核心實作

```typescript
import jsPDF from 'jspdf';

export async function generateWristbandPDF(config: WristbandConfig): Promise<void> {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  
  const W = 297; // A4 寬度 mm
  const H = 210; // A4 高度 mm
  
  // 顏色設定
  const BG_COLOR = '#ffffff';
  const TEXT_COLOR = '#1a1a2e';
  const ACCENT_COLOR = '#e94560';
  const LIGHT_BG = '#f8f9fa';
  const BORDER_COLOR = '#dee2e6';
  
  // ====== PAGE 1: 正面 ======
  doc.setFillColor(...hexToRgb(BG_COLOR));
  doc.rect(0, 0, W, H, 'F');
  
  // 抬頭列
  const title = `${config.course.name} | 目標 ${config.targetTime} | ${strategyLabel(config.strategy)}`;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...hexToRgb(TEXT_COLOR));
  doc.text(title, W / 2, 12, { align: 'center' });
  
  // 裁切線（左右邊緣）
  doc.setDrawColor(...hexToRgb(BORDER_COLOR));
  doc.setLineDashPattern([2, 2], 0);
  doc.line(15, 0, 15, H);
  doc.line(W - 15, 0, W - 15, H);
  
  // 高度圖（Canvas → base64 → 嵌入 PDF）
  // 使用 Canvas 2D API 繪製高度 profile
  // 規格：x=15~W-15, y=18~50
  
  // 手環分段表
  // y 起始 = 55, 每格高 20mm
  
  // ====== PAGE 2: 背面 ======
  doc.addPage();
  doc.setFillColor(...hexToRgb(BG_COLOR));
  doc.rect(0, 0, W, H, 'F');
  
  // 補給提醒內容
  // ...
}

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function strategyLabel(strategy: PaceStrategy): string {
  return { 'negative-split': '負分段', 'even-pace': '均速配速', 'safe-start': '保守起步' }[strategy];
}
```

#### 2.4 高度圖繪製邏輯

使用 jsPDF 的內建繪圖功能，根據 `course.elevationNodes` 插值：

```typescript
function drawElevationChart(doc: jsPDF, course: Course, x: number, y: number, w: number, h: number) {
  const nodes = course.elevationNodes;
  const minElev = Math.min(...nodes.map(n => n.elevation)) - 5;
  const maxElev = Math.max(...nodes.map(n => n.elevation)) + 5;
  
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.3);
  
  // 繪製折線
  nodes.forEach((node, i) => {
    const px = x + (node.km / course.totalKm) * w;
    const py = y + h - ((node.elevation - minElev) / (maxElev - minElev)) * h;
    if (i === 0) {
      doc.moveTo(px, py);
    } else {
      doc.line(px, py);
    }
  });
  doc.stroke();
  
  // 標註關鍵節點
  doc.setFontSize(6);
  nodes.forEach((node) => {
    const px = x + (node.km / course.totalKm) * w;
    const py = y + h - ((node.elevation - minElev) / (maxElev - minElev)) * h;
    doc.text(`${node.km}K`, px, py - 1, { align: 'center' });
  });
}
```

#### 2.5 手環格狀表格

每格配置：
```
┌─────────────────────────────────────────────────────────────────────┐
│  5K     │  10K    │  15K    │  半程   │  25K    │  30K    │ ... │
│ +28:25  │ +28:25  │ +28:25  │ +28:25  │ +28:25  │ +28:25  │     │
│ 0:28:25 │ 0:56:50 │ 1:25:15 │ 1:59:30 │ 2:23:05 │ 2:51:30 │     │
│ 5:41/km │ 5:41/km │ 5:41/km │ 5:41/km │ 5:41/km │ 5:41/km │     │
└─────────────────────────────────────────────────────────────────────┘
```

每格內：
- 里程（10pt粗體）
- 分段時間（7pt）
- 累積時間（8pt）
- 配速（7pt）
- 特殊標記（8pt emoji 或紅色警告）

## 驗收標準
- [ ] PDF 為 A4 橫式
- [ ] 包含裁切線（左右 15mm）
- [ ] Page 1：抬頭 + 高度圖 + 10格分段表
- [ ] Page 2：補給提醒 + QR Code（如啟用）
- [ ] `generateWristbandPDF()` 觸發瀏覽器下載
- [ ] PDF 可用標準印表機直接列印

## 實作後 Commit
```
git add -A && git commit -m "Task 4: PDF wristband generator"
```
