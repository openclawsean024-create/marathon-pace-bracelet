'use client';

import type { Course, PaceStrategy } from '@/lib/courses';
import { calculateSegments, getTargetPace } from '@/lib/pace-engine';
import { QRCodeSVG } from 'qrcode.react';

const KM_LABELS: Record<number, string> = {
  5: '5K',
  10: '10K',
  15: '15K',
  16: '16K',
  21.0975: '半程',
  25: '25K',
  30: '30K',
  35: '35K',
  40: '40K',
  42.195: '終點',
};

const STRATEGY_LABELS: Record<PaceStrategy, string> = {
  'negative-split': '負分段',
  'even-pace': '均速配速',
  'safe-start': '保守起步',
};

interface WristbandPreviewProps {
  segments: ReturnType<typeof calculateSegments>;
  course: Course;
  targetTime: string;
  strategy: PaceStrategy;
}

export function WristbandPreview({ segments, course, targetTime, strategy }: WristbandPreviewProps) {
  const qrUrl = `https://marathon-pace-next.vercel.app/?time=${targetTime}&course=${course.id}&strategy=${strategy}`;

  return (
    <div className="space-y-4">
      {/* 預覽標題 */}
      <div className="no-print">
        <h3 className="text-xl font-bold text-white">📖 即時預覽</h3>
        <p className="text-slate-400 text-sm">即時更新 · 最終品質以 PDF 為準</p>
      </div>

      {/* ===== 手環本體（列印對象）===== */}
      <div
        className="overflow-x-auto"
        style={{ backgroundColor: '#1a1a2e', borderRadius: '1rem' }}
      >
        <div className="flex min-w-[640px]" style={{ backgroundColor: '#1a1a2e' }}>
          {segments.map((seg, i) => {
            const kmLabel = KM_LABELS[seg.km] ?? `${seg.km}K`;
            const isHalf = seg.km === 21.0975;
            const isFinish = seg.km === 42.195;

            return (
              <div
                key={seg.km}
                className="flex-1 flex flex-col items-center justify-center py-5 px-1 border-r border-white/10 last:border-r-0"
                style={{
                  minWidth: 0,
                  borderTop: isHalf ? '3px solid #e94560' : undefined,
                  borderBottom: isFinish ? '3px solid #4ade80' : undefined,
                }}
              >
                {/* 公里標籤 */}
                <span className="text-white/40 text-xs mb-1 truncate w-full text-center">{kmLabel}</span>

                {/* 配速 */}
                <span className="text-white font-bold text-sm leading-tight">
                  {seg.pace.replace('/km', '')}
                </span>

                {/* 累計時間 */}
                <span className="text-white/60 text-xs mt-1">{seg.cumulativeTime}</span>

                {/* 地點標記 */}
                {seg.note && (
                  <span
                    className="text-xs mt-1 truncate w-full text-center px-1"
                    style={{ color: '#e94560' }}
                  >
                    {seg.note}
                  </span>
                )}
              </div>
            );
          })}

          {/* 策略欄 */}
          <div className="flex-1 flex flex-col items-center justify-center py-5 px-2 border-l border-white/10">
            <span className="text-white/40 text-xs mb-1">策略</span>
            <span className="text-white font-bold text-sm text-center">
              {STRATEGY_LABELS[strategy]}
            </span>
            <span className="text-white/60 text-xs mt-1">目標</span>
            <span className="text-white/80 text-xs">{targetTime}</span>
          </div>
        </div>
      </div>

      {/* QR Code row */}
      <div
        className="flex items-center gap-4 p-4 rounded-xl"
        style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
      >
        <div className="flex-shrink-0">
          <QRCodeSVG value={qrUrl} size={56} level="M" fgColor="#ffffff" bgColor="transparent" />
        </div>
        <div>
          <div className="text-white font-bold">{course.name}</div>
          <div className="text-white/50 text-sm">
            D+ {course.totalDPlus}m · {course.totalKm}K · 平均 {getTargetPace(targetTime, course)}
          </div>
          {course.specialNotes && course.specialNotes.length > 0 && (
            <div className="text-white/40 text-xs mt-1">
              {course.specialNotes.join(' · ')}
            </div>
          )}
        </div>
      </div>

      {/* 賽道補給提示 */}
      <div
        className="rounded-xl p-4 text-sm"
        style={{ backgroundColor: 'rgba(233,69,96,0.15)', border: '1px solid rgba(233,69,96,0.3)' }}
      >
        <div className="text-white font-semibold mb-1">💧 賽道提示</div>
        <div className="text-white/70 text-xs leading-relaxed">
          每 5K 補水 · 30K 後補充能量膠 · 注意汐止大同路折返（台北馬）
        </div>
      </div>

      {/* 熱身 / 撞牆 / 衝刺 階段提示 */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: '🔥 熱身段', range: '0–5K', tip: '放慢 10–20 秒/km，別衝太快', color: '#f59e0b' },
          { label: '⚠️ 撞牆期', range: '30–35K', tip: '配速易下滑，保持節奏不放速', color: '#e94560' },
          { label: '🏃 衝刺段', range: '35K–終點', tip: '有餘力可加速，注意終點前200m', color: '#4ade80' },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl p-3 text-center"
            style={{ backgroundColor: `${item.color}20`, border: `1px solid ${item.color}60` }}
          >
            <div className="text-white font-bold text-xs">{item.label}</div>
            <div className="text-white/60 text-xs mt-1">{item.range}</div>
            <div className="text-white/40 text-xs mt-1 leading-tight">{item.tip}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
