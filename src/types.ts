export type MainTab = 'home' | 'journal' | 'ai' | 'stats';

export type SubScreen =
  | null
  | 'checkin'
  | 'breathing'
  | 'journal_edit'
  | 'selfcare'
  | 'contacts'
  | 'add_contact'
  | 'settings'
  | 'onboarding'
  | 'streak_details'
  | 'exercise_details'
  | 'sharing'
  | 'journal_gallery'
  | 'journal_photo'
  | 'gallery_journal';

export interface CheckIn {
  id: string;
  date: string;
  dayLabel: string;
  time: string;
  mood: number; // 1-10
  moodLabel: string;
  stress: number; // 0-10
  stressLabel: string;
  sleepHours: number;
  sleepQuality: 'restless' | 'good' | 'refreshed';
  emotions: string[];
  note: string;
  allowAiPersonalize: boolean;
  createdAt: number;
}

export interface JournalEntry {
  id: string;
  date: string;
  dayLabel: string;
  time: string;
  title: string;
  content: string;
  tag: string;
  moodScore: number;
  aiEstimateLabel: string;
  aiEstimateScore: number;
  aiBarWidth: number;
  isEncrypted: boolean;
  allowAiRef: boolean;
  createdAt: number;
  imageUrl?: string;
}

export interface TrustedContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  avatarLetter: string;
  status: 'confirmed' | 'pending';
  permissionScope: string;
  onlyOnSos: boolean;
  shareLocation: boolean;
  neverShareJournal: boolean;
}

export interface DailyHabit {
  id: string;
  title: string;
  completed: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
  isInsightCard?: boolean;
  insightData?: {
    stressScore: string;
    stressDelta: string;
    earlyWeekStress: string;
    avgSleep: string;
    sleepStatus: string;
    sleepGoal: string;
    dailyStress: { day: string; val: number }[];
    referenceTitle: string;
    referenceSnippet: string;
  };
}

export interface ExerciseItem {
  id: string;
  title: string;
  category: 'breath' | 'body' | 'mind' | 'senses';
  durationMinutes: number;
  description: string;
  icon: string;
  isFeatured?: boolean;
}
