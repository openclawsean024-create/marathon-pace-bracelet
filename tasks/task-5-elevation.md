# Task 5：真實高度圖繪製

## 目標
根據賽道真實高度節點資料，於 PDF 中繪製可讀的高度剖面圖（elevation profile）。

## 詳細規格

### 實作要求

#### 1. 插值演算法
使用線性插值在已知節點之間填充完整 42K 曲線。

```typescript
function interpolateElevation(course: Course, totalPoints = 100): { km: number; elev: number }[] {
  const nodes = course.elevationNodes;
  const result: { km: number; elev: number }[] = [];
  
  for (let i = 0; i < nodes.length - 1; i++) {
    const start = nodes[i];
    const end = nodes[i + 1];
    const steps = Math.ceil((end.km - start.km) / (course.totalKm / totalPoints));
    
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      result.push({
        km: start.km + t * (end.km - start.km),
        elev: start.elevation + t * (end.elevation - start.elevation),
      });
    }
  }
  
  return result;
}
```

#### 2. PDF 高度圖繪製 (`src/lib/pdf-generator.ts` 中實作)

**尺寸：**
- X：15mm → W-15mm（左右裁切線內）
- Y：18mm → 50mm
- 高度：32mm

**元素：**
- 白色底
- 灰色格線（每 5K 一條垂直線）
- 紅色/深色高度曲線（strokeWidth 0.5mm）
- 最高/最低點標註
- D+ / D- 總爬升標註
- 橋樑位置（澎湖 5K/15K/25K/35K）垂直虛線標記

#### 3. 各賽道特徵標記

| 賽道 | 特殊標記 |
|------|---------|
| 台北 | 虹橋高架 1.1K |
| 台中 | 25K後緩上 |
| 宜蘭 | 35K梅花湖丘陵 |
| 澎湖 | 跨海大橋 5K/15K/25K/35K |

#### 4. 比例尺
- X 軸：0K ~ 42K
- Y 軸：自動根據 min/max 調整
- 標註格線：0K, 5K, 10K, 15K, 21.1K, 25K, 30K, 35K, 40K, 42K

## 驗收標準
- [ ] 高度圖曲線平滑（線性插值）
- [ ] 各賽道有對應特殊標記
- [ ] 高度圖嵌入 PDF Page 1 抬頭下方
- [ ] D+ / D- 數值標註正確（與 spec 一致）

## 實作後 Commit
```
git add -A && git commit -m "Task 5: Real elevation profile drawing"
```
