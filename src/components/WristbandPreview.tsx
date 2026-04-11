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
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="inline-block w-2 h-6 rounded-full" style={{ background: 'linear-gradient(180deg, #e94560, #ff6b6b)' }} />
          即時預覽
        </h3>
        <p className="text-slate-400 text-sm mt-1">即時更新 · 最終品質以 PDF 為準</p>
      </div>

      {/* ===== 手環本體框架（列印對象）===== */}
      <div
        className="rounded-2xl overflow-hidden relative"
        style={{
          background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%)',
          boxShadow: '0 0 40px rgba(233,69,96,0.2), 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
          border: '1px solid rgba(233,69,96,0.4)',
        }}
      >
        {/* 頂部光澤線 */}
        <div style={{ height: '3px', background: 'linear-gradient(90deg, #e94560, #ff6b6b, #e94560)' }} />

        <div className="flex min-w-[640px]" style={{ backgroundColor: '#1a1a2e' }}>
          {segments.map((seg, i) => {
            const kmLabel = KM_LABELS[seg.km] ?? `${seg.km}K`;
            const isHalf = seg.km === 21.0975;
            const isFinish = seg.km === 42.195;
            const isWall = seg.km >= 30 && seg.km <= 35;

            return (
              <div
                key={seg.km}
                className="flex-1 flex flex-col items-center justify-center py-5 px-1 border-r border-white/10 last:border-r-0"
                style={{
                  minWidth: 0,
                  borderTop: isHalf ? '3px solid #e94560' : isFinish ? '3px solid #4ade80' : isWall ? '2px solid #f59e0b' : undefined,
                  borderBottom: isFinish ? '3px solid #4ade80' : undefined,
                  background: isWall ? 'rgba(245,158,11,0.08)' : undefined,
                }}
              >
                {/* 公里標籤 */}
                <span className="text-white/50 text-xs mb-1 truncate w-full text-center font-medium">{kmLabel}</span>

                {/* 配速 */}
                <span
                  className="font-bold text-sm leading-tight"
                  style={{
                    color: isWall ? '#f59e0b' : isHalf ? '#e94560' : isFinish ? '#4ade80' : '#ffffff',
                    textShadow: isWall ? '0 0 8px rgba(245,158,11,0.5)' : isHalf ? '0 0 8px rgba(233,69,96,0.5)' : isFinish ? '0 0 8px rgba(74,222,128,0.5)' : 'none',
                  }}
                >
                  {seg.pace.replace('/km', '')}
                </span>

                {/* 累計時間 */}
                <span className="text-white/60 text-xs mt-1">{seg.cumulativeTime}</span>

                {/* 地點標記 */}
                {seg.note && (
                  <span
                    className="text-xs mt-1 truncate w-full text-center px-1 font-medium"
                    style={{ color: '#e94560' }}
                  >
                    {seg.note}
                  </span>
                )}
              </div>
            );
          })}

          {/* 策略欄 */}
          <div
            className="flex-1 flex flex-col items-center justify-center py-5 px-2 border-l border-white/10"
            style={{ background: 'rgba(233,69,96,0.08)' }}
          >
            <span className="text-white/50 text-xs mb-1 font-medium">策略</span>
            <span
              className="font-bold text-sm text-center"
              style={{ color: '#e94560', textShadow: '0 0 8px rgba(233,69,96,0.4)' }}
            >
              {STRATEGY_LABELS[strategy]}
            </span>
            <span className="text-white/60 text-xs mt-1">目標</span>
            <span className="text-white/80 text-xs font-bold">{targetTime}</span>
          </div>
        </div>

        {/* 底部光澤線 */}
        <div style={{ height: '2px', background: 'linear-gradient(90deg, transparent, rgba(233,69,96,0.6), transparent)' }} />
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

      {/* 賽道提示：降低視覺權重 */}
      <div
        className="rounded-xl p-4 text-sm"
        style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="text-white/60 font-semibold mb-1 text-xs">💧 賽道提示</div>
        <div className="text-white/40 text-xs leading-relaxed">
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
            style={{ backgroundColor: `${item.color}15`, border: `1px solid ${item.color}40` }}
          >
            <div className="text-white font-bold text-xs">{item.label}</div>
            <div className="text-white/50 text-xs mt-1">{item.range}</div>
            <div className="text-white/35 text-xs mt-1 leading-tight">{item.tip}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
