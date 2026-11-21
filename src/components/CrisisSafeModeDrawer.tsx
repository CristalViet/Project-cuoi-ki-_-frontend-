import React, { useEffect, useState } from 'react';
import {
  ConsentProfile,
  RiskSnapshot,
  SafetyPlanData,
  TrustedContact,
  WarmSosResult,
} from '../types';
import { apiClient, DEFAULT_SAFETY_PLAN } from '../services/apiClient';
import { MochiRestingCompanion } from './MochiIllustrations';

interface CrisisSafeModeDrawerProps {
  isOpen: boolean;
  riskSnapshot: RiskSnapshot;
  contacts: TrustedContact[];
  consentProfile: ConsentProfile;
  onClose: () => void;
  onOpenBreathing: () => void;
  onOpenSafetyPlanEditor: () => void;
}

const VIETNAM_HOTLINES = [
  {
    number: '115',
    tel: 'tel:115',
    label: 'Cấp cứu Y tế',
    sub: 'Hỗ trợ y tế khẩn cấp 24/7',
    icon: 'emergency',
    accent: 'bg-[#FFF0E6] border-[#F0C9B2] text-[#9E472A]',
  },
  {
    number: '111',
    tel: 'tel:111',
    label: 'Tổng đài Quốc gia',
    sub: 'Bảo vệ & Hỗ trợ khẩn cấp miễn phí',
    icon: 'shield_with_heart',
    accent: 'bg-[#E7F1DF] border-[#C6DEC0] text-[#1F5C43]',
  },
  {
    number: '096 306 1414',
    tel: 'tel:0963061414',
    label: 'Đường dây nóng Ngày Mai',
    sub: 'Sơ cứu tâm lý cộng đồng miễn phí',
    icon: 'volunteer_activism',
    accent: 'bg-[#FFF8EF] border-[#EAD5BC] text-[#8B572A]',
  },
  {
    number: '1900 1267',
    tel: 'tel:19001267',
    label: 'Hỗ trợ Tâm lý',
    sub: 'Tư vấn sức khỏe tâm thần chuyên sâu',
    icon: 'support_agent',
    accent: 'bg-[#EEF6F0] border-[#CEE2D3] text-[#1F5C43]',
  },
];

const STANLEY_BROWN_STEPS: {
  step: number;
  key: keyof Omit<SafetyPlanData, 'updatedAt'>;
  title: string;
  icon: string;
  fallback: string[];
}[] = [
  {
    step: 1,
    key: 'warningSigns',
    title: 'Dấu hiệu cảnh báo sớm cần nhận diện',
    icon: 'notifications_active',
    fallback: DEFAULT_SAFETY_PLAN.warningSigns,
  },
  {
    step: 2,
    key: 'internalCoping',
    title: 'Chiến lược tự làm dịu tại chỗ',
    icon: 'self_improvement',
    fallback: DEFAULT_SAFETY_PLAN.internalCoping,
  },
  {
    step: 3,
    key: 'safePlacesAndDistractions',
    title: 'Không gian & hoạt động sao nhãng an toàn',
    icon: 'park',
    fallback: DEFAULT_SAFETY_PLAN.safePlacesAndDistractions,
  },
  {
    step: 4,
    key: 'trustedPeople',
    title: 'Người thân / bạn bè có thể liên hệ ngay',
    icon: 'group',
    fallback: DEFAULT_SAFETY_PLAN.trustedPeople,
  },
  {
    step: 5,
    key: 'professionalContacts',
    title: 'Chuyên gia & Đường dây hỗ trợ khẩn cấp',
    icon: 'local_hospital',
    fallback: DEFAULT_SAFETY_PLAN.professionalContacts,
  },
  {
    step: 6,
    key: 'safeEnvironmentSteps',
    title: 'Giữ môi trường xung quanh an toàn',
    icon: 'verified_user',
    fallback: DEFAULT_SAFETY_PLAN.safeEnvironmentSteps,
  },
];

