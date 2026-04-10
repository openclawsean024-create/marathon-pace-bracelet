'use client';

import { useState } from 'react';
import { COURSES, type PaceStrategy } from '@/lib/courses';
import { calculateSegments } from '@/lib/pace-engine';
import { WristbandPreview } from '@/components/WristbandPreview';
import { generateWristbandPDF } from '@/lib/pdf-generator';

// 目標時間：3:00 ～ 7:00，每30分鐘一格，覆蓋規格要求全範圍
function buildTargetTimes() {
  const times = [];
  for (let h = 3; h <= 7; h++) {
    for (const m of [0, 30]) {
      if (h === 7 && m > 0) break;
      const value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
      const totalSec = h * 3600 + m * 60;
      const paceSec = totalSec / 42.195;
      const paceMin = Math.floor(paceSec / 60);
      const paceSecRem = Math.round(paceSec % 60);
      times.push({ label: value, value, pace: `${paceMin}:${String(paceSecRem).padStart(2, '0')}/km` });
    }
  }
  return times;
}

const TARGET_TIMES = buildTargetTimes();

const STRATEGIES: { label: string; value: PaceStrategy; desc: string }[] = [
  { label: '負分段', value: 'negative-split', desc: '前半慢、後半快，推薦多數跑者' },
  { label: '均速配速', value: 'even-pace', desc: '全程穩定配速，適合訓練有素跑者' },
  { label: '保守起步', value: 'safe-start', desc: '前5K暖身，30K後加速，適合新手' },
];

export default function HomePage() {
  const [targetTime, setTargetTime] = useState('04:00:00');
  const [courseId, setCourseId] = useState('taipei');
  const [strategy, setStrategy] = useState<PaceStrategy>('negative-split');
  const [staminaFactor, setStaminaFactor] = useState(0);
  const [showQR, setShowQR] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const course = COURSES[courseId];
  const segments = calculateSegments({ targetTime, course, strategy, showElevation: false, showQR, staminaFactor });

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      await generateWristbandPDF({ targetTime, course, strategy, showElevation: false, showQR, staminaFactor });
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
                  <button
                    key={t.value}
                    onClick={() => setTargetTime(t.value)}
                    className={`p-3 rounded-xl border-2 ${
                      targetTime === t.value
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 hover:border-slate-400'
                    }`}
                  >
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
                  <button
                    key={c.id}
                    onClick={() => setCourseId(c.id)}
                    className={`w-full text-left p-3 rounded-xl border-2 ${
                      courseId === c.id
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <div className="font-bold">{c.name}</div>
                    <div className="text-xs opacity-70">
                      D+ {c.totalDPlus}m · {c.totalKm}K · {c.elevationNodes.length}個高度節點
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">配速策略</label>
              <div className="space-y-2">
                {STRATEGIES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setStrategy(s.value)}
                    className={`w-full text-left p-3 rounded-xl border-2 ${
                      strategy === s.value
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <div className="font-bold">{s.label}</div>
                    <div className="text-xs opacity-70">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                體力調整
                <span className="ml-2 text-xs font-normal text-slate-500">
                  {staminaFactor === 0 ? '正常' : staminaFactor > 0 ? `體力佳 +${staminaFactor}` : `體力差 ${staminaFactor}`}
                </span>
              </label>
              <input
                type="range"
                min={-2}
                max={2}
                step={1}
                value={staminaFactor}
                onChange={(e) => setStaminaFactor(Number(e.target.value))}
                className="w-full accent-slate-900"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>體力差</span><span>正常</span><span>體力佳</span>
              </div>
            </div>

            <div className="flex gap-4 flex-wrap">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={showQR} onChange={(e) => setShowQR(e.target.checked)} />
                QR Code
              </label>
            </div>

            <button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold rounded-xl text-lg"
            >
              {isGenerating ? '產生中...' : '📄 下載 PDF 手環'}
            </button>
          </div>

          <WristbandPreview segments={segments} course={course} targetTime={targetTime} strategy={strategy} />
        </div>
      </div>
    </main>
  );
}
