import React, { useEffect, useMemo, useState } from 'react';
import { CheckIn } from '../types';
import { MochiHappyCompanion } from './MochiIllustrations';

interface StatsScreenProps {
  checkIns: CheckIn[];
  onOpenSettings: () => void;
  onOpenSelfCare: () => void;
}

const formatCommaDecimal = (num: number) => num.toFixed(1).replace('.', ',');

function parseDateToIso(dateStr: string, createdAt?: number): string {
  const iso = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const dmy = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (dmy) {
    return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;
  }
  if (createdAt && !Number.isNaN(createdAt)) {
    const d = new Date(createdAt);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;
  }
  return dateStr;
}

function computeLocalCheckinStreak(checkIns: CheckIn[]): number {
  const isoSet = new Set<string>();
  for (const c of checkIns) {
    const iso = parseDateToIso(c.date, c.createdAt);
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
      isoSet.add(iso);
    }
  }
  if (isoSet.size === 0) return 0;

  const now = new Date();
  const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`;
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayIso = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(
    yesterday.getDate()
  ).padStart(2, '0')}`;
  const startIso = isoSet.has(todayIso)
    ? todayIso
    : isoSet.has(yesterdayIso)
      ? yesterdayIso
      : null;
  if (!startIso) return 0;
  const cursor = new Date(`${startIso}T12:00:00`);
  let streak = 0;

  while (true) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(
      cursor.getDate()
    ).padStart(2, '0')}`;
    if (!isoSet.has(key)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function buildSmoothBezierPath(pts: { x: number; y: number }[]): string {
  if (pts.length === 0) return '';
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];

    const tension = 0.22;
    const cp1x = Number((p1.x + (p2.x - p0.x) * tension).toFixed(1));
    const cp1y = Number(Math.max(14, Math.min(106, p1.y + (p2.y - p0.y) * tension)).toFixed(1));
    const cp2x = Number((p2.x - (p3.x - p1.x) * tension).toFixed(1));
    const cp2y = Number(Math.max(14, Math.min(106, p2.y - (p3.y - p1.y) * tension)).toFixed(1));

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export const StatsScreen: React.FC<StatsScreenProps> = ({
  checkIns,
  onOpenSettings,
  onOpenSelfCare,
}) => {
  const [viewMode, setViewMode] = useState<'overview' | 'detail'>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState<'7days' | '30days' | 'month'>('7days');
  const [activeDayIndex, setActiveDayIndex] = useState<number>(0);
  const [showWhyAiSummary, setShowWhyAiSummary] = useState<boolean>(false);

  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({
    'mood-stress': false,
    sleep: false,
    emotions: false,
  });

  const sortedCheckIns = useMemo(() => {
    return [...checkIns].sort((a, b) => {
      const isoA = parseDateToIso(a.date, a.createdAt);
      const isoB = parseDateToIso(b.date, b.createdAt);
      if (isoA !== isoB) return isoB.localeCompare(isoA);
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
  }, [checkIns]);

  // Synchronized dynamic computation across ALL charts & cards based on `selectedPeriod`
  const computedStats = useMemo(() => {
    const limit =
      selectedPeriod === '7days'
        ? 7
        : selectedPeriod === '30days'
          ? 30
          : sortedCheckIns.length;

    const periodSlice = sortedCheckIns.slice(0, Math.max(1, limit));

    if (sortedCheckIns.length === 0) {
      return {
        avgMood: 0,
        avgStress: 0,
        avgSleep: 0,
        daysCount: 0,
        recordsCount: 0,
        goodSleepNights: 0,
        restlessSleepNights: 0,
        periodSeries: [] as {
          day: string;
          mood: number;
          stress: number;
          sleep: number;
          date: string;
        }[],
        emotionBreakdown: [] as { label: string; pct: number; count: number }[],
        totalEmotionTags: 0,
      };
    }

    const n = periodSlice.length;
    const avgMood = Number((periodSlice.reduce((sum, c) => sum + c.mood, 0) / n).toFixed(1));
    const avgStress = Number((periodSlice.reduce((sum, c) => sum + c.stress, 0) / n).toFixed(1));
    const avgSleep = Number(
      (periodSlice.reduce((sum, c) => sum + c.sleepHours, 0) / n).toFixed(1)
    );

    const chronological = [...periodSlice].reverse();
    const periodSeries = chronological.map((c) => {
      const iso = parseDateToIso(c.date, c.createdAt);
      const parts = iso.split('-');
      const shortDate =
        parts.length === 3 ? `${parts[2]}/${parts[1]}` : c.date.slice(0, 5);
      return {
        day: c.dayLabel || shortDate,
        mood: c.mood,
        stress: c.stress,
        sleep: c.sleepHours,
        date: shortDate,
      };
    });

    const goodSleepNights = chronological.filter((c) => c.sleepHours >= 7).length;
    const restlessSleepNights = chronological.length - goodSleepNights;

    const freq: Record<string, number> = {};
    let totalTags = 0;
    for (const ci of periodSlice) {
      for (const em of ci.emotions || []) {
        freq[em] = (freq[em] || 0) + 1;
        totalTags += 1;
      }
    }
    const sortedEmotions = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, count]) => ({
        label,
        count,
        pct: totalTags > 0 ? Math.round((count / totalTags) * 100) : 0,
      }));

    const uniqueDays = new Set(
      periodSlice.map((c) => parseDateToIso(c.date, c.createdAt))
    ).size;

    return {
      avgMood,
      avgStress,
      avgSleep,
      daysCount: uniqueDays,
      recordsCount: n,
      goodSleepNights,
      restlessSleepNights,
      periodSeries,
      emotionBreakdown: sortedEmotions,
      totalEmotionTags: totalTags,
    };
  }, [sortedCheckIns, selectedPeriod]);

  useEffect(() => {
    setActiveDayIndex(Math.max(0, computedStats.periodSeries.length - 1));
  }, [computedStats.periodSeries.length, selectedPeriod]);

  const toggleComment = (key: string) => {
    setExpandedComments((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleOpenDetail = () => {
    setViewMode('detail');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleBackToOverview = () => {
    setViewMode('overview');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const hasData = sortedCheckIns.length > 0;
  const displayMood = computedStats.avgMood;
  const displayStress = computedStats.avgStress;
  const displaySleep = computedStats.avgSleep;

  const checkinStreak = useMemo(
    () => computeLocalCheckinStreak(sortedCheckIns),
    [sortedCheckIns]
  );

  // Build smooth Cubic Bezier SVG paths dynamically from `computedStats.periodSeries`
  const chartPoints = useMemo(() => {
    const items = computedStats.periodSeries;
    const count = items.length;
    const xStart = 20;
    const xEnd = 300;
    const step = count > 1 ? (xEnd - xStart) / (count - 1) : 0;

    return items.map((d, i) => {
      const x = count > 1 ? Number((xStart + i * step).toFixed(1)) : 160;
      const moodY = Number((102 - (Math.max(0, Math.min(10, d.mood)) / 10) * 84).toFixed(1));
      const stressY = Number((102 - (Math.max(0, Math.min(10, d.stress)) / 10) * 84).toFixed(1));
      return { ...d, x, moodY, stressY };
    });
  }, [computedStats.periodSeries]);

  const moodLinePath = useMemo(
    () => buildSmoothBezierPath(chartPoints.map((p) => ({ x: p.x, y: p.moodY }))),
    [chartPoints]
  );

  const stressLinePath = useMemo(
    () => buildSmoothBezierPath(chartPoints.map((p) => ({ x: p.x, y: p.stressY }))),
    [chartPoints]
  );

  const moodAreaPath = useMemo(() => {
    if (chartPoints.length === 0) return '';
    if (chartPoints.length === 1) {
      const p = chartPoints[0];
      return `M ${p.x - 16} ${p.moodY} L ${p.x + 16} ${p.moodY} L ${p.x + 16} 105 L ${p.x - 16} 105 Z`;
    }
    return `${moodLinePath} L ${chartPoints[chartPoints.length - 1].x} 105 L ${chartPoints[0].x} 105 Z`;
  }, [chartPoints, moodLinePath]);

  const safeActiveIdx = Math.min(
    activeDayIndex,
    Math.max(0, computedStats.periodSeries.length - 1)
  );
  const activePoint = computedStats.periodSeries[safeActiveIdx];
  const activeSvgPoint = chartPoints[safeActiveIdx];

  const allAiInsights = useMemo(() => {
    if (!hasData) {
      return [
        {
          title: 'Bắt đầu hành trình lắng nghe bản thân',
          body: 'Hãy thực hiện check-in hằng ngày để MindCare tổng hợp xu hướng cảm xúc, mức stress và giấc ngủ của riêng bạn.',
          tone: 'supportive',
        },
      ];
    }
    const fallbackList = [
      {
        title: 'Các chỉ số trong kỳ đang chọn',
        body:
          displayStress >= 7 || displaySleep < 6.5
            ? `Trong ${computedStats.recordsCount} lượt được chọn, stress trung bình là ${formatCommaDecimal(displayStress)}/10 và thời lượng ngủ trung bình là ${formatCommaDecimal(displaySleep)} giờ. Hãy xem lại những lượt gần đây và cân nhắc ưu tiên nghỉ ngơi.`
            : `Trong ${computedStats.recordsCount} lượt được chọn, stress trung bình là ${formatCommaDecimal(displayStress)}/10 và thời lượng ngủ trung bình là ${formatCommaDecimal(displaySleep)} giờ.`,
        tone: displayStress >= 7 || displaySleep < 6.5 ? 'caution' : 'supportive',
      },
    ];
    if (checkinStreak >= 2) {
      fallbackList.push({
        title: `Chuỗi đồng hành ${checkinStreak} ngày liên tiếp`,
        body: 'Thói quen tự rà soát cảm xúc đều đặn giúp bạn nhận ra sớm các tín hiệu mỏi mệt để chủ động nghỉ ngơi đúng lúc.',
        tone: 'positive',
      });
    }
    return fallbackList;
  }, [hasData, displayStress, displaySleep, checkinStreak, computedStats.recordsCount]);

  const periodLabelText =
    selectedPeriod === '7days'
      ? '7 lượt gần nhất'
      : selectedPeriod === '30days'
        ? '30 lượt gần nhất'
        : 'Toàn bộ lịch sử';

  const renderPeriodTabs = () => (
    <div
      role="tablist"
      aria-label="Bộ lọc kỳ thống kê"
      className="bg-surface-container-high/60 p-1 rounded-xl flex items-center border border-border-subtle w-full md:w-[360px]"
    >
      {[
        { id: '7days' as const, label: '7 lượt' },
        { id: '30days' as const, label: '30 lượt' },
        { id: 'month' as const, label: 'Toàn bộ' },
      ].map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={selectedPeriod === tab.id}
          onClick={() => setSelectedPeriod(tab.id)}
          className={`flex-1 py-1.5 px-3 text-center text-[12px] font-semibold rounded-lg transition-all whitespace-nowrap ${
            selectedPeriod === tab.id
              ? 'bg-surface-card text-primary card-shadow font-bold'
              : 'text-text-secondary hover:text-text-primary'
          }`}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );

  const renderOverviewSummary = () => (
    <>
      {/* Top Bar: Streak Badge + Period Filter */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E78A45]/35 bg-[#FFF0E1] px-3.5 py-1.5 text-[12px] font-bold text-[#A7683F] shadow-2xs">
            <span className="material-symbols-outlined filled text-[17px] text-[var(--color-secondary)]">
              local_fire_department
            </span>
            <span className="tabular-nums">{checkinStreak} ngày check-in liên tiếp</span>
          </span>
          <span className="text-[12px] text-[var(--color-text-secondary)] font-medium">
            {hasData
              ? `Đang xem ${computedStats.recordsCount}/${sortedCheckIns.length} lượt (${computedStats.daysCount} ngày)`
              : 'Chưa có lượt check-in'}
          </span>
        </div>

        <div className="md:hidden">{renderPeriodTabs()}</div>
      </section>

      {/* SECTION 1: Insights derived from the selected local period */}
      <section className="space-y-2.5">
        <div className="border-[2px] border-dashed border-[var(--color-primary)]/45 bg-[var(--color-sage-light)]/75 rounded-2xl p-4 md:p-5 space-y-3 transition-all">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-[var(--color-primary)]">
              <span className="material-symbols-outlined text-[17px]">auto_awesome</span>
              <span>Tổng quan kỳ này ({allAiInsights.length})</span>
            </span>
            <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-[11px] font-semibold text-[var(--color-primary)] border border-[var(--color-border)]">
              {periodLabelText}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {allAiInsights.map((insight, idx) => {
              const isCaution = insight.tone === 'caution';
              const isPositive = insight.tone === 'positive';
              return (
                <div
                  key={`${insight.title}-${idx}`}
                  className={`rounded-xl border p-3.5 transition-all ${
                    allAiInsights.length === 1 ? 'md:col-span-2' : ''
                  } ${
                    isCaution
                      ? 'border-[#E78A45]/40 bg-[#FFF8EF]'
                      : isPositive
                        ? 'border-[var(--color-primary)]/25 bg-white/85'
                        : 'border-[var(--color-border)] bg-[var(--color-surface)]/90'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[13px] font-bold text-[var(--color-primary)]">
                    <span
                      className={`material-symbols-outlined text-[17px] ${
                        isCaution ? 'text-[var(--color-secondary)]' : 'text-[var(--color-primary)]'
                      }`}
                    >
                      {isCaution ? 'wb_twilight' : isPositive ? 'verified' : 'spa'}
                    </span>
                    <span>{insight.title}</span>
                  </div>
                  <p className="mt-1 text-[13px] md:text-[13.5px] leading-relaxed text-[var(--color-primary-text)]">
                    {insight.body}
                  </p>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setShowWhyAiSummary((prev) => !prev)}
            className="text-[12.5px] font-bold text-[var(--color-primary)] hover:underline block text-left"
          >
            Vì sao có nhận xét này?
          </button>
          {showWhyAiSummary && (
            <p className="text-[12px] text-[var(--color-text-secondary)] leading-relaxed pt-2 border-t border-[var(--color-border)]">
              Các chỉ số trong kỳ được tính từ {computedStats.recordsCount} lượt check-in đã lưu trên thiết bị. Chuỗi liên tiếp dựa trên toàn bộ ngày đã check-in và chỉ được tính đến hôm nay hoặc hôm qua. Đây là thông tin tham khảo tự chăm sóc, không phải chẩn đoán y khoa.
            </p>
          )}
        </div>
      </section>

      {/* SECTION 2: 3 Dynamic Average Metric Cards */}
      <section className="grid grid-cols-3 gap-2.5 md:gap-4 pt-0.5">
        <div className="bg-[var(--color-sage-light)]/85 border border-[var(--color-border)] rounded-2xl p-3 md:p-5 flex flex-col items-center text-center justify-between min-h-[114px] shadow-2xs">
          <div className="flex items-center justify-center pt-0.5">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
          </div>
          <span className="text-[12px] md:text-[13px] font-medium text-[var(--color-primary-text)] mt-1.5">
            Tâm trạng TB
          </span>
          <div className="text-[20px] md:text-[26px] font-bold text-[var(--color-primary)] tracking-tight mt-1 tabular-nums">
            {hasData ? formatCommaDecimal(displayMood) : '--'}
            <span className="text-[12px] md:text-[13px] font-medium text-[var(--color-text-secondary)]">
              /10
            </span>
          </div>
        </div>

        <div className="bg-[var(--color-peach-light)]/90 border border-[var(--color-border)] rounded-2xl p-3 md:p-5 flex flex-col items-center text-center justify-between min-h-[114px] shadow-2xs">
          <div className="flex items-center justify-center pt-0.5">
            <svg
              width="27"
              height="27"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-secondary)"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <span className="text-[12px] md:text-[13px] font-medium text-[var(--color-secondary-text)] mt-1.5">
            Stress TB
          </span>
          <div className="text-[20px] md:text-[26px] font-bold text-[var(--color-primary)] tracking-tight mt-1 tabular-nums">
            {hasData ? formatCommaDecimal(displayStress) : '--'}
            <span className="text-[12px] md:text-[13px] font-medium text-[var(--color-text-secondary)]">
              /10
            </span>
          </div>
        </div>

        <div className="bg-[var(--color-primary-light)]/75 border border-[var(--color-border)] rounded-2xl p-3 md:p-5 flex flex-col items-center text-center justify-between min-h-[114px] shadow-2xs">
          <div className="flex items-center justify-center pt-0.5">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-primary-text)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </div>
          <span className="text-[12px] md:text-[13px] font-medium text-[var(--color-primary-text)] mt-1.5">
            Giấc ngủ TB
          </span>
          <div className="text-[20px] md:text-[26px] font-bold text-[var(--color-primary)] tracking-tight mt-1 whitespace-nowrap tabular-nums">
            {hasData ? formatCommaDecimal(displaySleep) : '--'}{' '}
            <span className="text-[11px] md:text-[12.5px] font-normal text-[var(--color-text-secondary)]">
              giờ/đêm
            </span>
          </div>
        </div>
      </section>
    </>
  );

  const renderDetailCharts = () => (
    <div className="space-y-4 md:space-y-6">
      {/* Period Control & Provenance */}
      <section className="space-y-3 md:flex md:items-center md:justify-between md:gap-4 md:space-y-0">
        <div className="md:hidden">
          <h2 className="text-[22px] font-bold text-text-primary tracking-tight">
            Phân tích &amp; Biểu đồ
          </h2>
          <p className="text-[12px] text-text-secondary mt-0.5">
            Cập nhật đồng bộ tất cả biểu đồ theo kỳ bạn chọn
          </p>
        </div>

        {renderPeriodTabs()}

        <div className="bg-surface-mint/60 border border-border-subtle rounded-xl p-3 flex items-start md:items-center gap-2 md:px-4">
          <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5 md:mt-0">
            verified_user
          </span>
          <p className="text-[11px] md:text-[12px] text-text-secondary leading-snug">
            <span className="font-semibold text-primary">
              Đang hiển thị {computedStats.recordsCount} lượt ({periodLabelText})
            </span>{' '}
            · Chuỗi {checkinStreak} ngày liên tiếp.
          </p>
        </div>
      </section>

      {!hasData ? (
        <section className="rounded-3xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center flex flex-col items-center gap-3">
          <MochiHappyCompanion className="w-24 h-24" />
          <h3 className="text-[17px] font-bold text-[var(--color-primary)]">
            Chưa có dữ liệu biểu đồ
          </h3>
          <p className="max-w-md text-[13px] text-[var(--color-text-secondary)]">
            Khi bạn hoàn thành Check-in đầu tiên, các đường cong cảm xúc, mức căng thẳng và thời lượng giấc ngủ sẽ hiển thị trực quan tại đây.
          </p>
        </section>
      ) : (
        <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0 lg:items-start">
          {/* Chart Card 1: Smooth Cubic Bezier Mood & Stress */}
          <section className="bg-surface-card rounded-2xl p-4 md:p-5 border border-border-subtle card-shadow space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-[16px] font-semibold text-text-primary">
                  Xu hướng Cảm xúc &amp; Stress
                </h2>
                <p className="text-[11px] text-text-secondary">
                  Đường cong mượt {computedStats.recordsCount} lượt ({periodLabelText})
                </p>
              </div>
              <div className="flex items-center gap-3 text-[11px] shrink-0">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />
                  <span className="text-text-primary font-medium">Tâm trạng</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-secondary)] inline-block" />
                  <span className="text-text-secondary font-medium">Stress</span>
                </div>
              </div>
            </div>

            <div className="relative w-full pt-1">
              <svg
                className="w-full h-40 md:h-48 overflow-visible"
                fill="none"
                viewBox="0 0 320 120"
              >
                <defs>
                  <linearGradient id="statsMoodAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1F5C43" stopOpacity="0.20" />
                    <stop offset="100%" stopColor="#1F5C43" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="statsStressAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E78A45" stopOpacity="0.09" />
                    <stop offset="100%" stopColor="#E78A45" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Y reference lines (10, 5, 0) */}
                <line
                  stroke="var(--color-border)"
                  strokeDasharray="3 3"
                  strokeWidth="0.85"
                  x1="12"
                  x2="308"
                  y1="18"
                  y2="18"
                />
                <line
                  stroke="var(--color-border)"
                  strokeDasharray="3 3"
                  strokeWidth="0.85"
                  x1="12"
                  x2="308"
                  y1="60"
                  y2="60"
                />
                <line
                  stroke="var(--color-border)"
                  strokeDasharray="3 3"
                  strokeWidth="0.85"
                  x1="12"
                  x2="308"
                  y1="102"
                  y2="102"
                />
                <text x="2" y="21" fill="var(--color-text-muted)" fontSize="8.5" fontWeight="600">
                  10
                </text>
                <text x="4" y="63" fill="var(--color-text-muted)" fontSize="8.5" fontWeight="600">
                  5
                </text>
                <text x="4" y="105" fill="var(--color-text-muted)" fontSize="8.5" fontWeight="600">
                  0
                </text>

                {/* Active vertical guide */}
                {activeSvgPoint && (
                  <line
                    x1={activeSvgPoint.x}
                    x2={activeSvgPoint.x}
                    y1="16"
                    y2="104"
                    stroke="#1F5C43"
                    strokeOpacity="0.22"
                    strokeWidth="1.2"
                    strokeDasharray="3 3"
                  />
                )}

                {/* Soft Linear Gradient Fill under Mood Bezier Curve */}
                {moodAreaPath && <path d={moodAreaPath} fill="url(#statsMoodAreaGrad)" />}

                {/* Smooth Cubic Bezier Curves */}
                {stressLinePath && (
                  <path
                    d={stressLinePath}
                    stroke="var(--color-secondary)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                  />
                )}
                {moodLinePath && (
                  <path
                    d={moodLinePath}
                    stroke="#1F5C43"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.8"
                  />
                )}

                {/* Interactive Data Points */}
                {chartPoints.map((pt, idx) => {
                  const isSelected = idx === safeActiveIdx;
                  const compactDots = chartPoints.length > 14;
                  return (
                    <g
                      key={`${pt.date}-${idx}`}
                      className="cursor-pointer"
                      onClick={() => setActiveDayIndex(idx)}
                    >
                      <circle cx={pt.x} cy={pt.moodY} r="12" fill="transparent" />
                      <circle cx={pt.x} cy={pt.stressY} r="10" fill="transparent" />
                      {isSelected && (
                        <>
                          <circle
                            cx={pt.x}
                            cy={pt.moodY}
                            r="8.5"
                            fill="#1F5C43"
                            fillOpacity="0.16"
                          />
                          <circle
                            cx={pt.x}
                            cy={pt.stressY}
                            r="7.5"
                            fill="#E78A45"
                            fillOpacity="0.16"
                          />
                        </>
                      )}
                      <circle
                        cx={pt.x}
                        cy={pt.stressY}
                        fill="var(--color-secondary)"
                        r={isSelected ? 5 : compactDots ? 2.8 : 3.8}
                        stroke="var(--color-surface)"
                        strokeWidth="1.5"
                      />
                      <circle
                        cx={pt.x}
                        cy={pt.moodY}
                        fill="#1F5C43"
                        r={isSelected ? 5.5 : compactDots ? 3 : 4.2}
                        stroke="var(--color-surface)"
                        strokeWidth="1.8"
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Synchronized interactive selector strip */}
              <div
                className={
                  computedStats.periodSeries.length <= 8
                    ? 'grid text-center pt-2 border-t border-border-subtle/50'
                    : 'flex gap-1.5 overflow-x-auto no-scrollbar pt-2 pb-1 border-t border-border-subtle/50'
                }
                style={
                  computedStats.periodSeries.length <= 8
                    ? {
                        gridTemplateColumns: `repeat(${Math.max(
                          1,
                          computedStats.periodSeries.length
                        )}, minmax(0, 1fr))`,
                      }
                    : undefined
                }
              >
                {computedStats.periodSeries.map((d, idx) => {
                  const isSelected = safeActiveIdx === idx;
                  return (
                    <button
                      key={`${d.date}-sel-${idx}`}
                      onClick={() => setActiveDayIndex(idx)}
                      className={`flex flex-col items-center py-1 px-1.5 rounded-lg transition-all shrink-0 ${
                        computedStats.periodSeries.length > 8 ? 'min-w-[44px]' : ''
                      } ${
                        isSelected
                          ? 'bg-surface-mint/80 ring-1 ring-[var(--color-primary)]/25'
                          : 'hover:bg-page-background'
                      }`}
                      type="button"
                    >
                      <span
                        className={`text-[10.5px] font-medium ${
                          isSelected ? 'text-primary font-bold' : 'text-text-secondary'
                        }`}
                      >
                        {d.day}
                      </span>
                      <span className="text-[9.5px] text-[var(--color-text-muted)] tabular-nums">
                        {d.date}
                      </span>
                      <span className="text-[10px] font-semibold text-primary leading-tight mt-0.5 tabular-nums">
                        {d.mood}
                        <span className="text-[var(--color-secondary)]">/{d.stress}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {activePoint && (
              <div className="bg-surface-container-low p-2.5 rounded-xl flex flex-wrap items-center justify-between gap-2 text-[11.5px] text-text-secondary border border-[var(--color-border)]/70">
                <span className="flex items-center gap-1 font-medium">
                  <span className="material-symbols-outlined text-[16px] text-primary">
                    touch_app
                  </span>
                  Điểm chọn {activePoint.day} ({activePoint.date}):
                </span>
                <span className="text-primary font-bold tabular-nums">
                  Mood {activePoint.mood}/10 · Stress {activePoint.stress}/10 · Ngủ{' '}
                  {formatCommaDecimal(activePoint.sleep)}h
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={() => toggleComment('mood-stress')}
              className="w-full pt-2 flex items-center justify-between text-[12.5px] font-semibold text-[var(--color-primary)] border-t border-border-subtle/70 hover:underline transition-all"
            >
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[17px]">auto_awesome</span>
                <span>Nhận xét của AI về xu hướng cảm xúc &amp; stress</span>
              </span>
              <span className="material-symbols-outlined text-[18px]">
                {expandedComments['mood-stress'] ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
              </span>
            </button>

            {expandedComments['mood-stress'] && (
              <div className="border-[2px] border-dashed border-[var(--color-primary)]/50 bg-[var(--color-sage-light)]/75 rounded-2xl p-3.5 text-[12.5px] text-[var(--color-primary-text)] leading-relaxed transition-all">
                <div className="flex items-center gap-1.5 font-bold text-[var(--color-primary)] mb-1">
                  <span className="material-symbols-outlined text-[16px]">psychology</span>
                  <span>Góc nhìn phân tích động ({periodLabelText})</span>
                </div>
                <p>
                  Trên {computedStats.recordsCount} lượt ghi nhận, tâm trạng trung bình đạt{' '}
                  {formatCommaDecimal(displayMood)}/10 và mức stress trung bình là{' '}
                  {formatCommaDecimal(displayStress)}/10. Những ngày stress dịu xuống ≤ 5/10 giúp khí sắc tích cực phục hồi rõ rệt.
                </p>
              </div>
            )}
          </section>

          {/* Chart Card 2: Synchronized Sleep Analysis */}
          <section className="bg-surface-card rounded-2xl p-4 md:p-5 border border-border-subtle card-shadow space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[16px] font-semibold text-text-primary">
                  Thời lượng &amp; Giấc ngủ
                </h2>
                <p className="text-[11px] text-text-secondary">
                  Chu kỳ hồi phục ({computedStats.recordsCount} đêm · {periodLabelText})
                </p>
              </div>
              <div className="text-right">
                <div className="text-[18px] text-primary font-bold tabular-nums">
                  {formatCommaDecimal(displaySleep)}{' '}
                  <span className="text-[12px] font-normal text-text-secondary">giờ/đêm</span>
                </div>
                <span className="text-[11px] text-text-secondary">Trung bình kỳ chọn</span>
              </div>
            </div>

            <div className="pt-2 pb-1 overflow-x-auto no-scrollbar">
              <div
                className={`flex items-end justify-between h-32 md:h-36 gap-2 px-1 ${
                  computedStats.periodSeries.length > 10 ? 'min-w-max' : ''
                }`}
              >
                {computedStats.periodSeries.map((d, idx) => {
                  const isRestless = d.sleep < 7.0;
                  const isTop = d.sleep >= 8.0;
                  const isSelected = idx === safeActiveIdx;
                  return (
                    <button
                      key={`${d.date}-sleep-${idx}`}
                      type="button"
                      onClick={() => setActiveDayIndex(idx)}
                      className={`flex-1 min-w-[32px] flex flex-col items-center gap-1 h-full justify-end rounded-lg px-0.5 transition ${
                        isSelected ? 'bg-[var(--color-surface-mint)]/60' : ''
                      }`}
                    >
                      <span
                        className={`text-[10px] font-medium tabular-nums ${
                          isTop
                            ? 'text-primary font-bold'
                            : isRestless
                              ? 'text-tertiary font-semibold'
                              : 'text-text-secondary'
                        }`}
                      >
                        {formatCommaDecimal(d.sleep)}h
                      </span>
                      <div
                        className={`w-full max-w-[34px] rounded-t-md transition-all ${
                          isTop
                            ? 'bg-primary'
                            : isRestless
                              ? 'bg-[#F3C8A6] hover:bg-[var(--color-secondary)]'
                              : 'bg-primary/80 hover:bg-primary'
                        }`}
                        style={{ height: `${Math.max(12, Math.min(100, (d.sleep / 10) * 100))}%` }}
                      />
                      <span
                        className={`text-[10.5px] mt-0.5 font-medium ${
                          isSelected || isTop ? 'text-primary font-bold' : 'text-text-secondary'
                        }`}
                      >
                        {d.day}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="bg-surface-mint/70 rounded-xl p-2.5 flex items-center gap-2 border border-border-subtle">
                <span className="material-symbols-outlined text-primary text-[20px]">bedtime</span>
                <div>
                  <div className="text-[14px] font-semibold text-text-primary tabular-nums">
                    {computedStats.goodSleepNights} đêm
                  </div>
                  <div className="text-[11px] text-text-secondary leading-none">
                    Ngon giấc (≥7h)
                  </div>
                </div>
              </div>
              <div className="bg-surface-container-high/60 rounded-xl p-2.5 flex items-center gap-2 border border-border-subtle">
                <span className="material-symbols-outlined text-tertiary text-[20px]">
                  timelapse
                </span>
                <div>
                  <div className="text-[14px] font-semibold text-text-primary tabular-nums">
                    {computedStats.restlessSleepNights} đêm
                  </div>
                  <div className="text-[11px] text-text-secondary leading-none">
                    Chập chờn (&lt;7h)
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => toggleComment('sleep')}
              className="w-full pt-2 flex items-center justify-between text-[12.5px] font-semibold text-[var(--color-primary)] border-t border-border-subtle/70 hover:underline transition-all"
            >
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[17px]">auto_awesome</span>
                <span>Nhận xét của AI về chất lượng giấc ngủ</span>
              </span>
              <span className="material-symbols-outlined text-[18px]">
                {expandedComments['sleep'] ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
              </span>
            </button>

            {expandedComments['sleep'] && (
              <div className="border-[2px] border-dashed border-[var(--color-primary)]/50 bg-[var(--color-sage-light)]/75 rounded-2xl p-3.5 text-[12.5px] text-[var(--color-primary-text)] leading-relaxed transition-all">
                <div className="flex items-center gap-1.5 font-bold text-[var(--color-primary)] mb-1">
                  <span className="material-symbols-outlined text-[16px]">bedtime</span>
                  <span>Góc nhìn phục hồi năng lượng ({periodLabelText})</span>
                </div>
                <p>
                  Trung bình bạn ngủ {formatCommaDecimal(displaySleep)}h/đêm (
                  {computedStats.goodSleepNights}/{computedStats.recordsCount} đêm đạt chuẩn ≥7h). Giữ lịch tắt màn hình trước 23:00 giúp hạ nhiệt căng thẳng vào sáng hôm sau.
                </p>
              </div>
            )}
          </section>

          {/* Chart Card 3: Synchronized Emotion Tags Breakdown */}
          <section className="bg-surface-card rounded-2xl p-4 md:p-5 border border-border-subtle card-shadow space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-[16px] font-semibold text-text-primary">
                  Phân bổ nhãn cảm xúc
                </h2>
                <p className="text-[11px] text-text-secondary">{periodLabelText}</p>
              </div>
              <span className="text-[11px] text-text-secondary bg-surface-container-high px-2.5 py-0.5 rounded-full font-medium tabular-nums">
                {computedStats.totalEmotionTags} nhãn ghi nhận
              </span>
            </div>

            {computedStats.emotionBreakdown.length === 0 ? (
              <p className="text-[12.5px] text-text-secondary py-4 text-center">
                Chưa có nhãn cảm xúc nào được chọn trong kỳ này.
              </p>
            ) : (
              <div className="space-y-2.5">
                {computedStats.emotionBreakdown.map((item, idx) => {
                  const barColors = [
                    'bg-primary',
                    'bg-[var(--color-secondary)]',
                    'bg-[#5B8E6D]',
                    'bg-[#84B48E]',
                    'bg-[#CFA07A]',
                  ];
                  const colorCls = barColors[idx % barColors.length];
                  return (
                    <div key={item.label} className="space-y-1">
                      <div className="flex justify-between items-center text-[13px] gap-2">
                        <span className="flex items-center gap-1.5 font-medium text-text-primary truncate">
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${colorCls}`} />
                          <span className="truncate">{item.label}</span>
                        </span>
                        <span className="text-primary font-bold text-[12.5px] tabular-nums shrink-0">
                          {item.count} lần · {item.pct}%
                        </span>
                      </div>
                      <div className="w-full bg-surface-container h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`${colorCls} h-full rounded-full transition-all duration-300`}
                          style={{ width: `${item.pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              type="button"
              onClick={() => toggleComment('emotions')}
              className="w-full pt-2 flex items-center justify-between text-[12.5px] font-semibold text-[var(--color-primary)] border-t border-border-subtle/70 hover:underline transition-all"
            >
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[17px]">auto_awesome</span>
                <span>Nhận xét của AI về phổ cảm xúc</span>
              </span>
              <span className="material-symbols-outlined text-[18px]">
                {expandedComments['emotions'] ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
              </span>
            </button>

            {expandedComments['emotions'] && (
              <div className="border-[2px] border-dashed border-[var(--color-primary)]/50 bg-[var(--color-sage-light)]/75 rounded-2xl p-3.5 text-[12.5px] text-[var(--color-primary-text)] leading-relaxed transition-all">
                <div className="flex items-center gap-1.5 font-bold text-[var(--color-primary)] mb-1">
                  <span className="material-symbols-outlined text-[16px]">sentiment_satisfied</span>
                  <span>Góc nhìn thấu cảm AI</span>
                </div>
                <p>
                  Phổ cảm xúc phản ánh trực tiếp {computedStats.totalEmotionTags} nhãn cảm xúc bạn đã chọn trong {periodLabelText}. Gọi tên đúng cảm xúc đã là bước đầu tiên giúp hệ thần kinh dịu lại.
                </p>
              </div>
            )}
          </section>

          {/* Card 4: Full AI Insights List + Streak Badge */}
          <section className="bg-gradient-to-br from-surface-mint via-surface-card to-surface-container-low rounded-2xl p-4 md:p-5 border border-border-subtle card-shadow space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  auto_awesome
                </span>
                <span className="text-[13.5px] text-primary font-bold">
                  Tổng hợp Nhận định AI ({allAiInsights.length})
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#FFF0E1] text-[#A7683F] px-2.5 py-0.5 rounded-full border border-[#E78A45]/30 tabular-nums">
                <span className="material-symbols-outlined filled text-[14px] text-[var(--color-secondary)]">
                  local_fire_department
                </span>
                {checkinStreak} ngày liên tiếp
              </span>
            </div>

            <div className="space-y-2.5">
              {allAiInsights.map((ins, idx) => (
                <div
                  key={`detail-ins-${idx}`}
                  className="rounded-xl border border-border-subtle bg-white/85 p-3 space-y-1"
                >
                  <h3 className="text-[13px] font-bold text-primary">{ins.title}</h3>
                  <p className="text-[13px] text-text-primary leading-relaxed">{ins.body}</p>
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-between text-[11.5px] text-text-secondary border-t border-border-subtle/80">
              <span>Gợi ý nhẹ nhàng: Duy trì giờ nghỉ ngơi cố định trước 23:00</span>
              <button
                onClick={onOpenSelfCare}
                className="text-primary font-bold flex items-center gap-0.5 hover:underline whitespace-nowrap"
                type="button"
              >
                Tự chăm sóc{' '}
                <span className="material-symbols-outlined text-[15px]">chevron_right</span>
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex-1 flex flex-col bg-page-background text-text-primary px-4 pt-1 pb-24 md:pb-12 md:px-8 md:pt-6">
      <div className="w-full md:max-w-6xl md:mx-auto space-y-4 md:space-y-6">
        {viewMode === 'overview' ? (
          <header className="flex md:hidden justify-between items-center w-full py-2 shrink-0 z-20">
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenSettings}
                className="w-8 h-8 rounded-full bg-surface-mint flex items-center justify-center text-primary font-bold text-[13px] border border-border-subtle"
                type="button"
                aria-label="Cài đặt tài khoản"
              >
                <span className="material-symbols-outlined text-[20px]">account_circle</span>
              </button>
              <span className="text-[18px] font-semibold text-text-primary tracking-tight">
                MINDCARE
              </span>
            </div>
            <button
              onClick={onOpenSettings}
              aria-label="Cài đặt"
              className="w-9 h-9 rounded-full flex items-center justify-center text-primary hover:bg-surface-mint active:scale-95 transition-all bg-surface-card border border-border-subtle"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">settings</span>
            </button>
          </header>
        ) : (
          <header className="flex md:hidden justify-between items-center w-full py-2 shrink-0 z-20">
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleBackToOverview}
                className="w-9 h-9 rounded-full bg-surface-card flex items-center justify-center text-primary font-bold text-[13px] border border-border-subtle active:scale-95 transition-all hover:bg-surface-mint"
                type="button"
                aria-label="Quay lại tổng quan"
              >
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              </button>
              <span className="text-[17px] font-bold text-text-primary tracking-tight">
                Chi tiết thống kê
              </span>
            </div>
            <button
              onClick={onOpenSettings}
              aria-label="Cài đặt"
              className="w-9 h-9 rounded-full flex items-center justify-center text-primary hover:bg-surface-mint active:scale-95 transition-all bg-surface-card border border-border-subtle"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">settings</span>
            </button>
          </header>
        )}

        <section className={`${viewMode === 'overview' ? 'block' : 'hidden md:block'} space-y-1`}>
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-[24px] md:text-[28px] font-bold text-text-primary tracking-tight">
              Thống kê &amp; Thấu hiểu
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenSelfCare}
                type="button"
                className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-[12.5px] font-bold text-[var(--color-primary)] shadow-2xs transition hover:bg-[var(--color-surface-mint)]"
              >
                <span className="material-symbols-outlined text-[17px]">spa</span>
                <span>Thói quen chăm sóc</span>
              </button>
              <span className="material-symbols-outlined text-primary text-[22px] md:hidden">
                insights
              </span>
            </div>
          </div>
          <p className="text-[12.5px] md:text-[14px] text-text-secondary">
            Tổng quan cảm xúc, mức độ stress và giấc ngủ tính toán động từ dữ liệu thực tế
          </p>
        </section>

        <div className={`${viewMode === 'overview' ? 'block' : 'hidden md:block'} space-y-4`}>
          {renderOverviewSummary()}
        </div>

        {viewMode === 'overview' && (
              <div className="md:hidden space-y-4">
                <div className="pt-2">
                  <button
                    onClick={handleOpenDetail}
                    className="w-full py-4 px-4 rounded-2xl bg-[var(--color-primary)] text-white font-bold text-[14px] shadow-md flex items-center justify-center gap-2 transition hover:brightness-105 active:scale-[0.99]"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[20px]">query_stats</span>
                    <span>Xem biểu đồ chi tiết</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </div>
                <div className="text-center pt-3 pb-2">
                  <p className="text-[11.5px] text-text-secondary flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-primary">spa</span>
                    Mỗi tuần là một nhịp điệu riêng. Hãy trân trọng từng khoảnh khắc của chính bạn.
                  </p>
                </div>
              </div>
        )}

        <div className={viewMode === 'detail' ? 'block' : 'hidden md:block'}>
              {renderDetailCharts()}
              {viewMode === 'detail' && (
                <div className="pt-4 md:hidden">
                  <button
                    onClick={handleBackToOverview}
                    className="w-full py-3.5 px-4 rounded-2xl border border-border-subtle bg-surface-card text-text-primary font-bold text-[13.5px] flex items-center justify-center gap-2 transition hover:bg-surface-mint/60 active:scale-[0.99]"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[19px]">arrow_back</span>
                    <span>Quay lại tổng quan</span>
                  </button>
                </div>
              )}
        </div>
      </div>
    </div>
  );
};
