import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CheckIn, JournalEntry } from '../types';
import { MochiHappyCompanion } from './MochiIllustrations';

interface WeeklyRecapOverlayProps {
  isOpen: boolean;
  isShort?: boolean;
  checkIns?: CheckIn[];
  journals?: JournalEntry[];
  completedExerciseCount?: number;
  onClose: () => void;
  onNavigateStats: () => void;
  onOpenCheckIn: () => void;
  onOpenJournal: () => void;
}

const WEEKDAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'] as const;
const WEEKDAY_FULL_NAMES = [
  'Thứ Hai',
  'Thứ Ba',
  'Thứ Tư',
  'Thứ Năm',
  'Thứ Sáu',
  'Thứ Bảy',
  'Chủ Nhật',
] as const;

const X_COORDS = [22, 68, 114, 160, 206, 252, 298];

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

function extractEntryDateKey(dateStr?: string, createdAt?: number): string {
  if (dateStr) {
    const iso = dateStr.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (iso) {
      return `${iso[1]}-${iso[2].padStart(2, '0')}-${iso[3].padStart(2, '0')}`;
    }
    const dmy = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (dmy) {
      return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;
    }
  }
  if (createdAt && !Number.isNaN(createdAt)) {
    return toDateKey(new Date(createdAt));
  }
  return '';
}

function countVietnameseWords(text: string): number {
  const cleaned = (text || '').trim();
  if (!cleaned) return 0;
  return cleaned.split(/\s+/).length;
}

function formatComma(num: number): string {
  return num.toFixed(1).replace('.', ',');
}

function buildSegmentedSmoothPaths(
  points: { x: number; y: number | null }[]
): { segments: string[]; dots: { x: number; y: number; isolated: boolean; idx: number }[] } {
  const segments: string[] = [];
  const dots: { x: number; y: number; isolated: boolean; idx: number }[] = [];
  let run: { x: number; y: number; idx: number }[] = [];

  const flushRun = () => {
    if (run.length >= 2) {
      let d = `M ${run[0].x} ${run[0].y}`;
      for (let i = 0; i < run.length - 1; i++) {
        const p0 = run[Math.max(0, i - 1)];
        const p1 = run[i];
        const p2 = run[i + 1];
        const p3 = run[Math.min(run.length - 1, i + 2)];
        const t = 0.2;
        const cp1x = Number((p1.x + (p2.x - p0.x) * t).toFixed(1));
        const cp1y = Number(Math.max(16, Math.min(92, p1.y + (p2.y - p0.y) * t)).toFixed(1));
        const cp2x = Number((p2.x - (p3.x - p1.x) * t).toFixed(1));
        const cp2y = Number(Math.max(16, Math.min(92, p2.y - (p3.y - p1.y) * t)).toFixed(1));
        d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
      }
      segments.push(d);
      run.forEach((pt) => dots.push({ x: pt.x, y: pt.y, isolated: false, idx: pt.idx }));
    } else if (run.length === 1) {
      dots.push({ x: run[0].x, y: run[0].y, isolated: true, idx: run[0].idx });
    }
    run = [];
  };

  points.forEach((pt, idx) => {
    if (pt.y === null) {
      flushRun();
    } else {
      run.push({ x: pt.x, y: pt.y, idx });
    }
  });
  flushRun();

  return { segments, dots };
}

