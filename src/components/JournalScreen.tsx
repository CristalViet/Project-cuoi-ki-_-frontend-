import React, { useState, useMemo } from 'react';
import { JournalEntry, MainTab } from '../types';
import {
  MoodFaceIcon,
  MoodType,
  MochiPeeking,
  MochiFooterResting,
  CornerLeaves,
} from './MochiIllustrations';

interface JournalScreenProps {
  entries: JournalEntry[];
  onOpenNewJournal: () => void;
  onEditJournal: (entry: JournalEntry) => void;
  onOpenGallery: () => void;
  onOpenSettings?: () => void;
  onNavigateTab?: (tab: MainTab) => void;
}

interface DayState {
  dayNum: number;
  status: 'written' | 'unwritten' | 'future';
  mood?: MoodType;
  moodLabel?: string;
  entry?: JournalEntry;
}

// Preset baseline for October 2026 matching the mockup image_c489dd4f.png
const DEFAULT_OCTOBER_MOODS: Record<number, { mood: MoodType; label: string; status: 'written' | 'unwritten' | 'future' }> = {
  1: { mood: 'happy', label: 'Vui', status: 'written' },
  2: { mood: 'happy', label: 'Vui', status: 'written' },
  3: { mood: 'neutral', label: 'Bình thường', status: 'written' },
  4: { mood: 'happy', label: 'Vui', status: 'written' },
  5: { mood: 'neutral', label: 'Chưa viết', status: 'unwritten' },
  6: { mood: 'neutral', label: 'Chưa viết', status: 'unwritten' },
  7: { mood: 'neutral', label: 'Chưa viết', status: 'unwritten' },
  8: { mood: 'happy', label: 'Vui', status: 'written' },
  9: { mood: 'neutral', label: 'Bình thường', status: 'written' },
  10: { mood: 'stressed', label: 'Căng thẳng', status: 'written' },
  11: { mood: 'happy', label: 'Vui', status: 'written' },
  12: { mood: 'happy', label: 'Vui', status: 'written' },
  13: { mood: 'neutral', label: 'Chưa viết', status: 'unwritten' },
  14: { mood: 'sad', label: 'Buồn', status: 'written' },
  15: { mood: 'neutral', label: 'Bình thường', status: 'written' },
  16: { mood: 'happy', label: 'Vui', status: 'written' },
  17: { mood: 'neutral', label: 'Bình thường', status: 'written' },
  18: { mood: 'happy', label: 'Vui', status: 'written' },
  // 19 to 31 are future days
};

