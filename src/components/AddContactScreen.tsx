import React, { useState } from 'react';
import { TrustedContact } from '../types';

interface AddContactScreenProps {
  onSaveContact: (contact: TrustedContact) => void;
  onBack: () => void;
}

export const AddContactScreen: React.FC<AddContactScreenProps> = ({
  onSaveContact,
  onBack,
}) => {
  const [name, setName] = useState('Cô Nguyễn Thị Mai (hoặc Bạn thân)');
  const [relationship, setRelationship] = useState('Bạn thân');
  const [phone, setPhone] = useState('0912 ••• 889');
  const [onlyOnSos, setOnlyOnSos] = useState(true);
  const [shareLocation, setShareLocation] = useState(false);

  const relationships = ['Cha/Mẹ', 'Anh/Chị/Em', 'Bạn thân', 'Cố vấn học tập', 'Khác'];

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) return;

    onSaveContact({
      id: 'c-' + Date.now(),
      name: name.trim(),
      relationship,
      phone: phone.trim() || '0900 ••• 000',
      avatarLetter: name.trim().charAt(0).toUpperCase() || 'B',
      status: 'pending',
      permissionScope: onlyOnSos
        ? 'Chỉ nhận tín hiệu khi bạn chủ động bấm Yêu cầu hỗ trợ.'
        : 'Có thể nhận cập nhật nhẹ khi bạn chia sẻ.',
      onlyOnSos,
      shareLocation,
      neverShareJournal: true,
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-page-background text-text-primary px-4 md:px-8 pt-1 pb-20 md:pb-12 space-y-4">
      {/* Top Bar compliant with Image 6 */}
      <header className="sticky top-0 z-40 bg-page-background/95 backdrop-blur-md pt-2 pb-2 md:pt-4 flex items-center justify-between border-b border-border-subtle/40 md:max-w-3xl md:mx-auto md:w-full">
        <button
          onClick={onBack}
          aria-label="Quay lại hoặc Hủy"
          className="flex items-center gap-1 text-text-secondary hover:text-text-primary active:scale-95 transition-all py-1.5 px-2 rounded-lg"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          <span className="text-[13px] font-medium">Hủy</span>
        </button>

        <h1 className="text-[16px] md:text-[18px] font-semibold text-text-primary tracking-tight text-center truncate max-w-[220px]">
          Thêm người hỗ trợ
        </h1>

        <button
          onClick={() => handleSubmit()}
          className="text-primary hover:text-focus-ring active:scale-95 transition-all py-1.5 px-3 rounded-lg bg-surface-mint text-[13px] font-semibold whitespace-nowrap"
          type="button"
        >
          Lưu cài đặt
        </button>
      </header>

      {/* Main Content */}
      <div className="flex flex-col gap-4 md:max-w-3xl md:mx-auto md:w-full">
        {/* Ethical Transparency Banner */}
        <section className="rounded-2xl bg-surface-card border border-border-subtle p-4 card-shadow relative overflow-hidden">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-surface-mint flex items-center justify-center shrink-0 text-focus-ring mt-0.5">
              <span className="material-symbols-outlined text-[18px]">shield</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[13px] font-semibold text-focus-ring">Quyền riêng tư tuyệt đối</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-mint text-focus-ring text-[11px] font-medium">
                  Minh bạch
                </span>
              </div>
              <p className="text-[13px] text-text-secondary leading-snug">
                Bạn hoàn toàn làm chủ quyền chia sẻ. MINDCARE không tự động đồng bộ danh bạ và không bao giờ gửi bất kỳ
                dữ liệu nào khi chưa có sự đồng ý của bạn.
              </p>
            </div>
          </div>
        </section>

        {/* Form: Contact Info */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-text-primary flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[20px]">person_add</span>
              Thông tin người tin cậy
            </h2>
            <span className="text-[11px] text-text-secondary bg-surface-mint/60 px-2 py-0.5 rounded-md">
              Nhập thủ công
            </span>
          </div>

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] text-text-primary font-medium flex items-center justify-between" htmlFor="contact-name">
              <span>Họ và tên người liên hệ</span>
              <span className="text-[11px] text-text-secondary">Bắt buộc</span>
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-text-secondary text-[20px]">badge</span>
              <input
                id="contact-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-surface-card border border-border-subtle rounded-xl pl-11 pr-4 py-2.5 text-[14px] text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-focus-ring transition-all card-shadow"
                placeholder="Cô Nguyễn Thị Mai (hoặc Bạn thân)"
                type="text"
              />
            </div>
          </div>

          {/* Relationship Chips */}
          <div className="flex flex-col gap-2">
            <label className="text-[13px] text-text-primary font-medium">Mối quan hệ</label>
            <div aria-label="Mối quan hệ với người hỗ trợ" className="flex flex-wrap gap-2" role="radiogroup">
              {relationships.map((rel) => {
                const isSelected = relationship === rel;
                return (
                  <button
                    key={rel}
                    onClick={() => setRelationship(rel)}
                    className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-all active:scale-95 flex items-center gap-1 ${
                      isSelected
                        ? 'border border-primary bg-surface-mint text-focus-ring font-semibold shadow-2xs'
                        : 'border border-border-subtle bg-surface-card text-text-secondary hover:border-primary'
                    }`}
                    type="button"
                  >
                    {isSelected && (
                      <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        check
                      </span>
                    )}
                    <span>{rel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Phone Number */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] text-text-primary font-medium flex items-center justify-between" htmlFor="contact-phone">
              <span>Số điện thoại liên lạc</span>
              <span className="text-[11px] text-primary flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[14px]">lock</span> Bảo mật
              </span>
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-text-secondary text-[20px]">phone</span>
              <input
                id="contact-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-surface-card border border-border-subtle rounded-xl pl-11 pr-4 py-2.5 text-[14px] text-text-primary tracking-wide placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-focus-ring transition-all card-shadow"
                placeholder="0912 ••• 889"
                type="tel"
              />
            </div>
            <p className="text-[11px] text-text-secondary">
              Chỉ lưu cục bộ và liên hệ qua giao thức SMS an toàn khi có sự đồng ý.
            </p>
          </div>
        </section>

        {/* Scope of Sharing */}
        <section className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[15px] font-semibold text-text-primary flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
              Cấu hình phạm vi chia sẻ
            </h2>
            <span className="text-[11px] text-text-secondary">Mặc định tắt</span>
          </div>

          <div className="bg-surface-card border border-border-subtle rounded-2xl p-4 flex flex-col divide-y divide-border-subtle/80 card-shadow">
            {/* Toggle 1: Chỉ nhận thông điệp khi bấm nút SOS */}
            <div className="py-2.5 first:pt-0 flex items-start justify-between gap-3">
              <div className="flex-1 pr-1">
                <p className="text-[14px] font-semibold text-text-primary leading-snug">
                  Chỉ nhận thông điệp khi bạn bấm nút Yêu cầu hỗ trợ
                </p>
                <p className="text-[11px] text-text-secondary mt-0.5">
                  Người này chỉ nhận tin nhắn SOS khi bạn chủ động kích hoạt trên ứng dụng.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                <input
                  checked={onlyOnSos}
                  onChange={(e) => setOnlyOnSos(e.target.checked)}
                  className="sr-only peer"
                  type="checkbox"
                />
                <div className="w-11 h-6 bg-border-subtle peer-focus:ring-2 peer-focus:ring-focus-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-surface-card after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-card after:border-border-subtle after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
              </label>
            </div>

            {/* Toggle 2: Chia sẻ vị trí sơ lược */}
            <div className="py-2.5 flex items-start justify-between gap-3">
              <div className="flex-1 pr-1">
                <p className="text-[14px] font-medium text-text-primary leading-snug">
                  Chia sẻ vị trí sơ lược khi gửi tín hiệu khẩn cấp
                </p>
                <p className="text-[11px] text-text-secondary mt-0.5">
                  Chỉ cung cấp bán kính quận/khu vực gần đúng trong trường hợp khẩn thiết.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                <input
                  checked={shareLocation}
                  onChange={(e) => setShareLocation(e.target.checked)}
                  className="sr-only peer"
                  type="checkbox"
                />
                <div className="w-11 h-6 bg-border-subtle peer-focus:ring-2 peer-focus:ring-focus-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-surface-card after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-card after:border-border-subtle after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
              </label>
            </div>

            {/* Toggle 3: Khóa bảo vệ */}
            <div className="py-2.5 last:pb-0 flex items-start justify-between gap-3 bg-surface-mint/20 -mx-4 px-4 rounded-b-xl border-t border-border-subtle/80">
              <div className="flex-1 pr-2">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-focus-ring" style={{ fontVariationSettings: "'FILL' 1" }}>
                    lock
                  </span>
                  <p className="text-[13px] font-semibold text-focus-ring leading-snug">
                    Không bao giờ chia sẻ nhật ký cá nhân hay hội thoại AI
                  </p>
                </div>
                <p className="text-[11px] text-text-secondary mt-1">
                  Không gian phản tư và nhật ký luôn được mã hóa cục bộ. Nguyên tắc bất khả xâm phạm của MINDCARE.
                </p>
              </div>
              <div className="shrink-0 flex items-center justify-center mt-1">
                <span className="px-2.5 py-1 rounded-md bg-surface-mint text-focus-ring text-[11px] font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">check_circle</span>
                  Đã khóa bảo vệ
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 3-Step 2-Way Connection Process */}
        <section className="bg-surface-card border border-border-subtle rounded-2xl p-4 flex flex-col gap-2.5 card-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-text-primary">Quy trình kết nối hai chiều</span>
            <span className="inline-flex items-center gap-1 text-[11px] text-text-secondary bg-page-background border border-border-subtle px-2 py-0.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-tertiary"></span>
              Chưa gửi yêu cầu kết nối
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="p-2 rounded-xl bg-surface-mint/40 border border-primary/20 flex flex-col items-center">
              <span className="w-6 h-6 rounded-full bg-surface-mint text-focus-ring text-[12px] font-semibold flex items-center justify-center mb-1">
                1
              </span>
              <span className="text-[11px] text-text-primary font-medium leading-tight">Gửi SMS mời kết nối</span>
            </div>

            <div className="p-2 rounded-xl bg-page-background border border-border-subtle flex flex-col items-center opacity-70">
              <span className="w-6 h-6 rounded-full bg-surface-card border border-border-subtle text-text-secondary text-[12px] flex items-center justify-center mb-1">
                2
              </span>
              <span className="text-[11px] text-text-secondary leading-tight">Người nhận xác nhận</span>
            </div>

            <div className="p-2 rounded-xl bg-page-background border border-border-subtle flex flex-col items-center opacity-70">
              <span className="w-6 h-6 rounded-full bg-surface-card border border-border-subtle text-text-secondary text-[12px] flex items-center justify-center mb-1">
                3
              </span>
              <span className="text-[11px] text-text-secondary leading-tight">Kích hoạt sẵn sàng</span>
            </div>
          </div>

          <p className="text-[11px] text-text-secondary text-center pt-0.5">
            Người hỗ trợ sẽ nhận đường liên kết SMS để đọc quyền hạn và chấp thuận hỗ trợ bạn mà không cần cài ứng dụng.
          </p>
        </section>

        {/* Primary Action Button */}
        <section className="pt-1 flex flex-col gap-2">
          <button
            onClick={() => handleSubmit()}
            className="w-full bg-focus-ring hover:bg-primary text-white rounded-xl text-[15px] font-semibold flex items-center justify-center gap-2 shadow-[0_4px_16px_-2px_rgba(20,87,64,0.18)] active:scale-[0.98] transition-all py-3 px-4"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">send</span>
            <span>Gửi lời mời kết nối an toàn</span>
          </button>
          <p className="text-[11px] text-center text-text-secondary leading-relaxed px-2">
            Bạn có thể thay đổi hoặc thu hồi quyền kết nối này bất kỳ lúc nào tại mục Cài đặt An toàn.
          </p>
        </section>
      </div>
    </div>
  );
};
