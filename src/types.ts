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

export type RiskTier = 'L0' | 'L1' | 'L2' | 'L3' | 'L4';

export type ScreeningScaleType = 'PHQ2_GAD2' | 'PHQ9' | 'GAD7';

export interface RiskAttributionItem {
  factor: string;
  key: string;
  contribution: number;
  detail: string;
}

export interface AdaptiveScreeningPrompt {
  recommendedScale: ScreeningScaleType;
  reason: string;
  triggeredBy: string;
}

export interface RiskSnapshot {
  rInst: number;
  rEff: number;
  currentTier: RiskTier;
  floorTier: RiskTier;
  floorExpiresAt: string | null;
  channelScores: {
    chat: number;
    clin: number;
    mood: number;
    behav: number;
  };
  attribution: RiskAttributionItem[];
  paradoxicalCalmDetected: boolean;
  adaptiveScreeningPrompt: AdaptiveScreeningPrompt | null;
  updatedAt: string;
}

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
  allowAutoCrisisSos?: boolean;
  neverShareJournal: boolean;
}

export interface DailyHabit {
  id: string;
  title: string;
  completed: boolean;
}

export interface ChatInsightData {
  stressScore: string;
  stressDelta: string;
  earlyWeekStress: string;
  avgSleep: string;
  sleepStatus: string;
  sleepGoal: string;
  dailyStress: { day: string; val: number }[];
  referenceTitle: string;
  referenceSnippet: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
  isInsightCard?: boolean;
  insightData?: ChatInsightData | null;
  riskTier?: RiskTier;
  circuitBreakerActivated?: boolean;
  gateRoute?: string;
  outputVerified?: boolean;
  safetyRewritten?: boolean;
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

export interface ConsentProfile {
  allowAiCheckinPersonalize: boolean;
  allowAiJournalContext: boolean;
  allowAutoCrisisSos: boolean;
  shareCoarseLocationOnSos: boolean;
  sosFeatureEnabled: boolean;
}

export interface ScreeningScaleDTO {
  scaleType: ScreeningScaleType;
  title: string;
  subtitle: string;
  questions: { id: string; text: string }[];
  options: { value: number; label: string }[];
}

export interface ScreeningSubmitResult {
  scaleType: ScreeningScaleType;
  totalScore: number;
  phq9Item9Score: number;
  severityLabel: string;
  recommendFollowUpScale: ScreeningScaleType | null;
  empatheticFeedback: string;
  riskSnapshot: RiskSnapshot;
}

export interface SafetyPlanData {
  warningSigns: string[];
  internalCoping: string[];
  safePlacesAndDistractions: string[];
  trustedPeople: string[];
  professionalContacts: string[];
  safeEnvironmentSteps: string[];
  updatedAt?: string;
}

export type ModerationDecision =
  | 'SAFE_PUBLISH'
  | 'SENSITIVE_WITH_CW'
  | 'BLOCK_TOXIC_BULLYING'
  | 'SELF_HARM_INTERCEPT';

export interface ModerationResponse {
  decision: ModerationDecision;
  moderationStatus: 'published' | 'hidden';
  contentWarning: string | null;
  empatheticInterceptMessage: string | null;
  openSupportPrompt: boolean;
  riskSnapshot: RiskSnapshot;
}

export interface WarmSosResult {
  dispatched: boolean;
  recipientsCount: number;
  neverSharedJournalVerified: boolean;
  warmMessagePreview: string;
  communicationGuide: {
    dos: string[];
    donts: string[];
  };
  timestamp: string;
}

export type EscalationStatus =
  | 'OPEN'
  | 'ACKNOWLEDGED'
  | 'INTERVENING'
  | 'FOLLOW_UP'
  | 'RESOLVED';

export interface EscalationEpisodeDTO {
  id: string;
  pseudonymId: string;
  priority: 'P0' | 'P1' | 'P2';
  status: EscalationStatus | string;
  peakRiskScore: number;
  currentTier: RiskTier;
  sbar: {
    situation: string;
    background: string;
    assessment: string;
    recommendation: string;
    evidenceQuotes: string[];
  };
  attribution: RiskAttributionItem[];
  breakGlassActive: boolean;
  breakGlassExpiresAt: string | null;
  unlockedEmergencyInfo: {
    studentAlias: string;
    trustedContacts: { name: string; relationship: string; phone: string }[];
    coarseLocation?: string | null;
  } | null;
  counselorNote: string;
  openedAt: string;
  updatedAt: string;
}

export interface AuditVerifyResult {
  valid: boolean;
  totalEntries: number;
  latestHash: string;
  verifiedAt: string;
  recentLogs: {
    id: number;
    eventType: string;
    actor: string;
    summary: string;
    timestamp: string;
    prevHash: string;
    entryHash: string;
  }[];
}

export interface StatsOverviewDTO {
  avgMood: number;
  avgStress: number;
  avgSleep: number;
  checkinStreak: number;
  dailySeries: {
    date: string;
    dayLabel: string;
    mood: number;
    stress: number;
    sleepHours: number;
  }[];
  aiInsights: {
    title: string;
    body: string;
    tone: string;
  }[];
}

export interface ChatStreamMetaEvent {
  type: 'meta';
  messageId: string;
  gateRoute: string;
  gateLatencyMs: number;
  pragmaticIntent: string;
  cssrsStage: number;
  riskSnapshot: RiskSnapshot;
  openCrisisDrawer: boolean;
  circuitBreakerActivated: boolean;
  adaptiveScreeningPrompt: AdaptiveScreeningPrompt | null;
  insightData: ChatInsightData | null;
}

export interface HealthStatusDTO {
  status: string;
  version: string;
  geminiConfigured: boolean;
  model: string;
  online: boolean;
}

export interface CommunityLetterDTO {
  id: string;
  alias: string;
  title: string;
  content: string;
  topic: string;
  time: string;
  date: string;
  replyCount: number;
  repliesAllowed: boolean;
  status: 'published' | 'pending' | 'hidden';
  decision: ModerationDecision | string;
  contentWarning: string | null;
  isOwn: boolean;
}
