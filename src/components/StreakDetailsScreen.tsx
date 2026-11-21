import React, { useMemo } from 'react';
import { JournalEntry } from '../types';
import { getJournalStats } from '../utils/journalStats';
import { MochiHappyCompanion, MochiRestingCompanion } from './MochiIllustrations';

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
  const currentStreak = journalStats.currentStreak;
  const longestStreak = journalStats.longestStreak;
  const totalWritingDays = journalStats.totalWritingDays;
  const filledDots = Math.min(currentStreak, DOT_COUNT);

  const encouragementMessage = useMemo(() => {
    if (totalWritingDays === 0) {
      return 'Hành trình nào cũng bắt đầu từ một dòng chữ nhỏ đầu tiên. Khi nào bạn sẵn sàng, Mochi luôn ở đây lắng nghe bạn nhé!';
    }
    if (currentStreak === 0) {
      return `Bạn đã lưu giữ cảm xúc trong ${totalWritingDays} ngày (chuỗi dài nhất ${longestStreak} ngày). Nghỉ một nhịp không sao cả — hôm nay viết vài dòng nhẹ nhàng lại cùng Mochi nhé!`;
    }
    if (currentStreak < 7) {
      return `Thật ấm áp! Bạn đang duy trì ${currentStreak} ngày lắng nghe chính mình liên tiếp. Từng bước nhỏ dịu dàng đều đáng trân trọng.`;
    }
    return `Tuyệt vời quá! ${currentStreak} ngày đồng hành bền bỉ cùng khu vườn tâm trí. Cảm ơn bạn đã luôn dành thời gian vỗ về bản thân.`;
  }, [currentStreak, longestStreak, totalWritingDays]);

  return (
    <main className="relative flex min-h-[calc(100vh-33px)] md:min-h-screen flex-1 flex-col overflow-hidden bg-[var(--color-chart-background)] px-6 pb-8 pt-4 text-[var(--color-text-primary)]">
      <button
        onClick={onBack}
        aria-label="Quay lại trang Hôm nay"
        className="absolute left-3 top-2 md:left-6 md:top-6 flex h-11 w-11 items-center justify-center rounded-full text-[var(--color-primary)]/65 transition-all duration-200 ease-out hover:bg-white/60 hover:text-[var(--color-primary)] active:scale-90"
        type="button"
      >
        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
      </button>

      <section className="flex flex-1 flex-col items-center justify-center md:mx-auto md:max-w-2xl py-8">
        <div className="mb-3 flex items-center justify-center">
          {currentStreak > 0 ? (
            <MochiHappyCompanion className="w-24 h-24" />
          ) : (
            <MochiRestingCompanion className="w-24 h-24" />
          )}
        </div>

        <div className="text-center">
          <strong className="block text-[64px] md:text-[84px] font-bold leading-none tracking-[-0.05em] text-[var(--color-primary)] tabular-nums">
            {currentStreak}
          </strong>
          <span className="mt-2 block text-[11px] md:text-[13px] font-semibold tracking-[0.06em] uppercase text-[var(--color-text-secondary)]">
            ngày viết liên tiếp hiện tại
          </span>
        </div>

        <div className="mt-5 max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/90 px-4 py-3 text-center shadow-[0_4px_14px_rgba(31,92,67,0.05)]">
          <p className="text-[12.5px] md:text-[13.5px] leading-relaxed text-[var(--color-primary-text)]">
            {encouragementMessage}
          </p>
        </div>

        <div
          className="mt-9 grid grid-cols-10 gap-x-4 gap-y-3.5 md:gap-x-6 md:gap-y-5"
          aria-label={`${currentStreak} ngày viết liên tiếp`}
        >
          {Array.from({ length: DOT_COUNT }).map((_, index) => (
            <span
              key={index}
              className={`h-2.5 w-2.5 md:h-3 md:w-3 rounded-full transition-colors duration-300 ${
                index < filledDots
                  ? 'bg-[var(--color-primary)] shadow-[0_0_6px_rgba(31,92,67,0.28)]'
                  : 'border border-[var(--color-primary)]/20 bg-white/50'
              }`}
              aria-hidden="true"
            />
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-center gap-3 text-center text-[11px] md:text-[12.5px] font-semibold text-[var(--color-text-secondary)]">
        <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-1.5 tabular-nums">
          Tổng số ngày đã viết: <strong className="text-[var(--color-primary)]">{totalWritingDays}</strong>
        </span>
        <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-1.5 tabular-nums">
          Chuỗi dài nhất: <strong className="text-[var(--color-primary)]">{longestStreak} ngày</strong>
        </span>
      </div>
    </main>
  );
};
