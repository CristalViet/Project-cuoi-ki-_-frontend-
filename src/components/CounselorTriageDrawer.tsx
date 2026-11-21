import React, { useEffect, useState } from 'react';
import { AuditVerifyResult, EscalationEpisodeDTO } from '../types';
import { apiClient } from '../services/apiClient';

interface CounselorTriageDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onRiskStateRefresh?: () => void;
}

const STATUS_STEPS: {
  key: string;
  label: string;
  actionLabel: string;
  badgeClass: string;
}[] = [
  {
    key: 'OPEN',
    label: 'Mới mở (Chờ nhận ca)',
    actionLabel: 'Nhận ca (Acknowledge)',
    badgeClass: 'bg-[#FFF0E6] text-[#A83E20] border-[#F0C6B6]',
  },
  {
    key: 'ACKNOWLEDGED',
    label: 'Đã nhận ca',
    actionLabel: 'Chuyển sang Đang can thiệp',
    badgeClass: 'bg-[#FFF8E1] text-[#8E6118] border-[#EAD69B]',
  },
  {
    key: 'INTERVENING',
    label: 'Đang can thiệp',
    actionLabel: 'Chuyển sang Theo dõi sau khủng hoảng',
    badgeClass: 'bg-[#E7F1DF] text-[#1F5C43] border-[#C5DEC0]',
  },
  {
    key: 'FOLLOW_UP',
    label: 'Theo dõi sau khủng hoảng',
    actionLabel: 'Xác nhận Đã ổn định (Resolve)',
    badgeClass: 'bg-[#E6F4F1] text-[#1B6356] border-[#BCE0D8]',
  },
  {
    key: 'RESOLVED',
    label: 'Đã ổn định (Đóng ca)',
    actionLabel: 'Đã hoàn tất',
    badgeClass: 'bg-[#ECEEE9] text-[#5B685F] border-[#D8DDD4]',
  },
];

function getNextStatus(current: string): { nextKey: string; buttonLabel: string } | null {
  switch (current) {
    case 'OPEN':
      return { nextKey: 'ACKNOWLEDGED', buttonLabel: 'Nhận ca (Acknowledge)' };
    case 'ACKNOWLEDGED':
      return { nextKey: 'INTERVENING', buttonLabel: 'Đang can thiệp' };
    case 'INTERVENING':
      return { nextKey: 'FOLLOW_UP', buttonLabel: 'Theo dõi sau khủng hoảng' };
    case 'FOLLOW_UP':
      return { nextKey: 'RESOLVED', buttonLabel: 'Đã ổn định (Resolve)' };
    default:
      return null;
  }
}

