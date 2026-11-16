import { JournalEntry } from '../types';

export const localDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;

const dayDifference = (later: Date, earlier: Date) => {
  const laterDay = new Date(later.getFullYear(), later.getMonth(), later.getDate()).getTime();
  const earlierDay = new Date(
    earlier.getFullYear(),
    earlier.getMonth(),
    earlier.getDate()
  ).getTime();
  return Math.round((laterDay - earlierDay) / 86_400_000);
};

export const getJournalStats = (journals: JournalEntry[]) => {
  const dates = Array.from(
    new Set(journals.map((entry) => localDateKey(new Date(entry.createdAt))))
  )
    .map((key) => new Date(`${key}T12:00:00`))
    .sort((a, b) => a.getTime() - b.getTime());

  let longestStreak = dates.length ? 1 : 0;
  let run = dates.length ? 1 : 0;
  for (let index = 1; index < dates.length; index += 1) {
    run = dayDifference(dates[index], dates[index - 1]) === 1 ? run + 1 : 1;
    longestStreak = Math.max(longestStreak, run);
  }

  const now = new Date();
  const dateSet = new Set(dates.map(localDateKey));
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!dateSet.has(localDateKey(cursor))) cursor.setDate(cursor.getDate() - 1);

  let currentStreak = 0;
  while (dateSet.has(localDateKey(cursor))) {
    currentStreak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return {
    writingDates: dateSet,
    totalWritingDays: dates.length,
    currentStreak,
    longestStreak,
  };
};
