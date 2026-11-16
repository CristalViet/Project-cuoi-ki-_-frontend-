import React, { useState } from 'react';
import { CheckIn, JournalEntry } from '../types';

interface SettingsScreenProps {
  checkIns: CheckIn[];
  journals: JournalEntry[];
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  checkIns,
  journals,
  onBack,
}) => {
  const [allowAiCheckinData, setAllowAiCheckinData] = useState(true);
  const [syncJournalContext, setSyncJournalContext] = useState(false);
  const [dailyReminder, setDailyReminder] = useState(true);
  const [lateNightSuggestion, setLateNightSuggestion] = useState(true);
  const [reminderTime, setReminderTime] = useState('21:00');
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [infoModal, setInfoModal] = useState<{
    title: string;
    body: string;
    tone?: 'normal' | 'danger';
  } | null>(null);
  const [showExportSuccess, setShowExportSuccess] = useState(false);

  const handleExportData = () => {
    const exportData = {
      user: {
        name: 'Minh Nguyễn',
        email: 'minhn@university.edu.vn',
        role: 'Sinh viên năm 3',
        exportedAt: new Date().toISOString(),
      },
      checkIns,
      journals,
      privacyCommitment: 'Dữ liệu được mã hóa cục bộ. Không chia sẻ cho bên thứ ba.',
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
      {/* Top Header compliant with Image 12 */}
      <header className="sticky top-0 z-40 bg-page-background/95 backdrop-blur-md pt-2 pb-2 flex items-center justify-between border-b border-border-subtle/40 md:mx-auto md:w-full md:max-w-5xl">
        <button
          onClick={onBack}
          aria-label="Quay lại"
          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-surface-mint text-text-primary active:scale-95 transition-all"
          type="button"
        >
          <span className="material-symbols-outlined text-[24px]">arrow_back</span>
        </button>
        <h1 className="text-[17px] font-semibold text-text-primary tracking-tight md:text-[20px]">
          Cài đặt &amp; Quyền riêng tư
        </h1>
        <div className="w-10 h-10 flex items-center justify-center">
          <span className="w-2.5 h-2.5 rounded-full bg-primary/20"></span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col gap-4 md:mx-auto md:w-full md:max-w-5xl lg:grid lg:grid-cols-12 lg:gap-6 lg:items-start">
        <div className="flex flex-col gap-4 lg:col-span-5">
        {/* User Profile Preview Card */}
        <section className="bg-surface-card rounded-2xl border border-border-subtle p-4 card-shadow relative overflow-hidden md:p-5">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-surface-mint/50 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center gap-3.5">
            <div className="relative shrink-0">
              {avatarFailed ? (
                <div className="w-14 h-14 rounded-full border-2 border-surface-mint bg-surface-mint text-primary font-bold text-lg flex items-center justify-center shadow-xs">
                  M
                </div>
              ) : (
                <img
                  alt="Ảnh hồ sơ cá nhân Minh Nguyễn"
                  className="w-14 h-14 rounded-full object-cover border-2 border-surface-mint shadow-xs"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuADeMzPdQQKO8j3fumAKOhJLlunAEUv5m1SZi82UjJLT4BiW7tnlnF2mmuVtXo0WvV25Bulzrq5aBCJUpvhDAPv5hUMtNN8AgDJ0t_53X--TE3byGP8ge3PCEd7YBJ9DXeNzjboamykWLpVTx_NOnmwPIoS0ac07KhSwu9cbAdUoeCZPy4z4p3QW_-ryW1ptuskF7QyRGiYVUntNNzeBgtobZC3yzEzMzyqFdx2ETZxt3LFL2hN21nL"
                  onError={() => setAvatarFailed(true)}
                />
              )}
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-primary border-2 border-surface-card rounded-full"></span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-[16px] font-semibold text-text-primary truncate">Minh Nguyễn</h2>
              <p className="text-[12px] text-text-secondary truncate mt-0.5">
                Sinh viên năm 3 • minhn@university.edu.vn
              </p>
              <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full bg-surface-mint text-text-primary text-[11px] font-medium">
                <span
                  className="material-symbols-outlined text-[12px] text-primary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified_user
                </span>
                Tài khoản đã bảo mật
              </span>
            </div>
          </div>
          <div className="mt-3.5 pt-3 border-t border-border-subtle flex justify-end">
            <button
              onClick={() =>
                setInfoModal({
                  title: 'Hồ sơ sinh viên',
                  body: 'Minh Nguyễn • Sinh viên năm 3, Khoa Công Nghệ, Đại học. Dữ liệu hồ sơ và ghi chép được bảo mật cục bộ trên thiết bị.',
                })
              }
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-secondary text-primary hover:bg-surface-mint text-[12px] font-semibold active:scale-95 transition-all"
              type="button"
            >
              <span>Chỉnh sửa hồ sơ</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </section>

        {/* Desktop Data Summary Card */}
        <section className="hidden lg:flex flex-col gap-3 bg-surface-card rounded-2xl border border-border-subtle p-5 card-shadow">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-bold text-primary flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">shield_lock</span>
              Kho dữ liệu cục bộ
            </h3>
            <span className="text-[11px] font-semibold text-secondary">Mã hóa trên trình duyệt</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-page-background border border-border-subtle p-3">
              <p className="text-[11px] text-text-secondary">Lượt check-in</p>
              <p className="text-[22px] font-bold text-primary tabular-nums mt-0.5">{checkIns.length}</p>
            </div>
            <div className="rounded-xl bg-page-background border border-border-subtle p-3">
              <p className="text-[11px] text-text-secondary">Trang nhật ký</p>
              <p className="text-[22px] font-bold text-primary tabular-nums mt-0.5">{journals.length}</p>
            </div>
          </div>
          <p className="text-[11.5px] leading-relaxed text-text-secondary">
            Toàn bộ lịch sử cảm xúc và bài viết của bạn được lưu trực tiếp trên thiết bị này, không tự động tải lên máy chủ ngoài.
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
            <span className="text-[11px] text-text-secondary bg-surface-mint px-2 py-0.5 rounded-full font-medium">
              Minh bạch 100%
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
                  Cá nhân hóa hội thoại dựa trên mức stress tự ghi nhận. Dữ liệu mã hóa trên thiết bị của bạn.
                </p>
                <div className="mt-2 inline-flex items-center gap-1 text-primary text-[11px] font-medium bg-surface-mint/80 px-2 py-0.5 rounded-lg">
                  <span className="material-symbols-outlined text-[14px]">psychology</span>
                  <span>
                    Hiện tại: {allowAiCheckinData ? 'Bật (Đang hỗ trợ)' : 'Tắt (Hoàn toàn ẩn)'}
                  </span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer mt-1 flex-shrink-0">
                <input
                  checked={allowAiCheckinData}
                  onChange={(e) => setAllowAiCheckinData(e.target.checked)}
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
                  Đồng bộ ngữ cảnh ghi chép nhật ký
                </p>
                <p className="text-[12px] text-text-secondary mt-1 leading-relaxed">
                  Cho phép AI tham chiếu các chủ đề bài viết gần đây. Tắt tính năng này để nhật ký luôn là không gian tuyệt
                  đối riêng tư.
                </p>
                <span className="inline-block mt-1 text-[11px] text-text-secondary">
                  Mặc định: Tắt
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer mt-1 flex-shrink-0">
                <input
                  checked={syncJournalContext}
                  onChange={(e) => setSyncJournalContext(e.target.checked)}
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
              className="flex items-center justify-between text-left py-1 hover:bg-surface-mint/40 -mx-1 px-1 rounded-xl transition-colors"
              type="button"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary text-[20px]">
                  download_for_offline
                </span>
                <div>
                  <p className="text-[14px] font-medium text-text-primary">Xuất toàn bộ dữ liệu cá nhân</p>
                  <p className="text-[11px] text-text-secondary">Định dạng mở JSON hoặc PDF hoàn chỉnh</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-text-secondary text-[20px]">chevron_right</span>
            </button>

            {showExportSuccess && (
              <div className="p-2 bg-surface-mint text-primary rounded-xl text-center text-[12px] font-semibold">
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
              className="flex items-center justify-between text-left py-1 hover:bg-error-container/40 -mx-1 px-1 rounded-xl transition-colors"
              type="button"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-error text-[20px]">delete_forever</span>
                <div>
                  <p className="text-[14px] font-medium text-error">Yêu cầu xóa tài khoản và dữ liệu vĩnh viễn</p>
                  <p className="text-[11px] text-error/80">Không thể phục hồi sau 14 ngày gửi yêu cầu</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-error text-[20px]">chevron_right</span>
            </button>
          </div>
        </section>

        {/* Section 2: Thông báo & Nhắc nhở */}
        <section className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 px-1">
            <span className="material-symbols-outlined text-primary text-[18px]">notifications_active</span>
            <h3 className="text-[12px] text-text-primary uppercase tracking-wider font-semibold">
              Thông báo &amp; Nhắc nhở
            </h3>
          </div>

          <div className="bg-surface-card rounded-2xl border border-border-subtle p-4 card-shadow flex flex-col gap-3.5">
            {/* Daily Check-in Notification */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-[14px] font-semibold text-text-primary leading-snug">
                  Nhắc nhở check-in mỗi ngày
                </p>
                <p className="text-[12px] text-text-secondary mt-1">
                  Gợi ý nhẹ nhàng dành ra 1 phút ghi nhận năng lượng.
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-page-background rounded-lg border border-border-subtle text-text-primary text-[12px]">
                  <span className="material-symbols-outlined text-[16px] text-primary">schedule</span>
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
                        className="rounded-md bg-primary px-2 py-0.5 text-[11px] font-bold text-white"
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
                        className="text-text-secondary text-[11px] ml-1 underline hover:text-primary"
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

            {/* Late Night Study Wind-down */}
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
                  body: 'MINDCARE tuân thủ cam kết bảo mật cục bộ, không bán hoặc chia sẻ dữ liệu check-in hay nhật ký cá nhân với bất kỳ bên thứ ba nào.',
                })
              }
              className="flex items-center justify-between py-2.5 text-left text-text-primary hover:text-primary transition-colors"
              type="button"
            >
              <span className="text-[14px] font-medium">Chính sách bảo mật &amp; Quyền riêng tư</span>
              <span className="material-symbols-outlined text-[18px] text-text-secondary">open_in_new</span>
            </button>

            <div className="flex items-center justify-between py-2.5">
              <div>
                <p className="text-[14px] font-medium text-text-primary">Về dự án MINDCARE</p>
                <p className="text-[11px] text-text-secondary">Phiên bản tốt nghiệp v2.4.0</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-surface-mint text-primary text-[11px] font-semibold">
                Ổn định
              </span>
            </div>
          </div>

          {/* Legal statement */}
          <div className="mt-1 bg-surface-mint/60 border border-secondary/20 rounded-2xl p-4 flex gap-3 items-start">
            <span
              className="material-symbols-outlined text-primary text-[20px] mt-0.5 flex-shrink-0"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              spa
            </span>
            <p className="text-[12px] text-text-primary leading-relaxed">
              <strong>MINDCARE</strong> là công cụ tự chăm sóc sức khỏe tinh thần, không phải dịch vụ y tế hay chẩn
              đoán lâm sàng. Nếu bạn đang trong tình trạng khẩn cấp hoặc chịu khủng hoảng tâm lý nặng, vui lòng liên hệ ngay
              với đường dây nóng hỗ trợ tâm lý <strong>1900 636 788</strong> hoặc đến cơ sở y tế gần nhất.
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
                className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary hover:bg-surface-mint"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <p className="text-[13px] leading-relaxed text-text-secondary">{infoModal.body}</p>
            <button
              onClick={() => setInfoModal(null)}
              className="w-full rounded-full bg-primary py-2.5 text-[13px] font-bold text-white active:scale-[0.98]"
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
