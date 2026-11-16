import React, { useState } from 'react';
import { TrustedContact } from '../types';

interface TrustedContactsScreenProps {
  contacts: TrustedContact[];
  onOpenAddContact: () => void;
  onBack: () => void;
}

export const TrustedContactsScreen: React.FC<TrustedContactsScreenProps> = ({
  contacts,
  onOpenAddContact,
  onBack,
}) => {
  const [sosFeatureEnabled, setSosFeatureEnabled] = useState(false);
  const [showSosModal, setShowSosModal] = useState(false);
  const [sosSent, setSosSent] = useState(false);
  const [showSampleMessage, setShowSampleMessage] = useState(false);
  const [infoModal, setInfoModal] = useState<{ title: string; body: string } | null>(null);
  const [statusToast, setStatusToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setStatusToast(msg);
    window.setTimeout(() => {
      setStatusToast((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const handleSosTrigger = () => {
    setShowSosModal(true);
  };

  const confirmSosSend = () => {
    setSosSent(true);
    setShowSosModal(false);
    setTimeout(() => {
      setSosSent(false);
    }, 4000);
  };

  return (
    <div className="flex-1 flex flex-col bg-page-background text-text-primary px-4 md:px-8 pt-1 pb-24 md:pb-12 space-y-4">
      {/* Top App Bar compliant with Image 14 */}
      <header className="sticky top-0 z-40 bg-page-background/95 backdrop-blur-md pt-2 pb-2 md:pt-4 flex items-center justify-between border-b border-border-subtle/40 md:max-w-5xl md:mx-auto md:w-full">
        <button
          onClick={onBack}
          aria-label="Quay lại"
          className="w-10 h-10 rounded-full flex items-center justify-center text-text-primary hover:bg-surface-mint active:scale-95 transition-all"
          type="button"
        >
          <span className="material-symbols-outlined text-[24px]">arrow_back</span>
        </button>
        <div className="text-center">
          <h1 className="text-[17px] md:text-[20px] font-semibold text-text-primary tracking-tight">Người hỗ trợ tin cậy</h1>
          <p className="text-[11px] md:text-[12px] text-text-secondary">Quyền riêng tư &amp; Kế hoạch an toàn</p>
        </div>
        <button
          onClick={() =>
            setInfoModal({
              title: 'Thông tin minh bạch',
              body: 'MINDCARE không bao giờ đọc danh bạ hay gửi thông tin khi bạn chưa chủ động cho phép. Nhật ký và hội thoại AI luôn nằm riêng tư trên thiết bị của bạn.',
            })
          }
          aria-label="Thông tin minh bạch"
          className="w-10 h-10 rounded-full flex items-center justify-center text-text-secondary hover:bg-surface-mint active:scale-95 transition-all"
          type="button"
        >
          <span className="material-symbols-outlined text-[22px]">info</span>
        </button>
      </header>

      {/* Main Content */}
      <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-6 lg:items-start md:max-w-5xl md:mx-auto md:w-full">
        <div className="space-y-4 lg:col-span-7">
        {/* Safety & Privacy Reassurance Banner */}
        <section className="bg-surface-mint/70 border border-border-subtle rounded-2xl p-3.5 flex gap-3 items-start card-shadow">
          <div className="w-9 h-9 rounded-xl bg-surface-card flex-shrink-0 flex items-center justify-center text-primary mt-0.5 shadow-2xs">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              shield
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-[12px] text-primary font-semibold tracking-wide">
              Quyền làm chủ dữ liệu của bạn
            </span>
            <p className="text-[13px] text-text-primary leading-snug">
              Khi bạn cần trợ giúp, bạn hoàn toàn làm chủ việc chia sẻ.{' '}
              <span className="font-semibold text-primary">
                MINDCARE không tự động gửi nhật ký hoặc hội thoại cho bất kỳ ai.
              </span>
            </p>
          </div>
        </section>

        {/* Section 1: Danh sách người hỗ trợ (Trusted Contacts) */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">group</span>
              <h2 className="text-[16px] font-semibold text-text-primary">
                Người hỗ trợ đã chọn ({contacts.length})
              </h2>
            </div>
            <span className="text-[11px] text-text-secondary bg-surface-container-high px-2 py-0.5 rounded-full font-medium">
              Tối đa 3 người
            </span>
          </div>

          <div className="space-y-2.5 md:space-y-0 md:grid md:grid-cols-2 md:gap-3">
            {contacts.map((contact) => (
              <article
                key={contact.id}
                className="bg-surface-card border border-border-subtle rounded-2xl p-4 card-shadow space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-secondary-container/50 text-secondary flex items-center justify-center font-bold text-base border border-border-subtle">
                      {contact.avatarLetter}
                    </div>
                    <div>
                      <h3 className="text-[15px] font-semibold text-text-primary">{contact.name}</h3>
                      <p className="text-[12px] text-text-secondary">{contact.phone}</p>
                    </div>
                  </div>
                  {contact.status === 'confirmed' ? (
                    <span className="inline-flex items-center gap-1 text-[12px] bg-surface-mint text-primary font-semibold px-2.5 py-1 rounded-full border border-primary/10">
                      <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        check_circle
                      </span>
                      Đã xác nhận
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[12px] bg-surface-container-high text-text-secondary px-2.5 py-1 rounded-full border border-border-subtle">
                      <span className="material-symbols-outlined text-[14px]">hourglass_top</span>
                      Chờ xác nhận
                    </span>
                  )}
                </div>

                {/* Permission Scope Note */}
                <div className="bg-page-background rounded-xl p-2.5 border border-border-subtle flex items-start gap-2">
                  <span className="material-symbols-outlined text-text-secondary text-[16px] mt-0.5">lock_clock</span>
                  <p className="text-[11px] text-text-secondary leading-tight">
                    <span className="font-semibold text-text-primary">Quyền hạn:</span> {contact.permissionScope}
                  </p>
                </div>

                <div className="flex justify-end pt-0.5">
                  {contact.status === 'confirmed' ? (
                    <button
                      onClick={() =>
                        setInfoModal({
                          title: `Quyền riêng tư · ${contact.name}`,
                          body: `${contact.permissionScope} Nhật ký cá nhân và hội thoại với Mochi luôn được khóa bảo vệ hoàn toàn.`,
                        })
                      }
                      className="text-primary hover:text-focus-ring text-[12px] font-semibold flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:bg-surface-mint/60 transition-colors"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px]">tune</span>
                      Tùy chỉnh quyền
                    </button>
                  ) : (
                    <button
                      onClick={() => showToast(`Đã gửi lại lời mời SMS an toàn đến ${contact.phone}.`)}
                      className="text-secondary text-[12px] font-medium flex items-center gap-1 py-1 px-3 rounded-lg border border-border-subtle hover:bg-surface-mint transition-colors active:scale-95"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px]">send</span>
                      Gửi lại lời mời
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>

          {/* Add Contact Action */}
          <div className="pt-1">
            <button
              onClick={onOpenAddContact}
              className="w-full bg-surface-card hover:bg-surface-mint/50 border border-dashed border-primary/40 rounded-2xl p-3.5 flex flex-col items-center justify-center gap-1 active:scale-[0.99] transition-all group"
              type="button"
            >
              <div className="flex items-center gap-2 text-primary text-[15px] font-semibold group-hover:text-focus-ring">
                <span className="material-symbols-outlined text-[20px]">person_add</span>
                + Thêm người liên hệ tin cậy
              </div>
              <span className="text-[11px] text-text-secondary text-center px-4 leading-normal">
                Nhập tay số điện thoại - Không tự động đồng bộ danh bạ để tôn trọng quyền riêng tư của bạn
              </span>
            </button>
          </div>
        </section>
        </div>

        <div className="space-y-4 lg:col-span-5">
        {/* Section 2: Quyền & Phạm vi chia sẻ */}
        <section className="bg-surface-card border border-border-subtle rounded-2xl p-4 card-shadow space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-0.5 pr-2">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[18px]">toggle_on</span>
                <h3 className="text-[15px] font-semibold text-text-primary">
                  Bật tính năng yêu cầu trợ giúp khi cần
                </h3>
              </div>
              <p className="text-[11px] text-text-secondary leading-snug">
                Mặc định tắt. Chỉ gửi thông điệp ấm áp báo rằng bạn đang cần trò chuyện, kèm vị trí sơ lược (nếu bạn bật).
              </p>
            </div>

            {/* Semantic Toggle */}
            <button
              onClick={() => setSosFeatureEnabled(!sosFeatureEnabled)}
              aria-checked={sosFeatureEnabled}
              className={`w-12 h-7 rounded-full relative flex items-center p-1 transition-colors duration-200 focus:outline-none ${
                sosFeatureEnabled ? 'bg-primary' : 'bg-surface-variant'
              }`}
              role="switch"
              type="button"
            >
              <span
                className={`w-5 h-5 bg-surface-card rounded-full shadow-sm transform transition-transform duration-200 ${
                  sosFeatureEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              ></span>
            </button>
          </div>

          <div className="pt-2 border-t border-border-subtle/70">
            <button
              onClick={() => setShowSampleMessage(!showSampleMessage)}
              className="w-full flex items-center justify-between text-left text-[12px] font-medium text-primary select-none"
              type="button"
            >
              <span>Xem mẫu nội dung tin nhắn sẽ gửi</span>
              <span
                className={`material-symbols-outlined text-[18px] transition-transform ${
                  showSampleMessage ? 'rotate-180' : ''
                }`}
              >
                expand_more
              </span>
            </button>
            {showSampleMessage && (
              <div className="mt-2.5 p-3 rounded-xl bg-page-background border border-border-subtle text-[12px] text-text-secondary italic leading-relaxed">
                "Chào bạn, mình đang trải qua một khoảnh khắc hơi quá tải và cảm thấy an tâm khi liên hệ với bạn. Khi rảnh, bạn có thể gọi lại hoặc nhắn cho mình nhé."
              </div>
            )}
          </div>
        </section>

        {/* Section 3: Kế hoạch an toàn cá nhân */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">spa</span>
              <h2 className="text-[16px] font-semibold text-text-primary">Kế hoạch an toàn cá nhân</h2>
            </div>
            <button
              onClick={() =>
                setInfoModal({
                  title: 'Kế hoạch an toàn cá nhân',
                  body: 'Bạn có thể tùy chỉnh các bước xoa dịu nhanh và danh sách người liên hệ trong kế hoạch an toàn bất kỳ lúc nào.',
                })
              }
              className="text-[12px] text-primary font-semibold hover:underline"
              type="button"
            >
              Chỉnh sửa
            </button>
          </div>

          <div className="bg-surface-card border border-border-subtle rounded-2xl p-4 card-shadow space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[12px] bg-surface-mint text-primary font-semibold px-2 py-0.5 rounded-md">
                Khi tôi cảm thấy quá tải hoặc kiệt sức:
              </span>
            </div>

            <div className="space-y-2.5 pt-1">
              <div className="flex items-start gap-3 bg-page-background p-2.5 rounded-xl border border-border-subtle">
                <span className="w-6 h-6 rounded-full bg-primary text-white font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <p className="text-[14px] font-semibold text-text-primary">Ngồi yên và thở đều 5 phút</p>
                  <p className="text-[11px] text-text-secondary mt-0.5">
                    Uống một ngụm nước ấm, đặt tay lên ngực để cảm nhận nhịp tim.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-page-background p-2.5 rounded-xl border border-border-subtle">
                <span className="w-6 h-6 rounded-full bg-primary text-white font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <p className="text-[14px] font-semibold text-text-primary">Gọi cho người tin cậy</p>
                  <p className="text-[11px] text-text-secondary mt-0.5">
                    Mẹ hoặc Hoàng Nam để có một giọng nói thân quen bên cạnh.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SOS Action Button */}
        <section className="space-y-2 pt-1">
          {sosSent ? (
            <div className="p-3 bg-surface-mint border border-primary text-primary rounded-xl text-center text-[13px] font-semibold flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              Đã kích hoạt tin nhắn ấm áp tới người hỗ trợ tin cậy!
            </div>
          ) : (
            <button
              onClick={handleSosTrigger}
              className="w-full bg-primary hover:bg-focus-ring text-white font-semibold text-[16px] py-3.5 px-4 rounded-xl shadow-xs flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all"
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                sos
              </span>
              <span>Yêu cầu hỗ trợ từ người thân</span>
            </button>
          )}

          <div className="flex items-center justify-center gap-1.5 text-text-secondary">
            <span className="material-symbols-outlined text-[16px] text-tertiary">lock_reset</span>
            <span className="text-[11px] text-center">Chưa gửi yêu cầu — Cần bạn xác nhận trước khi gửi</span>
          </div>
        </section>

        {/* Emergency Assistance Card */}
        <aside className="bg-surface-card border border-border-subtle rounded-2xl p-4 card-shadow space-y-3">
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-tertiary text-[22px] flex-shrink-0 mt-0.5">
              local_hospital
            </span>
            <div className="space-y-1">
              <h4 className="text-[15px] font-semibold text-text-primary">Đường dây hỗ trợ khẩn cấp</h4>
              <p className="text-[11px] text-text-secondary leading-relaxed">
                Nếu bạn đang trong tình trạng khủng hoảng hoặc cần can thiệp y tế ngay lập tức, hãy liên hệ trực tiếp:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <a
              className="bg-page-background border border-border-subtle hover:border-primary/40 rounded-xl p-2.5 text-center flex flex-col items-center justify-center transition-colors"
              href="tel:115"
            >
              <span className="text-[11px] text-text-secondary">Tổng đài y tế</span>
              <span className="text-[16px] text-primary font-bold">115</span>
            </a>
            <a
              className="bg-page-background border border-border-subtle hover:border-primary/40 rounded-xl p-2.5 text-center flex flex-col items-center justify-center transition-colors"
              href="tel:19001267"
            >
              <span className="text-[11px] text-text-secondary">Đường dây nóng tâm lý</span>
              <span className="text-[16px] text-primary font-bold">1900 1267</span>
            </a>
          </div>

          <p className="text-[10px] text-text-secondary text-center italic pt-1">
            * MINDCARE là người bạn đồng hành chăm sóc tinh thần, không thực hiện giám sát y tế 24/7.
          </p>
        </aside>
        </div>
      </div>

      {/* Status Toast */}
      {statusToast && (
        <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-primary text-white text-[13px] font-medium px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 max-w-[90vw]">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>{statusToast}</span>
        </div>
      )}

      {/* Info / Permission Modal */}
      {infoModal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setInfoModal(null)}
        >
          <div
            className="bg-surface-card rounded-2xl max-w-[400px] w-full p-5 border border-border-subtle shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-text-primary">{infoModal.title}</h3>
              <button
                onClick={() => setInfoModal(null)}
                aria-label="Đóng"
                className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:bg-surface-mint"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <p className="text-[13px] text-text-secondary leading-relaxed">{infoModal.body}</p>
            <button
              onClick={() => setInfoModal(null)}
              className="w-full py-2.5 rounded-xl bg-primary text-white text-[13px] font-semibold hover:bg-primary-container active:scale-95 transition-all"
              type="button"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* SOS Confirmation Modal */}
      {showSosModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-card rounded-2xl max-w-[360px] w-full p-5 border border-border-subtle shadow-2xl space-y-3">
            <div className="w-12 h-12 rounded-full bg-surface-mint text-primary flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[28px]">support_agent</span>
            </div>
            <h3 className="text-[16px] font-bold text-center text-text-primary">Xác nhận gửi tín hiệu hỗ trợ?</h3>
            <p className="text-[13px] text-text-secondary text-center leading-relaxed">
              Một tin nhắn ấm áp sẽ được gửi tới {contacts.map((c) => c.name).join(' và ')} để báo rằng bạn đang cần người trò chuyện.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowSosModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-border-subtle text-[13px] font-semibold text-text-secondary hover:bg-page-background"
                type="button"
              >
                Hủy bỏ
              </button>
              <button
                onClick={confirmSosSend}
                className="flex-1 py-2.5 rounded-xl bg-primary text-white text-[13px] font-semibold active:scale-95 shadow-xs"
                type="button"
              >
                Gửi ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
