import React, { useEffect, useRef } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

interface PwaUpdatePromptProps {
  /** True while the user is writing a journal, check-in, anonymous letter, or chatting with AI */
  isComposing: boolean;
}

export const PwaUpdatePrompt: React.FC<PwaUpdatePromptProps> = ({ isComposing }) => {
  const intervalRef = useRef<number | null>(null);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;
      // Periodically check for a new version without forcing any reload
      intervalRef.current = window.setInterval(() => {
        if (!navigator.onLine) return;
        registration.update().catch(() => {
          // Ignore transient network errors during background update check
        });
      }, 60 * 60 * 1000);
    },
  });

  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Never prompt or reload while the user is actively writing or composing
  if (!needRefresh || isComposing) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-[max(5.5rem,calc(env(safe-area-inset-bottom)+4.75rem))] md:bottom-6 right-4 left-4 md:left-auto md:w-[360px] z-[60] rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-md p-4 shadow-[0_12px_36px_rgba(31,92,67,0.16)]"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-mint)] text-[var(--color-primary)]">
          <span className="material-symbols-outlined text-[20px]">system_update</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-bold text-[var(--color-primary)]">
            Đã có phiên bản MindCare mới
          </p>
          <p className="mt-0.5 text-[12px] leading-relaxed text-[var(--color-text-secondary)]">
            Cập nhật để nhận các cải tiến mới nhất mà không ảnh hưởng dữ liệu của bạn.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => updateServiceWorker(true)}
              className="rounded-full bg-[var(--color-primary)] px-4 py-1.5 text-[12px] font-bold text-white transition hover:opacity-95 active:scale-95 cursor-pointer"
            >
              Cập nhật ngay
            </button>
            <button
              type="button"
              onClick={() => setNeedRefresh(false)}
              className="rounded-full bg-[var(--color-surface-mint)] px-3.5 py-1.5 text-[12px] font-semibold text-[var(--color-primary)] transition hover:brightness-95 active:scale-95 cursor-pointer"
            >
              Để sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
