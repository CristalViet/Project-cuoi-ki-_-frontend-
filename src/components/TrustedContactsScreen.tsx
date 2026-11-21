import React, { useEffect, useState } from 'react';
import {
  ConsentProfile,
  SafetyPlanData,
  TrustedContact,
  WarmSosResult,
} from '../types';
import {
  apiClient,
  DEFAULT_CONSENT_PROFILE,
  DEFAULT_SAFETY_PLAN,
} from '../services/apiClient';
import { MochiHappyCompanion } from './MochiIllustrations';

interface TrustedContactsScreenProps {
  contacts: TrustedContact[];
  consentProfile?: ConsentProfile;
  onUpdateConsent?: (next: ConsentProfile) => void;
  onUpdateContact?: (contactId: string, patch: Partial<TrustedContact>) => void;
  onDeleteContact?: (contactId: string) => void;
  onOpenAddContact: () => void;
  onBack: () => void;
}

const RELATIONSHIPS = ['Cha/Mẹ', 'Anh/Chị/Em', 'Bạn thân', 'Cố vấn học tập', 'Khác'];

function isValidEditedPhone(raw: string, originalPhone: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) return false;
  // Allow keeping an existing masked phone unchanged when editing other fields
  if (trimmed === originalPhone.trim()) return true;
  if (!/^[0-9+\s.\-()]+$/.test(trimmed)) return false;
  const digits = trimmed.replace(/\D/g, '');
  return digits.length >= 9 && digits.length <= 12;
}

const SAFETY_PLAN_FIELDS: {
  key: keyof Omit<SafetyPlanData, 'updatedAt'>;
  stepNum: number;
  title: string;
  hint: string;
}[] = [
  {
    key: 'warningSigns',
    stepNum: 1,
    title: 'Dấu hiệu cảnh báo sớm',
    hint: 'Mỗi dòng 1 dấu hiệu (ý nghĩ, cảm xúc, thay đổi giấc ngủ...)',
  },
  {
    key: 'internalCoping',
    stepNum: 2,
    title: 'Chiến lược tự làm dịu tại chỗ',
    hint: 'Các việc bạn có thể tự làm ngay (thở 4-7-8, uống nước ấm...)',
  },
  {
    key: 'safePlacesAndDistractions',
    stepNum: 3,
    title: 'Không gian & hoạt động sao nhãng an toàn',
    hint: 'Nơi chốn hoặc hoạt động giúp chuyển hướng tâm trí lành mạnh',
  },
  {
    key: 'trustedPeople',
    stepNum: 4,
    title: 'Người thân / bạn bè có thể liên hệ',
    hint: 'Tên và thông tin người bạn tin tưởng có thể trò chuyện',
  },
  {
    key: 'professionalContacts',
    stepNum: 5,
    title: 'Chuyên gia & Đường dây khẩn cấp',
    hint: 'Số hotline tâm lý, phòng tham vấn học đường, cơ sở y tế',
  },
  {
    key: 'safeEnvironmentSteps',
    stepNum: 6,
    title: 'Giữ môi trường xung quanh an toàn',
    hint: 'Các bước cụ thể giúp không gian hiện tại an toàn hơn',
  },
];

