import jsPDF from 'jspdf';
import type { PaceStrategy } from './courses';
import type { WristbandConfig, PaceSegment } from './types';
import { calculateSegments } from './pace-engine';
import { Course } from './courses';

export { WristbandConfig, PaceStrategy };

// A4 Landscape dimensions in mm
const W = 297;
const H = 210;

// Colors
const WHITE = '#ffffff';
const TEXT_COLOR = '#1a1a2e';
const ACCENT_COLOR = '#e94560';
const LIGHT_BG = '#f8f9fa';
const BORDER_COLOR = '#dee2e6';
const GRAY = '#6b7280';
const DARK_GRAY = '#374151';

// Column definitions: [label, km value]
export const WRISTBAND_COLUMNS: Array<{ label: string; km: number }> = [
  { label: '5K', km: 5 },
  { label: '10K', km: 10 },
  { label: '15K', km: 15 },
  { label: '半程', km: 21.0975 },
  { label: '25K', km: 25 },
  { label: '30K', km: 30 },
  { label: '35K', km: 35 },
  { label: '40K', km: 40 },
  { label: '42.2K', km: 42.195 },
  { label: '策略', km: -1 }, // Special last column
];

export function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

export function strategyLabel(strategy: PaceStrategy): string {
  const labels: Record<PaceStrategy, string> = {
    'negative-split': '負分段',
    'even-pace': '均速配速',
    'safe-start': '保守起步',
  };
  return labels[strategy];
}

function drawElevationChart(
  doc: jsPDF,
  course: Course,
  x: number,
  y: number,
  w: number,
  h: number
): void {
  const nodes = course.elevationNodes;
  if (nodes.length === 0) return;

  const minElev = Math.min(...nodes.map((n) => n.elevation)) - 5;
  const maxElev = Math.max(...nodes.map((n) => n.elevation)) + 5;
  const elevRange = maxElev - minElev || 1;

  // Background
  doc.setFillColor(...hexToRgb(LIGHT_BG));
  doc.rect(x, y, w, h, 'F');

  // Draw vertical grid lines at each checkpoint km
  const checkpoints = [0, 5, 10, 15, 21.0975, 25, 30, 35, 40, 42.195];
  doc.setDrawColor(...hexToRgb(BORDER_COLOR));
  doc.setLineWidth(0.2);
  for (const ck of checkpoints) {
    const px = x + (ck / course.totalKm) * w;
    doc.line(px, y, px, y + h);
  }

  // Draw elevation profile using thin polyline
  doc.setDrawColor(...hexToRgb(DARK_GRAY));
  doc.setLineWidth(0.5);
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const px = x + (node.km / course.totalKm) * w;
    const py = y + h - ((node.elevation - minElev) / elevRange) * h;
    if (i === 0) {
      doc.moveTo(px, py);
    } else {
      doc.lineTo(px, py);
    }
  }
  doc.stroke();

  // Label first and last nodes
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5);
  doc.setTextColor(...hexToRgb(GRAY));
  if (nodes[0]) {
    const startPx = x + (nodes[0].km / course.totalKm) * w;
    const startPy = y + h - ((nodes[0].elevation - minElev) / elevRange) * h;
    doc.text(`${nodes[0].km}K`, startPx + 1, startPy - 1);
  }
  if (nodes[nodes.length - 1]) {
    const last = nodes[nodes.length - 1];
    const endPx = x + (last.km / course.totalKm) * w;
    const endPy = y + h - ((last.elevation - minElev) / elevRange) * h;
    doc.text(`${last.km}K`, endPx - 3, endPy - 1);
  }
}

