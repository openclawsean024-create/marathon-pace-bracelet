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
  'negative-split': '負分割',
  'even-pace': '均速',
  'positive-split': '正分割',
};

function getSegmentHighlight(km: number): string {
  if (km <= 5) return 'warmup';
  if (km >= 30 && km <= 35) return 'wall';
  if (km >= 35) return 'sprint';
  if (km === 21.0975) return 'half';
  if (km === 42.195) return 'finish';
  return '';
}

interface WristbandPreviewProps {
  segments: ReturnType<typeof calculateSegments>;
  course: Course;
  targetTime: string;
  strategy: PaceStrategy;
  showQR?: boolean;
}

export function WristbandPreview({ segments, course, targetTime, strategy, showQR = false }: WristbandPreviewProps) {
  const qrUrl = `https://marathon-pace-wristband.vercel.app/?time=${targetTime}&course=${course.id}&strategy=${strategy}`;
  const avgPace = getTargetPace(targetTime, course);

  // Format target time for display
  const [th, tm, ts] = targetTime.split(':').map(Number);
  const totalMin = th * 60 + tm;
  const finishTimeLabel = `${th}:${String(tm).padStart(2, '0')}:${String(ts).padStart(2, '0')}`;

  return (
    <div className="results-panel">
      {/* Results header */}
      <div className="results-headline" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>📋</span> 配速結果
      </div>

      {/* ===== 手環本體（列印對象）===== */}
      <div className="wristband-card" id="wristband-card">

        {/* 手環頂部資訊列 */}
        <div className="wristband-header">
          <div>
            <div className="wristband-title">
              {course.name} · <span className="wristband-title-accent">{STRATEGY_LABELS[strategy]}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
              {course.totalKm}K · D+ {course.totalDPlus}m
            </div>
          </div>
          <div className="wristband-stats">
            <div className="wristband-stat">
              <div className="wristband-stat-value large">{finishTimeLabel}</div>
              <div className="wristband-stat-label">目標完賽</div>
            </div>
            <div className="wristband-stat">
              <div className="wristband-stat-value">{avgPace}</div>
              <div className="wristband-stat-label">平均配速</div>
            </div>
          </div>
        </div>

        {/* 手環本體（水平滾動） */}
        <div className="wristband-scroll-container">
          <div className="wristband-body">
            {segments.map((seg) => {
              const highlight = getSegmentHighlight(seg.km);
              const kmLabel = KM_LABELS[seg.km] ?? `${seg.km}K`;

              return (
                <div
                  key={seg.km}
                  className={`wristband-segment ${highlight ? `highlight-${highlight}` : ''}`}
                >
                  {/* 公里標記 */}
                  <div className="wristband-km">{kmLabel}</div>

                  {/* 配速 — 超大字體 Strava 風格 */}
                  <div className={`wristband-pace ${highlight}`}>
                    {seg.pace.replace('/km', '')}
                  </div>

                  {/* 累計時間 */}
                  <div className="wristband-cumulative">{seg.cumulativeTime}</div>

                  {/* 地點標記 */}
                  {seg.note && (
                    <div className="wristband-note">{seg.note}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 階段提示列 */}
        <div className="stage-bar">
          {[
            {
              icon: '🔥',
              label: '熱身段',
              range: '0–5K',
              tip: '前5K放慢10–20秒/km，別衝太快',
              color: '#F59E0B',
            },
            {
              icon: '⚠️',
              label: '撞牆期',
              range: '30–35K',
              tip: '配速易下滑，保持節奏不放速',
              color: '#FC5200',
            },
            {
              icon: '🏃',
              label: '衝刺段',
              range: '35K–終點',
              tip: '有餘力可加速，注意終點前200m',
              color: '#10B981',
            },
          ].map((stage) => (
            <div key={stage.label} className="stage-card">
              <div className="stage-icon">{stage.icon}</div>
              <div className="stage-label" style={{ color: stage.color }}>{stage.label}</div>
              <div className="stage-range">{stage.range}</div>
              <div className="stage-tip">{stage.tip}</div>
            </div>
          ))}
        </div>

        {/* QR + 賽道資訊 footer */}
        <div className="wristband-footer">
          {showQR && (
            <div className="flex-shrink-0">
              <QRCodeSVG value={qrUrl} size={56} level="M" fgColor="#2D2D2D" bgColor="transparent" />
            </div>
          )}
          <div className="wristband-footer-info">
            <div className="wristband-footer-title">{course.name}</div>
            <div className="wristband-footer-meta">
              D+ {course.totalDPlus}m · {course.totalKm}K · 平均 {avgPace}
            </div>
            {course.specialNotes && course.specialNotes.length > 0 && (
              <div className="wristband-footer-notes">
                {course.specialNotes.join(' · ')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 賽道提示（非列印區域） */}
      <div style={{ marginTop: 16 }} className="no-print">
        <div style={{
          background: 'var(--color-bg-card)',
          borderRadius: 12,
          border: '1px solid var(--color-border)',
          padding: '16px 20px',
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>
            💧 賽道提示
          </div>
          <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            每 5K 補水 · 30K 後補充能量膠 · 注意汐止大同路折返（台北馬）
          </div>
        </div>
      </div>
    </div>
  );
}
