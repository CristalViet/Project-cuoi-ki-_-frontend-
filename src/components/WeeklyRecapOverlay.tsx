import React, { useState, useEffect, useRef } from 'react';

interface WeeklyRecapOverlayProps {
  isOpen: boolean;
  isShort?: boolean;
  onClose: () => void;
  onNavigateStats: () => void;
  onOpenCheckIn: () => void;
  onOpenJournal: () => void;
}

export const WeeklyRecapOverlay: React.FC<WeeklyRecapOverlayProps> = ({
  isOpen,
  isShort = false,
  onClose,
  onNavigateStats,
  onOpenCheckIn,
  onOpenJournal,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [isPaused, setIsPaused] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareNotice, setShareNotice] = useState<string | null>(null);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  const totalSlides = isShort ? 2 : 8;
  const progressTimerRef = useRef<number | null>(null);

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

  // Keyboard navigation: ArrowLeft, ArrowRight, Escape
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
        {/* Top Progress Bar: N segments, 3px, rounded, 4px gap, padding-top ~50px for mobile status bar */}
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
          <span className="text-[13px] font-semibold text-white/85">Nhìn lại tuần qua</span>
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
          {/* =================================================================
               8 SLIDES CHO BẢN ĐẦY ĐỦ
               ================================================================= */}
          {!isShort && (
            <>
              {/* Slide 0: Tuần của bạn */}
              {currentSlide === 0 && (
                <div className="absolute inset-0 flex flex-col justify-center bg-gradient-to-br from-[#1F5C43] to-[#123728] px-7 py-9 text-white">
                  <div className="pointer-events-none absolute -right-16 -top-16 h-[320px] w-[320px] rounded-full bg-radial from-white/20 to-transparent" />
                  <div className="pointer-events-none absolute -bottom-16 -left-16 h-[300px] w-[300px] rounded-full border-[1.5px] border-white/15" />
                  <div className="relative z-20">
                    <p className="text-[14px] font-semibold uppercase tracking-wider text-white/85">
                      ✦ MindCare · Nhìn lại
                    </p>
                    <h1 className="mt-3 text-[40px] font-extrabold leading-[1.15] tracking-tight">
                      Tuần của bạn
                    </h1>
                    <p className="mt-2 text-[17px] font-semibold text-white/95">2 – 8 tháng 11</p>
                    <p className="mt-3 text-[17px] leading-relaxed text-white/90">
                      Một vài điều nhỏ đáng nhớ, chỉ dành cho bạn.
                    </p>
                  </div>
                </div>
              )}

              {/* Slide 1: Bạn đã ghé lại (5/7 ngày) */}
              {currentSlide === 1 && (
                <div className="absolute inset-0 flex flex-col justify-center bg-gradient-to-br from-[#FAF7EE] to-[#DDEBCF] px-7 py-9 text-[#285C3D]">
                  <div className="pointer-events-none absolute -right-16 -top-16 h-[320px] w-[320px] rounded-full bg-radial from-[#1F5C43]/10 to-transparent" />
                  <div className="pointer-events-none absolute -bottom-16 -left-16 h-[300px] w-[300px] rounded-full border-[1.5px] border-[#1F5C43]/15" />
                  <div className="relative z-20">
                    <p className="text-[14px] font-semibold uppercase tracking-wider text-[#285C3D]/85">
                      Bạn đã ghé lại
                    </p>
                    <div className="my-3 flex items-baseline gap-2.5">
                      <span className="text-[104px] font-extrabold leading-none tracking-[-0.04em]">5</span>
                      <span className="text-[22px] font-semibold text-[#285C3D]/80">/ 7 ngày</span>
                    </div>
                    {/* 7 dots */}
                    <div className="my-5 flex justify-between gap-1.5">
                      {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day, idx) => {
                        const hasData = [0, 1, 2, 3, 5].includes(idx); // T2, T3, T4, T5, T7
                        return (
                          <div
                            key={day}
                            className={`flex h-[38px] w-[38px] items-center justify-center rounded-full text-[12.5px] font-bold ${
                              hasData
                                ? 'bg-[#1F5C43] text-white shadow-sm'
                                : 'border-[1.5px] border-dashed border-[#AC9583] text-[#A7683F]'
                            }`}
                          >
                            {day}
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-[17px] leading-relaxed text-[#285C3D]/90">
                      Mỗi lần quay lại đều giúp hành trình của bạn rõ hơn.
                    </p>
                  </div>
                </div>
              )}

              {/* Slide 2: Nhật ký (4 lần viết, 320 từ) */}
              {currentSlide === 2 && (
                <div className="absolute inset-0 flex flex-col justify-center bg-gradient-to-br from-[#285C3D] to-[#173B27] px-7 py-9 text-white">
                  <div className="pointer-events-none absolute -right-16 -top-16 h-[320px] w-[320px] rounded-full bg-radial from-white/20 to-transparent" />
                  <div className="pointer-events-none absolute -bottom-16 -left-16 h-[300px] w-[300px] rounded-full border-[1.5px] border-white/15" />
                  <div className="relative z-20">
                    <p className="text-[14px] font-semibold uppercase tracking-wider text-white/85">Nhật ký</p>
                    <div className="my-3 flex items-baseline gap-2.5">
                      <span className="text-[104px] font-extrabold leading-none tracking-[-0.04em]">4</span>
                      <span className="text-[22px] font-semibold text-white/85">lần viết</span>
                    </div>
                    <p className="text-[17px] leading-relaxed text-white/90">
                      Khoảng 320 từ bạn đã gửi gắm. Thứ Năm là ngày bạn viết nhiều nhất.
                    </p>

                    {/* Bar chart 7 days: [60,0,90,120,0,50,0] */}
                    <div className="relative mt-7 flex h-[120px] items-end justify-between gap-2 border-b border-white/20 pb-6">
                      {[
                        { day: 'T2', val: 60 },
                        { day: 'T3', val: 0 },
                        { day: 'T4', val: 90 },
                        { day: 'T5', val: 120, max: true },
                        { day: 'T6', val: 0 },
                        { day: 'T7', val: 50 },
                        { day: 'CN', val: 0 },
                      ].map((item) => (
                        <div key={item.day} className="relative flex h-full flex-1 flex-col items-center justify-end">
                          <div
                            className={`w-full max-w-[26px] rounded-t-md transition-all ${
                              item.max
                                ? 'bg-[#FFF0E1] shadow-[0_0_12px_rgba(255,240,225,0.45)]'
                                : 'bg-white opacity-35'
                            }`}
                            style={{ height: `${(item.val / 120) * 100}%` }}
                          />
                          <span className="absolute -bottom-5 text-[11px] font-semibold text-white/75">
                            {item.day}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Slide 3: Mood trung bình (🙂 Khá ổn, line chart break on null) */}
              {currentSlide === 3 && (
                <div className="absolute inset-0 flex flex-col justify-center bg-gradient-to-br from-[#FFF8EF] to-[#FFF0E1] px-7 py-9 text-[#285C3D]">
                  <div className="pointer-events-none absolute -right-16 -top-16 h-[320px] w-[320px] rounded-full bg-radial from-[#E78A45]/12 to-transparent" />
                  <div className="pointer-events-none absolute -bottom-16 -left-16 h-[300px] w-[300px] rounded-full border-[1.5px] border-[#A7683F]/15" />
                  <div className="relative z-20">
                    <p className="text-[14px] font-semibold uppercase tracking-wider text-[#A7683F]">
                      Mood trung bình
                    </p>
                    <div className="my-3 text-[54px] font-extrabold tracking-tight text-[#1F5C43]">🙂 Khá ổn</div>

                    {/* Biểu đồ đường cao 110px: [3,4,3,4,null,5,null], null ngắt đường */}
                    <svg className="my-2 h-[110px] w-full overflow-visible" viewBox="0 0 320 110" fill="none">
                      <line x1="10" y1="20" x2="310" y2="20" stroke="rgba(40,92,61,0.14)" strokeDasharray="3 3" />
                      <line x1="10" y1="60" x2="310" y2="60" stroke="rgba(40,92,61,0.14)" strokeDasharray="3 3" />
                      <line x1="10" y1="100" x2="310" y2="100" stroke="rgba(40,92,61,0.14)" strokeDasharray="3 3" />

                      {/* Line connected T2-T5: y values: 70, 50, 70, 50 */}
                      <path
                        d="M 25 70 L 75 50 L 125 70 L 175 50"
                        stroke="#1F5C43"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {/* Dots on valid points */}
                      <circle cx="25" cy="70" r="4.5" fill="#1F5C43" />
                      <circle cx="75" cy="50" r="4.5" fill="#1F5C43" />
                      <circle cx="125" cy="70" r="4.5" fill="#1F5C43" />
                      <circle cx="175" cy="50" r="4.5" fill="#1F5C43" />
                      {/* T7 dot at (275, 30) - isolated point */}
                      <circle cx="275" cy="30" r="6" fill="#E78A45" stroke="#FFFCF7" strokeWidth="2" />

                      <text x="25" y="108" fill="#285C3D" fontSize="10.5" fontWeight="600" textAnchor="middle">T2</text>
                      <text x="75" y="108" fill="#285C3D" fontSize="10.5" fontWeight="600" textAnchor="middle">T3</text>
                      <text x="125" y="108" fill="#285C3D" fontSize="10.5" fontWeight="600" textAnchor="middle">T4</text>
                      <text x="175" y="108" fill="#285C3D" fontSize="10.5" fontWeight="600" textAnchor="middle">T5</text>
                      <text x="225" y="108" fill="#AC9583" fontSize="10.5" fontWeight="600" textAnchor="middle">T6</text>
                      <text x="275" y="108" fill="#285C3D" fontSize="10.5" fontWeight="600" textAnchor="middle">T7</text>
                    </svg>

                    <p className="mt-3 text-[17px] leading-relaxed text-[#285C3D]/90">
                      Ngày nhẹ lòng nhất của bạn là Thứ Bảy 😊
                    </p>
                  </div>
                </div>
              )}

              {/* Slide 4: Stress tuần này (Thấp hơn chút, ↓ 0,4) */}
              {currentSlide === 4 && (
                <div className="absolute inset-0 flex flex-col justify-center bg-gradient-to-br from-[#1C352A] to-[#0D1E17] px-7 py-9 text-white">
                  <div className="pointer-events-none absolute -right-16 -top-16 h-[320px] w-[320px] rounded-full bg-radial from-white/15 to-transparent" />
                  <div className="pointer-events-none absolute -bottom-16 -left-16 h-[300px] w-[300px] rounded-full border-[1.5px] border-white/10" />
                  <div className="relative z-20">
                    <p className="text-[14px] font-semibold uppercase tracking-wider text-white/85">Stress tuần này</p>
                    <h2 className="mt-2 text-[30px] font-bold leading-tight">Thấp hơn tuần trước một chút</h2>
                    <div className="my-2 text-[54px] font-extrabold text-[#E78A45]">↓ 0,4</div>

                    {/* Line chart [4,3,3,2,null,2,null], null breaks line */}
                    <svg className="my-2 h-[100px] w-full overflow-visible" viewBox="0 0 320 100" fill="none">
                      <line x1="10" y1="20" x2="310" y2="20" stroke="rgba(255,255,255,0.12)" strokeDasharray="3 3" />
                      <line x1="10" y1="50" x2="310" y2="50" stroke="rgba(255,255,255,0.12)" strokeDasharray="3 3" />
                      <line x1="10" y1="80" x2="310" y2="80" stroke="rgba(255,255,255,0.12)" strokeDasharray="3 3" />

                      <path
                        d="M 25 30 L 75 48 L 125 48 L 175 66"
                        stroke="#DDEBCF"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="25" cy="30" r="4.5" fill="#DDEBCF" />
                      <circle cx="75" cy="48" r="4.5" fill="#DDEBCF" />
                      <circle cx="125" cy="48" r="4.5" fill="#DDEBCF" />
                      <circle cx="175" cy="66" r="4.5" fill="#DDEBCF" />
                      <circle cx="275" cy="66" r="5" fill="#E78A45" stroke="#1C352A" strokeWidth="2" />

                      <text x="25" y="96" fill="rgba(255,255,255,0.7)" fontSize="10.5" fontWeight="600" textAnchor="middle">T2</text>
                      <text x="75" y="96" fill="rgba(255,255,255,0.7)" fontSize="10.5" fontWeight="600" textAnchor="middle">T3</text>
                      <text x="125" y="96" fill="rgba(255,255,255,0.7)" fontSize="10.5" fontWeight="600" textAnchor="middle">T4</text>
                      <text x="175" y="96" fill="rgba(255,255,255,0.7)" fontSize="10.5" fontWeight="600" textAnchor="middle">T5</text>
                      <text x="225" y="96" fill="rgba(255,255,255,0.3)" fontSize="10.5" fontWeight="600" textAnchor="middle">T6</text>
                      <text x="275" y="96" fill="rgba(255,255,255,0.7)" fontSize="10.5" fontWeight="600" textAnchor="middle">T7</text>
                    </svg>

                    <p className="mt-3 text-[13px] leading-relaxed text-white/75">
                      Dựa trên 5/7 ngày có dữ liệu. Đây là số bạn tự báo cáo, không phải chẩn đoán.
                    </p>
                  </div>
                </div>
              )}

              {/* Slide 5: Điều giúp bạn dịu lại (Thở 4-6 thư giãn, 3 lần) */}
              {currentSlide === 5 && (
                <div className="absolute inset-0 flex flex-col justify-center bg-gradient-to-br from-[#1F5C43] to-[#2E7354] px-7 py-9 text-white">
                  <div className="pointer-events-none absolute -right-16 -top-16 h-[320px] w-[320px] rounded-full bg-radial from-white/20 to-transparent" />
                  <div className="pointer-events-none absolute -bottom-16 -left-16 h-[300px] w-[300px] rounded-full border-[1.5px] border-white/15" />
                  <div className="relative z-20">
                    <p className="text-[14px] font-semibold uppercase tracking-wider text-white/85">
                      Điều giúp bạn dịu lại
                    </p>
                    <h2 className="mt-2 text-[30px] font-bold">Thở 4-6 thư giãn</h2>
                    <div className="my-3 flex items-baseline gap-2.5">
                      <span className="text-[104px] font-extrabold leading-none tracking-[-0.04em]">3</span>
                      <span className="text-[22px] font-semibold text-white/85">lần</span>
                    </div>
                    <p className="text-[17px] leading-relaxed text-white/90">
                      Bạn đã dành 6 phút cho hơi thở tuần này. Một khoảng nghỉ nhỏ cũng là chuẩn bị cho mình.
                    </p>
                  </div>
                </div>
              )}

              {/* Slide 6: Khoảnh khắc bạn giữ lại (3 ảnh 3:4) */}
              {currentSlide === 6 && (
                <div className="absolute inset-0 flex flex-col justify-center bg-gradient-to-br from-[#FAF7EE] to-[#E7F1DF] px-7 py-9 text-[#285C3D]">
                  <div className="pointer-events-none absolute -right-16 -top-16 h-[320px] w-[320px] rounded-full bg-radial from-[#1F5C43]/10 to-transparent" />
                  <div className="pointer-events-none absolute -bottom-16 -left-16 h-[300px] w-[300px] rounded-full border-[1.5px] border-[#1F5C43]/15" />
                  <div className="relative z-20">
                    <p className="text-[14px] font-semibold uppercase tracking-wider text-[#285C3D]/85">
                      Khoảnh khắc bạn giữ lại
                    </p>
                    {/* 3 cards 3:4 with middle shifted down 22px */}
                    <div className="my-6 grid grid-cols-3 gap-2.5">
                      <div className="relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-[18px] bg-gradient-to-br from-[#285C3D] to-[#1F5C43] p-2.5 text-white shadow-md">
                        <span className="mb-auto text-[22px]">🌿</span>
                        <span className="text-[10.5px] font-bold uppercase tracking-wider">Tách trà ấm</span>
                      </div>
                      <div className="relative flex aspect-[3/4] translate-y-[22px] flex-col justify-end overflow-hidden rounded-[18px] bg-gradient-to-br from-[#E78A45] to-[#A7683F] p-2.5 text-white shadow-md">
                        <span className="mb-auto text-[22px]">☀️</span>
                        <span className="text-[10.5px] font-bold uppercase tracking-wider">Nắng sân trường</span>
                      </div>
                      <div className="relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-[18px] bg-gradient-to-br from-[#3C7452] to-[#1F5C43] p-2.5 text-white shadow-md">
                        <span className="mb-auto text-[22px]">📖</span>
                        <span className="text-[10.5px] font-bold uppercase tracking-wider">Góc thư viện</span>
                      </div>
                    </div>
                    <p className="mt-8 text-[17px] font-semibold leading-relaxed text-[#285C3D]">
                      Ba khoảnh khắc bạn yêu thích ♥ trong tuần.
                    </p>
                  </div>
                </div>
              )}

              {/* Slide 7: Cảm ơn & 3 nút xếp dọc */}
              {currentSlide === 7 && (
                <div className="absolute inset-0 flex flex-col justify-center bg-gradient-to-br from-[#1F5C43] to-[#123728] px-7 py-9 text-white">
                  <div className="pointer-events-none absolute -right-16 -top-16 h-[320px] w-[320px] rounded-full bg-radial from-white/20 to-transparent" />
                  <div className="pointer-events-none absolute -bottom-16 -left-16 h-[300px] w-[300px] rounded-full border-[1.5px] border-white/15" />
                  <div className="relative z-30">
                    <p className="text-[14px] font-semibold uppercase tracking-wider text-white/85">✦</p>
                    <h2 className="mt-2 text-[34px] font-extrabold leading-tight">
                      Cảm ơn bạn đã dành thời gian cho mình
                    </h2>
                    <p className="mt-3 text-[17px] leading-relaxed text-white/90">
                      Tuần sau, chỉ cần quay lại một chút là đủ.
                    </p>

                    {/* 3 buttons pill stack */}
                    {shareNotice && (
                      <div className="mt-5 rounded-xl bg-white/15 border border-white/25 px-3.5 py-2.5 text-[13px] font-medium text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        <span>{shareNotice}</span>
                      </div>
                    )}
                    <div className="mt-8 flex flex-col gap-2.5">
                      <button
                        onClick={() => {
                          onClose();
                          onNavigateStats();
                        }}
                        className="w-full rounded-full bg-[#FFFCF7] py-3.5 text-center text-[15px] font-bold text-[#1F5C43] shadow-lg transition active:scale-98"
                        type="button"
                      >
                        Xem tiến triển
                      </button>
                      <button
                        onClick={() => setShowShareModal(true)}
                        className="w-full rounded-full border-[1.5px] border-white bg-transparent py-3.5 text-center text-[15px] font-semibold text-white transition hover:bg-white/10 active:scale-98"
                        type="button"
                      >
                        Chia sẻ có chọn lọc
                      </button>
                      <button
                        onClick={onClose}
                        className="w-full rounded-full border-[1.5px] border-white/80 bg-transparent py-3.5 text-center text-[15px] font-semibold text-white transition hover:bg-white/10 active:scale-98"
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

          {/* =================================================================
               RECAP RÚT GỌN (2 SLIDES) CHO KHI < 3 NGÀY
               ================================================================= */}
          {isShort && (
            <>
              {currentSlide === 0 && (
                <div className="absolute inset-0 flex flex-col justify-center bg-gradient-to-br from-[#1F5C43] to-[#123728] px-7 py-9 text-white">
                  <div className="pointer-events-none absolute -right-16 -top-16 h-[320px] w-[320px] rounded-full bg-radial from-white/20 to-transparent" />
                  <div className="pointer-events-none absolute -bottom-16 -left-16 h-[300px] w-[300px] rounded-full border-[1.5px] border-white/15" />
                  <div className="relative z-20">
                    <p className="text-[14px] font-semibold uppercase tracking-wider text-white/85">
                      ✦ MindCare · Nhìn lại
                    </p>
                    <h2 className="mt-2 text-[38px] font-extrabold leading-tight">Tuần này mới bắt đầu</h2>
                    <p className="mt-3 text-[17px] text-white/90">Hiện có 2 ngày có dữ liệu.</p>

                    <div className="my-6 flex justify-between gap-1.5">
                      {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day, idx) => {
                        const hasData = idx < 2;
                        return (
                          <div
                            key={day}
                            className={`flex h-[38px] w-[38px] items-center justify-center rounded-full text-[12.5px] font-bold ${
                              hasData
                                ? 'bg-[#FFFCF7] text-[#1F5C43] shadow-sm'
                                : 'border-[1.5px] border-dashed border-white/40 text-white/60'
                            }`}
                          >
                            {day}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {currentSlide === 1 && (
                <div className="absolute inset-0 flex flex-col justify-center bg-gradient-to-br from-[#FAF7EE] to-[#DDEBCF] px-7 py-9 text-[#285C3D]">
                  <div className="pointer-events-none absolute -right-16 -top-16 h-[320px] w-[320px] rounded-full bg-radial from-[#1F5C43]/10 to-transparent" />
                  <div className="pointer-events-none absolute -bottom-16 -left-16 h-[300px] w-[300px] rounded-full border-[1.5px] border-[#1F5C43]/15" />
                  <div className="relative z-30">
                    <p className="text-[14px] font-semibold uppercase tracking-wider text-[#285C3D]/85">Gần rồi</p>
                    <h2 className="mt-2 text-[34px] font-extrabold leading-tight">Cần thêm vài ngày nữa</h2>
                    <p className="mt-3 text-[16.5px] leading-relaxed text-[#285C3D]/90">
                      Khi có ít nhất 3 ngày dữ liệu, mình sẽ gom lại thành một bản nhìn lại cho bạn. Bạn không cần làm tất cả mỗi ngày.
                    </p>

                    <div className="mt-8 flex flex-col gap-2.5">
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
          <div className="w-full max-w-[360px] rounded-[24px] bg-[#FFFCF7] p-5 text-[#285C3D] shadow-2xl border border-[#E7E8DE]">
            <h3 className="text-[18px] font-bold text-[#1F5C43]">Chia sẻ có chọn lọc</h3>
            <p className="mt-1 text-[12.5px] text-[#756455]">
              Chọn thông tin bạn muốn chia sẻ với người thân hoặc lưu kỷ niệm riêng:
            </p>

            <div className="my-3 space-y-2 border-y border-[#E7E8DE] py-3 text-[13.5px]">
              <label className="flex items-center gap-2.5">
                <input type="checkbox" defaultChecked className="accent-[#1F5C43]" />
                <span>Kỳ thống kê: Tuần 2 – 8 tháng 11</span>
              </label>
              <label className="flex items-center gap-2.5">
                <input type="checkbox" defaultChecked className="accent-[#1F5C43]" />
                <span>Số ngày ghé thăm (5/7 ngày)</span>
              </label>
              <label className="flex items-center gap-2.5">
                <input type="checkbox" defaultChecked className="accent-[#1F5C43]" />
                <span>Phút thở thư giãn (6 phút)</span>
              </label>
              <label className="flex items-center gap-2.5">
                <input type="checkbox" className="accent-[#1F5C43]" />
                <span>Biểu đồ tâm trạng &amp; stress</span>
              </label>
            </div>

            <p className="text-[11px] text-[#AC9583]">
              * Chia sẻ riêng tư, không đăng tải công khai lên mạng xã hội.
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
                onClick={() => {
                  setShareNotice('Đã tạo bản tóm tắt riêng tư để bạn chia sẻ.');
                  setShowShareModal(false);
                }}
                className="flex-1 rounded-full bg-[#1F5C43] py-2.5 text-[13px] font-bold text-white"
                type="button"
              >
                Gửi tin nhắn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
