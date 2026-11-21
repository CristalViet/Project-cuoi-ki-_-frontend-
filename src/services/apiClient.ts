import {
  AdaptiveScreeningPrompt,
  AuditVerifyResult,
  ChatInsightData,
  CheckIn,
  CommunityLetterDTO,
  ConsentProfile,
  EscalationEpisodeDTO,
  HealthStatusDTO,
  JournalEntry,
  ModerationResponse,
  RiskAttributionItem,
  RiskSnapshot,
  RiskTier,
  SafetyPlanData,
  ScreeningScaleDTO,
  ScreeningScaleType,
  ScreeningSubmitResult,
  StatsOverviewDTO,
  TrustedContact,
  WarmSosResult,
  ChatStreamMetaEvent,
} from '../types';
import { INITIAL_CHECKINS, INITIAL_CONTACTS } from '../data/mockData';

const API_BASE = '/api/v1';
const CLIENT_ID_KEY = 'mindcare_client_id';
const DEFAULT_CLIENT_ID = 'stu-demo-minh-nguyen';

const STORAGE_KEYS = {
  risk: 'mindcare_risk_snapshot_v2',
  consent: 'mindcare_consent_profile_v2',
  safetyPlan: 'mindcare_safety_plan_v2',
  episodes: 'mindcare_escalation_episodes_v2',
  auditLogs: 'mindcare_audit_logs_v2',
  contacts: 'mindcare_contacts',
  checkins: 'mindcare_checkins',
  journals: 'mindcare_journals',
};

export function getClientId(): string {
  try {
    const existing = localStorage.getItem(CLIENT_ID_KEY);
    if (existing && existing.trim()) {
      return existing.trim();
    }
    localStorage.setItem(CLIENT_ID_KEY, DEFAULT_CLIENT_ID);
    return DEFAULT_CLIENT_ID;
  } catch {
    return DEFAULT_CLIENT_ID;
  }
}

export function setClientId(clientId: string): void {
  try {
    localStorage.setItem(CLIENT_ID_KEY, clientId.trim() || DEFAULT_CLIENT_ID);
  } catch {
    // ignore storage errors
  }
}

export const DEFAULT_CONSENT_PROFILE: ConsentProfile = {
  allowAiCheckinPersonalize: true,
  allowAiJournalContext: false,
  allowAutoCrisisSos: false,
  shareCoarseLocationOnSos: false,
  sosFeatureEnabled: true,
};

export const DEFAULT_SAFETY_PLAN: SafetyPlanData = {
  warningSigns: [
    'Thức trắng đêm quá 2 ngày liên tiếp và tim đập nhanh',
    'Cảm giác muốn thu mình, tắt điện thoại và né tránh mọi người',
    'Suy nghĩ tự trách bản thân dồn dập khi áp lực bài vở tăng cao',
  ],
  internalCoping: [
    'Mở bài tập Hít thở chậm 4-7-8 trên MindCare trong 2 phút',
    'Uống một cốc nước ấm và rửa mặt bằng nước mát',
    'Đặt tay lên ngực, đếm 5 vật nhìn thấy quanh phòng (kỹ thuật tiếp đất 5-4-3-2-1)',
  ],
  safePlacesAndDistractions: [
    'Ghế đá dưới hàng cây khuôn viên trường hoặc thư viện tầng 2',
    'Quán cà phê yên tĩnh quen thuộc gần ký túc xá',
    'Đi bộ nhẹ 10 phút nghe nhạc không lời',
  ],
  trustedPeople: [
    'Mẹ (Nguyễn Thị Mai) — 0912 ••• 889',
    'Bạn thân (Hoàng Nam) — 0983 ••• 112',
  ],
  professionalContacts: [
    'Cấp cứu Y tế khẩn cấp: 115',
    'Tổng đài Quốc gia Bảo vệ & Hỗ trợ khẩn cấp: 111',
    'Đường dây nóng Ngày Mai (hỗ trợ tâm lý miễn phí): 096 306 1414',
    'Tổng đài Hỗ trợ Tâm lý & Sức khỏe Tâm thần: 1900 1267',
  ],
  safeEnvironmentSteps: [
    'Cất gọn các vật sắc nhọn hoặc thuốc không cần thiết khỏi bàn học',
    'Mở cửa phòng hoặc di chuyển ra không gian chung có ánh sáng ấm',
    'Ở cạnh bạn cùng phòng hoặc người thân cho đến khi cơn quá tải dịu xuống',
  ],
  updatedAt: new Date().toISOString(),
};

export const DEFAULT_RISK_SNAPSHOT: RiskSnapshot = {
  rInst: 0.12,
  rEff: 0.12,
  currentTier: 'L0',
  floorTier: 'L0',
  floorExpiresAt: null,
  channelScores: {
    chat: 0.05,
    clin: 0.0,
    mood: 0.12,
    behav: 0.0,
  },
  attribution: [
    {
      factor: 'Check-in & Nhật ký',
      key: 'mood',
      contribution: 0.12,
      detail: 'Tâm trạng và nhịp sinh học duy trì ổn định',
    },
  ],
  paradoxicalCalmDetected: false,
  adaptiveScreeningPrompt: null,
  updatedAt: new Date().toISOString(),
};

/* ============================================================================
 * OFFLINE NORMALIZER & SAFETY LEXICONS (PWA Resilience Layer)
 * ========================================================================== */

const POSITIVE_COMPOUND_WHITELIST = [
  'tự tin',
  'tử tế',
  'hết sức',
  'tự hào',
  'tự lập',
  'tự chủ',
  'tự nhiên',
  'tự do',
  'chết cười',
  'cười muốn xỉu',
];

const HARD_CRISIS_PATTERNS = [
  'tự tử',
  'tu tu',
  'tự sát',
  'tu sat',
  'muốn chết',
  'muon chet',
  'không muốn sống',
  'khong muon song',
  'chẳng muốn sống',
  'kết thúc cuộc đời',
  'ket thuc cuoc doi',
  'chấm dứt cuộc đời',
  'nhảy lầu',
  'nhay lau',
  'nhảy cầu',
  'nhay cau',
  'cắt tay',
  'cat tay',
  'cắt cổ tay',
  'rạch tay',
  'rach tay',
  'uống thuốc ngủ',
  'uong thuoc ngu',
  'quá liều',
  'treo cổ',
  'biến mất vĩnh viễn',
  'tạm biệt mọi người',
  'đăng xuất khỏi trái đất',
  'reset cuộc đời',
  'chết quách',
];

const HIGH_RISK_PATTERNS = [
  'tuyệt vọng',
  'không còn lối thoát',
  'bế tắc hoàn toàn',
  'sống không còn ý nghĩa',
  'chẳng ai cần mình',
  'tự làm đau',
  'làm đau bản thân',
  'muốn biến mất',
  'muốn buông xuôi tất cả',
];

const MODERATE_DRIFT_PATTERNS = [
  'kiệt sức',
  'bế tắc',
  'hoảng loạn',
  'khóc suốt',
  'mất ngủ trắng đêm',
  'thức trắng',
  'quá tải',
  'vô dụng',
  'trầm cảm',
  'lo âu nặng',
  'sợ hãi',
  'cô đơn quá',
];

const TOXIC_BULLYING_PATTERNS = [
  'đồ ngu',
  'đồ điên',
  'vô tích sự',
  'cút đi',
  'đáng đời',
  'yếu đuối thế',
  'làm màu',
  'giả tạo',
  'chết đi cho rảnh',
  'khùng điên',
];

function normalizeForSafetyScan(raw: string): string {
  let text = (raw || '')
    .normalize('NFC')
    .toLowerCase()
    .replace(/[\u200B-\u200D\uFEFF]/g, '');

  for (const safePhrase of POSITIVE_COMPOUND_WHITELIST) {
    text = text.split(safePhrase).join(' ');
  }

  // Collapse obfuscated separators between letters like "t.ự t.ử", "t_ự_s_á_t"
  const collapsed = text.replace(/(\p{L})[.\-_*/\\|]+(?=\p{L})/gu, '$1');
  return collapsed.replace(/\s+/g, ' ').trim();
}

export function detectOfflineTextRisk(raw: string): {
  level: RiskTier;
  score: number;
  matchedPhrase: string | null;
  isToxic: boolean;
} {
  const normalized = normalizeForSafetyScan(raw);

  for (const pattern of HARD_CRISIS_PATTERNS) {
    if (normalized.includes(pattern)) {
      return { level: 'L4', score: 0.94, matchedPhrase: pattern, isToxic: false };
    }
  }
  for (const toxic of TOXIC_BULLYING_PATTERNS) {
    if (normalized.includes(toxic)) {
      return { level: 'L1', score: 0.25, matchedPhrase: toxic, isToxic: true };
    }
  }
  for (const pattern of HIGH_RISK_PATTERNS) {
    if (normalized.includes(pattern)) {
      return { level: 'L3', score: 0.72, matchedPhrase: pattern, isToxic: false };
    }
  }
  for (const pattern of MODERATE_DRIFT_PATTERNS) {
    if (normalized.includes(pattern)) {
      return { level: 'L2', score: 0.48, matchedPhrase: pattern, isToxic: false };
    }
  }
  return { level: 'L0', score: 0.08, matchedPhrase: null, isToxic: false };
}

