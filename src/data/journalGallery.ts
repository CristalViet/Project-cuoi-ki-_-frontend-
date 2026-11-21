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

export const LOCAL_GALLERY_ASSETS = [
  '/assets/aistudio/journal_thumb_plant.png',
  '/assets/aistudio/journal_thumb_tea.png',
  '/assets/aistudio/image_02713824.png',
  '/assets/aistudio/image_0605d193.png',
  '/assets/aistudio/Image_11_5cd0f2e2.png',
  '/assets/aistudio/Image_13_3a231ef5.png',
  '/assets/aistudio/Image_15_d7080bb6.png',
  '/assets/aistudio/Image_17_16502448.png',
];

const MOCK_TITLES = [
  'Chậu cây nhỏ bên hiên nắng',
  'Một tách trà ấm cuối ngày',
  'Khoảnh khắc dịu êm sau giờ học',
  'Góc bình yên bên cửa sổ',
  'Nhịp thở chậm giữa buổi chiều',
  'Ánh nắng nhẹ qua tán lá',
  'Trang viết nhỏ cho riêng mình',
  'Buổi tối thư thái đọc sách',
];

const MOCK_MOODS = ['Bình yên', 'Nhẹ nhõm', 'Biết ơn', 'Thư giãn', 'Hy vọng'];

const toLocalDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);

const formatMonth = (date: Date) =>
  `Tháng ${date.getMonth() + 1}, ${date.getFullYear()}`;

const sanitizePhotoSrc = (src: string, fallbackIndex: number): string => {
  if (!src) return LOCAL_GALLERY_ASSETS[fallbackIndex % LOCAL_GALLERY_ASSETS.length];
  if (src.includes('images.unsplash.com')) {
    return LOCAL_GALLERY_ASSETS[fallbackIndex % LOCAL_GALLERY_ASSETS.length];
  }
  return src;
};

export const buildGalleryPhotos = (journals: JournalEntry[]): GalleryPhoto[] => {
  const attachedEntries = journals.filter((entry) => Boolean(entry.imageUrl));
  if (attachedEntries.length === 0) return [];

  const realPhotos: GalleryPhoto[] = attachedEntries.map((entry, index) => {
    const validTs = entry.createdAt && !Number.isNaN(entry.createdAt) ? entry.createdAt : Date.now();
    const date = new Date(validTs);
    return {
      id: `journal-photo-${entry.id}`,
      src: sanitizePhotoSrc(entry.imageUrl!, index),
      title: entry.title || MOCK_TITLES[index % MOCK_TITLES.length],
      dateLabel: formatDate(date),
      dateKey: toLocalDateKey(date),
      monthLabel: formatMonth(date),
      mood: entry.tag || 'Nhẹ nhõm',
      journalId: entry.id,
      alt: `Ảnh trong nhật ký ${entry.title}`,
      favoriteByDefault: index < 2,
      simulated: false,
      portrait: index % 3 === 0,
    };
  });

  const hasUserUploads = attachedEntries.some((entry) => entry.imageUrl?.startsWith('data:image/'));
  if (hasUserUploads || attachedEntries.length >= 6) {
    return realPhotos.sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  }

  // Supplement with local curated cozy illustrations when only default seed entries exist
  const now = new Date();
  const existingSrcs = new Set(realPhotos.map((p) => p.src));
  const supplemental: GalleryPhoto[] = LOCAL_GALLERY_ASSETS.filter(
    (asset) => !existingSrcs.has(asset)
  ).map((asset, idx) => {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (idx + 2) * 2);
    const linkedJournal = journals[idx % Math.max(1, journals.length)];
    const title = MOCK_TITLES[(idx + 2) % MOCK_TITLES.length];
    return {
      id: `gallery-local-${idx + 1}`,
      src: asset,
      title,
      dateLabel: formatDate(date),
      dateKey: toLocalDateKey(date),
      monthLabel: formatMonth(date),
      mood: linkedJournal?.tag || MOCK_MOODS[idx % MOCK_MOODS.length],
      journalId: linkedJournal?.id || '',
      alt: title,
      favoriteByDefault: idx < 2,
      simulated: true,
      portrait: idx % 3 === 1,
    };
  });

  return [...realPhotos, ...supplemental].sort((a, b) => b.dateKey.localeCompare(a.dateKey));
};
