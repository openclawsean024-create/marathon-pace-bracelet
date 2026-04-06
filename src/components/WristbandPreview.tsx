import { Course, PaceStrategy } from '@/lib/courses';
import { PaceSegment } from '@/lib/types';

interface WristbandPreviewProps {
  segments: PaceSegment[];
  course: Course;
  targetTime: string;
  strategy: PaceStrategy;
}

const KM_LABELS = ['5K', '10K', '15K', '半程', '25K', '30K', '35K', '40K', '42.2K'];

const STRATEGY_LABELS: Record<PaceStrategy, string> = {
  'negative-split': '負分段',
  'even-pace': '均速配速',
  'safe-start': '保守起步',
};

export function WristbandPreview({ segments, course, targetTime, strategy }: WristbandPreviewProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">📖 預覽</h2>
      <p className="text-slate-400 text-sm">即時預覽 · 最終品質以 PDF 為準</p>

      {/* Wristband preview */}
      <div className="overflow-x-auto">
        <div
          className="flex min-w-[600px] rounded-2xl overflow-hidden"
          style={{ backgroundColor: '#1a1a2e' }}
        >
          {segments.map((seg, i) => (
            <div
              key={seg.km}
              className="flex-1 flex flex-col items-center justify-center py-4 px-1 border-r border-white/10 last:border-r-0"
            >
              <span className="text-white/50 text-xs mb-1">{KM_LABELS[i]}</span>
              <span className="text-white font-bold text-sm">{seg.km}K</span>
              <span className="text-white/80 text-xs mt-1">{seg.pace}</span>
              <span className="text-white/60 text-xs">{seg.cumulativeTime}</span>
              {seg.note && (
                <span
                  className="text-xs mt-1"
                  style={{ color: 'var(--color-accent)' }}
                >
                  {seg.note}
                </span>
              )}
            </div>
          ))}
          {/* Strategy column */}
          <div className="flex-1 flex flex-col items-center justify-center py-4 px-2 border-l border-white/10">
            <span className="text-white/50 text-xs mb-1">策略</span>
            <span className="text-white font-bold text-sm text-center">
              {STRATEGY_LABELS[strategy]}
            </span>
            <span className="text-white/60 text-xs mt-1">目標</span>
            <span className="text-white/80 text-xs">{targetTime}</span>
          </div>
        </div>
      </div>

      {/* Course info */}
      <div className="bg-white/10 rounded-xl p-4 text-white text-sm">
        <div className="font-bold">{course.name}</div>
        <div className="text-white/60 mt-1">
          D+ {course.totalDPlus}m · {course.totalKm}K
        </div>
      </div>
    </div>
  );
}
