import React, { useState } from 'react';
import {
  MochiHappyCompanion,
  MochiLandingHero,
  MochiRestingCompanion,
  MochiThinkingCompanion,
} from './MochiIllustrations';

interface OnboardingScreenProps {
  onStart: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onStart }) => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      step: 'Bước 1/3',
      companion: <MochiHappyCompanion className="w-11 h-11" />,
      title: 'Lắng nghe cảm xúc hàng ngày',
      desc: 'Dành 1 phút check-in mức stress, tâm trạng và giấc ngủ mà không bị phán xét hay tạo áp lực.',
      badgeIcon: 'timer',
      badgeText: 'Nhanh chóng • Nhẹ nhàng',
    },
    {
      step: 'Bước 2/3',
      companion: <MochiThinkingCompanion className="w-11 h-11" />,
      title: 'Thấu hiểu xu hướng bản thân',
      desc: 'Nhận diện nhịp điệu sinh hoạt qua biểu đồ minh bạch và nhật ký bảo mật riêng tư tuyệt đối.',
      badgeIcon: 'lock',
      badgeText: 'Mã hóa AES-256-GCM',
    },
    {
      step: 'Bước 3/3',
      companion: <MochiRestingCompanion className="w-11 h-11" />,
      title: 'Đồng hành cùng AI & Người tin cậy',
      desc: 'Trợ lý Mochi lắng nghe ân cần; bạn hoàn toàn kiểm soát dữ liệu và lựa chọn kết nối khi thấy cần.',
      badgeIcon: 'verified_user',
      badgeText: 'Quyền riêng tư chủ động',
    },
  ];

  return (
    <div className="flex-1 flex flex-col bg-page-background text-text-primary min-h-screen relative pb-6 justify-between overflow-x-hidden md:py-6 md:px-8">
      {/* Atmosphere Gradients */}
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-surface-mint/40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-96 -left-20 w-56 h-56 bg-secondary-container/20 rounded-full blur-2xl pointer-events-none"></div>

      {/* Top Header */}
      <header className="relative z-10 w-full px-4 pt-3 pb-1 flex justify-between items-center h-12 md:mx-auto md:max-w-4xl md:px-0">
        <button
          aria-label="Đổi ngôn ngữ"
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-card border border-border-subtle card-shadow text-text-primary text-[12px] font-semibold hover:bg-surface-mint transition-colors active:scale-95 cursor-pointer"
          type="button"
        >
          <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
          <span>VI</span>
          <span className="material-symbols-outlined text-[16px] text-text-secondary">
            expand_more
          </span>
        </button>

        <button
          onClick={onStart}
          className="text-text-secondary hover:text-primary transition-colors text-[13px] font-medium flex items-center gap-0.5 px-2 py-1 rounded-lg active:scale-95 cursor-pointer"
          type="button"
        >
          <span>Bỏ qua</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        </button>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-4 pt-1 flex flex-col md:mx-auto md:w-full md:max-w-4xl md:px-0 md:justify-center">
        {/* Hero Section with Crisp Vector MochiLandingHero */}
        <section className="flex flex-col items-center text-center mt-1">
          <div
            className="relative w-full h-48 md:h-56 md:max-w-2xl rounded-3xl overflow-hidden card-shadow border border-[#CFE2CA] flex items-center justify-center p-3 mb-3"
            style={{
              background: 'linear-gradient(180deg, #FAF4E8 0%, #E7F1DF 100%)',
            }}
          >
            {/* Subtle Botanical Backdrop */}
            <svg
              className="pointer-events-none absolute inset-0 w-full h-full opacity-75"
              viewBox="0 0 600 240"
              fill="none"
              preserveAspectRatio="xMidYMid slice"
              aria-hidden="true"
            >
              <circle cx="510" cy="54" r="34" fill="#FEE8C2" opacity="0.85" />
              <ellipse cx="110" cy="60" rx="34" ry="14" fill="#FFFCF7" opacity="0.85" />
              <ellipse cx="136" cy="55" rx="24" ry="11" fill="#FFFCF7" opacity="0.85" />
              <path
                d="M0 190C110 158 230 176 340 184C450 192 530 162 600 174V240H0V190Z"
                fill="#D4E8C5"
              />
            </svg>

            <MochiLandingHero className="relative z-10 w-52 h-42 md:w-60 md:h-48" />

            <div className="absolute bottom-2.5 left-3 z-20 flex items-center gap-1.5 bg-surface-card/92 backdrop-blur-md px-2.5 py-1 rounded-full border border-border-subtle">
              <span
                className="material-symbols-outlined text-[14px] text-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                spa
              </span>
              <span className="text-[11.5px] text-text-secondary font-medium tracking-normal">
                Không gian an yên
              </span>
            </div>
          </div>

          {/* Wordmark & Campus Support Badge */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[26px] md:text-[32px] font-bold tracking-tight text-primary lowercase">
              mindcare
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-mint text-primary text-[11.5px] font-medium border border-secondary-container">
              <span className="material-symbols-outlined text-[13px]">school</span>
              Đồng hành cùng sinh viên
            </span>
          </div>

          <h1 className="text-[22px] md:text-[28px] font-bold text-text-primary mb-2 max-w-[320px] md:max-w-xl leading-tight">
            Chăm sóc tâm trí, từng ngày một.
          </h1>
          <p className="text-[14px] md:text-[15px] text-text-secondary leading-relaxed max-w-[330px] md:max-w-xl">
            Không gian an toàn, riêng tư giúp bạn lắng nghe cảm xúc, giảm căng thẳng học tập và kết nối khi cần thiết.
          </p>
        </section>

        {/* Carousel Milestone Steps Section */}
        <section aria-label="Các tính năng cốt lõi" className="mt-4 md:mt-7 w-full">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[12px] text-text-secondary uppercase tracking-wider font-semibold">
              Hành trình của bạn
            </span>
            <div className="flex items-center gap-1 md:hidden">
              {steps.map((_, idx) => (
                <span
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`cursor-pointer transition-all duration-300 rounded-full ${
                    activeStep === idx ? 'w-4 h-1.5 bg-primary' : 'w-1.5 h-1.5 bg-border-subtle'
                  }`}
                ></span>
              ))}
            </div>
          </div>

          {/* Horizontal Step Cards on Mobile, 3-col Grid on Desktop */}
          <div className="flex gap-3 overflow-x-auto no-scrollbar py-1 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible">
            {steps.map((stepItem, idx) => (
              <article
                key={stepItem.title}
                onClick={() => setActiveStep(idx)}
                className={`flex-shrink-0 w-[275px] md:w-auto bg-surface-card rounded-2xl border p-4 card-shadow flex flex-col justify-between transition-all cursor-pointer ${
                  activeStep === idx
                    ? 'border-primary ring-1 ring-primary/20'
                    : 'border-border-subtle opacity-95'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-surface-mint/80 border border-[#CFE2CA] flex items-center justify-center">
                      {stepItem.companion}
                    </div>
                    <span className="text-[11.5px] px-2.5 py-0.5 rounded-md bg-page-background text-text-secondary border border-border-subtle font-medium">
                      {stepItem.step}
                    </span>
                  </div>
                  <h2 className="text-[15px] font-semibold text-text-primary mb-1">
                    {stepItem.title}
                  </h2>
                  <p className="text-[13px] text-text-secondary leading-snug">{stepItem.desc}</p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-border-subtle/80 flex items-center gap-2 text-text-secondary text-[11.5px]">
                  <span className="material-symbols-outlined text-[16px] text-primary">
                    {stepItem.badgeIcon}
                  </span>
                  <span>{stepItem.badgeText}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Trust, Privacy & Disclaimer Stack */}
        <section className="mt-4 md:mt-6 grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-4">
          <div className="bg-surface-mint/70 border border-secondary-container/70 rounded-xl p-3 flex items-start gap-2.5 text-left">
            <span className="material-symbols-outlined text-[18px] text-primary mt-0.5 flex-shrink-0">
              shield
            </span>
            <div>
              <p className="text-[12.5px] font-semibold text-text-primary">
                Quyền riêng tư là ưu tiên số 1
              </p>
              <p className="text-[11.5px] text-text-secondary mt-0.5 leading-snug">
                Không có sự đồng thuận nào được bật sẵn. Bạn luôn nắm quyền chia sẻ hoặc xóa bỏ dữ liệu của mình.
              </p>
            </div>
          </div>

          <div className="bg-surface-card border border-border-subtle rounded-xl p-3 flex items-start gap-2 text-left">
            <span className="material-symbols-outlined text-[16px] text-text-secondary mt-0.5 flex-shrink-0">
              info
            </span>
            <p className="text-[11.5px] text-text-secondary leading-snug">
              <span className="font-semibold text-text-primary">Lưu ý y tế:</span> MINDCARE là công cụ hỗ trợ rèn luyện tinh thần, không thay thế chẩn đoán hay điều trị y tế chuyên nghiệp.
            </p>
          </div>
        </section>
      </div>

      {/* Docked Bottom Actions */}
      <footer className="relative z-10 w-full px-4 pt-2 pb-2 bg-gradient-to-t from-page-background via-page-background to-page-background/90 border-t border-border-subtle/40 flex flex-col gap-2.5 md:mx-auto md:max-w-xl md:flex-row md:border-t-0 md:bg-none md:pt-4">
        <button
          onClick={onStart}
          className="w-full h-12 rounded-xl bg-focus-ring text-white text-[15px] font-semibold flex items-center justify-center gap-2 shadow-sm hover:brightness-105 active:scale-[0.98] transition-all md:flex-1 cursor-pointer"
          type="button"
        >
          <span>Bắt đầu ngay</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>

        <button
          onClick={onStart}
          className="w-full h-11 md:h-12 rounded-xl bg-surface-card border border-primary text-primary text-[13px] font-semibold flex items-center justify-center gap-1.5 hover:bg-surface-mint transition-colors active:scale-[0.98] md:flex-1 cursor-pointer"
          type="button"
        >
          <span>Đã có tài khoản?</span>
          <span className="font-bold underline decoration-primary/40 underline-offset-4">
            Đăng nhập
          </span>
        </button>

        <div className="w-32 h-1 bg-outline-variant/50 rounded-full mx-auto mt-0.5 md:hidden"></div>
      </footer>
    </div>
  );
};
