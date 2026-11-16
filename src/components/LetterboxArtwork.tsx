import React from 'react';

export const LetterboxArtwork: React.FC<{
  compact?: boolean;
  className?: string;
}> = ({ compact = false, className = '' }) => (
  <div
    className={`relative overflow-hidden ${compact ? 'h-[72px]' : 'h-[132px]'} ${className}`}
    aria-hidden="true"
  >
    <div className="absolute bottom-0 left-0 right-0 h-[42%] rounded-[50%_50%_0_0] bg-[var(--color-highlight)]" />
    <span className="material-symbols-outlined absolute bottom-1 left-2 text-[#7CAA78]">
      psychiatry
    </span>
    <span className="material-symbols-outlined absolute bottom-0 right-1 text-[#9CC491]">
      local_florist
    </span>
    <img
      src="/assets/MindCare_2D_Assets/characters/mochi_happy.png"
      alt=""
      className={`absolute bottom-0 left-[8%] object-contain [image-rendering:pixelated] ${
        compact ? 'h-[58px] w-[58px]' : 'h-[104px] w-[104px]'
      }`}
    />
    <div
      className={`absolute bottom-[8%] right-[8%] rounded-t-[45%] rounded-b-lg border-[3px] border-[#8A5F48] bg-[#EFAF8E] shadow-sm ${
        compact ? 'h-[45px] w-[52px]' : 'h-[78px] w-[92px]'
      }`}
    >
      <div className="absolute left-1/2 top-[43%] h-[4px] w-[75%] -translate-x-1/2 rounded-full bg-[#8A5F48]" />
      <span className="material-symbols-outlined filled absolute right-1 top-1 text-[12px] text-[#FFF4E8]">
        favorite
      </span>
      <div className="absolute -left-3 top-[44%] h-[27%] w-[38%] -rotate-6 rounded-sm border border-[#CDAA83] bg-[#FFF9EB] shadow-sm">
        <span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-[11px] text-[#C98967]">
          mail
        </span>
      </div>
    </div>
    <div className="absolute bottom-0 right-[22%] h-[23%] w-[5px] rounded-b bg-[#8A5F48]" />
  </div>
);

export const HeartEnvelopeArtwork: React.FC<{ className?: string }> = ({
  className = '',
}) => (
  <div className={`relative ${className}`} aria-hidden="true">
    <span className="material-symbols-outlined absolute left-0 top-2 text-[25px] text-[#82AA7D]">
      eco
    </span>
    <span className="material-symbols-outlined absolute bottom-0 right-0 text-[23px] text-[#A7C89D]">
      psychiatry
    </span>
    <div className="absolute left-1/2 top-1/2 flex h-[42px] w-[58px] -translate-x-1/2 -translate-y-1/2 -rotate-6 items-center justify-center rounded-md border-2 border-[#8AAF83] bg-[#FFF9EB] shadow-sm">
      <span className="material-symbols-outlined filled text-[18px] text-[#E58B79]">favorite</span>
    </div>
  </div>
);