export const CounselorTriageDrawer: React.FC<CounselorTriageDrawerProps> = ({
  isOpen,
  onClose,
  onRiskStateRefresh,
}) => {
  const [episodes, setEpisodes] = useState<EscalationEpisodeDTO[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'P0' | 'P1' | 'P2'>('ALL');
  const [auditInfo, setAuditInfo] = useState<AuditVerifyResult | null>(null);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifyingAudit, setIsVerifyingAudit] = useState(false);

  // Status transition & note states
  const [counselorNoteInput, setCounselorNoteInput] = useState('');
  const [clearRiskFloor, setClearRiskFloor] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Break-glass modal states
  const [showBreakGlassModal, setShowBreakGlassModal] = useState(false);
  const [counselorName, setCounselorName] = useState('ThS. Trần Minh Hà');
  const [clinicalReason, setClinicalReason] = useState('');
  const [isBreakingGlass, setIsBreakingGlass] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  const loadConsoleData = async () => {
    setIsLoading(true);
    try {
      const [epList, audit] = await Promise.all([
        apiClient.getEscalationEpisodes(),
        apiClient.verifyAuditChain(),
      ]);
      setEpisodes(epList);
      setAuditInfo(audit);
      if (epList.length > 0 && (!selectedId || !epList.some((e) => e.id === selectedId))) {
        setSelectedId(epList[0].id);
        setCounselorNoteInput(epList[0].counselorNote || '');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadConsoleData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredEpisodes = episodes.filter((ep) =>
    priorityFilter === 'ALL' ? true : ep.priority === priorityFilter
  );

  const selectedEpisode =
    episodes.find((e) => e.id === selectedId) || filteredEpisodes[0] || null;

  const notify = (msg: string) => {
    setStatusFeedback(msg);
    window.setTimeout(() => {
      setStatusFeedback((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const handleVerifyAudit = async () => {
    setIsVerifyingAudit(true);
    try {
      const res = await apiClient.verifyAuditChain();
      setAuditInfo(res);
      setShowAuditLogs(true);
      notify(
        res.valid
          ? `Chuỗi băm SHA-256 hợp lệ 100% (${res.totalEntries} bản ghi bất biến).`
          : 'Cảnh báo: Phát hiện sai lệch chuỗi băm kiểm toán!'
      );
    } finally {
      setIsVerifyingAudit(false);
    }
  };

  const handleTransitionStatus = async (nextStatus: string) => {
    if (!selectedEpisode) return;
    setIsUpdatingStatus(true);
    try {
      const updated = await apiClient.updateEpisodeStatus(selectedEpisode.id, {
        newStatus: nextStatus,
        counselorNote: counselorNoteInput.trim(),
        clearRiskFloor: nextStatus === 'RESOLVED' ? clearRiskFloor : false,
      });
      setEpisodes((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      const refreshedAudit = await apiClient.verifyAuditChain();
      setAuditInfo(refreshedAudit);
      onRiskStateRefresh?.();
      notify(`Đã chuyển trạng thái ca ${updated.pseudonymId} sang ${nextStatus}.`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleConfirmBreakGlass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEpisode || !counselorName.trim() || !clinicalReason.trim()) return;
    setIsBreakingGlass(true);
    try {
      const unlocked = await apiClient.triggerBreakGlass(selectedEpisode.id, {
        counselorName: counselorName.trim(),
        clinicalReason: clinicalReason.trim(),
      });
      setEpisodes((prev) => prev.map((ep) => (ep.id === unlocked.id ? unlocked : ep)));
      setShowBreakGlassModal(false);
      setClinicalReason('');
      const refreshedAudit = await apiClient.verifyAuditChain();
      setAuditInfo(refreshedAudit);
      notify(`Đã kích hoạt Break-Glass (TTL 2h) và ghi sổ cái kiểm toán SHA-256.`);
    } finally {
      setIsBreakingGlass(false);
    }
  };

  const statusMeta =
    STATUS_STEPS.find((s) => s.key === selectedEpisode?.status) || STATUS_STEPS[0];
  const nextTransition = selectedEpisode ? getNextStatus(selectedEpisode.status) : null;

  return (
    <div
      className="fixed inset-0 z-[85] bg-[#173E30]/50 backdrop-blur-xs flex justify-end animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Bảng điều phối Chuyên gia Tham vấn & Đội An toàn (HITL)"
    >
      <div className="w-full max-w-[960px] h-full bg-[#FAF7EE] border-l border-[#DCE4D5] shadow-2xl flex flex-col overflow-hidden text-[#285C3D]">
        {/* Top Bar */}
        <header className="px-5 py-3.5 bg-[#FFFCF7] border-b border-[#E7E8DE] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1F5C43] text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[22px]">clinical_notes</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[16px] md:text-[18px] font-bold text-[#1F5C43] tracking-tight">
                  Bảng Điều Phối Đội An Toàn &amp; Tham Vấn (HITL)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-[#FFF0E1] text-[#A7683F] border border-[#EED3BA]">
                  Demo Hội đồng
                </span>
              </div>
              <p className="text-[11.5px] text-[#756455]">
                Hàng đợi P0/P1/P2 · Phiếu lâm sàng SBAR 15 giây · Giải thích XAI · Sổ cái bất biến SHA-256
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadConsoleData}
              disabled={isLoading}
              className="h-9 px-3 rounded-full border border-[#DCE5D5] bg-white text-[12px] font-semibold text-[#1F5C43] hover:bg-[#E7F1DF] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              <span>Làm mới</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng bảng điều phối"
              className="w-9 h-9 rounded-full border border-[#E7E8DE] bg-white flex items-center justify-center text-[#756455] hover:bg-[#E7F1DF] hover:text-[#1F5C43] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[19px]">close</span>
            </button>
          </div>
        </header>

        {/* SHA-256 Immutable Audit Chain Verification Strip */}
        <div className="px-5 py-2.5 bg-[#E7F1DF]/75 border-b border-[#CFE2CA] flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 text-[12px]">
            <span
              className={`material-symbols-outlined text-[18px] ${
                auditInfo?.valid !== false ? 'text-[#1F5C43]' : 'text-[#ba1a1a]'
              }`}
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {auditInfo?.valid !== false ? 'verified_user' : 'gpp_maybe'}
            </span>
            <span className="font-bold text-[#1F5C43]">
              {auditInfo?.valid !== false
                ? 'SHA-256 Audit Chain Verified'
                : 'Audit Chain Integrity Alert'}
            </span>
            {auditInfo && (
              <span className="text-[11px] text-[#536B5B] font-mono hidden sm:inline">
                ({auditInfo.totalEntries} khối · Hash cuối: {auditInfo.latestHash.slice(0, 14)}…)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleVerifyAudit}
              disabled={isVerifyingAudit}
              className="h-7 px-3 rounded-full bg-[#1F5C43] text-white text-[11px] font-bold flex items-center gap-1 hover:brightness-105 active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">fact_check</span>
              <span>{isVerifyingAudit ? 'Đang băm...' : 'Kiểm tra tính toàn vẹn'}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowAuditLogs((prev) => !prev)}
              className="text-[11.5px] font-bold text-[#1F5C43] hover:underline px-1 cursor-pointer"
            >
              {showAuditLogs ? 'Ẩn nhật ký băm' : 'Xem sổ cái'}
            </button>
          </div>
        </div>

        {/* Expandable SHA-256 Audit Ledger */}
        {showAuditLogs && auditInfo && (
          <div className="px-5 py-3 bg-[#FFFCF7] border-b border-[#E7E8DE] max-h-44 overflow-y-auto space-y-1.5 text-[11px]">
            {auditInfo.recentLogs.map((log) => (
              <div
                key={log.id}
                className="rounded-xl bg-[#FAF7EE] border border-[#E7E8DE] px-3 py-2 flex flex-wrap items-center justify-between gap-2"
              >
                <div>
                  <span className="font-bold text-[#1F5C43]">#{log.id} · {log.eventType}</span>
                  <span className="text-[#756455] ml-2">[{log.actor}]</span>
                  <p className="text-[#4E5E52] mt-0.5">{log.summary}</p>
                </div>
                <div className="font-mono text-[10px] text-[#756455] text-right">
                  <div>prev: {log.prevHash.slice(0, 10)}…</div>
                  <div className="text-[#1F5C43] font-semibold">hash: {log.entryHash.slice(0, 10)}…</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Main Split Console */}
        <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden">
          {/* Left Queue Column */}
          <aside className="w-full md:w-[310px] border-b md:border-b-0 md:border-r border-[#E7E8DE] bg-[#FFFCF7]/70 p-4 flex flex-col shrink-0 md:overflow-y-auto">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[12px] font-bold uppercase tracking-wider text-[#756455]">
                Hàng đợi ca ưu tiên ({filteredEpisodes.length})
              </span>
            </div>

            <div className="flex gap-1.5 mb-3">
              {(['ALL', 'P0', 'P1', 'P2'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setPriorityFilter(tab)}
                  className={`flex-1 py-1.5 rounded-xl text-[11.5px] font-bold border transition-colors cursor-pointer ${
                    priorityFilter === tab
                      ? 'bg-[#1F5C43] text-white border-[#1F5C43]'
                      : 'bg-white text-[#756455] border-[#E7E8DE] hover:bg-[#E7F1DF]/50'
                  }`}
                >
                  {tab === 'ALL' ? 'Tất cả' : tab}
                </button>
              ))}
            </div>

            <div className="space-y-2.5">
              {filteredEpisodes.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#D8DFD3] p-5 text-center text-[12.5px] text-[#756455]">
                  Không có ca cảnh báo nào trong bộ lọc này.
                </div>
              ) : (
                filteredEpisodes.map((ep) => {
                  const isSelected = selectedEpisode?.id === ep.id;
                  const pBadge =
                    ep.priority === 'P0'
                      ? 'bg-[#FFE5DD] text-[#A8381B] border-[#F2B8A7]'
                      : ep.priority === 'P1'
                        ? 'bg-[#FFF0E1] text-[#A7683F] border-[#EED3BA]'
                        : 'bg-[#E7F1DF] text-[#1F5C43] border-[#C6DEC0]';

                  return (
                    <button
                      key={ep.id}
                      type="button"
                      onClick={() => {
                        setSelectedId(ep.id);
                        setCounselorNoteInput(ep.counselorNote || '');
                      }}
                      className={`w-full text-left rounded-2xl p-3.5 border transition-all cursor-pointer space-y-2 ${
                        isSelected
                          ? 'bg-[#E7F1DF]/70 border-[#1F5C43] shadow-xs'
                          : 'bg-white border-[#E7E8DE] hover:bg-[#FAF7EE]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-md text-[10.5px] font-black border ${pBadge}`}>
                            {ep.priority} · {ep.currentTier}
                          </span>
                          <span className="text-[13px] font-bold text-[#1F5C43] font-mono">
                            {ep.pseudonymId}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-[#A7683F] tabular-nums">
                          R={ep.peakRiskScore.toFixed(2)}
                        </span>
                      </div>

                      <p className="text-[11.5px] text-[#5B685F] line-clamp-2 leading-snug">
                        {ep.sbar.situation}
                      </p>

                      <div className="flex items-center justify-between text-[10.5px] text-[#756455]">
                        <span className="font-semibold">{ep.status}</span>
                        {ep.breakGlassActive && (
                          <span className="text-[#A8381B] font-bold flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[13px]">lock_open</span>
                            Break-Glass
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* Right Clinical Detail Pane (SBAR + XAI + Actions + Break-Glass) */}
          <main className="flex-1 p-4 md:p-6 space-y-4 md:overflow-y-auto">
            {!selectedEpisode ? (
              <div className="py-16 text-center text-[13.5px] text-[#756455]">
                Chọn một hồ sơ ca từ hàng đợi bên trái để xem chi tiết phiếu SBAR.
              </div>
            ) : (
              <>
                {/* Case Summary Header */}
                <section className="rounded-[24px] bg-[#FFFCF7] border border-[#DCE6D6] p-4 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[17px] font-black text-[#1F5C43] font-mono">
                        Mã ẩn danh: {selectedEpisode.pseudonymId}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusMeta.badgeClass}`}>
                        {statusMeta.label}
                      </span>
                    </div>
                    <p className="text-[12px] text-[#756455] mt-1">
                      Đỉnh rủi ro ghi nhận:{' '}
                      <strong className="text-[#1F5C43] tabular-nums">
                        {selectedEpisode.peakRiskScore.toFixed(2)} ({selectedEpisode.currentTier})
                      </strong>{' '}
                      · Mặc định ẩn danh tính thật để bảo vệ sinh viên
                    </p>
                  </div>

                  {/* Break-Glass Button for P0/L4 */}
                  {!selectedEpisode.breakGlassActive && (
                    <button
                      type="button"
                      onClick={() => setShowBreakGlassModal(true)}
                      className="h-10 px-4 rounded-full bg-[#FFF0E6] hover:bg-[#FFE3D1] border border-[#E6B299] text-[#9E3B1E] text-[12px] font-bold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[17px]">emergency_home</span>
                      <span>Phá kính khẩn cấp (Break-Glass)</span>
                    </button>
                  )}
                </section>

                {/* Unlocked Emergency Info Card (when Break-Glass is active) */}
                {selectedEpisode.breakGlassActive && selectedEpisode.unlockedEmergencyInfo && (
                  <section className="rounded-[24px] bg-[#FFF5EE] border-2 border-[#E78A45] p-4 space-y-2.5 shadow-sm animate-fade-in">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[13px] font-bold text-[#9E3B1E] flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[18px]">lock_open_right</span>
                        Thông tin liên hệ khẩn cấp đã mở khóa (Break-Glass Protocol Active)
                      </span>
                      {selectedEpisode.breakGlassExpiresAt && (
                        <span className="text-[11px] font-semibold text-[#756455]">
                          Hiệu lực tạm thời (TTL 2h)
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[12.5px]">
                      <div className="rounded-xl bg-white p-3 border border-[#EBD5C3]">
                        <p className="text-[11px] text-[#756455]">Hồ sơ sinh viên</p>
                        <p className="font-bold text-[#1F5C43] mt-0.5">
                          {selectedEpisode.unlockedEmergencyInfo.studentAlias}
                        </p>
                        {selectedEpisode.unlockedEmergencyInfo.coarseLocation && (
                          <p className="text-[11.5px] text-[#756455] mt-1">
                            📍 {selectedEpisode.unlockedEmergencyInfo.coarseLocation}
                          </p>
                        )}
                      </div>

                      <div className="rounded-xl bg-white p-3 border border-[#EBD5C3] space-y-1.5">
                        <p className="text-[11px] text-[#756455]">Người hỗ trợ tin cậy đã đăng ký</p>
                        {selectedEpisode.unlockedEmergencyInfo.trustedContacts.map((tc, idx) => (
                          <div key={idx} className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-[#285C3D] text-[12px]">
                              {tc.name} ({tc.relationship})
                            </span>
                            <a
                              href={`tel:${tc.phone.replace(/\D/g, '') || '115'}`}
                              className="text-[11.5px] font-bold text-[#1F5C43] underline"
                            >
                              {tc.phone}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                    <p className="text-[11px] text-[#756455] italic">
                      * Lưu ý đạo đức: Kể cả khi Phá kính khẩn cấp, toàn bộ nội dung Nhật ký cá nhân mã hóa AES-256-GCM vẫn hoàn toàn bất khả xâm phạm.
                    </p>
                  </section>
                )}

                {/* 15-Second Clinical SBAR Card */}
                <section className="rounded-[24px] bg-[#FFFCF7] border border-[#E7E8DE] p-4 md:p-5 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[14.5px] font-bold text-[#1F5C43] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[19px]">assignment_late</span>
                      Phiếu Bàn Giao Lâm Sàng SBAR (Đọc nhanh 15 giây)
                    </h3>
                    <span className="text-[11px] font-semibold text-[#756455]">
                      Chuẩn bàn giao y khoa
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[12.5px]">
                    <div className="rounded-2xl bg-[#FAF7EE] border border-[#E7E8DE] p-3">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-[#1F5C43] text-white text-[10.5px] font-bold mb-1">
                        S · Situation (Tình huống)
                      </span>
                      <p className="text-[#285C3D] leading-relaxed">
                        {selectedEpisode.sbar.situation}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#FAF7EE] border border-[#E7E8DE] p-3">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-[#487A5E] text-white text-[10.5px] font-bold mb-1">
                        B · Background (Bối cảnh)
                      </span>
                      <p className="text-[#285C3D] leading-relaxed">
                        {selectedEpisode.sbar.background}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#FAF7EE] border border-[#E7E8DE] p-3">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-[#E78A45] text-white text-[10.5px] font-bold mb-1">
                        A · Assessment (Đánh giá)
                      </span>
                      <p className="text-[#285C3D] leading-relaxed">
                        {selectedEpisode.sbar.assessment}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#FAF7EE] border border-[#E7E8DE] p-3">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-[#9E472A] text-white text-[10.5px] font-bold mb-1">
                        R · Recommendation (Khuyến nghị)
                      </span>
                      <p className="text-[#285C3D] leading-relaxed">
                        {selectedEpisode.sbar.recommendation}
                      </p>
                    </div>
                  </div>

                  {selectedEpisode.sbar.evidenceQuotes.length > 0 && (
                    <div className="pt-1 space-y-1.5">
                      <p className="text-[11.5px] font-bold text-[#756455]">
                        Trích dẫn chỉ báo lâm sàng (Đã ẩn thông tin định danh):
                      </p>
                      <div className="space-y-1">
                        {selectedEpisode.sbar.evidenceQuotes.map((q, idx) => (
                          <div
                            key={idx}
                            className="rounded-xl bg-[#FFF8EF] border border-[#EAD8C3] px-3 py-2 text-[12px] text-[#5B4F43] italic"
                          >
                            “{q}”
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>

                {/* XAI Attribution Visualization */}
                <section className="rounded-[24px] bg-[#FFFCF7] border border-[#E7E8DE] p-4 md:p-5 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[14.5px] font-bold text-[#1F5C43] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[19px]">bar_chart_4_bars</span>
                      Giải Thích Trọng Số Rủi Ro (XAI Attribution)
                    </h3>
                    <span className="text-[11px] text-[#756455]">Minh bạch hóa AI</span>
                  </div>

                  <div className="space-y-2.5">
                    {selectedEpisode.attribution.map((attr, idx) => {
                      const pct = Math.min(100, Math.max(8, Math.round(attr.contribution * 100)));
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center justify-between text-[12px]">
                            <span className="font-bold text-[#285C3D]">{attr.factor}</span>
                            <span className="font-mono font-bold text-[#1F5C43]">
                              +{attr.contribution.toFixed(2)} ({pct}%)
                            </span>
                          </div>
                          <div className="h-2.5 w-full rounded-full bg-[#E7E8DE] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[#1F5C43] to-[#E78A45] transition-all duration-300"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <p className="text-[11px] text-[#756455]">{attr.detail}</p>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Counselor Workflow Actions */}
                <section className="rounded-[24px] bg-[#FFFCF7] border border-[#DCE6D6] p-4 md:p-5 space-y-3 shadow-2xs">
                  <h3 className="text-[14px] font-bold text-[#1F5C43] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">task_alt</span>
                    Cập nhật quy trình xử lý ca (HITL State Machine)
                  </h3>

                  <textarea
                    rows={2}
                    value={counselorNoteInput}
                    onChange={(e) => setCounselorNoteInput(e.target.value)}
                    placeholder="Ghi chú bàn giao của chuyên gia tham vấn (ví dụ: Đã gọi xác nhận an toàn, hẹn gặp 14:00 chiều nay)..."
                    className="w-full rounded-2xl border border-[#DCE4D5] bg-[#FAF7EE] px-3.5 py-2.5 text-[12.5px] text-[#285C3D] placeholder:text-[#8E9B92] focus:outline-none focus:border-[#1F5C43]"
                  />

                  {selectedEpisode.status === 'FOLLOW_UP' && (
                    <label className="flex items-center gap-2 text-[12px] text-[#285C3D] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={clearRiskFloor}
                        onChange={(e) => setClearRiskFloor(e.target.checked)}
                        className="rounded border-[#1F5C43] text-[#1F5C43] focus:ring-[#1F5C43]"
                      />
                      <span>
                        Đồng thời gỡ khóa sàn bảo vệ (Step-Down Floor) sau khi xác nhận sinh viên đã ổn định hoàn toàn
                      </span>
                    </label>
                  )}

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {nextTransition ? (
                      <button
                        type="button"
                        onClick={() => handleTransitionStatus(nextTransition.nextKey)}
                        disabled={isUpdatingStatus}
                        className="h-10 px-5 rounded-full bg-[#1F5C43] hover:brightness-105 text-white text-[13px] font-bold flex items-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                      >
                        <span className="material-symbols-outlined text-[17px]">arrow_forward</span>
                        <span>{nextTransition.buttonLabel}</span>
                      </button>
                    ) : (
                      <span className="text-[12.5px] font-bold text-[#1F5C43] bg-[#E7F1DF] px-3.5 py-1.5 rounded-full">
                        ✓ Ca này đã được đóng an toàn (RESOLVED)
                      </span>
                    )}

                    {/* Quick step buttons for demo flexibility */}
                    {STATUS_STEPS.map((st) => {
                      if (st.key === selectedEpisode.status || st.key === nextTransition?.nextKey) {
                        return null;
                      }
                      return (
                        <button
                          key={st.key}
                          type="button"
                          onClick={() => handleTransitionStatus(st.key)}
                          disabled={isUpdatingStatus}
                          className="h-9 px-3 rounded-full border border-[#DCE4D5] bg-white hover:bg-[#FAF7EE] text-[11.5px] font-semibold text-[#756455] hover:text-[#1F5C43] cursor-pointer"
                        >
                          {st.key}
                        </button>
                      );
                    })}
                  </div>
                </section>
              </>
            )}
          </main>
        </div>

        {/* Toast Notification */}
        {statusFeedback && (
          <div className="fixed bottom-5 right-5 z-[95] rounded-2xl bg-[#1F5C43] text-white px-4 py-2.5 text-[12.5px] font-semibold shadow-xl flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span>{statusFeedback}</span>
          </div>
        )}

        {/* Break-Glass Clinical Authorization Modal */}
        {showBreakGlassModal && selectedEpisode && (
          <div className="fixed inset-0 z-[90] bg-black/45 backdrop-blur-xs flex items-center justify-center p-4">
            <form
              onSubmit={handleConfirmBreakGlass}
              className="w-full max-w-[440px] rounded-[28px] bg-[#FFFCF7] border border-[#E7C2A8] p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 text-[#9E3B1E]">
                  <span className="material-symbols-outlined text-[22px]">gpp_maybe</span>
                  <h3 className="text-[16px] font-bold">
                    Giao thức Phá kính Khẩn cấp (Break-Glass)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBreakGlassModal(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#756455] hover:bg-[#FAF7EE]"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              <p className="text-[12.5px] text-[#5B685F] leading-relaxed">
                Chỉ áp dụng cho ca nguy kịch <strong>{selectedEpisode.pseudonymId}</strong> khi cần liên hệ cấp cứu thực tế. Mọi thao tác được băm bất biến vào sổ cái <strong>SHA-256</strong> và tự động thu hồi quyền sau <strong>2 giờ</strong>.
              </p>

              <div className="space-y-2.5">
                <div>
                  <label className="block text-[12px] font-bold text-[#1F5C43] mb-1">
                    Họ tên &amp; Chức danh Chuyên gia trực ca *
                  </label>
                  <input
                    type="text"
                    required
                    value={counselorName}
                    onChange={(e) => setCounselorName(e.target.value)}
                    placeholder="Ví dụ: ThS. Trần Minh Hà — Phòng Tham vấn Sinh viên"
                    className="w-full rounded-xl border border-[#DCE4D5] bg-white px-3.5 py-2 text-[13px] text-[#285C3D] focus:outline-none focus:border-[#1F5C43]"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#1F5C43] mb-1">
                    Lý do lâm sàng bắt buộc *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={clinicalReason}
                    onChange={(e) => setClinicalReason(e.target.value)}
                    placeholder="Nhập căn cứ lâm sàng mở khóa liên hệ khẩn cấp (ví dụ: Tín hiệu C-SSRS mức 4, cần liên hệ người thân xác minh an toàn ngay)..."
                    className="w-full rounded-xl border border-[#DCE4D5] bg-white px-3.5 py-2 text-[13px] text-[#285C3D] focus:outline-none focus:border-[#1F5C43]"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowBreakGlassModal(false)}
                  className="flex-1 h-10 rounded-full border border-[#DCE4D5] bg-white text-[12.5px] font-bold text-[#756455]"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isBreakingGlass || !counselorName.trim() || !clinicalReason.trim()}
                  className="flex-1 h-10 rounded-full bg-[#9E3B1E] hover:brightness-105 text-white text-[12.5px] font-bold shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isBreakingGlass ? 'Đang mở khóa...' : 'Xác nhận & Ghi Audit'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