export const CrisisSafeModeDrawer: React.FC<CrisisSafeModeDrawerProps> = ({
  isOpen,
  riskSnapshot,
  contacts,
  consentProfile,
  onClose,
  onOpenBreathing,
  onOpenSafetyPlanEditor,
}) => {
  const [safetyPlan, setSafetyPlan] = useState<SafetyPlanData>(DEFAULT_SAFETY_PLAN);
  const [showSafetyPlan, setShowSafetyPlan] = useState(true);
  const [showSosPreview, setShowSosPreview] = useState(false);
  const [isSendingSos, setIsSendingSos] = useState(false);
  const [sosResult, setSosResult] = useState<WarmSosResult | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    apiClient.getSafetyPlan().then((plan) => {
      if (active) setSafetyPlan(plan);
    });
    return () => {
      active = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isCriticalL4 = riskSnapshot.currentTier === 'L4';

  const handleDispatchWarmSos = async () => {
    setIsSendingSos(true);
    try {
      const result = await apiClient.triggerWarmSos({
        triggerSource: 'MANUAL_USER',
        coarseLocation: consentProfile.shareCoarseLocationOnSos
          ? 'Khu vực trường đại học / Ký túc xá (bán kính sơ lược)'
          : undefined,
      });
      setSosResult(result);
    } finally {
      setIsSendingSos(false);
    }
  };

  const sampleGuide = sosResult?.communicationGuide ?? {
    dos: [
      'Lắng nghe nhẹ nhàng, hiện diện ấm áp: "Mình đang ở đây với bạn rồi"',
      'Hỏi xem bạn ấy muốn trò chuyện hay chỉ cần có người ngồi cạnh',
      'Khuyến khích uống một ngụm nước ấm và hít thở chậm cùng nhau',
    ],
    donts: [
      'Không phán xét hay nói "Có gì đâu mà phải suy nghĩ nhiều"',
      'Không tra hỏi dồn dập hoặc ép phải giải thích ngay lập tức',
      'Không để người đang quá tải nặng ở một mình khi mất an toàn',
    ],
  };

  const resolveStepItems = (
    stepDef: (typeof STANLEY_BROWN_STEPS)[number]
  ): string[] => {
    const rawItems = safetyPlan[stepDef.key];
    if (Array.isArray(rawItems) && rawItems.length > 0) {
      return rawItems;
    }
    if (stepDef.key === 'trustedPeople' && contacts.length > 0) {
      return contacts.map((c) => `${c.name} (${c.relationship}) — ${c.phone}`);
    }
    return stepDef.fallback;
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end md:items-center justify-center bg-[#173E30]/45 backdrop-blur-xs p-0 md:p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Không gian Sơ cứu Tâm lý An toàn MindCare"
    >
      <div className="w-full max-w-[440px] md:max-w-[580px] max-h-[94dvh] overflow-y-auto rounded-t-[32px] md:rounded-[32px] bg-[#FAF7EE] border border-[#DCE5D5] shadow-[0_24px_64px_rgba(23,62,48,0.28)] text-[#285C3D] flex flex-col">
        {/* Sticky Calm Header */}
        <header className="sticky top-0 z-10 bg-[#FAF7EE]/95 backdrop-blur-md px-5 pt-4 pb-3 border-b border-[#E7E8DE] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#E7F1DF] border border-[#C7DEC0] flex items-center justify-center text-[#1F5C43] shadow-2xs">
              <span
                className="material-symbols-outlined text-[22px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                spa
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[16px] font-bold text-[#1F5C43] tracking-tight">
                  Phao An Toàn &amp; Điểm Tựa Khẩn Cấp
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#FFF0E1] text-[#A7683F] border border-[#F0D5BC]">
                  WHO PFA
                </span>
              </div>
              <p className="text-[12px] text-[#756455]">
                {isCriticalL4
                  ? 'Chế độ bảo vệ ưu tiên đang bật — Bạn không phải đi qua lúc này một mình'
                  : 'Không gian lắng dịu và kết nối hỗ trợ tức thời dành cho bạn'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            aria-label="Thu gọn bảng hỗ trợ an toàn"
            className="w-9 h-9 rounded-full bg-white border border-[#E7E8DE] flex items-center justify-center text-[#756455] hover:bg-[#E7F1DF] hover:text-[#1F5C43] active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[19px]">close</span>
          </button>
        </header>

        <div className="p-5 space-y-4">
          {/* 1. Mochi Warm Reassurance Card */}
          <section className="rounded-[24px] bg-[#FFFCF7] border border-[#DCE8D5] p-4 shadow-[0_4px_16px_rgba(31,92,67,0.06)] flex items-start gap-3.5">
            <div className="relative w-14 h-14 rounded-2xl bg-[#E7F1DF]/70 border border-[#C6DEC0] flex items-center justify-center shrink-0 mt-0.5">
              <MochiRestingCompanion className="w-12 h-12" />
            </div>
            <div className="space-y-1.5">
              <p className="text-[14px] font-bold text-[#1F5C43]">
                Mochi đang ở ngay đây cùng bạn 🌿
              </p>
              <p className="text-[13px] leading-relaxed text-[#4F5D53]">
                Cảm giác đau đớn hay quá tải lúc này là thật, nhưng bạn không cần phải tự gánh vác một mình. Hãy đặt hai bàn chân chạm sàn, thả lỏng vai một chút và chọn một điểm tựa gần nhất bên dưới nhé.
              </p>
            </div>
          </section>

          {/* 2. One-Tap Synchronized Vietnam Emergency & Crisis Hotlines */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between px-0.5">
              <h3 className="text-[13.5px] font-bold text-[#1F5C43] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">call</span>
                Gọi hỗ trợ trực tiếp 1-chạm (Việt Nam)
              </h3>
              <span className="text-[11.5px] font-medium text-[#756455]">Hoàn toàn bảo mật</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {VIETNAM_HOTLINES.map((item) => (
                <a
                  key={item.number}
                  href={item.tel}
                  className={`rounded-2xl border p-3.5 flex items-center justify-between gap-2 transition-all active:scale-[0.98] hover:brightness-98 shadow-2xs ${item.accent}`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[17px] shrink-0">
                        {item.icon}
                      </span>
                      <span className="text-[12px] font-bold truncate">{item.label}</span>
                    </div>
                    <p className="text-[17px] font-black tracking-tight mt-0.5 tabular-nums">
                      {item.number}
                    </p>
                    <p className="text-[11.5px] opacity-85 leading-snug mt-0.5">{item.sub}</p>
                  </div>
                  <span className="w-9 h-9 rounded-full bg-white/85 flex items-center justify-center shrink-0 shadow-2xs">
                    <span className="material-symbols-outlined text-[19px]">phone_in_talk</span>
                  </span>
                </a>
              ))}
            </div>
          </section>

          {/* 3. Immediate Calming Actions: 4-7-8 Breathing + Personal Safety Plan Toggle */}
          <section className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenBreathing();
              }}
              className="rounded-2xl bg-[#1F5C43] hover:bg-[#184935] text-white p-3.5 text-left flex flex-col justify-between min-h-[96px] shadow-[0_6px_18px_rgba(31,92,67,0.18)] active:scale-[0.98] transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <span className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[19px]">air</span>
                </span>
                <span className="text-[11.5px] font-semibold bg-white/15 px-2 py-0.5 rounded-full">
                  2 phút
                </span>
              </div>
              <div className="mt-2">
                <p className="text-[13.5px] font-bold leading-tight">Hít thở chậm 4-7-8</p>
                <p className="text-[11.5px] text-white/80 mt-0.5">Làm dịu nhịp tim ngay</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setShowSafetyPlan((prev) => !prev)}
              aria-expanded={showSafetyPlan}
              className={`rounded-2xl border text-[#1F5C43] p-3.5 text-left flex flex-col justify-between min-h-[96px] shadow-2xs active:scale-[0.98] transition-all cursor-pointer ${
                showSafetyPlan
                  ? 'bg-[#E7F1DF]/75 border-[#1F5C43]/35'
                  : 'bg-[#FFFCF7] hover:bg-[#E7F1DF]/60 border-[#D4E2CE]'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="w-8 h-8 rounded-xl bg-[#E7F1DF] flex items-center justify-center text-[#1F5C43]">
                  <span className="material-symbols-outlined text-[19px]">fact_check</span>
                </span>
                <span className="material-symbols-outlined text-[18px] text-[#756455]">
                  {showSafetyPlan ? 'expand_less' : 'expand_more'}
                </span>
              </div>
              <div className="mt-2">
                <p className="text-[13.5px] font-bold leading-tight">Kế hoạch an toàn</p>
                <p className="text-[11.5px] text-[#756455] mt-0.5">
                  {showSafetyPlan ? 'Đang mở đủ 6 bước (1..6)' : 'Bấm mở đủ 6 bước cá nhân'}
                </p>
              </div>
            </button>
          </section>

          {/* Full 6-Step Stanley-Brown Safety Plan Viewer */}
          {showSafetyPlan && (
            <section
              aria-label="Kế hoạch an toàn 6 bước Stanley-Brown"
              className="rounded-[24px] bg-[#FFFCF7] border border-[#DCE6D6] p-4 space-y-3 animate-fade-in shadow-[0_4px_16px_rgba(31,92,67,0.05)]"
            >
              <div className="flex items-center justify-between gap-2 pb-1 border-b border-[#E7E8DE]">
                <div>
                  <h4 className="text-[14px] font-bold text-[#1F5C43] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[19px]">health_and_safety</span>
                    Kế hoạch An toàn 6 bước Stanley-Brown
                  </h4>
                  <p className="text-[11.5px] text-[#756455] mt-0.5">
                    Đi từng bước từ 1 đến 6 theo nhịp của bạn ngay trong khoảnh khắc quá tải
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenSafetyPlanEditor();
                  }}
                  className="shrink-0 px-3 py-1.5 rounded-full bg-[#E7F1DF] text-[12px] font-bold text-[#1F5C43] hover:brightness-95 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[15px]">edit</span>
                  <span>Chỉnh sửa</span>
                </button>
              </div>

              <ol className="space-y-2.5">
                {STANLEY_BROWN_STEPS.map((stepItem) => {
                  const lines = resolveStepItems(stepItem);
                  return (
                    <li
                      key={stepItem.key}
                      className="rounded-2xl bg-[#FAF7EE] p-3 border border-[#E7E8DE] flex items-start gap-3"
                    >
                      <span className="w-6 h-6 rounded-full bg-[#1F5C43] text-white font-bold text-[12px] flex items-center justify-center shrink-0 mt-0.5 tabular-nums shadow-2xs">
                        {stepItem.step}
                      </span>
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-[#1F5C43]">
                            {stepItem.icon}
                          </span>
                          <p className="text-[13px] font-bold text-[#1F5C43] leading-snug">
                            {stepItem.step}. {stepItem.title}
                          </p>
                        </div>
                        <ul className="space-y-1 text-[12.5px] text-[#4E5E52] leading-relaxed">
                          {lines.map((line, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-[#E78A45] font-bold mt-0.5">•</span>
                              <span>{line}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          )}

          {/* 4. Warm SOS to Trusted Contacts + Strict Privacy Guarantee */}
          <section className="rounded-[24px] bg-[#FFF8EF] border border-[#EBD8C0] p-4 space-y-3">
            <div className="flex items-start gap-2.5">
              <span
                className="material-symbols-outlined text-[20px] text-[#1F5C43] mt-0.5 shrink-0"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                lock
              </span>
              <div>
                <h3 className="text-[14px] font-bold text-[#1F5C43]">
                  Gửi tín hiệu SOS ấm áp tới Người tin cậy
                </h3>
                <p className="text-[11.5px] font-semibold text-[#1F5C43] bg-[#E7F1DF] inline-block px-2.5 py-0.5 rounded-full mt-1">
                  Cam kết: Không bao giờ đính kèm nhật ký hay nội dung trò chuyện
                </p>
                <p className="text-[12.5px] text-[#756455] mt-1.5 leading-relaxed">
                  Gửi lời nhắn nhẹ nhàng tới{' '}
                  <strong className="text-[#285C3D]">
                    {contacts.length > 0
                      ? contacts.map((c) => c.name).join(', ')
                      : 'người hỗ trợ tin cậy'}
                  </strong>{' '}
                  kèm cẩm nang giao tiếp thấu cảm để họ biết cách ở bên bạn đúng cách.
                </p>
              </div>
            </div>

            {/* Preview Toggle */}
            <button
              type="button"
              onClick={() => setShowSosPreview((prev) => !prev)}
              className="w-full flex items-center justify-between text-[12px] font-bold text-[#A7683F] hover:text-[#1F5C43] pt-1 border-t border-[#EBD8C0]/70 cursor-pointer"
            >
              <span>Xem trước lời nhắn &amp; Cẩm nang 3 điều nên / không nên nói</span>
              <span className="material-symbols-outlined text-[18px]">
                {showSosPreview ? 'expand_less' : 'expand_more'}
              </span>
            </button>

            {(showSosPreview || sosResult) && (
              <div className="space-y-2.5 pt-1 text-[12px] animate-fade-in">
                <div className="rounded-xl bg-white p-3 border border-[#E7E8DE] italic text-[#4F5D53] leading-relaxed">
                  “
                  {sosResult?.warmMessagePreview ||
                    'Chào bạn, mình đang trải qua một khoảnh khắc hơi quá tải và cảm thấy an tâm khi liên hệ với bạn. Khi thuận tiện, bạn có thể gọi hoặc nhắn tin dịu dàng cho mình nhé.'}
                  ”
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="rounded-xl bg-[#E7F1DF]/75 border border-[#C9DFC2] p-2.5">
                    <p className="font-bold text-[#1F5C43] text-[12px] mb-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px]">check_circle</span>
                      3 điều NÊN nói
                    </p>
                    <ul className="space-y-1 text-[11.5px] text-[#285C3D]">
                      {sampleGuide.dos.slice(0, 3).map((d, idx) => (
                        <li key={idx} className="leading-snug">
                          • {d}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl bg-[#FFF0E6]/80 border border-[#EED0BE] p-2.5">
                    <p className="font-bold text-[#9E472A] text-[12px] mb-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px]">
                        do_not_disturb_on
                      </span>
                      3 điều KHÔNG NÊN nói
                    </p>
                    <ul className="space-y-1 text-[11.5px] text-[#7A3E29]">
                      {sampleGuide.donts.slice(0, 3).map((d, idx) => (
                        <li key={idx} className="leading-snug">
                          • {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {sosResult ? (
              <div className="rounded-2xl bg-[#E7F1DF] border border-[#1F5C43]/30 p-3.5 flex items-start gap-2.5 text-[#1F5C43]">
                <span
                  className="material-symbols-outlined text-[20px] mt-0.5 shrink-0"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified
                </span>
                <div className="text-[12.5px] leading-snug">
                  <p className="font-bold">
                    Đã gửi tín hiệu SOS ấm áp tới {sosResult.recipientsCount} người hỗ trợ tin cậy!
                  </p>
                  <p className="text-[11.5px] mt-0.5 opacity-90">
                    Xác thực bảo mật: Nhật ký &amp; hội thoại riêng tư hoàn toàn được khóa kín (100% không đính kèm).
                  </p>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleDispatchWarmSos}
                disabled={isSendingSos}
                className="w-full min-h-[48px] rounded-full bg-[#E78A45] hover:brightness-105 active:scale-[0.98] text-white font-bold text-[14px] flex items-center justify-center gap-2 shadow-[0_6px_18px_rgba(231,138,69,0.28)] transition-all disabled:opacity-60 cursor-pointer"
              >
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  favorite
                </span>
                <span>
                  {isSendingSos
                    ? 'Đang gửi tín hiệu ấm áp...'
                    : 'Gửi tín hiệu SOS ấm áp cho Người tin cậy'}
                </span>
              </button>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
