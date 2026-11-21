import React, { useState, useMemo } from 'react';
import { CheckIn, JournalEntry, MainTab } from '../types';
import {
  MoodFaceIcon,
  MoodType,
  MochiPeeking,
  MochiFooterResting,
  MochiHappyCompanion,
  CornerLeaves,
} from './MochiIllustrations';

interface JournalScreenProps {
  entries: JournalEntry[];
  checkIns?: CheckIn[];
  onOpenNewJournal: () => void;
  onEditJournal: (entry: JournalEntry) => void;
  onDeleteJournal?: (journalId: string) => void;
  onOpenGallery: () => void;
  onOpenSettings?: () => void;
  onNavigateTab?: (tab: MainTab) => void;
}

interface DayState {
  dayNum: number;
  status: 'written' | 'checkin_only' | 'unwritten' | 'future';
  isToday: boolean;
  mood?: MoodType;
  moodLabel?: string;
  entries: JournalEntry[];
  checkIn?: CheckIn;
}

function parseEntryYMD(
  dateStr?: string,
  createdAt?: number
): { year: number; month: number; day: number } | null {
  if (dateStr) {
    const iso = dateStr.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (iso) {
      return {
        year: Number(iso[1]),
        month: Number(iso[2]),
        day: Number(iso[3]),
      };
    }
    const dmy = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (dmy) {
      return {
        day: Number(dmy[1]),
        month: Number(dmy[2]),
        year: Number(dmy[3]),
      };
    }
  }
  if (createdAt && !Number.isNaN(createdAt)) {
    const d = new Date(createdAt);
    return {
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate(),
    };
  }
  return null;
}

function classifyJournalMood(entry: JournalEntry): { mood: MoodType; label: string } {
  const tagLower = (entry.tag || '').toLowerCase();
  const score = entry.aiEstimateScore || entry.moodScore || 6;

  if (
    tagLower.includes('buồn') ||
    tagLower.includes('trầm') ||
    score <= 2
  ) {
    return { mood: 'sad', label: entry.tag || 'Buồn' };
  }
  if (
    tagLower.includes('căng thẳng') ||
    tagLower.includes('lo lắng') ||
    tagLower.includes('áp lực') ||
    tagLower.includes('stress') ||
    tagLower.includes('nghỉ ngơi') ||
    score <= 4
  ) {
    return { mood: 'stressed', label: entry.tag || 'Căng thẳng' };
  }
  if (
    tagLower.includes('bình thường') ||
    tagLower.includes('ổn định') ||
    score === 5
  ) {
    return { mood: 'neutral', label: entry.tag || 'Bình thường' };
  }
  return { mood: 'happy', label: entry.tag || 'Tích cực' };
}

function classifyCheckInMood(ci: CheckIn): { mood: MoodType; label: string } {
  if (ci.mood <= 3) {
    return { mood: 'sad', label: ci.moodLabel || 'Buồn' };
  }
  if (ci.stress >= 7 || ci.mood <= 4) {
    return { mood: 'stressed', label: ci.moodLabel || 'Căng thẳng' };
  }
  if (ci.mood === 5) {
    return { mood: 'neutral', label: ci.moodLabel || 'Bình thường' };
  }
  return { mood: 'happy', label: ci.moodLabel || 'Vui' };
}