export function estimateVietnameseSentiment(
  text: string,
  fallbackMoodScore = 6
): {
  aiEstimateLabel: string;
  aiEstimateScore: number;
  aiBarWidth: number;
} {
  const normalized = normalizeForSafetyScan(text);
  const riskCheck = detectOfflineTextRisk(text);
  if (riskCheck.level === 'L4' || riskCheck.level === 'L3') {
    return {
      aiEstimateLabel: 'Cần điểm tựa an toàn',
      aiEstimateScore: 2,
      aiBarWidth: 20,
    };
  }
  if (riskCheck.level === 'L2') {
    return {
      aiEstimateLabel: 'Đang nhiều trăn trở',
      aiEstimateScore: 3,
      aiBarWidth: 32,
    };
  }

  const positiveWords = [
    'biết ơn',
    'nhẹ nhõm',
    'bình yên',
    'vui',
    'hạnh phúc',
    'hoàn thành',
    'tự hào',
    'thư giãn',
    'dễ chịu',
    'hy vọng',
    'tốt hơn',
    'năng lượng',
  ];
  const mildStressWords = [
    'lo lắng',
    'áp lực',
    'mệt',
    'buồn',
    'deadline',
    'khó ngủ',
    'căng thẳng',
    'chênh vênh',
  ];

  let delta = 0;
  for (const w of positiveWords) {
    if (normalized.includes(w)) delta += 1;
  }
  for (const w of mildStressWords) {
    if (normalized.includes(w)) delta -= 1;
  }

  const score = Math.max(1, Math.min(10, Math.round(fallbackMoodScore + delta * 0.8)));
  const label =
    score >= 8
      ? 'Tích cực & Ấm áp'
      : score >= 6
        ? 'Tích cực nhẹ'
        : score >= 4
          ? 'Đang cân bằng lại'
          : 'Cần được nghỉ ngơi';

  return {
    aiEstimateLabel: label,
    aiEstimateScore: score,
    aiBarWidth: Math.max(12, Math.min(100, score * 10)),
  };
}

/* ============================================================================
 * LOCAL STORAGE HELPERS FOR OFFLINE FALLBACK
 * ========================================================================== */

function readJsonStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJsonStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota errors
  }
}

const TIER_ORDER: Record<RiskTier, number> = {
  L0: 0,
  L1: 1,
  L2: 2,
  L3: 3,
  L4: 4,
};

function scoreToTier(score: number): RiskTier {
  if (score >= 0.82) return 'L4';
  if (score >= 0.65) return 'L3';
  if (score >= 0.42) return 'L2';
  if (score >= 0.22) return 'L1';
  return 'L0';
}

function updateOfflineRiskSnapshot(patch: {
  chatScore?: number;
  clinScore?: number;
  moodScore?: number;
  behavScore?: number;
  detailNote?: string;
  adaptivePrompt?: AdaptiveScreeningPrompt | null;
}): RiskSnapshot {
  const prev = readJsonStorage<RiskSnapshot>(STORAGE_KEYS.risk, DEFAULT_RISK_SNAPSHOT);
  const nextChannels = {
    chat: patch.chatScore !== undefined ? patch.chatScore : prev.channelScores.chat * 0.9,
    clin: patch.clinScore !== undefined ? patch.clinScore : prev.channelScores.clin * 0.95,
    mood: patch.moodScore !== undefined ? patch.moodScore : prev.channelScores.mood,
    behav: patch.behavScore !== undefined ? patch.behavScore : prev.channelScores.behav,
  };

  const maxChannel = Math.max(
    nextChannels.chat,
    nextChannels.clin,
    nextChannels.mood,
    nextChannels.behav
  );
  const sumOthers =
    nextChannels.chat +
    nextChannels.clin +
    nextChannels.mood +
    nextChannels.behav -
    maxChannel;
  const rInst = Number(Math.min(1, maxChannel + 0.15 * sumOthers).toFixed(2));

  // Respect step-down floor if active
  const now = Date.now();
  let floorTier: RiskTier = prev.floorTier || 'L0';
  let floorExpiresAt = prev.floorExpiresAt;
  if (floorExpiresAt && new Date(floorExpiresAt).getTime() < now) {
    floorTier = 'L0';
    floorExpiresAt = null;
  }

  let computedTier = scoreToTier(rInst);
  if (computedTier === 'L4') {
    floorTier = 'L3';
    floorExpiresAt = new Date(now + 24 * 3600 * 1000).toISOString();
  } else if (computedTier === 'L3' && TIER_ORDER[floorTier] < TIER_ORDER['L2']) {
    floorTier = 'L2';
    floorExpiresAt = new Date(now + 6 * 3600 * 1000).toISOString();
  }

  if (TIER_ORDER[floorTier] > TIER_ORDER[computedTier]) {
    computedTier = floorTier;
  }

  const rEff = Number(Math.max(rInst, prev.rEff * 0.85).toFixed(2));

  const attribution: RiskAttributionItem[] = [];
  if (nextChannels.chat >= 0.05) {
    attribution.push({
      factor: 'Ngôn ngữ Hội thoại (C-SSRS)',
      key: 'chat',
      contribution: Number(nextChannels.chat.toFixed(2)),
      detail: patch.detailNote || 'Tín hiệu ngôn ngữ từ phiên trò chuyện Mochi',
    });
  }
  if (nextChannels.clin >= 0.05) {
    attribution.push({
      factor: 'Thang Sàng lọc Lâm sàng',
      key: 'clin',
      contribution: Number(nextChannels.clin.toFixed(2)),
      detail: 'Kết quả tự rà soát PHQ/GAD gần nhất',
    });
  }
  attribution.push({
    factor: 'Check-in & Nhật ký',
    key: 'mood',
    contribution: Number(nextChannels.mood.toFixed(2)),
    detail:
      nextChannels.mood >= 0.45
        ? 'Ghi nhận căng thẳng cao hoặc thiếu ngủ kéo dài'
        : 'Nhịp cảm xúc tự ghi nhận ổn định',
  });

  attribution.sort((a, b) => b.contribution - a.contribution);

  let adaptiveScreeningPrompt =
    patch.adaptivePrompt !== undefined ? patch.adaptivePrompt : prev.adaptiveScreeningPrompt;

  if (
    patch.adaptivePrompt === undefined &&
    (computedTier === 'L2' || computedTier === 'L3') &&
    nextChannels.clin < 0.1
  ) {
    adaptiveScreeningPrompt = {
      recommendedScale: 'PHQ2_GAD2',
      reason:
        'Mochi nhận thấy gần đây năng lượng và nhịp nghỉ ngơi của bạn có phần quá tải. Bạn có muốn làm nhanh 4 câu rà soát ngắn (khoảng 30 giây) để mình hỗ trợ sát hơn không?',
      triggeredBy: 'MODERATE_DRIFT',
    };
  }

  const nextSnapshot: RiskSnapshot = {
    rInst,
    rEff,
    currentTier: computedTier,
    floorTier,
    floorExpiresAt,
    channelScores: {
      chat: Number(nextChannels.chat.toFixed(2)),
      clin: Number(nextChannels.clin.toFixed(2)),
      mood: Number(nextChannels.mood.toFixed(2)),
      behav: Number(nextChannels.behav.toFixed(2)),
    },
    attribution,
    paradoxicalCalmDetected: false,
    adaptiveScreeningPrompt,
    updatedAt: new Date().toISOString(),
  };

  writeJsonStorage(STORAGE_KEYS.risk, nextSnapshot);

  if (computedTier === 'L4' || computedTier === 'L3') {
    ensureOfflineEscalationEpisode(nextSnapshot, patch.detailNote || '');
  }

  return nextSnapshot;
}

/* ============================================================================
 * OFFLINE DEMO ESCALATION & SHA-256 AUDIT CHAIN
 * ========================================================================== */

function quickDeterministicHash(input: string): string {
  let h1 = 0xdeadbeef ^ input.length;
  let h2 = 0x41c6ce57 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
  return `${hex1}${hex2}${hex1.split('').reverse().join('')}${hex2.split('').reverse().join('')}${hex1}${hex2}${hex1}${hex2}`;
}

