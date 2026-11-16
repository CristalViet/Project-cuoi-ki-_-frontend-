import React, { useMemo, useState } from 'react';
import { CheckIn, JournalEntry, MainTab } from '../types';
import {
  WELLNESS_EXERCISES,
  WellnessExercise,
  WellnessExerciseId,
} from '../data/wellnessExercises';
import { MindCareBrandLogo } from './MochiIllustrations';
import { getJournalStats, localDateKey } from '../utils/journalStats';
import { WeeklyRecapOverlay } from './WeeklyRecapOverlay';

interface HomeScreenProps {
  checkIn?: CheckIn;
  checkIns: CheckIn[];
  journals: JournalEntry[];
  completedExerciseIds: WellnessExerciseId[];
  startedExerciseIds: WellnessExerciseId[];
  onOpenCheckIn: () => void;
  onOpenSettings: () => void;
  onOpenStreak: () => void;
  onOpenJournal: () => void;
  onOpenExercise: (id: WellnessExerciseId) => void;
  onOpenSharing: (route: 'feed' | 'recipients') => void;
  onNavigateTab: (tab: MainTab) => void;
}

const ACCENTS: Record<WellnessExercise['accent'], string> = {
  peach: 'bg-[var(--color-surface-mint)] text-[var(--color-primary)]',
  sage: 'bg-[var(--color-highlight)] text-[var(--color-primary)]',
  yellow: 'bg-[var(--color-chart-background)] text-[var(--color-secondary)]',
  mint: 'bg-[var(--color-surface-mint)] text-[var(--color-secondary)]',
};

const SLEEP_QUALITY_LABELS: Record<CheckIn['sleepQuality'], string> = {
  restless: 'Ngủ chưa sâu',
  good: 'Ngủ khá ổn',
  refreshed: 'Thức dậy tỉnh táo',
};

