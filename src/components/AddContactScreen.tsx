import React, { useState } from 'react';
import { TrustedContact } from '../types';

interface AddContactScreenProps {
  onSaveContact: (contact: TrustedContact) => void;
  onBack: () => void;
}

function isValidVietnameseOrIntlPhone(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) return false;
  if (!/^[0-9+\s.\-()]+$/.test(trimmed)) return false;
  const digits = trimmed.replace(/\D/g, '');
  return digits.length >= 9 && digits.length <= 12;
}

export const AddContactScreen: React.FC<AddContactScreenProps> = ({
  onSaveContact,
  onBack,
}) => {
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('Bạn thân');
  const [phone, setPhone] = useState('');
  const [onlyOnSos, setOnlyOnSos] = useState(true);
  const [shareLocation, setShareLocation] = useState(false);
  const [allowAutoCrisisSos, setAllowAutoCrisisSos] = useState(false);
  const [nameTouched, setNameTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const relationships = ['Cha/Mẹ', 'Anh/Chị/Em', 'Bạn thân', 'Cố vấn học tập', 'Khác'];

  const trimmedName = name.trim();
  const trimmedPhone = phone.trim();
  const phoneDigitsCount = trimmedPhone.replace(/\D/g, '').length;
  const isNameValid = trimmedName.length >= 2;
  const isPhoneValid = isValidVietnameseOrIntlPhone(trimmedPhone);
  const canSubmit = isNameValid && isPhoneValid;

  const showNameError = (nameTouched || submitAttempted) && !isNameValid;
  const showPhoneError = (phoneTouched || submitAttempted) && !isPhoneValid;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSubmitAttempted(true);
    if (!canSubmit) return;

    onSaveContact({
      id: 'c-' + Date.now(),
      name: trimmedName,
      relationship,
      phone: trimmedPhone,
      avatarLetter: trimmedName.charAt(0).toUpperCase() || 'B',
      status: 'pending',
      permissionScope: allowAutoCrisisSos
        ? 'Nhận tín hiệu SOS ấm áp khi bạn bấm hỗ trợ hoặc khi phát hiện nguy kịch L4.'
        : onlyOnSos
          ? 'Chỉ nhận tín hiệu khi bạn chủ động bấm Yêu cầu hỗ trợ.'
          : 'Có thể nhận cập nhật nhẹ khi bạn chia sẻ.',
      onlyOnSos,
      shareLocation,
      allowAutoCrisisSos,
      neverShareJournal: true,
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-page-background text-text-primary px-4 md:px-8 pt-1 pb-20 md:pb-12 space-y-4">
      {/* Top Bar */}
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
          disabled={!canSubmit}
          className="text-primary hover:text-focus-ring active:scale-95 transition-all py-1.5 px-3.5 rounded-xl bg-surface-mint text-[13px] font-semibold whitespace-nowrap disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
          type="button"
        >
          Lưu cài đặt
        </button>
      </header>

      {/* Main Content */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-4 md:max-w-3xl md:mx-auto md:w-full"
      >
        {/* Ethical Transparency Banner */}
        <section className="rounded-2xl bg-surface-card border border-border-subtle p-4 card-shadow relative overflow-hidden">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-surface-mint flex items-center justify-center shrink-0 text-focus-ring mt-0.5">
              <span className="material-symbols-outlined text-[19px]">shield</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[13.5px] font-semibold text-focus-ring">
                  Quyền riêng tư tuyệt đối
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-mint text-focus-ring text-[11.5px] font-medium">
                  Minh bạch
                </span>
              </div>
              <p className="text-[13px] text-text-secondary leading-snug">
                Bạn hoàn toàn làm chủ quyền chia sẻ. MINDCARE không tự động đồng bộ danh bạ và không bao giờ gửi bất kỳ dữ liệu nào khi chưa có sự đồng ý của bạn.
              </p>
            </div>
          </div>
        </section>

        {/* Form: Contact Info */}
        <section className="flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-text-primary flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[20px]">person_add</span>
              Thông tin người tin cậy
            </h2>
            <span className="text-[11.5px] text-text-secondary bg-surface-mint/60 px-2.5 py-0.5 rounded-md font-medium">
              Nhập thủ công
            </span>
          </div>

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label
              className="text-[13px] text-text-primary font-medium flex items-center justify-between"
              htmlFor="contact-name"
            >
              <span>Họ và tên người liên hệ</span>
              <span className="text-[11.5px] text-text-secondary">Bắt buộc</span>
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-text-secondary text-[20px]">
                badge
              </span>
              <input
                id="contact-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setNameTouched(true)}
                aria-invalid={showNameError}
                className={`w-full bg-surface-card border rounded-xl pl-11 pr-4 py-2.5 text-[14px] text-text-primary placeholder:text-text-secondary/55 focus:outline-none focus:ring-2 transition-all card-shadow ${
                  showNameError
                    ? 'border-[#C84B31] focus:ring-[#C84B31]/30 focus:border-[#C84B31]'
                    : 'border-border-subtle focus:ring-focus-ring focus:border-focus-ring'
                }`}
                placeholder="Ví dụ: Cô Nguyễn Thị Mai hoặc Hoàng Nam"
                type="text"
              />
            </div>
            {showNameError && (
              <p className="text-[12px] text-[#B8432A] font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">error</span>
                <span>Vui lòng nhập họ tên hoặc tên thân mật (ít nhất 2 ký tự).</span>
              </p>
            )}
          </div>

          {/* Relationship Chips */}
          <div className="flex flex-col gap-2">
            <label className="text-[13px] text-text-primary font-medium">Mối quan hệ</label>
            <div
              aria-label="Mối quan hệ với người hỗ trợ"
              className="flex flex-wrap gap-2"
              role="radiogroup"
            >
              {relationships.map((rel) => {
                const isSelected = relationship === rel;
                return (
                  <button
                    key={rel}
                    onClick={() => setRelationship(rel)}
                    className={`px-3.5 py-1.5 rounded-full text-[12.5px] font-medium transition-all active:scale-95 flex items-center gap-1 cursor-pointer ${
                      isSelected
                        ? 'border border-primary bg-surface-mint text-focus-ring font-semibold shadow-2xs'
                        : 'border border-border-subtle bg-surface-card text-text-secondary hover:border-primary'
                    }`}
                    type="button"
                  >
                    {isSelected && (
                      <span
                        className="material-symbols-outlined text-[14px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
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
            <label
              className="text-[13px] text-text-primary font-medium flex items-center justify-between"
              htmlFor="contact-phone"
            >
              <span>Số điện thoại liên lạc (9–12 chữ số)</span>
              <span className="text-[11.5px] text-primary flex items-center gap-1 font-medium">
                <span className="material-symbols-outlined text-[14px]">lock</span>
                {isPhoneValid ? `Hợp lệ (${phoneDigitsCount} số)` : 'Bảo mật'}
              </span>
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-text-secondary text-[20px]">
                phone
              </span>
              <input
                id="contact-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onBlur={() => setPhoneTouched(true)}
                aria-invalid={showPhoneError}
                inputMode="tel"
                className={`w-full bg-surface-card border rounded-xl pl-11 pr-10 py-2.5 text-[14px] text-text-primary tracking-wide placeholder:text-text-secondary/55 focus:outline-none focus:ring-2 transition-all card-shadow ${
                  showPhoneError
                    ? 'border-[#C84B31] focus:ring-[#C84B31]/30 focus:border-[#C84B31]'
                    : isPhoneValid
                      ? 'border-primary/60 focus:ring-focus-ring focus:border-focus-ring'
                      : 'border-border-subtle focus:ring-focus-ring focus:border-focus-ring'
                }`}
                placeholder="Nhập số điện thoại (VD: 0912 345 678)"
                type="tel"
              />
              {isPhoneValid && (
                <span
                  className="material-symbols-outlined absolute right-3.5 text-primary text-[19px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
              )}
            </div>
            {showPhoneError ? (
              <p className="text-[12px] text-[#B8432A] font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">error</span>
                <span>
                  Vui lòng nhập số điện thoại hợp lệ gồm 9–12 chữ số (hiện có {phoneDigitsCount} chữ số).
                </span>
              </p>
            ) : (
              <p className="text-[11.5px] text-text-secondary">
                Chỉ lưu bảo mật và liên hệ qua giao thức SMS an toàn khi có sự đồng ý của bạn.
              </p>
            )}
          </div>
        </section>

        {/* Scope of Sharing */}
        <section className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[15px] font-semibold text-text-primary flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
              Cấu hình phạm vi chia sẻ
            </h2>
            <span className="text-[11.5px] text-text-secondary">Tùy chỉnh chủ động</span>
          </div>

          <div className="bg-surface-card border border-border-subtle rounded-2xl p-4 flex flex-col divide-y divide-border-subtle/80 card-shadow">
            {/* Toggle 1: Chỉ nhận thông điệp khi bấm nút SOS */}
            <div className="py-2.5 first:pt-0 flex items-start justify-between gap-3">
              <div className="flex-1 pr-1">
                <p className="text-[14px] font-semibold text-text-primary leading-snug">
                  Chỉ nhận thông điệp khi bạn bấm nút Yêu cầu hỗ trợ
                </p>
                <p className="text-[12px] text-text-secondary mt-0.5">
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
                <p className="text-[12px] text-text-secondary mt-0.5">
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

            {/* Toggle 2B: Cho phép tự động gửi SOS ấm áp khi phát hiện nguy kịch L4 */}
            <div className="py-2.5 flex items-start justify-between gap-3">
              <div className="flex-1 pr-1">
                <p className="text-[14px] font-semibold text-text-primary leading-snug">
                  Cho phép tự động gửi tín hiệu SOS ấm áp khi phát hiện nguy kịch L4
                </p>
                <p className="text-[12px] text-text-secondary mt-0.5">
                  Tự động gửi lời nhắn nhờ hỏi thăm nhẹ nhàng khi chỉ báo an toàn chạm mức nguy kịch L4 (tuyệt đối không gửi nội dung chat hay nhật ký).
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                <input
                  checked={allowAutoCrisisSos}
                  onChange={(e) => setAllowAutoCrisisSos(e.target.checked)}
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
                  <span
                    className="material-symbols-outlined text-[16px] text-focus-ring"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    lock
                  </span>
                  <p className="text-[13px] font-semibold text-focus-ring leading-snug">
                    Không bao giờ chia sẻ nhật ký cá nhân hay hội thoại AI
                  </p>
                </div>
                <p className="text-[11.5px] text-text-secondary mt-1">
                  Không gian phản tư và nhật ký luôn được mã hóa cục bộ. Nguyên tắc bất khả xâm phạm của MINDCARE.
                </p>
              </div>
              <div className="shrink-0 flex items-center justify-center mt-1">
                <span className="px-2.5 py-1 rounded-md bg-surface-mint text-focus-ring text-[11.5px] font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">check_circle</span>
                  Đã khóa bảo vệ
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 3-Step 2-Way Connection Process */}
        <section className="bg-surface-card border border-border-subtle rounded-2xl p-4 flex flex-col gap-2.5 card-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-text-primary">
              Quy trình kết nối hai chiều
            </span>
            <span className="inline-flex items-center gap-1 text-[11.5px] text-text-secondary bg-page-background border border-border-subtle px-2.5 py-0.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-tertiary"></span>
              {canSubmit ? 'Sẵn sàng gửi lời mời' : 'Nhập thông tin để tiếp tục'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="p-2.5 rounded-xl bg-surface-mint/40 border border-primary/20 flex flex-col items-center">
              <span className="w-6 h-6 rounded-full bg-surface-mint text-focus-ring text-[12px] font-semibold flex items-center justify-center mb-1">
                1
              </span>
              <span className="text-[11.5px] text-text-primary font-medium leading-tight">
                Gửi SMS mời kết nối
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-page-background border border-border-subtle flex flex-col items-center opacity-80">
              <span className="w-6 h-6 rounded-full bg-surface-card border border-border-subtle text-text-secondary text-[12px] flex items-center justify-center mb-1">
                2
              </span>
              <span className="text-[11.5px] text-text-secondary leading-tight">
                Người nhận xác nhận
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-page-background border border-border-subtle flex flex-col items-center opacity-80">
              <span className="w-6 h-6 rounded-full bg-surface-card border border-border-subtle text-text-secondary text-[12px] flex items-center justify-center mb-1">
                3
              </span>
              <span className="text-[11.5px] text-text-secondary leading-tight">
                Kích hoạt sẵn sàng
              </span>
            </div>
          </div>

          <p className="text-[11.5px] text-text-secondary text-center pt-0.5">
            Người hỗ trợ sẽ nhận đường liên kết SMS để đọc quyền hạn và chấp thuận hỗ trợ bạn mà không cần cài ứng dụng.
          </p>
        </section>

        {/* Primary Action Button */}
        <section className="pt-1 flex flex-col gap-2">
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full bg-focus-ring hover:bg-primary text-white rounded-xl text-[15px] font-semibold flex items-center justify-center gap-2 shadow-[0_4px_16px_-2px_rgba(20,87,64,0.18)] active:scale-[0.98] transition-all py-3 px-4 disabled:bg-[#B8C7BC] disabled:shadow-none disabled:cursor-not-allowed cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">send</span>
            <span>Gửi lời mời kết nối an toàn</span>
          </button>
          <p className="text-[11.5px] text-center text-text-secondary leading-relaxed px-2">
            Bạn có thể thay đổi hoặc thu hồi quyền kết nối này bất kỳ lúc nào tại mục Người hỗ trợ tin cậy.
          </p>
        </section>
      </form>
    </div>
  );
};
