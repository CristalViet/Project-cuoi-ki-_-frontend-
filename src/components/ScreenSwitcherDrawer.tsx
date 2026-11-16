import React, { useState } from 'react';
import { MainTab, SubScreen } from '../types';

interface ScreenSwitcherProps {
  currentTab: MainTab;
  currentSub: SubScreen;
  onSelectScreen: (tab: MainTab, sub: SubScreen) => void;
}

export const ScreenSwitcherDrawer: React.FC<ScreenSwitcherProps> = ({
  currentTab,
  currentSub,
  onSelectScreen,
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
    { id: 'ai', tab: 'ai', sub: null, name: 'MindCare AI', imageRef: 'Image 22', icon: 'smart_toy' },
    { id: 'stats', tab: 'stats', sub: null, name: 'Thống kê & Thấu hiểu', imageRef: 'Image 20', icon: 'bar_chart' },
    { id: 'selfcare', tab: 'home', sub: 'selfcare', name: 'Chăm sóc bản thân', imageRef: 'Image 10', icon: 'spa' },
    { id: 'contacts', tab: 'home', sub: 'contacts', name: 'Người hỗ trợ tin cậy & SOS', imageRef: 'Image 14', icon: 'shield' },
    { id: 'settings', tab: 'home', sub: 'settings', name: 'Cài đặt & Quyền riêng tư', imageRef: 'Image 12', icon: 'settings' },
    { id: 'onboarding', tab: 'home', sub: 'onboarding', name: 'Chào đón & Giới thiệu', imageRef: 'Image 16', icon: 'school' },
  ];

  return (
    <>
      {/* Floating Pill Toggle Button */}
      <div className="fixed top-2 right-2 md:top-auto md:bottom-5 md:right-5 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-focus-ring/90 hover:bg-focus-ring text-white text-[11px] font-semibold shadow-lg backdrop-blur-md active:scale-95 transition-all border border-white/20"
          type="button"
          title="Chọn trực tiếp 1 trong 11 màn hình thiết kế"
        >
          <span className="material-symbols-outlined text-[15px]">grid_view</span>
          <span>11 Màn hình</span>
          <span className="w-1.5 h-1.5 rounded-full bg-primary-fixed"></span>
        </button>
      </div>

      {/* Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-[340px] bg-surface-card h-full flex flex-col shadow-2xl border-l border-border-subtle overflow-hidden">
            {/* Drawer Header */}
            <div className="p-4 bg-page-background border-b border-border-subtle flex items-center justify-between">
              <div>
                <h3 className="text-[15px] font-bold text-text-primary">Khám phá 11 Màn hình</h3>
                <p className="text-[11px] text-text-secondary">Khớp trọn bộ thiết kế MINDCARE</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-card border border-border-subtle flex items-center justify-center text-text-secondary hover:text-text-primary"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
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
                        isCurrent ? 'bg-focus-ring text-white' : 'bg-surface-card text-primary border border-border-subtle'
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