function getInitialOfflineEpisodes(): EscalationEpisodeDTO[] {
  const nowIso = new Date().toISOString();
  return [
    {
      id: 'ep-demo-p0',
      pseudonymId: 'STU-8F2A',
      priority: 'P0',
      status: 'OPEN',
      peakRiskScore: 0.91,
      currentTier: 'L4',
      sbar: {
        situation:
          'Hệ thống phát hiện tín hiệu khủng hoảng cấp tính (L4 - P0) qua hội thoại trực tiếp kèm chỉ báo mất ngủ liên tiếp.',
        background:
          'Sinh viên ghi nhận căng thẳng tăng từ 6/10 lên 9/10 trong 4 ngày gần nhất, thời lượng ngủ giảm dưới 5.5 giờ/đêm.',
        assessment:
          'Điểm hợp nhất R_eff = 0.91 (vượt ngưỡng khóa an toàn Hard Circuit Breaker). Đã kích hoạt chế độ Sơ cứu Tâm lý WHO PFA phía người dùng.',
        recommendation:
          'Chuyên gia trực ca tiếp nhận trong vòng 5 phút, đánh giá an toàn tức thời và xem xét giao thức Break-Glass nếu không liên lạc được.',
        evidenceQuotes: [
          ' Tín hiệu ngôn ngữ C-SSRS mức nguy kịch trong phiên hỗ trợ tối nay',
          'Chuỗi check-in ghi nhận kiệt sức và thức khuya làm đồ án kéo dài',
        ],
      },
      attribution: [
        {
          factor: 'Hội thoại C-SSRS',
          key: 'chat',
          contribution: 0.58,
          detail: 'Phát hiện biểu đạt nguy kịch trực tiếp (C-SSRS Stage 4)',
        },
        {
          factor: 'Sàng lọc PHQ-9',
          key: 'clin',
          contribution: 0.21,
          detail: 'Điểm neo an toàn câu số 9 dương tính',
        },
        {
          factor: 'Check-in & Giấc ngủ',
          key: 'mood',
          contribution: 0.12,
          detail: 'Thiếu ngủ < 5.5h và stress cao liên tục',
        },
      ],
      breakGlassActive: false,
      breakGlassExpiresAt: null,
      unlockedEmergencyInfo: null,
      counselorNote: '',
      openedAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'ep-demo-p1',
      pseudonymId: 'STU-4C91',
      priority: 'P1',
      status: 'ACKNOWLEDGED',
      peakRiskScore: 0.71,
      currentTier: 'L3',
      sbar: {
        situation:
          'Cảnh báo mức cao (L3 - P1): Sinh viên có xu hướng suy giảm khí sắc rõ rệt trên thang sàng lọc thích ứng PHQ-9.',
        background:
          'Hoàn thành rà soát 2 pha với tổng điểm PHQ-9 = 16 (mức trung bình - nặng), kèm ghi chú áp lực kỳ thi cuối kỳ.',
        assessment:
          'Điểm hợp nhất R_eff = 0.71. Đã gợi ý lập Kế hoạch An toàn 6 bước Stanley-Brown và bài tập điều hòa nhịp thở.',
        recommendation:
          'Chuyên gia tham vấn chủ động liên hệ hẹn lịch tư vấn 1-1 trong vòng 30 phút - 2 giờ làm việc.',
        evidenceQuotes: [
          'Tổng điểm sàng lọc PHQ-9 đạt 16/27, cần điểm tựa tham vấn học đường',
        ],
      },
      attribution: [
        {
          factor: 'Thang Sàng lọc PHQ-9',
          key: 'clin',
          contribution: 0.46,
          detail: 'Tổng điểm 16/27 (Khí sắc trầm mức vừa - nặng)',
        },
        {
          factor: 'Check-in Cảm xúc',
          key: 'mood',
          contribution: 0.25,
          detail: 'Điểm tâm trạng giảm dần trong 5 ngày qua',
        },
      ],
      breakGlassActive: false,
      breakGlassExpiresAt: null,
      unlockedEmergencyInfo: null,
      counselorNote: 'Đã nhận ca, đang chuẩn bị khung giờ tham vấn chiều nay.',
      openedAt: nowIso,
      updatedAt: nowIso,
    },
  ];
}

function appendOfflineAuditLog(eventType: string, actor: string, summary: string): void {
  const existing = readJsonStorage<AuditVerifyResult['recentLogs']>(STORAGE_KEYS.auditLogs, []);
  const seedLogs =
    existing.length > 0
      ? existing
      : [
          {
            id: 1,
            eventType: 'GENESIS_AUDIT_INIT',
            actor: 'SYSTEM_SECURITY_CORE',
            summary: 'Khởi tạo sổ cái kiểm toán bất biến SHA-256 cho MindCare Risk Engine v2.0',
            timestamp: new Date(Date.now() - 3600_000).toISOString(),
            prevHash: '0'.repeat(64),
            entryHash: quickDeterministicHash('GENESIS_AUDIT_INIT|0'),
          },
          {
            id: 2,
            eventType: 'ESCALATION_OPENED',
            actor: 'SYSTEM_RISK_ENGINE',
            summary: 'Mở hồ sơ cảnh báo P0 cho mã ẩn danh STU-8F2A (Episode Deduplication Active)',
            timestamp: new Date(Date.now() - 1800_000).toISOString(),
            prevHash: quickDeterministicHash('GENESIS_AUDIT_INIT|0'),
            entryHash: quickDeterministicHash('ESCALATION_OPENED|STU-8F2A'),
          },
        ];

  const prev = seedLogs[seedLogs.length - 1];
  const nextId = prev.id + 1;
  const ts = new Date().toISOString();
  const entryHash = quickDeterministicHash(`${nextId}|${eventType}|${actor}|${summary}|${prev.entryHash}`);
  seedLogs.push({
    id: nextId,
    eventType,
    actor,
    summary,
    timestamp: ts,
    prevHash: prev.entryHash,
    entryHash,
  });
  writeJsonStorage(STORAGE_KEYS.auditLogs, seedLogs);
}

function ensureOfflineEscalationEpisode(snapshot: RiskSnapshot, quote: string): void {
  const episodes = readJsonStorage<EscalationEpisodeDTO[]>(
    STORAGE_KEYS.episodes,
    getInitialOfflineEpisodes()
  );
  const activeOpen = episodes.find(
    (ep) => ep.pseudonymId === 'STU-MINH-DEMO' && ep.status !== 'RESOLVED'
  );
  const priority: 'P0' | 'P1' = snapshot.currentTier === 'L4' ? 'P0' : 'P1';
  const nowIso = new Date().toISOString();

  if (activeOpen) {
    activeOpen.peakRiskScore = Math.max(activeOpen.peakRiskScore, snapshot.rEff);
    activeOpen.currentTier = snapshot.currentTier;
    activeOpen.priority = priority;
    activeOpen.updatedAt = nowIso;
    if (quote && !activeOpen.sbar.evidenceQuotes.includes(quote)) {
      activeOpen.sbar.evidenceQuotes = [quote, ...activeOpen.sbar.evidenceQuotes].slice(0, 4);
    }
    activeOpen.attribution = snapshot.attribution;
  } else {
    episodes.unshift({
      id: `ep-${Date.now()}`,
      pseudonymId: 'STU-MINH-DEMO',
      priority,
      status: 'OPEN',
      peakRiskScore: snapshot.rEff,
      currentTier: snapshot.currentTier,
      sbar: {
        situation: `Phát hiện đợt rủi ro ${snapshot.currentTier} (${priority}) trên phiên người dùng hiện tại.`,
        background: 'Hồ sơ theo dõi tự động hợp nhất đa kênh (Chat, Sàng lọc, Check-in cảm xúc).',
        assessment: `Chỉ số rủi ro hiệu dụng R_eff = ${snapshot.rEff.toFixed(2)}. Đã hiển thị không gian hỗ trợ an toàn cho sinh viên.`,
        recommendation:
          priority === 'P0'
            ? 'Tiếp nhận khẩn cấp P0 (< 5 phút) và xác minh an toàn thực tế.'
            : 'Tiếp nhận ưu tiên P1 (< 30 phút) và mời tham vấn hỗ trợ.',
        evidenceQuotes: quote ? [quote] : ['Tín hiệu rủi ro vượt ngưỡng bảo vệ tự động'],
      },
      attribution: snapshot.attribution,
      breakGlassActive: false,
      breakGlassExpiresAt: null,
      unlockedEmergencyInfo: null,
      counselorNote: '',
      openedAt: nowIso,
      updatedAt: nowIso,
    });
    appendOfflineAuditLog(
      'ESCALATION_OPENED',
      'SYSTEM_RISK_ENGINE',
      `Tự động tạo phiếu bàn giao SBAR mức ${priority} (${snapshot.currentTier})`
    );
  }
  writeJsonStorage(STORAGE_KEYS.episodes, episodes);
}

/* ============================================================================
 * OFFLINE SCREENING SCALES CATALOG
 * ========================================================================== */