export const JournalScreen: React.FC<JournalScreenProps> = ({
  entries,
  checkIns = [],
  onOpenNewJournal,
  onEditJournal,
  onDeleteJournal,
  onOpenGallery,
  onNavigateTab,
}) => {
  const realToday = useMemo(() => new Date(), []);
  const [currentYear, setCurrentYear] = useState<number>(() => realToday.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(() => realToday.getMonth() + 1); // 1-12
  const [selectedDay, setSelectedDay] = useState<number>(() => realToday.getDate());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [showFullViewModal, setShowFullViewModal] = useState<boolean>(false);
  const [moodFilter, setMoodFilter] = useState<string>('all');
  const [pendingDeleteEntry, setPendingDeleteEntry] = useState<JournalEntry | null>(null);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const markImageBroken = (id: string) => {
    setBrokenImages((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
  };

  // Month navigation with safe day clamping
  const changeMonthYear = (nextYear: number, nextMonth: number) => {
    const now = new Date();
    const maxDays = new Date(nextYear, nextMonth, 0).getDate();
    setCurrentYear(nextYear);
    setCurrentMonth(nextMonth);
    if (nextYear === now.getFullYear() && nextMonth === now.getMonth() + 1) {
      setSelectedDay(now.getDate());
    } else {
      setSelectedDay((prev) => Math.min(prev, maxDays));
    }
  };

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      changeMonthYear(currentYear - 1, 12);
    } else {
      changeMonthYear(currentYear, currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      changeMonthYear(currentYear + 1, 1);
    } else {
      changeMonthYear(currentYear, currentMonth + 1);
    }
  };

  const handleGoToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth() + 1);
    setSelectedDay(now.getDate());
  };

  // Exact weekday offset for Day 1 of (currentYear, currentMonth): Monday (T2) = 0 ... Sunday (CN) = 6
  const leadingEmptyCells = useMemo(() => {
    const jsDay = new Date(currentYear, currentMonth - 1, 1).getDay();
    return (jsDay + 6) % 7;
  }, [currentYear, currentMonth]);

  // Build exact days of the month from real user entries & checkIns
  const monthDays: DayState[] = useMemo(() => {
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const result: DayState[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const cellTime = new Date(currentYear, currentMonth - 1, day).getTime();
      const isToday = cellTime === todayMidnight;
      const isFuture = cellTime > todayMidnight;

      const dayEntries = entries
        .filter((e) => {
          const parsed = parseEntryYMD(e.date, e.createdAt);
          return (
            parsed !== null &&
            parsed.year === currentYear &&
            parsed.month === currentMonth &&
            parsed.day === day
          );
        })
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

      const dayCheckIns = checkIns
        .filter((c) => {
          const parsed = parseEntryYMD(c.date, c.createdAt);
          return (
            parsed !== null &&
            parsed.year === currentYear &&
            parsed.month === currentMonth &&
            parsed.day === day
          );
        })
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

      const latestCheckIn = dayCheckIns[0];

      if (dayEntries.length > 0) {
        const { mood, label } = classifyJournalMood(dayEntries[0]);
        result.push({
          dayNum: day,
          status: 'written',
          isToday,
          mood,
          moodLabel: label,
          entries: dayEntries,
          checkIn: latestCheckIn,
        });
      } else if (latestCheckIn) {
        const { mood, label } = classifyCheckInMood(latestCheckIn);
        result.push({
          dayNum: day,
          status: 'checkin_only',
          isToday,
          mood,
          moodLabel: label,
          entries: [],
          checkIn: latestCheckIn,
        });
      } else if (isFuture) {
        result.push({
          dayNum: day,
          status: 'future',
          isToday: false,
          entries: [],
        });
      } else {
        result.push({
          dayNum: day,
          status: 'unwritten',
          isToday,
          entries: [],
        });
      }
    }

    return result;
  }, [entries, checkIns, currentMonth, currentYear]);

  // Count positive / recorded days in the viewed month
  const happyDaysCount = useMemo(() => {
    return monthDays.filter(
      (d) => (d.status === 'written' || d.status === 'checkin_only') && d.mood === 'happy'
    ).length;
  }, [monthDays]);

  const recordedDaysCount = useMemo(() => {
    return monthDays.filter((d) => d.status === 'written' || d.status === 'checkin_only').length;
  }, [monthDays]);

  const selectedDayData: DayState = useMemo(() => {
    return (
      monthDays.find((d) => d.dayNum === selectedDay) || {
        dayNum: selectedDay,
        status: 'unwritten',
        isToday: false,
        entries: [],
      }
    );
  }, [monthDays, selectedDay]);

  const activeJournalEntry: JournalEntry | null = selectedDayData.entries[0] || null;
  const hasJournalForSelectedDay = Boolean(activeJournalEntry);

  const filteredTimelineEntries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return [...entries]
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      .filter((entry) => {
        const matchesQuery =
          !q ||
          entry.title.toLowerCase().includes(q) ||
          entry.content.toLowerCase().includes(q) ||
          (entry.tag || '').toLowerCase().includes(q) ||
          entry.date.toLowerCase().includes(q);
        if (!matchesQuery) return false;
        if (moodFilter === 'all') return true;
        return (entry.tag || '').toLowerCase().includes(moodFilter.toLowerCase());
      });
  }, [entries, searchQuery, moodFilter]);

  const confirmDeleteEntry = () => {
    if (!pendingDeleteEntry || !onDeleteJournal) return;
    const idToDelete = pendingDeleteEntry.id;
    setPendingDeleteEntry(null);
    if (activeJournalEntry?.id === idToDelete) {
      setShowFullViewModal(false);
    }
    onDeleteJournal(idToDelete);
  };

  const renderAiSentimentBar = (entry: JournalEntry, compact = false) => {
    const label = entry.aiEstimateLabel || 'Đang cân bằng';
    const width = Math.max(12, Math.min(100, entry.aiBarWidth || (entry.moodScore || 6) * 10));
    const score = entry.aiEstimateScore || entry.moodScore || 6;
    const isWarmLow = score <= 4;

    return (
      <div
        className={`rounded-xl border border-[var(--color-border)]/80 bg-[var(--color-chart-background)] ${
          compact ? 'px-2.5 py-2' : 'px-3 py-2.5'
        }`}
      >
        <div className="flex items-center justify-between gap-2 text-[11px]">
          <span className="inline-flex items-center gap-1 font-semibold text-[var(--color-text-secondary)]">
            <span className="material-symbols-outlined text-[14px] text-[var(--color-primary)]">
              auto_awesome
            </span>
            <span>Sắc thái AI:</span>
            <strong className="text-[var(--color-primary)]">{label}</strong>
          </span>
          <span className="font-bold tabular-nums text-[var(--color-primary)]">{score}/10</span>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isWarmLow
                ? 'bg-gradient-to-r from-[#E78A45] to-[#F2B077]'
                : 'bg-gradient-to-r from-[#1F5C43] to-[#68B67D]'
            }`}
            style={{ width: `${width}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-[var(--color-background)] text-[var(--color-text-primary)] px-4 pt-3 pb-24 md:pb-12 space-y-4 font-sans select-none relative md:px-8 md:pt-6">
      <div className="w-full md:max-w-6xl md:mx-auto space-y-4 md:space-y-6 relative">
        {/* Corner Leaves Decoration */}
        <div className="absolute top-0 right-0 z-10 pointer-events-none">
          <CornerLeaves className="w-20 h-20" />
        </div>

        {/* 1. TOP HEADER */}
        <header className="flex justify-between items-center w-full pt-1 pb-1 shrink-0 relative z-20">
          <div className="flex items-center gap-1.5">
            <h1 className="text-[28px] font-bold text-[var(--color-primary)] tracking-tight">
              Nhật ký
            </h1>
            <div className="-translate-y-2 select-none shrink-0 text-[var(--color-primary)]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 20C6 13 11 8 20 4C20 13 15 18 9 20C6.5 20 5 20 4 20Z"
                  fill="#7AC482"
                  stroke="var(--color-primary)"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M7 17C10 14 14 10 18 6"
                  stroke="var(--color-surface)"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          <div className="flex items-center gap-1.5 md:gap-2.5">
            <button
              onClick={onOpenNewJournal}
              type="button"
              className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-[var(--color-primary)] px-4 py-2 text-[13px] font-bold text-white shadow-xs transition hover:brightness-105 active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">edit_note</span>
              <span>Viết nhật ký</span>
            </button>

            <button
              onClick={onOpenGallery}
              aria-label="Mở Thư viện ảnh"
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-white shadow-[0_2px_8px_rgba(31,92,67,0.06)] transition hover:bg-[#FFF8EF] active:scale-95"
              type="button"
            >
              <span className="absolute left-[9px] top-[10px] h-[21px] w-[23px] -rotate-[9deg] rounded-[5px] bg-[#F6D6B8] shadow-sm" />
              <span className="absolute left-[13px] top-[11px] flex h-[23px] w-[24px] rotate-[7deg] items-center justify-center rounded-[5px] border-2 border-white bg-[#8DBA91] shadow-sm">
                <span className="material-symbols-outlined text-[15px] text-white">landscape</span>
              </span>
            </button>

            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="Tìm kiếm nhật ký"
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-[0_2px_8px_rgba(31,92,67,0.06)] border border-[var(--color-border)] cursor-pointer md:hidden ${
                isSearchOpen
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-white text-[var(--color-primary)] hover:bg-[var(--color-surface-mint)]'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">search</span>
            </button>
          </div>
        </header>

        {/* Search Input Dropdown */}
        {isSearchOpen && (
          <div className="animate-fade-in relative w-full z-30">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tiêu đề, cảm xúc, nội dung..."
              className="w-full bg-white border border-[var(--color-border)] rounded-full pl-10 pr-9 py-2.5 text-[14px] text-[var(--color-text-primary)] placeholder:text-[#8E9D93] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 shadow-xs"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>
        )}

        {/* 2. MAIN TWO-COLUMN AREA ON DESKTOP: Left Calendar, Right Selected Date Entry */}
        <div className="space-y-4 lg:grid lg:grid-cols-12 lg:gap-7 lg:space-y-0 lg:items-start">
          <div className="space-y-4 lg:col-span-6">
            {/* MOOD CALENDAR CARD */}
            <section className="relative pt-[72px] mt-1 z-10">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                <MochiPeeking className="w-48 h-[76px]" />
              </div>

              <div className="relative z-10 bg-[var(--color-surface)] rounded-[24px] p-4.5 border border-[var(--color-border)] shadow-[0_4px_16px_rgba(31,92,67,0.04)]">
                {/* 2.1 Calendar Header */}
                <div className="flex items-center justify-between gap-1.5 mb-4">
                  <button
                    onClick={handlePrevMonth}
                    aria-label="Tháng trước"
                    type="button"
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-primary)] hover:bg-[var(--color-surface-mint)] active:scale-95 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                  </button>

                  <div className="flex items-center gap-1 px-3.5 py-1 bg-[var(--color-chart-background)] border border-[var(--color-highlight)] rounded-full text-[var(--color-primary)] font-bold text-[14.5px] select-none shadow-2xs">
                    <span>
                      Tháng {currentMonth}, {currentYear}
                    </span>
                  </div>

                  <button
                    onClick={handleNextMonth}
                    aria-label="Tháng sau"
                    type="button"
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-primary)] hover:bg-[var(--color-surface-mint)] active:scale-95 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                  </button>

                  <button
                    onClick={handleGoToday}
                    type="button"
                    className="px-3.5 py-1 rounded-full border border-[var(--color-primary)] bg-white hover:bg-[var(--color-surface-mint)] active:scale-95 text-[var(--color-primary)] font-semibold text-[12.5px] transition-all cursor-pointer shadow-2xs"
                  >
                    Hôm nay
                  </button>
                </div>

                {/* 2.2 Weekday Row (7 Columns: T2..CN) */}
                <div className="grid grid-cols-7 gap-1 text-center mb-2.5">
                  {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((wDay) => (
                    <span
                      key={wDay}
                      className="text-[12px] font-semibold text-[var(--color-text-secondary)] py-0.5 select-none"
                    >
                      {wDay}
                    </span>
                  ))}
                </div>

                {/* 2.3 Calendar Grid with accurate weekday offset */}
                <div className="grid grid-cols-7 gap-y-3 gap-x-1 text-center items-center">
                  {Array.from({ length: leadingEmptyCells }).map((_, blankIdx) => (
                    <div key={`blank-${blankIdx}`} className="h-10 w-10 mx-auto" aria-hidden="true" />
                  ))}

                  {monthDays.map((dayItem) => {
                    const isSelected = selectedDay === dayItem.dayNum;
                    const isWritten = dayItem.status === 'written';
                    const isCheckInOnly = dayItem.status === 'checkin_only';
                    const hasMoodDot = isWritten || isCheckInOnly;
                    const isUnwritten = dayItem.status === 'unwritten';
                    const isFuture = dayItem.status === 'future';

                    let circleBg = 'bg-[var(--color-background)]';
                    if (hasMoodDot) {
                      if (dayItem.mood === 'happy') circleBg = 'bg-[var(--color-highlight)]';
                      else if (dayItem.mood === 'neutral') circleBg = 'bg-[#FFF0B5]';
                      else if (dayItem.mood === 'stressed') circleBg = 'bg-[#FFD7BD]';
                      else if (dayItem.mood === 'sad') circleBg = 'bg-[#DCE7F5]';
                      if (isCheckInOnly) {
                        circleBg += ' border border-dashed border-[var(--color-primary)]/45';
                      }
                    } else if (isUnwritten) {
                      circleBg = 'bg-white border-2 border-dashed border-[#CCD7CF]';
                    } else if (isFuture) {
                      circleBg = 'bg-[#F2EFE8]';
                    }

                    return (
                      <div key={dayItem.dayNum} className="flex items-center justify-center">
                        <button
                          onClick={() => {
                            if (!isFuture) {
                              setSelectedDay(dayItem.dayNum);
                            }
                          }}
                          type="button"
                          disabled={isFuture}
                          title={
                            dayItem.moodLabel
                              ? `Ngày ${dayItem.dayNum}/${currentMonth}: ${dayItem.moodLabel}`
                              : `Ngày ${dayItem.dayNum}/${currentMonth}`
                          }
                          className={`w-10 h-10 rounded-full flex flex-col items-center justify-center transition-all relative ${
                            isFuture
                              ? 'cursor-not-allowed opacity-70'
                              : 'cursor-pointer active:scale-95'
                          } ${circleBg} ${
                            isSelected
                              ? 'ring-3 ring-[var(--color-primary)] ring-offset-2 ring-offset-[var(--color-surface)] shadow-xs'
                              : dayItem.isToday
                                ? 'ring-2 ring-[var(--color-secondary)] ring-offset-1 ring-offset-[var(--color-surface)]'
                                : ''
                          }`}
                        >
                          <span
                            className={`text-[11.5px] font-bold leading-none ${
                              isFuture
                                ? 'text-[#A0ABA3]'
                                : hasMoodDot
                                  ? 'text-[var(--color-text-primary)]'
                                  : 'text-[var(--color-text-secondary)]'
                            }`}
                          >
                            {dayItem.dayNum}
                          </span>

                          {hasMoodDot && dayItem.mood && (
                            <div className="mt-0.5 leading-none">
                              <MoodFaceIcon mood={dayItem.mood} size={14} />
                            </div>
                          )}

                          {dayItem.isToday && !hasMoodDot && (
                            <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-[var(--color-secondary)]" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* 2.4 Calendar Legend Row */}
                <div className="mt-5 pt-3 border-t border-[#F0EEE6] flex items-center justify-between text-[11px] text-[var(--color-text-secondary)] flex-wrap gap-y-2 px-0.5 select-none font-medium">
                  <div className="flex items-center gap-1">
                    <MoodFaceIcon mood="happy" size={15} />
                    <span>Vui</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MoodFaceIcon mood="neutral" size={15} />
                    <span>Bình thường</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MoodFaceIcon mood="stressed" size={15} />
                    <span>Căng thẳng</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MoodFaceIcon mood="sad" size={15} />
                    <span>Buồn</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-3.5 h-3.5 rounded-full border border-dashed border-[#A8B6AD] bg-white inline-block" />
                    <span>Chưa viết</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#EAE5DA] inline-block" />
                    <span>Chưa tới</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. MONTHLY INSIGHT STRIP */}
            <section>
              <div className="bg-[var(--color-surface-mint)] border border-[#DCEBCF] rounded-[20px] px-4 py-3 flex items-center justify-between gap-2 shadow-2xs">
                <div className="flex items-center gap-2 text-[var(--color-primary)] min-w-0">
                  <span
                    className="material-symbols-outlined text-[20px] text-[#288355] shrink-0"
                    style={{ fontVariationSettings: "'FILL' 1, 'wght' 500" }}
                  >
                    signal_cellular_alt
                  </span>
                  <p className="text-[13px] md:text-[14px] font-bold text-[var(--color-primary)] tracking-tight truncate">
                    {recordedDaysCount > 0
                      ? `Tháng ${currentMonth}: ${recordedDaysCount} ngày ghi nhận (${happyDaysCount} ngày tích cực)`
                      : `Tháng ${currentMonth} đang chờ dòng cảm xúc đầu tiên`}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="w-[1px] h-4 bg-[#C2D8BA]" />
                  <button
                    onClick={() => onNavigateTab?.('stats')}
                    type="button"
                    className="text-[12.5px] font-bold text-[var(--color-primary)] hover:underline flex items-center gap-0.5 cursor-pointer whitespace-nowrap"
                  >
                    <span>Thống kê</span>
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </button>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-4 lg:col-span-6 lg:pt-[76px]">
            {/* 4. SELECTED DAY JOURNAL DETAIL CARD */}
            <section>
              <div className="bg-[var(--color-surface)] rounded-[24px] p-4.5 md:p-6 border border-[var(--color-border)] shadow-[0_2px_12px_rgba(31,92,67,0.04)] space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-mint)] flex items-center justify-center text-[var(--color-primary)] shrink-0">
                      <span className="material-symbols-outlined text-[18px]">event_available</span>
                    </div>
                    <h2 className="font-bold text-[15.5px] md:text-[16.5px] text-[var(--color-primary)] truncate">
                      Nhật ký ngày {selectedDay}/{currentMonth}/{currentYear}
                    </h2>
                  </div>

                  {hasJournalForSelectedDay && activeJournalEntry ? (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => onEditJournal(activeJournalEntry)}
                        type="button"
                        className="flex items-center gap-1 px-3 py-1.5 bg-[var(--color-surface-mint)] hover:bg-[var(--color-highlight)] text-[var(--color-primary)] rounded-full text-[12px] font-bold transition-all active:scale-95 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[15px]">edit</span>
                        <span>Chỉnh sửa</span>
                      </button>
                      {onDeleteJournal && (
                        <button
                          onClick={() => setPendingDeleteEntry(activeJournalEntry)}
                          type="button"
                          aria-label="Xóa bài nhật ký"
                          title="Xóa bài nhật ký"
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-[#EED6D2] bg-[#FFF5F3] text-[#B44A3E] hover:bg-[#FDE8E4] transition-all active:scale-95 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={onOpenNewJournal}
                      type="button"
                      className="flex items-center gap-1 px-3 py-1.5 bg-[var(--color-primary)] text-white rounded-full text-[12px] font-bold transition-all active:scale-95 cursor-pointer shadow-2xs shrink-0"
                    >
                      <span className="material-symbols-outlined text-[15px]">add</span>
                      <span>Viết ngay</span>
                    </button>
                  )}
                </div>

                {hasJournalForSelectedDay && activeJournalEntry ? (
                  <div className="space-y-3">
                    <div
                      onClick={() => setShowFullViewModal(true)}
                      className="pt-1 flex items-start gap-3 cursor-pointer group"
                    >
                      {activeJournalEntry.imageUrl && !brokenImages[activeJournalEntry.id] ? (
                        <img
                          src={activeJournalEntry.imageUrl}
                          alt={activeJournalEntry.title}
                          onError={() => markImageBroken(activeJournalEntry.id)}
                          className="w-[74px] h-[74px] rounded-[16px] object-cover shrink-0 border border-[var(--color-border)] shadow-2xs group-hover:brightness-105 transition-all"
                        />
                      ) : (
                        <div className="w-[74px] h-[74px] rounded-[16px] shrink-0 border border-[var(--color-border)] bg-gradient-to-br from-[#FAF4E8] to-[#DDEBCF] flex items-center justify-center">
                          <MochiHappyCompanion className="w-14 h-14" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-[15.5px] text-[var(--color-text-primary)] leading-snug group-hover:text-[var(--color-primary)] transition-colors truncate">
                            {activeJournalEntry.title}
                          </h3>
                          <p className="text-[13px] text-[var(--color-text-secondary)] mt-1 line-clamp-2 leading-relaxed font-normal">
                            {activeJournalEntry.content}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-2.5 gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--color-highlight)] text-[var(--color-primary)] text-[11.5px] font-bold">
                              <MoodFaceIcon
                                mood={classifyJournalMood(activeJournalEntry).mood}
                                size={13}
                              />
                              <span>{activeJournalEntry.tag || 'Nhẹ nhõm'}</span>
                            </span>
                            <span className="text-[11px] text-[var(--color-text-secondary)] tabular-nums">
                              {activeJournalEntry.time}
                            </span>
                          </div>

                          <span className="text-[12px] font-bold text-[var(--color-primary)] hover:underline cursor-pointer shrink-0">
                            Đọc toàn bộ →
                          </span>
                        </div>
                      </div>
                    </div>

                    {renderAiSentimentBar(activeJournalEntry)}

                    {selectedDayData.entries.length > 1 && (
                      <div className="pt-1 border-t border-dashed border-[var(--color-border)] space-y-1.5">
                        <p className="text-[11px] font-semibold text-[var(--color-text-secondary)]">
                          Các bài viết khác trong ngày ({selectedDayData.entries.length - 1}):
                        </p>
                        {selectedDayData.entries.slice(1).map((extra) => (
                          <button
                            key={extra.id}
                            onClick={() => onEditJournal(extra)}
                            type="button"
                            className="flex w-full items-center justify-between rounded-xl bg-[var(--color-background)] px-3 py-2 text-left text-[12px] hover:bg-[var(--color-surface-mint)] transition"
                          >
                            <span className="font-semibold text-[var(--color-primary)] truncate">
                              {extra.title}
                            </span>
                            <span className="text-[11px] text-[var(--color-text-secondary)] shrink-0 ml-2">
                              {extra.time}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-4 text-center space-y-2.5">
                    {selectedDayData.checkIn ? (
                      <div className="mx-auto max-w-sm rounded-2xl border border-[var(--color-highlight)] bg-[var(--color-surface-mint)]/75 px-3.5 py-2.5 text-[12px] text-[var(--color-primary-text)]">
                        Đã ghi nhận Check-in ngày này:{' '}
                        <strong className="text-[var(--color-primary)]">
                          {selectedDayData.checkIn.moodLabel} ({selectedDayData.checkIn.mood}/10)
                        </strong>{' '}
                        · Ngủ {selectedDayData.checkIn.sleepHours}h
                      </div>
                    ) : null}
                    <p className="text-[14px] font-semibold text-[var(--color-text-primary)]">
                      Ngày này chưa có trang nhật ký 🌱
                    </p>
                    <p className="text-[12.5px] text-[var(--color-text-secondary)] max-w-[280px] mx-auto leading-relaxed">
                      Mỗi ngày đều có một câu chuyện nhỏ đáng được lắng nghe và lưu giữ riêng cho bạn.
                    </p>
                    <div className="pt-1">
                      <button
                        onClick={onOpenNewJournal}
                        type="button"
                        className="px-5 py-2.5 bg-[var(--color-primary)] hover:brightness-105 text-white rounded-full font-bold text-[13px] transition-all shadow-xs inline-flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit_note</span>
                        <span>Viết nhật ký hôm nay</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* 5. MOCHI FOOTER */}
            <section className="pt-1 pb-2 flex items-center justify-center gap-3">
              <MochiFooterResting className="w-28 h-16 shrink-0" />
              <div className="flex-1 pr-1">
                <p className="text-[13px] font-medium text-[var(--color-text-secondary)] leading-relaxed">
                  <span className="text-[#F3B346] mr-1">✦</span>
                  Tiếp tục ghi lại những suy nghĩ, cảm xúc và hành trình của riêng bạn nhé! 💚
                  <span className="text-[#F3B346] ml-1">✦</span>
                </p>
              </div>
            </section>

            {/* Desktop Photo Gallery Quick Entry */}
            <section className="hidden md:flex items-center justify-between gap-4 rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[0_2px_10px_rgba(31,92,67,0.03)]">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-surface-mint)] text-[var(--color-primary)]">
                  <span className="material-symbols-outlined text-[22px]">photo_library</span>
                </div>
                <div className="min-w-0">
                  <h3 className="text-[14px] font-bold text-[var(--color-primary)]">
                    Thư viện ảnh kỷ niệm
                  </h3>
                  <p className="text-[12px] text-[var(--color-text-secondary)] truncate">
                    Xem lại những bức ảnh đã lưu cùng từng trang nhật ký.
                  </p>
                </div>
              </div>
              <button
                onClick={onOpenGallery}
                type="button"
                className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--color-surface-mint)] px-4 py-2 text-[12.5px] font-bold text-[var(--color-primary)] transition hover:bg-[var(--color-highlight)] whitespace-nowrap"
              >
                <span>Mở thư viện</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </section>
          </div>
        </div>

        {/* 6. JOURNAL TIMELINE & SEARCH SECTION */}
        <section className="pt-2 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="text-[18px] font-bold text-[var(--color-primary)]">
                Dòng thời gian nhật ký ({entries.length})
              </h2>
              <p className="text-[12px] text-[var(--color-text-secondary)]">
                Tìm kiếm và xem lại tất cả những trang viết riêng tư của bạn
              </p>
            </div>

            <div className="hidden md:flex flex-wrap items-center gap-2">
              <div className="relative w-64">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm tiêu đề, cảm xúc..."
                  className="w-full bg-white border border-[var(--color-border)] rounded-full pl-10 pr-8 py-2 text-[13px] text-[var(--color-text-primary)] placeholder:text-[#8E9D93] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    aria-label="Xóa tìm kiếm"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[15px]">close</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'Nhẹ nhõm', label: 'Nhẹ nhõm' },
              { id: 'Biết ơn', label: 'Biết ơn' },
              { id: 'Thư giãn', label: 'Thư giãn' },
              { id: 'Hơi lo lắng', label: 'Hơi lo lắng' },
            ].map((filterItem) => (
              <button
                key={filterItem.id}
                onClick={() => setMoodFilter(filterItem.id)}
                type="button"
                className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition whitespace-nowrap ${
                  moodFilter === filterItem.id
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-mint)]'
                }`}
              >
                {filterItem.label}
              </button>
            ))}
          </div>

          {filteredTimelineEntries.length === 0 ? (
            <div className="rounded-[22px] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center">
              <p className="text-[14px] font-semibold text-[var(--color-primary)]">
                Chưa tìm thấy bài nhật ký phù hợp
              </p>
              <p className="mt-1 text-[12px] text-[var(--color-text-secondary)]">
                Hãy thử từ khóa khác hoặc viết thêm một trang nhật ký mới hôm nay.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredTimelineEntries.map((entry) => (
                <article
                  key={entry.id}
                  onClick={() => onEditJournal(entry)}
                  className="group cursor-pointer rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[0_2px_10px_rgba(31,92,67,0.03)] transition hover:border-[var(--color-secondary)] flex flex-col justify-between gap-3"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2 text-[11px] text-[var(--color-text-secondary)]">
                      <span className="truncate font-medium">{entry.date}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="tabular-nums">{entry.time}</span>
                        {onDeleteJournal && (
                          <button
                            type="button"
                            aria-label={`Xóa bài viết ${entry.title}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setPendingDeleteEntry(entry);
                            }}
                            className="flex h-7 w-7 items-center justify-center rounded-full text-[#A7683F] hover:bg-[#FFF0E1] hover:text-[#B44A3E] transition"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              delete_outline
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      {entry.imageUrl && !brokenImages[entry.id] && (
                        <img
                          src={entry.imageUrl}
                          alt={entry.title}
                          onError={() => markImageBroken(entry.id)}
                          className="h-14 w-14 rounded-xl object-cover shrink-0 border border-[var(--color-border)]"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[14.5px] font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] truncate">
                          {entry.title}
                        </h3>
                        <p className="mt-1 text-[12.5px] text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed">
                          {entry.content}
                        </p>
                      </div>
                    </div>

                    {renderAiSentimentBar(entry, true)}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]/60">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-highlight)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--color-primary)]">
                      <MoodFaceIcon mood={classifyJournalMood(entry).mood} size={13} />
                      <span>{entry.tag || 'Nhẹ nhõm'}</span>
                    </span>
                    <span className="text-[11.5px] font-semibold text-[var(--color-primary)] group-hover:underline">
                      Mở bài viết →
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Full View Modal */}
        {showFullViewModal && activeJournalEntry && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-[var(--color-surface)] rounded-[24px] p-5 md:p-6 w-full max-w-sm md:max-w-xl border border-[var(--color-border)] shadow-xl space-y-3.5 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[12px] font-bold text-[var(--color-primary)] bg-[var(--color-surface-mint)] px-3 py-1 rounded-full">
                  {activeJournalEntry.date} · {activeJournalEntry.time}
                </span>
                <button
                  onClick={() => setShowFullViewModal(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-mint)]"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              {activeJournalEntry.imageUrl && !brokenImages[activeJournalEntry.id] && (
                <img
                  src={activeJournalEntry.imageUrl}
                  alt={activeJournalEntry.title}
                  onError={() => markImageBroken(activeJournalEntry.id)}
                  className="w-full h-44 object-cover rounded-[18px] border border-[var(--color-border)]"
                />
              )}

              <h3 className="text-[18px] font-bold text-[var(--color-primary)] leading-snug">
                {activeJournalEntry.title}
              </h3>

              <p className="text-[14px] text-[var(--color-text-primary)] leading-relaxed whitespace-pre-wrap">
                {activeJournalEntry.content}
              </p>

              {renderAiSentimentBar(activeJournalEntry)}

              <div className="flex items-center gap-2 pt-2 border-t border-[var(--color-border)]">
                <span className="px-3 py-1 rounded-full bg-[var(--color-highlight)] text-[var(--color-primary)] text-[12px] font-bold flex items-center gap-1">
                  <MoodFaceIcon mood={classifyJournalMood(activeJournalEntry).mood} size={14} />
                  <span>{activeJournalEntry.tag || 'Nhẹ nhõm'}</span>
                </span>
                {activeJournalEntry.isEncrypted && (
                  <span className="px-2.5 py-1 rounded-full bg-[#F0EFEA] border border-[var(--color-border)] text-[var(--color-text-secondary)] text-[11px] font-medium inline-flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">lock</span>
                    Riêng tư mã hóa
                  </span>
                )}
              </div>

              <div className="pt-2 flex gap-2.5">
                {onDeleteJournal && (
                  <button
                    onClick={() => setPendingDeleteEntry(activeJournalEntry)}
                    className="px-4 py-2.5 rounded-full border border-[#EED6D2] bg-[#FFF5F3] text-[#B44A3E] font-bold text-[13px] flex items-center justify-center gap-1 hover:bg-[#FDE8E4] active:scale-95 transition-all"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                    <span>Xóa</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowFullViewModal(false);
                    onEditJournal(activeJournalEntry);
                  }}
                  className="flex-1 py-2.5 bg-[var(--color-primary)] text-white font-bold rounded-full text-[13.5px] flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  <span>Chỉnh sửa bài viết</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2-Step Safe Delete Confirmation Dialog */}
        {pendingDeleteEntry && onDeleteJournal && (
          <div className="fixed inset-0 z-[70] bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-[368px] rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-2xl space-y-3.5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFF0E1] text-[#B44A3E]">
                  <span className="material-symbols-outlined text-[21px]">delete_forever</span>
                </span>
                <div>
                  <h3 className="text-[16px] font-bold text-[var(--color-primary)]">
                    Xác nhận xóa trang nhật ký?
                  </h3>
                  <p className="text-[11.5px] text-[var(--color-text-secondary)]">
                    {pendingDeleteEntry.date}
                  </p>
                </div>
              </div>

              <p className="text-[13px] leading-relaxed text-[var(--color-text-primary)]">
                Bài viết <strong>“{pendingDeleteEntry.title}”</strong> sẽ được xóa khỏi danh sách nhật ký của bạn và không thể khôi phục lại.
              </p>

              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setPendingDeleteEntry(null)}
                  className="flex-1 rounded-full border border-[var(--color-border)] bg-white py-2.5 text-[13px] font-bold text-[var(--color-primary)] hover:bg-[var(--color-surface-mint)] transition"
                >
                  Giữ lại
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteEntry}
                  className="flex-1 rounded-full bg-[#B44A3E] py-2.5 text-[13px] font-bold text-white shadow-sm hover:brightness-105 active:scale-95 transition"
                >
                  Xác nhận xóa
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