function formatTimeShort(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.round(totalSeconds % 60);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

function parseTimeShort(timeStr: string): number {
  const parts = timeStr.split(':').map(Number);
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return parts[0] * 3600 + parts[1] * 60 + (parts[2] ?? 0);
}

export async function generateWristbandPDF(
  config: WristbandConfig
): Promise<jsPDF> {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // Calculate segments
  const segments = calculateSegments(config);
  const segByKm = new Map(segments.map((s) => [s.km, s]));

  // ==================== PAGE 1: 正面 ====================
  doc.setFillColor(...hexToRgb(WHITE));
  doc.rect(0, 0, W, H, 'F');

  // Header bar
  const title = `${config.course.name} | 目標 ${config.targetTime} | ${strategyLabel(config.strategy)}`;
  doc.setFillColor(...hexToRgb(TEXT_COLOR));
  doc.rect(0, 0, W, 14, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...hexToRgb(WHITE));
  doc.text(title, W / 2, 9, { align: 'center' });

  // Cut lines (dashed vertical lines at x=15 and x=282)
  doc.setDrawColor(...hexToRgb(BORDER_COLOR));
  doc.setLineDashPattern([2, 2], 0);
  doc.setLineWidth(0.3);
  doc.line(15, 0, 15, H);
  doc.line(W - 15, 0, W - 15, H);
  doc.setLineDashPattern([], 0);

  // Elevation chart
  if (config.showElevation) {
    drawElevationChart(doc, config.course, 15, 16, 267, 28);
  }

  // Wristband table
  const tableX = 15;
  const tableY = 48;
  const tableW = 267;
  const numCols = WRISTBAND_COLUMNS.length;
  const colW = tableW / numCols;

  // Draw column headers
  doc.setFillColor(...hexToRgb(LIGHT_BG));
  doc.rect(tableX, tableY, tableW, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...hexToRgb(TEXT_COLOR));
  for (let i = 0; i < numCols; i++) {
    const col = WRISTBAND_COLUMNS[i];
    const cx = tableX + i * colW + colW / 2;
    doc.text(col.label, cx, tableY + 5.5, { align: 'center' });
  }

  // Row definitions
  const rows: Array<{ label: string; height: number; font: 'normal'|'bold'; size: number; color: string; valueFn: (s: PaceSegment) => string }> = [
    { label: '分段', height: 7, font: 'bold', size: 7, color: TEXT_COLOR, valueFn: (_s: PaceSegment) => '' },
    { label: '分段時間', height: 7, font: 'normal', size: 6.5, color: TEXT_COLOR, valueFn: (s: PaceSegment) => s.splitTime },
    { label: '累積時間', height: 8, font: 'normal', size: 7, color: TEXT_COLOR, valueFn: (s: PaceSegment) => s.cumulativeTime },
    { label: '配速', height: 7, font: 'normal', size: 6.5, color: TEXT_COLOR, valueFn: (s: PaceSegment) => s.pace + '/km' },
  ];

  let currentY = tableY + 8;

  for (const row of rows) {
    doc.setFont('helvetica', row.font as 'normal' | 'bold');
    doc.setFontSize(row.size);
    doc.setTextColor(...hexToRgb(row.color as string));

    // Row background (alternating)
    doc.setFillColor(...hexToRgb(WHITE));
    doc.rect(tableX, currentY, tableW, row.height, 'F');

    for (let i = 0; i < numCols; i++) {
      const col = WRISTBAND_COLUMNS[i];
      const cx = tableX + i * colW + colW / 2;

      if (col.km === -1) {
        // Strategy column
        if (row.label === '分段') {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(6.5);
          doc.setTextColor(...hexToRgb(GRAY));
          doc.text('策略提示', cx, currentY + row.height / 2 + 1.5, { align: 'center' });
        }
      } else {
        const seg = segByKm.get(col.km);
        if (seg && row.label !== '分段') {
          const val = row.valueFn(seg);
          doc.text(val, cx, currentY + row.height / 2 + 1.5, { align: 'center' });
        }
      }
    }

    // Vertical grid lines
    doc.setDrawColor(...hexToRgb(BORDER_COLOR));
    doc.setLineWidth(0.15);
    for (let i = 0; i <= numCols; i++) {
      const lx = tableX + i * colW;
      doc.line(lx, tableY + 8, lx, currentY + row.height);
    }

    currentY += row.height;
  }

  // Special notes row (撞牆期 / 橋樑 markers)
  currentY += 1;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(...hexToRgb(ACCENT_COLOR));
  doc.setFillColor(...hexToRgb(WHITE));
  doc.rect(tableX, currentY, tableW, 6, 'F');

  for (let i = 0; i < numCols; i++) {
    const col = WRISTBAND_COLUMNS[i];
    const cx = tableX + i * colW + colW / 2;

    if (col.km === -1) {
      // Strategy note in last column
      const stratNotes: Record<PaceStrategy, string> = {
        'negative-split': '⚠️ 後30K加速',
        'even-pace': '⚠️ 全程均速',
        'safe-start': '⚠️ 30K後加速',
      };
      doc.text(stratNotes[config.strategy], cx, currentY + 4, { align: 'center' });
    } else {
      const seg = segByKm.get(col.km);
      if (seg?.note) {
        doc.text(seg.note, cx, currentY + 4, { align: 'center' });
      }
    }
  }

  // Horizontal separator above notes
  doc.setDrawColor(...hexToRgb(BORDER_COLOR));
  doc.setLineWidth(0.15);
  doc.line(tableX, currentY, tableX + tableW, currentY);

  // Bottom border of table
  doc.line(tableX, currentY + 6, tableX + tableW, currentY + 6);

  // ==================== PAGE 2: 背面 ====================
  doc.addPage();
  doc.setFillColor(...hexToRgb(WHITE));
  doc.rect(0, 0, W, H, 'F');

  // Header for page 2
  doc.setFillColor(...hexToRgb(TEXT_COLOR));
  doc.rect(0, 0, W, 14, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...hexToRgb(WHITE));
  doc.text(`${config.course.name} | 補給提醒`, W / 2, 9, { align: 'center' });

  // Left side: Supply schedule
  const leftX = 20;
  let leftY = 22;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...hexToRgb(TEXT_COLOR));
  doc.text('補給時間表', leftX, leftY);
  leftY += 8;

  const supplyItems = [
    { icon: '⏰', text: '能量膠：30分起 / 40分追加' },
    { icon: '💧', text: '水站：每站喝2口' },
    { icon: '⚡', text: '撞牆：30-35K正常，減速OK' },
    { icon: '🏃', text: '35K+ 開始加速' },
  ];

  for (const item of supplyItems) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...hexToRgb(TEXT_COLOR));
    doc.text(item.icon, leftX, leftY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.text(item.text, leftX + 8, leftY);
    leftY += 7;
  }

  // Course-specific notes
  leftY += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...hexToRgb(TEXT_COLOR));
  doc.text('賽道特殊標記', leftX, leftY);
  leftY += 8;

  if (config.course.specialNotes && config.course.specialNotes.length > 0) {
    for (const note of config.course.specialNotes) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...hexToRgb(GRAY));
      doc.text(`• ${note}`, leftX, leftY);
      leftY += 6;
    }
  }

  // Strategy reminder
  leftY += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...hexToRgb(ACCENT_COLOR));
  const strategyNotes: Record<PaceStrategy, string> = {
    'negative-split': `負分段策略：前21K偏保守，30K後逐漸加速`,
    'even-pace': `均速配速：全程 ${config.targetTime} 目標節奏`,
    'safe-start': `保守起步：前5K暖身，30K後 kick pace 加速`,
  };
  const lines = doc.splitTextToSize(strategyNotes[config.strategy], 120);
  doc.text(lines, leftX, leftY);
  leftY += lines.length * 6;

  // Right side: QR Code placeholder
  const qrX = W - 80;
  const qrY = 30;
  const qrSize = 40;

  doc.setFillColor(...hexToRgb(LIGHT_BG));
  doc.setDrawColor(...hexToRgb(BORDER_COLOR));
  doc.setLineWidth(0.3);
  doc.rect(qrX, qrY, qrSize, qrSize, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...hexToRgb(GRAY));
  doc.text('QR Code', qrX + qrSize / 2, qrY + qrSize / 2 - 2, { align: 'center' });
  doc.text('(Task 6)', qrX + qrSize / 2, qrY + qrSize / 2 + 3, { align: 'center' });

  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...hexToRgb(GRAY));
  doc.text('馬拉松配速手環產生器', W / 2, H - 5, { align: 'center' });

  // Trigger browser download (works in browser; no-op in Node)
  if (typeof window !== 'undefined') {
    doc.save(`${config.course.name}-配速手環.pdf`);
  }

  return doc;
}