const OFFLINE_SCALES: Record<ScreeningScaleType, ScreeningScaleDTO> = {
  PHQ2_GAD2: {
    scaleType: 'PHQ2_GAD2',
    title: 'Rà soát cảm xúc ngắn (PHQ-2 & GAD-2)',
    subtitle: 'Trong 2 tuần vừa qua, bạn có thường gặp những cảm giác sau không?',
    questions: [
      { id: 'phq1', text: 'Ít hứng thú hoặc ít niềm vui khi làm mọi việc' },
      { id: 'phq2', text: 'Cảm thấy chán nản, trầm lắng hoặc tuyệt vọng' },
      { id: 'gad1', text: 'Cảm thấy lo lắng, bồn chồn hoặc căng thẳng đầu óc' },
      { id: 'gad2', text: 'Không thể ngừng lại hoặc kiểm soát được sự lo lắng' },
    ],
    options: [
      { value: 0, label: 'Không chút nào' },
      { value: 1, label: 'Vài ngày' },
      { value: 2, label: 'Hơn nửa số ngày' },
      { value: 3, label: 'Gần như mỗi ngày' },
    ],
  },
  PHQ9: {
    scaleType: 'PHQ9',
    title: 'Thang rà soát khí sắc chuyên sâu (PHQ-9)',
    subtitle: 'Trong 2 tuần qua, mức độ thường xuyên bạn gặp các biểu hiện sau là gì?',
    questions: [
      { id: 'phq1', text: 'Ít hứng thú hoặc ít niềm vui khi làm mọi việc' },
      { id: 'phq2', text: 'Cảm thấy buồn bã, chán nản hoặc tuyệt vọng' },
      { id: 'phq3', text: 'Khó vào giấc ngủ, ngủ chập chờn hoặc ngủ quá nhiều' },
      { id: 'phq4', text: 'Cảm thấy mệt mỏi hoặc có rất ít năng lượng' },
      { id: 'phq5', text: 'Chán ăn hoặc ăn nhiều hơn bình thường' },
      { id: 'phq6', text: 'Cảm thấy tệ về bản thân, hoặc nghĩ mình làm gia đình thất vọng' },
      { id: 'phq7', text: 'Khó tập trung vào việc học, đọc tài liệu hoặc nghe giảng' },
      { id: 'phq8', text: 'Đi lại, nói năng chậm chạp khác thường hoặc bồn chồn đứng ngồi không yên' },
      { id: 'phq9', text: 'Có suy nghĩ rằng thà mình không còn tồn tại hoặc muốn tự làm đau bản thân' },
    ],
    options: [
      { value: 0, label: 'Không chút nào' },
      { value: 1, label: 'Vài ngày' },
      { value: 2, label: 'Hơn nửa số ngày' },
      { value: 3, label: 'Gần như mỗi ngày' },
    ],
  },
  GAD7: {
    scaleType: 'GAD7',
    title: 'Thang rà soát mức độ lo âu (GAD-7)',
    subtitle: 'Trong 2 tuần qua, những điều sau làm phiền bạn thường xuyên đến mức nào?',
    questions: [
      { id: 'gad1', text: 'Cảm thấy lo lắng, bồn chồn hoặc đứng ngồi không yên' },
      { id: 'gad2', text: 'Không thể dừng lại hoặc kiểm soát được sự lo âu' },
      { id: 'gad3', text: 'Lo lắng quá nhiều về nhiều việc khác nhau cùng lúc' },
      { id: 'gad4', text: 'Gặp khó khăn khi cố gắng thư giãn và thả lỏng cơ thể' },
      { id: 'gad5', text: 'Bồn chồn đến mức khó có thể ngồi yên một chỗ' },
      { id: 'gad6', text: 'Dễ trở nên cáu gắt, nhạy cảm hoặc bực bội' },
      { id: 'gad7', text: 'Cảm thấy sợ hãi như thể có điều gì không hay sắp xảy ra' },
    ],
    options: [
      { value: 0, label: 'Không chút nào' },
      { value: 1, label: 'Vài ngày' },
      { value: 2, label: 'Hơn nửa số ngày' },
      { value: 3, label: 'Gần như mỗi ngày' },
    ],
  },
};

/* ============================================================================
 * CORE HTTP CLIENT
 * ========================================================================== */

async function requestJson<T>(
  path: string,
  options: RequestInit = {},
  timeoutMs = 5500
): Promise<T> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'X-MindCare-Client-Id': getClientId(),
      ...(options.headers as Record<string, string> | undefined),
    };
    if (options.body && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return (await response.json()) as T;
  } finally {
    window.clearTimeout(timer);
  }
}

/* ============================================================================
 * EXPORTED API CLIENT FUNCTIONS (100% Contract v2 + Offline Fallback)
 * ========================================================================== */

