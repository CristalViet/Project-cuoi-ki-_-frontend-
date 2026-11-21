import React, { useEffect, useState } from 'react';
import {
  DailyHabit,
  RiskSnapshot,
  SafetyPlanData,
  ScreeningScaleType,
} from '../types';
import { AdaptiveScreeningCard } from './AdaptiveScreeningCard';
import { apiClient, DEFAULT_RISK_SNAPSHOT, DEFAULT_SAFETY_PLAN } from '../services/apiClient';
import { MochiHappyCompanion } from './MochiIllustrations';

interface SelfCareScreenProps {
  habits: DailyHabit[];
  onToggleHabit: (id: string) => void;
  onAddHabit: (title: string) => void;
  onStartBreathing: () => void;
  onBack: () => void;
  riskSnapshot?: RiskSnapshot;
  onRiskSnapshotUpdate?: (snap: RiskSnapshot) => void;
  onDeleteHabit?: (id: string) => void;
  onEditHabit?: (id: string, title: string) => void;
  onOpenSafetyPlan?: () => void;
  onOpenCrisisDrawer?: () => void;
}

const SCREENING_OPTIONS: {
  scale: ScreeningScaleType;
  badge: string;
  title: string;
  subtitle: string;
  icon: string;
}[] = [
  {
    scale: 'PHQ2_GAD2',
    badge: '30 giây · 4 câu',
    title: 'Rà soát nhanh 30s (PHQ-2 & GAD-2)',
    subtitle: 'Lắng nghe nhanh mức năng lượng & căng thẳng gần đây',
    icon: 'bolt',
  },
  {
    scale: 'PHQ9',
    badge: '9 câu · Khí sắc',
    title: 'Thang PHQ-9',
    subtitle: 'Rà soát chuyên sâu nhịp sinh học, giấc ngủ & hứng thú',
    icon: 'favorite',
  },
  {
    scale: 'GAD7',
    badge: '7 câu · Lo âu',
    title: 'Thang GAD-7',
    subtitle: 'Đánh giá mức độ bồn chồn, căng thẳng & khó thư giãn',
    icon: 'psychology_alt',
  },
];