export const TrustedContactsScreen: React.FC<TrustedContactsScreenProps> = ({
  contacts,
  consentProfile = DEFAULT_CONSENT_PROFILE,
  onUpdateConsent,
  onUpdateContact,
  onDeleteContact,
  onOpenAddContact,
  onBack,
}) => {
  const [showSosModal, setShowSosModal] = useState(false);
  const [isSendingSos, setIsSendingSos] = useState(false);
  const [sosResult, setSosResult] = useState<WarmSosResult | null>(null);
  const [showSampleMessage, setShowSampleMessage] = useState(false);
  const [editingContact, setEditingContact] = useState<TrustedContact | null>(null);
  const [originalEditingPhone, setOriginalEditingPhone] = useState('');
  const [editFormError, setEditFormError] = useState<string | null>(null);
  const [deletingContact, setDeletingContact] = useState<TrustedContact | null>(null);
  const [infoModal, setInfoModal] = useState<{ title: string; body: string } | null>(null);
  const [statusToast, setStatusToast] = useState<string | null>(null);

  // 6-step Stanley-Brown Safety Plan state
  const [safetyPlan, setSafetyPlan] = useState<SafetyPlanData>(DEFAULT_SAFETY_PLAN);
  const [showSafetyPlanModal, setShowSafetyPlanModal] = useState(false);
  const [draftPlanText, setDraftPlanText] = useState<Record<string, string>>({});
  const [isSavingPlan, setIsSavingPlan] = useState(false);

  useEffect(() => {
    let active = true;
    apiClient.getSafetyPlan().then((plan) => {
      if (active) setSafetyPlan(plan);
    });
    return () => {
      active = false;
    };
  }, []);

  const showToast = (msg: string) => {
    setStatusToast(msg);
    window.setTimeout(() => {
      setStatusToast((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const toggleConsentFlag = (key: keyof ConsentProfile) => {
    const updated: ConsentProfile = {
      ...consentProfile,
      [key]: !consentProfile[key],
    };
    onUpdateConsent?.(updated);
  };

  const openContactEditor = (contact: TrustedContact) => {
    setEditingContact({ ...contact });
    setOriginalEditingPhone(contact.phone);
    setEditFormError(null);
  };

  const computePermissionScope = (
    onlyOnSos: boolean,
    allowAutoCrisisSos?: boolean
  ): string => {
    if (allowAutoCrisisSos) {
      return 'Nhận tín hiệu SOS ấm áp khi bạn bấm hỗ trợ hoặc khi phát hiện nguy kịch L4.';
    }
    if (onlyOnSos) {
      return 'Chỉ nhận tín hiệu khi bạn chủ động bấm Yêu cầu hỗ trợ.';
    }
    return 'Có thể nhận cập nhật nhẹ khi bạn chủ động chia sẻ.';
  };

  const handleSaveEditedContact = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingContact) return;

    const trimmedName = editingContact.name.trim();
    const trimmedPhone = editingContact.phone.trim();

    if (trimmedName.length < 2) {
      setEditFormError('Vui lòng nhập họ tên người liên hệ (ít nhất 2 ký tự).');
      return;
    }

    if (!isValidEditedPhone(trimmedPhone, originalEditingPhone)) {
      setEditFormError('Số điện thoại cần hợp lệ từ 9 đến 12 chữ số.');
      return;
    }

    const patch: Partial<TrustedContact> = {
      name: trimmedName,
      relationship: editingContact.relationship,
      phone: trimmedPhone,
      avatarLetter: trimmedName.charAt(0).toUpperCase() || editingContact.avatarLetter || 'B',
      status: editingContact.status,
      onlyOnSos: editingContact.onlyOnSos,
      shareLocation: editingContact.shareLocation,
      allowAutoCrisisSos: Boolean(editingContact.allowAutoCrisisSos),
      permissionScope: computePermissionScope(
        editingContact.onlyOnSos,
        editingContact.allowAutoCrisisSos
      ),
      neverShareJournal: true,
    };

    if (onUpdateContact) {
      onUpdateContact(editingContact.id, patch);
    } else {
      await apiClient.updateContact(editingContact.id, patch);
    }

    setEditingContact(null);
    setEditFormError(null);
    showToast(`Đã cập nhật thông tin & quyền chia sẻ của ${trimmedName}.`);
  };

  const handleConfirmPendingConnection = async (contact: TrustedContact) => {
    const nextScope = computePermissionScope(contact.onlyOnSos, contact.allowAutoCrisisSos);
    const patch: Partial<TrustedContact> = {
      status: 'confirmed',
      permissionScope: nextScope,
      neverShareJournal: true,
    };
    if (onUpdateContact) {
      onUpdateContact(contact.id, patch);
    } else {
      await apiClient.updateContact(contact.id, patch);
    }
    if (editingContact && editingContact.id === contact.id) {
      setEditingContact({
        ...editingContact,
        status: 'confirmed',
        permissionScope: nextScope,
      });
    }
    showToast(`Đã xác nhận kết nối hai chiều với ${contact.name}!`);
  };

  const handleExecuteDeleteContact = async () => {
    if (!deletingContact) return;
    const targetName = deletingContact.name;
    const targetId = deletingContact.id;

    if (onDeleteContact) {
      onDeleteContact(targetId);
    } else {
      await apiClient.deleteContact(targetId);
    }

    if (editingContact?.id === targetId) {
      setEditingContact(null);
    }
    setDeletingContact(null);
    showToast(`Đã gỡ "${targetName}" khỏi danh sách liên hệ tin cậy.`);
  };

  const openSafetyPlanEditor = () => {
    const initialDraft: Record<string, string> = {};
    for (const f of SAFETY_PLAN_FIELDS) {
      initialDraft[f.key] = (safetyPlan[f.key] || []).join('\n');
    }
    setDraftPlanText(initialDraft);
    setShowSafetyPlanModal(true);
  };

  const handleSaveSafetyPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPlan(true);
    try {
      const nextPlan: SafetyPlanData = {
        warningSigns: (draftPlanText.warningSigns || '')
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        internalCoping: (draftPlanText.internalCoping || '')
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        safePlacesAndDistractions: (draftPlanText.safePlacesAndDistractions || '')
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        trustedPeople: (draftPlanText.trustedPeople || '')
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        professionalContacts: (draftPlanText.professionalContacts || '')
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        safeEnvironmentSteps: (draftPlanText.safeEnvironmentSteps || '')
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
      };
      const saved = await apiClient.saveSafetyPlan(nextPlan);
      setSafetyPlan(saved);
      setShowSafetyPlanModal(false);
      showToast('Đã lưu Kế hoạch an toàn 6 bước cá nhân!');
    } finally {
      setIsSavingPlan(false);
    }
  };

  const confirmSosSend = async () => {
    setIsSendingSos(true);
    try {
      const res = await apiClient.triggerWarmSos({
        triggerSource: 'MANUAL_USER',
        coarseLocation: consentProfile.shareCoarseLocationOnSos
          ? 'Khu vực trường học / Ký túc xá (bán kính sơ lược)'
          : undefined,
      });
      setSosResult(res);
      setShowSosModal(false);
      showToast(`Đã gửi tín hiệu SOS ấm áp tới ${res.recipientsCount} người hỗ trợ!`);
    } finally {
      setIsSendingSos(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-page-background text-text-primary px-4 md:px-8 pt-1 pb-24 md:pb-12 space-y-4">
      {/* Top App Bar */}
      <header className="sticky top-0 z-40 bg-page-background/95 backdrop-blur-md pt-2 pb-2 md:pt-4 flex items-center justify-between border-b border-border-subtle/40 md:max-w-5xl md:mx-auto md:w-full">
        <button
          onClick={onBack}
          aria-label="Quay lại"
          className="w-10 h-10 rounded-full flex items-center justify-center text-text-primary hover:bg-surface-mint active:scale-95 transition-all cursor-pointer"
          type="button"
        >
          <span className="material-symbols-outlined text-[24px]">arrow_back</span>
        </button>
        <div className="text-center">
          <h1 className="text-[17px] md:text-[20px] font-semibold text-text-primary tracking-tight">
            Người hỗ trợ tin cậy
          </h1>
          <p className="text-[11.5px] md:text-[12.5px] text-text-secondary">
            Quyền riêng tư &amp; Kế hoạch an toàn 6 bước
          </p>
        </div>
        <button
          onClick={() =>
            setInfoModal({
              title: 'Thông tin minh bạch',
              body: 'MINDCARE không bao giờ đọc danh bạ hay gửi thông tin khi bạn chưa chủ động cho phép. Nhật ký mã hóa AES-256-GCM và hội thoại AI luôn bất khả xâm phạm (neverShareJournal = true).',
            })
          }
          aria-label="Thông tin minh bạch"
          className="w-10 h-10 rounded-full flex items-center justify-center text-text-secondary hover:bg-surface-mint active:scale-95 transition-all cursor-pointer"
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
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
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
                  MINDCARE không bao giờ đính kèm nhật ký hoặc nội dung trò chuyện cho bất kỳ ai.
                </span>
              </p>
            </div>
          </section>

          {/* Section 1: Danh sách người hỗ trợ */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">group</span>
                <h2 className="text-[16px] font-semibold text-text-primary">
                  Người hỗ trợ đã chọn ({contacts.length})
                </h2>
              </div>
              <span className="text-[11.5px] text-text-secondary bg-surface-container-high px-2.5 py-0.5 rounded-full font-medium">
                Tối đa 3 người
              </span>
            </div>

            {contacts.length === 0 ? (
              <div className="rounded-[24px] bg-[#FFFCF7] border border-[#DCE8D5] p-6 text-center card-shadow space-y-3">
                <div className="mx-auto w-20 h-20 rounded-full bg-[#E7F1DF]/75 flex items-center justify-center">
                  <MochiHappyCompanion className="w-16 h-16" />
                </div>
                <div className="space-y-1 max-w-md mx-auto">
                  <h3 className="text-[15.5px] font-bold text-[#1F5C43]">
                    Chưa có người liên hệ tin cậy nào
                  </h3>
                  <p className="text-[13px] text-[#756455] leading-relaxed">
                    Chọn 1–3 người thân hoặc bạn bè hiểu bạn để tạo một điểm tựa ấm áp khi quá tải. Nhật ký và hội thoại riêng tư của bạn vẫn luôn được khóa kín 100%.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onOpenAddContact}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#1F5C43] hover:brightness-105 text-white text-[13.5px] font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[19px]">person_add</span>
                  <span>Thêm người hỗ trợ đầu tiên</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 md:space-y-0 md:grid md:grid-cols-2 md:gap-3">
                {contacts.map((contact) => (
                  <article
                    key={contact.id}
                    className="bg-surface-card border border-border-subtle rounded-2xl p-4 card-shadow space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 rounded-full bg-secondary-container/50 text-secondary flex items-center justify-center font-bold text-base border border-border-subtle shrink-0">
                            {contact.avatarLetter}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-[15px] font-semibold text-text-primary truncate">
                              {contact.name}
                            </h3>
                            <p className="text-[12px] text-text-secondary truncate">
                              {contact.relationship} · {contact.phone}
                            </p>
                          </div>
                        </div>
                        {contact.status === 'confirmed' ? (
                          <span className="inline-flex items-center gap-1 text-[11.5px] bg-surface-mint text-primary font-semibold px-2.5 py-1 rounded-full border border-primary/10 shrink-0">
                            <span
                              className="material-symbols-outlined text-[14px]"
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              check_circle
                            </span>
                            Đã xác nhận
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11.5px] bg-[#FFF4E5] text-[#A7683F] font-semibold px-2.5 py-1 rounded-full border border-[#EDD3B6] shrink-0">
                            <span className="material-symbols-outlined text-[14px]">
                              hourglass_top
                            </span>
                            Chờ xác nhận
                          </span>
                        )}
                      </div>

                      {/* Permission Scope Note */}
                      <div className="bg-page-background rounded-xl p-2.5 border border-border-subtle space-y-1.5">
                        <div className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-text-secondary text-[16px] mt-0.5">
                            lock_clock
                          </span>
                          <p className="text-[11.5px] text-text-secondary leading-snug">
                            <span className="font-semibold text-text-primary">Quyền hạn:</span>{' '}
                            {contact.permissionScope}
                          </p>
                        </div>
                        {contact.allowAutoCrisisSos && (
                          <p className="text-[11.5px] font-semibold text-primary pl-6">
                            • Đã bật gửi SOS ấm áp tự động khi phát hiện nguy kịch L4
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <span className="text-[11.5px] text-primary font-medium flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">lock</span>
                        Khóa nhật ký 100%
                      </span>

                      <div className="flex items-center gap-1.5">
                        {contact.status === 'pending' && (
                          <button
                            onClick={() => handleConfirmPendingConnection(contact)}
                            className="text-[#1F5C43] bg-[#E7F1DF] hover:brightness-95 text-[11.5px] font-semibold flex items-center gap-1 py-1 px-2.5 rounded-lg border border-[#C6DEC0] transition-all active:scale-95 cursor-pointer"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              verified
                            </span>
                            Xác nhận
                          </button>
                        )}
                        <button
                          onClick={() => openContactEditor(contact)}
                          className="text-primary hover:text-focus-ring text-[12px] font-semibold flex items-center gap-1 py-1 px-2.5 rounded-lg hover:bg-surface-mint/60 transition-colors cursor-pointer"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                          Chỉnh sửa
                        </button>
                        {onDeleteContact && (
                          <button
                            onClick={() => setDeletingContact(contact)}
                            aria-label={`Gỡ liên hệ ${contact.name}`}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-text-secondary hover:text-error hover:bg-error-container/35 transition-colors cursor-pointer"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* Add Contact Action */}
            {contacts.length < 3 && (
              <div className="pt-1">
                <button
                  onClick={onOpenAddContact}
                  className="w-full bg-surface-card hover:bg-surface-mint/50 border border-dashed border-primary/40 rounded-2xl p-3.5 flex flex-col items-center justify-center gap-1 active:scale-[0.99] transition-all group cursor-pointer"
                  type="button"
                >
                  <div className="flex items-center gap-2 text-primary text-[15px] font-semibold group-hover:text-focus-ring">
                    <span className="material-symbols-outlined text-[20px]">person_add</span>
                    + Thêm người liên hệ tin cậy
                  </div>
                  <span className="text-[11.5px] text-text-secondary text-center px-4 leading-normal">
                    Nhập tay số điện thoại - Không tự động đồng bộ danh bạ để tôn trọng quyền riêng tư của bạn
                  </span>
                </button>
              </div>
            )}
          </section>

          {/* Section 3: Kế hoạch an toàn cá nhân 6 bước Stanley-Brown */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">spa</span>
                <h2 className="text-[16px] font-semibold text-text-primary">
                  Kế hoạch an toàn cá nhân (6 bước Stanley-Brown)
                </h2>
              </div>
              <button
                onClick={openSafetyPlanEditor}
                className="text-[12px] bg-surface-mint text-primary px-3 py-1.5 rounded-full font-semibold hover:brightness-95 transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[15px]">edit</span>
                Chỉnh sửa 6 bước
              </button>
            </div>

            <div className="bg-surface-card border border-border-subtle rounded-2xl p-4 card-shadow space-y-2.5">
              {SAFETY_PLAN_FIELDS.map((field) => {
                const items = safetyPlan[field.key] || [];
                return (
                  <div
                    key={field.key}
                    className="flex items-start gap-3 bg-page-background p-3 rounded-xl border border-border-subtle"
                  >
                    <span className="w-6 h-6 rounded-full bg-primary text-white font-bold text-[11.5px] flex items-center justify-center flex-shrink-0 mt-0.5 tabular-nums">
                      {field.stepNum}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13.5px] font-semibold text-text-primary">
                        {field.title}
                      </p>
                      {items.length > 0 ? (
                        <ul className="mt-1 space-y-0.5 text-[12px] text-text-secondary">
                          {items.slice(0, 2).map((line, i) => (
                            <li key={i} className="leading-relaxed">
                              • {line}
                            </li>
                          ))}
                          {items.length > 2 && (
                            <li className="text-[11.5px] text-primary font-medium">
                              + {items.length - 2} mục khác
                            </li>
                          )}
                        </ul>
                      ) : (
                        <p className="text-[11.5px] text-text-secondary italic mt-0.5">
                          Chưa thiết lập — Bấm Chỉnh sửa để bổ sung
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div className="space-y-4 lg:col-span-5">
          {/* Section 2: Quyền & Phạm vi chia sẻ SOS */}
          <section className="bg-surface-card border border-border-subtle rounded-2xl p-4 card-shadow space-y-3.5">
            {/* Toggle A: sosFeatureEnabled */}
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-0.5 pr-2">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[18px]">
                    toggle_on
                  </span>
                  <h3 className="text-[14.5px] font-semibold text-text-primary">
                    Bật tính năng tín hiệu hỗ trợ SOS ấm áp
                  </h3>
                </div>
                <p className="text-[11.5px] text-text-secondary leading-snug">
                  Chỉ gửi thông điệp ấm áp báo rằng bạn đang cần người trò chuyện, tuyệt đối không gửi nhật ký.
                </p>
              </div>

              <button
                onClick={() => toggleConsentFlag('sosFeatureEnabled')}
                aria-checked={consentProfile.sosFeatureEnabled}
                className={`w-12 h-7 rounded-full relative flex items-center p-1 transition-colors duration-200 shrink-0 cursor-pointer ${
                  consentProfile.sosFeatureEnabled ? 'bg-primary' : 'bg-surface-variant'
                }`}
                role="switch"
                type="button"
              >
                <span
                  className={`w-5 h-5 bg-surface-card rounded-full shadow-sm transform transition-transform duration-200 ${
                    consentProfile.sosFeatureEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="h-px bg-border-subtle/70" />

            {/* Toggle B: allowAutoCrisisSos */}
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-0.5 pr-2">
                <h4 className="text-[13.5px] font-semibold text-text-primary">
                  Cho phép tự động gửi tín hiệu SOS ấm áp khi phát hiện nguy kịch L4
                </h4>
                <p className="text-[11.5px] text-text-secondary leading-snug">
                  Khi bạn đồng ý trước, hệ thống sẽ gửi thông báo nhờ hỏi thăm dịu dàng tới người tin cậy nếu chạm mức nguy kịch L4.
                </p>
              </div>

              <button
                onClick={() => toggleConsentFlag('allowAutoCrisisSos')}
                aria-checked={consentProfile.allowAutoCrisisSos}
                className={`w-12 h-7 rounded-full relative flex items-center p-1 transition-colors duration-200 shrink-0 cursor-pointer ${
                  consentProfile.allowAutoCrisisSos ? 'bg-primary' : 'bg-surface-variant'
                }`}
                role="switch"
                type="button"
              >
                <span
                  className={`w-5 h-5 bg-surface-card rounded-full shadow-sm transform transition-transform duration-200 ${
                    consentProfile.allowAutoCrisisSos ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="h-px bg-border-subtle/70" />

            {/* Toggle C: shareCoarseLocationOnSos */}
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-0.5 pr-2">
                <h4 className="text-[13.5px] font-medium text-text-primary">
                  Đính kèm vị trí sơ lược (cấp Quận/Khu vực) khi gửi SOS
                </h4>
                <p className="text-[11.5px] text-text-secondary leading-snug">
                  Mặc định tắt. Không theo dõi GPS nền.
                </p>
              </div>

              <button
                onClick={() => toggleConsentFlag('shareCoarseLocationOnSos')}
                aria-checked={consentProfile.shareCoarseLocationOnSos}
                className={`w-12 h-7 rounded-full relative flex items-center p-1 transition-colors duration-200 shrink-0 cursor-pointer ${
                  consentProfile.shareCoarseLocationOnSos ? 'bg-primary' : 'bg-surface-variant'
                }`}
                role="switch"
                type="button"
              >
                <span
                  className={`w-5 h-5 bg-surface-card rounded-full shadow-sm transform transition-transform duration-200 ${
                    consentProfile.shareCoarseLocationOnSos ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="pt-2 border-t border-border-subtle/70">
              <button
                onClick={() => setShowSampleMessage(!showSampleMessage)}
                className="w-full flex items-center justify-between text-left text-[12px] font-medium text-primary select-none cursor-pointer"
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
                  “Chào bạn, mình đang trải qua một khoảnh khắc hơi quá tải và cảm thấy an tâm khi liên hệ với bạn. Khi thuận tiện, bạn có thể gọi lại hoặc nhắn dịu dàng cho mình nhé. (Không đính kèm nhật ký hay hội thoại riêng tư).”
                </div>
              )}
            </div>
          </section>

          {/* SOS Action Button & Result Card */}
          <section className="space-y-2.5 pt-1">
            <button
              onClick={() => setShowSosModal(true)}
              className="w-full bg-primary hover:bg-focus-ring text-white font-semibold text-[16px] py-3.5 px-4 rounded-xl shadow-xs flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all cursor-pointer"
              type="button"
            >
              <span
                className="material-symbols-outlined text-[22px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                sos
              </span>
              <span>Yêu cầu hỗ trợ ấm áp từ người thân</span>
            </button>

            <div className="flex items-center justify-center gap-1.5 text-text-secondary">
              <span className="material-symbols-outlined text-[16px] text-tertiary">
                lock_reset
              </span>
              <span className="text-[11.5px] text-center">
                Cần bạn xác nhận trước khi gửi · Bảo toàn bí mật nhật ký 100%
              </span>
            </div>

            {sosResult && (
              <div className="rounded-2xl bg-surface-card border border-primary/35 p-4 card-shadow space-y-3 animate-fade-in">
                <div className="flex items-start gap-2 text-primary">
                  <span
                    className="material-symbols-outlined text-[20px] mt-0.5"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                  <div>
                    <p className="text-[13.5px] font-bold">
                      Đã gửi tín hiệu SOS ấm áp tới {sosResult.recipientsCount} người hỗ trợ!
                    </p>
                    <p className="text-[11.5px] text-text-secondary mt-0.5">
                      Xác minh bảo mật: Không có dữ liệu nhật ký hay chat nào được chia sẻ.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-page-background border border-border-subtle text-[12px] text-text-primary italic leading-relaxed">
                  “{sosResult.warmMessagePreview}”
                </div>

                <div className="space-y-2 text-[12px]">
                  <p className="font-bold text-primary">
                    Cẩm nang giao tiếp gửi kèm cho người hỗ trợ:
                  </p>
                  <div className="rounded-xl bg-surface-mint/60 p-2.5 space-y-1">
                    <p className="font-bold text-primary">3 điều NÊN nói:</p>
                    {sosResult.communicationGuide.dos.map((item, i) => (
                      <p key={i} className="text-text-primary">
                        • {item}
                      </p>
                    ))}
                  </div>
                  <div className="rounded-xl bg-[#FFF0E6]/80 p-2.5 space-y-1">
                    <p className="font-bold text-[#9E472A]">3 điều KHÔNG NÊN nói:</p>
                    {sosResult.communicationGuide.donts.map((item, i) => (
                      <p key={i} className="text-[#7A3E29]">
                        • {item}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Synchronized Vietnam Emergency Hotlines Card */}
          <aside className="bg-surface-card border border-border-subtle rounded-2xl p-4 card-shadow space-y-3">
            <div className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-tertiary text-[22px] flex-shrink-0 mt-0.5">
                local_hospital
              </span>
              <div className="space-y-1">
                <h4 className="text-[15px] font-semibold text-text-primary">
                  Đường dây hỗ trợ khẩn cấp (Việt Nam)
                </h4>
                <p className="text-[11.5px] text-text-secondary leading-relaxed">
                  Nếu bạn đang trong tình trạng khủng hoảng hoặc cần can thiệp chuyên môn ngay lập tức, hãy chạm để gọi trực tiếp:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                className="bg-page-background border border-border-subtle hover:border-primary/40 rounded-xl p-2.5 text-center flex flex-col items-center justify-center transition-colors"
                href="tel:115"
              >
                <span className="text-[11.5px] text-text-secondary">Cấp cứu Y tế</span>
                <span className="text-[16px] text-primary font-bold tabular-nums">115</span>
              </a>
              <a
                className="bg-page-background border border-border-subtle hover:border-primary/40 rounded-xl p-2.5 text-center flex flex-col items-center justify-center transition-colors"
                href="tel:111"
              >
                <span className="text-[11.5px] text-text-secondary">Tổng đài Quốc gia</span>
                <span className="text-[16px] text-primary font-bold tabular-nums">111</span>
              </a>
              <a
                className="bg-page-background border border-border-subtle hover:border-primary/40 rounded-xl p-2.5 text-center flex flex-col items-center justify-center transition-colors"
                href="tel:0963061414"
              >
                <span className="text-[11.5px] text-text-secondary">Đường dây Ngày Mai</span>
                <span className="text-[14.5px] text-primary font-bold tabular-nums">
                  096 306 1414
                </span>
              </a>
              <a
                className="bg-page-background border border-border-subtle hover:border-primary/40 rounded-xl p-2.5 text-center flex flex-col items-center justify-center transition-colors"
                href="tel:19001267"
              >
                <span className="text-[11.5px] text-text-secondary">Hỗ trợ Tâm lý</span>
                <span className="text-[15px] text-primary font-bold tabular-nums">1900 1267</span>
              </a>
            </div>

            <p className="text-[11.5px] text-text-secondary text-center italic pt-1">
              * MINDCARE là người bạn đồng hành chăm sóc tinh thần, không thay thế cấp cứu y tế trực tiếp 24/7.
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

      {/* Full Contact Edit & Permission Customization Modal */}
      {editingContact && (
        <div
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-3 md:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Chỉnh sửa người liên hệ tin cậy"
        >
          <form
            onSubmit={handleSaveEditedContact}
            className="bg-surface-card rounded-[28px] max-w-[460px] w-full max-h-[92dvh] flex flex-col border border-border-subtle shadow-2xl overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between bg-page-background">
              <div>
                <h3 className="text-[16px] font-bold text-text-primary">
                  Chỉnh sửa liên hệ tin cậy
                </h3>
                <p className="text-[11.5px] text-text-secondary">
                  Cập nhật thông tin &amp; quyền nhận tín hiệu SOS ấm áp
                </p>
              </div>
              <button
                onClick={() => setEditingContact(null)}
                aria-label="Đóng"
                className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:bg-surface-mint cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Connection Status Banner & Confirm Action */}
              <div
                className={`rounded-2xl p-3.5 border flex items-center justify-between gap-3 ${
                  editingContact.status === 'confirmed'
                    ? 'bg-surface-mint/70 border-primary/20'
                    : 'bg-[#FFF8EF] border-[#EBD4B7]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`material-symbols-outlined text-[20px] shrink-0 ${
                      editingContact.status === 'confirmed' ? 'text-primary' : 'text-[#A7683F]'
                    }`}
                  >
                    {editingContact.status === 'confirmed' ? 'verified' : 'hourglass_top'}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-bold text-text-primary">
                      {editingContact.status === 'confirmed'
                        ? 'Đã xác nhận kết nối 2 chiều'
                        : 'Đang chờ xác nhận kết nối'}
                    </p>
                    <p className="text-[11.5px] text-text-secondary leading-snug">
                      {editingContact.status === 'confirmed'
                        ? 'Sẵn sàng nhận tín hiệu hỗ trợ ấm áp từ bạn.'
                        : 'Bấm xác nhận khi người thân đã đồng ý đồng hành.'}
                    </p>
                  </div>
                </div>
                {editingContact.status === 'pending' && (
                  <button
                    type="button"
                    onClick={() =>
                      setEditingContact({
                        ...editingContact,
                        status: 'confirmed',
                      })
                    }
                    className="shrink-0 px-3 py-1.5 rounded-full bg-primary text-white text-[12px] font-bold hover:brightness-105 active:scale-95 transition-all cursor-pointer"
                  >
                    Xác nhận ngay
                  </button>
                )}
              </div>

              {/* Basic Fields: Name, Relationship, Phone */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[12.5px] font-semibold text-text-primary mb-1">
                    Họ và tên người liên hệ
                  </label>
                  <input
                    type="text"
                    value={editingContact.name}
                    onChange={(e) => {
                      setEditFormError(null);
                      setEditingContact({ ...editingContact, name: e.target.value });
                    }}
                    placeholder="Ví dụ: Cô Nguyễn Thị Mai"
                    className="w-full rounded-xl border border-border-subtle bg-page-background px-3.5 py-2.5 text-[13.5px] text-text-primary focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-[12.5px] font-semibold text-text-primary mb-1.5">
                    Mối quan hệ
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {RELATIONSHIPS.map((rel) => {
                      const active = editingContact.relationship === rel;
                      return (
                        <button
                          key={rel}
                          type="button"
                          onClick={() =>
                            setEditingContact({ ...editingContact, relationship: rel })
                          }
                          className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all cursor-pointer ${
                            active
                              ? 'bg-surface-mint border-primary text-primary font-semibold'
                              : 'bg-page-background border-border-subtle text-text-secondary hover:border-primary/50'
                          }`}
                        >
                          {rel}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-[12.5px] font-semibold text-text-primary mb-1">
                    Số điện thoại liên lạc (9–12 chữ số)
                  </label>
                  <input
                    type="tel"
                    value={editingContact.phone}
                    onChange={(e) => {
                      setEditFormError(null);
                      setEditingContact({ ...editingContact, phone: e.target.value });
                    }}
                    placeholder="Ví dụ: 0912 345 678"
                    className="w-full rounded-xl border border-border-subtle bg-page-background px-3.5 py-2.5 text-[13.5px] text-text-primary focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Permission Toggles */}
              <div className="space-y-2.5 text-[13px]">
                <p className="text-[12px] font-bold uppercase tracking-wider text-text-secondary">
                  Phạm vi quyền hạn SOS
                </p>

                <label className="flex items-start justify-between gap-3 cursor-pointer p-3 rounded-2xl bg-page-background border border-border-subtle">
                  <div>
                    <p className="font-semibold text-text-primary">
                      Chỉ nhận thông điệp khi bấm Yêu cầu hỗ trợ (`onlyOnSos`)
                    </p>
                    <p className="text-[11.5px] text-text-secondary mt-0.5">
                      Chỉ gửi tin nhắn khi bạn chủ động bấm nút SOS trên ứng dụng.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={editingContact.onlyOnSos}
                    onChange={(e) =>
                      setEditingContact({
                        ...editingContact,
                        onlyOnSos: e.target.checked,
                      })
                    }
                    className="mt-1 h-5 w-5 rounded border-border-subtle text-primary focus:ring-primary shrink-0"
                  />
                </label>

                <label className="flex items-start justify-between gap-3 cursor-pointer p-3 rounded-2xl bg-page-background border border-border-subtle">
                  <div>
                    <p className="font-semibold text-text-primary">
                      Cho phép tự động gửi SOS ấm áp khi nguy kịch L4
                    </p>
                    <p className="text-[11.5px] text-text-secondary mt-0.5">
                      Gửi lời nhắn nhờ hỏi thăm nhẹ nhàng khi chạm mức L4. Không bao giờ gửi nhật ký hay chat.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(editingContact.allowAutoCrisisSos)}
                    onChange={(e) =>
                      setEditingContact({
                        ...editingContact,
                        allowAutoCrisisSos: e.target.checked,
                      })
                    }
                    className="mt-1 h-5 w-5 rounded border-border-subtle text-primary focus:ring-primary shrink-0"
                  />
                </label>

                <label className="flex items-start justify-between gap-3 cursor-pointer p-3 rounded-2xl bg-page-background border border-border-subtle">
                  <div>
                    <p className="font-semibold text-text-primary">
                      Chia sẻ vị trí sơ lược khi khẩn cấp
                    </p>
                    <p className="text-[11.5px] text-text-secondary mt-0.5">
                      Chỉ đính kèm khu vực/quận gần đúng trong tin nhắn SOS.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={editingContact.shareLocation}
                    onChange={(e) =>
                      setEditingContact({
                        ...editingContact,
                        shareLocation: e.target.checked,
                      })
                    }
                    className="mt-1 h-5 w-5 rounded border-border-subtle text-primary focus:ring-primary shrink-0"
                  />
                </label>
              </div>

              {editFormError && (
                <div className="rounded-xl bg-[#FFF0EC] border border-[#EAB8AC] px-3.5 py-2.5 text-[12px] font-semibold text-[#B43E24] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px]">error</span>
                  <span>{editFormError}</span>
                </div>
              )}
            </div>

            <div className="px-5 py-3.5 border-t border-border-subtle bg-page-background flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setDeletingContact(editingContact)}
                className="px-3.5 py-2.5 rounded-xl text-[12.5px] font-semibold text-error hover:bg-error-container/40 transition-colors cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[17px]">person_remove</span>
                <span>Gỡ liên hệ</span>
              </button>
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setEditingContact(null)}
                  className="px-4 py-2.5 rounded-xl border border-border-subtle bg-white text-[12.5px] font-semibold text-text-secondary hover:bg-surface-mint/30 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary hover:brightness-105 text-white text-[13px] font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* 2-Step Delete Contact Confirmation Modal */}
      {deletingContact && (
        <div
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label="Xác nhận gỡ liên hệ tin cậy"
        >
          <div className="bg-surface-card rounded-[26px] max-w-[390px] w-full p-5 border border-border-subtle shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-error-container/55 text-error flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[26px]">person_remove</span>
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-[16px] font-bold text-text-primary">
                Bạn chắc chắn muốn gỡ liên hệ tin cậy này?
              </h3>
              <p className="text-[13px] text-text-secondary leading-relaxed">
                <strong>{deletingContact.name}</strong> ({deletingContact.relationship} ·{' '}
                {deletingContact.phone}) sẽ không còn nhận được tín hiệu SOS ấm áp khi bạn cần hỗ trợ.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setDeletingContact(null)}
                className="py-2.5 rounded-xl border border-border-subtle bg-page-background text-[13px] font-semibold text-text-primary hover:bg-surface-mint/50 transition-colors cursor-pointer"
              >
                Giữ lại
              </button>
              <button
                type="button"
                onClick={handleExecuteDeleteContact}
                className="py-2.5 rounded-xl bg-error text-white text-[13px] font-bold shadow-xs hover:brightness-95 active:scale-95 transition-all cursor-pointer"
              >
                Chắc chắn gỡ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6-Step Stanley-Brown Safety Plan Editor Modal */}
      {showSafetyPlanModal && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-3 md:p-5">
          <form
            onSubmit={handleSaveSafetyPlan}
            className="bg-surface-card rounded-[28px] max-w-[560px] w-full max-h-[90dvh] flex flex-col border border-border-subtle shadow-2xl overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between bg-page-background">
              <div>
                <h3 className="text-[16px] font-bold text-primary">
                  Kế hoạch an toàn 6 bước (Stanley-Brown)
                </h3>
                <p className="text-[11.5px] text-text-secondary">
                  Chuẩn bị trước những điểm tựa cụ thể khi cảm xúc trở nên quá tải
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSafetyPlanModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:bg-surface-mint cursor-pointer"
              >
                <span className="material-symbols-outlined text-[19px]">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {SAFETY_PLAN_FIELDS.map((field) => (
                <div key={field.key} className="space-y-1">
                  <label className="block text-[13px] font-bold text-text-primary">
                    Bước {field.stepNum}. {field.title}
                  </label>
                  <p className="text-[11.5px] text-text-secondary">{field.hint}</p>
                  <textarea
                    rows={2}
                    value={draftPlanText[field.key] || ''}
                    onChange={(e) =>
                      setDraftPlanText((prev) => ({
                        ...prev,
                        [field.key]: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-border-subtle bg-page-background px-3 py-2 text-[13px] text-text-primary focus:outline-none focus:border-primary"
                  />
                </div>
              ))}
            </div>

            <div className="px-5 py-3.5 border-t border-border-subtle bg-page-background flex gap-2.5">
              <button
                type="button"
                onClick={() => setShowSafetyPlanModal(false)}
                className="flex-1 py-2.5 rounded-full border border-border-subtle bg-white text-[13px] font-semibold text-text-secondary cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSavingPlan}
                className="flex-1 py-2.5 rounded-full bg-primary text-white text-[13px] font-bold shadow-xs disabled:opacity-60 cursor-pointer"
              >
                {isSavingPlan ? 'Đang lưu...' : 'Lưu kế hoạch an toàn'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Info Modal */}
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
                className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:bg-surface-mint cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <p className="text-[13px] text-text-secondary leading-relaxed">{infoModal.body}</p>
            <button
              onClick={() => setInfoModal(null)}
              className="w-full py-2.5 rounded-xl bg-primary text-white text-[13px] font-semibold hover:bg-primary-container active:scale-95 transition-all cursor-pointer"
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
          <div className="bg-surface-card rounded-2xl max-w-[380px] w-full p-5 border border-border-subtle shadow-2xl space-y-3">
            <div className="w-12 h-12 rounded-full bg-surface-mint text-primary flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[28px]">support_agent</span>
            </div>
            <h3 className="text-[16px] font-bold text-center text-text-primary">
              Xác nhận gửi tín hiệu SOS ấm áp?
            </h3>
            <p className="text-[13px] text-text-secondary text-center leading-relaxed">
              Một lời nhắn ấm áp kèm cẩm nang 3 điều nên/không nên nói sẽ được gửi tới{' '}
              <strong>
                {contacts.length > 0
                  ? contacts.map((c) => c.name).join(' và ')
                  : 'người hỗ trợ tin cậy'}
              </strong>
              . Nhật ký và cuộc trò chuyện của bạn hoàn toàn không bị đính kèm.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowSosModal(false)}
                disabled={isSendingSos}
                className="flex-1 py-2.5 rounded-xl border border-border-subtle text-[13px] font-semibold text-text-secondary hover:bg-page-background cursor-pointer"
                type="button"
              >
                Hủy bỏ
              </button>
              <button
                onClick={confirmSosSend}
                disabled={isSendingSos}
                className="flex-1 py-2.5 rounded-xl bg-primary text-white text-[13px] font-semibold active:scale-95 shadow-xs disabled:opacity-60 cursor-pointer"
                type="button"
              >
                {isSendingSos ? 'Đang gửi...' : 'Gửi ngay'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
