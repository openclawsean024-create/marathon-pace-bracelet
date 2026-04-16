'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from 'recharts';
import type { PaceSegment } from '@/lib/types';
import type { PaceStrategy } from '@/lib/courses';
import { parseTimeToSeconds } from '@/lib/pace-engine';

interface PaceChartProps {
  segments: PaceSegment[];
  targetTime: string;
  strategy: PaceStrategy;
}

// Convert pace string "5:30/km" to seconds per km
function paceToSeconds(paceStr: string): number {
  const match = paceStr.match(/^(\d+):(\d{2})\/km$/);
  if (!match) return 0;
  return parseInt(match[1]) * 60 + parseInt(match[2]);
}

// Format seconds per km to min:sec label
function formatPaceLabel(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

// Custom tooltip
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{value: number; name: string; color: string}>; label?: number }) {
  if (!active || !payload || !payload.length) return null;
  const paceSec = payload[0].value;
  const cumulative = payload[1]?.value ?? 0;
  return (
    <div style={{
      background: '#2D2D2D',
      border: 'none',
      borderRadius: 8,
      padding: '10px 14px',
      fontSize: 13,
      color: '#FFFFFF',
      boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
    }}>
      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
        {label?.toFixed(1)}K
      </div>
      <div style={{ color: '#FC5200', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
        {formatPaceLabel(paceSec)}/km
      </div>
      <div style={{ color: '#94A3B8', fontSize: 12, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
        累計 {Math.floor(cumulative / 3600)}:{String(Math.floor((cumulative % 3600) / 60)).padStart(2, '0')}:{String(Math.round(cumulative % 60)).padStart(2, '0')}
      </div>
    </div>
  );
}

// Phase annotations
const PHASES = [
  { km: 0, label: '起跑', color: '#F59E0B' },
  { km: 5, label: '5K', color: '#94A3B8' },
  { km: 10, label: '10K', color: '#94A3B8' },
  { km: 15, label: '15K', color: '#94A3B8' },
  { km: 16, label: '16K', color: '#94A3B8' },
  { km: 21.0975, label: '半程', color: '#FC5200' },
  { km: 25, label: '25K', color: '#94A3B8' },
  { km: 30, label: '30K', color: '#94A3B8' },
  { km: 35, label: '35K', color: '#94A3B8' },
  { km: 40, label: '40K', color: '#94A3B8' },
  { km: 42.195, label: '終點', color: '#10B981' },
];

export function PaceChart({ segments, targetTime, strategy }: PaceChartProps) {
  // Build chart data
  const chartData = segments.map((seg) => {
    const paceSec = paceToSeconds(seg.pace);
    const [h, m, s] = seg.cumulativeTime.split(':').map(Number);
    const cumulative = h * 3600 + m * 60 + s;
    return {
      km: seg.km,
      pace: paceSec,
      cumulative,
      kmLabel: `${seg.km <= 21.0975 ? seg.km.toFixed(1).replace('.0', '') : seg.km.toFixed(0).replace('.0', '')}${seg.km === 21.0975 ? '半' : seg.km === 42.195 ? '終' : 'K'}`,
    };
  });

  // Average pace (baseline)
  const avgPaceSec = parseTimeToSeconds(targetTime) / 42.195;
  const avgPaceFormatted = formatPaceLabel(avgPaceSec);

  // Strategy-specific phase colors
  const phaseColors: Record<PaceStrategy, string> = {
    'negative-split': '#FC5200',
    'even-pace': '#3B82F6',
    'positive-split': '#10B981',
  };
  const lineColor = phaseColors[strategy];

  // Strava colors
  const stravaOrange = '#FC5200';

  // Determine Y domain for pace axis (invert — slower pace = higher value)
  // Typical marathon pace range: 4:00/km to 6:30/km
  const minPace = Math.min(...chartData.map(d => d.pace)) * 0.98;
  const maxPace = Math.max(...chartData.map(d => d.pace)) * 1.02;

  // Build tick values for X axis
  const xTicks = [0, 5, 10, 15, 16, 21.0975, 25, 30, 35, 40, 42.195].filter(
    (v) => v >= 0 && v <= 42.195
  );

  return (
    <div className="pace-chart-wrapper">
      {/* Chart header */}
      <div className="pace-chart-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>📈</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            配速曲線
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 16, height: 3, background: lineColor, borderRadius: 2 }} />
            <span style={{ color: 'var(--color-text-muted)' }}>配速</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 16, height: 1, background: '#94A3B8', borderRadius: 1, borderTop: '2px dashed #94A3B8' }} />
            <span style={{ color: 'var(--color-text-muted)' }}>平均 {avgPaceFormatted}/km</span>
          </div>
        </div>
      </div>

      {/* Strava-style chart */}
      <div style={{ height: 260, padding: '0 4px 0 8px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 12, right: 16, left: 8, bottom: 4 }}
          >
            <defs>
              <linearGradient id="paceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={lineColor} stopOpacity={0.25} />
                <stop offset="100%" stopColor={lineColor} stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border)"
              vertical={false}
            />
            {/* Vertical reference lines at key km */}
            {xTicks.map((tick) => (
              <ReferenceLine
                key={tick}
                x={tick}
                stroke="var(--color-border)"
                strokeWidth={tick === 21.0975 || tick === 42.195 ? 1.5 : 0.5}
                strokeDasharray={tick === 21.0975 || tick === 42.195 ? undefined : '3 3'}
              />
            ))}
            <XAxis
              dataKey="km"
              ticks={xTicks}
              tickFormatter={(v) => {
                if (v === 0) return '起點';
                if (v === 21.0975) return '半程';
                if (v === 42.195) return '終點';
                return `${v}K`;
              }}
              tick={{ fontSize: 11, fill: 'var(--color-text-muted)', fontWeight: 600 }}
              axisLine={{ stroke: 'var(--color-border)' }}
              tickLine={false}
              interval={0}
            />
            <YAxis
              domain={[minPace, maxPace]}
              tickFormatter={(v) => formatPaceLabel(v)}
              tick={{ fontSize: 11, fill: 'var(--color-text-muted)', fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              width={52}
              reversed
              tickCount={6}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: stravaOrange, strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            {/* Average pace reference line */}
            <ReferenceLine
              y={avgPaceSec}
              stroke="#94A3B8"
              strokeWidth={1.5}
              strokeDasharray="5 3"
              label={{
                value: `avg ${avgPaceFormatted}`,
                position: 'right',
                fontSize: 10,
                fill: '#94A3B8',
                fontWeight: 600,
              }}
            />
            {/* Area fill */}
            <Area
              type="monotone"
              dataKey="pace"
              stroke={lineColor}
              strokeWidth={2.5}
              fill="url(#paceGradient)"
              dot={{ r: 4, fill: lineColor, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: lineColor, stroke: '#FFFFFF', strokeWidth: 2 }}
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* X-axis km marker strip */}
      <div style={{
        display: 'flex',
        gap: 0,
        padding: '0 12px 0 16px',
        marginTop: -4,
        height: 20,
      }}>
        {xTicks.map((tick) => (
          <div
            key={tick}
            style={{
              flex: 1,
              textAlign: 'center',
              fontSize: 9,
              color: tick === 21.0975 ? stravaOrange : 'var(--color-text-muted)',
              fontWeight: tick === 21.0975 || tick === 42.195 ? 700 : 400,
            }}
          >
            {tick === 0 ? '起' : tick === 21.0975 ? '半' : tick === 42.195 ? '終' : `${tick}`}
          </div>
        ))}
      </div>
    </div>
  );
}