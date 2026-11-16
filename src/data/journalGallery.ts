import { JournalEntry } from '../types';

export interface GalleryPhoto {
  id: string;
  src: string;
  title: string;
  dateLabel: string;
  dateKey: string;
  monthLabel: string;
  mood: string;
  journalId: string;
  alt: string;
  favoriteByDefault: boolean;
  simulated: boolean;
  portrait: boolean;
}

const PHOTO_URLS = [
  'https://images.unsplash.com/photo-1758736413443-e6c19193ef3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=82&w=900',
  'https://images.unsplash.com/photo-1675605567808-5b787f37eb4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=82&w=900',
  'https://images.unsplash.com/photo-1744648524980-cba3f00fbd96?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=82&w=900',
  'https://images.unsplash.com/photo-1661548735649-bf1adffdba78?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=82&w=900',
  'https://images.unsplash.com/photo-1683061529561-0dfb62e9868b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=82&w=900',
  'https://images.unsplash.com/photo-1785202817537-c094aabf2f8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=82&w=900',
  'https://images.unsplash.com/photo-1613547591419-f7ac3c587bd2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=82&w=900',
  'https://images.unsplash.com/photo-1792338875080-4d1aec3026d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=82&w=900',
  'https://images.unsplash.com/photo-1716178233299-808cd679c02c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=82&w=900',
  'https://images.unsplash.com/photo-1774203324900-3f5d5df916c1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=82&w=900',
];

const MOCK_TITLES = [
  'Con đường ngập nắng',
  'Một chiều thật chậm',
  'Hoàng hôn sau giờ học',
  'Những bông hoa nhỏ',
  'Góc bình yên bên cửa sổ',
  'Đi bộ khi trời dịu',
  'Bình hoa đầu tuần',
  'Lối ra biển xanh',
  'Một tách trà ấm',
  'Nắng cuối ngày',
];

const MOCK_MOODS = ['Bình yên', 'Nhẹ nhõm', 'Biết ơn', 'Thư giãn', 'Hy vọng'];

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);

const formatMonth = (date: Date) =>
  `Tháng ${date.getMonth() + 1}, ${date.getFullYear()}`;

export const buildGalleryPhotos = (journals: JournalEntry[]): GalleryPhoto[] => {
  const attachedEntries = journals.filter((entry) => Boolean(entry.imageUrl));
  if (attachedEntries.length === 0) return [];

  const userUploads = attachedEntries.filter((entry) => entry.imageUrl?.startsWith('data:image/'));

  if (userUploads.length > 0) {
    return attachedEntries
      .map((entry, index) => {
        const date = new Date(entry.createdAt);
        return {
          id: `journal-photo-${entry.id}`,
          src: entry.imageUrl!,
          title: entry.title,
          dateLabel: formatDate(date),
          dateKey: date.toISOString().slice(0, 10),
          monthLabel: formatMonth(date),
          mood: entry.tag,
          journalId: entry.id,
          alt: `Ảnh trong nhật ký ${entry.title}`,
          favoriteByDefault: false,
          simulated: false,
          portrait: index % 3 === 0,
        };
      })
      .sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  }

  const journalPool = journals.length ? journals : [];
  return Array.from({ length: 28 }).map((_, index) => {
    const dayOffset =
      index < 20
        ? index === 19
          ? 7
          : Math.floor(index / 3)
        : Math.floor((index - 20) / 2);
    const date = new Date(
      2026,
      index < 20 ? 9 : 8,
      index < 20 ? 18 - dayOffset : 28 - dayOffset
    );
    const journal = journalPool[index % Math.max(1, journalPool.length)];
    const title = journal?.title || MOCK_TITLES[index % MOCK_TITLES.length];
    return {
      id: `gallery-demo-${index + 1}`,
      src: PHOTO_URLS[index % PHOTO_URLS.length],
      title: index < journalPool.length ? title : MOCK_TITLES[index % MOCK_TITLES.length],
      dateLabel: formatDate(date),
      dateKey: date.toISOString().slice(0, 10),
      monthLabel: formatMonth(date),
      mood: journal?.tag || MOCK_MOODS[index % MOCK_MOODS.length],
      journalId: journal?.id || '',
      alt: MOCK_TITLES[index % MOCK_TITLES.length],
      favoriteByDefault: index < 6,
      simulated: true,
      portrait: index % 4 === 1,
    };
  });
};
