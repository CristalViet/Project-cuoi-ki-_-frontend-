import React, { useState, useRef, useEffect } from 'react';
import {
  AdaptiveScreeningPrompt,
  ChatMessage,
  CheckIn,
  ConsentProfile,
  HealthStatusDTO,
  RiskSnapshot,
} from '../types';
import { soundEngine } from '../utils/audio';
import {
  MochiLandingHero,
  MochiRestingBanner,
  MochiHeadphones,
  MindCareBrandLogo,
} from './MochiIllustrations';
import { AdaptiveScreeningCard } from './AdaptiveScreeningCard';
import { DEFAULT_CONSENT_PROFILE, DEFAULT_RISK_SNAPSHOT } from '../services/apiClient';

interface SpeechRecognitionAlternativeLike {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionResultListLike {
  length: number;
  [index: number]: SpeechRecognitionResultLike;
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: SpeechRecognitionResultListLike;
}

interface SpeechRecognitionErrorEventLike {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface MindCareAIScreenProps {
  checkIn: CheckIn;
  messages: ChatMessage[];
  isStreaming?: boolean;
  riskSnapshot?: RiskSnapshot;
  consentProfile?: ConsentProfile;
  healthStatus?: HealthStatusDTO;
  activeScreeningPrompt?: AdaptiveScreeningPrompt | null;
  onSendMessage: (text: string) => void;
  onOpenBreathing: () => void;
  onOpenSettings: () => void;
  onOpenCrisisDrawer?: () => void;
  onRiskSnapshotUpdate?: (snapshot: RiskSnapshot) => void;
  onDismissScreeningPrompt?: () => void;
  onBack?: () => void;
  onActiveChatChange?: (isActive: boolean) => void;
}

const QUICK_TOPIC_CHIPS: {
  id: string;
  label: string;
  icon: string;
  prompt?: string;
  action?: 'screening';
}[] = [
  {
    id: 'chip-deadline',
    label: 'Áp lực đồ án & deadline',
    icon: 'schedule',
    prompt: 'Mình đang cảm thấy khá áp lực vì đồ án và deadline dồn dập.',
  },
  {
    id: 'chip-sleep',
    label: 'Khó ngủ mấy đêm nay',
    icon: 'bedtime',
    prompt: 'Mình bị khó ngủ mấy đêm nay và hay trằn trọc lúc nửa đêm.',
  },
  {
    id: 'chip-breath',
    label: 'Hướng dẫn thở 4-7-8',
    icon: 'air',
    prompt: 'Hướng dẫn mình thực hành nhịp thở 4-7-8 để hạ bớt căng thẳng nhé.',
  },
  {
    id: 'chip-screening',
    label: 'Rà soát cảm xúc 30s',
    icon: 'psychology_alt',
    action: 'screening',
  },
];

const TIER_META: Record<
  RiskSnapshot['currentTier'],
  { label: string; pillCls: string; dotCls: string }
> = {
  L0: {
    label: 'An toàn · L0',
    pillCls: 'bg-[#E7F1DF] text-[#1F5C43] border-[#C8DEC1]',
    dotCls: 'bg-[#3FB950]',
  },
  L1: {
    label: 'Đồng hành · L1',
    pillCls: 'bg-[#E7F1DF] text-[#1F5C43] border-[#C8DEC1]',
    dotCls: 'bg-[#3FB950]',
  },
  L2: {
    label: 'Lưu tâm nhẹ · L2',
    pillCls: 'bg-[#FFF8EF] text-[#A7683F] border-[#EBD4B9]',
    dotCls: 'bg-[#E78A45]',
  },
  L3: {
    label: 'Hỗ trợ ưu tiên · L3',
    pillCls: 'bg-[#FFF0E1] text-[#9E472A] border-[#ECC5A8]',
    dotCls: 'bg-[#E26D4D]',
  },
  L4: {
    label: 'Phao An Toàn · L4',
    pillCls: 'bg-[#FFE7DC] text-[#9E3B1E] border-[#EAB59E]',
    dotCls: 'bg-[#D94E28]',
  },
};

/* Cute Sprout Mochi circular avatar */
export const SproutAvatar: React.FC<{ size?: number; showOnline?: boolean }> = ({
  size = 40,
  showOnline = false,
}) => {
  return (
    <div
      className="relative rounded-full flex items-center justify-center shrink-0 border border-[#D5E4D2] bg-[#EAF4E6] shadow-[0_2px_6px_rgba(40,92,61,0.08)]"
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <svg
        width={size * 0.72}
        height={size * 0.72}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M50 28C50 18 56 10 68 12C68 24 58 28 50 28Z"
          fill="#5FA864"
          stroke="var(--color-primary)"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M48 30C44 20 34 16 26 22C28 32 40 33 48 30Z"
          fill="#86C789"
          stroke="var(--color-primary)"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path d="M50 28V36" stroke="var(--color-primary)" strokeWidth="3.5" strokeLinecap="round" />
        <ellipse
          cx="50"
          cy="62"
          rx="38"
          ry="30"
          fill="#D9EFCF"
          stroke="var(--color-primary)"
          strokeWidth="4"
        />
        <ellipse
          cx="34"
          cy="48"
          rx="10"
          ry="5"
          fill="var(--color-surface)"
          opacity={0.65}
          transform="rotate(-20 34 48)"
        />
        <circle cx="36" cy="62" r="4" fill="var(--color-primary)" />
        <circle cx="64" cy="62" r="4" fill="var(--color-primary)" />
        <ellipse cx="26" cy="69" rx="6" ry="4" fill="#F8A7A7" opacity="0.8" />
        <ellipse cx="74" cy="69" rx="6" ry="4" fill="#F8A7A7" opacity="0.8" />
        <path
          d="M44 68C47 73 53 73 56 68"
          stroke="var(--color-primary)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </svg>

      {showOnline && (
        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#3FB950] ring-2 ring-white shadow-xs" />
      )}
    </div>
  );
};

export const MindCareAIScreen: React.FC<MindCareAIScreenProps> = ({
  checkIn,
  messages,
  isStreaming = false,
  riskSnapshot = DEFAULT_RISK_SNAPSHOT,
  consentProfile = DEFAULT_CONSENT_PROFILE,
  healthStatus,
  activeScreeningPrompt = null,
  onSendMessage,
  onOpenBreathing,
  onOpenSettings,
  onOpenCrisisDrawer,
  onRiskSnapshotUpdate,
  onDismissScreeningPrompt,
  onBack,
  onActiveChatChange,
}) => {
  const [viewMode, setViewMode] = useState<'landing' | 'active'>('landing');

  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const [showCheckInContext, setShowCheckInContext] = useState(true);
  const [showPrivacySheet, setShowPrivacySheet] = useState(false);
  const [manualScreeningOpen, setManualScreeningOpen] = useState(false);

  const [suggestionsOpen, setSuggestionsOpen] = useState(true);
  const [checkedSuggestions, setCheckedSuggestions] = useState<Record<number, boolean>>({
    0: false,
    1: false,
    2: false,
  });

  const [isRelaxPlaying, setIsRelaxPlaying] = useState(false);
  const [relaxRemainingSecs, setRelaxRemainingSecs] = useState(180);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastMsgTextLenRef = useRef(0);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const voiceBaseTextRef = useRef<string>('');
  const voiceNoticeTimerRef = useRef<number | null>(null);

  const currentTier = riskSnapshot.currentTier || 'L0';
  const tierBadge = TIER_META[currentTier];
  const allowCheckinPersonalize = consentProfile.allowAiCheckinPersonalize;
  const showAdaptiveScreening = Boolean(activeScreeningPrompt) || manualScreeningOpen;

  const aiEngineOnline = Boolean(healthStatus?.online);
  const aiEngineStatusLabel = aiEngineOnline
    ? healthStatus?.geminiConfigured
      ? 'Online • Gemini Ready'
      : 'Online • Risk Engine v2.0'
    : 'Offline Safe-Mode';
  const aiEngineDotCls = aiEngineOnline ? 'bg-[#3FB950]' : 'bg-[#F59E0B]';

  const showTemporaryVoiceNotice = (msg: string) => {
    setVoiceNotice(msg);
    if (voiceNoticeTimerRef.current) {
      window.clearTimeout(voiceNoticeTimerRef.current);
    }
    voiceNoticeTimerRef.current = window.setTimeout(() => {
      setVoiceNotice(null);
    }, 5000);
  };

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      if (voiceNoticeTimerRef.current) {
        window.clearTimeout(voiceNoticeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    onActiveChatChange?.(viewMode === 'active');
  }, [viewMode, onActiveChatChange]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, [inputText]);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const lastMessage = messages[messages.length - 1];
  useEffect(() => {
    if (viewMode === 'active') {
      const currLen = lastMessage?.text?.length || 0;
      if (currLen !== lastMsgTextLenRef.current) {
        scrollToBottom('smooth');
        lastMsgTextLenRef.current = currLen;
      }
    }
  }, [messages, lastMessage?.text, viewMode]);

  useEffect(() => {
    let timer: number | null = null;
    if (isRelaxPlaying && relaxRemainingSecs > 0) {
      timer = window.setInterval(() => {
        setRelaxRemainingSecs((prev) => {
          if (prev <= 1) {
            setIsRelaxPlaying(false);
            soundEngine.stop();
            return 180;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRelaxPlaying, relaxRemainingSecs]);

  const toggleRelaxAudio = () => {
    if (isRelaxPlaying) {
      soundEngine.stop();
      setIsRelaxPlaying(false);
    } else {
      try {
        soundEngine.playLofiChimes();
      } catch {
        // ignore
      }
      setIsRelaxPlaying(true);
    }
  };

  const toggleVoiceRecognition = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const speechWin = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    };
    const SpeechRecognitionCtor =
      speechWin.SpeechRecognition || speechWin.webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      showTemporaryVoiceNotice(
        'Trình duyệt hiện tại chưa hỗ trợ nhận diện giọng nói trực tiếp. Bạn hãy mở trên Chrome hoặc Edge nhé.'
      );
      textareaRef.current?.focus();
      return;
    }

    try {
      recognitionRef.current?.abort();
      const recognition = new SpeechRecognitionCtor();
      recognition.lang = 'vi-VN';
      recognition.continuous = true;
      recognition.interimResults = true;
      voiceBaseTextRef.current = inputText.trim();

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceNotice(null);
      };

      recognition.onresult = (event: SpeechRecognitionEventLike) => {
        let spoken = '';
        for (let i = 0; i < event.results.length; i++) {
          const piece = event.results[i]?.[0]?.transcript || '';
          spoken += piece;
        }
        const cleaned = spoken.trim();
        const prefix = voiceBaseTextRef.current;
        setInputText(prefix && cleaned ? `${prefix} ${cleaned}` : prefix || cleaned);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
        setIsListening(false);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          showTemporaryVoiceNotice(
            'Chưa được cấp quyền Micro. Bạn hãy cho phép quyền Micro trên trình duyệt để nói cùng Mochi nhé.'
          );
        } else if (event.error === 'no-speech') {
          showTemporaryVoiceNotice(
            'Mochi chưa nghe thấy giọng nói, bạn chạm biểu tượng Micro để thử lại nhé.'
          );
        } else if (event.error !== 'aborted') {
          showTemporaryVoiceNotice(
            'Thu âm giọng nói vừa tạm ngắt, bạn có thể bấm Micro nói tiếp hoặc gõ phím nhé.'
          );
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      textareaRef.current?.focus();
    } catch {
      setIsListening(false);
      showTemporaryVoiceNotice(
        'Không thể khởi động thu âm lúc này. Bạn hãy thử gõ tin nhắn trực tiếp nhé.'
      );
    }
  };

  const handleSend = () => {
    if (!inputText.trim() || isStreaming) return;
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
    try {
      soundEngine.playChime('inhale');
    } catch {
      // ignore
    }
    if (viewMode === 'landing') {
      setViewMode('active');
    }
    onSendMessage(inputText.trim());
    setInputText('');
    setTimeout(() => scrollToBottom('smooth'), 120);
  };

  const handleQuickChipClick = (chip: (typeof QUICK_TOPIC_CHIPS)[number]) => {
    if (isStreaming) return;
    try {
      soundEngine.playChime('inhale');
    } catch {
      // ignore
    }
    if (viewMode === 'landing') {
      setViewMode('active');
    }
    if (chip.action === 'screening') {
      setManualScreeningOpen(true);
      setTimeout(() => scrollToBottom('smooth'), 140);
      return;
    }
    if (chip.prompt) {
      onSendMessage(chip.prompt);
      setTimeout(() => scrollToBottom('smooth'), 140);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const openCurrentChat = () => {
    setViewMode('active');
    setTimeout(() => scrollToBottom('smooth'), 150);
  };

  const toggleSuggestion = (index: number) => {
    setCheckedSuggestions((prev) => {
      const next = { ...prev, [index]: !prev[index] };
      try {
        soundEngine.playChime('hold');
      } catch {
        // ignore
      }
      return next;
    });
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const renderDesktopSidebar = () => (
    <aside
      aria-label="Điều hướng trò chuyện với Mochi"
      className="hidden lg:flex lg:w-[296px] xl:w-[320px] flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)]/80 p-4 overflow-y-auto shrink-0"
    >
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-[var(--color-border)]/70">
        <div className="flex items-center gap-2.5">
          <SproutAvatar size={36} showOnline={aiEngineOnline} />
          <div>
            <h2 className="text-[14px] font-bold text-[var(--color-primary)]">MindCare AI</h2>
            <p className="text-[11px] text-[var(--color-text-secondary)] flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${aiEngineDotCls}`} />
              <span>{aiEngineStatusLabel}</span>
            </p>
          </div>
        </div>
        <button
          onClick={openCurrentChat}
          type="button"
          title="Mở cuộc trò chuyện hiện tại"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-surface-mint)] text-[var(--color-primary)] transition hover:bg-[var(--color-highlight)]"
          aria-label="Mở cuộc trò chuyện hiện tại"
        >
          <span className="material-symbols-outlined text-[19px]">chat_bubble_outline</span>
        </button>
      </div>

      <div className="mt-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5">
        <p className="text-[12px] font-bold text-[var(--color-primary)]">
          Cuộc trò chuyện hiện tại
        </p>
        <p className="mt-1 text-[11.5px] leading-relaxed text-[var(--color-text-secondary)]">
          Lịch sử các cuộc trò chuyện riêng chưa khả dụng. Tin nhắn hiện tại được lưu trên thiết bị này.
        </p>
        <button
          onClick={openCurrentChat}
          type="button"
          className="mt-2 inline-flex min-h-9 items-center gap-1 rounded-full bg-[var(--color-surface-mint)] px-3 text-[11.5px] font-bold text-[var(--color-primary)] hover:bg-[var(--color-highlight)]"
        >
          Mở cuộc trò chuyện
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>

      <div className="mt-auto pt-4 space-y-2.5">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-chart-background)] p-3.5 space-y-2">
          <div className="flex items-center justify-between text-[11.5px]">
            <span className="font-bold text-[var(--color-primary)] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">psychology</span>
              Ngữ cảnh check-in
            </span>
            <button
              onClick={onOpenSettings}
              type="button"
              className="text-[11px] font-bold text-[var(--color-primary)] hover:underline"
            >
              Tùy chỉnh
            </button>
          </div>
          <p className="text-[12px] text-[var(--color-text-secondary)] tabular-nums">
            {allowCheckinPersonalize
              ? `Tâm trạng ${checkIn.mood}/10 · Stress ${checkIn.stress}/10`
              : 'Đã tắt chia sẻ dữ liệu check-in cho AI'}
          </p>
        </div>

        <button
          onClick={() => {
            setViewMode('active');
            setManualScreeningOpen(true);
          }}
          type="button"
          className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-3.5 py-2.5 text-left text-[12px] font-semibold text-[var(--color-primary)] hover:bg-[var(--color-surface-mint)]/50 flex items-center justify-between transition"
        >
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[17px] text-[var(--color-primary)]">
              psychology_alt
            </span>
            Rà soát cảm xúc 30 giây
          </span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        </button>

        <button
          onClick={() => setShowPrivacySheet(true)}
          type="button"
          className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-3.5 py-2.5 text-left text-[12px] font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface-mint)]/50 flex items-center justify-between transition"
        >
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[17px] text-[var(--color-primary)]">
              verified_user
            </span>
            Quyền riêng tư AI
          </span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        </button>
      </div>
    </aside>
  );

  const renderInsightCard = (insightData: NonNullable<ChatMessage['insightData']>) => (
    <div className="mt-2.5 rounded-2xl bg-[#FAF7EE] border border-[#DCE6D5] p-3.5 space-y-3">
      {/* Mini Metrics Summary */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-white border border-[#E7E8DE] p-2.5">
          <div className="flex items-center justify-between text-[10.5px] text-[#756455]">
            <span>Mức căng thẳng</span>
            <span className="font-semibold text-[#1F5C43]">{insightData.stressDelta}</span>
          </div>
          <p className="text-[16px] font-bold text-[#1F5C43] mt-0.5 tabular-nums">
            {insightData.stressScore}
            <span className="text-[10.5px] font-normal text-[#756455] ml-1.5">
              (Đầu tuần: {insightData.earlyWeekStress})
            </span>
          </p>
        </div>

        <div className="rounded-xl bg-white border border-[#E7E8DE] p-2.5">
          <div className="flex items-center justify-between text-[10.5px] text-[#756455]">
            <span>Giấc ngủ TB</span>
            <span className="font-semibold text-[#A7683F]">{insightData.sleepStatus}</span>
          </div>
          <p className="text-[16px] font-bold text-[#1F5C43] mt-0.5 tabular-nums">
            {insightData.avgSleep}
            <span className="text-[10.5px] font-normal text-[#756455] ml-1.5">
              (Mục tiêu {insightData.sleepGoal})
            </span>
          </p>
        </div>
      </div>

      {/* Mini 7-Day Stress Bar Chart */}
      {insightData.dailyStress && insightData.dailyStress.length > 0 && (
        <div className="rounded-xl bg-white border border-[#E7E8DE] px-3 pt-2.5 pb-2">
          <div className="flex items-center justify-between text-[10.5px] text-[#756455] mb-2">
            <span className="font-semibold text-[#1F5C43]">Biểu đồ căng thẳng 7 ngày</span>
            <span>Thang 0–10</span>
          </div>
          <div className="flex items-end justify-between gap-1.5 h-14">
            {insightData.dailyStress.map((d, idx) => {
              const barH = Math.max(14, Math.min(100, d.val * 10));
              const isHigh = d.val >= 7;
              return (
                <div key={`${d.day}-${idx}`} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <div
                    className={`w-full max-w-[22px] rounded-t-md ${
                      isHigh ? 'bg-[#E78A45]' : 'bg-[#1F5C43]/80'
                    }`}
                    style={{ height: `${barH}%` }}
                    title={`${d.day}: ${d.val}/10`}
                  />
                  <span className="text-[9.5px] font-semibold text-[#756455]">{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* WHO / CBT Reference Snippet */}
      {insightData.referenceTitle && (
        <div className="rounded-xl bg-[#E7F1DF]/75 border border-[#C6DEC0] p-2.5 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#1F5C43]">
            <span className="material-symbols-outlined text-[15px]">menu_book</span>
            <span>{insightData.referenceTitle}</span>
          </div>
          <p className="text-[12px] leading-relaxed text-[#285C3D]">
            {insightData.referenceSnippet}
          </p>
        </div>
      )}
    </div>
  );

  const renderMochiThinkingIndicator = () => (
    <div className="inline-flex items-center gap-2.5 py-0.5">
      <div className="flex items-center gap-1.5" aria-hidden="true">
        <span
          className="w-2 h-2 rounded-full bg-[#1F5C43] sprout-bounce"
          style={{ animationDelay: '0ms' }}
        />
        <span
          className="w-2 h-2 rounded-full bg-[#5FA864] sprout-bounce"
          style={{ animationDelay: '160ms' }}
        />
        <span
          className="w-2 h-2 rounded-full bg-[#E78A45] sprout-bounce"
          style={{ animationDelay: '320ms' }}
        />
      </div>
      <span className="text-[13.5px] italic text-[var(--color-text-secondary)]">
        Mochi đang lắng nghe và suy ngẫm...
      </span>
    </div>
  );

  const renderChatInputBar = () => (
    <div className="sticky bottom-0 z-30 px-3.5 md:px-6 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-[var(--color-background)]/95 backdrop-blur-md border-t border-[var(--color-border)]">
      {/* Quick Topic Chips (1-tap conversation starters) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2 md:max-w-3xl md:mx-auto">
        {QUICK_TOPIC_CHIPS.map((chip) => (
          <button
            key={chip.id}
            type="button"
            disabled={isStreaming}
            onClick={() => handleQuickChipClick(chip)}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFFCF7] hover:bg-[#E7F1DF] border border-[#DCE5D8] text-[12px] font-semibold text-[#1F5C43] shadow-2xs active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[15px] text-[#E78A45]">
              {chip.icon}
            </span>
            <span>{chip.label}</span>
          </button>
        ))}
      </div>

      {/* Live Voice Dictation Status / Gentle Browser Notice */}
      {isListening && (
        <div className="mb-2 md:max-w-3xl md:mx-auto flex items-center justify-between gap-2 rounded-full bg-[#FFF0E1] border border-[#F0CFAF] px-3.5 py-1 text-[11.5px] font-semibold text-[#A7683F] animate-fade-in">
          <span className="inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E78A45] animate-ping" />
            <span>Đang lắng nghe giọng nói của bạn... (Tiếng Việt)</span>
          </span>
          <button
            type="button"
            onClick={toggleVoiceRecognition}
            className="text-[11px] font-bold text-[#1F5C43] underline cursor-pointer"
          >
            Dừng
          </button>
        </div>
      )}

      {!isListening && voiceNotice && (
        <div className="mb-2 md:max-w-3xl md:mx-auto flex items-center justify-between gap-2 rounded-2xl bg-[#FFF8EF] border border-[#EBD4B9] px-3.5 py-1.5 text-[11.5px] text-[#756455] animate-fade-in">
          <span className="inline-flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px] text-[#E78A45]">info</span>
            <span>{voiceNotice}</span>
          </span>
          <button
            type="button"
            onClick={() => setVoiceNotice(null)}
            aria-label="Đóng thông báo"
            className="text-[#756455] hover:text-[var(--color-primary)] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">close</span>
          </button>
        </div>
      )}

      <div className="flex items-end gap-2 md:max-w-3xl md:mx-auto">
        <button
          onClick={() => {
            if (viewMode === 'landing') setViewMode('active');
            setManualScreeningOpen((prev) => !prev);
          }}
          type="button"
          className="w-10 h-10 mb-1 rounded-full bg-white border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] active:scale-95 transition-all shrink-0 shadow-xs cursor-pointer"
          aria-label="Mở rà soát cảm xúc nhanh"
          title="Rà soát cảm xúc nhanh (PHQ-2 / GAD-2)"
        >
          <span className="material-symbols-outlined text-[20px]">psychology_alt</span>
        </button>

        <div className="flex-1 min-h-[48px] bg-white rounded-[24px] border border-[var(--color-border)] px-4 py-2 flex items-end shadow-xs focus-within:border-[var(--color-primary)] focus-within:ring-1 focus-within:ring-[var(--color-primary)] transition-all">
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 max-h-32 resize-none bg-transparent border-0 py-1 text-[14.5px] leading-6 text-[var(--color-text-primary)] placeholder-[#819486] focus:outline-none focus:ring-0"
            placeholder="Nhập tin nhắn hoặc chạm Micro để nói... (Enter để gửi)"
          />
          <button
            onClick={toggleVoiceRecognition}
            aria-label={isListening ? 'Dừng thu âm giọng nói' : 'Thu âm giọng nói tiếng Việt'}
            aria-pressed={isListening}
            title={isListening ? 'Chạm để dừng thu âm' : 'Nói tiếng Việt cùng Mochi'}
            className={`w-8 h-8 mb-0.5 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
              isListening
                ? 'bg-[#FFF0E1] text-[#E78A45] ring-4 ring-[#E78A45]/25 animate-pulse'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface-mint)]/60 active:scale-95'
            }`}
            type="button"
          >
            <span className={`material-symbols-outlined text-[19px] ${isListening ? 'filled' : ''}`}>
              mic
            </span>
          </button>
        </div>

        <button
          onClick={handleSend}
          disabled={!inputText.trim() || isStreaming}
          aria-label="Gửi tin nhắn"
          className={`w-[48px] h-[48px] rounded-full flex items-center justify-center shadow-xs shrink-0 transition-all cursor-pointer ${
            inputText.trim() && !isStreaming
              ? 'bg-[var(--color-primary)] hover:bg-[var(--color-primary)] active:scale-95 text-white'
              : 'bg-[#D6DFD4] text-[#869A8B] cursor-not-allowed'
          }`}
          type="button"
        >
          <span className="material-symbols-outlined text-[20px] -rotate-45 -translate-y-0.5 translate-x-0.5">
            send
          </span>
        </button>
      </div>

      {/* Compact Medical Disclaimer & Synchronized Emergency Hotlines Bar */}
      <div className="mt-1.5 md:max-w-3xl md:mx-auto flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-[10.5px] text-[var(--color-text-secondary)] text-center leading-tight">
        <span>Mochi là trợ lý đồng hành tinh thần, không thay thế chẩn đoán y khoa.</span>
        <span className="inline-flex flex-wrap items-center gap-1.5 font-semibold text-[var(--color-primary)]">
          <span>Khẩn cấp:</span>
          <a href="tel:115" className="underline hover:opacity-80">115</a>
          <span>·</span>
          <a href="tel:111" className="underline hover:opacity-80">111</a>
          <span>·</span>
          <a href="tel:0963061414" className="underline hover:opacity-80">096 306 1414</a>
          <span>·</span>
          <a href="tel:19001267" className="underline hover:opacity-80">1900 1267</a>
          {onOpenCrisisDrawer && (
            <>
              <span>·</span>
              <button
                type="button"
                onClick={onOpenCrisisDrawer}
                className="text-[#A7683F] hover:text-[var(--color-primary)] font-bold underline cursor-pointer"
              >
                Phao an toàn
              </button>
            </>
          )}
        </span>
      </div>
    </div>
  );

  const renderPrivacyModal = () =>
    showPrivacySheet && (
      <div className="fixed inset-0 z-50 bg-black/35 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 animate-fade-in">
        <div className="w-full max-w-[390px] md:max-w-[440px] bg-[var(--color-surface)] rounded-3xl p-5 border border-[var(--color-border)] shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[var(--color-primary)] text-[22px]">
                verified_user
              </span>
              <h3 className="font-bold text-[16px] text-[var(--color-primary)]">
                Bảo mật &amp; Quyền riêng tư
              </h3>
            </div>
            <button
              onClick={() => setShowPrivacySheet(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-mint)] transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
            Dữ liệu nhạy cảm được bảo vệ bằng chuẩn mã hóa AES-256-GCM và kiểm duyệt đầu ra 4 tầng an toàn. Bạn toàn quyền bật/tắt việc Mochi sử dụng dữ liệu Check-in bất cứ lúc nào.
          </p>

          <div className="space-y-2 pt-1">
            <button
              onClick={() => {
                setShowPrivacySheet(false);
                onOpenSettings();
              }}
              className="w-full h-11 rounded-full bg-[var(--color-primary)] text-white font-bold text-[13.5px] flex items-center justify-center gap-2 hover:bg-[var(--color-primary)] transition-all"
              type="button"
            >
              Mở Cài đặt quyền riêng tư
            </button>
            <button
              onClick={() => {
                setShowPrivacySheet(false);
                onOpenBreathing();
              }}
              className="w-full h-11 rounded-full bg-[var(--color-surface-mint)] text-[var(--color-primary)] font-bold text-[13.5px] flex items-center justify-center gap-2 hover:brightness-95 transition-all"
              type="button"
            >
              Thực hành thở 4-7-8 ngay
            </button>
          </div>
        </div>
      </div>
    );

  // =========================================================================
  // LANDING STATE
  // =========================================================================
  if (viewMode === 'landing') {
    return (
      <div className="flex-1 flex flex-col md:flex-row md:h-screen md:overflow-hidden bg-[var(--color-background)] text-[var(--color-text-primary)] min-h-screen relative pb-20 md:pb-0 select-none font-sans">
        {renderDesktopSidebar()}

        <div className="flex-1 flex flex-col min-w-0 md:h-screen">
          <header className="px-5 pt-3 pb-2 flex md:hidden items-center justify-between shrink-0">
            <button
              onClick={onOpenSettings}
              type="button"
              className="w-10 h-10 rounded-full bg-white/80 border border-[var(--color-border)] flex items-center justify-center text-[var(--color-primary)] hover:bg-white active:scale-95 transition-all shadow-xs"
              aria-label="Hồ sơ người dùng"
              title="Cài đặt & Tài khoản"
            >
              <span className="material-symbols-outlined text-[20px]">person</span>
            </button>

            <MindCareBrandLogo size={22} />

            <button
              onClick={() =>
                currentTier === 'L3' || currentTier === 'L4'
                  ? onOpenCrisisDrawer?.()
                  : setShowPrivacySheet(true)
              }
              type="button"
              className="w-10 h-10 rounded-full bg-white/80 border border-[var(--color-border)] flex items-center justify-center text-[var(--color-primary)] hover:bg-white active:scale-95 transition-all shadow-xs relative"
              aria-label="Trạng thái bảo vệ"
            >
              <span className="material-symbols-outlined text-[20px]">shield_with_heart</span>
              <span className={`w-2 h-2 rounded-full ${tierBadge.dotCls} absolute top-2.5 right-2.5 ring-2 ring-white`} />
            </button>
          </header>

          <header className="hidden md:flex items-center justify-between px-6 py-3 border-b border-[var(--color-border)] bg-[var(--color-background)]/95">
            <div className="flex items-center gap-3">
              <SproutAvatar size={38} showOnline={aiEngineOnline} />
              <div>
                <h1 className="text-[15.5px] font-bold text-[var(--color-primary)]">
                  MindCare AI · Mochi
                </h1>
                <p className="text-[11.5px] text-[var(--color-text-secondary)] flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${aiEngineDotCls}`} />
                  <span>{aiEngineStatusLabel} · Không gian riêng tư</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenCrisisDrawer?.()}
                type="button"
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11.5px] font-bold transition cursor-pointer ${tierBadge.pillCls}`}
              >
                <span className={`w-2 h-2 rounded-full ${tierBadge.dotCls}`} />
                <span>{tierBadge.label}</span>
              </button>
              <button
                onClick={() => setShowPrivacySheet(true)}
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-white px-3.5 py-1.5 text-[12px] font-semibold text-[var(--color-primary)] hover:bg-[var(--color-surface-mint)]"
              >
                <span className="material-symbols-outlined text-[16px]">verified_user</span>
                Bảo mật
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-5 md:px-8 pt-2 pb-6 flex flex-col">
            <div className="md:max-w-2xl md:mx-auto md:w-full md:my-auto">
              <div className="flex flex-col items-center justify-center pt-3 pb-1">
                <MochiLandingHero className="w-60 h-52 md:w-64 md:h-56" />
              </div>

              <div className="text-center px-2 mt-1">
                <h1 className="text-[26px] md:text-[30px] font-bold text-[var(--color-primary)] tracking-tight leading-snug">
                  Tâm sự cùng Mochi
                </h1>
                <p className="text-[14.5px] md:text-[15.5px] text-[var(--color-text-secondary)] mt-2 leading-relaxed max-w-[340px] md:max-w-md mx-auto font-normal">
                  Chia sẻ cảm xúc, suy nghĩ và những điều đang làm bạn bận lòng. Mochi luôn ở đây lắng
                  nghe bạn. 💚
                </p>
              </div>

              <div className="mt-5 md:max-w-sm md:mx-auto space-y-2.5">
                <button
                  onClick={openCurrentChat}
                  type="button"
                  className="w-full h-[52px] bg-[var(--color-primary)] hover:bg-[var(--color-primary)] active:scale-[0.98] text-white rounded-full flex items-center justify-center gap-2.5 shadow-[0_4px_16px_rgba(40,92,61,0.22)] transition-all cursor-pointer font-semibold text-[15.5px]"
                >
                  <span className="material-symbols-outlined text-[20px]">chat_bubble_outline</span>
                  <span>{messages.length > 0 ? 'Tiếp tục trò chuyện' : 'Bắt đầu trò chuyện'}</span>
                  <span className="material-symbols-outlined text-[19px] ml-0.5">arrow_forward</span>
                </button>

                {(currentTier === 'L3' || currentTier === 'L4') && onOpenCrisisDrawer && (
                  <button
                    onClick={onOpenCrisisDrawer}
                    type="button"
                    className="w-full h-11 rounded-full bg-[#FFF0E1] border border-[#EBC5A6] text-[#9E472A] font-bold text-[13.5px] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">spa</span>
                    <span>Mở Phao An Toàn &amp; Đường dây nóng 1-chạm</span>
                  </button>
                )}

                {/* Mobile 1-tap Quick Topic Chips on Landing */}
                <div className="md:hidden pt-1.5 flex flex-wrap items-center justify-center gap-1.5">
                  {QUICK_TOPIC_CHIPS.map((chip) => (
                    <button
                      key={chip.id}
                      type="button"
                      disabled={isStreaming}
                      onClick={() => handleQuickChipClick(chip)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#FFFCF7] hover:bg-[#E7F1DF] border border-[#DCE5D8] text-[11.5px] font-semibold text-[#1F5C43] shadow-2xs active:scale-95 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px] text-[#E78A45]">
                        {chip.icon}
                      </span>
                      <span>{chip.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-7 lg:hidden rounded-2xl border border-[var(--color-border)] bg-white/80 px-4 py-3 text-center">
                <p className="text-[12px] leading-relaxed text-[var(--color-text-secondary)]">
                  Lịch sử cuộc trò chuyện riêng chưa khả dụng. Tin nhắn hiện tại được lưu trên thiết bị này.
                </p>
              </div>
            </div>
          </div>

          <div className="hidden md:block">{renderChatInputBar()}</div>
        </div>

        {renderPrivacyModal()}
      </div>
    );
  }

  // =========================================================================
  // ACTIVE CHAT SCREEN (SSE Real-Time + WHO/CBT Insights + Adaptive Screening)
  // =========================================================================
  return (
    <div className="flex-1 flex flex-col md:flex-row md:h-screen md:overflow-hidden bg-[var(--color-background)] text-[var(--color-text-primary)] min-h-[100dvh] relative select-none font-sans">
      {renderDesktopSidebar()}

      <div className="flex-1 flex flex-col min-w-0 md:h-screen">
        {/* 1. CHAT HEADER */}
        <header className="sticky top-0 z-30 bg-[var(--color-background)]/95 backdrop-blur-md px-4 md:px-6 pt-3 pb-2 border-b border-[var(--color-border)]">
          <div className="flex items-center justify-between gap-2 md:max-w-3xl md:mx-auto">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                onClick={() => {
                  setViewMode('landing');
                  onBack?.();
                }}
                type="button"
                className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--color-primary)] hover:bg-[var(--color-surface-mint)] active:scale-95 transition-all shrink-0"
                aria-label="Quay lại"
              >
                <span className="material-symbols-outlined text-[24px]">chevron_left</span>
              </button>

              <SproutAvatar size={40} showOnline={aiEngineOnline} />

              <div className="flex flex-col min-w-0">
                <span className="text-[15.5px] font-bold text-[var(--color-primary)] tracking-tight leading-tight truncate">
                  MindCare AI · Mochi
                </span>
                <span className="text-[11.5px] text-[var(--color-text-secondary)] font-medium flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      isStreaming ? 'bg-[#E78A45] animate-pulse' : aiEngineDotCls
                    }`}
                  />
                  <span className="truncate">
                    {isStreaming ? 'Đang phản hồi trực tiếp...' : aiEngineStatusLabel}
                  </span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Subtle Safety Protection Tier Badge */}
              <button
                type="button"
                onClick={() =>
                  currentTier === 'L3' || currentTier === 'L4'
                    ? onOpenCrisisDrawer?.()
                    : setManualScreeningOpen((prev) => !prev)
                }
                title="Chạm để mở Phao An Toàn hoặc Rà soát cảm xúc"
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold transition-all active:scale-95 cursor-pointer ${tierBadge.pillCls}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${tierBadge.dotCls}`} />
                <span>{tierBadge.label}</span>
              </button>

              <button
                onClick={() => setShowPrivacySheet(true)}
                type="button"
                className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-mint)] active:scale-95 transition-all"
                aria-label="Tùy chọn bảo mật"
              >
                <span className="material-symbols-outlined text-[20px]">more_vert</span>
              </button>
            </div>
          </div>

          {/* Quick Support Banner when riskSnapshot.currentTier is L2 / L3 / L4 */}
          {(currentTier === 'L2' || currentTier === 'L3' || currentTier === 'L4') && (
            <div className="mt-2.5 md:max-w-3xl md:mx-auto">
              <div
                className={`rounded-2xl border px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 ${
                  currentTier === 'L4'
                    ? 'bg-[#FFEFE6] border-[#EAB59E] text-[#9E3B1E]'
                    : currentTier === 'L3'
                      ? 'bg-[#FFF4E6] border-[#ECCBA8] text-[#8B4D24]'
                      : 'bg-[#FFF8EF] border-[#E8D7BE] text-[#7A542E]'
                }`}
              >
                <div className="flex items-center gap-2 text-[12px] font-semibold">
                  <span className="material-symbols-outlined text-[18px]">spa</span>
                  <span>
                    {currentTier === 'L4'
                      ? 'Bạn không một mình — Chế độ Sơ cứu Tâm lý WHO PFA luôn sẵn sàng bên bạn.'
                      : currentTier === 'L3'
                        ? 'Mochi nhận thấy bạn đang chịu nhiều áp lực. Hãy mở Phao An Toàn hoặc thở chậm nhé.'
                        : 'Cần một nhịp nghỉ ngắn? Bạn có thể thở 4-7-8 hoặc rà soát cảm xúc 30 giây.'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {onOpenCrisisDrawer && (
                    <button
                      type="button"
                      onClick={onOpenCrisisDrawer}
                      className="h-8 px-3 rounded-full bg-[#1F5C43] text-white text-[11.5px] font-bold flex items-center gap-1 shadow-2xs active:scale-95 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">shield_with_heart</span>
                      <span>Phao An Toàn</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onOpenBreathing}
                    className="h-8 px-3 rounded-full bg-white/90 border border-[#D7C8B5] text-[#1F5C43] text-[11.5px] font-bold cursor-pointer"
                  >
                    Thở 4-7-8
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Check-in Personalization Context Pill (strictly respects consentProfile.allowAiCheckinPersonalize) */}
          {showCheckInContext && (
            <div className="mt-2 md:max-w-3xl md:mx-auto">
              <div className="bg-[var(--color-surface-mint)] border border-[#D5E6D0] rounded-full px-3.5 py-1.5 flex items-center justify-between text-[var(--color-primary)] shadow-2xs">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="material-symbols-outlined text-[var(--color-primary)] text-[16px] shrink-0">
                    {allowCheckinPersonalize ? 'psychology' : 'visibility_off'}
                  </span>
                  <p className="text-[12px] font-medium truncate text-[var(--color-primary)]">
                    {allowCheckinPersonalize
                      ? `Đang dùng dữ liệu check-in (Tâm trạng: ${checkIn.mood}/10, Stress: ${checkIn.stress}/10)`
                      : 'Đã tắt chia sẻ dữ liệu check-in cho AI (Chế độ ẩn ngữ cảnh)'}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={onOpenSettings}
                    type="button"
                    className="text-[11.5px] font-bold text-[var(--color-primary)] hover:underline px-1 cursor-pointer"
                  >
                    Tùy chỉnh
                  </button>
                  <button
                    onClick={() => setShowCheckInContext(false)}
                    type="button"
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
                    aria-label="Ẩn thông báo"
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </header>

        {/* 2. CHAT MESSAGES SCROLL AREA */}
        <section
          aria-label="Nội dung tin nhắn"
          className="flex-1 px-4 md:px-6 py-3 md:py-5 overflow-y-auto pb-28 md:pb-10"
        >
          <div className="space-y-4 md:max-w-3xl md:mx-auto">
            <div className="pt-1 pb-1">
              <MochiRestingBanner showBooksAndCoffee={false} className="w-full h-36 md:h-40" />
            </div>

            {/* Message Stream */}
            {messages.map((msg) => {
              if (msg.sender === 'user') {
                return (
                  <div key={msg.id} className="flex flex-col items-end gap-1 animate-slide-up">
                    <div className="max-w-[85%] md:max-w-[72%] bg-[var(--color-primary)] text-white rounded-[20px] rounded-br-[4px] px-4 py-3 shadow-[0_2px_8px_rgba(40,92,61,0.12)]">
                      <p className="text-[14.5px] leading-relaxed font-normal text-white whitespace-pre-wrap">
                        {msg.text}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 pr-1 text-[11.5px] text-[#788E80] font-medium">
                      <span>{msg.time}</span>
                      <span className="material-symbols-outlined text-[13px] text-[#3FA76A]">
                        done_all
                      </span>
                    </div>
                  </div>
                );
              }

              const isCurrentStreamingBubble =
                isStreaming && msg.id === lastMessage?.id && msg.sender === 'assistant';

              return (
                <div key={msg.id} className="flex items-start gap-2.5 animate-slide-up">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <SproutAvatar size={32} />
                  </div>

                  <div className="flex flex-col items-start gap-1 flex-1 max-w-[88%] md:max-w-[78%]">
                    <div
                      className={`bg-white text-[var(--color-text-primary)] rounded-[20px] rounded-tl-[4px] px-4 py-3.5 shadow-[0_2px_10px_rgba(40,92,61,0.04)] border space-y-2.5 w-full ${
                        msg.circuitBreakerActivated
                          ? 'border-[#E78A45] bg-[#FFFCF8]'
                          : 'border-[var(--color-border)]'
                      }`}
                    >
                      {msg.circuitBreakerActivated && (
                        <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-[#EFE3D3]">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#9E472A]">
                            <span className="material-symbols-outlined text-[15px]">
                              shield_with_heart
                            </span>
                            Sơ cứu Tâm lý WHO PFA
                          </span>
                          {onOpenCrisisDrawer && (
                            <button
                              type="button"
                              onClick={onOpenCrisisDrawer}
                              className="text-[11px] font-bold text-[#1F5C43] underline cursor-pointer"
                            >
                              Mở Phao An Toàn →
                            </button>
                          )}
                        </div>
                      )}

                      {isCurrentStreamingBubble && !msg.text ? (
                        renderMochiThinkingIndicator()
                      ) : (
                        <p className="text-[14.5px] leading-relaxed text-[var(--color-text-primary)] whitespace-pre-wrap">
                          {msg.text}
                          {isCurrentStreamingBubble && Boolean(msg.text) && (
                            <span className="typing-caret" aria-hidden="true" />
                          )}
                        </p>
                      )}

                      {/* Restored WHO / CBT & Biometric Insight Card right inside Mochi's Bubble */}
                      {msg.insightData && renderInsightCard(msg.insightData)}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pl-1 text-[11.5px] text-[#7A8C7F] font-medium">
                      <span>{msg.time}</span>
                      {msg.safetyRewritten ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF8EF] border border-[#EBD4B9] px-2 py-0.5 text-[10.5px] font-semibold text-[#A7683F]">
                          <span className="material-symbols-outlined text-[12px] text-[#E78A45]">
                            verified_user
                          </span>
                          Đã tinh chỉnh ngôn từ an toàn (Layer 4 Verified)
                        </span>
                      ) : (
                        msg.outputVerified && (
                          <span className="inline-flex items-center gap-0.5 text-[10.5px] text-[#1F5C43]/80">
                            <span className="material-symbols-outlined text-[12px]">verified</span>
                            Đã kiểm duyệt an toàn
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Embedded Adaptive 2-Phase Screening Card */}
            {showAdaptiveScreening && (
              <AdaptiveScreeningCard
                prompt={activeScreeningPrompt}
                onRiskSnapshotUpdate={(snap) => {
                  onRiskSnapshotUpdate?.(snap);
                }}
                onOpenCrisisDrawer={onOpenCrisisDrawer}
                onOpenBreathing={onOpenBreathing}
                onDismiss={() => {
                  setManualScreeningOpen(false);
                  onDismissScreeningPrompt?.();
                }}
              />
            )}

            {/* AI SUGGESTIONS & RELAXATION CARDS */}
            <div className="space-y-3 pt-1 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
              <div className="bg-white rounded-[22px] border border-[var(--color-border)] p-4 shadow-[0_2px_12px_rgba(40,92,61,0.03)]">
                <button
                  onClick={() => setSuggestionsOpen(!suggestionsOpen)}
                  type="button"
                  className="w-full flex items-center justify-between text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[var(--color-surface-mint)] flex items-center justify-center text-[var(--color-primary)]">
                      <span className="material-symbols-outlined text-[18px]">event_available</span>
                    </div>
                    <h3 className="font-bold text-[15.5px] text-[var(--color-primary)]">
                      Gợi ý cho bạn
                    </h3>
                  </div>
                  <span
                    className={`material-symbols-outlined text-[20px] text-[var(--color-text-secondary)] transition-transform duration-200 ${
                      suggestionsOpen ? 'rotate-180' : ''
                    }`}
                  >
                    expand_more
                  </span>
                </button>

                {suggestionsOpen && (
                  <div className="mt-3.5 space-y-2.5 pt-1 border-t border-[var(--color-chart-background)]">
                    {[
                      'Chia nhỏ nhiệm vụ theo từng ngày',
                      'Ưu tiên 2–3 việc quan trọng nhất',
                      'Dành thời gian nghỉ ngắn để nạp lại năng lượng',
                    ].map((itemText, idx) => {
                      const isChecked = Boolean(checkedSuggestions[idx]);
                      return (
                        <button
                          key={idx}
                          onClick={() => toggleSuggestion(idx)}
                          type="button"
                          className="w-full flex items-start gap-3 py-1 text-left cursor-pointer group"
                        >
                          <div
                            className={`w-5 h-5 rounded-[6px] border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                              isChecked
                                ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white'
                                : 'border-[var(--color-border)] bg-white group-hover:border-[var(--color-primary)]'
                            }`}
                          >
                            {isChecked && (
                              <span className="material-symbols-outlined text-[15px] font-bold">
                                check
                              </span>
                            )}
                          </div>
                          <span
                            className={`text-[14px] leading-snug transition-colors ${
                              isChecked
                                ? 'line-through text-[#8C9E92]'
                                : 'text-[var(--color-text-primary)]'
                            }`}
                          >
                            {itemText}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div
                className="rounded-[22px] p-4 border border-[#F3DAC5] shadow-[0_2px_12px_rgba(246,214,184,0.18)] flex items-center justify-between"
                style={{
                  background: 'linear-gradient(135deg, #FEF5EC 0%, #FBE7D4 100%)',
                }}
              >
                <div className="flex-1 pr-3">
                  <div className="flex items-center gap-2 text-[#E26D4D]">
                    <span className="material-symbols-outlined text-[18px]">favorite_border</span>
                    <h3 className="font-bold text-[15.5px] text-[#A64627]">Bài tập thư giãn</h3>
                  </div>

                  <p className="text-[13px] text-[var(--color-text-secondary)] mt-1 leading-relaxed">
                    Thử 3 phút hít thở để giảm căng thẳng nhé!
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      onClick={toggleRelaxAudio}
                      type="button"
                      className="h-9 px-4 rounded-full bg-white/90 hover:bg-white text-[var(--color-primary)] font-bold text-[13px] border border-[#E7C7AE] flex items-center gap-2 shadow-2xs active:scale-95 transition-all cursor-pointer tabular-nums"
                    >
                      <span
                        className="material-symbols-outlined text-[18px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {isRelaxPlaying ? 'pause' : 'play_arrow'}
                      </span>
                      <span>{formatTime(relaxRemainingSecs)}</span>
                    </button>

                    <button
                      onClick={onOpenBreathing}
                      type="button"
                      className="text-[12px] text-[#A64627] hover:underline font-semibold px-2 cursor-pointer"
                    >
                      Mở bài tập thở →
                    </button>
                  </div>
                </div>

                <div className="shrink-0">
                  <MochiHeadphones className="w-24 h-22" />
                </div>
              </div>
            </div>

            {isStreaming && (!lastMessage || lastMessage.sender === 'user') && (
              <div className="flex items-start gap-2.5 animate-fade-in">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <SproutAvatar size={32} />
                </div>
                <div className="bg-white border border-[var(--color-border)] rounded-[20px] rounded-tl-[4px] px-4 py-3 shadow-xs">
                  {renderMochiThinkingIndicator()}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </section>

        {/* 3. CHAT INPUT BAR */}
        {renderChatInputBar()}
      </div>

      {renderPrivacyModal()}
    </div>
  );
};
