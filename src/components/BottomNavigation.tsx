import React from 'react';
import { MainTab } from '../types';

interface BottomNavProps {
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  onFloatingAdd?: () => void;
}

export const BottomNavigation: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  onFloatingAdd,
}) => {
  return (
    <nav
      aria-label="Thanh điều hướng chính"
      className="md:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] z-40 flex justify-between items-center px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-[var(--color-surface)]/95 backdrop-blur-md border-t border-[var(--color-border)] shadow-[0_-2px_12px_rgba(31,92,67,0.04)]"
    >
      {/* 1. Trang chủ */}
      <button
        onClick={() => onTabChange('home')}
        className="flex flex-col items-center justify-center min-w-[64px] min-h-[46px] transition-all duration-150 active:scale-95 cursor-pointer"
        type="button"
      >
        {activeTab === 'home' ? (
          <div className="w-14 h-8 rounded-full bg-[var(--color-highlight)] flex items-center justify-center text-[var(--color-primary)] transition-all shadow-2xs">
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 500" }}
            >
              home
            </span>
          </div>
        ) : (
          <div className="w-14 h-8 flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-all">
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}
            >
              home
            </span>
          </div>
        )}
        <span
          className={`text-[11.5px] leading-tight mt-0.5 tracking-tight ${
            activeTab === 'home' ? 'text-[var(--color-primary)] font-bold' : 'text-[var(--color-text-secondary)] font-medium'
          }`}
        >
          Hôm nay
        </span>
      </button>

      {/* 2. Nhật ký */}
      <button
        onClick={() => onTabChange('journal')}
        className="flex flex-col items-center justify-center min-w-[64px] min-h-[46px] transition-all duration-150 active:scale-95 cursor-pointer"
        type="button"
      >
        {activeTab === 'journal' ? (
          <div className="w-14 h-8 rounded-full bg-[var(--color-highlight)] flex items-center justify-center text-[var(--color-primary)] transition-all shadow-2xs">
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 500" }}
            >
              menu_book
            </span>
          </div>
        ) : (
          <div className="w-14 h-8 flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-all">
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}
            >
              menu_book
            </span>
          </div>
        )}
        <span
          className={`text-[11.5px] leading-tight mt-0.5 tracking-tight ${
            activeTab === 'journal' ? 'text-[var(--color-primary)] font-bold' : 'text-[var(--color-text-secondary)] font-medium'
          }`}
        >
          Nhật ký
        </span>
      </button>

      {/* CENTER FLOATING ACTION BUTTON (+) */}
      <div className="relative -top-2 flex min-w-[54px] flex-col items-center">
        <button
          onClick={onFloatingAdd}
          aria-label="Tạo nhật ký mới"
          title="Viết nhật ký mới"
          type="button"
          className="w-13 h-13 rounded-full bg-[var(--color-primary)] hover:bg-[var(--color-primary)] active:scale-95 text-white flex items-center justify-center shadow-[0_4px_16px_rgba(31,92,67,0.32)] transition-all cursor-pointer ring-4 ring-[var(--color-background)]"
        >
          <span className="material-symbols-outlined text-[26px] font-bold">add</span>
        </button>
        <span className="mt-0.5 text-[11px] font-bold leading-tight text-[var(--color-primary)]">Thêm</span>
      </div>

      {/* 3. Trợ lý AI */}
      <button
        onClick={() => onTabChange('ai')}
        className="flex flex-col items-center justify-center min-w-[64px] min-h-[46px] transition-all duration-150 active:scale-95 cursor-pointer"
        type="button"
      >
        {activeTab === 'ai' ? (
          <div className="w-14 h-8 rounded-full bg-[var(--color-highlight)] flex items-center justify-center text-[var(--color-primary)] transition-all shadow-2xs">
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 500" }}
            >
              chat_bubble_outline
            </span>
          </div>
        ) : (
          <div className="w-14 h-8 flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-all">
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}
            >
              chat_bubble_outline
            </span>
          </div>
        )}
        <span
          className={`text-[11.5px] leading-tight mt-0.5 tracking-tight ${
            activeTab === 'ai' ? 'text-[var(--color-primary)] font-bold' : 'text-[var(--color-text-secondary)] font-medium'
          }`}
        >
          Tâm sự
        </span>
      </button>

      {/* 4. Thống kê */}
      <button
        onClick={() => onTabChange('stats')}
        className="flex flex-col items-center justify-center min-w-[64px] min-h-[46px] transition-all duration-150 active:scale-95 cursor-pointer"
        type="button"
      >
        {activeTab === 'stats' ? (
          <div className="w-14 h-8 rounded-full bg-[var(--color-highlight)] flex items-center justify-center text-[var(--color-primary)] transition-all shadow-2xs">
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 500" }}
            >
              bar_chart
            </span>
          </div>
        ) : (
          <div className="w-14 h-8 flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-all">
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}
            >
              bar_chart
            </span>
          </div>
        )}
        <span
          className={`text-[11.5px] leading-tight mt-0.5 tracking-tight ${
            activeTab === 'stats' ? 'text-[var(--color-primary)] font-bold' : 'text-[var(--color-text-secondary)] font-medium'
          }`}
        >
          Thống kê
        </span>
      </button>
    </nav>
  );
};
