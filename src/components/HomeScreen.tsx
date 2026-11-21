import React, { useMemo, useState } from 'react';
import { CheckIn, JournalEntry, MainTab, RiskSnapshot } from '../types';
import {
  WELLNESS_EXERCISES,
  WellnessExercise,
  WellnessExerciseId,
} from '../data/wellnessExercises';
import {
  MindCareBrandLogo,
  MochiHappyCompanion,
  MochiRestingCompanion,
  WarmGiftEnvelopeVector,
} from './MochiIllustrations';
import { getJournalStats, localDateKey } from '../utils/journalStats';
import { WeeklyRecapOverlay } from './WeeklyRecapOverlay';

interface HomeScreenProps {
  checkIn?: CheckIn;
  checkIns: CheckIn[];
  journals: JournalEntry[];
  completedExerciseIds: WellnessExerciseId[];
  startedExerciseIds: WellnessExerciseId[];
  riskSnapshot?: RiskSnapshot;
  onOpenCheckIn: () => void;
  onOpenSettings: () => void;
  onOpenStreak: () => void;
  onOpenJournal: () => void;
  onOpenExercise: (id: WellnessExerciseId) => void;
  onOpenSharing: (route: 'feed' | 'recipients') => void;
  onNavigateTab: (tab: MainTab) => void;
  onOpenCrisisDrawer?: () => void;
  onOpenSelfCare?: () => void;
  onOpenContacts?: () => void;
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

function resolveDateKey(dateStr?: string, createdAt?: number): string {
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
    return localDateKey(new Date(createdAt));
  }
  return '';
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  checkIn,
  checkIns,
  journals,
  completedExerciseIds,
  startedExerciseIds,
  riskSnapshot,
  onOpenCheckIn,
  onOpenSettings,
  onOpenStreak,
  onOpenJournal,
  onOpenExercise,
  onOpenSharing,
  onNavigateTab,
  onOpenCrisisDrawer,
  onOpenSelfCare,
  onOpenContacts,
}) => {
  const [showAllExercises, setShowAllExercises] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const [showRecap, setShowRecap] = useState(false);

  const now = new Date();
  const todayKey = localDateKey(now);
  const greeting =
    now.getHours() < 11
      ? 'Chào buổi sáng'
      : now.getHours() < 18
        ? 'Chào buổi chiều'
        : 'Chào buổi tối';
  const formattedDate = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(now);

  const todayCheckIn = useMemo(() => {
    const found = checkIns.find((c) => resolveDateKey(c.date, c.createdAt) === todayKey);
    if (found) return found;
    if (checkIn && resolveDateKey(checkIn.date, checkIn.createdAt) === todayKey) {
      return checkIn;
    }
    return undefined;
  }, [checkIn, checkIns, todayKey]);

  const hasCheckedInToday = Boolean(todayCheckIn);
  const journalStats = useMemo(() => getJournalStats(journals), [journals]);
  const writingDates = journalStats.writingDates;
  const hasWrittenJournalToday = writingDates.has(todayKey);

  const weeklyWriting = useMemo(
    () =>
      Array.from({ length: 7 }).map((_, index) => {
        const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const mondayOffset = (now.getDay() + 6) % 7;
        date.setDate(now.getDate() - mondayOffset + index);
        const key = localDateKey(date);
        const isFuture = key > todayKey;
        const isToday = key === todayKey;
        return {
          label: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'][index],
          isToday,
          isFuture,
          isCompleted: writingDates.has(key),
        };
      }),
    [todayKey, writingDates]
  );
  const weeklyWritingCount = weeklyWriting.filter((day) => day.isCompleted).length;

  const recent7Summary = useMemo(() => {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
    const startKey = localDateKey(start);
    const checkInDays = new Set<string>();
    const activeDays = new Set<string>();
    let journalCount = 0;

    for (const c of checkIns) {
      const k = resolveDateKey(c.date, c.createdAt);
      if (k >= startKey && k <= todayKey) {
        checkInDays.add(k);
        activeDays.add(k);
      }
    }
    for (const j of journals) {
      const k = resolveDateKey(j.date, j.createdAt);
      if (k >= startKey && k <= todayKey) {
        activeDays.add(k);
        journalCount += 1;
      }
    }
    return {
      checkInDays: checkInDays.size,
      activeDays: activeDays.size,
      journalCount,
    };
  }, [checkIns, journals, todayKey]);

  const isElevatedRisk =
    riskSnapshot?.currentTier === 'L2' ||
    riskSnapshot?.currentTier === 'L3' ||
    riskSnapshot?.currentTier === 'L4';

  const isHighCrisisRisk =
    riskSnapshot?.currentTier === 'L3' || riskSnapshot?.currentTier === 'L4';

  // Dynamic notifications list (replaces hardcoded "2")
  const notifications = useMemo(() => {
    const items: {
      id: string;
      icon: string;
      tone: 'warm' | 'primary' | 'mint';
      title: string;
      subtitle: string;
      action: () => void;
    }[] = [];

    if (riskSnapshot?.adaptiveScreeningPrompt) {
      items.push({
        id: `screening-${riskSnapshot.adaptiveScreeningPrompt.recommendedScale}`,
        icon: 'psychology_alt',
        tone: 'warm',
        title: 'Gợi ý rà soát cảm xúc ngắn (30 giây)',
        subtitle: riskSnapshot.adaptiveScreeningPrompt.reason,
        action: () => {
          if (onOpenSelfCare) onOpenSelfCare();
          else onNavigateTab('ai');
        },
      });
    }

    if (isElevatedRisk && (onOpenCrisisDrawer || onOpenContacts)) {
      items.push({
        id: `support-${riskSnapshot?.currentTier}`,
        icon: 'health_and_safety',
        tone: 'warm',
        title: 'Không gian Điểm tựa & Phao an toàn',
        subtitle:
          'Mochi nhận thấy bạn đang có nhiều áp lực — chạm để mở nhanh Kế hoạch an toàn 6 bước.',
        action: () => {
          if (onOpenCrisisDrawer) onOpenCrisisDrawer();
          else onOpenContacts?.();
        },
      });
    }

    if (!hasCheckedInToday) {
      items.push({
        id: `checkin-${todayKey}`,
        icon: 'favorite',
        tone: 'primary',
        title: 'Nhịp Check-in cảm xúc hôm nay',
        subtitle: 'Dành 1 phút ghi nhận tâm trạng và giấc ngủ đêm qua cùng Mochi nhé.',
        action: onOpenCheckIn,
      });
    } else if (!hasWrittenJournalToday) {
      items.push({
        id: `journal-${todayKey}`,
        icon: 'edit_note',
        tone: 'mint',
        title: 'Gửi gắm vài dòng nhật ký hôm nay',
        subtitle:
          journalStats.currentStreak > 0
            ? `Tiếp nối chuỗi ${journalStats.currentStreak} ngày viết liên tiếp của bạn.`
            : 'Lưu lại một khoảnh khắc nhỏ giúp tâm trí lắng dịu hơn.',
        action: onOpenJournal,
      });
    }

    items.push({
      id: 'mailbox-community',
      icon: 'mail',
      tone: 'mint',
      title: 'Hòm thư tâm sự ẩn danh',
      subtitle: 'Ghé đọc hoặc gửi trao một lời đồng cảm ấm áp trong ngày.',
      action: () => onOpenSharing('feed'),
    });

    return items;
  }, [
    riskSnapshot,
    isElevatedRisk,
    hasCheckedInToday,
    hasWrittenJournalToday,
    todayKey,
    journalStats.currentStreak,
    onOpenSelfCare,
    onNavigateTab,
    onOpenCrisisDrawer,
    onOpenContacts,
    onOpenCheckIn,
    onOpenJournal,
    onOpenSharing,
  ]);

  const unreadNotificationCount = notifications.filter(
    (item) => !readNotificationIds.includes(item.id)
  ).length;

  const markNotificationRead = (id: string) => {
    setReadNotificationIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const markAllNotificationsRead = () => {
    setReadNotificationIds(notifications.map((n) => n.id));
  };

  const visibleExercises = showAllExercises
    ? WELLNESS_EXERCISES
    : WELLNESS_EXERCISES.slice(0, 2);

  const checkInChips =
    hasCheckedInToday && todayCheckIn
      ? [
          todayCheckIn.moodLabel,
          ...todayCheckIn.emotions.slice(0, 2),
          SLEEP_QUALITY_LABELS[todayCheckIn.sleepQuality],
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
            {isElevatedRisk && onOpenCrisisDrawer && (
              <button
                onClick={onOpenCrisisDrawer}
                aria-label="Mở Phao An Toàn"
                title="Mở Phao An Toàn & Kế hoạch an toàn"
                className="flex min-h-9 items-center gap-1 rounded-full border border-[#E78A45]/45 bg-[#FFF0E1] px-2.5 py-1 text-[11px] font-bold text-[#A7683F] transition hover:bg-[#FFE6CE] active:scale-95"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px] text-[var(--color-secondary)]">
                  health_and_safety
                </span>
                <span className="hidden sm:inline">Phao an toàn</span>
              </button>
            )}

            <button
              onClick={onOpenStreak}
              aria-label={`Mở chuỗi viết ${journalStats.currentStreak} ngày`}
              className="flex min-h-11 items-center gap-1 rounded-full px-2.5 text-[var(--color-primary)] transition hover:bg-[var(--color-surface-mint)] active:scale-95"
              type="button"
            >
              <span className="material-symbols-outlined filled text-[20px] text-[var(--color-secondary)]">
                local_fire_department
              </span>
              <span className="text-[12px] font-bold tabular-nums">
                {journalStats.currentStreak}
              </span>
            </button>

            <button
              onClick={() => onOpenSharing('feed')}
              aria-label="Mở Hòm thư tâm sự"
              className="relative flex h-11 w-10 items-center justify-center rounded-full text-[var(--color-primary)] transition hover:bg-[var(--color-surface-mint)] active:scale-95"
              type="button"
            >
              <span className="material-symbols-outlined text-[21px]">mail</span>
            </button>

            <button
              onClick={() => setShowNotifications(true)}
              aria-label={`Mở thông báo (${unreadNotificationCount} chưa đọc)`}
              className="relative flex h-11 w-11 items-center justify-center rounded-full text-[var(--color-text-secondary)] transition hover:bg-white active:scale-95"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              {unreadNotificationCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-secondary)] px-1 text-[9px] font-bold text-white tabular-nums">
                  {unreadNotificationCount}
                </span>
              )}
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
            {/* HERO CHECK-IN CARD (Sharp Vector Mochi Companion) */}
            <section className="relative overflow-hidden rounded-[26px] border border-[var(--color-highlight)] bg-[var(--color-surface-mint)] p-4 md:p-6 shadow-[0_4px_16px_rgba(31,92,67,0.04)]">
              <div className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-[var(--color-highlight)]/85" />
              <span className="material-symbols-outlined absolute left-4 md:left-6 top-3 md:top-4 text-[18px] text-[var(--color-secondary)]">
                eco
              </span>
              <div className="relative grid grid-cols-[1fr_104px] md:grid-cols-[1fr_136px] items-center gap-3 md:gap-5">
                <div className="pt-5">
                  <h2 className="text-[17px] md:text-[20px] font-bold text-[var(--color-primary)]">
                    {hasCheckedInToday ? 'Check-in hôm nay' : 'Hôm nay bạn thế nào?'}
                  </h2>
                  {hasCheckedInToday ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {checkInChips.map((label) => (
                        <span
                          key={label}
                          className="rounded-full border border-[var(--color-secondary)]/25 bg-white/80 px-2.5 py-1 text-[10px] md:text-[11px] font-semibold text-[var(--color-primary)]"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-1 text-[12px] md:text-[13.5px] leading-5 text-[var(--color-text-secondary)]">
                      Dành một phút để lắng nghe cảm xúc và giấc ngủ của bạn cùng Mochi nhé.
                    </p>
                  )}
                  <button
                    onClick={onOpenCheckIn}
                    className={`mt-3.5 md:mt-4 inline-flex min-h-11 items-center gap-2 rounded-full px-4 md:px-5 text-[12.5px] md:text-[13.5px] font-bold transition active:scale-95 ${
                      hasCheckedInToday
                        ? 'border border-[var(--color-secondary)] bg-white/80 text-[var(--color-primary)] hover:bg-white'
                        : 'bg-[var(--color-primary)] text-white shadow-[0_4px_12px_rgba(40,92,61,0.18)] hover:brightness-105'
                    }`}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[17px]">
                      {hasCheckedInToday ? 'edit' : 'favorite'}
                    </span>
                    {hasCheckedInToday ? 'Cập nhật check-in' : 'Check-in ngay'}
                  </button>
                </div>

                <div className="relative flex items-center justify-center pt-2">
                  <MochiHappyCompanion className="w-24 h-24 md:w-32 md:h-32" />
                </div>
              </div>
            </section>

            {/* THẺ ĐIỂM TỰA & CHĂM SÓC CHỦ ĐỘNG */}
            {isElevatedRisk ? (
              <section className="relative overflow-hidden rounded-[26px] border border-[#E78A45]/45 bg-gradient-to-br from-[#FFF8EF] via-[#FFF4E6] to-[#E7F1DF] p-4 md:p-5 shadow-[0_6px_20px_rgba(167,104,63,0.08)]">
                <div className="flex items-start gap-3.5">
                  <MochiRestingCompanion className="w-16 h-16 md:w-20 md:h-20 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/85 px-2.5 py-0.5 text-[10.5px] font-bold text-[#A7683F] border border-[#E78A45]/30">
                      <span className="material-symbols-outlined text-[13px] text-[var(--color-secondary)]">
                        spa
                      </span>
                      {isHighCrisisRisk ? 'Điểm tựa an toàn bên bạn' : 'Nhịp nâng đỡ dịu dàng'}
                    </span>
                    <h2 className="mt-1.5 text-[16px] md:text-[17.5px] font-bold text-[var(--color-primary)]">
                      {isHighCrisisRisk
                        ? 'Bạn không cần đi qua khoảnh khắc này một mình'
                        : 'Hãy cho phép mình nghỉ một nhịp thật êm'}
                    </h2>
                    <p className="mt-1 text-[12px] md:text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
                      {riskSnapshot?.adaptiveScreeningPrompt?.reason ||
                        'Nếu tâm trí đang mang nhiều sức nặng, bạn có thể mở Phao An Toàn hoặc rà soát cảm xúc nhẹ nhàng cùng Mochi bất cứ lúc nào.'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={() => {
                      if (onOpenCrisisDrawer) onOpenCrisisDrawer();
                      else if (onOpenContacts) onOpenContacts();
                      else onOpenSharing('recipients');
                    }}
                    type="button"
                    className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-4 py-2.5 text-[12.5px] font-bold text-white shadow-sm transition hover:brightness-105 active:scale-98"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      health_and_safety
                    </span>
                    <span>Phao An Toàn / Kế hoạch an toàn</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onOpenSelfCare) onOpenSelfCare();
                      else onNavigateTab('ai');
                    }}
                    type="button"
                    className="flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--color-primary)]/35 bg-white/90 px-4 py-2.5 text-[12.5px] font-bold text-[var(--color-primary)] transition hover:bg-white active:scale-98"
                  >
                    <span className="material-symbols-outlined text-[18px]">self_improvement</span>
                    <span>Tự chăm sóc &amp; Rà soát cảm xúc</span>
                  </button>
                </div>
              </section>
            ) : (
              <section className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[0_3px_14px_rgba(31,92,67,0.04)]">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div>
                    <h2 className="text-[14.5px] md:text-[15.5px] font-bold text-[var(--color-primary)]">
                      Điểm tựa &amp; Chăm sóc chủ động
                    </h2>
                    <p className="text-[11px] text-[var(--color-text-secondary)]">
                      Chuẩn bị thói quen lành mạnh và vòng kết nối tin cậy của riêng bạn
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-[20px] text-[var(--color-primary)]/70">
                    verified_user
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={() => {
                      if (onOpenSelfCare) onOpenSelfCare();
                      else onOpenExercise('selfcare');
                    }}
                    type="button"
                    className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-mint)]/55 p-3 text-left transition hover:border-[var(--color-primary)]/35 hover:bg-[var(--color-surface-mint)] active:scale-[0.99]"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--color-primary)] shadow-2xs">
                      <span className="material-symbols-outlined text-[20px]">spa</span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12.5px] font-bold text-[var(--color-primary)] truncate">
                        Tự chăm sóc &amp; Rà soát 30s
                      </span>
                      <span className="block text-[10.5px] text-[var(--color-text-secondary)] truncate">
                        Thói quen nhỏ &amp; lắng nghe cơ thể
                      </span>
                    </span>
                    <span className="material-symbols-outlined text-[17px] text-[var(--color-primary)]/65">
                      chevron_right
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      if (onOpenContacts) onOpenContacts();
                      else onOpenSharing('recipients');
                    }}
                    type="button"
                    className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[#FFF8EF] p-3 text-left transition hover:border-[#E78A45]/45 hover:bg-[#FFF0E1]/80 active:scale-[0.99]"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--color-secondary)] shadow-2xs">
                      <span className="material-symbols-outlined text-[20px]">favorite</span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12.5px] font-bold text-[var(--color-primary)] truncate">
                        Người tin cậy &amp; Kế hoạch an toàn
                      </span>
                      <span className="block text-[10.5px] text-[var(--color-text-secondary)] truncate">
                        Điểm tựa ấm áp khi cần sẻ chia
                      </span>
                    </span>
                    <span className="material-symbols-outlined text-[17px] text-[var(--color-secondary-text)]/70">
                      chevron_right
                    </span>
                  </button>
                </div>
              </section>
            )}

            {/* JOURNAL STREAK CARD */}
            <section className="rounded-[24px] border border-dashed border-[var(--color-secondary)]/45 bg-[var(--color-surface)] p-4 shadow-[0_3px_14px_rgba(31,92,67,0.04)]">
              <button
                onClick={onOpenStreak}
                className="flex w-full items-start justify-between gap-3 text-left transition active:scale-[0.99]"
                type="button"
              >
                <div>
                  <p className="text-[13px] font-bold text-[var(--color-primary)]">
                    Chuỗi nhật ký tuần này
                  </p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="material-symbols-outlined filled text-[23px] text-[var(--color-secondary)]">
                      history_edu
                    </span>
                    <strong className="text-[18px] text-[var(--color-primary)]">
                      {weeklyWritingCount} ngày đã viết
                    </strong>
                  </div>
                  <p className="mt-1 text-[11px] text-[var(--color-text-secondary)]">
                    Mỗi dòng viết đều là một bước nhỏ vỗ về tâm trí.
                  </p>
                </div>
                <span className="material-symbols-outlined mt-1 text-[20px] text-[var(--color-primary)]">
                  arrow_forward
                </span>
              </button>

              <div className="mt-4 grid grid-cols-7 gap-1">
                {weeklyWriting.map((day) => (
                  <div key={day.label} className="text-center">
                    <span className="text-[9.5px] font-bold text-[var(--color-text-secondary)]">
                      {day.label}
                    </span>
                    <div
                      className={`mx-auto mt-1 flex h-8 w-8 items-center justify-center rounded-full border ${
                        day.isCompleted
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                          : 'border-dashed border-[var(--color-border)] bg-[var(--color-chart-background)] text-[var(--color-text-secondary)]'
                      } ${
                        day.isToday
                          ? 'ring-2 ring-[var(--color-secondary)] ring-offset-2 ring-offset-white'
                          : ''
                      } ${day.isFuture ? 'opacity-45' : ''}`}
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
                <span className="text-[11px] font-semibold text-[var(--color-text-secondary)] tabular-nums">
                  {weeklyWritingCount}/7 ngày trong tuần
                </span>
                <button
                  onClick={onOpenJournal}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-[var(--color-primary)] px-4 text-[11.5px] font-bold text-white transition hover:brightness-105 active:scale-95"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[15px]">edit_note</span>
                  Viết vài dòng
                </button>
              </div>
            </section>
          </div>

          <div className="space-y-5 lg:col-span-5">
            {/* WELLNESS EXERCISES */}
            <section>
              <div className="mb-3">
                <h2 className="text-[17px] md:text-[18px] font-bold text-[var(--color-primary)]">
                  Dành cho bạn hôm nay
                </h2>
                <p className="mt-0.5 text-[11.5px] leading-5 text-[var(--color-text-secondary)]">
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
                        <span className="material-symbols-outlined text-[24px]">
                          {exercise.icon}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-[13.5px] font-bold text-[var(--color-text-primary)]">
                            {exercise.title}
                          </h3>
                          {(completed || inProgress) && (
                            <span className="material-symbols-outlined filled shrink-0 text-[19px] text-[var(--color-secondary)]">
                              {completed ? 'check_circle' : 'pending'}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-[11px] leading-4 text-[var(--color-text-secondary)]">
                          {exercise.description}
                        </p>
                        <div className="mt-2 flex items-center gap-2 text-[10px] font-semibold">
                          <span className="flex items-center gap-1 text-[var(--color-text-secondary)]">
                            <span className="material-symbols-outlined text-[13px]">
                              schedule
                            </span>
                            {exercise.duration}
                          </span>
                          <span className="text-[var(--color-primary)]">
                            {completed
                              ? 'Xem lại'
                              : inProgress
                                ? 'Tiếp tục'
                                : exercise.action}
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

            {/* ELEGANT STORY WEEKLY RECAP INVITATION CARD (No debug/prototype links) */}
            <section
              className="relative overflow-hidden rounded-[28px] border border-[var(--color-primary)]/25 p-5 shadow-[0_8px_24px_-6px_rgba(31,92,67,0.12)] transition-all"
              style={{
                background:
                  'linear-gradient(135deg, #FFF8EF 0%, #E7F1DF 55%, #DDEBCF 100%)',
              }}
            >
              <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/55 blur-xs" />

              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/85 px-2.5 py-0.5 text-[10.5px] font-bold text-[var(--color-primary)] border border-[var(--color-border)]">
                    <span className="material-symbols-outlined text-[13px] text-[var(--color-secondary)]">
                      auto_awesome
                    </span>
                    Story Tổng kết tuần
                  </span>
                  <h2 className="mt-2 text-[18px] font-bold text-[var(--color-primary)]">
                    Nhìn lại tuần qua
                  </h2>
                </div>
                <WarmGiftEnvelopeVector className="w-14 h-14 shrink-0" />
              </div>

              <p className="relative mt-1.5 text-[13px] leading-relaxed text-[var(--color-primary-text)]/90">
                {recent7Summary.activeDays > 0
                  ? `7 ngày qua bạn đã có ${recent7Summary.checkInDays}/7 ngày check-in và ${recent7Summary.journalCount} trang nhật ký. Cùng mở lại từng khoảnh khắc đáng nhớ nhé.`
                  : 'Mở bức thư tổng kết nhẹ nhàng để xem bức tranh cảm xúc, giấc ngủ và những bước chăm sóc nhỏ trong tuần.'}
              </p>

              <div className="relative mt-3 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-white/75 px-2.5 py-1 text-[10.5px] font-semibold text-[var(--color-primary)] tabular-nums">
                  {recent7Summary.checkInDays}/7 ngày check-in
                </span>
                <span className="rounded-full bg-white/75 px-2.5 py-1 text-[10.5px] font-semibold text-[var(--color-primary)] tabular-nums">
                  {recent7Summary.journalCount} bài nhật ký
                </span>
                {completedExerciseIds.length > 0 && (
                  <span className="rounded-full bg-white/75 px-2.5 py-1 text-[10.5px] font-semibold text-[#A7683F] tabular-nums">
                    {completedExerciseIds.length} bài tự chăm sóc
                  </span>
                )}
              </div>

              <div className="relative mt-4 flex items-center justify-between gap-2">
                <button
                  onClick={() => setShowRecap(true)}
                  className="inline-flex min-h-[42px] items-center gap-2 rounded-full bg-[var(--color-primary)] px-5 py-2 text-[13px] font-bold text-white shadow-[0_4px_14px_rgba(31,92,67,0.22)] transition hover:brightness-105 active:scale-95"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">auto_stories</span>
                  <span>Mở Story tổng kết tuần</span>
                </button>

                <button
                  onClick={() => onNavigateTab('stats')}
                  type="button"
                  className="inline-flex items-center gap-0.5 rounded-full bg-white/80 px-3.5 py-2 text-[12px] font-bold text-[var(--color-primary)] border border-[var(--color-border)] transition hover:bg-white"
                >
                  <span>Thống kê</span>
                  <span className="material-symbols-outlined text-[15px]">chevron_right</span>
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* DYNAMIC BELL NOTIFICATIONS POPOVER */}
      {showNotifications && (
        <>
          <button
            onClick={() => setShowNotifications(false)}
            aria-label="Đóng thông báo"
            className="fixed inset-0 z-50 bg-[var(--color-text-primary)]/20 backdrop-blur-[1px]"
            type="button"
          />
          <section className="fixed left-1/2 top-20 z-[51] w-[calc(100%-32px)] max-w-[396px] -translate-x-1/2 rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-xl">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-[15px] font-bold text-[var(--color-primary)]">
                  Nhịp nhắc dịu dàng
                </h2>
                <p className="mt-0.5 text-[10.5px] text-[var(--color-text-secondary)]">
                  {unreadNotificationCount > 0
                    ? `${unreadNotificationCount} gợi ý mới cho hôm nay`
                    : 'Bạn đã xem hết cập nhật hôm nay'}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {unreadNotificationCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    type="button"
                    className="rounded-full px-2.5 py-1 text-[10.5px] font-bold text-[var(--color-primary)] hover:bg-[var(--color-surface-mint)]"
                  >
                    Đã xem hết
                  </button>
                )}
                <button
                  onClick={() => setShowNotifications(false)}
                  aria-label="Đóng"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-mint)]"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            </div>

            <div className="mt-3 space-y-2 max-h-[60vh] overflow-y-auto">
              {notifications.map((item) => {
                const isUnread = !readNotificationIds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      markNotificationRead(item.id);
                      setShowNotifications(false);
                      item.action();
                    }}
                    className={`flex min-h-[68px] w-full items-center gap-3 rounded-2xl border p-3 text-left transition active:scale-[0.99] ${
                      item.tone === 'warm'
                        ? 'border-[#E78A45]/35 bg-[#FFF8EF]'
                        : isUnread
                          ? 'border-[var(--color-secondary)]/25 bg-[var(--color-highlight)]/65'
                          : 'border-[var(--color-border)] bg-[var(--color-surface)]'
                    }`}
                    type="button"
                  >
                    <span
                      className={`material-symbols-outlined flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[20px] ${
                        item.tone === 'warm'
                          ? 'bg-[#FFF0E1] text-[var(--color-secondary)]'
                          : item.tone === 'primary'
                            ? 'bg-[var(--color-primary)] text-white'
                            : 'bg-[var(--color-surface-mint)] text-[var(--color-primary)]'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-[12px] font-bold text-[var(--color-primary)]">
                          {item.title}
                        </span>
                        {isUnread && (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--color-secondary)]" />
                        )}
                      </span>
                      <span className="mt-0.5 line-clamp-2 block text-[10.5px] leading-snug text-[var(--color-text-secondary)]">
                        {item.subtitle}
                      </span>
                    </span>
                    <span className="material-symbols-outlined text-[18px] text-[var(--color-primary)]">
                      chevron_right
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </>
      )}

      {/* Weekly Recap Story Overlay with Real User Data */}
      <WeeklyRecapOverlay
        isOpen={showRecap}
        isShort={checkIns.length === 0 && journals.length === 0}
        checkIns={checkIns}
        journals={journals}
        completedExerciseCount={completedExerciseIds.length}
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
