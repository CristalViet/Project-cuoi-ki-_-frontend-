import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, CheckIn } from '../types';
import { soundEngine } from '../utils/audio';
import {
  MochiLandingHero,
  MochiRestingBanner,
  MochiHeadphones,
  MindCareBrandLogo,
} from './MochiIllustrations';

interface MindCareAIScreenProps {
  checkIn: CheckIn;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onOpenBreathing: () => void;
  onOpenSettings: () => void;
  onBack?: () => void;
  onActiveChatChange?: (isActive: boolean) => void;
}

interface RecentTopic {
  id: string;
  title: string;
  preview: string;
  time: string;
  icon: 'leaf' | 'heart' | 'sun';
  initialPrompt?: string;
}

const RECENT_CONVERSATIONS: RecentTopic[] = [
  {
    id: 'topic-work',
    title: 'Áp lực công việc',
    preview: 'Mình hiểu cảm giác áp lực đó...',
    time: 'Hôm nay',
    icon: 'leaf',
    initialPrompt: 'Mình khá áp lực vì dự án môn tốt nghiệp.',
  },
  {
    id: 'topic-sleep',
    title: 'Giấc ngủ',
    preview: 'Để ngủ ngon hơn, bạn có thể...',
    time: 'Hôm qua',
    icon: 'heart',
    initialPrompt: 'Dạo này mình khó ngủ và hay tỉnh giấc lúc nửa đêm.',
  },
  {
    id: 'topic-direction',
    title: 'Định hướng bản thân',
    preview: 'Đó là một câu hỏi rất hay! ...',
    time: '3 ngày trước',
    icon: 'sun',
    initialPrompt: 'Mình đang phân vân về định hướng nghề nghiệp sắp tới.',
  },
];

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
  onSendMessage,
  onOpenBreathing,
  onOpenSettings,
  onBack,
  onActiveChatChange,
}) => {
  // Screen state: 'landing' (Screen A) or 'active' (Screen B & C)
  const [viewMode, setViewMode] = useState<'landing' | 'active'>('landing');
  const [activeTopicId, setActiveTopicId] = useState<string>('topic-work');

  // Input & message states
  const [inputText, setInputText] = useState('');
  const [isWaitingResponse, setIsWaitingResponse] = useState(false);
  const [showCheckInContext, setShowCheckInContext] = useState(true);
  const [showPrivacySheet, setShowPrivacySheet] = useState(false);

  // Suggestions checklist state (Screen C)
  const [suggestionsOpen, setSuggestionsOpen] = useState(true);
  const [checkedSuggestions, setCheckedSuggestions] = useState<Record<number, boolean>>({
    0: false,
    1: false,
    2: false,
  });

  // Relaxation timer state (Screen C)
  const [isRelaxPlaying, setIsRelaxPlaying] = useState(false);
  const [relaxRemainingSecs, setRelaxRemainingSecs] = useState(180); // 3:00

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const prevMessagesCountRef = useRef(messages.length);

  // Sync viewMode to parent to control bottom nav visibility
  useEffect(() => {
    onActiveChatChange?.(viewMode === 'active');
  }, [viewMode, onActiveChatChange]);

  // Auto resize chat textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, [inputText]);

  // Scroll to bottom on new messages
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    if (viewMode === 'active') {
      if (messages.length > prevMessagesCountRef.current) {
        setIsWaitingResponse(false);
        scrollToBottom('smooth');
      }
      prevMessagesCountRef.current = messages.length;
    }
  }, [messages, viewMode]);

  // Handle relaxing timer countdown
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

  const handleSend = () => {
    if (!inputText.trim()) return;
    try {
      soundEngine.playChime('inhale');
    } catch {
      // ignore
    }
    if (viewMode === 'landing') {
      setViewMode('active');
    }
    setIsWaitingResponse(true);
    onSendMessage(inputText.trim());
    setInputText('');
    setTimeout(() => scrollToBottom('smooth'), 120);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startNewChat = (topicPrompt?: string, topicId?: string) => {
    if (topicId) setActiveTopicId(topicId);
    setViewMode('active');
    if (topicPrompt) {
      setIsWaitingResponse(true);
      onSendMessage(topicPrompt);
    }
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
      aria-label="Lịch sử trò chuyện với Mochi"
      className="hidden lg:flex lg:w-[296px] xl:w-[320px] flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)]/80 p-4 overflow-y-auto shrink-0"
    >
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-[var(--color-border)]/70">
        <div className="flex items-center gap-2.5">
          <SproutAvatar size={36} showOnline />
          <div>
            <h2 className="text-[14px] font-bold text-[var(--color-primary)]">MindCare AI</h2>
            <p className="text-[11px] text-[var(--color-text-secondary)]">Mochi luôn lắng nghe</p>
          </div>
        </div>
        <button
          onClick={() => setViewMode('active')}
          type="button"
          title="Cuộc trò chuyện mới"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-surface-mint)] text-[var(--color-primary)] transition hover:bg-[var(--color-highlight)]"
        >
          <span className="material-symbols-outlined text-[19px]">edit_square</span>
        </button>
      </div>

      <div className="mt-4">
        <p className="px-1 mb-2 text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
          Cuộc trò chuyện gần đây
        </p>
        <div className="space-y-2">
          {RECENT_CONVERSATIONS.map((topic) => {
            const isSelected = activeTopicId === topic.id && viewMode === 'active';
            const iconBgColor =
              topic.icon === 'leaf'
                ? 'bg-[var(--color-surface-mint)] text-[var(--color-primary)]'
                : topic.icon === 'heart'
                ? 'bg-[#FDF0E6] text-[#E57353]'
                : 'bg-[#FEF7DE] text-[#D89324]';
            const iconSymbol =
              topic.icon === 'leaf' ? 'eco' : topic.icon === 'heart' ? 'favorite' : 'wb_sunny';

            return (
              <button
                key={topic.id}
                onClick={() => startNewChat(topic.initialPrompt, topic.id)}
                type="button"
                className={`w-full rounded-2xl p-3 border text-left transition flex items-start gap-2.5 ${
                  isSelected
                    ? 'border-[var(--color-secondary)] bg-[var(--color-surface-mint)]/60'
                    : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-chart-background)]'
                }`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${iconBgColor}`}>
                  <span className="material-symbols-outlined text-[18px]">{iconSymbol}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[13px] font-bold text-[var(--color-text-primary)] truncate">
                      {topic.title}
                    </span>
                    <span className="text-[10px] text-[var(--color-text-secondary)] shrink-0">{topic.time}</span>
                  </div>
                  <p className="text-[11.5px] text-[var(--color-text-secondary)] truncate mt-0.5">
                    {topic.preview}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
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
            Tâm trạng {checkIn.mood}/10 · Stress {checkIn.stress}/10
          </p>
        </div>

        <button
          onClick={() => setShowPrivacySheet(true)}
          type="button"
          className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-3.5 py-2.5 text-left text-[12px] font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface-mint)]/50 flex items-center justify-between transition"
        >
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[17px] text-[var(--color-primary)]">verified_user</span>
            Quyền riêng tư AI
          </span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        </button>
      </div>
    </aside>
  );

  const renderChatInputBar = () => (
    <div className="sticky bottom-0 z-30 px-3.5 md:px-6 pt-2 pb-4 bg-[var(--color-background)]/95 backdrop-blur-md border-t border-[var(--color-border)]">
      <div className="flex items-end gap-2 md:max-w-3xl md:mx-auto">
        {/* Plus action button */}
        <button
          onClick={() => {
            setInputText('Mochi ơi, hôm nay mình muốn chia sẻ một chút...');
            textareaRef.current?.focus();
          }}
          type="button"
          className="w-10 h-10 mb-1 rounded-full bg-white border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] active:scale-95 transition-all shrink-0 shadow-xs cursor-pointer"
          aria-label="Thêm tùy chọn"
          title="Thêm"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
        </button>

        {/* Pill input container with auto-growing textarea (Enter sends, Shift+Enter newline) */}
        <div className="flex-1 min-h-[48px] bg-white rounded-[24px] border border-[var(--color-border)] px-4 py-2 flex items-end shadow-xs focus-within:border-[var(--color-primary)] focus-within:ring-1 focus-within:ring-[var(--color-primary)] transition-all">
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 max-h-32 resize-none bg-transparent border-0 py-1 text-[14.5px] leading-6 text-[var(--color-text-primary)] placeholder-[#819486] focus:outline-none focus:ring-0"
            placeholder="Nhập tin nhắn... (Enter để gửi, Shift + Enter để xuống dòng)"
          />
          <button
            onClick={() => {
              setInputText('Mình cảm thấy áp lực bài vở và muốn được tư vấn.');
              textareaRef.current?.focus();
            }}
            aria-label="Ghi âm giọng nói"
            className="w-8 h-8 mb-0.5 rounded-full flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] active:scale-95 transition-colors cursor-pointer shrink-0"
            type="button"
          >
            <span className="material-symbols-outlined text-[19px]">mic</span>
          </button>
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!inputText.trim()}
          aria-label="Gửi tin nhắn"
          className={`w-[48px] h-[48px] rounded-full flex items-center justify-center shadow-xs shrink-0 transition-all cursor-pointer ${
            inputText.trim()
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
              <h3 className="font-bold text-[16px] text-[var(--color-primary)]">Bảo mật & Quyền riêng tư</h3>
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
            Toàn bộ dữ liệu check-in và nội dung trò chuyện được mã hóa bảo mật trên máy bạn. MindCare
            không chia sẻ thông tin này cho bên thứ ba.
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
              Mở Cài đặt bảo mật
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
  // LANDING STATE: Mobile full landing, Desktop split workspace with welcome stage + input
  // =========================================================================
  if (viewMode === 'landing') {
    return (
      <div className="flex-1 flex flex-col md:flex-row md:h-screen md:overflow-hidden bg-[var(--color-background)] text-[var(--color-text-primary)] min-h-screen relative pb-20 md:pb-0 select-none font-sans">
        {renderDesktopSidebar()}

        <div className="flex-1 flex flex-col min-w-0 md:h-screen">
          {/* Mobile Top Header */}
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
              onClick={() => setShowPrivacySheet(true)}
              type="button"
              className="w-10 h-10 rounded-full bg-white/80 border border-[var(--color-border)] flex items-center justify-center text-[var(--color-primary)] hover:bg-white active:scale-95 transition-all shadow-xs relative"
              aria-label="Thông báo"
              title="Thông báo"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="w-2 h-2 rounded-full bg-[#E86A38] absolute top-2.5 right-2.5 ring-2 ring-white" />
            </button>
          </header>

          {/* Desktop Top Header */}
          <header className="hidden md:flex items-center justify-between px-6 py-3 border-b border-[var(--color-border)] bg-[var(--color-background)]/95">
            <div className="flex items-center gap-3">
              <SproutAvatar size={38} showOnline />
              <div>
                <h1 className="text-[15.5px] font-bold text-[var(--color-primary)]">MindCare AI · Mochi</h1>
                <p className="text-[11.5px] text-[var(--color-text-secondary)]">Không gian lắng nghe an toàn &amp; riêng tư</p>
              </div>
            </div>
            <button
              onClick={() => setShowPrivacySheet(true)}
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-white px-3.5 py-1.5 text-[12px] font-semibold text-[var(--color-primary)] hover:bg-[var(--color-surface-mint)]"
            >
              <span className="material-symbols-outlined text-[16px]">verified_user</span>
              Bảo mật
            </button>
          </header>

          {/* Scrollable landing content */}
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

              <div className="mt-5 md:max-w-sm md:mx-auto">
                <button
                  onClick={() => startNewChat()}
                  type="button"
                  className="w-full h-[52px] bg-[var(--color-primary)] hover:bg-[var(--color-primary)] active:scale-[0.98] text-white rounded-full flex items-center justify-center gap-2.5 shadow-[0_4px_16px_rgba(40,92,61,0.22)] transition-all cursor-pointer font-semibold text-[15.5px]"
                >
                  <span className="material-symbols-outlined text-[20px]">chat_bubble_outline</span>
                  <span>Bắt đầu trò chuyện</span>
                  <span className="material-symbols-outlined text-[19px] ml-0.5">arrow_forward</span>
                </button>
              </div>

              {/* Recent Conversations Section (shown on mobile & tablet; lg has left sidebar) */}
              <div className="mt-7 lg:hidden">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h2 className="text-[16px] font-bold text-[var(--color-primary)]">Cuộc trò chuyện gần đây</h2>
                  <button
                    onClick={() => setViewMode('active')}
                    type="button"
                    className="text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] font-medium transition-colors"
                  >
                    Xem tất cả
                  </button>
                </div>

                <div className="space-y-2.5 md:grid md:grid-cols-3 md:gap-3 md:space-y-0">
                  {RECENT_CONVERSATIONS.map((topic) => {
                    const iconBgColor =
                      topic.icon === 'leaf'
                        ? 'bg-[var(--color-surface-mint)] text-[var(--color-primary)]'
                        : topic.icon === 'heart'
                        ? 'bg-[#FDF0E6] text-[#E57353]'
                        : 'bg-[#FEF7DE] text-[#D89324]';

                    const iconSymbol =
                      topic.icon === 'leaf' ? 'eco' : topic.icon === 'heart' ? 'favorite' : 'wb_sunny';

                    return (
                      <button
                        key={topic.id}
                        onClick={() => startNewChat(topic.initialPrompt, topic.id)}
                        type="button"
                        className="w-full bg-white rounded-[20px] p-3.5 border border-[var(--color-border)] shadow-[0_2px_10px_rgba(40,92,61,0.03)] hover:border-[#D0DFCE] active:scale-[0.99] transition-all flex items-center justify-between text-left group cursor-pointer"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div
                            className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${iconBgColor} transition-transform group-hover:scale-105`}
                          >
                            <span className="material-symbols-outlined text-[20px]">{iconSymbol}</span>
                          </div>
                          <div className="flex flex-col truncate">
                            <span className="text-[14.5px] font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors truncate">
                              {topic.title}
                            </span>
                            <span className="text-[12.5px] text-[var(--color-text-secondary)] truncate mt-0.5 font-normal">
                              {topic.preview}
                            </span>
                          </div>
                        </div>
                        <span className="text-[11.5px] text-[#85988D] shrink-0 font-medium pl-2 md:hidden">
                          {topic.time}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Desktop sticky input even from landing state */}
          <div className="hidden md:block">
            {renderChatInputBar()}
          </div>
        </div>

        {renderPrivacyModal()}
      </div>
    );
  }

  // =========================================================================
  // SCREEN B & C: ACTIVE CHAT SCREEN
  // =========================================================================
  return (
    <div className="flex-1 flex flex-col md:flex-row md:h-screen md:overflow-hidden bg-[var(--color-background)] text-[var(--color-text-primary)] min-h-screen relative select-none font-sans">
      {renderDesktopSidebar()}

      <div className="flex-1 flex flex-col min-w-0 md:h-screen">
        {/* 1. CHAT HEADER */}
        <header className="sticky top-0 z-30 bg-[var(--color-background)]/95 backdrop-blur-md px-4 md:px-6 pt-3 pb-2 border-b border-[var(--color-border)]">
          <div className="flex items-center justify-between md:max-w-3xl md:mx-auto">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {
                  setViewMode('landing');
                  onBack?.();
                }}
                type="button"
                className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--color-primary)] hover:bg-[var(--color-surface-mint)] active:scale-95 transition-all"
                aria-label="Quay lại"
              >
                <span className="material-symbols-outlined text-[24px]">chevron_left</span>
              </button>

              <SproutAvatar size={42} showOnline={false} />

              <div className="flex flex-col">
                <span className="text-[16px] font-bold text-[var(--color-primary)] tracking-tight leading-tight">
                  MindCare AI
                </span>
                <span className="text-[12px] text-[var(--color-text-secondary)] font-medium flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#3FB950]" />
                  Đang trực tuyến
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowPrivacySheet(true)}
              type="button"
              className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-mint)] active:scale-95 transition-all"
              aria-label="Tùy chọn"
            >
              <span className="material-symbols-outlined text-[20px]">more_vert</span>
            </button>
          </div>

          {showCheckInContext && (
            <div className="mt-2.5 md:max-w-3xl md:mx-auto">
              <div className="bg-[var(--color-surface-mint)] border border-[#D5E6D0] rounded-full px-3.5 py-1.5 flex items-center justify-between text-[var(--color-primary)] shadow-2xs">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="material-symbols-outlined text-[var(--color-primary)] text-[16px] shrink-0">
                    psychology
                  </span>
                  <p className="text-[12px] font-medium truncate text-[var(--color-primary)]">
                    Đang dùng dữ liệu check-in (Tâm trạng: {checkIn.mood}/10, Stress: {checkIn.stress}/10)
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
          className="flex-1 px-4 md:px-6 py-3 md:py-5 overflow-y-auto pb-24 md:pb-8"
        >
          <div className="space-y-4 md:max-w-3xl md:mx-auto">
            {/* Decorative Scenic Banner */}
            <div className="pt-1 pb-1">
              <MochiRestingBanner showBooksAndCoffee={false} className="w-full h-36 md:h-40" />
            </div>

            {/* Message Stream */}
            {messages.map((msg) => {
              if (msg.sender === 'user') {
                return (
                  <div key={msg.id} className="flex flex-col items-end gap-1">
                    <div className="max-w-[85%] md:max-w-[72%] bg-[var(--color-primary)] text-white rounded-[20px] rounded-br-[4px] px-4 py-3 shadow-[0_2px_8px_rgba(40,92,61,0.12)]">
                      <p className="text-[14.5px] leading-relaxed font-normal text-white whitespace-pre-wrap">
                        {msg.text}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 pr-1 text-[11.5px] text-[#788E80] font-medium">
                      <span>{msg.time}</span>
                      <span className="material-symbols-outlined text-[13px] text-[#3FA76A]">done_all</span>
                    </div>
                  </div>
                );
              }

              return (
                <div key={msg.id} className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <SproutAvatar size={32} />
                  </div>

                  <div className="flex flex-col items-start gap-1 flex-1 max-w-[85%] md:max-w-[76%]">
                    <div className="bg-white text-[var(--color-text-primary)] rounded-[20px] rounded-tl-[4px] px-4 py-3.5 shadow-[0_2px_10px_rgba(40,92,61,0.04)] border border-[var(--color-border)] space-y-2.5 w-full">
                      <p className="text-[14.5px] leading-relaxed text-[var(--color-text-primary)] whitespace-pre-wrap">
                        {msg.text}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pl-1 text-[11.5px] text-[#7A8C7F] font-medium">
                      <span>{msg.time}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* AI SUGGESTIONS & RELAXATION CARDS */}
            <div className="space-y-3 pt-1 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
              {/* 1. GỢI Ý CHO BẠN */}
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
                    <h3 className="font-bold text-[15.5px] text-[var(--color-primary)]">Gợi ý cho bạn</h3>
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
                              <span className="material-symbols-outlined text-[15px] font-bold">check</span>
                            )}
                          </div>
                          <span
                            className={`text-[14px] leading-snug transition-colors ${
                              isChecked ? 'line-through text-[#8C9E92]' : 'text-[var(--color-text-primary)]'
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

              {/* 2. BÀI TẬP THƯ GIÃN */}
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

            {isWaitingResponse && (
              <div className="flex items-start gap-2.5 animate-fade-in">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <SproutAvatar size={32} />
                </div>
                <div className="bg-white border border-[var(--color-border)] rounded-[20px] rounded-tl-[4px] px-4 py-3 shadow-xs flex items-center gap-2">
                  <span className="text-[13px] text-[var(--color-text-secondary)]">Mochi đang soạn phản hồi</span>
                  <div className="flex items-center gap-1 pl-1">
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] animate-bounce"
                      style={{ animationDelay: '0ms', animationDuration: '0.8s' }}
                    />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] animate-bounce"
                      style={{ animationDelay: '180ms', animationDuration: '0.8s' }}
                    />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] animate-bounce"
                      style={{ animationDelay: '360ms', animationDuration: '0.8s' }}
                    />
                  </div>
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
