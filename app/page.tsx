'use client';

import { useState } from 'react';
import { COURSES, type PaceStrategy } from '@/lib/courses';
import { calculateSegments } from '@/lib/pace-engine';
import { WristbandPreview } from '@/components/WristbandPreview';
import { generateWristbandPDF } from '@/lib/pdf-generator';

const TARGET_TIMES = [
  { label: '3:30:00', value: '03:30:00', pace: '4:58/km' },
  { label: '4:00:00', value: '04:00:00', pace: '5:41/km' },
  { label: '4:30:00', value: '04:30:00', pace: '6:24/km' },
  { label: '5:00:00', value: '05:00:00', pace: '7:06/km' },
];

const STRATEGIES: { label: string; value: PaceStrategy; desc: string }[] = [
  { label: '負分段', value: 'negative-split', desc: '前半慢、後半快，推薦多數跑者' },
  { label: '均速配速', value: 'even-pace', desc: '全程穩定配速，適合訓練有素跑者' },
  { label: '保守起步', value: 'safe-start', desc: '前5K暖身，30K後加速，適合新手' },
];

export default function HomePage() {
  const [targetTime, setTargetTime] = useState('04:00:00');
  const [courseId, setCourseId] = useState('taipei');
  const [strategy, setStrategy] = useState<PaceStrategy>('negative-split');
  const [showElevation, setShowElevation] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const course = COURSES[courseId];
  const segments = calculateSegments({ targetTime, course, strategy, showElevation, showQR });

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      await generateWristbandPDF({ targetTime, course, strategy, showElevation, showQR });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="py-8 text-center bg-slate-900 text-white">
        <h1 className="text-3xl font-bold mb-2">🏃 馬拉松配速手環產生器</h1>
        <p className="text-slate-300">選擇目標時間與賽道，產生可列印配速手環</p>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
            <h2 className="text-xl font-bold text-slate-800">⚙️ 設定</h2>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">目標完賽時間</label>
              <div className="grid grid-cols-2 gap-2">
                {TARGET_TIMES.map((t) => (
                  <button key={t.value} onClick={() => setTargetTime(t.value)} className={`p-3 rounded-xl border-2 ${targetTime === t.value ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200'}`}>
                    <div className="font-bold">{t.label}</div>
                    <div className="text-xs opacity-70">{t.pace}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">賽道</label>
              <div className="space-y-2">
                {Object.values(COURSES).map((c) => (
                  <button key={c.id} onClick={() => setCourseId(c.id)} className={`w-full text-left p-3 rounded-xl border-2 ${courseId === c.id ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200'}`}>
                    <div className="font-bold">{c.name}</div>
                    <div className="text-xs opacity-70">D+ {c.totalDPlus}m · {c.totalKm}K · {c.elevationNodes.length}個高度節點</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">配速策略</label>
              <div className="space-y-2">
                {STRATEGIES.map((s) => (
                  <button key={s.value} onClick={() => setStrategy(s.value)} className={`w-full text-left p-3 rounded-xl border-2 ${strategy === s.value ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200'}`}>
                    <div className="font-bold">{s.label}</div>
                    <div className="text-xs opacity-70">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4 flex-wrap">
              <label className="flex items-center gap-2"><input type="checkbox" checked={showElevation} onChange={(e) => setShowElevation(e.target.checked)} />顯示高度圖</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={showQR} onChange={(e) => setShowQR(e.target.checked)} />QR Code</label>
            </div>

            <button onClick={handleDownloadPDF} disabled={isGenerating} className="w-full py-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold rounded-xl text-lg">
              {isGenerating ? '產生中...' : '📄 下載 PDF 手環'}
            </button>
          </div>

          <WristbandPreview segments={segments} course={course} targetTime={targetTime} strategy={strategy} />
        </div>
      </div>
    </main>
  );
}
