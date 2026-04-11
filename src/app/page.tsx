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
  const [staminaFactor, setStaminaFactor] = useState(0); // -2 to +2
  const [showElevation, setShowElevation] = useState(false); // P0: 預設關閉
  const [showQR, setShowQR] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const course = COURSES[courseId];
  const segments = calculateSegments({ targetTime, course, strategy, showElevation, showQR, staminaFactor });

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      await generateWristbandPDF({ targetTime, course, strategy, showElevation, showQR, staminaFactor });
    } finally {
      setIsGenerating(false);
    }
  };

  // 列印：利用 window.print()，配合 CSS @media print 隱藏非手環元素
  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="py-8 text-center">
        <h1 className="text-3xl font-bold mb-2" style={{ background: 'linear-gradient(135deg, #e94560, #ff6b6b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          🏃 馬拉松配速手環產生器
        </h1>
        <p className="text-slate-400">選擇目標時間與賽道，產生可列印配速手環</p>
      </header>

      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-2 gap-8">
          {/* 設定面板 */}
          <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6 no-print">
            <h2 className="text-xl font-bold text-slate-800">⚙️ 設定</h2>

            {/* 目標時間 */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">目標完賽時間</label>
              <div className="grid grid-cols-2 gap-2">
                {TARGET_TIMES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTargetTime(t.value)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      targetTime === t.value
                        ? 'border-slate-800 bg-slate-800 text-white'
                        : 'border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <div className="font-bold">{t.label}</div>
                    <div className="text-xs opacity-70">{t.pace}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 賽道 */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">賽道</label>
              <div className="space-y-2">
                {Object.values(COURSES).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCourseId(c.id)}
                    className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                      courseId === c.id
                        ? 'border-slate-800 bg-slate-800 text-white'
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

            {/* 配速策略 */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">配速策略</label>
              <div className="space-y-2">
                {STRATEGIES.map((s) => {
                  const isSelected = strategy === s.value;
                  const btnColor = s.value === 'negative-split' ? '#e94560' : s.value === 'even-pace' ? '#3b82f6' : '#10b981';
                  return (
                    <button
                      key={s.value}
                      onClick={() => setStrategy(s.value)}
                      className="w-full text-left p-3 rounded-xl border-2 transition-all"
                      style={{
                        borderColor: isSelected ? btnColor : '#e2e8f0',
                        backgroundColor: isSelected ? btnColor : '#ffffff',
                        color: isSelected ? '#ffffff' : '#1e293b',
                      }}
                    >
                      <div className="font-bold">{s.label}</div>
                      <div className="text-xs" style={{ opacity: isSelected ? 0.8 : 0.6 }}>{s.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 體力調整 */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                體力調整
                <span className="ml-2 text-xs font-normal text-slate-500">
                  {staminaFactor === 0
                    ? '正常'
                    : staminaFactor > 0
                    ? `體力佳 +${staminaFactor} (每公里快 ${staminaFactor * 5} 秒)`
                    : `體力差 ${staminaFactor} (每公里慢 ${Math.abs(staminaFactor) * 5} 秒)`}
                </span>
              </label>
              <input
                type="range"
                min={-2}
                max={2}
                step={1}
                value={staminaFactor}
                onChange={(e) => setStaminaFactor(Number(e.target.value))}
                className="w-full accent-slate-800"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>體力差</span>
                <span>正常</span>
                <span>體力佳</span>
              </div>
            </div>

            {/* 顯示選項 */}
            <div className="flex gap-4 flex-wrap no-print">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showQR}
                  onChange={(e) => setShowQR(e.target.checked)}
                  className="accent-slate-800"
                />
                <span className="text-sm text-slate-700">顯示 QR Code</span>
              </label>
            </div>

            {/* 操作按鈕 */}
            <div className="flex flex-col gap-3 no-print">
              <button
                onClick={handleDownloadPDF}
                disabled={isGenerating}
                className="w-full py-4 text-white font-bold rounded-xl text-lg transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #e94560, #ff6b6b)' }}
              >
                {isGenerating ? '產生中...' : '📄 下載 PDF 手環'}
              </button>
              <button
                onClick={handlePrint}
                className="w-full py-3 bg-white border-2 border-slate-300 hover:border-slate-500 text-slate-800 font-semibold rounded-xl transition-colors"
              >
                🖨️ 列印手環（瀏覽器列印）
              </button>
            </div>
          </div>

          {/* 手環預覽（供列印使用） */}
          <div id="wristband-print-area">
            <WristbandPreview
              segments={segments}
              course={course}
              targetTime={targetTime}
              strategy={strategy}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
