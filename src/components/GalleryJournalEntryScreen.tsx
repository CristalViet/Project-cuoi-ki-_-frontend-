import React from 'react';
import { JournalEntry } from '../types';

interface GalleryJournalEntryScreenProps {
  entry: JournalEntry | null;
  onBack: () => void;
}

export const GalleryJournalEntryScreen: React.FC<GalleryJournalEntryScreenProps> = ({
  entry,
  onBack,
}) => (
  <div className="min-h-[calc(100vh-33px)] md:min-h-screen flex-1 bg-[var(--color-background)] px-4 pb-8 md:px-8 md:pb-12 text-[var(--color-text-primary)]">
    <header className="sticky top-0 z-40 -mx-4 grid grid-cols-[44px_1fr_44px] items-center border-b border-[var(--color-border)] bg-[var(--color-background)]/95 px-3 py-2 backdrop-blur-xl md:mx-auto md:max-w-3xl md:rounded-b-2xl md:border-x md:px-5">
      <button
        onClick={onBack}
        aria-label="Quay lại ảnh"
        className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--color-primary)] hover:bg-[var(--color-surface-mint)]"
        type="button"
      >
        <span className="material-symbols-outlined">arrow_back</span>
      </button>
      <h1 className="text-center text-[16px] font-bold text-[var(--color-primary)]">Nhật ký gốc</h1>
      <div className="h-11 w-11" />
    </header>
    {entry ? (
      <main className="pt-4 md:mx-auto md:max-w-3xl md:pt-6">
        <div className="flex items-center gap-2 text-[10.5px] text-[var(--color-text-secondary)] md:text-[12px]">
          <span className="material-symbols-outlined text-[15px]">calendar_today</span>
          {entry.date} · {entry.time}
        </div>
        {entry.imageUrl && (
          <img
            src={entry.imageUrl}
            alt={entry.title}
            className="mt-4 max-h-72 md:max-h-[420px] w-full rounded-[22px] border border-[var(--color-border)] object-cover"
          />
        )}
        <article className="mt-4 rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 md:p-7">
          <h2 className="text-[20px] font-bold leading-7 text-[var(--color-primary)] md:text-[24px] md:leading-8">{entry.title}</h2>
          <span className="mt-3 inline-flex rounded-full bg-[var(--color-highlight)] px-3 py-1 text-[10px] font-bold text-[var(--color-primary)] md:text-[11.5px]">
            {entry.tag}
          </span>
          <p className="mt-4 whitespace-pre-wrap text-[13px] leading-6 text-[var(--color-text-primary)] md:text-[15px] md:leading-8">{entry.content}</p>
        </article>
      </main>
    ) : (
      <main className="flex min-h-[600px] flex-col items-center justify-center text-center md:mx-auto md:max-w-3xl">
        <span className="material-symbols-outlined text-[34px] text-[var(--color-secondary)]">auto_delete</span>
        <h2 className="mt-3 text-[17px] font-bold text-[var(--color-primary)]">Nhật ký không còn tồn tại</h2>
        <p className="mt-2 text-[11px] text-[var(--color-text-secondary)]">Ảnh này không còn liên kết với một bài nhật ký.</p>
      </main>
    )}
  </div>
);
