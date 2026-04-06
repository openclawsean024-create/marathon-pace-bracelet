# Task 6：QR Code 模組

## 目標
在 PDF 背面嵌入 QR Code，連結至可分享的線上配速頁面。

## 詳細規格

### 1. 安裝 qrcode
```bash
npm install qrcode
npm install -D @types/qrcode
```

### 2. 建立 `src/lib/qrcode.ts`

```typescript
import QRCode from 'qrcode';

export async function generateQRDataURL(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    width: 200,
    margin: 1,
    color: {
      dark: '#1a1a2e',
      light: '#ffffff',
    },
  });
}

export function buildPaceShareURL(config: WristbandConfig): string {
  const base = typeof window !== 'undefined' ? window.location.origin : 'https://pace.example.com';
  const params = new URLSearchParams({
    time: config.targetTime,
    course: config.course.id,
    strategy: config.strategy,
  });
  return `${base}?${params.toString()}`;
}
```

### 3. 在 PDF 背面嵌入 QR Code

於 `src/lib/pdf-generator.ts` 的 Page 2 中，於右下角加入：
- QR Code 圖片（40mm × 40mm）
- 標文字：「掃描查看線上版」

## 驗收標準
- [ ] QR Code 正確嵌入 PDF Page 2
- [ ] QR Code 可被手機掃描
- [ ] 連結可帶參數（目標時間、賽道、策略）

## 實作後 Commit
```
git add -A && git commit -m "Task 6: QR Code module"
```
