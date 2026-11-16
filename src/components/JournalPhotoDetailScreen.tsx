import React, { useRef, useState } from 'react';
import { GalleryPhoto } from '../data/journalGallery';

interface JournalPhotoDetailScreenProps {
  photos: GalleryPhoto[];
  index: number;
  favoriteIds: string[];
  notes: Record<string, string>;
  journalAvailable: boolean;
  onBack: () => void;
  onChangeIndex: (index: number) => void;
  onToggleFavorite: (id: string) => void;
  onSaveNote: (id: string, note: string) => void;
  onOpenJournal: () => void;
}

export const JournalPhotoDetailScreen: React.FC<JournalPhotoDetailScreenProps> = ({
  photos,
  index,
  favoriteIds,
  notes,
  journalAvailable,
  onBack,
  onChangeIndex,
  onToggleFavorite,
  onSaveNote,
  onOpenJournal,
}) => {
  const photo = photos[index];
  const [scale, setScale] = useState(1);
  const [draftNote, setDraftNote] = useState(notes[photo?.id] || '');
  const [editingNote, setEditingNote] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const touchStartX = useRef(0);
  const pinchStart = useRef(0);
  const lastTap = useRef(0);

  if (!photo) {
    return (
      <div className="flex min-h-[calc(100vh-33px)] flex-1 flex-col items-center justify-center bg-[var(--color-background)] px-6 text-center">
        <span className="material-symbols-outlined text-[34px] text-[var(--color-secondary)]">image_not_supported</span>
        <h1 className="mt-3 text-[18px] font-bold text-[var(--color-primary)]">Ảnh không còn tồn tại</h1>
        <button onClick={onBack} className="mt-5 min-h-11 rounded-full bg-[var(--color-primary)] px-5 text-[12px] font-bold text-white" type="button">
          Về thư viện
        </button>
      </div>
    );
  }

  const favorite = favoriteIds.includes(photo.id);
  const setIndex = (next: number) => {
    if (next < 0 || next >= photos.length) return;
    onSaveNote(photo.id, draftNote);
    setScale(1);
    onChangeIndex(next);
    setDraftNote(notes[photos[next].id] || '');
    setEditingNote(false);
  };

  const handleTouchStart = (event: React.TouchEvent) => {
    if (event.touches.length === 2) {
      pinchStart.current = Math.hypot(
        event.touches[0].clientX - event.touches[1].clientX,
        event.touches[0].clientY - event.touches[1].clientY
      );
    } else {
      touchStartX.current = event.touches[0].clientX;
      const now = Date.now();
      if (now - lastTap.current < 280) setScale((current) => (current > 1 ? 1 : 2));
      lastTap.current = now;
    }
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    if (event.touches.length !== 2 || !pinchStart.current) return;
    const distance = Math.hypot(
      event.touches[0].clientX - event.touches[1].clientX,
      event.touches[0].clientY - event.touches[1].clientY
    );
    setScale(Math.min(3, Math.max(1, distance / pinchStart.current)));
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (scale > 1 || !event.changedTouches[0]) return;
    const delta = event.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 55) setIndex(delta < 0 ? index + 1 : index - 1);
  };

  return (
    <div className="min-h-[calc(100vh-33px)] md:min-h-screen flex-1 bg-[var(--color-text-primary)] text-white">
      <header className="sticky top-0 z-40 grid grid-cols-[44px_1fr_44px] items-center bg-[var(--color-text-primary)]/95 px-3 py-2 backdrop-blur-xl md:mx-auto md:max-w-6xl md:px-6">
        <button
          onClick={() => {
            onSaveNote(photo.id, draftNote);
            onBack();
          }}
          aria-label="Quay lại thư viện"
          className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10"
          type="button"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <span className="text-center text-[13px] font-bold tabular-nums">{index + 1} / {photos.length}</span>
        <button
          onClick={() => setShowOptions(true)}
          aria-label="Thêm tùy chọn"
          className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10"
          type="button"
        >
          <span className="material-symbols-outlined">more_horiz</span>
        </button>
      </header>

      <div className="lg:mx-auto lg:grid lg:max-w-6xl lg:grid-cols-12 lg:items-start lg:gap-8 lg:px-6 lg:py-8">
      <div
        className="relative flex h-[52vh] min-h-[390px] max-h-[560px] touch-none items-center justify-center overflow-hidden lg:col-span-7 lg:h-[72vh] lg:max-h-[680px] lg:rounded-[28px] lg:bg-black/25"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={() => setScale((current) => (current > 1 ? 1 : 2))}
      >
        {index > 0 && (
          <button
            onClick={() => setIndex(index - 1)}
            aria-label="Ảnh trước"
            className="hidden md:flex absolute left-3 top-1/2 z-10 h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white hover:bg-black/65 transition"
            type="button"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
        )}
        <img
          src={photo.src}
          alt={photo.alt}
          draggable={false}
          className="max-h-full w-full select-none object-contain transition-transform duration-200 motion-reduce:transition-none"
          style={{ transform: `scale(${scale})` }}
        />
        {index < photos.length - 1 && (
          <button
            onClick={() => setIndex(index + 1)}
            aria-label="Ảnh tiếp theo"
            className="hidden md:flex absolute right-3 top-1/2 z-10 h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white hover:bg-black/65 transition"
            type="button"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        )}
      </div>

      <section className="min-h-[360px] rounded-t-[28px] bg-[var(--color-background)] px-4 pb-8 pt-5 text-[var(--color-text-primary)] lg:col-span-5 lg:min-h-0 lg:rounded-[28px] lg:p-6 lg:shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-[20px] font-bold leading-7 text-[var(--color-text-primary)]">{photo.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[10.5px] text-[var(--color-text-secondary)]">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">calendar_today</span>
                {photo.dateLabel}
              </span>
              <span className="rounded-full bg-[var(--color-highlight)] px-2.5 py-1 font-bold text-[var(--color-primary)]">
                {photo.mood}
              </span>
            </div>
          </div>
          <button
            onClick={() => onToggleFavorite(photo.id)}
            aria-label={favorite ? 'Bỏ khỏi yêu thích' : 'Thêm vào yêu thích'}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#E66F5D] shadow-sm active:scale-95"
            type="button"
          >
            <span className={`material-symbols-outlined text-[24px] ${favorite ? 'filled' : ''}`}>favorite</span>
          </button>
        </div>

        <div className="mt-5 rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-[12px] font-bold text-[var(--color-primary)]">
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Lời nhắn của mình
            </h2>
            <button
              onClick={() => setEditingNote((current) => !current)}
              className="min-h-10 rounded-full px-3 text-[10px] font-bold text-[var(--color-primary)]"
              type="button"
            >
              {editingNote ? 'Xong' : draftNote ? 'Chỉnh sửa' : 'Thêm'}
            </button>
          </div>
          {editingNote ? (
            <textarea
              value={draftNote}
              onChange={(event) => setDraftNote(event.target.value)}
              onBlur={() => onSaveNote(photo.id, draftNote)}
              placeholder="Viết một lời nhắn riêng cho khoảnh khắc này..."
              className="mt-2 min-h-24 w-full resize-none rounded-xl border border-[var(--color-border)] bg-white p-3 text-[11px] leading-5 outline-none focus:border-[var(--color-secondary)]"
              autoFocus
            />
          ) : (
            <p className="mt-2 text-[11px] leading-5 text-[var(--color-text-secondary)]">
              {draftNote || 'Bạn có thể lưu một suy nghĩ riêng cho ảnh này. Lời nhắn không thay đổi nội dung nhật ký gốc.'}
            </p>
          )}
        </div>

        <button
          onClick={onOpenJournal}
          disabled={!journalAvailable}
          className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--color-highlight)] text-[12px] font-bold text-[var(--color-primary)] active:scale-[0.99] disabled:bg-[#E6E6E1] disabled:text-[var(--color-text-secondary)]"
          type="button"
        >
          <span className="material-symbols-outlined text-[19px]">menu_book</span>
          {journalAvailable ? 'Xem nhật ký gốc' : 'Nhật ký gốc không còn tồn tại'}
          {journalAvailable && <span className="material-symbols-outlined text-[18px]">chevron_right</span>}
        </button>
        <p className="mt-3 text-center text-[9px] text-[var(--color-text-secondary)]">
          Ảnh kế thừa quyền riêng tư của nhật ký và không được tự động chia sẻ.
        </p>
      </section>
      </div>

      {showOptions && (
        <>
          <button
            onClick={() => setShowOptions(false)}
            aria-label="Đóng tùy chọn ảnh"
            className="fixed inset-0 z-50 bg-black/35"
            type="button"
          />
          <section className="fixed bottom-0 left-1/2 z-[51] w-full max-w-[420px] -translate-x-1/2 rounded-t-[26px] bg-[var(--color-surface)] p-4 text-[var(--color-text-primary)] shadow-2xl md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:max-w-md md:rounded-[26px] md:p-6">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[var(--color-border)] md:hidden" />
            <h2 className="text-[14px] font-bold text-[var(--color-primary)]">Thông tin ảnh</h2>
            <div className="mt-3 flex items-start gap-3 rounded-2xl bg-[var(--color-chart-background)] p-3">
              <span className="material-symbols-outlined text-[18px] text-[var(--color-primary)]">shield_lock</span>
              <p className="text-[10px] leading-4 text-[var(--color-text-secondary)]">
                Ảnh thuộc nhật ký riêng tư của bạn, không được tự động đăng lên Góc sẻ chia và
                không được phân tích bằng AI khi chưa có sự đồng ý.
              </p>
            </div>
            <button
              onClick={() => setShowOptions(false)}
              className="mt-4 min-h-11 w-full rounded-full border border-[#B8CCB6] text-[11px] font-bold text-[var(--color-primary)]"
              type="button"
            >
              Đóng
            </button>
          </section>
        </>
      )}
    </div>
  );
};