export const JournalScreen: React.FC<JournalScreenProps> = ({
  entries,
  onOpenNewJournal,
  onEditJournal,
  onOpenGallery,
  onNavigateTab,
}) => {
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(10); // 1-12
  const [selectedDay, setSelectedDay] = useState<number>(18);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [showFullViewModal, setShowFullViewModal] = useState<boolean>(false);
  const [moodFilter, setMoodFilter] = useState<string>('all');

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleGoToday = () => {
    setCurrentYear(2026);
    setCurrentMonth(10);
    setSelectedDay(18);
  };

  // Build the 31 days data for the month
  const monthDays: DayState[] = useMemo(() => {
    const daysInMonth = 31; // October has 31 days
    const result: DayState[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      // Find matching entry from real user journals
      const dayStr = day.toString().padStart(2, '0');
      const matchedEntry = entries.find((e) => {
        // Date formats: "Chủ nhật, 18/10/2026" or "18/10" or "2026-10-18"
        return (
          e.date.includes(`${dayStr}/${currentMonth.toString().padStart(2, '0')}`) ||
          e.date.includes(`${day}/${currentMonth}`) ||
          (e.id === 'j-1' && day === 18 && currentMonth === 10) ||
          (e.id === 'j-2' && day === 17 && currentMonth === 10) ||
          (e.id === 'j-3' && day === 15 && currentMonth === 10)
        );
      });

      if (matchedEntry) {
        // Map entry mood score or tag to MoodType
        let mood: MoodType = 'happy';
        let label = 'Vui';
        const tagLower = (matchedEntry.tag || '').toLowerCase();
        if (tagLower.includes('căng thẳng') || tagLower.includes('stress') || matchedEntry.moodScore <= 4) {
          mood = 'stressed';
          label = 'Căng thẳng';
        } else if (tagLower.includes('buồn') || tagLower.includes('mệt') || matchedEntry.moodScore <= 2) {
          mood = 'sad';
          label = 'Buồn';
        } else if (tagLower.includes('bình thường') || tagLower.includes('ổn định') || matchedEntry.moodScore === 5) {
          mood = 'neutral';
          label = 'Bình thường';
        } else {
          mood = 'happy';
          label = 'Vui';
        }

        result.push({
          dayNum: day,
          status: 'written',
          mood,
          moodLabel: label,
          entry: matchedEntry,
        });
      } else if (currentYear === 2026 && currentMonth === 10 && DEFAULT_OCTOBER_MOODS[day]) {
        const preset = DEFAULT_OCTOBER_MOODS[day];
        result.push({
          dayNum: day,
          status: preset.status,
          mood: preset.mood,
          moodLabel: preset.label,
        });
      } else if (day > 18 && currentMonth === 10 && currentYear === 2026) {
        result.push({
          dayNum: day,
          status: 'future',
        });
      } else {
        result.push({
          dayNum: day,
          status: 'unwritten',
        });
      }
    }

    return result;
  }, [entries, currentMonth, currentYear]);

  // Count happy days in the month
  const happyDaysCount = useMemo(() => {
    return monthDays.filter((d) => d.status === 'written' && d.mood === 'happy').length;
  }, [monthDays]);

  // Selected Day data
  const selectedDayData = useMemo(() => {
    return monthDays.find((d) => d.dayNum === selectedDay) || {
      dayNum: selectedDay,
      status: 'unwritten' as const,
    };
  }, [monthDays, selectedDay]);

  // Fallback demo entry for day 18 if not yet in localStorage
  const activeJournalEntry: JournalEntry = useMemo(() => {
    if (selectedDayData.entry) return selectedDayData.entry;
    if (selectedDay === 18 && currentMonth === 10) {
      return (
        entries[0] || {
          id: 'j-1',
          date: 'Chủ nhật, 18/10/2026',
          dayLabel: 'Chủ nhật',
          time: '21:40',
          title: 'Một bước nhỏ hoàn thành bài đồ án',
          content:
            'Hôm nay mình đã hoàn thành một phần bài tập đồ án tốt nghiệp. Dù vẫn còn vài hạng mục cần tinh chỉnh, nhưng cảm thấy nhẹ nhõm hơn nhiều khi chia nhỏ việc ra làm.',
          tag: 'Vui',
          moodScore: 6,
          aiEstimateLabel: 'Tích cực nhẹ',
          aiEstimateScore: 6,
          aiBarWidth: 62,
          isEncrypted: true,
          allowAiRef: false,
          createdAt: Date.now(),
          imageUrl: '/assets/aistudio/journal_thumb_plant.png',
        }
      );
    }
    return null as any;
  }, [selectedDayData, selectedDay, currentMonth, entries]);

  const hasJournalForSelectedDay = Boolean(selectedDayData.status === 'written' || activeJournalEntry);

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

  return (
    <div className="flex-1 flex flex-col bg-[var(--color-background)] text-[var(--color-text-primary)] px-4 pt-3 pb-24 md:pb-12 space-y-4 font-sans select-none relative md:px-8 md:pt-6">
      <div className="w-full md:max-w-6xl md:mx-auto space-y-4 md:space-y-6 relative">
      {/* Corner Leaves Decoration (Top-right corner in image_c489dd4f.png) */}
      <div className="absolute top-0 right-0 z-10 pointer-events-none">
        <CornerLeaves className="w-20 h-20" />
      </div>

      {/* 1. TOP HEADER: "Nhật ký" title & Search Button */}
      <header className="flex justify-between items-center w-full pt-1 pb-1 shrink-0 relative z-20">
        <div className="flex items-center gap-1.5">
          <h1 className="text-[28px] font-bold text-[var(--color-primary)] tracking-tight">
            Nhật ký
          </h1>
          {/* Tailored cute leaf accent over the title */}
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
              isSearchOpen ? 'bg-[var(--color-primary)] text-white' : 'bg-white text-[var(--color-primary)] hover:bg-[var(--color-surface-mint)]'
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
      {/* MOOD CALENDAR CARD (Thành phần quan trọng nhất) */}
      <section className="relative pt-[72px] mt-1 z-10">
        {/* Mochi Peeking Behind the Card (Centered on top edge) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <MochiPeeking className="w-48 h-[76px]" />
        </div>

        {/* White Card Container */}
        <div className="relative z-10 bg-[var(--color-surface)] rounded-[24px] p-4.5 border border-[var(--color-border)] shadow-[0_4px_16px_rgba(31,92,67,0.04)]">
          {/* 2.1 Calendar Header: [<] Tháng 10, 2026 [v] [>] [Hôm nay] */}
          <div className="flex items-center justify-between mb-4">
            {/* Prev month arrow */}
            <button
              onClick={handlePrevMonth}
              aria-label="Tháng trước"
              type="button"
              className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-primary)] hover:bg-[var(--color-surface-mint)] active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>

            {/* Month selector pill */}
            <div className="flex items-center gap-1 px-3 py-1 bg-[var(--color-chart-background)] border border-[var(--color-highlight)] rounded-full text-[var(--color-primary)] font-bold text-[15px] select-none shadow-2xs">
              <span>
                Tháng {currentMonth}, {currentYear}
              </span>
              <span className="material-symbols-outlined text-[18px]">expand_more</span>
            </div>

            {/* Next month arrow */}
            <button
              onClick={handleNextMonth}
              aria-label="Tháng sau"
              type="button"
              className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-primary)] hover:bg-[var(--color-surface-mint)] active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>

            {/* "Hôm nay" Pill Button */}
            <button
              onClick={handleGoToday}
              type="button"
              className="px-3.5 py-1 rounded-full border border-[var(--color-primary)] bg-white hover:bg-[var(--color-surface-mint)] active:scale-95 text-[var(--color-primary)] font-semibold text-[13px] transition-all cursor-pointer shadow-2xs"
            >
              Hôm nay
            </button>
          </div>

          {/* 2.2 Weekday Row (7 Columns: T2, T3, T4, T5, T6, T7, CN) */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2.5">
            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((wDay) => (
              <span
                key={wDay}
                className="text-[12.5px] font-semibold text-[var(--color-text-secondary)] py-0.5 select-none"
              >
                {wDay}
              </span>
            ))}
          </div>

          {/* 2.3 Calendar Grid: 7 columns of uniform circles */}
          <div className="grid grid-cols-7 gap-y-3 gap-x-1 text-center items-center">
            {monthDays.map((dayItem) => {
              const isSelected = selectedDay === dayItem.dayNum;
              const isWritten = dayItem.status === 'written';
              const isUnwritten = dayItem.status === 'unwritten';
              const isFuture = dayItem.status === 'future';

              // Determine circle background & style
              let circleBg = 'bg-[var(--color-background)]';
              if (isWritten) {
                if (dayItem.mood === 'happy') circleBg = 'bg-[var(--color-highlight)]';
                else if (dayItem.mood === 'neutral') circleBg = 'bg-[#FFF0B5]';
                else if (dayItem.mood === 'stressed') circleBg = 'bg-[#FFD7BD]';
                else if (dayItem.mood === 'sad') circleBg = 'bg-[#DCE7F5]';
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
                    className={`w-10 h-10 rounded-full flex flex-col items-center justify-center transition-all relative ${
                      isFuture ? 'cursor-not-allowed opacity-80' : 'cursor-pointer active:scale-95'
                    } ${circleBg} ${
                      isSelected
                        ? 'ring-3 ring-[var(--color-primary)] ring-offset-2 ring-offset-[var(--color-surface)] shadow-xs'
                        : ''
                    }`}
                  >
                    {/* Day Number */}
                    <span
                      className={`text-[12px] font-bold leading-none ${
                        isFuture
                          ? 'text-[#A0ABA3]'
                          : isWritten
                          ? 'text-[var(--color-text-primary)]'
                          : 'text-[var(--color-text-secondary)]'
                      }`}
                    >
                      {dayItem.dayNum}
                    </span>

                    {/* Mood Face Icon (under day number for written days) */}
                    {isWritten && dayItem.mood && (
                      <div className="mt-0.5 leading-none">
                        <MoodFaceIcon mood={dayItem.mood} size={15} />
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* 2.4 Calendar Legend Row (Matching image_c489dd4f.png) */}
          <div className="mt-5 pt-3 border-t border-[#F0EEE6] flex items-center justify-between text-[11.5px] text-[var(--color-text-secondary)] flex-wrap gap-y-2 px-0.5 select-none font-medium">
            {/* Vui */}
            <div className="flex items-center gap-1">
              <MoodFaceIcon mood="happy" size={16} />
              <span>Vui</span>
            </div>

            {/* Bình thường */}
            <div className="flex items-center gap-1">
              <MoodFaceIcon mood="neutral" size={16} />
              <span>Bình thường</span>
            </div>

            {/* Căng thẳng */}
            <div className="flex items-center gap-1">
              <MoodFaceIcon mood="stressed" size={16} />
              <span>Căng thẳng</span>
            </div>

            {/* Buồn */}
            <div className="flex items-center gap-1">
              <MoodFaceIcon mood="sad" size={16} />
              <span>Buồn</span>
            </div>

            {/* Chưa viết */}
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 rounded-full border border-dashed border-[#A8B6AD] bg-white inline-block" />
              <span>Chưa viết</span>
            </div>

            {/* Chưa tới */}
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 rounded-full bg-[#EAE5DA] inline-block" />
              <span>Chưa tới</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MONTHLY INSIGHT STRIP */}
      <section>
        <div className="bg-[var(--color-surface-mint)] border border-[#DCEBCF] rounded-[20px] px-4 py-3 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2 text-[var(--color-primary)]">
            <span
              className="material-symbols-outlined text-[20px] text-[#288355]"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 500" }}
            >
              signal_cellular_alt
            </span>
            <p className="text-[14px] font-bold text-[var(--color-primary)] tracking-tight">
              Tháng này bạn vui {happyDaysCount} ngày
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="w-[1px] h-4 bg-[#C2D8BA]" />
            <button
              onClick={() => onNavigateTab?.('stats')}
              type="button"
              className="text-[13px] font-bold text-[var(--color-primary)] hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>Xem thống kê</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>
      </section>
        </div>

        <div className="space-y-4 lg:col-span-6 lg:pt-[76px]">
      {/* 4. SELECTED DAY JOURNAL DETAIL CARD */}
      <section>
        <div className="bg-[var(--color-surface)] rounded-[24px] p-4.5 md:p-6 border border-[var(--color-border)] shadow-[0_2px_12px_rgba(31,92,67,0.04)] space-y-3">
          {/* Card Header: [Calendar Icon] Nhật ký ngày 18 tháng 10 ... [Chỉnh sửa] */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-mint)] flex items-center justify-center text-[var(--color-primary)]">
                <span
                  className="material-symbols-outlined text-[18px]"
                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 500" }}
                >
                  event_available
                </span>
              </div>
              <h2 className="font-bold text-[16px] text-[var(--color-primary)]">
                Nhật ký ngày {selectedDay} tháng {currentMonth}
              </h2>
            </div>

            {/* Action button */}
            {hasJournalForSelectedDay ? (
              <button
                onClick={() => onEditJournal(activeJournalEntry)}
                type="button"
                className="flex items-center gap-1.5 px-3 py-1 bg-[var(--color-surface-mint)] hover:bg-[var(--color-highlight)] text-[var(--color-primary)] rounded-full text-[12.5px] font-bold transition-all active:scale-95 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">edit</span>
                <span>Chỉnh sửa</span>
              </button>
            ) : (
              <button
                onClick={onOpenNewJournal}
                type="button"
                className="flex items-center gap-1.5 px-3 py-1 bg-[var(--color-primary)] hover:bg-[var(--color-primary)] text-white rounded-full text-[12.5px] font-bold transition-all active:scale-95 cursor-pointer shadow-2xs"
              >
                <span className="material-symbols-outlined text-[15px]">add</span>
                <span>Viết ngay</span>
              </button>
            )}
          </div>

          {/* Card Body: Thumbnail on left, title & excerpt on right, chips at bottom */}
          {hasJournalForSelectedDay ? (
            <div
              onClick={() => setShowFullViewModal(true)}
              className="pt-1 flex items-start gap-3 cursor-pointer group"
            >
              {/* Left 72x72 Square Thumbnail */}
              <img
                src={activeJournalEntry?.imageUrl || '/assets/aistudio/journal_thumb_plant.png'}
                alt={activeJournalEntry?.title || 'Nhật ký'}
                className="w-[72px] h-[72px] rounded-[16px] object-cover shrink-0 border border-[var(--color-border)] shadow-2xs group-hover:brightness-105 transition-all"
              />

              {/* Right Content */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-[15.5px] text-[var(--color-text-primary)] leading-snug group-hover:text-[var(--color-primary)] transition-colors truncate">
                    {activeJournalEntry?.title || 'Một bước nhỏ hoàn thành bài đồ án'}
                  </h3>
                  <p className="text-[13px] text-[var(--color-text-secondary)] mt-1 line-clamp-2 leading-relaxed font-normal">
                    {activeJournalEntry?.content ||
                      'Hôm nay mình đã hoàn thành một phần bài tập đồ án tốt nghiệp. Dù vẫn còn vài hạng mục...'}
                  </p>
                </div>

                {/* Bottom Row: Mood badge, Tag chip, "Xem tất cả" */}
                <div className="flex items-center justify-between mt-2.5">
                  <div className="flex items-center gap-2">
                    {/* Mood Chip */}
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--color-highlight)] text-[var(--color-primary)] text-[12px] font-bold">
                      <MoodFaceIcon mood="happy" size={13} />
                      <span>{activeJournalEntry?.tag || 'Vui'}</span>
                    </span>

                    {/* Tag Chip */}
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#F0EFEA] border border-[var(--color-border)] text-[var(--color-text-secondary)] text-[11.5px] font-medium">
                      #học tập
                    </span>
                  </div>

                  {/* "Xem tất cả" Link */}
                  <span className="text-[12.5px] font-bold text-[var(--color-primary)] hover:underline cursor-pointer">
                    Xem tất cả
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Empty state for unwritten day */
            <div className="py-4 text-center space-y-2">
              <p className="text-[14px] font-semibold text-[var(--color-text-primary)]">
                Ngày này chưa có nhật ký 🌱
              </p>
              <p className="text-[12.5px] text-[var(--color-text-secondary)] max-w-[260px] mx-auto leading-relaxed">
                Mỗi ngày đều có một câu chuyện đáng được lắng nghe và lưu giữ.
              </p>
              <div className="pt-1">
                <button
                  onClick={onOpenNewJournal}
                  type="button"
                  className="px-5 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary)] text-white rounded-full font-bold text-[13px] transition-all shadow-xs inline-flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">edit_note</span>
                  <span>Viết cho ngày này</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 5. MOCHI FOOTER (Below Detail Card) */}
      <section className="pt-1 pb-4 flex items-center justify-center gap-3">
        {/* Mochi Resting on Grass */}
        <MochiFooterResting className="w-28 h-16 shrink-0" />

        {/* Uplifting message */}
        <div className="flex-1 pr-1">
          <p className="text-[13px] font-medium text-[var(--color-text-secondary)] leading-relaxed">
            <span className="text-[#F3B346] mr-1">✦</span>
            Tiếp tục ghi lại những suy nghĩ, cảm xúc và hành trình của bạn nhé! 💚
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
            <h3 className="text-[14px] font-bold text-[var(--color-primary)]">Thư viện ảnh kỷ niệm</h3>
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

      {/* 6. JOURNAL TIMELINE & SEARCH SECTION (Desktop/Tablet always visible; Mobile when searching) */}
      <section className={`${searchQuery.trim() ? 'block' : 'hidden md:block'} pt-2 space-y-4`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-[18px] font-bold text-[var(--color-primary)]">
              Dòng thời gian nhật ký
            </h2>
            <p className="text-[12px] text-[var(--color-text-secondary)]">
              Tìm kiếm và xem lại những trang viết gần đây của bạn
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 md:w-64 md:flex-none">
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
            { id: 'Vui', label: 'Vui' },
            { id: 'Bình thường', label: 'Bình thường' },
            { id: 'Căng thẳng', label: 'Căng thẳng' },
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
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 text-[11px] text-[var(--color-text-secondary)]">
                    <span className="truncate font-medium">{entry.date}</span>
                    <span className="shrink-0 tabular-nums">{entry.time}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    {entry.imageUrl && (
                      <img
                        src={entry.imageUrl}
                        alt={entry.title}
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
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]/60">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-highlight)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--color-primary)]">
                    {entry.tag || 'Nhẹ nhõm'}
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

      {/* Full View Modal when user taps "Xem tất cả" */}
      {showFullViewModal && activeJournalEntry && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[var(--color-surface)] rounded-[24px] p-5 md:p-6 w-full max-w-sm md:max-w-xl border border-[var(--color-border)] shadow-xl space-y-3.5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="text-[12.5px] font-bold text-[var(--color-primary)] bg-[var(--color-surface-mint)] px-3 py-1 rounded-full">
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

            {activeJournalEntry.imageUrl && (
              <img
                src={activeJournalEntry.imageUrl}
                alt={activeJournalEntry.title}
                className="w-full h-40 object-cover rounded-[18px] border border-[var(--color-border)]"
              />
            )}

            <h3 className="text-[18px] font-bold text-[var(--color-primary)] leading-snug">
              {activeJournalEntry.title}
            </h3>

            <p className="text-[14px] text-[var(--color-text-primary)] leading-relaxed whitespace-pre-wrap">
              {activeJournalEntry.content}
            </p>

            <div className="flex items-center gap-2 pt-2 border-t border-[var(--color-border)]">
              <span className="px-3 py-1 rounded-full bg-[var(--color-highlight)] text-[var(--color-primary)] text-[12px] font-bold flex items-center gap-1">
                <MoodFaceIcon mood="happy" size={14} />
                <span>{activeJournalEntry.tag || 'Vui'}</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-[#F0EFEA] border border-[var(--color-border)] text-[var(--color-text-secondary)] text-[12px] font-medium">
                #học tập
              </span>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setShowFullViewModal(false);
                  onEditJournal(activeJournalEntry);
                }}
                className="w-full py-2.5 bg-[var(--color-primary)] text-white font-bold rounded-full text-[13.5px] flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
                <span>Chỉnh sửa bài viết này</span>
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
