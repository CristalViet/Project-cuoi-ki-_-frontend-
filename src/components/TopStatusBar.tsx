import React, { useState, useEffect } from 'react';

function getFormattedLocalTime(): string {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

export const TopStatusBar: React.FC = () => {
  const [timeStr, setTimeStr] = useState<string>(getFormattedLocalTime);
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const updateClock = () => setTimeStr(getFormattedLocalTime());
    const timer = window.setInterval(updateClock, 15000);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="md:hidden w-full pt-[max(0.5rem,env(safe-area-inset-top))] px-5 pb-1 flex justify-between items-center z-30 shrink-0 select-none bg-page-background text-text-secondary text-[12px] font-medium">
      <span className="tabular-nums font-semibold text-text-primary">{timeStr}</span>
      <div className="inline-flex items-center gap-1.5 rounded-full bg-surface-card/80 border border-border-subtle px-2.5 py-0.5 text-[10.5px] font-semibold text-text-secondary">
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isOnline ? 'bg-[#10B981]' : 'bg-[#F59E0B]'
          }`}
        />
        <span>{isOnline ? 'MindCare · Đã mã hóa' : 'PWA Ngoại tuyến'}</span>
      </div>
    </div>
  );
};