export const WeeklyRecapOverlay: React.FC<WeeklyRecapOverlayProps> = ({
  isOpen,
  isShort = false,
  checkIns = [],
  journals = [],
  completedExerciseCount = 0,
  onClose,
  onNavigateStats,
  onOpenCheckIn,
  onOpenJournal,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareNotice, setShareNotice] = useState<string | null>(null);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [forceFullSlides, setForceFullSlides] = useState(false);

  const [shareIncludeRange, setShareIncludeRange] = useState(true);
  const [shareIncludeCheckin, setShareIncludeCheckin] = useState(true);
  const [shareIncludePractice, setShareIncludePractice] = useState(true);
  const [shareIncludeMoodSleep, setShareIncludeMoodSleep] = useState(true);

  const effectiveShort = isShort && !forceFullSlides;
  const totalSlides = effectiveShort ? 2 : 8;
  const progressTimerRef = useRef<number | null>(null);

  // 100% Dynamic Weekly Recap Computation
  const recap = useMemo(() => {
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startMidnight = new Date(todayMidnight);
    startMidnight.setDate(todayMidnight.getDate() - 6);

    const prevEndMidnight = new Date(startMidnight);
    prevEndMidnight.setDate(startMidnight.getDate() - 1);
    const prevStartMidnight = new Date(prevEndMidnight);
    prevStartMidnight.setDate(prevEndMidnight.getDate() - 6);

    const sameMonth =
      startMidnight.getMonth() === todayMidnight.getMonth() &&
      startMidnight.getFullYear() === todayMidnight.getFullYear();

    const dateRangeLabel = sameMonth
      ? `${startMidnight.getDate()} – ${todayMidnight.getDate()} tháng ${
          todayMidnight.getMonth() + 1
        }, ${todayMidnight.getFullYear()}`
      : `${String(startMidnight.getDate()).padStart(2, '0')}/${String(
          startMidnight.getMonth() + 1
        ).padStart(2, '0')} – ${String(todayMidnight.getDate()).padStart(2, '0')}/${String(
          todayMidnight.getMonth() + 1
        ).padStart(2, '0')}/${todayMidnight.getFullYear()}`;

    // Map checkIns & journals by dateKey
    const checkInByDate = new Map<string, CheckIn>();
    const prevWeekCheckIns: CheckIn[] = [];
    const startKey = toDateKey(startMidnight);
    const endKey = toDateKey(todayMidnight);
    const prevStartKey = toDateKey(prevStartMidnight);
    const prevEndKey = toDateKey(prevEndMidnight);

    for (const c of checkIns) {
      const k = extractEntryDateKey(c.date, c.createdAt);
      if (!k) continue;
      if (k >= startKey && k <= endKey && !checkInByDate.has(k)) {
        checkInByDate.set(k, c);
      } else if (k >= prevStartKey && k <= prevEndKey) {
        prevWeekCheckIns.push(c);
      }
    }

    const journalsInWeek: JournalEntry[] = [];
    const wordsByDate = new Map<string, number>();

    for (const j of journals) {
      const k = extractEntryDateKey(j.date, j.createdAt);
      if (!k) continue;
      if (k >= startKey && k <= endKey) {
        journalsInWeek.push(j);
        const w = countVietnameseWords(`${j.title || ''} ${j.content || ''}`);
        wordsByDate.set(k, (wordsByDate.get(k) || 0) + w);
      }
    }

    // Map exact 7 rolling days onto the 7 columns T2..CN (every weekday occurs once in 7 consecutive days)
    const rollingDaysByWeekday = new Map<number, Date>();
    const chronologicalCheckIns: CheckIn[] = [];
    for (let offset = 0; offset < 7; offset++) {
      const d = new Date(startMidnight);
      d.setDate(startMidnight.getDate() + offset);
      const wIdx = (d.getDay() + 6) % 7; // 0 = T2 .. 6 = CN
      rollingDaysByWeekday.set(wIdx, d);
      const ci = checkInByDate.get(toDateKey(d));
      if (ci) chronologicalCheckIns.push(ci);
    }

    const columns = WEEKDAY_LABELS.map((label, wIdx) => {
      const dateObj = rollingDaysByWeekday.get(wIdx) || todayMidnight;
      const dateKey = toDateKey(dateObj);
      const shortDate = `${String(dateObj.getDate()).padStart(2, '0')}/${String(
        dateObj.getMonth() + 1
      ).padStart(2, '0')}`;
      const ci = checkInByDate.get(dateKey) || null;
      const words = wordsByDate.get(dateKey) || 0;
      const isToday = dateKey === endKey;

      return {
        label,
        fullWeekday: WEEKDAY_FULL_NAMES[wIdx],
        dateKey,
        shortDate,
        isToday,
        hasCheckIn: Boolean(ci),
        hasActivity: Boolean(ci) || words > 0,
        mood: ci ? ci.mood : null,
        stress: ci ? ci.stress : null,
        sleepHours: ci ? ci.sleepHours : null,
        words,
      };
    });

    const checkedInDaysCount = columns.filter((c) => c.hasCheckIn).length;
    const activeDaysCount = columns.filter((c) => c.hasActivity).length;
    const journalCount = journalsInWeek.length;
    const totalWords = Array.from(wordsByDate.values()).reduce((s, v) => s + v, 0);
    const allTimeWords = journals.reduce(
      (s, j) => s + countVietnameseWords(`${j.title || ''} ${j.content || ''}`),
      0
    );

    const maxWordCol = columns.reduce(
      (best, col) => (col.words > best.words ? col : best),
      columns[0]
    );
    const maxWordsVal = Math.max(1, ...columns.map((c) => c.words));

    // Mood stats
    const validMoodCols = columns.filter((c) => c.mood !== null);
    const avgMood =
      validMoodCols.length > 0
        ? Number(
            (
              validMoodCols.reduce((sum, c) => sum + (c.mood || 0), 0) / validMoodCols.length
            ).toFixed(1)
          )
        : 0;

    const bestMoodCol =
      validMoodCols.length > 0
        ? validMoodCols.reduce((best, col) => ((col.mood || 0) >= (best.mood || 0) ? col : best))
        : null;

    const moodDescriptor =
      validMoodCols.length === 0
        ? { emoji: '🌱', text: 'Đang chờ ghi nhận' }
        : avgMood >= 7.5
          ? { emoji: '😊', text: 'Tích cực & Ấm áp' }
          : avgMood >= 5.5
            ? { emoji: '🙂', text: 'Khá ổn định' }
            : avgMood >= 4
              ? { emoji: '🌿', text: 'Đang cân bằng lại' }
              : { emoji: '🫂', text: 'Cần nghỉ ngơi dịu dàng' };

    // Stress stats & actual delta
    const validStressCols = columns.filter((c) => c.stress !== null);
    const avgStress =
      validStressCols.length > 0
        ? Number(
            (
              validStressCols.reduce((sum, c) => sum + (c.stress || 0), 0) /
              validStressCols.length
            ).toFixed(1)
          )
        : 0;

    let stressDelta: number | null = null;
    let stressComparisonBasis = '';
    if (validStressCols.length > 0 && prevWeekCheckIns.length > 0) {
      const prevAvg =
        prevWeekCheckIns.reduce((s, c) => s + c.stress, 0) / prevWeekCheckIns.length;
      stressDelta = Number((avgStress - prevAvg).toFixed(1));
      stressComparisonBasis = 'so với 7 ngày trước đó';
    } else if (chronologicalCheckIns.length >= 2) {
      const mid = Math.floor(chronologicalCheckIns.length / 2);
      const firstHalf = chronologicalCheckIns.slice(0, mid);
      const secondHalf = chronologicalCheckIns.slice(mid);
      const earlyAvg = firstHalf.reduce((s, c) => s + c.stress, 0) / firstHalf.length;
      const lateAvg = secondHalf.reduce((s, c) => s + c.stress, 0) / secondHalf.length;
      stressDelta = Number((lateAvg - earlyAvg).toFixed(1));
      stressComparisonBasis = 'so với đầu kỳ';
    }

    // Sleep stats across 7 days
    const validSleepCols = columns.filter((c) => c.sleepHours !== null);
    const avgSleep =
      validSleepCols.length > 0
        ? Number(
            (
              validSleepCols.reduce((sum, c) => sum + (c.sleepHours || 0), 0) /
              validSleepCols.length
            ).toFixed(1)
          )
        : 0;
    const goodSleepNights = validSleepCols.filter((c) => (c.sleepHours || 0) >= 7).length;

    // Self-care practice minutes (exact durations from completed exercises: ~3 min/exercise)
    const practiceCount = Math.max(0, completedExerciseCount);
    const practiceMinutes =
      practiceCount === 0
        ? 0
        : practiceCount === 1
          ? 3
          : practiceCount === 2
            ? 5
            : practiceCount === 3
              ? 7
              : practiceCount * 2 + 1;

    return {
      dateRangeLabel,
      columns,
      checkedInDaysCount,
      activeDaysCount,
      journalCount,
      totalWords,
      allTimeJournals: journals.length,
      allTimeWords,
      maxWordCol,
      maxWordsVal,
      avgMood,
      bestMoodCol,
      moodDescriptor,
      avgStress,
      stressDelta,
      stressComparisonBasis,
      avgSleep,
      goodSleepNights,
      practiceCount,
      practiceMinutes,
    };
  }, [checkIns, journals, completedExerciseCount]);

  const moodSvg = useMemo(() => {
    const pts = recap.columns.map((col, idx) => ({
      x: X_COORDS[idx],
      y:
        col.mood !== null
          ? Number((88 - (Math.max(1, Math.min(10, col.mood)) / 10) * 68).toFixed(1))
          : null,
    }));
    return buildSegmentedSmoothPaths(pts);
  }, [recap.columns]);

  const stressSvg = useMemo(() => {
    const pts = recap.columns.map((col, idx) => ({
      x: X_COORDS[idx],
      y:
        col.stress !== null
          ? Number((88 - (Math.max(0, Math.min(10, col.stress)) / 10) * 68).toFixed(1))
          : null,
    }));
    return buildSegmentedSmoothPaths(pts);
  }, [recap.columns]);

  // Check prefers-reduced-motion
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(media.matches);
    const handler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentSlide(0);
      setProgress(0);
      setIsPaused(false);
      setShowShareModal(false);
      setShareNotice(null);
      setForceFullSlides(false);
    }
  }, [isOpen, isShort]);

  // Progress Bar timer (8 seconds linear per slide)
  useEffect(() => {
    if (!isOpen || isReducedMotion) return;

    if (currentSlide >= totalSlides - 1) {
      setProgress(100);
      return;
    }

    if (isPaused || showShareModal) {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      return;
    }

    const DURATION_MS = 8000;
    const STEP_MS = 40;
    const increment = (STEP_MS / DURATION_MS) * 100;

    progressTimerRef.current = window.setInterval(() => {
      setProgress((prev) => {
        if (prev + increment >= 100) {
          if (currentSlide < totalSlides - 1) {
            setCurrentSlide((curr) => curr + 1);
            return 0;
          }
          return 100;
        }
        return prev + increment;
      });
    }, STEP_MS);

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [isOpen, isPaused, currentSlide, totalSlides, isReducedMotion, showShareModal]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        if (currentSlide < totalSlides - 1) {
          setCurrentSlide((prev) => prev + 1);
          setProgress(0);
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentSlide > 0) {
          setCurrentSlide((prev) => prev - 1);
          setProgress(0);
        }
      } else if (e.key === 'Escape') {
        if (showShareModal) {
          setShowShareModal(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentSlide, totalSlides, onClose, showShareModal]);

  if (!isOpen) return null;

  const buildSummaryText = (useSelectiveFlags = false) => {
    const lines: string[] = ['🌿 MindCare · Tóm tắt hành trình tuần ấm áp'];
    if (!useSelectiveFlags || shareIncludeRange) {
      lines.push(`• Kỳ nhìn lại: ${recap.dateRangeLabel}`);
    }
    if (!useSelectiveFlags || shareIncludeCheckin) {
      lines.push(
        `• Ghé thăm & Check-in: ${recap.checkedInDaysCount}/7 ngày | Nhật ký: ${recap.journalCount} bài (${recap.totalWords} từ)`
      );
    }
    if (!useSelectiveFlags || shareIncludeMoodSleep) {
      const moodPart =
        recap.checkedInDaysCount > 0
          ? `Mood TB ${formatComma(recap.avgMood)}/10 · Stress TB ${formatComma(
              recap.avgStress
            )}/10 · Giấc ngủ TB ${formatComma(recap.avgSleep)}h/đêm`
          : 'Đang bắt đầu ghi nhận nhịp cảm xúc & giấc ngủ';
      lines.push(`• Nhịp sinh học: ${moodPart}`);
    }
    if (!useSelectiveFlags || shareIncludePractice) {
      lines.push(
        `• Tự chăm sóc: ${recap.practiceCount} bài thực hành (${recap.practiceMinutes} phút lắng lại)`
      );
    }
    lines.push('✨ Từng bước nhỏ dịu dàng đều đáng trân trọng.');
    return lines.join('\n');
  };

  const triggerShareOrCopy = async (useSelectiveFlags = false) => {
    const summaryText = buildSummaryText(useSelectiveFlags);

    // Always attempt clipboard copy so user reliably has it in clipboard
    let copied = false;
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(summaryText);
        copied = true;
      } catch {
        copied = false;
      }
    }
    if (!copied && typeof document !== 'undefined') {
      try {
        const ta = document.createElement('textarea');
        ta.value = summaryText;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      } catch {
        // ignore fallback copy error
      }
    }

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: `MindCare · Hành trình tuần (${recap.dateRangeLabel})`,
          text: summaryText,
        });
      } catch {
        // User cancelled share sheet or desktop share unavailable; clipboard already has text
      }
    }

    setShareNotice('Đã sao chép bản tóm tắt hành trình tuần ấm áp vào bộ nhớ tạm!');
    setShowShareModal(false);
  };

  const handleNext = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide((prev) => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
      setProgress(0);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#06150F]/95 md:p-6 select-none"
      onMouseDown={(e) => {
        if ((e.target as HTMLElement).closest('button')) return;
        setIsPaused(true);
      }}
      onMouseUp={() => setIsPaused(false)}
      onTouchStart={(e) => {
        if ((e.target as HTMLElement).closest('button')) return;
        setIsPaused(true);
      }}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Desktop Prev Arrow */}
      <button
        onClick={handlePrev}
        disabled={currentSlide === 0}
        aria-label="Trang trước"
        className={`hidden md:flex mr-5 w-11 h-11 rounded-full items-center justify-center border border-white/20 bg-white/10 text-white transition hover:bg-white/20 ${
          currentSlide === 0 ? 'opacity-30 cursor-not-allowed' : ''
        }`}
        type="button"
      >
        <span className="material-symbols-outlined">chevron_left</span>
      </button>

      <div className="relative flex h-full w-full max-w-[440px] md:max-w-[460px] md:max-h-[820px] md:rounded-[32px] md:border md:border-white/15 flex-col overflow-hidden text-white shadow-2xl">
        {/* Top Progress Bar */}
        <div className="relative z-30 flex gap-1 px-4 pt-12 md:pt-6">
          {Array.from({ length: totalSlides }).map((_, idx) => {
            let width = '0%';
            if (idx < currentSlide) width = '100%';
            else if (idx === currentSlide) width = `${progress}%`;

            return (
              <div
                key={idx}
                className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/25"
              >
                <div
                  className="h-full rounded-full bg-white transition-[width] duration-75"
                  style={{ width }}
                />
              </div>
            );
          })}
        </div>

        {/* Header bar below progress */}
        <div className="relative z-30 flex items-center justify-between px-4 pt-2.5">
          <span className="text-[13px] font-semibold text-white/85">
            Nhìn lại tuần qua · {recap.dateRangeLabel}
          </span>
          <button
            onClick={onClose}
            aria-label="Đóng"
            className="flex h-[34px] w-[34px] items-center justify-center rounded-full border border-white/10 bg-black/20 text-white transition hover:scale-105 active:scale-95"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* 32% Left and 68% Right Tap Zones */}
        <div
          onClick={handlePrev}
          title="Chạm bên trái để lùi"
          className="absolute bottom-0 left-0 top-[88px] z-10 w-[32%] cursor-pointer"
        />
        <div
          onClick={handleNext}
          title="Chạm bên phải để tiến"
          className="absolute bottom-0 right-0 top-[88px] z-10 w-[68%] cursor-pointer"
        />

        {/* Slides Content */}
        <div className="relative flex flex-1 overflow-hidden">
          {!effectiveShort && (
            <>
              {/* Slide 0: Tuần của bạn (Khoảng ngày thực tế 7 ngày gần nhất) */}
              {currentSlide === 0 && (
                <div className="absolute inset-0 flex flex-col justify-center bg-gradient-to-br from-[#1F5C43] to-[#123728] px-7 py-9 text-white">
                  <div className="pointer-events-none absolute -right-16 -top-16 h-[320px] w-[320px] rounded-full bg-radial from-white/20 to-transparent" />
                  <div className="pointer-events-none absolute -bottom-16 -left-16 h-[300px] w-[300px] rounded-full border-[1.5px] border-white/15" />
                  <div className="relative z-20">
                    <MochiHappyCompanion className="w-24 h-24 mb-3" />
                    <p className="text-[13px] font-semibold uppercase tracking-wider text-white/85">
                      ✦ MindCare · Story 7 ngày gần nhất
                    </p>
                    <h1 className="mt-2 text-[38px] font-extrabold leading-[1.15] tracking-tight">
                      Tuần của bạn
                    </h1>
                    <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1 text-[15px] font-semibold text-white">
                      <span className="material-symbols-outlined text-[17px]">date_range</span>
                      <span>{recap.dateRangeLabel}</span>
                    </p>
                    <p className="mt-4 text-[16.5px] leading-relaxed text-white/90">
                      {recap.activeDaysCount > 0
                        ? `Trong 7 ngày qua, bạn đã dành ${recap.activeDaysCount} ngày lắng nghe cảm xúc và ghi lại những điều nhỏ đáng nhớ.`
                        : 'Một không gian tĩnh lặng để nhìn lại nhịp sống 7 ngày gần nhất của riêng bạn.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Slide 1: Bạn đã check-in (X / 7 ngày) */}
              {currentSlide === 1 && (
                <div className="absolute inset-0 flex flex-col justify-center bg-gradient-to-br from-[#FAF7EE] to-[#DDEBCF] px-7 py-9 text-[#285C3D]">
                  <div className="pointer-events-none absolute -right-16 -top-16 h-[320px] w-[320px] rounded-full bg-radial from-[#1F5C43]/10 to-transparent" />
                  <div className="pointer-events-none absolute -bottom-16 -left-16 h-[300px] w-[300px] rounded-full border-[1.5px] border-[#1F5C43]/15" />
                  <div className="relative z-20">
                    <p className="text-[14px] font-semibold uppercase tracking-wider text-[#285C3D]/85">
                      Số ngày đã Check-in
                    </p>
                    <div className="my-3 flex items-baseline gap-2.5">
                      <span className="text-[96px] font-extrabold leading-none tracking-[-0.04em] tabular-nums">
                        {recap.checkedInDaysCount}
                      </span>
                      <span className="text-[22px] font-semibold text-[#285C3D]/80">/ 7 ngày</span>
                    </div>

                    {/* Đầy đủ 7 cột từ T2 đến CN */}
                    <div className="my-5 grid grid-cols-7 gap-1.5">
                      {recap.columns.map((col) => (
                        <div key={col.label} className="flex flex-col items-center gap-1">
                          <div
                            className={`flex h-[38px] w-[38px] items-center justify-center rounded-full text-[12px] font-bold transition ${
                              col.hasCheckIn
                                ? 'bg-[#1F5C43] text-white shadow-sm'
                                : 'border-[1.5px] border-dashed border-[#AC9583] text-[#A7683F]'
                            } ${col.isToday ? 'ring-2 ring-[#E78A45] ring-offset-2 ring-offset-[#EEF5E4]' : ''}`}
                          >
                            {col.label}
                          </div>
                          <span className="text-[9.5px] font-medium text-[#756455] tabular-nums">
                            {col.shortDate}
                          </span>
                        </div>
                      ))}
                    </div>

                    <p className="text-[16.5px] leading-relaxed text-[#285C3D]/90">
                      {recap.checkedInDaysCount > 0
                        ? 'Mỗi lần check-in đều giúp Mochi hiểu nhịp năng lượng và giấc ngủ của bạn rõ hơn.'
                        : 'Chưa có lượt check-in nào trong 7 ngày qua — bất cứ lúc nào bạn ghé lại đều là khởi đầu đẹp.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Slide 2: Nhật ký & Tổng số từ thực tế */}
              {currentSlide === 2 && (
                <div className="absolute inset-0 flex flex-col justify-center bg-gradient-to-br from-[#285C3D] to-[#173B27] px-7 py-9 text-white">
                  <div className="pointer-events-none absolute -right-16 -top-16 h-[320px] w-[320px] rounded-full bg-radial from-white/20 to-transparent" />
                  <div className="pointer-events-none absolute -bottom-16 -left-16 h-[300px] w-[300px] rounded-full border-[1.5px] border-white/15" />
                  <div className="relative z-20">
                    <p className="text-[14px] font-semibold uppercase tracking-wider text-white/85">
                      Nhật ký 7 ngày qua
                    </p>
                    <div className="my-3 flex items-baseline gap-2.5">
                      <span className="text-[96px] font-extrabold leading-none tracking-[-0.04em] tabular-nums">
                        {recap.journalCount}
                      </span>
                      <span className="text-[22px] font-semibold text-white/85">bài nhật ký</span>
                    </div>
                    <p className="text-[16px] leading-relaxed text-white/90">
                      {recap.journalCount > 0
                        ? `Tổng cộng ${recap.totalWords.toLocaleString('vi-VN')} từ bạn đã gửi gắm. ${recap.maxWordCol.fullWeekday} (${recap.maxWordCol.shortDate}) là ngày bạn viết nhiều nhất.`
                        : recap.allTimeJournals > 0
                          ? `7 ngày qua bạn chưa viết bài mới (tổng hành trình đã lưu ${recap.allTimeJournals} bài · ${recap.allTimeWords.toLocaleString('vi-VN')} từ).`
                          : 'Bạn chưa viết bài nhật ký nào trong tuần này. Vài dòng nhỏ cũng giúp lòng nhẹ hơn.'}
                    </p>

                    {/* Bar chart đầy đủ 7 cột T2 -> CN */}
                    <div className="relative mt-7 flex h-[116px] items-end justify-between gap-2 border-b border-white/20 pb-7">
                      {recap.columns.map((col) => {
                        const isMax = col.words > 0 && col.words === recap.maxWordsVal;
                        const pct =
                          col.words > 0 ? Math.max(14, (col.words / recap.maxWordsVal) * 100) : 6;
                        return (
                          <div
                            key={col.label}
                            className="relative flex h-full flex-1 flex-col items-center justify-end"
                          >
                            {col.words > 0 && (
                              <span className="mb-1 text-[9.5px] font-bold text-white/90 tabular-nums">
                                {col.words}
                              </span>
                            )}
                            <div
                              className={`w-full max-w-[26px] rounded-t-md transition-all ${
                                isMax
                                  ? 'bg-[#FFF0E1] shadow-[0_0_12px_rgba(255,240,225,0.45)]'
                                  : col.words > 0
                                    ? 'bg-white/70'
                                    : 'bg-white/15'
                              }`}
                              style={{ height: `${pct}%` }}
                            />
                            <span className="absolute -bottom-5 text-[11px] font-semibold text-white/85">
                              {col.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Slide 3: Biểu đồ Cảm xúc đầy đủ 7 cột từ T2 đến CN */}
              {currentSlide === 3 && (
                <div className="absolute inset-0 flex flex-col justify-center bg-gradient-to-br from-[#FFF8EF] to-[#FFF0E1] px-7 py-9 text-[#285C3D]">
                  <div className="pointer-events-none absolute -right-16 -top-16 h-[320px] w-[320px] rounded-full bg-radial from-[#E78A45]/12 to-transparent" />
                  <div className="pointer-events-none absolute -bottom-16 -left-16 h-[300px] w-[300px] rounded-full border-[1.5px] border-[#A7683F]/15" />
                  <div className="relative z-20">
                    <p className="text-[14px] font-semibold uppercase tracking-wider text-[#A7683F]">
                      Cảm xúc trung bình
                    </p>
                    <div className="my-2.5 flex items-baseline gap-2.5">
                      <span className="text-[42px] font-extrabold tracking-tight text-[#1F5C43]">
                        {recap.moodDescriptor.emoji} {recap.moodDescriptor.text}
                      </span>
                    </div>
                    {recap.checkedInDaysCount > 0 && (
                      <p className="text-[14px] font-bold text-[#A7683F] tabular-nums">
                        Điểm trung bình: {formatComma(recap.avgMood)} / 10
                      </p>
                    )}

                    {/* Biểu đồ cảm xúc ĐẦY ĐỦ 7 cột T2..CN */}
                    <svg
                      className="my-3 h-[122px] w-full overflow-visible"
                      viewBox="0 0 320 122"
                      fill="none"
                    >
                      <line
                        x1="10"
                        y1="20"
                        x2="310"
                        y2="20"
                        stroke="rgba(40,92,61,0.14)"
                        strokeDasharray="3 3"
                      />
                      <line
                        x1="10"
                        y1="54"
                        x2="310"
                        y2="54"
                        stroke="rgba(40,92,61,0.14)"
                        strokeDasharray="3 3"
                      />
                      <line
                        x1="10"
                        y1="88"
                        x2="310"
                        y2="88"
                        stroke="rgba(40,92,61,0.14)"
                        strokeDasharray="3 3"
                      />

                      {moodSvg.segments.map((d, sIdx) => (
                        <path
                          key={sIdx}
                          d={d}
                          stroke="#1F5C43"
                          strokeWidth="3.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      ))}

                      {moodSvg.dots.map((dot) => (
                        <g key={dot.idx}>
                          <circle
                            cx={dot.x}
                            cy={dot.y}
                            r={dot.isolated ? 6 : 4.8}
                            fill={dot.isolated ? '#E78A45' : '#1F5C43'}
                            stroke="#FFFCF7"
                            strokeWidth="2"
                          />
                          <text
                            x={dot.x}
                            y={dot.y - 9}
                            fill="#1F5C43"
                            fontSize="9.5"
                            fontWeight="700"
                            textAnchor="middle"
                          >
                            {recap.columns[dot.idx].mood}
                          </text>
                        </g>
                      ))}

                      {/* Đầy đủ 7 cột T2, T3, T4, T5, T6, T7, CN */}
                      {recap.columns.map((col, idx) => (
                        <g key={col.label}>
                          <text
                            x={X_COORDS[idx]}
                            y="105"
                            fill={col.mood !== null ? '#285C3D' : '#AC9583'}
                            fontSize="10.5"
                            fontWeight="700"
                            textAnchor="middle"
                          >
                            {col.label}
                          </text>
                          <text
                            x={X_COORDS[idx]}
                            y="117"
                            fill="#AC9583"
                            fontSize="8.5"
                            fontWeight="500"
                            textAnchor="middle"
                          >
                            {col.shortDate}
                          </text>
                        </g>
                      ))}
                    </svg>

                    <p className="mt-2 text-[15.5px] leading-relaxed text-[#285C3D]/90">
                      {recap.bestMoodCol
                        ? `Ngày nhẹ lòng nhất của bạn là ${recap.bestMoodCol.fullWeekday} (${recap.bestMoodCol.mood}/10) 😊`
                        : 'Hãy check-in cảm xúc để Mochi vẽ đường cong tâm trạng 7 ngày cho bạn nhé.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Slide 4: Độ thay đổi mức căng thẳng thực tế (7 cột T2..CN) */}
              {currentSlide === 4 && (
                <div className="absolute inset-0 flex flex-col justify-center bg-gradient-to-br from-[#1C352A] to-[#0D1E17] px-7 py-9 text-white">
                  <div className="pointer-events-none absolute -right-16 -top-16 h-[320px] w-[320px] rounded-full bg-radial from-white/15 to-transparent" />
                  <div className="pointer-events-none absolute -bottom-16 -left-16 h-[300px] w-[300px] rounded-full border-[1.5px] border-white/10" />
                  <div className="relative z-20">
                    <p className="text-[14px] font-semibold uppercase tracking-wider text-white/85">
                      Mức căng thẳng tuần này
                    </p>
                    <h2 className="mt-2 text-[26px] font-bold leading-tight">
                      {recap.stressDelta === null
                        ? recap.checkedInDaysCount > 0
                          ? `Trung bình hiện tại: ${formatComma(recap.avgStress)}/10`
                          : 'Chưa có dữ liệu căng thẳng tuần này'
                        : recap.stressDelta < -0.1
                          ? `Dịu xuống ${recap.stressComparisonBasis}`
                          : recap.stressDelta > 0.1
                            ? `Tăng nhẹ ${recap.stressComparisonBasis}`
                            : `Giữ nhịp ổn định ${recap.stressComparisonBasis}`}
                    </h2>

                    <div className="my-2 text-[48px] font-extrabold text-[#E78A45] tabular-nums">
                      {recap.stressDelta === null
                        ? recap.checkedInDaysCount > 0
                          ? `${formatComma(recap.avgStress)}/10`
                          : '--'
                        : recap.stressDelta < -0.1
                          ? `↓ ${formatComma(Math.abs(recap.stressDelta))}`
                          : recap.stressDelta > 0.1
                            ? `↑ ${formatComma(recap.stressDelta)}`
                            : '≈ 0,0'}
                    </div>

                    {/* Biểu đồ Stress ĐẦY ĐỦ 7 cột T2..CN */}
                    <svg
                      className="my-2 h-[116px] w-full overflow-visible"
                      viewBox="0 0 320 116"
                      fill="none"
                    >
                      <line
                        x1="10"
                        y1="20"
                        x2="310"
                        y2="20"
                        stroke="rgba(255,255,255,0.12)"
                        strokeDasharray="3 3"
                      />
                      <line
                        x1="10"
                        y1="54"
                        x2="310"
                        y2="54"
                        stroke="rgba(255,255,255,0.12)"
                        strokeDasharray="3 3"
                      />
                      <line
                        x1="10"
                        y1="88"
                        x2="310"
                        y2="88"
                        stroke="rgba(255,255,255,0.12)"
                        strokeDasharray="3 3"
                      />

                      {stressSvg.segments.map((d, sIdx) => (
                        <path
                          key={sIdx}
                          d={d}
                          stroke="#DDEBCF"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      ))}

                      {stressSvg.dots.map((dot) => (
                        <g key={dot.idx}>
                          <circle
                            cx={dot.x}
                            cy={dot.y}
                            r={dot.isolated ? 5.5 : 4.5}
                            fill={dot.isolated ? '#E78A45' : '#DDEBCF'}
                            stroke="#1C352A"
                            strokeWidth="2"
                          />
                          <text
                            x={dot.x}
                            y={dot.y - 8}
                            fill="#FFF0E1"
                            fontSize="9.5"
                            fontWeight="700"
                            textAnchor="middle"
                          >
                            {recap.columns[dot.idx].stress}
                          </text>
                        </g>
                      ))}

                      {recap.columns.map((col, idx) => (
                        <text
                          key={col.label}
                          x={X_COORDS[idx]}
                          y="108"
                          fill={
                            col.stress !== null
                              ? 'rgba(255,255,255,0.85)'
                              : 'rgba(255,255,255,0.35)'
                          }
                          fontSize="10.5"
                          fontWeight="700"
                          textAnchor="middle"
                        >
                          {col.label}
                        </text>
                      ))}
                    </svg>

                    <p className="mt-2 text-[13px] leading-relaxed text-white/75">
                      Dựa trên {recap.checkedInDaysCount}/7 ngày có dữ liệu tự ghi nhận. Ngày bỏ trống không bị tính là 0.
                    </p>
                  </div>
                </div>
              )}

              {/* Slide 5: Biểu đồ Giấc ngủ ĐẦY ĐỦ 7 cột từ T2 đến CN */}
              {currentSlide === 5 && (
                <div className="absolute inset-0 flex flex-col justify-center bg-gradient-to-br from-[#FAF7EE] to-[#E7F1DF] px-7 py-9 text-[#285C3D]">
                  <div className="pointer-events-none absolute -right-16 -top-16 h-[320px] w-[320px] rounded-full bg-radial from-[#1F5C43]/12 to-transparent" />
                  <div className="pointer-events-none absolute -bottom-16 -left-16 h-[300px] w-[300px] rounded-full border-[1.5px] border-[#1F5C43]/15" />
                  <div className="relative z-20">
                    <p className="text-[14px] font-semibold uppercase tracking-wider text-[#285C3D]/85">
                      Giấc ngủ &amp; Phục hồi
                    </p>
                    <div className="my-2.5 flex items-baseline gap-2">
                      <span className="text-[76px] font-extrabold leading-none tracking-tight text-[#1F5C43] tabular-nums">
                        {recap.checkedInDaysCount > 0 ? formatComma(recap.avgSleep) : '--'}
                      </span>
                      <span className="text-[20px] font-semibold text-[#285C3D]/80">giờ / đêm</span>
                    </div>
                    <p className="text-[14.5px] font-medium text-[#756455]">
                      {recap.checkedInDaysCount > 0
                        ? `${recap.goodSleepNights}/${recap.checkedInDaysCount} đêm ghi nhận đạt ngưỡng ngủ sâu ≥ 7 giờ.`
                        : 'Ghi nhận thời lượng ngủ mỗi sáng để theo dõi chu kỳ phục hồi của cơ thể.'}
                    </p>

                    {/* Biểu đồ cột Giấc ngủ ĐẦY ĐỦ 7 cột T2..CN */}
                    <div className="relative mt-6 flex h-[126px] items-end justify-between gap-2 border-b border-[#1F5C43]/20 pb-7">
                      {recap.columns.map((col) => {
                        const sleep = col.sleepHours;
                        const hasSleep = sleep !== null;
                        const isGood = (sleep || 0) >= 7;
                        const heightPct = hasSleep
                          ? Math.max(16, Math.min(100, ((sleep || 0) / 10) * 100))
                          : 8;

                        return (
                          <div
                            key={col.label}
                            className="relative flex h-full flex-1 flex-col items-center justify-end"
                          >
                            {hasSleep && (
                              <span className="mb-1 text-[9.5px] font-bold text-[#1F5C43] tabular-nums">
                                {formatComma(sleep!)}h
                              </span>
                            )}
                            <div
                              className={`w-full max-w-[28px] rounded-t-lg transition-all ${
                                !hasSleep
                                  ? 'border border-dashed border-[#AC9583]/60 bg-[#AC9583]/15'
                                  : isGood
                                    ? 'bg-[#1F5C43] shadow-xs'
                                    : 'bg-[#E78A45]'
                              }`}
                              style={{ height: `${heightPct}%` }}
                            />
                            <span
                              className={`absolute -bottom-5 text-[11px] font-bold ${
                                hasSleep ? 'text-[#285C3D]' : 'text-[#AC9583]'
                              }`}
                            >
                              {col.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Slide 6: Số phút thực hành tự chăm sóc thực tế */}
              {currentSlide === 6 && (
                <div className="absolute inset-0 flex flex-col justify-center bg-gradient-to-br from-[#1F5C43] to-[#2E7354] px-7 py-9 text-white">
                  <div className="pointer-events-none absolute -right-16 -top-16 h-[320px] w-[320px] rounded-full bg-radial from-white/20 to-transparent" />
                  <div className="pointer-events-none absolute -bottom-16 -left-16 h-[300px] w-[300px] rounded-full border-[1.5px] border-white/15" />
                  <div className="relative z-20">
                    <p className="text-[14px] font-semibold uppercase tracking-wider text-white/85">
                      Điều giúp bạn dịu lại
                    </p>
                    <h2 className="mt-2 text-[28px] font-bold">Thực hành Tự chăm sóc</h2>
                    <div className="my-3 flex items-baseline gap-2.5">
                      <span className="text-[92px] font-extrabold leading-none tracking-[-0.04em] tabular-nums">
                        {recap.practiceMinutes}
                      </span>
                      <span className="text-[22px] font-semibold text-white/85">phút lắng lại</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1 text-[13px] font-semibold text-white/95 mb-3">
                      <span className="material-symbols-outlined text-[16px]">spa</span>
                      <span>Hoàn thành {recap.practiceCount} bài tập chăm sóc</span>
                    </div>
                    <p className="text-[16.5px] leading-relaxed text-white/90">
                      {recap.practiceCount > 0
                        ? `Bạn đã chủ động dành ${recap.practiceMinutes} phút cho hơi thở và các bài tập dịu tâm trí. Một khoảng nghỉ nhỏ cũng là món quà quý cho chính mình.`
                        : 'Tuần tới, chỉ cần dành 1–2 phút hít thở chậm cùng Mochi mỗi khi thấy căng thẳng là đã đủ ấm áp rồi.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Slide 7: Cảm ơn & Nút Sao chép / Chia sẻ tóm tắt thật */}
              {currentSlide === 7 && (
                <div className="absolute inset-0 flex flex-col justify-center bg-gradient-to-br from-[#1F5C43] to-[#123728] px-7 py-9 text-white">
                  <div className="pointer-events-none absolute -right-16 -top-16 h-[320px] w-[320px] rounded-full bg-radial from-white/20 to-transparent" />
                  <div className="pointer-events-none absolute -bottom-16 -left-16 h-[300px] w-[300px] rounded-full border-[1.5px] border-white/15" />
                  <div className="relative z-30">
                    <p className="text-[14px] font-semibold uppercase tracking-wider text-white/85">
                      ✦ Khép lại tuần {recap.dateRangeLabel}
                    </p>
                    <h2 className="mt-2 text-[32px] font-extrabold leading-tight">
                      Cảm ơn bạn đã dành thời gian cho mình
                    </h2>
                    <p className="mt-2.5 text-[16px] leading-relaxed text-white/90">
                      Tuần sau, chỉ cần quay lại một chút theo nhịp riêng của bạn là đủ.
                    </p>

                    {shareNotice && (
                      <div
                        role="status"
                        aria-live="polite"
                        className="mt-4 rounded-2xl bg-[#FFF8EF] border border-[#E78A45]/40 px-4 py-3 text-[13px] font-bold text-[#1F5C43] shadow-lg flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[19px] text-[#1F5C43]">
                          check_circle
                        </span>
                        <span>{shareNotice}</span>
                      </div>
                    )}

                    <div className="mt-6 flex flex-col gap-2.5">
                      <button
                        onClick={() => triggerShareOrCopy(false)}
                        className="w-full rounded-full bg-[#FFFCF7] py-3.5 px-4 text-center text-[15px] font-bold text-[#1F5C43] shadow-lg transition hover:bg-[#FFF8EF] active:scale-98 inline-flex items-center justify-center gap-2"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[19px]">ios_share</span>
                        <span>Sao chép / Chia sẻ tóm tắt</span>
                      </button>

                      <button
                        onClick={() => setShowShareModal(true)}
                        className="w-full rounded-full border-[1.5px] border-white/85 bg-white/10 py-3 text-center text-[14px] font-semibold text-white transition hover:bg-white/18 active:scale-98"
                        type="button"
                      >
                        Tùy chọn nội dung chia sẻ
                      </button>

                      <button
                        onClick={() => {
                          onClose();
                          onNavigateStats();
                        }}
                        className="w-full rounded-full border-[1.5px] border-white/75 bg-transparent py-3 text-center text-[14px] font-semibold text-white transition hover:bg-white/10 active:scale-98"
                        type="button"
                      >
                        Xem biểu đồ tiến triển
                      </button>

                      <button
                        onClick={onClose}
                        className="w-full py-2 text-center text-[13.5px] font-medium text-white/80 hover:text-white transition"
                        type="button"
                      >
                        Đóng
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* RECAP RÚT GỌN KHI CHƯA CÓ DỮ LIỆU */}
          {effectiveShort && (
            <>
              {currentSlide === 0 && (
                <div className="absolute inset-0 flex flex-col justify-center bg-gradient-to-br from-[#1F5C43] to-[#123728] px-7 py-9 text-white">
                  <div className="pointer-events-none absolute -right-16 -top-16 h-[320px] w-[320px] rounded-full bg-radial from-white/20 to-transparent" />
                  <div className="pointer-events-none absolute -bottom-16 -left-16 h-[300px] w-[300px] rounded-full border-[1.5px] border-white/15" />
                  <div className="relative z-20">
                    <MochiHappyCompanion className="w-24 h-24 mb-2" />
                    <p className="text-[14px] font-semibold uppercase tracking-wider text-white/85">
                      ✦ MindCare · {recap.dateRangeLabel}
                    </p>
                    <h2 className="mt-2 text-[36px] font-extrabold leading-tight">
                      Hành trình tuần mới bắt đầu
                    </h2>
                    <p className="mt-3 text-[16.5px] text-white/90">
                      Hiện có {recap.activeDaysCount}/7 ngày ghi nhận dữ liệu trong tuần này.
                    </p>

                    <div className="my-6 flex justify-between gap-1.5">
                      {recap.columns.map((col) => (
                        <div
                          key={col.label}
                          className={`flex h-[38px] w-[38px] items-center justify-center rounded-full text-[12.5px] font-bold ${
                            col.hasActivity
                              ? 'bg-[#FFFCF7] text-[#1F5C43] shadow-sm'
                              : 'border-[1.5px] border-dashed border-white/40 text-white/65'
                          }`}
                        >
                          {col.label}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {currentSlide === 1 && (
                <div className="absolute inset-0 flex flex-col justify-center bg-gradient-to-br from-[#FAF7EE] to-[#DDEBCF] px-7 py-9 text-[#285C3D]">
                  <div className="pointer-events-none absolute -right-16 -top-16 h-[320px] w-[320px] rounded-full bg-radial from-[#1F5C43]/10 to-transparent" />
                  <div className="pointer-events-none absolute -bottom-16 -left-16 h-[300px] w-[300px] rounded-full border-[1.5px] border-[#1F5C43]/15" />
                  <div className="relative z-30">
                    <p className="text-[14px] font-semibold uppercase tracking-wider text-[#285C3D]/85">
                      Từng nhịp nhỏ
                    </p>
                    <h2 className="mt-2 text-[32px] font-extrabold leading-tight">
                      Bắt đầu từ một phút lắng nghe
                    </h2>
                    <p className="mt-3 text-[16px] leading-relaxed text-[#285C3D]/90">
                      Khi bạn ghi lại Check-in hoặc vài dòng Nhật ký, Mochi sẽ tự động kết nối thành Story nhìn lại 7 ngày cho riêng bạn.
                    </p>

                    <div className="mt-7 flex flex-col gap-2.5">
                      <button
                        onClick={() => {
                          onClose();
                          onOpenCheckIn();
                        }}
                        className="w-full rounded-full bg-[#1F5C43] py-3.5 text-center text-[15px] font-bold text-white shadow-md transition active:scale-98"
                        type="button"
                      >
                        Check-in hôm nay
                      </button>
                      <button
                        onClick={() => {
                          onClose();
                          onOpenJournal();
                        }}
                        className="w-full rounded-full border-[1.5px] border-[#1F5C43] bg-transparent py-3.5 text-center text-[15px] font-semibold text-[#1F5C43] transition active:scale-98"
                        type="button"
                      >
                        Viết nhật ký
                      </button>
                      <button
                        onClick={() => {
                          setForceFullSlides(true);
                          setCurrentSlide(0);
                          setProgress(0);
                        }}
                        className="w-full py-2 text-center text-[13px] font-semibold text-[#1F5C43]/80 hover:underline"
                        type="button"
                      >
                        Xem đầy đủ 8 thẻ tổng kết tuần →
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Desktop Next Arrow */}
      <button
        onClick={handleNext}
        aria-label={currentSlide < totalSlides - 1 ? 'Trang tiếp theo' : 'Đóng'}
        className="hidden md:flex ml-5 w-11 h-11 rounded-full items-center justify-center border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
        type="button"
      >
        <span className="material-symbols-outlined">
          {currentSlide < totalSlides - 1 ? 'chevron_right' : 'check'}
        </span>
      </button>

      {/* Selective Sharing Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-[372px] rounded-[24px] bg-[#FFFCF7] p-5 text-[#285C3D] shadow-2xl border border-[#E7E8DE]">
            <h3 className="text-[18px] font-bold text-[#1F5C43]">Chia sẻ có chọn lọc</h3>
            <p className="mt-1 text-[12.5px] text-[#756455]">
              Chọn những mục bạn muốn đưa vào bản tóm tắt hành trình tuần:
            </p>

            <div className="my-3 space-y-2.5 border-y border-[#E7E8DE] py-3 text-[13px]">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shareIncludeRange}
                  onChange={(e) => setShareIncludeRange(e.target.checked)}
                  className="accent-[#1F5C43] h-4 w-4"
                />
                <span>Kỳ thống kê: {recap.dateRangeLabel}</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shareIncludeCheckin}
                  onChange={(e) => setShareIncludeCheckin(e.target.checked)}
                  className="accent-[#1F5C43] h-4 w-4"
                />
                <span>
                  Ghé thăm ({recap.checkedInDaysCount}/7 ngày) &amp; Nhật ký ({recap.totalWords} từ)
                </span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shareIncludeMoodSleep}
                  onChange={(e) => setShareIncludeMoodSleep(e.target.checked)}
                  className="accent-[#1F5C43] h-4 w-4"
                />
                <span>
                  Mood TB ({formatComma(recap.avgMood)}/10) &amp; Giấc ngủ (
                  {formatComma(recap.avgSleep)}h)
                </span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shareIncludePractice}
                  onChange={(e) => setShareIncludePractice(e.target.checked)}
                  className="accent-[#1F5C43] h-4 w-4"
                />
                <span>Thực hành tự chăm sóc ({recap.practiceMinutes} phút)</span>
              </label>
            </div>

            <p className="text-[11px] text-[#AC9583]">
              * Nội dung chi tiết nhật ký riêng tư không bao giờ bị đính kèm.
            </p>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setShowShareModal(false)}
                className="flex-1 rounded-full border border-[#E7E8DE] py-2.5 text-[13px] font-medium text-[#756455]"
                type="button"
              >
                Đóng
              </button>
              <button
                onClick={() => triggerShareOrCopy(true)}
                className="flex-1 rounded-full bg-[#1F5C43] py-2.5 text-[13px] font-bold text-white shadow-xs hover:brightness-105"
                type="button"
              >
                Sao chép / Chia sẻ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
