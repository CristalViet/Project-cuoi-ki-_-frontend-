import React from 'react';
import { MainTab, SubScreen } from '../types';
import { MindCareBrandLogo } from './MochiIllustrations';

interface DesktopSidebarProps {
  activeTab: MainTab;
  subScreen: SubScreen;
  currentStreak: number;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onSelectTab: (tab: MainTab) => void;
  onOpenSubScreen: (sub: SubScreen) => void;
  onQuickAdd: () => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  activeTab,
  subScreen,
  currentStreak,
  collapsed,
  onToggleCollapse,
  onSelectTab,
  onOpenSubScreen,
  onQuickAdd,
}) => {
  const isTabActive = (tab: MainTab) =>
    activeTab === tab &&
    (subScreen === null ||
      (tab === 'journal' &&
        (subScreen === 'journal_edit' ||
          subScreen === 'journal_gallery' ||
          subScreen === 'journal_photo' ||
          subScreen === 'gallery_journal')));

  const primaryItems: {
    id: string;
    label: string;
    icon: string;
    active: boolean;
    onClick: () => void;
  }[] = [
    {
      id: 'home',
      label: 'Trang chủ',
      icon: 'home',
      active: isTabActive('home'),
      onClick: () => onSelectTab('home'),
    },
    {
      id: 'journal',
      label: 'Nhật ký',
      icon: 'menu_book',
      active: isTabActive('journal'),
      onClick: () => onSelectTab('journal'),
    },
    {
      id: 'stats',
      label: 'Thống kê',
      icon: 'bar_chart',
      active: isTabActive('stats'),
      onClick: () => onSelectTab('stats'),
    },
    {
      id: 'ai',
      label: 'Tâm sự với AI',
      icon: 'chat_bubble_outline',
      active: isTabActive('ai'),
      onClick: () => onSelectTab('ai'),
    },
    {
      id: 'sharing',
      label: 'Góc sẻ chia',
      icon: 'mail',
      active: subScreen === 'sharing',
      onClick: () => onOpenSubScreen('sharing'),
    },
  ];

  const spaceItems: {
    id: SubScreen;
    label: string;
    icon: string;
  }[] = [
    { id: 'selfcare', label: 'Chăm sóc', icon: 'spa' },
    { id: 'contacts', label: 'Người tin cậy', icon: 'shield' },
  ];

  return (
    <aside
      aria-label="Điều hướng ứng dụng MindCare"
      className={`hidden md:flex flex-col sticky top-0 h-screen shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-md z-30 transition-[width] duration-200 select-none ${
        collapsed ? 'w-[78px]' : 'w-[252px]'
      }`}
    >
      {/* Top Brand + Collapse Button */}
      <div
        className={`flex items-center border-b border-[var(--color-border)]/70 px-3.5 py-4 ${
          collapsed ? 'justify-center' : 'justify-between'
        }`}
      >
        {!collapsed ? (
          <button
            onClick={() => onSelectTab('home')}
            type="button"
            className="flex items-center rounded-xl py-1 pr-2 text-left transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          >
            <MindCareBrandLogo size={24} />
          </button>
        ) : (
          <button
            onClick={() => onSelectTab('home')}
            type="button"
            aria-label="Trang chủ MindCare"
            title="MindCare"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-highlight)] text-[var(--color-primary)] transition hover:brightness-95"
          >
            <span className="material-symbols-outlined filled text-[20px]">eco</span>
          </button>
        )}

        {!collapsed && (
          <button
            onClick={onToggleCollapse}
            type="button"
            aria-label="Thu gọn thanh bên"
            title="Thu gọn thanh bên"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--color-text-secondary)] transition hover:bg-[var(--color-surface-mint)] hover:text-[var(--color-primary)]"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>
        )}
      </div>

      {/* Expand Trigger when collapsed */}
      {collapsed && (
        <div className="flex justify-center pt-2.5">
          <button
            onClick={onToggleCollapse}
            type="button"
            aria-label="Mở rộng thanh bên"
            title="Mở rộng thanh bên"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--color-text-secondary)] transition hover:bg-[var(--color-surface-mint)] hover:text-[var(--color-primary)]"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>
        </div>
      )}

      {/* Quick Action CTA */}
      <div className="px-3 pt-4 pb-2">
        <button
          onClick={onQuickAdd}
          type="button"
          title="Tạo check-in hoặc viết nhật ký"
          className={`flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-primary)] text-white font-bold text-[13.5px] shadow-[0_6px_16px_rgba(31,92,67,0.2)] transition hover:brightness-105 active:scale-[0.98] whitespace-nowrap ${
            collapsed ? 'h-11 px-0' : 'h-11 px-4'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          {!collapsed && <span>Tạo mới</span>}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1 no-scrollbar">
        {!collapsed && (
          <p className="px-2.5 pb-1 text-[10.5px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]/80">
            Chính
          </p>
        )}
        {primaryItems.map((item) => (
          <button
            key={item.id}
            onClick={item.onClick}
            type="button"
            title={collapsed ? item.label : undefined}
            aria-current={item.active ? 'page' : undefined}
            className={`group flex w-full items-center gap-3 rounded-2xl transition whitespace-nowrap ${
              collapsed ? 'justify-center h-11 px-0' : 'px-3 py-2.5 text-left'
            } ${
              item.active
                ? 'bg-[var(--color-highlight)] text-[var(--color-primary)] font-bold shadow-[inset_0_0_0_1px_rgba(31,92,67,0.12)]'
                : 'text-[var(--color-text-secondary)] font-medium hover:bg-[var(--color-surface-mint)]/60 hover:text-[var(--color-primary)]'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[21px] shrink-0 ${
                item.active ? 'filled text-[var(--color-primary)]' : ''
              }`}
            >
              {item.icon}
            </span>
            {!collapsed && <span className="truncate text-[13.5px]">{item.label}</span>}
          </button>
        ))}

        <div className="my-3 h-px bg-[var(--color-border)]/70" />

        {!collapsed && (
          <p className="px-2.5 pb-1 text-[10.5px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]/80">
            Không gian thư giãn
          </p>
        )}
        {spaceItems.map((item) => {
          const active =
            subScreen === item.id ||
            (item.id === 'contacts' && subScreen === 'add_contact');
          return (
            <button
              key={item.id}
              onClick={() => onOpenSubScreen(item.id)}
              type="button"
              title={collapsed ? item.label : undefined}
              aria-current={active ? 'page' : undefined}
              className={`group flex w-full items-center gap-3 rounded-2xl transition whitespace-nowrap ${
                collapsed ? 'justify-center h-11 px-0' : 'px-3 py-2.5 text-left'
              } ${
                active
                  ? 'bg-[var(--color-highlight)] text-[var(--color-primary)] font-bold shadow-[inset_0_0_0_1px_rgba(31,92,67,0.12)]'
                  : 'text-[var(--color-text-secondary)] font-medium hover:bg-[var(--color-surface-mint)]/60 hover:text-[var(--color-primary)]'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[20px] shrink-0 ${
                  active ? 'filled text-[var(--color-primary)]' : ''
                }`}
              >
                {item.icon}
              </span>
              {!collapsed && <span className="truncate text-[13.5px]">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom Settings & Profile */}
      <div className="border-t border-[var(--color-border)]/70 p-3 space-y-2">
        {!collapsed && (
          <button
            onClick={() => onOpenSubScreen('streak_details')}
            type="button"
            className="flex w-full items-center justify-between rounded-2xl bg-[var(--color-chart-background)] border border-[var(--color-border)] px-3 py-2 text-left transition hover:bg-[var(--color-surface-mint)]"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined filled text-[18px] text-[var(--color-secondary)]">
                local_fire_department
              </span>
              <span className="text-[12px] font-semibold text-[var(--color-text-primary)] truncate">
                Chuỗi viết
              </span>
            </div>
            <span className="text-[12px] font-bold text-[var(--color-primary)] tabular-nums shrink-0">
              {currentStreak} ngày
            </span>
          </button>
        )}

        <button
          onClick={() => onOpenSubScreen('settings')}
          type="button"
          title={collapsed ? 'Cài đặt' : undefined}
          aria-current={subScreen === 'settings' ? 'page' : undefined}
          className={`flex w-full items-center gap-3 rounded-2xl transition whitespace-nowrap ${
            collapsed ? 'justify-center h-11 px-0' : 'px-3 py-2.5 text-left'
          } ${
            subScreen === 'settings'
              ? 'bg-[var(--color-highlight)] text-[var(--color-primary)] font-bold'
              : 'text-[var(--color-text-secondary)] font-medium hover:bg-[var(--color-surface-mint)]/60 hover:text-[var(--color-primary)]'
          }`}
        >
          <span
            className={`material-symbols-outlined text-[21px] shrink-0 ${
              subScreen === 'settings' ? 'filled text-[var(--color-primary)]' : ''
            }`}
          >
            settings
          </span>
          {!collapsed && <span className="truncate text-[13.5px]">Cài đặt</span>}
        </button>

        {!collapsed && (
          <button
            onClick={() => onOpenSubScreen('settings')}
            type="button"
            className="flex w-full items-center gap-2.5 rounded-2xl px-2 py-1.5 text-left transition hover:bg-[var(--color-chart-background)]"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#C8DAC4] bg-[var(--color-highlight)] text-[12px] font-bold text-[var(--color-primary)]">
              M
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-bold text-[var(--color-text-primary)]">
                Minh Nguyễn
              </p>
              <p className="truncate text-[10.5px] text-[var(--color-text-secondary)]">
                Sinh viên năm 3
              </p>
            </div>
          </button>
        )}
      </div>
    </aside>
  );
};