export const HomeScreen: React.FC<HomeScreenProps> = ({
  checkIn,
  checkIns,
  journals,
  completedExerciseIds,
  startedExerciseIds,
  onOpenCheckIn,
  onOpenSettings,
  onOpenStreak,
  onOpenJournal,
  onOpenExercise,
  onOpenSharing,
  onNavigateTab,
}) => {
  const [showAllExercises, setShowAllExercises] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRecap, setShowRecap] = useState(false);
  const [recapForceFull, setRecapForceFull] = useState(false);
  const now = new Date();
  const todayKey = localDateKey(now);
  const greeting =
    now.getHours() < 11 ? 'Chào buổi sáng' : now.getHours() < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';
  const formattedDate = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(now);

  const hasCheckedInToday = Boolean(
    checkIn &&
      (checkIn.date === todayKey || localDateKey(new Date(checkIn.createdAt)) === todayKey)
  );
  const journalStats = useMemo(() => getJournalStats(journals), [journals]);
  const writingDates = journalStats.writingDates;

  const weeklyWriting = useMemo(
    () =>
      Array.from({ length: 7 }).map((_, index) => {
        const date = new Date(now);
        const mondayOffset = (now.getDay() + 6) % 7;
        date.setDate(now.getDate() - mondayOffset + index);
        const isFuture = date > now;
        const isToday = localDateKey(date) === todayKey;
        return {
          label: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'][index],
          isToday,
          isFuture,
          isCompleted: writingDates.has(localDateKey(date)),
        };
      }),
    [todayKey, writingDates]
  );
  const weeklyWritingCount = weeklyWriting.filter((day) => day.isCompleted).length;

  const recentCareDays = useMemo(() => {
    const threshold = new Date(now);
    threshold.setDate(now.getDate() - 7);
    return new Set(
      checkIns
        .filter((item) => new Date(item.createdAt) >= threshold)
        .map((item) => localDateKey(new Date(item.createdAt)))
    ).size;
  }, [checkIns, now]);

  const weeklyActiveDays = useMemo(() => {
    const threshold = new Date(now);
    threshold.setDate(now.getDate() - 7);
    const daySet = new Set<string>();
    checkIns.forEach((c) => {
      if (new Date(c.createdAt) >= threshold) {
        daySet.add(c.date || localDateKey(new Date(c.createdAt)));
      }
    });
    journals.forEach((j) => {
      if (j.createdAt && new Date(j.createdAt) >= threshold) {
        daySet.add(localDateKey(new Date(j.createdAt)));
      }
    });
    return Math.max(daySet.size, recentCareDays);
  }, [checkIns, journals, now, recentCareDays]);

  const hasEnoughDataForRecap = weeklyActiveDays >= 3;

  const visibleExercises = showAllExercises
    ? WELLNESS_EXERCISES
    : WELLNESS_EXERCISES.slice(0, 2);
  const checkInChips = hasCheckedInToday && checkIn
    ? [
        checkIn.moodLabel,
        ...checkIn.emotions.slice(0, 2),
        SLEEP_QUALITY_LABELS[checkIn.sleepQuality],
      ].filter((label, index, items) => label && items.indexOf(label) === index)
    : [];

  return (
    <div className="flex-1 bg-[var(--color-background)] pb-28 md:pb-12 text-[var(--color-text-primary)]">
      <header className="sticky top-0 z-30 border-b border-[var(--color-border)]/70 bg-[var(--color-background)]/95 px-4 md:px-8 py-2 md:py-3 backdrop-blur-xl">
        <div className="flex items-center justify-between md:max-w-6xl md:mx-auto">
          <button
            onClick={onOpenSettings}
            aria-label="Mở cài đặt tài khoản"
            className="flex min-h-11 items-center gap-2 rounded-xl pr-2 text-left active:scale-95 md:hidden"
            type="button"
          >
            <MindCareBrandLogo size={25} />
          </button>

          <div className="hidden md:flex items-center gap-2.5 text-[13px] font-medium text-[var(--color-text-secondary)]">
            <span className="inline-flex h-2 w-2 rounded-full bg-[var(--color-secondary)]" />
            <span>{formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)}</span>
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            <button
              onClick={onOpenStreak}
              aria-label={`Mở chuỗi viết ${journalStats.currentStreak} ngày`}
              className="flex min-h-11 items-center gap-1 rounded-full px-2.5 text-[var(--color-primary)] transition hover:bg-[var(--color-surface-mint)] active:scale-95"
              type="button"
            >
              <span className="material-symbols-outlined filled text-[20px] text-[var(--color-secondary)]">
                local_fire_department
              </span>
              <span className="text-[12px] font-bold tabular-nums">{journalStats.currentStreak}</span>
            </button>
            <button
              onClick={() => onOpenSharing('feed')}
              aria-label="Mở Hòm thư tâm sự"
              className="relative flex h-11 w-10 items-center justify-center rounded-full text-[var(--color-primary)] transition hover:bg-[var(--color-surface-mint)] active:scale-95"
              type="button"
            >
              <span className="material-symbols-outlined text-[21px]">mail</span>
              <span className="absolute right-1.5 top-2 h-2 w-2 rounded-full bg-[var(--color-secondary)] ring-2 ring-[var(--color-background)]" />
            </button>
            <button
              onClick={() => setShowNotifications(true)}
              aria-label="Mở thông báo"
              className="relative flex h-11 w-11 items-center justify-center rounded-full text-[var(--color-text-secondary)] transition hover:bg-white active:scale-95"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-secondary)] px-1 text-[8px] font-bold text-white">
                2
              </span>
            </button>
            <button
              onClick={onOpenSettings}
              aria-label="Mở hồ sơ của Minh"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#C8DAC4] bg-[var(--color-highlight)] text-[12px] font-bold text-[var(--color-primary)] active:scale-95"
              type="button"
            >
              M
            </button>
          </div>
        </div>
      </header>

      <main className="space-y-5 px-4 pt-4 md:max-w-6xl md:mx-auto md:px-8 md:pt-7 md:space-y-6">
        <section className="md:flex md:items-end md:justify-between md:gap-4">
          <div>
            <h1 className="text-[22px] md:text-[28px] font-bold leading-7 md:leading-9 text-[var(--color-primary)]">
              {greeting}, Minh
            </h1>
            <p className="mt-1 text-[12.5px] leading-5 text-[var(--color-text-secondary)] md:hidden">
              {formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)}
            </p>
            <p className="hidden md:block mt-1 text-[14px] text-[var(--color-text-secondary)]">
              Dành một nhịp chậm để lắng nghe cảm xúc và chăm sóc khu vườn tâm trí hôm nay.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenJournal}
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-[13px] font-bold text-[var(--color-primary)] shadow-2xs transition hover:bg-[var(--color-surface-mint)] active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">edit_note</span>
              Viết nhật ký
            </button>
          </div>
        </section>

        <div className="space-y-5 lg:grid lg:grid-cols-12 lg:gap-6 lg:space-y-0 lg:items-start">
          <div className="space-y-5 lg:col-span-7">

        <section className="relative overflow-hidden rounded-[26px] border border-[var(--color-highlight)] bg-[var(--color-surface-mint)] p-4 md:p-6 shadow-[0_4px_16px_rgba(31,92,67,0.04)]">
          <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-[var(--color-highlight)]" />
          <span className="material-symbols-outlined absolute left-4 md:left-6 top-3 md:top-4 text-[18px] text-[var(--color-secondary)]">
            eco
          </span>
          <div className="relative grid grid-cols-[1fr_112px] md:grid-cols-[1fr_144px] items-center gap-2 md:gap-4">
            <div className="pt-5">
              <h2 className="text-[17px] md:text-[20px] font-bold text-[var(--color-primary)]">
                {hasCheckedInToday ? 'Check-in hôm nay' : 'Hôm nay bạn thế nào?'}
              </h2>
              {hasCheckedInToday ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {checkInChips.map((label) => (
                    <span
                      key={label}
                      className="rounded-full border border-[var(--color-secondary)]/25 bg-white/75 px-2.5 py-1 text-[9.5px] md:text-[11px] font-semibold text-[var(--color-primary)]"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-1 text-[11.5px] md:text-[13px] leading-5 text-[var(--color-text-secondary)]">
                  Dành một phút để lắng nghe cảm xúc của bạn.
                </p>
              )}
              <button
                onClick={onOpenCheckIn}
                className={`mt-3 md:mt-4 inline-flex min-h-11 items-center gap-2 rounded-full px-4 md:px-5 text-[12px] md:text-[13px] font-bold transition active:scale-95 ${
                  hasCheckedInToday
                    ? 'border border-[var(--color-secondary)] bg-white/70 text-[var(--color-primary)] hover:bg-white'
                    : 'bg-[var(--color-primary)] text-white shadow-[0_4px_12px_rgba(40,92,61,0.18)]'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[17px]">
                  {hasCheckedInToday ? 'edit' : 'favorite'}
                </span>
                {hasCheckedInToday ? 'Cập nhật check-in' : 'Check-in'}
              </button>
            </div>
            <div className="relative h-28 md:h-36">
              <img
                src="/assets/MindCare_2D_Assets/characters/mochi_happy.png"
                alt="Mochi chào ngày mới"
                className="absolute bottom-0 right-0 h-28 w-28 md:h-36 md:w-36 object-contain [image-rendering:pixelated]"
              />
              <img
                src="/assets/MindCare_2D_Assets/plants/plant_flower.png"
                alt=""
                className="absolute bottom-0 left-0 h-9 w-9 md:h-11 md:w-11 object-contain [image-rendering:pixelated]"
              />
            </div>
          </div>
        </section>

        <section className="rounded-[24px] border border-dashed border-[var(--color-secondary)]/45 bg-[var(--color-surface)] p-4 shadow-[0_3px_14px_rgba(31,92,67,0.04)]">
          <button
            onClick={onOpenStreak}
            className="flex w-full items-start justify-between gap-3 text-left transition active:scale-[0.99]"
            type="button"
          >
            <div>
              <p className="text-[13px] font-bold text-[var(--color-primary)]">Chuỗi nhật ký tuần này</p>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="material-symbols-outlined filled text-[23px] text-[var(--color-secondary)]">
                  history_edu
                </span>
                <strong className="text-[18px] text-[var(--color-primary)]">
                  {weeklyWritingCount} ngày đã viết
                </strong>
              </div>
              <p className="mt-1 text-[10.5px] text-[var(--color-text-secondary)]">
                Mỗi dòng viết đều là một bước nhỏ.
              </p>
            </div>
            <span className="material-symbols-outlined mt-1 text-[20px] text-[var(--color-primary)]">
              arrow_forward
            </span>
          </button>

          <div className="mt-4 grid grid-cols-7 gap-1">
            {weeklyWriting.map((day) => (
              <div key={day.label} className="text-center">
                <span className="text-[9px] font-bold text-[var(--color-text-secondary)]">{day.label}</span>
                <div
                  className={`mx-auto mt-1 flex h-8 w-8 items-center justify-center rounded-full border ${
                    day.isCompleted
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                      : 'border-dashed border-[var(--color-border)] bg-[var(--color-chart-background)] text-[var(--color-text-secondary)]'
                  } ${day.isToday ? 'ring-2 ring-[var(--color-secondary)] ring-offset-2 ring-offset-white' : ''} ${
                    day.isFuture ? 'opacity-45' : ''
                  }`}
                >
                  {day.isCompleted ? (
                    <span className="material-symbols-outlined text-[15px]">check</span>
                  ) : (
                    <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-border)]" />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-dashed border-[var(--color-border)] pt-3">
            <span className="text-[10.5px] font-semibold text-[var(--color-text-secondary)]">
              {weeklyWritingCount}/7 ngày trong tuần
            </span>
            <button
              onClick={onOpenJournal}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-[var(--color-primary)] px-3.5 text-[10.5px] font-bold text-white transition active:scale-95"
              type="button"
            >
              <span className="material-symbols-outlined text-[15px]">edit_note</span>
              Viết vài dòng
            </button>
          </div>
        </section>
          </div>

          <div className="space-y-5 lg:col-span-5">
        <section>
          <div className="mb-3">
            <h2 className="text-[17px] md:text-[18px] font-bold text-[var(--color-primary)]">Dành cho bạn hôm nay</h2>
            <p className="mt-0.5 text-[11px] leading-5 text-[var(--color-text-secondary)]">
              Một vài hoạt động nhỏ để chăm sóc bản thân.
            </p>
          </div>

          <div className="space-y-3">
            {visibleExercises.map((exercise) => {
              const completed = completedExerciseIds.includes(exercise.id);
              const inProgress =
                !completed && startedExerciseIds.includes(exercise.id);
              return (
                <button
                  key={exercise.id}
                  onClick={() => onOpenExercise(exercise.id)}
                  className="flex min-h-[92px] w-full items-center gap-3 rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5 text-left shadow-[0_2px_10px_rgba(31,92,67,0.03)] transition hover:border-[#C8D8C5] active:scale-[0.99]"
                  type="button"
                >
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${ACCENTS[exercise.accent]}`}
                  >
                    <span className="material-symbols-outlined text-[24px]">{exercise.icon}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-[13.5px] font-bold text-[var(--color-text-primary)]">{exercise.title}</h3>
                      {(completed || inProgress) && (
                        <span className="material-symbols-outlined filled shrink-0 text-[19px] text-[var(--color-secondary)]">
                          {completed ? 'check_circle' : 'pending'}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-[10.5px] leading-4 text-[var(--color-text-secondary)]">
                      {exercise.description}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-[9.5px] font-semibold">
                      <span className="flex items-center gap-1 text-[var(--color-text-secondary)]">
                        <span className="material-symbols-outlined text-[13px]">schedule</span>
                        {exercise.duration}
                      </span>
                      <span className="text-[var(--color-primary)]">
                        {completed ? 'Xem lại' : inProgress ? 'Tiếp tục' : exercise.action}
                      </span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-[#9BA69E]">
                    chevron_right
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setShowAllExercises((current) => !current)}
            className="mt-3 flex min-h-11 w-full items-center justify-center gap-1 rounded-full border border-dashed border-[var(--color-secondary)]/40 text-[11.5px] font-bold text-[var(--color-primary)] transition hover:bg-[var(--color-surface-mint)]"
            type="button"
            aria-expanded={showAllExercises}
          >
            {showAllExercises ? 'Thu gọn bài tập' : 'Xem thêm bài tập'}
            <span className="material-symbols-outlined text-[17px]">
              {showAllExercises ? 'expand_less' : 'expand_more'}
            </span>
          </button>
        </section>

        {/* PHẦN 1: THẺ VÀO (nằm dưới cùng trang "Hôm nay") */}
        <section
          className={`relative overflow-hidden rounded-[28px] p-[20px_22px] transition-all ${
            hasEnoughDataForRecap
              ? 'border-[1.5px] border-[var(--color-primary)]/45 shadow-[0_8px_24px_-4px_rgba(31,92,67,0.16)]'
              : 'border-[1.5px] border-dashed border-[var(--color-primary)]/40'
          }`}
          style={{ background: 'linear-gradient(135deg, var(--color-sage-light) 0%, var(--color-primary-light) 100%)' }}
        >
          <div
            className="pointer-events-none absolute right-0 top-0 flex h-[80px] w-[96px] items-center justify-center pl-3 pb-2"
            style={{
              borderBottomLeftRadius: '64px',
              backgroundColor: 'rgba(255, 252, 247, 0.58)',
            }}
          >
            <span className="material-symbols-outlined text-[32px] text-[var(--color-secondary)]">
              auto_awesome
            </span>
          </div>

          <h2 className="relative text-[17px] font-bold text-[var(--color-primary)]">Nhìn lại tuần qua</h2>

          <p className="relative mt-1.5 max-w-[82%] text-[14px] leading-relaxed text-[var(--color-primary-text)]/85">
            {hasEnoughDataForRecap
              ? 'Tuần của bạn đã sẵn sàng. Có vài điều đáng nhớ đang chờ bạn.'
              : 'Chưa có đủ dữ liệu cho tuần này. Mỗi lần bạn quay lại đều giúp hành trình rõ hơn.'}
          </p>

          <div className="relative mt-3.5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setRecapForceFull(false);
                setShowRecap(true);
              }}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-[14px] font-bold text-[var(--color-primary)] shadow-xs transition hover:shadow-md active:scale-95"
              type="button"
            >
              <span>Xem hành trình</span>
              <span className="material-symbols-outlined text-[17px]">arrow_forward</span>
            </button>

            {!hasEnoughDataForRecap && (
              <button
                onClick={() => {
                  setRecapForceFull(true);
                  setShowRecap(true);
                }}
                className="text-[12px] font-semibold text-[var(--color-primary)] underline hover:opacity-85"
                type="button"
              >
                Xem bản mẫu đầy đủ (prototype)
              </button>
            )}

            <a
              href="/journey-recap.html"
              target="_blank"
              rel="noreferrer"
              className="text-[12px] font-medium text-[var(--color-primary-text)]/75 hover:text-[var(--color-primary)] hover:underline"
              title="Xem bản HTML độc lập có công tắc chuyển Mobile/Web"
            >
              Bản HTML Mobile/Web ↗
            </a>
          </div>
        </section>
          </div>
        </div>
      </main>

      {showNotifications && (
        <>
          <button
            onClick={() => setShowNotifications(false)}
            aria-label="Đóng thông báo"
            className="fixed inset-0 z-50 bg-[var(--color-text-primary)]/20 backdrop-blur-[1px]"
            type="button"
          />
          <section className="fixed left-1/2 top-24 z-[51] w-[calc(100%-32px)] max-w-[388px] -translate-x-1/2 rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[15px] font-bold text-[var(--color-primary)]">Thông báo</h2>
                <p className="mt-0.5 text-[10px] text-[var(--color-text-secondary)]">
                  Cập nhật mới từ Hòm thư tâm sự
                </p>
              </div>
              <button
                onClick={() => setShowNotifications(false)}
                aria-label="Đóng"
                className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-mint)]"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="mt-3 space-y-2">
              <button
                onClick={() => {
                  setShowNotifications(false);
                  onOpenSharing('feed');
                }}
                className="flex min-h-[72px] w-full items-center gap-3 rounded-2xl border border-[var(--color-secondary)]/20 bg-[var(--color-highlight)] p-3 text-left transition active:scale-[0.99]"
                type="button"
              >
                <span className="material-symbols-outlined flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)] text-[20px] text-white">
                  mark_email_unread
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[11.5px] font-bold text-[var(--color-primary)]">
                    Có một phản hồi mới
                  </span>
                  <span className="mt-0.5 block truncate text-[10px] text-[var(--color-text-secondary)]">
                    “Cảm ơn bạn đã chia sẻ. Bạn không hề một mình...”
                  </span>
                </span>
                <span className="material-symbols-outlined text-[18px] text-[var(--color-primary)]">
                  chevron_right
                </span>
              </button>
              <button
                onClick={() => {
                  setShowNotifications(false);
                  onOpenSharing('feed');
                }}
                className="flex min-h-[64px] w-full items-center gap-3 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-left transition active:scale-[0.99]"
                type="button"
              >
                <span className="material-symbols-outlined flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-surface-mint)] text-[18px] text-[var(--color-secondary)]">
                  favorite
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] font-bold text-[var(--color-text-primary)]">
                    Lá thư của bạn nhận được 3 đồng cảm
                  </span>
                  <span className="mt-0.5 block text-[9.5px] text-[var(--color-text-secondary)]">
                    Chạm để mở Hòm thư tâm sự
                  </span>
                </span>
                <span className="material-symbols-outlined text-[18px] text-[var(--color-primary)]">
                  chevron_right
                </span>
              </button>
            </div>
          </section>
        </>
      )}

      {/* Weekly Recap Story Overlay */}
      <WeeklyRecapOverlay
        isOpen={showRecap}
        isShort={!hasEnoughDataForRecap && !recapForceFull}
        onClose={() => setShowRecap(false)}
        onNavigateStats={() => {
          setShowRecap(false);
          onNavigateTab('stats');
        }}
        onOpenCheckIn={() => {
          setShowRecap(false);
          onOpenCheckIn();
        }}
        onOpenJournal={() => {
          setShowRecap(false);
          onOpenJournal();
        }}
      />
    </div>
  );
};
