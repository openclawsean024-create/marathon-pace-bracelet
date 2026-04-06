# Task 2：配速計算引擎

## 目標
建立配速計算邏輯，輸入目標時間與策略，輸出完整分段表。

## 詳細規格

### 1. 建立 `src/lib/pace-engine.ts`

#### 1.1 輔助函式
```typescript
// 秒數 → HH:MM:SS 格式
function formatTime(totalSeconds: number): string { ... }

// 秒數 → MM:SS 格式（配速用）
function formatPace(secondsPerKm: number): string { ... }

// 解析 "HH:MM:SS" → 總秒數
function parseTime(timeStr: string): number { ... }
```

#### 1.2 計算每公里配速（秒數）
```typescript
function calcPacePerKm(targetSeconds: number, totalKm: number, strategy: PaceStrategy): {
  firstHalfPace: number;  // 前半每公里秒數
  secondHalfPace: number; // 後半每公里秒數
  warmupPace: number;    // 前5K暖身配速（+10秒）
  kickPace: number;      // 30K+衝刺配速（-10秒）
}
```

**Negative Split 策略：**
- `firstHalfPace = (targetSeconds / totalKm) * 1.015`（慢1.5%）
- `secondHalfPace = (targetSeconds / totalKm) * 0.985`（快1.5%）

**Even Pace 策略：**
- `firstHalfPace = secondHalfPace = targetSeconds / totalKm`

**Safe Start + Negative Split 策略：**
- `warmupPace = (targetSeconds / totalKm) + 10`（前5K慢10秒/km）
- `firstHalfPace = targetSeconds / totalKm`（5-21K）
- `kickPace = (targetSeconds / totalKm) - 10`（30K+快10秒/km）

#### 1.3 生成分段表
```typescript
import { PaceSegment, WristbandConfig } from './types';

const CHECKPOINT_KMS = [5, 10, 15, 21.0975, 25, 30, 35, 40, 42.195];

function calculateSegments(config: WristbandConfig): PaceSegment[] {
  const { targetTime, course, strategy } = config;
  const targetSeconds = parseTime(targetTime);
  const km = course.totalKm;
  
  // 計算各段配速
  const paces = calcPacePerKm(targetSeconds, km, strategy);
  
  const segments: PaceSegment[] = [];
  let prevKm = 0;
  let prevTime = 0;
  
  for (const ck of CHECKPOINT_KMS) {
    const kmDelta = ck - prevKm;
    let paceForThisSegment: number;
    
    if (ck <= 5) {
      paceForThisSegment = paces.warmupPace ?? paces.firstHalfPace;
    } else if (ck <= 21.0975) {
      paceForThisSegment = paces.firstHalfPace;
    } else {
      paceForThisSegment = paces.kickPace ?? paces.secondHalfPace;
    }
    
    const splitSeconds = Math.round(kmDelta * paceForThisSegment);
    const cumulativeSeconds = prevTime + splitSeconds;
    
    // 找對應高度
    const elevNode = course.elevationNodes.reduce((prev, curr) => 
      Math.abs(curr.km - ck) < Math.abs(prev.km - ck) ? curr : prev
    );
    
    // 特殊標記
    let note = '';
    if (Math.abs(ck - 21.0975) < 0.1) note = '🏁 半程';
    if (ck >= 30 && ck <= 35) note = '⚠️ 撞牆期';
    if (course.id === 'penghu' && [5, 15, 25, 35].includes(Math.round(ck))) note = '🌉 橋樑';
    if (course.id === 'taipei' && Math.abs(ck - 1.1) < 0.2) note = '🌉 虹橋高架';
    
    segments.push({
      km: ck,
      cumulativeTime: formatTime(cumulativeSeconds),
      splitTime: formatTime(splitSeconds),
      pace: formatPace(paceForThisSegment),
      elevation: elevNode?.elevation,
      note,
    });
    
    prevKm = ck;
    prevTime = cumulativeSeconds;
  }
  
  return segments;
}
```

## 驗收標準
- [ ] `calculateSegments` 輸出 9 筆分段資料（5K~42.195K）
- [ ] 目標 4:00:00 + Negative Split：前半 ~5:46/km，後半 ~5:36/km
- [ ] 時間格式輸出為 "HH:MM:SS" 或 "MM:SS"
- [ ] 撞牆期標記（30-35K）、橋樑標記（澎湖）、虹橋標記（台北）正確
- [ ] `parseTime` 與 `formatTime` 雙向正確

## 實作後 Commit
```
git add -A && git commit -m "Task 2: Pace calculation engine"
```
