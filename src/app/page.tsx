'use client';

import { useState } from 'react';
import { COURSES, type PaceStrategy } from '@/lib/courses';
import { calculateSegments, getTargetPace } from '@/lib/pace-engine';
import { WristbandPreview } from '@/components/WristbandPreview';
import { PaceChart } from '@/components/PaceChart';
import { generateWristbandPDF } from '@/lib/pdf-generator';

// 目標時間：3:00 ～ 7:00，每30分鐘一格
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

// 三種配速策略（v3 規格）
const STRATEGIES: { label: string; value: PaceStrategy; desc: string }[] = [
  { label: '負分割', value: 'negative-split', desc: '前半慢、後半快' },
  { label: '均速', value: 'even-pace', desc: '全程穩定配速' },
  { label: '正分割', value: 'positive-split', desc: '前半快、後半保守' },
];

export default function HomePage() {
  const [targetTime, setTargetTime] = useState('04:00:00');
  const [courseId, setCourseId] = useState('taipei');
  const [strategy, setStrategy] = useState<PaceStrategy>('negative-split');
  const [staminaFactor, setStaminaFactor] = useState(0);
  const [showQR, setShowQR] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // v3 新增：能力資料輸入
  const [halfMarathonTime, setHalfMarathonTime] = useState('');
  const [tenKTime, setTenKTime] = useState('');
  const [trainingPace, setTrainingPace] = useState('');

  const course = COURSES[courseId];
  const segments = calculateSegments({ targetTime, course, strategy, showElevation: false, showQR, staminaFactor });
  const avgPace = getTargetPace(targetTime, course);

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      await generateWristbandPDF({ targetTime, course, strategy, showElevation: false, showQR, staminaFactor });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => window.print();

  return (
    <div className="page-wrapper">
      {/* Header */}
      <header className="strava-header">
        <div className="max-w-screen-xl mx-auto" style={{ padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="strava-logo-mark">
              <span style={{ fontSize: 20 }}>🏃</span>
            </div>
            <div>
              <div className="strava-headline">
                馬拉松配速<span>手環</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>
                選擇目標時間，產生賽道專屬配速表
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="content-grid">
        {/* ===== 左側：設定面板 ===== */}
        <div className="input-panel no-print">

          {/* 目標完賽時間 */}
          <div className="input-section">
            <div className="input-label">
              <span>🎯</span> 目標完賽時間
            </div>
            <div className="time-grid">
              {TARGET_TIMES.map((t) => (
                <button
                  key={t.value}
                  className={`time-btn ${targetTime === t.value ? 'active' : ''}`}
                  onClick={() => setTargetTime(t.value)}
                >
                  <span className="time-btn-label">{t.label}</span>
                  <span className="time-btn-pace">{t.pace}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 配速策略（v3 規格） */}
          <div className="input-section">
            <div className="input-label">
              <span>⚡</span> 配速策略
            </div>
            <div className="strategy-segmented">
              {STRATEGIES.map((s) => (
                <button
                  key={s.value}
                  className={`strategy-tab ${strategy === s.value ? 'active' : ''}`}
                  onClick={() => setStrategy(s.value)}
                >
                  <span className="strategy-tab-label">{s.label}</span>
                  <span className="strategy-tab-desc">{s.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 賽道選擇 */}
          <div className="input-section">
            <div className="input-label">
              <span>🗺️</span> 賽道
            </div>
            <div className="course-grid">
              {Object.values(COURSES).map((c) => (
                <button
                  key={c.id}
                  className={`course-card ${courseId === c.id ? 'active' : ''}`}
                  onClick={() => setCourseId(c.id)}
                >
                  <div>
                    <div className="course-name">{c.name}</div>
                    <div className="course-meta">
                      D+ {c.totalDPlus}m · {c.totalKm}K
                    </div>
                  </div>
                  {courseId === c.id && (
                    <span style={{ fontSize: 16 }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 能力資料輸入（v3 新功能） */}
          <div className="input-section">
            <div className="input-label">
              <span>📊</span> 能力參考資料（選填）
            </div>
            <div className="perf-input-row">
              <div className="perf-input-group">
                <label htmlFor="half-marathon">半馬成績</label>
                <input
                  id="half-marathon"
                  type="text"
                  placeholder="e.g. 01:45:00"
                  value={halfMarathonTime}
                  onChange={(e) => setHalfMarathonTime(e.target.value)}
                />
              </div>
              <div className="perf-input-group">
                <label htmlFor="ten-k">10K 成績</label>
                <input
                  id="ten-k"
                  type="text"
                  placeholder="e.g. 00:50:00"
                  value={tenKTime}
                  onChange={(e) => setTenKTime(e.target.value)}
                />
              </div>
              <div className="perf-input-group">
                <label htmlFor="training-pace">訓練配速</label>
                <input
                  id="training-pace"
                  type="text"
                  placeholder="e.g. 5:30/km"
                  value={trainingPace}
                  onChange={(e) => setTrainingPace(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* QR Code 選項 */}
          <div className="input-section">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                id="show-qr"
                checked={showQR}
                onChange={(e) => setShowQR(e.target.checked)}
                style={{ accentColor: 'var(--strava-orange)', width: 16, height: 16 }}
              />
              <label htmlFor="show-qr" style={{ fontSize: 14, color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                在手環顯示 QR Code
              </label>
            </div>
          </div>

          {/* 操作按鈕 */}
          <div className="input-section">
            <button
              className="btn-primary"
              onClick={handleDownloadPDF}
              disabled={isGenerating}
            >
              {isGenerating ? '產生中...' : '📄 下載 PDF 手環'}
            </button>
            <button
              className="btn-secondary"
              onClick={handlePrint}
              style={{ marginTop: 8 }}
            >
              🖨️ 列印手環
            </button>
          </div>
        </div>

        {/* ===== 右側：手環預覽 ===== */}
        <div>
          <div id="wristband-container">
            <WristbandPreview
              segments={segments}
              course={course}
              targetTime={targetTime}
              strategy={strategy}
            />
          </div>

          {/* 配速曲線圖（ Strava 風格折線圖）*/}
          <div className="no-print" style={{ marginTop: 20 }}>
            <PaceChart segments={segments} targetTime={targetTime} strategy={strategy} />
          </div>
        </div>
      </div>
    </div>
  );
}
