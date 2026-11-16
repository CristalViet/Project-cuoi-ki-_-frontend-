import React, { useMemo } from 'react';
import { JournalEntry } from '../types';
import { getJournalStats } from '../utils/journalStats';

interface StreakDetailsScreenProps {
  journals: JournalEntry[];
  onBack: () => void;
}

const DOT_COUNT = 80;

export const StreakDetailsScreen: React.FC<StreakDetailsScreenProps> = ({
  journals,
  onBack,
}) => {
  const journalStats = useMemo(() => getJournalStats(journals), [journals]);
  const hasRecentData = useMemo(() => {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - 31);
    return journals.some((entry) => new Date(entry.createdAt) >= threshold);
  }, [journals]);
  const currentStreak = hasRecentData ? journalStats.currentStreak : 5;
  const longestStreak = hasRecentData ? journalStats.longestStreak : 9;
  const filledDots = Math.min(currentStreak, DOT_COUNT);

  return (
    <main className="relative flex min-h-[calc(100vh-33px)] md:min-h-screen flex-1 flex-col overflow-hidden bg-[var(--color-chart-background)] px-6 pb-8 pt-4 text-[var(--color-text-primary)]">
      <button
        onClick={onBack}
        aria-label="Quay lại trang Hôm nay"
        className="absolute left-3 top-2 md:left-6 md:top-6 flex h-11 w-11 items-center justify-center rounded-full text-[var(--color-primary)]/45 transition-all duration-200 ease-out hover:bg-white/40 hover:text-[var(--color-primary)] active:scale-90"
        type="button"
      >
        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
      </button>

      <section className="flex flex-1 flex-col items-center justify-center md:mx-auto md:max-w-2xl">
        <div className="text-center">
          <strong className="block text-[64px] md:text-[84px] font-medium leading-none tracking-[-0.06em] text-[var(--color-text-primary)] tabular-nums">
            {currentStreak}
          </strong>
          <span className="mt-2 block text-[10px] md:text-[12px] font-medium tracking-[0.08em] text-[var(--color-text-secondary)]/65">
            ngày duy trì
          </span>
        </div>

        <div
          className="mt-12 grid grid-cols-10 gap-x-4 gap-y-3.5 md:gap-x-6 md:gap-y-5"
          aria-label={`${currentStreak} ngày viết liên tiếp`}
        >
          {Array.from({ length: DOT_COUNT }).map((_, index) => (
            <span
              key={index}
              className={`h-2.5 w-2.5 md:h-3 md:w-3 rounded-full transition-colors duration-300 ${
                index < filledDots
                  ? 'bg-[var(--color-text-primary)]'
                  : 'border border-[var(--color-primary)]/15 bg-transparent'
              }`}
              aria-hidden="true"
            />
          ))}
        </div>
      </section>

      <p className="text-center text-[10px] md:text-[12px] font-medium tracking-[0.02em] text-[var(--color-text-secondary)]/55">
        Chuỗi dài nhất là {longestStreak} ngày
      </p>
    </main>
  );
};
