'use client';

import type { Course, PaceStrategy } from '@/lib/courses';
import { calculateSegments, getTargetPace } from '@/lib/pace-engine';

export function WristbandPreview({
  segments,
  course,
  targetTime,
  strategy,
}: {
  segments: ReturnType<typeof calculateSegments>;
  course: Course;
  targetTime: string;
  strategy: PaceStrategy;
}) {
  return (
    <section className="bg-white rounded-2xl shadow-xl p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900">即時預覽</h3>
          <p className="text-sm text-slate-500">{course.name} · {targetTime} · {strategy}</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500">平均配速</div>
          <div className="font-bold text-slate-900">{getTargetPace(targetTime, course)}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
        {segments.map((segment) => (
          <div key={segment.km} className="rounded-xl border border-slate-200 p-3 bg-slate-50">
            <div className="font-bold text-slate-800">{segment.km === 21.0975 ? '半程' : `${segment.km}K`}</div>
            <div className="text-slate-600">+{segment.cumulativeTime}</div>
            <div className="text-slate-900 font-semibold">{segment.pace}</div>
            <div className="text-slate-500">{segment.note ?? ''}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">
        背面補給提醒：每 5K 補水，30K 後補充能量膠。
      </div>
    </section>
  );
}
