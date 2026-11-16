import React, { useMemo, useState } from 'react';
import { GalleryPhoto } from '../data/journalGallery';

interface JournalGalleryScreenProps {
  photos: GalleryPhoto[];
  favoriteIds: string[];
  onToggleFavorite: (id: string) => void;
  onBack: () => void;
  onOpenPhoto: (index: number) => void;
  onWriteJournal: () => void;
}

export const JournalGalleryScreen: React.FC<JournalGalleryScreenProps> = ({
  photos,
  favoriteIds,
  onToggleFavorite,
  onBack,
  onOpenPhoto,
  onWriteJournal,
}) => {
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');
  const filtered = filter === 'all' ? photos : photos.filter((photo) => favoriteIds.includes(photo.id));
  const grouped = useMemo(() => {
    const groups = new Map<string, GalleryPhoto[]>();
    filtered.forEach((photo) => {
      groups.set(photo.monthLabel, [...(groups.get(photo.monthLabel) || []), photo]);
    });
    return Array.from(groups.entries());
  }, [filtered]);
  const photoDays = new Set(photos.map((photo) => photo.dateKey)).size;
  const favoriteCount = photos.filter((photo) => favoriteIds.includes(photo.id)).length;

  return (
    <div className="min-h-[calc(100vh-33px)] md:min-h-screen flex-1 bg-[var(--color-background)] px-4 pb-8 md:px-8 md:pb-12 text-[var(--color-text-primary)]">
      <header className="sticky top-0 z-40 -mx-4 grid grid-cols-[44px_1fr_44px] items-center border-b border-[var(--color-border)] bg-[var(--color-background)]/95 px-3 py-2 shadow-[0_2px_10px_rgba(31,92,67,0.04)] backdrop-blur-xl md:mx-auto md:max-w-6xl md:rounded-b-2xl md:border-x md:px-5">
        <button
          onClick={onBack}
          aria-label="Quay lại Nhật ký"
          className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--color-primary)] hover:bg-[var(--color-surface-mint)] active:scale-95"
          type="button"
        >
          <span className="material-symbols-outlined text-[21px]">arrow_back</span>
        </button>
        <h1 className="text-center text-[17px] font-bold text-[var(--color-primary)]">Thư viện ảnh</h1>
        <div className="h-11 w-11" />
      </header>

      {photos.length === 0 ? (
        <main className="flex min-h-[650px] flex-col items-center justify-center px-5 text-center md:mx-auto md:max-w-4xl">
          <img
            src="/assets/MindCare_2D_Assets/characters/mochi_think.png"
            alt="Mochi đang chờ những kỷ niệm mới"
            className="h-36 w-36 object-contain [image-rendering:pixelated]"
          />
          <h2 className="mt-4 text-[20px] font-bold text-[var(--color-primary)]">Chưa có hình ảnh nào</h2>
          <p className="mt-2 max-w-[280px] text-[11.5px] leading-5 text-[var(--color-text-secondary)]">
            Ảnh bạn thêm vào nhật ký sẽ xuất hiện tại đây.
          </p>
          <button
            onClick={onWriteJournal}
            className="mt-6 min-h-12 rounded-full bg-[var(--color-primary)] px-6 text-[12px] font-bold text-white active:scale-95"
            type="button"
          >
            Viết nhật ký
          </button>
        </main>
      ) : (
        <main className="pt-4 md:mx-auto md:max-w-6xl md:pt-6">
          <section>
            <h2 className="text-[22px] font-bold leading-7 text-[var(--color-primary)] md:text-[26px]">
              Những khoảnh khắc của bạn
            </h2>
            <p className="mt-1 text-[11.5px] leading-5 text-[var(--color-text-secondary)] md:text-[13.5px]">
              Lưu giữ những kỷ niệm qua từng trang nhật ký.
            </p>
          </section>

          <section className="mt-4 grid grid-cols-3 gap-2.5 md:max-w-xl md:gap-4">
            {[
              { icon: 'photo_library', value: photos.length, label: 'Hình ảnh', accent: 'var(--color-primary)' },
              { icon: 'calendar_month', value: photoDays, label: 'Ngày có ảnh', accent: 'var(--color-primary)' },
              { icon: 'favorite', value: favoriteCount, label: 'Yêu thích', accent: '#E66F5D' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-3 text-center shadow-[0_2px_8px_rgba(31,92,67,0.04)]"
              >
                <span className="material-symbols-outlined text-[20px]" style={{ color: stat.accent }}>
                  {stat.icon}
                </span>
                <p className="mt-1 text-[18px] font-bold text-[var(--color-text-primary)] tabular-nums">{stat.value}</p>
                <p className="text-[9.5px] text-[var(--color-text-secondary)] md:text-[11px]">{stat.label}</p>
              </div>
            ))}
          </section>

          <div className="mt-5 flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`min-h-11 rounded-full px-5 text-[11px] font-bold ${
                filter === 'all'
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)]'
              }`}
              type="button"
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilter('favorites')}
              className={`flex min-h-11 items-center gap-1.5 rounded-full px-5 text-[11px] font-bold ${
                filter === 'favorites'
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)]'
              }`}
              type="button"
            >
              Yêu thích
              <span className="material-symbols-outlined text-[16px]">favorite</span>
            </button>
          </div>

          {grouped.map(([month, monthPhotos]) => (
            <section key={month} className="mt-5 md:mt-7">
              <h3 className="mb-3 text-[16px] font-bold text-[var(--color-primary)] md:text-[18px]">{month}</h3>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 md:gap-4">
                {monthPhotos.map((photo) => {
                  const originalIndex = photos.findIndex((item) => item.id === photo.id);
                  const favorite = favoriteIds.includes(photo.id);
                  return (
                    <article
                      key={photo.id}
                      className="group relative overflow-hidden rounded-[18px] bg-[#ECEAE2]"
                    >
                      <button
                        onClick={() => onOpenPhoto(originalIndex)}
                        className="block w-full"
                        type="button"
                        aria-label={`Mở ảnh ${photo.alt}`}
                      >
                        <img
                          src={photo.src}
                          alt={photo.alt}
                          loading="lazy"
                          className={`w-full object-cover transition duration-300 group-hover:scale-[1.02] motion-reduce:transition-none ${
                            photo.portrait ? 'h-56' : 'h-44'
                          }`}
                        />
                      </button>
                      <button
                        onClick={() => onToggleFavorite(photo.id)}
                        aria-label={favorite ? 'Bỏ khỏi yêu thích' : 'Thêm vào yêu thích'}
                        className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-text-primary)]/45 text-white backdrop-blur-sm active:scale-95"
                        type="button"
                      >
                        <span className={`material-symbols-outlined text-[20px] ${favorite ? 'filled text-[#FF6F5E]' : ''}`}>
                          favorite
                        </span>
                      </button>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}

          {filter === 'favorites' && filtered.length === 0 && (
            <div className="mt-8 rounded-[22px] border border-dashed border-[var(--color-border)] p-6 text-center">
              <span className="material-symbols-outlined text-[28px] text-[var(--color-secondary)]">favorite</span>
              <p className="mt-2 text-[12px] font-bold text-[var(--color-primary)]">Chưa có ảnh yêu thích</p>
              <p className="mt-1 text-[10px] text-[var(--color-text-secondary)]">Chạm biểu tượng trái tim để lưu ảnh bạn muốn xem lại.</p>
            </div>
          )}
        </main>
      )}
    </div>
  );
};