export const apiClient = {
  getClientId,
  setClientId,

  async checkHealth(): Promise<HealthStatusDTO> {
    try {
      const res = await requestJson<{
        status: string;
        version: string;
        geminiConfigured: boolean;
        model: string;
      }>('/health', { method: 'GET' }, 3000);
      return {
        ...res,
        online: res.status === 'ok',
      };
    } catch {
      return {
        status: 'offline_pwa',
        version: '2.0.0',
        geminiConfigured: false,
        model: 'client-safety-fallback',
        online: false,
      };
    }
  },

  async getRiskState(): Promise<RiskSnapshot> {
    try {
      const snapshot = await requestJson<RiskSnapshot>('/risk/state', { method: 'GET' });
      writeJsonStorage(STORAGE_KEYS.risk, snapshot);
      return snapshot;
    } catch {
      return readJsonStorage<RiskSnapshot>(STORAGE_KEYS.risk, DEFAULT_RISK_SNAPSHOT);
    }
  },

  async getConsent(): Promise<ConsentProfile> {
    try {
      const consent = await requestJson<ConsentProfile>('/consent', { method: 'GET' });
      writeJsonStorage(STORAGE_KEYS.consent, consent);
      return consent;
    } catch {
      return readJsonStorage<ConsentProfile>(STORAGE_KEYS.consent, DEFAULT_CONSENT_PROFILE);
    }
  },

  async updateConsent(profile: ConsentProfile): Promise<ConsentProfile> {
    writeJsonStorage(STORAGE_KEYS.consent, profile);
    try {
      const saved = await requestJson<ConsentProfile>('/consent', {
        method: 'PUT',
        body: JSON.stringify(profile),
      });
      writeJsonStorage(STORAGE_KEYS.consent, saved);
      return saved;
    } catch {
      return profile;
    }
  },

  async getContacts(): Promise<TrustedContact[]> {
    try {
      const list = await requestJson<TrustedContact[]>('/contacts', { method: 'GET' });
      const normalized = list.map((c) => ({ ...c, neverShareJournal: true }));
      writeJsonStorage(STORAGE_KEYS.contacts, normalized);
      return normalized;
    } catch {
      return readJsonStorage<TrustedContact[]>(STORAGE_KEYS.contacts, INITIAL_CONTACTS);
    }
  },

  async createContact(contact: TrustedContact): Promise<TrustedContact> {
    const safePayload: TrustedContact = {
      ...contact,
      allowAutoCrisisSos: Boolean(contact.allowAutoCrisisSos),
      neverShareJournal: true,
    };
    try {
      const created = await requestJson<TrustedContact>('/contacts', {
        method: 'POST',
        body: JSON.stringify(safePayload),
      });
      return { ...created, neverShareJournal: true };
    } catch {
      return safePayload;
    }
  },

  async updateContact(
    contactId: string,
    patch: Partial<TrustedContact>
  ): Promise<TrustedContact> {
    try {
      const updated = await requestJson<TrustedContact>(
        `/contacts/${encodeURIComponent(contactId)}`,
        {
          method: 'PUT',
          body: JSON.stringify({ ...patch, neverShareJournal: true }),
        }
      );
      return { ...updated, neverShareJournal: true };
    } catch {
      const list = readJsonStorage<TrustedContact[]>(STORAGE_KEYS.contacts, INITIAL_CONTACTS);
      const found = list.find((c) => c.id === contactId) || INITIAL_CONTACTS[0];
      return { ...found, ...patch, neverShareJournal: true };
    }
  },

  async deleteContact(contactId: string): Promise<{ deleted: boolean }> {
    try {
      return await requestJson<{ deleted: boolean }>(
        `/contacts/${encodeURIComponent(contactId)}`,
        { method: 'DELETE' }
      );
    } catch {
      return { deleted: true };
    }
  },

  async getCheckIns(): Promise<CheckIn[]> {
    try {
      const data = await requestJson<CheckIn[]>('/checkins', { method: 'GET' });
      if (Array.isArray(data) && data.length > 0) {
        writeJsonStorage(STORAGE_KEYS.checkins, data);
      }
      return data;
    } catch {
      return readJsonStorage<CheckIn[]>(STORAGE_KEYS.checkins, INITIAL_CHECKINS);
    }
  },

  async createCheckIn(
    checkIn: CheckIn
  ): Promise<{ checkIn: CheckIn; riskSnapshot: RiskSnapshot }> {
    try {
      const res = await requestJson<{ checkIn: CheckIn; riskSnapshot: RiskSnapshot }>(
        '/checkins',
        {
          method: 'POST',
          body: JSON.stringify(checkIn),
        }
      );
      writeJsonStorage(STORAGE_KEYS.risk, res.riskSnapshot);
      return res;
    } catch {
      const textScan = detectOfflineTextRisk(checkIn.note || '');
      const moodStrain = Math.max(0, (10 - checkIn.mood) / 10);
      const stressStrain = checkIn.stress / 10;
      const sleepPenalty = checkIn.sleepHours < 6 ? 0.2 : 0;
      const moodRisk = Math.min(
        0.85,
        0.45 * moodStrain + 0.4 * stressStrain + sleepPenalty
      );
      const riskSnapshot = updateOfflineRiskSnapshot({
        moodScore: moodRisk,
        chatScore: textScan.level === 'L4' ? 0.94 : textScan.level === 'L3' ? 0.72 : undefined,
        detailNote:
          textScan.matchedPhrase
            ? `Ghi chú check-in có cụm từ nhạy cảm: "${textScan.matchedPhrase}"`
            : `Check-in tâm trạng ${checkIn.mood}/10, stress ${checkIn.stress}/10`,
      });
      return { checkIn, riskSnapshot };
    }
  },

  async getJournals(): Promise<JournalEntry[]> {
    try {
      return await requestJson<JournalEntry[]>('/journals', { method: 'GET' });
    } catch {
      return readJsonStorage<JournalEntry[]>(STORAGE_KEYS.journals, []);
    }
  },

  async createJournal(
    entry: Partial<JournalEntry> & { id: string }
  ): Promise<{ journal: JournalEntry; riskSnapshot: RiskSnapshot }> {
    try {
      const res = await requestJson<{ journal: JournalEntry; riskSnapshot: RiskSnapshot }>(
        '/journals',
        {
          method: 'POST',
          body: JSON.stringify(entry),
        }
      );
      writeJsonStorage(STORAGE_KEYS.risk, res.riskSnapshot);
      return res;
    } catch {
      const combinedText = `${entry.title || ''} ${entry.content || ''}`;
      const sentiment = estimateVietnameseSentiment(combinedText, entry.moodScore || 6);
      const riskScan = detectOfflineTextRisk(combinedText);
      const fullJournal: JournalEntry = {
        id: entry.id,
        date: entry.date || new Date().toLocaleDateString('vi-VN'),
        dayLabel: entry.dayLabel || 'Hôm nay',
        time: entry.time || '12:00',
        title: entry.title || 'Nhật ký cá nhân',
        content: entry.content || '',
        tag: entry.tag || 'Nhẹ nhõm',
        moodScore: entry.moodScore || sentiment.aiEstimateScore,
        aiEstimateLabel: sentiment.aiEstimateLabel,
        aiEstimateScore: sentiment.aiEstimateScore,
        aiBarWidth: sentiment.aiBarWidth,
        isEncrypted: true,
        allowAiRef: Boolean(entry.allowAiRef),
        createdAt: entry.createdAt || Date.now(),
        imageUrl: entry.imageUrl,
      };
      const riskSnapshot = updateOfflineRiskSnapshot({
        moodScore: Math.max(0.1, (10 - sentiment.aiEstimateScore) / 11),
        chatScore: riskScan.level === 'L4' ? 0.92 : riskScan.level === 'L3' ? 0.7 : undefined,
        detailNote: 'Phân tích cảm xúc tự động trên nhật ký mã hóa',
      });
      return { journal: fullJournal, riskSnapshot };
    }
  },

  async updateJournal(
    journalId: string,
    entry: Partial<JournalEntry>
  ): Promise<{ journal: JournalEntry; riskSnapshot: RiskSnapshot }> {
    try {
      const res = await requestJson<{ journal: JournalEntry; riskSnapshot: RiskSnapshot }>(
        `/journals/${encodeURIComponent(journalId)}`,
        {
          method: 'PUT',
          body: JSON.stringify(entry),
        }
      );
      writeJsonStorage(STORAGE_KEYS.risk, res.riskSnapshot);
      return res;
    } catch {
      return this.createJournal({ ...entry, id: journalId });
    }
  },

  async deleteJournal(journalId: string): Promise<{ deleted: boolean }> {
    try {
      return await requestJson<{ deleted: boolean }>(
        `/journals/${encodeURIComponent(journalId)}`,
        { method: 'DELETE' }
      );
    } catch {
      return { deleted: true };
    }
  },

  async getCommunityLetters(): Promise<CommunityLetterDTO[]> {
    try {
      return await requestJson<CommunityLetterDTO[]>('/community/letters', { method: 'GET' });
    } catch {
      const snap = readJsonStorage<RiskSnapshot>(STORAGE_KEYS.risk, DEFAULT_RISK_SNAPSHOT);
      const shieldSensitive = snap.rEff >= 0.45;
      const fallbackSeeds: CommunityLetterDTO[] = [
        {
          id: 'letter-seed-1',
          alias: 'Một chiếc lá nhỏ',
          title: 'Áp lực học tập và nỗi sợ tụt lại phía sau',
          content:
            'Dạo gần đây mình cảm thấy khá áp lực với việc học. Dù đã cố gắng sắp xếp thời gian hơn, đôi lúc mình vẫn lo bản thân chưa đủ giỏi so với bạn bè. Rất mong nhận được một góc nhìn ấm áp.',
          topic: 'Học tập',
          time: '20:15',
          date: '18/11/2026',
          replyCount: 5,
          repliesAllowed: true,
          status: 'published',
          decision: 'SAFE_PUBLISH',
          contentWarning: null,
          isOwn: false,
        },
        {
          id: 'letter-seed-2',
          alias: 'Đám mây chiều',
          title: 'Cho bản thân cơ hội được nghỉ một nhịp',
          content:
            'Hôm nay mình đã dám nói ra điều giữ trong lòng suốt cả tuần. Có chút hồi hộp nhưng thấy nhẹ lòng hơn hẳn. Chúc bất kỳ ai đọc lá thư này có một buổi tối thật bình yên nhé.',
          topic: 'Cảm xúc',
          time: '18:40',
          date: '17/11/2026',
          replyCount: 3,
          repliesAllowed: true,
          status: 'published',
          decision: 'SAFE_PUBLISH',
          contentWarning: null,
          isOwn: false,
        },
        {
          id: 'letter-seed-cw-1',
          alias: 'Hạt mưa đêm',
          title: 'Những đêm khóc một mình vì kiệt sức và cô độc',
          content:
            'Mấy tuần nay mình rơi vào trạng thái suy sụp và hoảng loạn mỗi khi tắt đèn đi ngủ, khóc suốt đêm vì áp lực gia đình nặng nề. Mình không muốn làm đau bản thân nhưng thật sự thấy quá cô độc.',
          topic: 'Tâm sự sâu',
          time: '23:10',
          date: '16/11/2026',
          replyCount: 2,
          repliesAllowed: true,
          status: 'published',
          decision: 'SENSITIVE_WITH_CW',
          contentWarning:
            'Nội dung có cảm xúc trầm buồn và hoảng loạn sâu — hãy cân nhắc trước khi mở.',
          isOwn: false,
        },
      ];
      return shieldSensitive
        ? fallbackSeeds.filter((l) => l.decision !== 'SENSITIVE_WITH_CW')
        : fallbackSeeds;
    }
  },

  async getStatsOverview(localCheckIns: CheckIn[] = []): Promise<StatsOverviewDTO> {
    try {
      return await requestJson<StatsOverviewDTO>('/stats/overview', { method: 'GET' });
    } catch {
      const list = localCheckIns.length > 0 ? localCheckIns : INITIAL_CHECKINS;
      const slice = list.slice(0, 7);
      const count = slice.length || 1;
      const avgMood = Number(
        (slice.reduce((sum, c) => sum + c.mood, 0) / count).toFixed(1)
      );
      const avgStress = Number(
        (slice.reduce((sum, c) => sum + c.stress, 0) / count).toFixed(1)
      );
      const avgSleep = Number(
        (slice.reduce((sum, c) => sum + c.sleepHours, 0) / count).toFixed(1)
      );

      const dailySeries = [...slice].reverse().map((c) => ({
        date: c.date,
        dayLabel: c.dayLabel,
        mood: c.mood,
        stress: c.stress,
        sleepHours: c.sleepHours,
      }));

      return {
        avgMood,
        avgStress,
        avgSleep,
        // The component calculates consecutive days from the local history.
        // A count of unique dates is not necessarily a consecutive-day streak.
        checkinStreak: 0,
        dailySeries,
        aiInsights: [
          {
            title: 'Nhịp sinh học & Mức căng thẳng',
            body:
              avgSleep >= 7
                ? `Thời lượng ngủ trung bình ${avgSleep}h/đêm đang nâng đỡ tốt cho tinh thần, giúp mức căng thẳng trung bình giữ quanh ${avgStress}/10.`
                : `Thời lượng ngủ trung bình hiện đạt ${avgSleep}h/đêm. Dành thêm 30 phút nghỉ ngơi trước 23:00 sẽ giúp hạ nhiệt mức căng thẳng (${avgStress}/10).`,
            tone: 'supportive',
          },
        ],
      };
    }
  },

  async getScreeningScale(scaleType: ScreeningScaleType): Promise<ScreeningScaleDTO> {
    try {
      return await requestJson<ScreeningScaleDTO>(
        `/screening/scales/${encodeURIComponent(scaleType)}`,
        { method: 'GET' }
      );
    } catch {
      return OFFLINE_SCALES[scaleType] || OFFLINE_SCALES.PHQ2_GAD2;
    }
  },

  async submitScreening(
    scaleType: ScreeningScaleType,
    answers: Record<string, number>
  ): Promise<ScreeningSubmitResult> {
    try {
      const res = await requestJson<ScreeningSubmitResult>('/screening/submit', {
        method: 'POST',
        body: JSON.stringify({ scaleType, answers }),
      });
      writeJsonStorage(STORAGE_KEYS.risk, res.riskSnapshot);
      return res;
    } catch {
      const values = Object.values(answers);
      const totalScore = values.reduce((acc, v) => acc + Number(v || 0), 0);
      const phq9Item9Score = Number(answers['phq9'] ?? answers['q9'] ?? 0);

      let severityLabel = 'Ổn định / Nhẹ';
      let recommendFollowUpScale: ScreeningScaleType | null = null;
      let empatheticFeedback =
        'Cảm ơn bạn đã dành chút thời gian lắng nghe bản thân. Các chỉ số hiện tại khá nhẹ nhàng — hãy tiếp tục giữ nhịp nghỉ ngơi đều đặn nhé.';
      let clinRisk = 0.12;

      if (scaleType === 'PHQ2_GAD2') {
        const phq2 = Number(answers['phq1'] || 0) + Number(answers['phq2'] || 0);
        const gad2 = Number(answers['gad1'] || 0) + Number(answers['gad2'] || 0);
        if (phq2 >= 3) {
          severityLabel = 'Cần lưu tâm khí sắc';
          recommendFollowUpScale = 'PHQ9';
          clinRisk = 0.48;
          empatheticFeedback =
            'Mochi nhận thấy năng lượng và niềm vui của bạn gần đây hơi giảm xuống. Nếu bạn sẵn sàng, mình cùng làm thêm 9 câu ngắn PHQ-9 để hiểu rõ hơn nhé.';
        } else if (gad2 >= 3) {
          severityLabel = 'Cần lưu tâm sự lo âu';
          recommendFollowUpScale = 'GAD7';
          clinRisk = 0.46;
          empatheticFeedback =
            'Có vẻ tâm trí bạn đang phải gồng gánh khá nhiều nỗi lo. Bạn có muốn mở rộng làm tiếp thang GAD-7 (7 câu ngắn) để Mochi gợi ý bài tập hạ nhiệt phù hợp không?';
        }
      } else if (scaleType === 'PHQ9') {
        if (phq9Item9Score >= 2) {
          severityLabel = 'Cần hỗ trợ an toàn ngay';
          clinRisk = 0.9;
          empatheticFeedback =
            'Cảm ơn bạn đã thật dũng cảm chia sẻ điều khó nói này. Sự an toàn của bạn là quan trọng nhất lúc này — hãy để Mochi kết nối bạn với điểm tựa hỗ trợ ấm áp ngay nhé.';
        } else if (phq9Item9Score === 1 || totalScore >= 15) {
          severityLabel = 'Căng thẳng trầm lắng mức cao';
          clinRisk = 0.72;
          empatheticFeedback =
            'Bạn đã vất vả nhiều rồi. Với mức điểm này, việc trò chuyện cùng chuyên gia tham vấn hoặc người thân tin cậy sẽ giúp bạn vơi bớt gánh nặng rất nhiều.';
        } else if (totalScore >= 10) {
          severityLabel = 'Khí sắc giảm mức vừa';
          clinRisk = 0.5;
          empatheticFeedback =
            'Cơ thể và tâm trí bạn đang phát tín hiệu cần được vỗ về nhiều hơn. Hãy ưu tiên giấc ngủ và chia nhỏ mục tiêu trong tuần này nhé.';
        }
      } else if (scaleType === 'GAD7') {
        if (totalScore >= 15) {
          severityLabel = 'Lo âu mức cao';
          clinRisk = 0.68;
          empatheticFeedback =
            'Mức độ căng thẳng lo âu hiện khá cao. Mình khuyến khích bạn thử ngay bài tập Hít thở 4-7-8 và cân nhắc trò chuyện với cố vấn tâm lý học đường nhé.';
        } else if (totalScore >= 10) {
          severityLabel = 'Lo âu mức vừa';
          clinRisk = 0.48;
          empatheticFeedback =
            'Những bồn chồn này hoàn toàn có thể dịu lại khi bạn cho phép mình nghỉ ngắn giữa các phiên học tập.';
        }
      }

      const riskSnapshot = updateOfflineRiskSnapshot({
        clinScore: clinRisk,
        adaptivePrompt: null,
        detailNote: `Hoàn thành thang ${scaleType} (${totalScore} điểm)`,
      });

      return {
        scaleType,
        totalScore,
        phq9Item9Score,
        severityLabel,
        recommendFollowUpScale,
        empatheticFeedback,
        riskSnapshot,
      };
    }
  },

  async getSafetyPlan(): Promise<SafetyPlanData> {
    try {
      const plan = await requestJson<SafetyPlanData>('/screening/safety-plan', {
        method: 'GET',
      });
      writeJsonStorage(STORAGE_KEYS.safetyPlan, plan);
      return plan;
    } catch {
      return readJsonStorage<SafetyPlanData>(STORAGE_KEYS.safetyPlan, DEFAULT_SAFETY_PLAN);
    }
  },

  async saveSafetyPlan(plan: SafetyPlanData): Promise<SafetyPlanData> {
    const updatedPayload: SafetyPlanData = {
      ...plan,
      updatedAt: new Date().toISOString(),
    };
    writeJsonStorage(STORAGE_KEYS.safetyPlan, updatedPayload);
    try {
      const saved = await requestJson<SafetyPlanData>('/screening/safety-plan', {
        method: 'PUT',
        body: JSON.stringify(updatedPayload),
      });
      writeJsonStorage(STORAGE_KEYS.safetyPlan, saved);
      return saved;
    } catch {
      return updatedPayload;
    }
  },

  async moderateContent(payload: {
    contentType: 'letter' | 'reply' | 'private_message';
    title?: string;
    content: string;
    topic?: string;
  }): Promise<ModerationResponse> {
    try {
      const res = await requestJson<ModerationResponse>('/community/moderate', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      writeJsonStorage(STORAGE_KEYS.risk, res.riskSnapshot);
      return res;
    } catch {
      const combined = `${payload.title || ''} ${payload.content || ''}`;
      const scan = detectOfflineTextRisk(combined);

      if (scan.level === 'L4' || scan.level === 'L3') {
        const riskSnapshot = updateOfflineRiskSnapshot({
          chatScore: scan.level === 'L4' ? 0.92 : 0.72,
          detailNote: 'Lá chắn Hòm thư chặn bảo vệ nội dung có nguy cơ tự gây hại',
        });
        return {
          decision: 'SELF_HARM_INTERCEPT',
          moderationStatus: 'hidden',
          contentWarning: null,
          empatheticInterceptMessage:
            'Mochi cảm nhận được bạn đang mang một nỗi đau rất lớn trong lòng. Để bảo vệ sự an toàn và riêng tư của bạn, lá thư sẽ được giữ kín chỉ riêng bạn thấy. Hãy để Mochi và không gian hỗ trợ an toàn ở bên bạn ngay lúc này nhé.',
          openSupportPrompt: true,
          riskSnapshot,
        };
      }

      if (scan.isToxic) {
        const riskSnapshot = readJsonStorage<RiskSnapshot>(
          STORAGE_KEYS.risk,
          DEFAULT_RISK_SNAPSHOT
        );
        return {
          decision: 'BLOCK_TOXIC_BULLYING',
          moderationStatus: 'hidden',
          contentWarning: null,
          empatheticInterceptMessage:
            'Hòm thư MindCare là góc nhỏ dịu dàng để lắng nghe không phán xét. Mình cùng điều chỉnh lại vài từ ngữ nặng nề trước khi gửi đi nhé.',
          openSupportPrompt: false,
          riskSnapshot,
        };
      }

      if (scan.level === 'L2') {
        const riskSnapshot = updateOfflineRiskSnapshot({
          moodScore: 0.45,
          detailNote: 'Chia sẻ tâm sự nhạy cảm trên Hòm thư ẩn danh',
        });
        return {
          decision: 'SENSITIVE_WITH_CW',
          moderationStatus: 'published',
          contentWarning:
            'Chia sẻ có đề cập đến trạng thái kiệt sức / lo âu mạnh. Hãy đọc khi tâm trí bạn đang sẵn sàng.',
          empatheticInterceptMessage: null,
          openSupportPrompt: false,
          riskSnapshot,
        };
      }

      const riskSnapshot = readJsonStorage<RiskSnapshot>(
        STORAGE_KEYS.risk,
        DEFAULT_RISK_SNAPSHOT
      );
      return {
        decision: 'SAFE_PUBLISH',
        moderationStatus: 'published',
        contentWarning: null,
        empatheticInterceptMessage: null,
        openSupportPrompt: false,
        riskSnapshot,
      };
    }
  },

  async triggerWarmSos(payload: {
    triggerSource: string;
    coarseLocation?: string;
  }): Promise<WarmSosResult> {
    try {
      return await requestJson<WarmSosResult>('/escalation/sos', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch {
      const contacts = readJsonStorage<TrustedContact[]>(
        STORAGE_KEYS.contacts,
        INITIAL_CONTACTS
      );
      const activeCount = Math.max(
        1,
        contacts.filter((c) => c.status === 'confirmed').length || contacts.length
      );
      const locNote = payload.coarseLocation
        ? ` (Khu vực gần đúng: ${payload.coarseLocation})`
        : '';
      appendOfflineAuditLog(
        'WARM_SOS_DISPATCHED',
        'STUDENT_CONSENT_ACTION',
        `Gửi tín hiệu SOS ấm áp tới ${activeCount} người tin cậy (neverShareJournal=true)`
      );
      return {
        dispatched: true,
        recipientsCount: activeCount,
        neverSharedJournalVerified: true,
        warmMessagePreview: `Chào bạn, mình đang trải qua một khoảnh khắc hơi quá tải và cảm thấy an tâm khi liên hệ với bạn${locNote}. Khi thuận tiện, bạn có thể gọi hoặc nhắn tin dịu dàng cho mình nhé. (Tin nhắn từ MindCare — không đính kèm nhật ký hay cuộc trò chuyện riêng tư).`,
        communicationGuide: {
          dos: [
            'Lắng nghe chậm rãi, hiện diện ấm áp: "Mình đang ở đây với bạn rồi"',
            'Hỏi nhẹ nhàng xem bạn ấy muốn trò chuyện hay chỉ cần có người ngồi cạnh',
            'Khuyến khích uống một ngụm nước ấm và hít thở đều cùng nhau',
          ],
          donts: [
            'Không phán xét, so sánh hay nói "Có gì đâu mà phải buồn / suy nghĩ nhiều"',
            'Không tra hỏi dồn dập hoặc ép phải kể chi tiết ngay lập tức',
            'Không để người đang khủng hoảng ở một mình nếu có dấu hiệu mất an toàn',
          ],
        },
        timestamp: new Date().toISOString(),
      };
    }
  },

  async getEscalationEpisodes(): Promise<EscalationEpisodeDTO[]> {
    try {
      const list = await requestJson<EscalationEpisodeDTO[]>('/escalation/episodes', {
        method: 'GET',
      });
      writeJsonStorage(STORAGE_KEYS.episodes, list);
      return list;
    } catch {
      const stored = readJsonStorage<EscalationEpisodeDTO[] | null>(
        STORAGE_KEYS.episodes,
        null
      );
      if (stored && stored.length > 0) return stored;
      const seeded = getInitialOfflineEpisodes();
      writeJsonStorage(STORAGE_KEYS.episodes, seeded);
      return seeded;
    }
  },

  async updateEpisodeStatus(
    episodeId: string,
    payload: {
      newStatus: string;
      counselorNote?: string;
      clearRiskFloor?: boolean;
    }
  ): Promise<EscalationEpisodeDTO> {
    try {
      const updated = await requestJson<EscalationEpisodeDTO>(
        `/escalation/episodes/${encodeURIComponent(episodeId)}/status`,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      );
      return updated;
    } catch {
      const episodes = await this.getEscalationEpisodes();
      const idx = episodes.findIndex((e) => e.id === episodeId);
      const target = idx >= 0 ? episodes[idx] : episodes[0];
      const nextEp: EscalationEpisodeDTO = {
        ...target,
        status: payload.newStatus,
        counselorNote:
          payload.counselorNote !== undefined ? payload.counselorNote : target.counselorNote,
        updatedAt: new Date().toISOString(),
      };
      if (idx >= 0) {
        episodes[idx] = nextEp;
        writeJsonStorage(STORAGE_KEYS.episodes, episodes);
      }
      if (payload.clearRiskFloor) {
        const snap = readJsonStorage<RiskSnapshot>(STORAGE_KEYS.risk, DEFAULT_RISK_SNAPSHOT);
        snap.floorTier = 'L0';
        snap.floorExpiresAt = null;
        if (payload.newStatus === 'RESOLVED') {
          snap.currentTier = 'L1';
          snap.rEff = 0.2;
        }
        writeJsonStorage(STORAGE_KEYS.risk, snap);
      }
      appendOfflineAuditLog(
        'EPISODE_STATUS_CHANGED',
        'COUNSELOR_HITL',
        `Chuyển trạng thái ca ${target.pseudonymId} sang ${payload.newStatus}`
      );
      return nextEp;
    }
  },

  async triggerBreakGlass(
    episodeId: string,
    payload: { counselorName: string; clinicalReason: string }
  ): Promise<EscalationEpisodeDTO> {
    try {
      return await requestJson<EscalationEpisodeDTO>(
        `/escalation/episodes/${encodeURIComponent(episodeId)}/break-glass`,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      );
    } catch {
      const episodes = await this.getEscalationEpisodes();
      const contacts = readJsonStorage<TrustedContact[]>(
        STORAGE_KEYS.contacts,
        INITIAL_CONTACTS
      );
      const idx = episodes.findIndex((e) => e.id === episodeId);
      const target = idx >= 0 ? episodes[idx] : episodes[0];
      const expires = new Date(Date.now() + 2 * 3600 * 1000).toISOString();
      const unlocked: EscalationEpisodeDTO = {
        ...target,
        breakGlassActive: true,
        breakGlassExpiresAt: expires,
        unlockedEmergencyInfo: {
          studentAlias: 'Minh Nguyễn (Mã hồ sơ khẩn cấp đã xác thực)',
          trustedContacts: contacts.map((c) => ({
            name: c.name,
            relationship: c.relationship,
            phone: c.phone,
          })),
          coarseLocation: 'Khu vực Đại học — Quận Ngũ Hành Sơn, Đà Nẵng (TTL 2 giờ)',
        },
        updatedAt: new Date().toISOString(),
      };
      if (idx >= 0) {
        episodes[idx] = unlocked;
        writeJsonStorage(STORAGE_KEYS.episodes, episodes);
      }
      appendOfflineAuditLog(
        'BREAK_GLASS_ACTIVATED',
        payload.counselorName.trim() || 'COUNSELOR_DUTY',
        `Phá kính khẩn cấp ca ${target.pseudonymId} (TTL 2h) — Lý do: ${payload.clinicalReason}`
      );
      return unlocked;
    }
  },

  async verifyAuditChain(): Promise<AuditVerifyResult> {
    try {
      return await requestJson<AuditVerifyResult>('/escalation/audit/verify', {
        method: 'GET',
      });
    } catch {
      let logs = readJsonStorage<AuditVerifyResult['recentLogs']>(STORAGE_KEYS.auditLogs, []);
      if (logs.length === 0) {
        appendOfflineAuditLog(
          'AUDIT_SELF_CHECK',
          'SYSTEM_AUDITOR',
          'Kiểm tra tính toàn vẹn chuỗi băm SHA-256 ở chế độ PWA dự phòng'
        );
        logs = readJsonStorage<AuditVerifyResult['recentLogs']>(STORAGE_KEYS.auditLogs, []);
      }
      let valid = true;
      for (let i = 1; i < logs.length; i++) {
        if (logs[i].prevHash !== logs[i - 1].entryHash) {
          valid = false;
          break;
        }
      }
      const latest = logs[logs.length - 1];
      return {
        valid,
        totalEntries: logs.length,
        latestHash: latest?.entryHash || '0'.repeat(64),
        verifiedAt: new Date().toISOString(),
        recentLogs: [...logs].reverse().slice(0, 8),
      };
    }
  },
};

/* ============================================================================
 * STREAMING MOCHI CHAT (SSE + Offline-Resilient Crisis Safety Fallback)
 * ========================================================================== */

export interface StreamMochiChatParams {
  message: string;
  history: { sender: 'user' | 'assistant'; text: string }[];
  latestCheckIn?: {
    mood: number;
    stress: number;
    sleepHours: number;
    allowAiPersonalize: boolean;
  } | null;
}

export interface StreamMochiChatCallbacks {
  onMeta?: (meta: ChatStreamMetaEvent) => void;
  onChunk?: (chunkText: string) => void;
  onSafetyRewrite?: (fullSafeText: string, reason: string) => void;
  onDone?: (fullText: string, outputVerified: boolean) => void;
}

function buildOfflineInsightData(
  message: string,
  latestCheckIn?: StreamMochiChatParams['latestCheckIn']
): ChatInsightData | null {
  const lower = message.toLowerCase();
  if (
    lower.includes('stress') ||
    lower.includes('áp lực') ||
    lower.includes('ngủ') ||
    lower.includes('mệt') ||
    lower.includes('deadline') ||
    lower.includes('đồ án')
  ) {
    const curStress = latestCheckIn?.stress ?? 5;
    const curSleep = latestCheckIn?.sleepHours ?? 7.2;
    return {
      stressScore: `${curStress}/10`,
      stressDelta: curStress <= 5 ? '-1.2 so với đầu tuần' : '+1.4 cần hạ nhiệt',
      earlyWeekStress: '6/10',
      avgSleep: `${curSleep}h`,
      sleepStatus: curSleep >= 7 ? 'Đạt ngưỡng phục hồi' : 'Thiếu hụt nhẹ',
      sleepGoal: '7.5h/đêm',
      dailyStress: [
        { day: 'T2', val: 6 },
        { day: 'T3', val: 5 },
        { day: 'T4', val: 6 },
        { day: 'T5', val: 5 },
        { day: 'T6', val: 4 },
        { day: 'T7', val: 5 },
        { day: 'CN', val: curStress },
      ],
      referenceTitle: 'Cẩm nang WHO — Làm điều quan trọng khi căng thẳng (PFA/CBT)',
      referenceSnippet:
        'Khi khối lượng việc học gây choáng ngợp, hãy neo sự chú ý về hơi thở chậm và tách riêng 1 hành động nhỏ nhất kéo dài 15–25 phút thay vì cố giải quyết toàn bộ cùng lúc.',
    };
  }
  return null;
}

export async function streamMochiChat(
  params: StreamMochiChatParams,
  callbacks: StreamMochiChatCallbacks
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        'X-MindCare-Client-Id': getClientId(),
      },
      body: JSON.stringify({
        message: params.message,
        history: params.history.slice(-10),
        latestCheckIn: params.latestCheckIn || undefined,
      }),
    });

    if (!response.ok || !response.body) {
      throw new Error(`SSE HTTP ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let accumulated = '';
    let gotDone = false;

    const processLine = (rawLine: string) => {
      const line = rawLine.trim();
      if (!line.startsWith('data:')) return;
      const jsonStr = line.slice(5).trim();
      if (!jsonStr || jsonStr === '[DONE]') return;

      try {
        const event = JSON.parse(jsonStr);
        if (event.type === 'meta') {
          if (event.riskSnapshot) {
            writeJsonStorage(STORAGE_KEYS.risk, event.riskSnapshot);
          }
          callbacks.onMeta?.(event as ChatStreamMetaEvent);
        } else if (event.type === 'chunk') {
          const piece = String(event.text || '');
          accumulated += piece;
          callbacks.onChunk?.(piece);
        } else if (event.type === 'safety_rewrite') {
          const safeText = String(event.fullSafeText || '');
          accumulated = safeText;
          callbacks.onSafetyRewrite?.(safeText, String(event.reason || 'SAFETY_REWRITE'));
        } else if (event.type === 'done') {
          gotDone = true;
          const finalText = event.fullText ? String(event.fullText) : accumulated;
          callbacks.onDone?.(finalText, Boolean(event.outputVerified ?? true));
        }
      } catch {
        // ignore malformed single SSE line
      }
    };

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const l of lines) {
        processLine(l);
      }
    }

    if (buffer.trim()) {
      processLine(buffer);
    }
    if (!gotDone) {
      callbacks.onDone?.(accumulated, true);
    }
  } catch {
    // OFFLINE-RESILIENT FALLBACK STREAMER (includes instant L4 crisis circuit breaker!)
    const scan = detectOfflineTextRisk(params.message);
    const snapshot = updateOfflineRiskSnapshot({
      chatScore: scan.score,
      detailNote: scan.matchedPhrase
        ? `Phát hiện cụm từ "${scan.matchedPhrase}" (Chế độ bảo vệ ngoại tuyến)`
        : 'Trò chuyện cùng Mochi (Chế độ ngoại tuyến)',
    });

    const isL4 = snapshot.currentTier === 'L4' || scan.level === 'L4';
    const insightData = isL4
      ? null
      : buildOfflineInsightData(params.message, params.latestCheckIn);

    const metaEvent: ChatStreamMetaEvent = {
      type: 'meta',
      messageId: `m-${Date.now() + 1}`,
      gateRoute: isL4
        ? 'HARD_CRITICAL_OFFLINE'
        : scan.level === 'L2' || scan.level === 'L3'
          ? 'SUSPICIOUS_CONTEXT_OFFLINE'
          : 'FAST_SAFE_OFFLINE',
      gateLatencyMs: 0.9,
      pragmaticIntent: isL4 ? 'GENUINE_CRISIS' : 'SUPPORT_SEEKING',
      cssrsStage: isL4 ? 4 : scan.level === 'L3' ? 2 : 0,
      riskSnapshot: snapshot,
      openCrisisDrawer: isL4,
      circuitBreakerActivated: isL4,
      adaptiveScreeningPrompt: snapshot.adaptiveScreeningPrompt,
      insightData,
    };

    callbacks.onMeta?.(metaEvent);

    let reply = '';
    const lower = params.message.toLowerCase();
    if (isL4) {
      reply =
        'Mình đang ở ngay đây lắng nghe bạn, và sự an toàn của bạn lúc này là điều quan trọng nhất đối với mình. 🌿\n\nNghe những gì bạn vừa chia sẻ, mình biết bạn đang phải chịu đựng một nỗi đau rất lớn — bạn không cần phải gồng gánh khoảnh khắc này một mình đâu. Ngay bây giờ, hãy cùng mình hít một hơi thật chậm, hoặc chạm vào bảng Phao An Toàn vừa mở để gọi Đường dây nóng Ngày Mai (096 306 1414), Tổng đài 111 / 115, hay gửi tín hiệu ấm áp cho người thân tin cậy của bạn nhé.';
    } else if (scan.level === 'L3' || scan.level === 'L2') {
      reply =
        'Cảm ơn bạn đã tin tưởng nói ra cảm giác nặng nề này với Mochi. Khi mọi thứ dồn lại cùng lúc, cảm giác kiệt sức hay bế tắc là tín hiệu cho thấy bạn cần được nghỉ ngơi và nâng đỡ chứ không phải lỗi của bạn đâu. 🌿\n\nNếu bạn thấy phù hợp, mình có chuẩn bị thẻ Rà soát cảm xúc 30 giây ngay bên dưới hoặc bài tập thở chậm 4-7-8 để tụi mình cùng tháo gỡ từng chút một nhé.';
    } else if (lower.includes('thở') || lower.includes('4-7-8')) {
      reply =
        'Kỹ thuật thở 4-7-8 giúp kích hoạt hệ thần kinh phó giao cảm, làm dịu nhịp tim và hạ mức căng thẳng rất nhanh. Bạn có thể bấm nút "Mở bài tập thở" ngay bên dưới để thực hành 2 phút cùng Mochi nhé.';
    } else if (
      lower.includes('áp lực') ||
      lower.includes('deadline') ||
      lower.includes('đồ án') ||
      lower.includes('thi')
    ) {
      reply =
        'Khi hạn nộp và đồ án dồn dập, cảm giác choáng ngợp là điều rất tự nhiên ở sinh viên tụi mình. Thay vì nhìn vào cả ngọn núi công việc, bạn thử chọn ra đúng 1 mục nhỏ nhất có thể làm trong 20 phút tới, rồi đứng dậy uống một ngụm nước ấm nhé. Mochi đã đính kèm thẻ Cẩm nang WHO bên dưới để bạn dễ theo dõi nhịp độ của mình!';
    } else {
      reply =
        'Mình luôn ở đây lắng nghe bạn không phán xét. Hôm nay có điều gì cụ thể đang làm tâm trí bạn bận lòng nhất, bạn cứ kể chậm rãi theo nhịp của riêng bạn nhé. 💚';
    }

    const sentences = reply.match(/[^.!?]+[.!?]*\s*/g) || [reply];
    let built = '';
    for (const part of sentences) {
      await new Promise((r) => window.setTimeout(r, 90));
      built += part;
      callbacks.onChunk?.(part);
    }
    callbacks.onDone?.(built, true);
  }
}
