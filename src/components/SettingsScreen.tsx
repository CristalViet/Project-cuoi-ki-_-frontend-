import React, { useEffect, useState } from 'react';
import {
  CheckIn,
  ConsentProfile,
  HealthStatusDTO,
  JournalEntry,
  RiskSnapshot,
} from '../types';
import { apiClient, DEFAULT_CONSENT_PROFILE } from '../services/apiClient';

interface SettingsScreenProps {
  checkIns: CheckIn[];
  journals: JournalEntry[];
  consentProfile?: ConsentProfile;
  riskSnapshot?: RiskSnapshot;
  healthStatus?: HealthStatusDTO | null;
  onHealthStatusUpdate?: (status: HealthStatusDTO) => void;
  onUpdateConsent?: (next: ConsentProfile) => void;
  onOpenCounselorTriage?: () => void;
  onOpenCrisisSafeMode?: () => void;
  onBack: () => void;
}

const REMINDER_PREFS_STORAGE_KEY = 'mindcare_reminder_prefs';

interface ReminderPrefs {
  dailyReminder: boolean;
  lateNightSuggestion: boolean;
  reminderTime: string;
}

function loadSavedReminderPrefs(): ReminderPrefs {
  try {
    const raw = localStorage.getItem(REMINDER_PREFS_STORAGE_KEY);
    if (!raw) {
      return {
        dailyReminder: true,
        lateNightSuggestion: true,
        reminderTime: '21:00',
      };
    }
    const parsed = JSON.parse(raw) as Partial<ReminderPrefs>;
    return {
      dailyReminder:
        typeof parsed.dailyReminder === 'boolean' ? parsed.dailyReminder : true,
      lateNightSuggestion:
        typeof parsed.lateNightSuggestion === 'boolean'
          ? parsed.lateNightSuggestion
          : true,
      reminderTime:
        typeof parsed.reminderTime === 'string' && parsed.reminderTime.trim()
          ? parsed.reminderTime
          : '21:00',
    };
  } catch {
    return {
      dailyReminder: true,
      lateNightSuggestion: true,
      reminderTime: '21:00',
    };
  }
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  checkIns,
  journals,
  consentProfile = DEFAULT_CONSENT_PROFILE,
  riskSnapshot,
  healthStatus,
  onHealthStatusUpdate,
  onUpdateConsent,
  onOpenCounselorTriage,
  onOpenCrisisSafeMode,
  onBack,
}) => {
  const initialPrefs = loadSavedReminderPrefs();
  const [dailyReminder, setDailyReminder] = useState<boolean>(initialPrefs.dailyReminder);
  const [lateNightSuggestion, setLateNightSuggestion] = useState<boolean>(
    initialPrefs.lateNightSuggestion
  );
  const [reminderTime, setReminderTime] = useState<string>(initialPrefs.reminderTime);
  const [isEditingTime, setIsEditingTime] = useState(false);

  const [localHealth, setLocalHealth] = useState<HealthStatusDTO | null>(
    healthStatus ?? null
  );
  const [isCheckingHealth, setIsCheckingHealth] = useState<boolean>(!healthStatus);

  const [infoModal, setInfoModal] = useState<{
    title: string;
    body: string;
    tone?: 'normal' | 'danger';
  } | null>(null);
  const [showExportSuccess, setShowExportSuccess] = useState(false);

  // Persist reminder preferences durably in localStorage
  useEffect(() => {
    try {
      const payload: ReminderPrefs = {
        dailyReminder,
        lateNightSuggestion,
        reminderTime,
      };
      localStorage.setItem(REMINDER_PREFS_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore storage quota errors
    }
  }, [dailyReminder, lateNightSuggestion, reminderTime]);

  // Sync or check Backend AI Safety Engine v2.0 health
  useEffect(() => {
    if (healthStatus) {
      setLocalHealth(healthStatus);
      setIsCheckingHealth(false);
      return;
    }
    let mounted = true;
    setIsCheckingHealth(true);
    apiClient
      .checkHealth()
      .then((status) => {
        if (mounted) setLocalHealth(status);
      })
      .finally(() => {
        if (mounted) setIsCheckingHealth(false);
      });
    return () => {
      mounted = false;
    };
  }, [healthStatus]);

  const effectiveHealth = localHealth ?? healthStatus ?? null;

  const refreshBackendHealth = async () => {
    setIsCheckingHealth(true);
    try {
      const latest = await apiClient.checkHealth();
      setLocalHealth(latest);
      onHealthStatusUpdate?.(latest);
    } finally {
      setIsCheckingHealth(false);
    }
  };

  const handleConsentToggle = (field: keyof ConsentProfile, value: boolean) => {
    onUpdateConsent?.({
      ...consentProfile,
      [field]: value,
    });
  };

  const handleExportData = () => {
    const exportData = {
      user: {
        name: 'Minh Nguyễn',
        email: 'minhn@university.edu.vn',
        role: 'Sinh viên năm 3',
        exportedAt: new Date().toISOString(),
      },
      consentProfile,
      reminderPreferences: {
        dailyReminder,
        lateNightSuggestion,
        reminderTime,
      },
      checkIns,
      journals,
      privacyCommitment:
        'Dữ liệu nhạy cảm được mã hóa cấp trường AES-256-GCM. Không chia sẻ cho bên thứ ba.',
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mindcare-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setShowExportSuccess(true);
    setTimeout(() => setShowExportSuccess(false), 3000);
  };

  return (
    <div className="flex-1 flex flex-col bg-page-background text-text-primary px-4 pt-1 pb-24 space-y-4 md:px-8 md:pb-12 md:pt-4">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-page-background/95 backdrop-blur-md pt-2 pb-2 flex items-center justify-between border-b border-border-subtle/40 md:mx-auto md:w-full md:max-w-5xl">
        <button
          onClick={onBack}
          aria-label="Quay lại"
          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-surface-mint text-text-primary active:scale-95 transition-all cursor-pointer"
          type="button"
        >
          <span className="material-symbols-outlined text-[24px]">arrow_back</span>
        </button>
        <h1 className="text-[17px] font-semibold text-text-primary tracking-tight md:text-[20px]">
          Cài đặt &amp; Quyền riêng tư
        </h1>
        <div className="w-10 h-10 flex items-center justify-center">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              effectiveHealth?.online ? 'bg-primary' : 'bg-secondary/70'
            }`}
          ></span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col gap-4 md:mx-auto md:w-full md:max-w-5xl lg:grid lg:grid-cols-12 lg:gap-6 lg:items-start">
        <div className="flex flex-col gap-4 lg:col-span-5">
          {/* User Profile Preview Card with Monogram + Sprout Vector Emblem */}
          <section className="bg-surface-card rounded-2xl border border-border-subtle p-4 card-shadow relative overflow-hidden md:p-5">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-surface-mint/50 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-center gap-3.5">
              {/* Monogram Avatar + Vector Sprout Medallion on #E7F1DF */}
              <div className="relative shrink-0" aria-label="Biểu tượng hồ sơ Minh Nguyễn">
                <div className="w-15 h-15 rounded-full bg-[#E7F1DF] border-2 border-[#1F5C43]/25 ring-4 ring-[#FAF7EE] flex items-center justify-center shadow-[0_4px_12px_rgba(31,92,67,0.10)] select-none">
                  <span className="text-[19px] font-extrabold tracking-tight text-[#1F5C43]">
                    MN
                  </span>
                </div>
                <span
                  title="Hạt mầm an yên MindCare"
                  className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-[#1F5C43] border-2 border-[#FFFCF7] flex items-center justify-center shadow-2xs"
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 20V11"
                      stroke="#E7F1DF"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                    />
                    <path
                      d="M12 12C12.5 6.8 17.2 4.5 20.5 6.5C20.5 11.2 16.4 13.2 12 12Z"
                      fill="#98D99C"
                    />
                    <path
                      d="M11.8 13C10.5 8.2 6.2 6.5 3.5 8.5C3.8 12.8 7.8 14.3 11.8 13Z"
                      fill="#DDEBCF"
                    />
                  </svg>
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-[16px] font-semibold text-text-primary truncate">
                  Minh Nguyễn
                </h2>
                <p className="text-[12px] text-text-secondary truncate mt-0.5">
                  Sinh viên năm 3 • minhn@university.edu.vn
                </p>
                <span className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full bg-[#E7F1DF] text-[#1F5C43] text-[11.5px] font-semibold">
                  <span
                    className="material-symbols-outlined text-[13px] text-[#1F5C43]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified_user
                  </span>
                  Mã hóa AES-256-GCM đang bật
                </span>
              </div>
            </div>
            <div className="mt-3.5 pt-3 border-t border-border-subtle flex justify-end">
              <button
                onClick={() =>
                  setInfoModal({
                    title: 'Hồ sơ sinh viên',
                    body: 'Minh Nguyễn • Sinh viên năm 3, Khoa Công Nghệ. Hồ sơ được phân tách danh tính ẩn danh (Pseudonymization) trên động cơ đánh giá an toàn.',
                  })
                }
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-secondary text-primary hover:bg-surface-mint text-[12px] font-semibold active:scale-95 transition-all cursor-pointer"
                type="button"
              >
                <span>Chỉnh sửa hồ sơ</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          </section>

          {/* Backend AI Safety Engine v2.0 Live Connection & Counselor Triage Card */}
          <section className="bg-surface-card rounded-2xl border border-border-subtle p-4 md:p-5 card-shadow space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[13.5px] font-bold text-primary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[19px]">health_and_safety</span>
                AI Safety Engine &amp; Điều Phối (v2.0)
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-surface-mint text-primary text-[11.5px] font-bold shrink-0">
                Tầng hiện tại: {riskSnapshot?.currentTier || 'L0'}
              </span>
            </div>

            {/* Live Backend Status Box */}
            <div
              className={`rounded-2xl border p-3.5 space-y-2 transition-colors ${
                effectiveHealth?.online
                  ? 'bg-[#E7F1DF]/65 border-[#C5DEC0]'
                  : 'bg-[#FFF8EF] border-[#EBD5B8]'
              }`}
            >
              {isCheckingHealth && !effectiveHealth ? (
                <div className="skeleton-warm animate-pulse h-11 rounded-xl bg-[#E7F1DF]" />
              ) : (
                <>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          effectiveHealth?.online
                            ? 'bg-[#1F5C43] animate-pulse'
                            : 'bg-[#E78A45]'
                        }`}
                      />
                      <span className="text-[12.5px] font-bold text-[#1F5C43] truncate">
                        {effectiveHealth?.online
                          ? 'Đang kết nối Django API v2.0'
                          : 'Chế độ dự phòng ngoại tuyến PWA'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={refreshBackendHealth}
                      disabled={isCheckingHealth}
                      aria-label="Kiểm tra lại kết nối Backend"
                      className="text-[11.5px] font-semibold text-[#1F5C43] hover:underline flex items-center gap-0.5 shrink-0 cursor-pointer disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[14px]">refresh</span>
                      <span>{isCheckingHealth ? 'Đang đo...' : 'Kiểm tra'}</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {effectiveHealth?.online ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/90 border border-[#C5DEC0] px-2.5 py-0.5 text-[11.5px] font-semibold text-[#1F5C43]">
                        <span className="material-symbols-outlined text-[14px]">
                          auto_awesome
                        </span>
                        <span>
                          {effectiveHealth.geminiConfigured
                            ? 'Gemini 2.5 Flash Ready'
                            : `Safety Engine Ready (${effectiveHealth.model || 'Rule+Hybrid'})`}
                        </span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/90 border border-[#EBD5B8] px-2.5 py-0.5 text-[11.5px] font-semibold text-[#A7683F]">
                        <span className="material-symbols-outlined text-[14px]">shield</span>
                        <span>Chế độ dự phòng ngoại tuyến PWA · Bảo vệ C-SSRS cục bộ</span>
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>

            <p className="text-[12px] leading-relaxed text-text-secondary">
              Dành cho Hội đồng bảo vệ đồ án kiểm tra trực tiếp bảng điều phối Chuyên gia Tham vấn (SBAR, XAI Attribution, Break-Glass &amp; SHA-256 Audit) và Phao Sơ cứu WHO PFA.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {onOpenCounselorTriage && (
                <button
                  type="button"
                  onClick={onOpenCounselorTriage}
                  className="py-2.5 px-3 rounded-xl bg-primary text-white text-[12px] font-bold flex items-center justify-center gap-1.5 shadow-2xs hover:brightness-105 active:scale-95 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px]">clinical_notes</span>
                  <span>Mở Bảng Chuyên Gia</span>
                </button>
              )}
              {onOpenCrisisSafeMode && (
                <button
                  type="button"
                  onClick={onOpenCrisisSafeMode}
                  className="py-2.5 px-3 rounded-xl border border-border-subtle bg-page-background hover:bg-surface-mint text-primary text-[12px] font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px]">spa</span>
                  <span>Xem Phao An Toàn</span>
                </button>
              )}
            </div>
          </section>

          {/* Desktop Data Summary Card */}
          <section className="hidden lg:flex flex-col gap-3 bg-surface-card rounded-2xl border border-border-subtle p-5 card-shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-[13px] font-bold text-primary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">shield_lock</span>
                Kho dữ liệu bảo mật
              </h3>
              <span className="text-[11.5px] font-semibold text-secondary">AES-256-GCM + Local</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-page-background border border-border-subtle p-3">
                <p className="text-[11.5px] text-text-secondary">Lượt check-in</p>
                <p className="text-[22px] font-bold text-primary tabular-nums mt-0.5">
                  {checkIns.length}
                </p>
              </div>
              <div className="rounded-xl bg-page-background border border-border-subtle p-3">
                <p className="text-[11.5px] text-text-secondary">Trang nhật ký</p>
                <p className="text-[22px] font-bold text-primary tabular-nums mt-0.5">
                  {journals.length}
                </p>
              </div>
            </div>
            <p className="text-[11.5px] leading-relaxed text-text-secondary">
              Nội dung nhật ký được mã hóa cấp trường và hoàn toàn không bao giờ chia sẻ ra ngoài.
            </p>
          </section>
        </div>

        <div className="flex flex-col gap-4 lg:col-span-7">
          {/* Section 1: Quản lý quyền riêng tư & Dữ liệu AI */}
          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[18px]">lock</span>
                <h3 className="text-[12px] text-text-primary uppercase tracking-wider font-semibold">
                  Quyền riêng tư &amp; Dữ liệu AI
                </h3>
              </div>
              <span className="text-[11.5px] text-text-secondary bg-surface-mint px-2.5 py-0.5 rounded-full font-medium">
                Đồng bộ thời gian thực
              </span>
            </div>

            <div className="bg-surface-card rounded-2xl border border-border-subtle p-4 card-shadow flex flex-col gap-3.5">
              {/* AI Check-in Data Usage Toggle */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-text-primary leading-snug">
                    Cho phép AI MindCare sử dụng dữ liệu Check-in
                  </p>
                  <p className="text-[12px] text-text-secondary mt-1 leading-relaxed">
                    Cá nhân hóa hội thoại của Mochi dựa trên mức tâm trạng, stress và thời lượng ngủ bạn tự ghi nhận.
                  </p>
                  <div className="mt-2 inline-flex items-center gap-1 text-primary text-[11.5px] font-medium bg-surface-mint/80 px-2 py-0.5 rounded-lg">
                    <span className="material-symbols-outlined text-[14px]">psychology</span>
                    <span>
                      Hiện tại:{' '}
                      {consentProfile.allowAiCheckinPersonalize
                        ? 'Bật (Đang cá nhân hóa)'
                        : 'Tắt (Không truyền sang Mochi)'}
                    </span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer mt-1 flex-shrink-0">
                  <input
                    checked={consentProfile.allowAiCheckinPersonalize}
                    onChange={(e) =>
                      handleConsentToggle('allowAiCheckinPersonalize', e.target.checked)
                    }
                    className="sr-only peer"
                    type="checkbox"
                  />
                  <div className="w-12 h-7 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-card after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                </label>
              </div>

              <div className="h-[1px] bg-border-subtle"></div>

              {/* Diary Sync Context Toggle */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-text-primary leading-snug">
                    Đồng bộ ngữ cảnh ghi chép nhật ký cho AI
                  </p>
                  <p className="text-[12px] text-text-secondary mt-1 leading-relaxed">
                    Cho phép AI tham chiếu chủ đề nhật ký gần đây. Tắt tính năng này để nhật ký luôn tách biệt tuyệt đối.
                  </p>
                  <span className="inline-block mt-1 text-[11.5px] text-text-secondary">
                    Mặc định: Tắt
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer mt-1 flex-shrink-0">
                  <input
                    checked={consentProfile.allowAiJournalContext}
                    onChange={(e) =>
                      handleConsentToggle('allowAiJournalContext', e.target.checked)
                    }
                    className="sr-only peer"
                    type="checkbox"
                  />
                  <div className="w-12 h-7 bg-outline-variant/60 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-card after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                </label>
              </div>

              <div className="h-[1px] bg-border-subtle"></div>

              {/* Auto Crisis Warm SOS Consent Toggle */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-text-primary leading-snug">
                    Cho phép tự động gửi SOS ấm áp tới Người tin cậy ở mức nguy kịch L4
                  </p>
                  <p className="text-[12px] text-text-secondary mt-1 leading-relaxed">
                    Chỉ gửi thông báo nhờ hỏi thăm nhẹ nhàng khi chạm mức nguy kịch L4 — không bao giờ đính kèm nhật ký hay hội thoại.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer mt-1 flex-shrink-0">
                  <input
                    checked={consentProfile.allowAutoCrisisSos}
                    onChange={(e) =>
                      handleConsentToggle('allowAutoCrisisSos', e.target.checked)
                    }
                    className="sr-only peer"
                    type="checkbox"
                  />
                  <div className="w-12 h-7 bg-outline-variant/60 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-card after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                </label>
              </div>

              <div className="h-[1px] bg-border-subtle"></div>

              {/* Export Data Action */}
              <button
                onClick={handleExportData}
                className="flex items-center justify-between text-left py-1 hover:bg-surface-mint/40 -mx-1 px-1 rounded-xl transition-colors cursor-pointer"
                type="button"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary text-[20px]">
                    download_for_offline
                  </span>
                  <div>
                    <p className="text-[14px] font-medium text-text-primary">
                      Xuất toàn bộ dữ liệu cá nhân
                    </p>
                    <p className="text-[11.5px] text-text-secondary">
                      Định dạng mở JSON hoàn chỉnh kèm cấu hình quyền riêng tư
                    </p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-text-secondary text-[20px]">
                  chevron_right
                </span>
              </button>

              {showExportSuccess && (
                <div className="p-2.5 bg-surface-mint text-primary rounded-xl text-center text-[12px] font-semibold">
                  Đã tải xuống tệp dữ liệu cá nhân JSON an toàn!
                </div>
              )}

              <div className="h-[1px] bg-border-subtle"></div>

              {/* Delete Account Danger Action */}
              <button
                onClick={() =>
                  setInfoModal({
                    title: 'Yêu cầu xóa tài khoản',
                    body: 'MINDCARE sẽ giữ dữ liệu trong 14 ngày để bạn có thể khôi phục nếu muốn, sau đó xóa vĩnh viễn và không thể phục hồi.',
                    tone: 'danger',
                  })
                }
                className="flex items-center justify-between text-left py-1 hover:bg-error-container/40 -mx-1 px-1 rounded-xl transition-colors cursor-pointer"
                type="button"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-error text-[20px]">
                    delete_forever
                  </span>
                  <div>
                    <p className="text-[14px] font-medium text-error">
                      Yêu cầu xóa tài khoản và dữ liệu vĩnh viễn
                    </p>
                    <p className="text-[11.5px] text-error/80">
                      Không thể phục hồi sau 14 ngày gửi yêu cầu
                    </p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-error text-[20px]">
                  chevron_right
                </span>
              </button>
            </div>
          </section>

          {/* Section 2: Thông báo & Nhắc nhở */}
          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[18px]">
                  notifications_active
                </span>
                <h3 className="text-[12px] text-text-primary uppercase tracking-wider font-semibold">
                  Thông báo &amp; Nhắc nhở
                </h3>
              </div>
              <span className="text-[11.5px] text-text-secondary">Đã lưu tự động</span>
            </div>

            <div className="bg-surface-card rounded-2xl border border-border-subtle p-4 card-shadow flex flex-col gap-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-text-primary leading-snug">
                    Nhắc nhở check-in mỗi ngày
                  </p>
                  <p className="text-[12px] text-text-secondary mt-1">
                    Gợi ý nhẹ nhàng dành ra 1 phút ghi nhận năng lượng.
                  </p>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-page-background rounded-lg border border-border-subtle text-text-primary text-[12px]">
                    <span className="material-symbols-outlined text-[16px] text-primary">
                      schedule
                    </span>
                    {isEditingTime ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="time"
                          value={reminderTime}
                          onChange={(e) => setReminderTime(e.target.value)}
                          aria-label="Chọn giờ nhắc nhở"
                          className="rounded border border-border-subtle bg-white px-1.5 py-0.5 text-[12px] font-semibold outline-none focus:border-primary"
                        />
                        <button
                          onClick={() => setIsEditingTime(false)}
                          className="rounded-md bg-primary px-2.5 py-0.5 text-[11.5px] font-bold text-white cursor-pointer"
                          type="button"
                        >
                          Xong
                        </button>
                      </div>
                    ) : (
                      <>
                        <span>
                          Thời gian: <strong className="tabular-nums">{reminderTime}</strong>
                        </span>
                        <button
                          onClick={() => setIsEditingTime(true)}
                          className="text-text-secondary text-[11.5px] ml-1 underline hover:text-primary cursor-pointer"
                          type="button"
                        >
                          Thay đổi
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer mt-1 flex-shrink-0">
                  <input
                    checked={dailyReminder}
                    onChange={(e) => setDailyReminder(e.target.checked)}
                    className="sr-only peer"
                    type="checkbox"
                  />
                  <div className="w-12 h-7 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-card after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                </label>
              </div>

              <div className="h-[1px] bg-border-subtle"></div>

              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-text-primary leading-snug">
                    Gợi ý bài tập thư giãn khi học bài khuya
                  </p>
                  <p className="text-[12px] text-text-secondary mt-1 leading-relaxed">
                    Kỹ thuật thở 4-7-8 và giãn cơ nhẹ khi sử dụng ứng dụng sau 23:00.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer mt-1 flex-shrink-0">
                  <input
                    checked={lateNightSuggestion}
                    onChange={(e) => setLateNightSuggestion(e.target.checked)}
                    className="sr-only peer"
                    type="checkbox"
                  />
                  <div className="w-12 h-7 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-card after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                </label>
              </div>
            </div>
          </section>

          {/* Section 3: Ứng dụng & Pháp lý minh bạch */}
          <section className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5 px-1">
              <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
              <h3 className="text-[12px] text-text-primary uppercase tracking-wider font-semibold">
                Ứng dụng &amp; Pháp lý minh bạch
              </h3>
            </div>

            <div className="bg-surface-card rounded-2xl border border-border-subtle p-4 card-shadow flex flex-col divide-y divide-border-subtle">
              <div className="flex items-center justify-between py-2">
                <span className="text-[14px] font-medium text-text-primary">Ngôn ngữ</span>
                <div className="flex items-center gap-1 text-[13px] text-text-secondary font-medium">
                  <span>Tiếng Việt</span>
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </div>
              </div>

              <button
                onClick={() =>
                  setInfoModal({
                    title: 'Chính sách bảo mật & Quyền riêng tư',
                    body: 'MINDCARE mã hóa cấp trường AES-256-GCM cho nội dung nhạy cảm, áp dụng sổ cái kiểm toán bất biến SHA-256 cho quy trình an toàn, và cam kết không bao giờ bán hay chia sẻ nhật ký cá nhân với bên thứ ba.',
                  })
                }
                className="flex items-center justify-between py-2.5 text-left text-text-primary hover:text-primary transition-colors cursor-pointer"
                type="button"
              >
                <span className="text-[14px] font-medium">
                  Chính sách bảo mật &amp; Quyền riêng tư
                </span>
                <span className="material-symbols-outlined text-[18px] text-text-secondary">
                  open_in_new
                </span>
              </button>

              <div className="flex items-center justify-between py-2.5 gap-2">
                <div>
                  <p className="text-[14px] font-medium text-text-primary">Về dự án MINDCARE</p>
                  <p className="text-[11.5px] text-text-secondary">
                    AI Safety Engine v{effectiveHealth?.version || '2.0'} •{' '}
                    {effectiveHealth?.online
                      ? effectiveHealth.geminiConfigured
                        ? 'Gemini 2.5 Flash Ready'
                        : 'Django API Online'
                      : 'Chế độ dự phòng ngoại tuyến PWA'}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11.5px] font-semibold shrink-0 ${
                    effectiveHealth?.online
                      ? 'bg-surface-mint text-primary'
                      : 'bg-[#FFF0E1] text-[#A7683F]'
                  }`}
                >
                  {effectiveHealth?.online ? 'Trực tuyến' : 'Ngoại tuyến PWA'}
                </span>
              </div>
            </div>

            {/* Unified Vietnam Emergency Hotlines Legal Statement */}
            <div className="mt-1 bg-surface-mint/60 border border-secondary/20 rounded-2xl p-4 flex gap-3 items-start">
              <span
                className="material-symbols-outlined text-primary text-[20px] mt-0.5 flex-shrink-0"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                spa
              </span>
              <p className="text-[12px] text-text-primary leading-relaxed">
                <strong>MINDCARE</strong> là công cụ tự chăm sóc sức khỏe tinh thần, không phải dịch vụ y tế hay chẩn đoán lâm sàng. Nếu bạn đang trong tình trạng khẩn cấp hoặc chịu khủng hoảng tâm lý nặng, vui lòng liên hệ ngay Cấp cứu Y tế <strong>115</strong>, Tổng đài Quốc gia <strong>111</strong>, Đường dây nóng Ngày Mai <strong>096 306 1414</strong> hoặc Hỗ trợ Tâm lý <strong>1900 1267</strong>.
              </p>
            </div>
          </section>
        </div>
      </div>

      {infoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-xs">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-[24px] border border-border-subtle bg-surface-card p-5 shadow-2xl space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3
                className={`text-[16px] font-bold ${
                  infoModal.tone === 'danger' ? 'text-error' : 'text-primary'
                }`}
              >
                {infoModal.title}
              </h3>
              <button
                onClick={() => setInfoModal(null)}
                aria-label="Đóng"
                className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary hover:bg-surface-mint cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <p className="text-[13px] leading-relaxed text-text-secondary">{infoModal.body}</p>
            <button
              onClick={() => setInfoModal(null)}
              className="w-full rounded-full bg-primary py-2.5 text-[13px] font-bold text-white active:scale-[0.98] cursor-pointer"
              type="button"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
