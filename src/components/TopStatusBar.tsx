import React from 'react';

export const TopStatusBar: React.FC = () => {
  return (
    <div className="md:hidden w-full pt-2.5 px-5 pb-1 flex justify-between items-center z-30 shrink-0 select-none bg-page-background text-text-primary text-[13px] font-semibold">
      <span>09:41</span>
      <div className="flex items-center gap-1.5">
        <span className="material-symbols-outlined text-[15px]">signal_cellular_4_bar</span>
        <span className="material-symbols-outlined text-[15px]">wifi</span>
        <span className="material-symbols-outlined text-[17px]">battery_full</span>
      </div>
    </div>
  );
};