export const SelfCareScreen: React.FC<SelfCareScreenProps> = ({
  habits,
  onToggleHabit,
  onAddHabit,
  onStartBreathing,
  onBack,
  riskSnapshot,
  onRiskSnapshotUpdate,
  onDeleteHabit,
  onEditHabit,
  onOpenSafetyPlan,
  onOpenCrisisDrawer,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [newHabitText, setNewHabitText] = useState('');
  const [showAddHabitInput, setShowAddHabitInput] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  // Habit inline edit & resilient fallback state
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [editingHabitTitle, setEditingHabitTitle] = useState('');
  const [localTitleOverrides, setLocalTitleOverrides] = useState<Record<string, string>>({});
  const [localDeletedIds, setLocalDeletedIds] = useState<string[]>([]);

  // Adaptive Screening & Safety Anchor state
  const [localRisk, setLocalRisk] = useState<RiskSnapshot>(
    riskSnapshot || DEFAULT_RISK_SNAPSHOT
  );
  const [activeScale, setActiveScale] = useState<ScreeningScaleType | null>(
    riskSnapshot?.adaptiveScreeningPrompt?.recommendedScale || null
  );
  const [scaleLaunchNonce, setScaleLaunchNonce] = useState(0);
  const [fallbackSafetyPlanModal, setFallbackSafetyPlanModal] = useState<SafetyPlanData | null>(
    null
  );

  const [selectedGuide, setSelectedGuide] = useState<{
    title: string;
    duration: string;
    category: string;
    steps: string[];
  } | null>(null);

  useEffect(() => {
    if (riskSnapshot) {
      setLocalRisk(riskSnapshot);
      if (riskSnapshot.adaptiveScreeningPrompt?.recommendedScale && !activeScale) {
        setActiveScale(riskSnapshot.adaptiveScreeningPrompt.recommendedScale);
      }
    } else {
      apiClient.getRiskState().then((snap) => {
        setLocalRisk(snap);
      });
    }
  }, [riskSnapshot]);

  const effectiveRisk = riskSnapshot || localRisk;

  const categories = ['Tất cả', 'Thở & Thư giãn', 'Tâm trí', 'Giấc ngủ'];

  const visibleHabits = habits
    .filter((h) => (onDeleteHabit ? true : !localDeletedIds.includes(h.id)))
    .map((h) => ({
      ...h,
      title: !onEditHabit && localTitleOverrides[h.id] ? localTitleOverrides[h.id] : h.title,
    }));

  const completedCount = visibleHabits.filter((h) => h.completed).length;
  const progressPercent =
    visibleHabits.length > 0 ? Math.round((completedCount / visibleHabits.length) * 100) : 0;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitText.trim()) return;
    onAddHabit(newHabitText.trim());
    setNewHabitText('');
    setShowAddHabitInput(false);
  };

  const handleStartEditHabit = (habit: DailyHabit) => {
    setEditingHabitId(habit.id);
    setEditingHabitTitle(habit.title);
  };

  const handleSaveEditHabit = (id: string) => {
    const trimmed = editingHabitTitle.trim();
    if (!trimmed) return;
    if (onEditHabit) {
      onEditHabit(id, trimmed);
    } else {
      setLocalTitleOverrides((prev) => ({ ...prev, [id]: trimmed }));
    }
    setEditingHabitId(null);
    setEditingHabitTitle('');
  };

  const handleRemoveHabit = (id: string) => {
    if (onDeleteHabit) {
      onDeleteHabit(id);
    } else {
      setLocalDeletedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    }
    if (editingHabitId === id) {
      setEditingHabitId(null);
    }
  };

  const handleSelectScreeningScale = (scale: ScreeningScaleType) => {
    if (activeScale === scale) {
      setActiveScale(null);
      return;
    }
    setActiveScale(scale);
    setScaleLaunchNonce((n) => n + 1);
  };

  const handleOpenSafetyPlanClick = async () => {
    if (onOpenSafetyPlan) {
      onOpenSafetyPlan();
      return;
    }
    const plan = await apiClient.getSafetyPlan().catch(() => DEFAULT_SAFETY_PLAN);
    setFallbackSafetyPlanModal(plan);
  };

  return (
    <div className="flex-1 flex flex-col bg-page-background text-text-primary px-4 md:px-8 pt-1 pb-24 md:pb-12 space-y-4">
      {/* Top App Bar */}
      <header className="sticky top-0 z-30 bg-page-background/95 backdrop-blur-md pt-2 pb-2 md:pt-4 md:max-w-5xl md:mx-auto md:w-full">
        <div className="flex items-center justify-between h-12">
          <button
            onClick={onBack}
            aria-label="Quay lại"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-text-primary hover:bg-surface-mint active:scale-95 transition-all cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <span className="text-[18px] font-bold tracking-tight text-primary">MINDCARE</span>
          <button
            onClick={() => setBookmarked(!bookmarked)}
            aria-label="Lưu trữ & Yêu thích"
            className={`w-10 h-10 rounded-xl flex items-center justify-center active:scale-95 transition-all cursor-pointer ${
              bookmarked
                ? 'text-primary bg-surface-mint'
                : 'text-text-secondary hover:bg-surface-mint'
            }`}
            type="button"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: bookmarked ? "'FILL' 1" : "'FILL' 0" }}
            >
              bookmark
            </span>
          </button>
        </div>

        {/* Title & Subtitle Header */}
        <div className="pt-1 pb-1">
          <h1 className="text-[24px] md:text-[28px] font-bold text-text-primary tracking-tight">
            Chăm sóc bản thân
          </h1>
          <p className="text-[14px] text-text-secondary mt-0.5">
            Thực hành vi mô, rà soát cảm xúc thích ứng và điểm tựa an toàn cho bạn
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col gap-4 lg:grid lg:grid-cols-12 lg:gap-6 lg:items-start md:max-w-5xl md:mx-auto md:w-full">
        <div className="flex flex-col gap-4 lg:col-span-7">
          {/* Highlighted Section: Điểm tựa Tâm lý & Rà soát Thích ứng */}
          <section
            aria-label="Điểm tựa Tâm lý và Rà soát Thích ứng"
            className="rounded-[26px] bg-gradient-to-br from-[#FAF7EE] via-[#FFFCF7] to-[#E7F1DF]/75 border border-[#CFE2CA] p-4 md:p-5 shadow-[0_8px_26px_rgba(31,92,67,0.07)] space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#E7F1DF] border border-[#C2DCBC] flex items-center justify-center shrink-0">
                  <MochiHappyCompanion className="w-11 h-11" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11.5px] font-bold uppercase tracking-wider text-[#1F5C43] bg-[#E7F1DF] px-2.5 py-0.5 rounded-full">
                      Chủ động lắng nghe
                    </span>
                    {effectiveRisk.adaptiveScreeningPrompt && (
                      <span className="text-[11.5px] font-semibold text-[#A7683F] bg-[#FFF0E1] px-2.5 py-0.5 rounded-full">
                        Mochi gợi ý rà soát nhẹ
                      </span>
                    )}
                  </div>
                  <h2 className="text-[17px] md:text-[18px] font-bold text-[#1F5C43] mt-1">
                    Điểm tựa Tâm lý &amp; Rà soát Thích ứng
                  </h2>
                  <p className="text-[12.5px] text-[#5B6B60] leading-relaxed mt-0.5">
                    Chủ động tự rà soát cảm xúc theo thang chuẩn quốc tế hoặc mở nhanh điểm tựa an toàn bất cứ khi nào bạn cần.
                  </p>
                </div>
              </div>
            </div>

            {/* 3 Scale Selector Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {SCREENING_OPTIONS.map((opt) => {
                const isSelected = activeScale === opt.scale;
                return (
                  <button
                    key={opt.scale}
                    type="button"
                    onClick={() => handleSelectScreeningScale(opt.scale)}
                    aria-pressed={isSelected}
                    className={`rounded-2xl p-3 text-left border transition-all active:scale-[0.98] cursor-pointer flex flex-col justify-between gap-2 ${
                      isSelected
                        ? 'bg-[#1F5C43] border-[#1F5C43] text-white shadow-[0_6px_18px_rgba(31,92,67,0.20)]'
                        : 'bg-[#FFFCF7] border-[#DCE8D5] text-[#285C3D] hover:bg-[#E7F1DF]/60 hover:border-[#1F5C43]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5 w-full">
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-white/15 text-white'
                            : 'bg-[#E7F1DF] text-[#1F5C43]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[17px]">{opt.icon}</span>
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-[#FAF7EE] text-[#756455] border border-[#E7E8DE]'
                        }`}
                      >
                        {opt.badge}
                      </span>
                    </div>
                    <div>
                      <p className="text-[13px] font-bold leading-snug">{opt.title}</p>
                      <p
                        className={`text-[11.5px] mt-0.5 leading-snug ${
                          isSelected ? 'text-white/85' : 'text-[#6A776D]'
                        }`}
                      >
                        {opt.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Embedded AdaptiveScreeningCard when a scale is selected */}
            {activeScale && (
              <div className="pt-0.5 animate-fade-in">
                <AdaptiveScreeningCard
                  key={`${activeScale}-${scaleLaunchNonce}`}
                  prompt={
                    effectiveRisk.adaptiveScreeningPrompt?.recommendedScale === activeScale
                      ? effectiveRisk.adaptiveScreeningPrompt
                      : null
                  }
                  initialScale={activeScale}
                  onRiskSnapshotUpdate={(snap) => {
                    setLocalRisk(snap);
                    onRiskSnapshotUpdate?.(snap);
                  }}
                  onOpenCrisisDrawer={onOpenCrisisDrawer}
                  onOpenBreathing={onStartBreathing}
                  onDismiss={() => setActiveScale(null)}
                />
              </div>
            )}

            {/* Quick Safety Plan & Crisis Safe Buoy Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 border-t border-[#D7E6D2]">
              <button
                type="button"
                onClick={handleOpenSafetyPlanClick}
                className="rounded-2xl bg-[#FFFCF7] hover:bg-[#E7F1DF]/70 border border-[#CFE2CA] p-3.5 text-left flex items-center gap-3 transition-all active:scale-[0.98] cursor-pointer shadow-2xs"
              >
                <div className="w-10 h-10 rounded-2xl bg-[#E7F1DF] text-[#1F5C43] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[21px]">fact_check</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-bold text-[#1F5C43] truncate">
                    Kế hoạch an toàn 6 bước
                  </p>
                  <p className="text-[11.5px] text-[#6B756D] leading-snug">
                    Chuẩn Stanley-Brown cá nhân hóa
                  </p>
                </div>
                <span className="material-symbols-outlined text-[18px] text-[#1F5C43] shrink-0">
                  chevron_right
                </span>
              </button>

              <button
                type="button"
                onClick={() => onOpenCrisisDrawer?.()}
                className="rounded-2xl bg-[#FFF8EF] hover:bg-[#FFF0E1] border border-[#EAD4BA] p-3.5 text-left flex items-center gap-3 transition-all active:scale-[0.98] cursor-pointer shadow-2xs"
              >
                <div className="w-10 h-10 rounded-2xl bg-[#FFF0E1] text-[#C86B28] flex items-center justify-center shrink-0">
                  <span
                    className="material-symbols-outlined text-[21px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    shield_with_heart
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-bold text-[#1F5C43] truncate">
                    Mở Phao An Toàn (WHO PFA)
                  </p>
                  <p className="text-[11.5px] text-[#756455] leading-snug">
                    Hotline 1-chạm &amp; SOS ấm áp
                  </p>
                </div>
                <span className="material-symbols-outlined text-[18px] text-[#A7683F] shrink-0">
                  open_in_new
                </span>
              </button>
            </div>
          </section>

          {/* Disclaimer Banner */}
          <section className="bg-surface-container-low rounded-2xl p-3.5 border border-border-subtle flex items-start gap-2.5 relative overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-surface-mint flex items-center justify-center text-primary shrink-0 mt-0.5">
              <span
                className="material-symbols-outlined text-[18px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                spa
              </span>
            </div>
            <div className="flex-1 pr-1">
              <p className="text-[12px] text-text-secondary leading-relaxed">
                Nội dung hướng dẫn tự chăm sóc và rà soát cảm xúc hỗ trợ nhận diện sớm, không thay thế chẩn đoán hay trị liệu tâm lý chuyên sâu.
              </p>
            </div>
          </section>

          {/* Category Filter Tabs */}
          <section className="-mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto no-scrollbar">
            <div
              aria-label="Chuyên mục thực hành"
              className="flex items-center gap-2 py-1"
              role="tablist"
            >
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    aria-selected={isSelected}
                    className={`text-[13px] px-4 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-white font-semibold shadow-xs'
                        : 'bg-surface-card border border-border-subtle text-text-secondary hover:bg-surface-mint hover:text-primary font-medium'
                    }`}
                    role="tab"
                    type="button"
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Featured Exercise Card (Bento Focus) */}
          {(selectedCategory === 'Tất cả' || selectedCategory === 'Thở & Thư giãn') && (
            <section className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11.5px] font-semibold uppercase tracking-wider text-text-secondary">
                  Bài tập nổi bật
                </span>
                <span className="inline-flex items-center gap-1 text-[12px] text-primary font-semibold">
                  <span className="material-symbols-outlined text-[16px]">bolt</span> Vi mô 2 phút
                </span>
              </div>

              <article className="bg-surface-card rounded-2xl p-4 border border-border-subtle card-shadow relative overflow-hidden flex flex-col gap-3">
                <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-surface-mint/60 pointer-events-none blur-xl"></div>
                <div className="flex items-start justify-between relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11.5px] font-semibold bg-surface-mint text-primary">
                      <span className="material-symbols-outlined text-[14px]">air</span> Thở điều hòa
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11.5px] text-text-secondary bg-page-background">
                      <span className="material-symbols-outlined text-[14px]">schedule</span> 2 phút
                    </span>
                  </div>

                  <div className="w-10 h-10 rounded-2xl bg-surface-mint/80 flex items-center justify-center text-primary shadow-xs">
                    <span
                      className="material-symbols-outlined text-[22px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      energy_savings_leaf
                    </span>
                  </div>
                </div>

                <div className="relative z-10">
                  <h2 className="text-[18px] font-bold text-text-primary">Hít thở 4-7-8</h2>
                  <p className="text-[14px] text-text-secondary mt-1">
                    Điều hòa nhịp tim, giảm căng thẳng tức thì
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1 relative z-10">
                  <div className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
                    <span className="text-[12px] text-text-secondary ml-2">
                      Phổ biến cho giờ giải lao
                    </span>
                  </div>
                  <button
                    onClick={onStartBreathing}
                    className="bg-primary text-white text-[13px] font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs hover:bg-primary-container active:scale-95 transition-all cursor-pointer"
                    type="button"
                  >
                    <span>Bắt đầu ngay</span>
                    <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                  </button>
                </div>
              </article>
            </section>
          )}

          {/* Other Exercises Section */}
          <section className="flex flex-col gap-2">
            <h2 className="text-[16px] font-semibold text-text-primary">Các bài thực hành khác</h2>
            <div className="flex flex-col gap-2.5">
              {/* Card 2: Thư giãn cơ bắp */}
              {(selectedCategory === 'Tất cả' || selectedCategory === 'Thở & Thư giãn') && (
                <article
                  onClick={() =>
                    setSelectedGuide({
                      title: 'Thư giãn cơ bắp tiến triển',
                      duration: '5 phút',
                      category: 'Cơ thể',
                      steps: [
                        'Ngồi tựa lưng thoải mái, thả lỏng hai bàn chân trên mặt sàn.',
                        'Hít vào sâu và nhún nhẹ hai vai lên gần tai trong 5 giây.',
                        'Thở ra chậm rãi và buông thõng vai hoàn toàn trong 10 giây.',
                        'Lặp lại nhẹ nhàng với bàn tay, cơ mặt và vùng lưng trên.',
                      ],
                    })
                  }
                  className="bg-surface-card rounded-2xl p-3.5 border border-border-subtle card-shadow flex items-start gap-3 hover:border-secondary transition-all cursor-pointer active:scale-[0.99]"
                >
                  <div className="w-12 h-12 rounded-2xl bg-secondary-container/40 flex items-center justify-center text-secondary shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[24px]">accessibility_new</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11.5px] text-secondary font-semibold bg-surface-mint px-2 py-0.5 rounded-md">
                        Cơ thể
                      </span>
                      <span className="text-[11.5px] text-text-secondary flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[13px]">schedule</span> 5 phút
                      </span>
                    </div>
                    <h3 className="text-[15px] font-semibold text-text-primary truncate">
                      Thư giãn cơ bắp tiến triển
                    </h3>
                    <p className="text-[12.5px] text-text-secondary mt-0.5 line-clamp-2">
                      Giải phóng căng cứng ở vai, cổ và lưng sau giờ học.
                    </p>
                  </div>
                  <button
                    aria-label="Mở bài tập"
                    className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:text-primary hover:bg-surface-mint transition-colors self-center"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                  </button>
                </article>
              )}

              {/* Card 3: Viết 3 điều tích cực */}
              {(selectedCategory === 'Tất cả' || selectedCategory === 'Tâm trí') && (
                <article
                  onClick={() =>
                    setSelectedGuide({
                      title: 'Thực hành 3 điều tích cực',
                      duration: '3 phút',
                      category: 'Tâm trí',
                      steps: [
                        'Nghĩ về 1 khoảnh khắc dễ chịu dù nhỏ bé trong hôm nay (tách trà, cơn gió mát...).',
                        'Ghi nhận 1 điều bạn đã cố gắng hoàn thành cho bản thân.',
                        'Nhớ lại 1 lời nói hoặc cử chỉ ấm áp bạn nhận được hoặc trao đi.',
                      ],
                    })
                  }
                  className="bg-surface-card rounded-2xl p-3.5 border border-border-subtle card-shadow flex items-start gap-3 hover:border-secondary transition-all cursor-pointer active:scale-[0.99]"
                >
                  <div className="w-12 h-12 rounded-2xl bg-tertiary-fixed/40 flex items-center justify-center text-tertiary shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[24px]">edit_note</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11.5px] text-tertiary font-semibold bg-tertiary-fixed/30 px-2 py-0.5 rounded-md">
                        Tâm trí
                      </span>
                      <span className="text-[11.5px] text-text-secondary flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[13px]">schedule</span> 3 phút
                      </span>
                    </div>
                    <h3 className="text-[15px] font-semibold text-text-primary truncate">
                      Viết 3 điều tích cực
                    </h3>
                    <p className="text-[12.5px] text-text-secondary mt-0.5 line-clamp-2">
                      Tái định hình góc nhìn và nuôi dưỡng lòng biết ơn.
                    </p>
                  </div>
                  <button
                    aria-label="Mở bài tập"
                    className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:text-primary hover:bg-surface-mint transition-colors self-center"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                  </button>
                </article>
              )}

              {/* Card 4: Nghỉ ngơi ngắn & Thả lỏng mắt */}
              {(selectedCategory === 'Tất cả' ||
                selectedCategory === 'Giấc ngủ' ||
                selectedCategory === 'Thở & Thư giãn') && (
                <article
                  onClick={() =>
                    setSelectedGuide({
                      title: 'Nghỉ ngơi ngắn & Thả lỏng mắt (20-20-20)',
                      duration: '2 phút',
                      category: 'Giác quan',
                      steps: [
                        'Rời mắt khỏi màn hình máy tính hoặc điện thoại sau mỗi 20 phút.',
                        'Hướng tầm nhìn ra một điểm xa khoảng 6 mét (ví dụ: tán cây hoặc bầu trời ngoài cửa sổ).',
                        'Chớp mắt nhẹ và giữ ánh nhìn thư giãn trong 20 giây trước khi quay lại làm việc.',
                      ],
                    })
                  }
                  className="bg-surface-card rounded-2xl p-3.5 border border-border-subtle card-shadow flex items-start gap-3 hover:border-secondary transition-all cursor-pointer active:scale-[0.99]"
                >
                  <div className="w-12 h-12 rounded-2xl bg-surface-mint flex items-center justify-center text-primary shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[24px]">visibility</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11.5px] text-primary font-semibold bg-surface-mint px-2 py-0.5 rounded-md">
                        Giác quan
                      </span>
                      <span className="text-[11.5px] text-text-secondary flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[13px]">schedule</span> 2 phút
                      </span>
                    </div>
                    <h3 className="text-[15px] font-semibold text-text-primary truncate">
                      Nghỉ ngơi ngắn &amp; Thả lỏng mắt
                    </h3>
                    <p className="text-[12.5px] text-text-secondary mt-0.5 line-clamp-2">
                      Kỹ thuật 20-20-20 cho sinh viên học tập bên màn hình máy tính.
                    </p>
                  </div>
                  <button
                    aria-label="Mở bài tập"
                    className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:text-primary hover:bg-surface-mint transition-colors self-center"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                  </button>
                </article>
              )}
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-4 lg:col-span-5 lg:sticky lg:top-28">
          {/* Personal Self-Care Checklist with Smooth Progress Bar & Edit/Delete */}
          <section className="bg-surface-card rounded-2xl p-4 border border-border-subtle card-shadow flex flex-col gap-3.5">
            <div className="space-y-2.5 border-b border-border-subtle pb-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-[16px] font-semibold text-text-primary">
                    Kế hoạch cá nhân hôm nay
                  </h2>
                  <p className="text-[11.5px] text-text-secondary">
                    Nhẹ nhàng hoàn thành theo tốc độ của bạn
                  </p>
                </div>
                <span className="text-[11.5px] font-bold px-2.5 py-1 rounded-full bg-surface-mint text-primary tabular-nums whitespace-nowrap">
                  {completedCount} / {visibleHabits.length} ({progressPercent}%)
                </span>
              </div>

              {/* Smooth Animated Percentage Progress Bar */}
              <div className="space-y-1">
                <div
                  role="progressbar"
                  aria-valuenow={progressPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Tiến độ hoàn thành thói quen hôm nay"
                  className="w-full h-2.5 rounded-full bg-[#E7F1DF] overflow-hidden border border-[#CFE2CA]/60"
                >
                  <div
                    className="h-full rounded-full bg-[#1F5C43] transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-[11.5px] text-text-secondary flex items-center justify-between">
                  <span>
                    {progressPercent === 100 && visibleHabits.length > 0
                      ? 'Tuyệt vời! Bạn đã chăm sóc bản thân trọn vẹn hôm nay 🌿'
                      : 'Mỗi thói quen nhỏ là một hạt mầm bình yên'}
                  </span>
                </p>
              </div>
            </div>

            {visibleHabits.length === 0 ? (
              <div className="rounded-xl bg-page-background border border-dashed border-border-subtle p-4 text-center space-y-1">
                <p className="text-[13px] font-semibold text-text-primary">
                  Danh sách hôm nay đang trống
                </p>
                <p className="text-[11.5px] text-text-secondary">
                  Hãy thêm một việc nhỏ dịu dàng cho bản thân bên dưới nhé.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {visibleHabits.map((habit) => {
                  const isEditing = editingHabitId === habit.id;

                  if (isEditing) {
                    return (
                      <div
                        key={habit.id}
                        className="flex items-center gap-1.5 p-2 rounded-xl border border-primary bg-surface-mint/35"
                      >
                        <input
                          type="text"
                          value={editingHabitTitle}
                          onChange={(e) => setEditingHabitTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSaveEditHabit(habit.id);
                            } else if (e.key === 'Escape') {
                              setEditingHabitId(null);
                            }
                          }}
                          autoFocus
                          aria-label="Sửa tên thói quen"
                          className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg border border-border-subtle bg-white text-[13.5px] text-text-primary focus:outline-none focus:border-primary"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEditHabit(habit.id)}
                          aria-label="Lưu tên thói quen"
                          className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shrink-0 hover:brightness-105 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[17px]">check</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingHabitId(null)}
                          aria-label="Hủy sửa"
                          className="w-8 h-8 rounded-lg bg-white border border-border-subtle text-text-secondary flex items-center justify-center shrink-0 hover:bg-page-background cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[17px]">close</span>
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={habit.id}
                      className={`group flex items-center gap-2.5 p-2.5 rounded-xl border transition-colors ${
                        habit.completed
                          ? 'bg-page-background/80 border-border-subtle'
                          : 'bg-surface-card border-border-subtle hover:bg-surface-mint/40'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => onToggleHabit(habit.id)}
                        className="flex-1 min-w-0 flex items-center gap-2.5 text-left cursor-pointer"
                      >
                        <span
                          className={`material-symbols-outlined text-[20px] shrink-0 ${
                            habit.completed ? 'text-primary' : 'text-text-secondary/65'
                          }`}
                          style={{
                            fontVariationSettings: habit.completed ? "'FILL' 1" : "'FILL' 0",
                          }}
                        >
                          {habit.completed ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                        <span
                          className={`flex-1 text-[14px] truncate ${
                            habit.completed
                              ? 'line-through text-text-secondary'
                              : 'text-text-primary font-medium'
                          }`}
                        >
                          {habit.title}
                        </span>
                      </button>

                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEditHabit(habit)}
                          aria-label={`Sửa thói quen ${habit.title}`}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-text-secondary hover:text-primary hover:bg-surface-mint transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveHabit(habit.id)}
                          aria-label={`Xóa thói quen ${habit.title}`}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-text-secondary hover:text-error hover:bg-error-container/35 transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add Habit Prompt or Form */}
            {showAddHabitInput ? (
              <form onSubmit={handleAddSubmit} className="flex items-center gap-2 pt-1">
                <input
                  value={newHabitText}
                  onChange={(e) => setNewHabitText(e.target.value)}
                  placeholder="Nhập thói quen mới (ví dụ: Uống trà hoa cúc)..."
                  className="flex-1 px-3 py-2 text-[13px] rounded-xl border border-border-subtle bg-page-background focus:outline-none focus:ring-1 focus:ring-primary"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-primary text-white text-[12.5px] font-semibold rounded-xl active:scale-95 cursor-pointer"
                >
                  Thêm
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddHabitInput(false)}
                  className="px-2 py-2 text-text-secondary text-[12.5px] cursor-pointer"
                >
                  Hủy
                </button>
              </form>
            ) : (
              <button
                onClick={() => setShowAddHabitInput(true)}
                className="w-full py-2.5 rounded-xl border border-dashed border-border-subtle text-primary hover:bg-surface-mint/50 active:scale-95 transition-all flex items-center justify-center gap-1.5 text-[12.5px] font-semibold cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Thêm thói quen nhỏ của bạn</span>
              </button>
            )}
          </section>

          {/* Supportive Philosophy Note */}
          <section className="text-center px-4 py-1 mb-2">
            <p className="text-[11.5px] text-text-secondary leading-relaxed">
              Thực hành chánh niệm vi mô không tạo áp lực hoàn hảo. Bạn chỉ cần dành trọn 2 phút cho chính mình.
            </p>
          </section>
        </div>
      </main>

      {/* Fallback 6-Step Safety Plan Quick Viewer Modal (if parent onOpenSafetyPlan not wired) */}
      {fallbackSafetyPlanModal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setFallbackSafetyPlanModal(null)}
        >
          <div
            className="bg-surface-card rounded-[26px] max-w-[500px] w-full max-h-[88dvh] overflow-y-auto p-5 border border-border-subtle shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-primary">
                Kế hoạch an toàn 6 bước Stanley-Brown
              </h3>
              <button
                type="button"
                onClick={() => setFallbackSafetyPlanModal(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:bg-surface-mint cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            {[
              { n: 1, t: 'Dấu hiệu cảnh báo sớm', items: fallbackSafetyPlanModal.warningSigns },
              { n: 2, t: 'Chiến lược tự làm dịu tại chỗ', items: fallbackSafetyPlanModal.internalCoping },
              { n: 3, t: 'Không gian & sao nhãng an toàn', items: fallbackSafetyPlanModal.safePlacesAndDistractions },
              { n: 4, t: 'Người thân tin cậy', items: fallbackSafetyPlanModal.trustedPeople },
              { n: 5, t: 'Chuyên gia & Đường dây khẩn cấp', items: fallbackSafetyPlanModal.professionalContacts },
              { n: 6, t: 'Giữ môi trường an toàn', items: fallbackSafetyPlanModal.safeEnvironmentSteps },
            ].map((s) => (
              <div key={s.n} className="rounded-xl bg-page-background p-3 border border-border-subtle">
                <p className="text-[13px] font-bold text-primary">
                  {s.n}. {s.t}
                </p>
                <ul className="mt-1 space-y-0.5 text-[12px] text-text-secondary">
                  {(s.items || []).map((line, idx) => (
                    <li key={idx}>• {line}</li>
                  ))}
                </ul>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setFallbackSafetyPlanModal(null)}
              className="w-full py-2.5 rounded-full bg-primary text-white text-[13px] font-bold cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Inline Exercise Guide Modal */}
      {selectedGuide && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedGuide(null)}
        >
          <div
            className="bg-surface-card rounded-2xl max-w-[440px] w-full p-5 border border-border-subtle shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11.5px] font-semibold px-2 py-0.5 rounded-md bg-surface-mint text-primary">
                    {selectedGuide.category}
                  </span>
                  <span className="text-[11.5px] text-text-secondary">{selectedGuide.duration}</span>
                </div>
                <h3 className="text-[17px] font-bold text-text-primary">{selectedGuide.title}</h3>
              </div>
              <button
                onClick={() => setSelectedGuide(null)}
                aria-label="Đóng hướng dẫn"
                className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:bg-surface-mint cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <ol className="space-y-2.5">
              {selectedGuide.steps.map((step, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 bg-page-background p-3 rounded-xl border border-border-subtle"
                >
                  <span className="w-5 h-5 rounded-full bg-primary text-white text-[11.5px] font-bold flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                    {idx + 1}
                  </span>
                  <span className="text-[13px] text-text-primary leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>

            <button
              onClick={() => setSelectedGuide(null)}
              className="w-full py-2.5 rounded-xl bg-primary text-white text-[13px] font-semibold hover:bg-primary-container active:scale-95 transition-all cursor-pointer"
              type="button"
            >
              Đã hiểu, cảm ơn
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
