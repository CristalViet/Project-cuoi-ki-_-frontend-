import React, { useState } from 'react';
import { MainTab, RiskTier, SubScreen } from '../types';

interface ScreenSwitcherProps {
  currentTab: MainTab;
  currentSub: SubScreen;
  currentRiskTier?: RiskTier;
  onSelectScreen: (tab: MainTab, sub: SubScreen) => void;
  onOpenCounselorTriage?: () => void;
  onOpenCrisisDrawer?: () => void;
}

export const ScreenSwitcherDrawer: React.FC<ScreenSwitcherProps> = ({
  currentTab,
  currentSub,
  currentRiskTier = 'L0',
  onSelectScreen,
  onOpenCounselorTriage,
  onOpenCrisisDrawer,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const screens: {
    id: string;
    tab: MainTab;
    sub: SubScreen;
    name: string;
    imageRef: string;
    icon: string;
  }[] = [
    { id: 'home', tab: 'home', sub: null, name: 'Trang chủ (Dashboard)', imageRef: 'Image 18', icon: 'home' },
    { id: 'journal', tab: 'journal', sub: null, name: 'Nhật ký cá nhân', imageRef: 'Image 8', icon: 'menu_book' },
    { id: 'journal_edit', tab: 'journal', sub: 'journal_edit', name: 'Soạn thảo nhật ký', imageRef: 'Image 2', icon: 'edit_note' },
    { id: 'breathing', tab: 'home', sub: 'breathing', name: 'Hít thở 4-7-8', imageRef: 'Image 4', icon: 'air' },
    { id: 'checkin', tab: 'home', sub: 'checkin', name: 'Check-in cảm xúc', imageRef: 'Image 24', icon: 'favorite' },
    { id: 'ai', tab: 'ai', sub: null, name: 'MindCare AI · Mochi SSE', imageRef: 'Image 22', icon: 'smart_toy' },
    { id: 'sharing', tab: 'home', sub: 'sharing', name: 'Hòm thư Ẩn danh (Kiểm duyệt AI)', imageRef: 'Mailbox', icon: 'mail' },
    { id: 'stats', tab: 'stats', sub: null, name: 'Thống kê & Thấu hiểu', imageRef: 'Image 20', icon: 'bar_chart' },
    { id: 'selfcare', tab: 'home', sub: 'selfcare', name: 'Chăm sóc bản thân', imageRef: 'Image 10', icon: 'spa' },
    { id: 'contacts', tab: 'home', sub: 'contacts', name: 'Người hỗ trợ tin cậy & SOS', imageRef: 'Image 14', icon: 'shield' },
    { id: 'settings', tab: 'home', sub: 'settings', name: 'Cài đặt & Quyền riêng tư', imageRef: 'Image 12', icon: 'settings' },
    { id: 'onboarding', tab: 'home', sub: 'onboarding', name: 'Chào đón & Giới thiệu', imageRef: 'Image 16', icon: 'school' },
  ];

  const tierDotCls: Record<RiskTier, string> = {
    L0: 'bg-[#6EE7B7]',
    L1: 'bg-[#6EE7B7]',
    L2: 'bg-[#FBBF24]',
    L3: 'bg-[#FB923C] animate-pulse',
    L4: 'bg-[#F87171] animate-pulse',
  };

  return (
    <>
      {/* Floating Pill Toggle Button (Bottom-left on Mobile so it never covers top-right headers/actions) */}
      <div className="fixed bottom-[84px] left-3 md:bottom-5 md:right-5 md:left-auto md:top-auto z-[45]">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 md:px-3.5 md:py-2 rounded-full bg-[#1F5C43]/92 hover:bg-[#1F5C43] text-white text-[11px] font-semibold shadow-[0_6px_20px_rgba(31,92,67,0.22)] backdrop-blur-md active:scale-95 transition-all border border-white/20 cursor-pointer"
          type="button"
          aria-label={`Mở bảng điều hướng nhanh và an toàn (${currentRiskTier})`}
          title="Chọn trực tiếp các màn hình & Bảng điều phối Chuyên gia"
        >
          <span className="material-symbols-outlined text-[15px] text-[#DDEBCF]">grid_view</span>
          <span className="hidden sm:inline">Màn hình &amp; An toàn</span>
          <span className="sm:hidden">Màn hình</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-1.5 py-0.5 text-[10px] font-bold tracking-wide">
            <span className={`w-1.5 h-1.5 rounded-full ${tierDotCls[currentRiskTier]}`} />
            {currentRiskTier}
          </span>
        </button>
      </div>

      {/* Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[75] bg-black/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-[350px] bg-surface-card h-full flex flex-col shadow-2xl border-l border-border-subtle overflow-hidden">
            {/* Drawer Header */}
            <div className="p-4 bg-page-background border-b border-border-subtle flex items-center justify-between">
              <div>
                <h3 className="text-[15px] font-bold text-text-primary">
                  Điều hướng nhanh &amp; Demo v2.0
                </h3>
                <p className="text-[11px] text-text-secondary">
                  Khớp trọn bộ thiết kế &amp; Hệ thống Quản lý Rủi ro
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-card border border-border-subtle flex items-center justify-center text-text-secondary hover:text-text-primary"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Special Safety & Counselor Triage Launchers */}
            <div className="p-3 bg-[#FFF8EF] border-b border-border-subtle space-y-2">
              <p className="text-[10.5px] font-bold uppercase tracking-wider text-secondary px-0.5">
                Không gian An toàn &amp; Hội đồng Chuyên gia
              </p>

              {onOpenCounselorTriage && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenCounselorTriage();
                  }}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-primary text-white text-left shadow-xs hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px]">clinical_notes</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[12.5px] font-bold block truncate">
                      Bảng Điều Phối Chuyên Gia (HITL)
                    </span>
                    <span className="text-[10.5px] text-white/80 block truncate">
                      Hàng đợi P0/P1 · SBAR · XAI · SHA-256 Audit
                    </span>
                  </div>
                </button>
              )}

              {onOpenCrisisDrawer && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenCrisisDrawer();
                  }}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-surface-card border border-primary/30 text-primary text-left hover:bg-surface-mint/50 active:scale-[0.99] transition-all cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-surface-mint flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px]">spa</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[12.5px] font-bold block truncate">
                      Phao An Toàn Sơ Cứu WHO PFA
                    </span>
                    <span className="text-[10.5px] text-text-secondary block truncate">
                      115 · 111 · 096 306 1414 · Warm SOS
                    </span>
                  </div>
                </button>
              )}
            </div>

            {/* Screens List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
              {screens.map((s, idx) => {
                const isCurrent =
                  (s.sub === null && currentSub === null && currentTab === s.tab) ||
                  (s.sub !== null && currentSub === s.sub);

                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      onSelectScreen(s.tab, s.sub);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all ${
                      isCurrent
                        ? 'bg-surface-mint border border-primary text-focus-ring font-semibold shadow-2xs'
                        : 'bg-page-background border border-border-subtle/80 text-text-primary hover:bg-surface-mint/30'
                    }`}
                    type="button"
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isCurrent
                          ? 'bg-focus-ring text-white'
                          : 'bg-surface-card text-primary border border-border-subtle'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">{s.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-semibold truncate">{s.name}</span>
                        <span className="text-[10px] text-text-secondary ml-1 shrink-0 font-mono">
                          #{idx + 1}
                        </span>
                      </div>
                      <span className="text-[11px] text-text-secondary block">
                        Khớp: {s.imageRef}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-3 bg-page-background border-t border-border-subtle text-[11px] text-text-secondary text-center">
              Dữ liệu được liên kết và đồng bộ tự động giữa các màn hình.
            </div>
          </div>
        </div>
      )}
    </>
  );
};
