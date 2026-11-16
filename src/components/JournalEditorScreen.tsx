import React, { useEffect, useMemo, useRef, useState } from 'react';
import { JournalEntry } from '../types';

interface JournalEditorProps {
  initialEntry?: JournalEntry | null;
  onSave: (entry: Partial<JournalEntry>) => void;
  onClose: () => void;
}

type SaveState = 'saved' | 'saving';

const EMOTIONS = [
  { label: 'Nhẹ nhõm', score: 6, icon: 'air' },
  { label: 'Hơi lo lắng', score: 4, icon: 'rainy' },
  { label: 'Biết ơn', score: 8, icon: 'psychiatry' },
  { label: 'Cần nghỉ ngơi', score: 3, icon: 'bedtime' },
  { label: 'Tập trung', score: 7, icon: 'lightbulb' },
  { label: 'Tự hào', score: 9, icon: 'stars' },
];

interface WritingPrompt {
  id: string;
  category: string;
  question: string;
  suggestedTitle: string;
  starter: string;
}

const WRITING_PROMPTS: WritingPrompt[] = [
  {
    id: 'gratitude',
    category: 'Biết ơn & An yên',
    question: 'Hôm nay có điều nhỏ bé nào đã giúp bạn mỉm cười hoặc cảm thấy dễ chịu?',
    suggestedTitle: 'Khoảnh khắc dễ chịu hôm nay',
    starter: 'Hôm nay, một điều nhỏ bé khiến mình mỉm cười là: ',
  },
  {
    id: 'unburden',
    category: 'Giải tỏa suy nghĩ',
    question: 'Có việc gì hoặc suy nghĩ nào đang làm tâm trí bạn bận lòng nhất lúc này?',
    suggestedTitle: 'Trút bớt lo âu trong lòng',
    starter: 'Lúc này, điều đang khiến mình suy nghĩ nhiều nhất là: ',
  },
  {
    id: 'self-care',
    category: 'Vỗ về bản thân',
    question: 'Nếu được gửi một lời dịu dàng đến bản thân sau hôm nay, bạn sẽ nói gì?',
    suggestedTitle: 'Lời nhắn gửi chính mình',
    starter: 'Gửi đến bản thân của hôm nay, mình muốn nhắn nhủ: ',
  },
  {
    id: 'small-win',
    category: 'Ghi nhận nỗ lực',
    question: 'Dù ngày hôm nay ra sao, bạn đã cố gắng hoàn thành được điều gì?',
    suggestedTitle: 'Một nỗ lực đáng ghi nhận',
    starter: 'Hôm nay mình ghi nhận bản thân vì đã nỗ lực làm được: ',
  },
  {
    id: 'body-awareness',
    category: 'Lắng nghe cơ thể',
    question: 'Hít sâu một hơi... Cơ thể và tinh thần bạn lúc này đang cần điều gì nhất?',
    suggestedTitle: 'Lắng nghe nhu cầu cơ thể',
    starter: 'Dừng lại một nhịp và lắng nghe cơ thể, mình cảm nhận cơ thể đang cần: ',
  },
  {
    id: 'daily-moment',
    category: 'Khoảnh khắc hôm nay',
    question: 'Một hình ảnh, một tách trà, hay một cuộc trò chuyện bạn muốn lưu lại?',
    suggestedTitle: 'Một khoảnh khắc muốn giữ lại',
    starter: 'Một khoảnh khắc đáng nhớ đối với mình trong ngày là: ',
  },
];

const formatTime = () =>
  new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date());

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);

export const JournalEditorScreen: React.FC<JournalEditorProps> = ({
  initialEntry,
  onSave,
  onClose,
}) => {
  const draftKey = `mindcare_journal_draft_${initialEntry?.id || 'new'}`;
  const initialDraft = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(draftKey) || 'null') as {
        title?: string;
        content?: string;
        selectedEmotions?: string[];
        allowAiRef?: boolean;
        imageUrl?: string;
      } | null;
    } catch {
      return null;
    }
  }, [draftKey]);

  const [title, setTitle] = useState(
    initialDraft?.title ?? initialEntry?.title ?? ''
  );
  const [content, setContent] = useState(
    initialDraft?.content ?? initialEntry?.content ?? ''
  );
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>(
    initialDraft?.selectedEmotions ??
      (initialEntry?.tag ? [initialEntry.tag] : ['Nhẹ nhõm', 'Hơi lo lắng'])
  );
  const [allowAiRef, setAllowAiRef] = useState(
    initialDraft?.allowAiRef ?? initialEntry?.allowAiRef ?? false
  );
  const [imageUrl, setImageUrl] = useState(
    initialDraft?.imageUrl ?? initialEntry?.imageUrl ?? ''
  );
  const [saveState, setSaveState] = useState<SaveState>('saved');
  const [lastSavedTime, setLastSavedTime] = useState(formatTime());
  const [helperMessage, setHelperMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showEmotionPicker, setShowEmotionPicker] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showPromptHelper, setShowPromptHelper] = useState(() => {
    return !initialEntry?.content && !initialDraft?.content;
  });
  const [activePromptIndex, setActivePromptIndex] = useState(0);

  const contentRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const currentPrompt = WRITING_PROMPTS[activePromptIndex % WRITING_PROMPTS.length];

  const handleCyclePrompt = () => {
    setActivePromptIndex((prev) => (prev + 1) % WRITING_PROMPTS.length);
  };

  const handleApplyPrompt = () => {
    if (!title.trim()) {
      setTitle(currentPrompt.suggestedTitle);
    }

    const textarea = contentRef.current;
    const starter = currentPrompt.starter;
    const currentVal = content;
    const nextContent = !currentVal.trim()
      ? starter
      : `${currentVal.trimEnd()}\n\n${starter}`;

    setContent(nextContent);
    setHelperMessage('Đã thêm gợi ý vào bài viết. Hãy tiếp tục chia sẻ nhé!');

    requestAnimationFrame(() => {
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(nextContent.length, nextContent.length);
      }
    });
  };

  const charCount = content.length + title.length;
  const canSave = Boolean(title.trim() || content.trim());
  const primaryEmotion =
    EMOTIONS.find((emotion) => selectedEmotions.includes(emotion.label)) || EMOTIONS[0];
  const moodScore = primaryEmotion.score;
  const aiLabel =
    moodScore >= 8
      ? 'Tích cực'
      : moodScore >= 6
        ? 'Tích cực nhẹ'
        : moodScore >= 4
          ? 'Đang cân bằng'
          : 'Cần được nghỉ ngơi';

  useEffect(() => {
    setSaveState('saving');
    const timer = window.setTimeout(() => {
      localStorage.setItem(
        draftKey,
        JSON.stringify({ title, content, selectedEmotions, allowAiRef, imageUrl })
      );
      setLastSavedTime(formatTime());
      setSaveState('saved');
    }, 700);

    return () => window.clearTimeout(timer);
  }, [allowAiRef, content, draftKey, imageUrl, selectedEmotions, title]);

  useEffect(() => {
    if (!helperMessage) return;
    const timer = window.setTimeout(() => setHelperMessage(''), 3200);
    return () => window.clearTimeout(timer);
  }, [helperMessage]);

  useEffect(
    () => () => {
      recognitionRef.current?.stop?.();
    },
    []
  );

  const toggleEmotion = (label: string) => {
    setSelectedEmotions((current) => {
      if (current.includes(label)) {
        return current.length === 1 ? current : current.filter((item) => item !== label);
      }
      return current.length >= 3 ? [...current.slice(1), label] : [...current, label];
    });
  };

  const insertAtCursor = (text: string) => {
    const textarea = contentRef.current;
    if (!textarea) {
      setContent((current) => `${current}${text}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    setContent((current) => `${current.slice(0, start)}${text}${current.slice(end)}`);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setHelperMessage('Vui lòng chọn một tệp hình ảnh.');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setHelperMessage('Ảnh cần nhỏ hơn 4 MB để lưu an toàn trên thiết bị.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(String(reader.result));
      setHelperMessage('Đã thêm ảnh kỷ niệm vào bài viết.');
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop?.();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setHelperMessage('Trình duyệt này chưa hỗ trợ nhập nội dung bằng giọng nói.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'vi-VN';
    recognition.interimResults = false;
    recognition.continuous = true;
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .slice(event.resultIndex)
        .map((result: any) => result[0].transcript)
        .join(' ');
      insertAtCursor(`${transcript} `);
    };
    recognition.onerror = () => {
      setIsRecording(false);
      setHelperMessage('Không thể ghi âm. Hãy kiểm tra quyền micro và thử lại.');
    };
    recognition.onend = () => setIsRecording(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    setHelperMessage('Đang lắng nghe, chạm lại biểu tượng micro để dừng.');
  };

  const handleSave = () => {
    if (!canSave) {
      contentRef.current?.focus();
      setHelperMessage('Hãy viết ít nhất một dòng trước khi lưu nhật ký.');
      return;
    }

    localStorage.removeItem(draftKey);
    onSave({
      id: initialEntry?.id,
      title: title.trim() || 'Nhật ký không tên',
      content: content.trim(),
      tag: primaryEmotion.label,
      moodScore,
      aiEstimateLabel: aiLabel,
      aiEstimateScore: moodScore,
      aiBarWidth: moodScore * 10,
      isEncrypted: true,
      allowAiRef,
      imageUrl: imageUrl || undefined,
    });
  };

  return (
    <div className="relative flex min-h-[calc(100vh-33px)] md:min-h-screen flex-1 flex-col bg-[var(--color-background)] pb-[68px] md:pb-8 text-[var(--color-text-primary)]">
      <header className="grid grid-cols-[44px_1fr_auto] items-center gap-2 px-3 pb-1 pt-2 md:max-w-[760px] md:mx-auto md:w-full md:px-6 md:pt-5 md:pb-3">
        <button
          onClick={onClose}
          aria-label="Đóng trình soạn thảo"
          className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-primary)] transition hover:bg-[var(--color-surface-mint)] active:scale-95"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>

        <div className="min-w-0 text-center">
          <h1 className="truncate text-[16px] md:text-[19px] font-bold text-[var(--color-primary)]">
            {initialEntry ? 'Chỉnh sửa nhật ký' : 'Viết nhật ký'}
          </h1>
          <p className="truncate text-[10px] md:text-[11.5px] font-medium capitalize text-[#7A887F]">
            {initialEntry?.date || formatDate(new Date())}
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={!canSave}
          className="min-w-[68px] md:min-w-[92px] rounded-full bg-[var(--color-primary)] px-3.5 md:px-5 py-2 text-[12px] md:text-[13px] font-bold text-white transition hover:bg-[var(--color-primary)] active:scale-95 disabled:cursor-not-allowed disabled:bg-[var(--color-text-secondary)]"
          type="button"
        >
          Lưu bài
        </button>
      </header>

      <main className="flex min-h-0 flex-1 flex-col px-4 pb-2 md:max-w-[760px] md:mx-auto md:w-full md:px-6">
        <section className="mb-3 pt-1">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-[13px] font-bold text-[var(--color-primary)]">
              Hôm nay bạn cảm thấy thế nào?
            </h2>
            {!showPromptHelper && (
              <button
                type="button"
                onClick={() => setShowPromptHelper(true)}
                className="flex items-center gap-1 text-[11.5px] font-semibold text-[var(--color-primary)] transition hover:opacity-80 active:scale-95"
                title="Mở gợi ý khi chưa biết viết gì"
              >
                <span className="material-symbols-outlined text-[15px]">tips_and_updates</span>
                <span>Gợi ý viết</span>
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedEmotions.map((label) => {
              const emotion = EMOTIONS.find((item) => item.label === label);
              return (
                <button
                  key={label}
                  onClick={() => toggleEmotion(label)}
                  aria-label={`Bỏ chọn ${label}`}
                  className="flex items-center gap-1.5 rounded-full border border-[#78A884] bg-[var(--color-surface-mint)] px-3 py-2 text-[11.5px] font-medium text-[#356247] transition active:scale-95"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {emotion?.icon || 'mood'}
                  </span>
                  <span>{label}</span>
                  <span className="material-symbols-outlined text-[14px]">check</span>
                </button>
              );
            })}
            <button
              onClick={() => setShowEmotionPicker((current) => !current)}
              aria-expanded={showEmotionPicker}
              className="flex items-center gap-1 rounded-full border border-transparent bg-white px-3 py-2 text-[11.5px] font-medium text-[var(--color-text-secondary)] transition hover:border-[var(--color-border)] active:scale-95"
              type="button"
            >
              <span className="material-symbols-outlined text-[15px]">
                {showEmotionPicker ? 'close' : 'add'}
              </span>
              {showEmotionPicker ? 'Đóng' : 'Thêm'}
            </button>
          </div>

          {showEmotionPicker && (
            <div className="mt-2 flex flex-wrap gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2.5 shadow-sm">
              {EMOTIONS.filter((emotion) => !selectedEmotions.includes(emotion.label)).map(
                (emotion) => (
                  <button
                    key={emotion.label}
                    onClick={() => toggleEmotion(emotion.label)}
                    className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-medium text-[var(--color-text-secondary)] transition hover:bg-[var(--color-surface-mint)] hover:text-[var(--color-primary)]"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[15px]">{emotion.icon}</span>
                    {emotion.label}
                  </button>
                )
              )}
            </div>
          )}
        </section>

        {showPromptHelper && (
          <section
            aria-label="Gợi ý viết nhật ký"
            className="mb-3 rounded-2xl border border-[#D5E6DC] bg-[#EDF7F1] p-3 text-[12px] shadow-xs transition-all"
          >
            <div className="flex items-center justify-between gap-2 border-b border-[#D8ECE0] pb-2">
              <div className="flex items-center gap-1.5 text-[11.5px] font-bold text-[var(--color-primary)]">
                <span className="material-symbols-outlined text-[16px] text-[var(--color-primary)]">
                  tips_and_updates
                </span>
                <span>Chưa biết viết gì? Thử gợi ý này:</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleCyclePrompt}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-[var(--color-primary)] transition hover:bg-[#DEEFE5] active:scale-95"
                  title="Xem câu hỏi khác"
                >
                  <span className="material-symbols-outlined text-[14px]">refresh</span>
                  <span>Đổi câu khác</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPromptHelper(false)}
                  aria-label="Đóng gợi ý viết"
                  className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--color-text-secondary)] transition hover:bg-[#DEEFE5] active:scale-95"
                >
                  <span className="material-symbols-outlined text-[15px]">close</span>
                </button>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-[13px] font-medium italic leading-relaxed text-[#234B38]">
                “{currentPrompt.question}”
              </p>

              <div className="mt-2.5 flex items-center justify-between gap-2">
                <span className="text-[10px] font-medium text-[#5B7B6A]">
                  Chủ đề: {currentPrompt.category}
                </span>
                <button
                  type="button"
                  onClick={handleApplyPrompt}
                  className="flex items-center gap-1.5 rounded-full bg-[var(--color-primary)] px-3 py-1.5 text-[11.5px] font-semibold text-white shadow-xs transition hover:opacity-90 active:scale-95"
                >
                  <span className="material-symbols-outlined text-[14px]">edit</span>
                  <span>Dùng gợi ý này</span>
                </button>
              </div>
            </div>
          </section>
        )}

        <section className="flex min-h-[360px] md:min-h-[460px] flex-1 flex-col overflow-hidden rounded-[20px] md:rounded-[24px] border border-[#DDDCD4] bg-white transition focus-within:border-[var(--color-secondary)] md:shadow-[0_4px_20px_rgba(31,92,67,0.04)]">
          <div className="px-3.5 md:px-6 pb-2 pt-3.5 md:pt-5">
            <label className="sr-only" htmlFor="journal-title">
              Tiêu đề nhật ký
            </label>
            <input
              id="journal-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full border-0 bg-transparent p-0 text-[17px] md:text-[22px] font-bold leading-6 md:leading-8 text-[#2C4A37] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-0"
              placeholder="Đặt tên cho khoảnh khắc này"
              type="text"
            />
          </div>

          <div className="mx-3.5 md:mx-6 h-px bg-[#E9E7DF]" />

          <div className="flex flex-1 px-3.5 md:px-6 py-3 md:py-4">
            <label className="sr-only" htmlFor="journal-body">
              Nội dung nhật ký
            </label>
            <textarea
              ref={contentRef}
              id="journal-body"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              className="min-h-[230px] md:min-h-[320px] w-full flex-1 resize-none border-0 bg-transparent p-0 text-[13.5px] md:text-[15.5px] font-normal leading-[1.85] md:leading-[1.9] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-0"
              placeholder="Hôm nay có điều gì bạn muốn giữ lại?"
            />
          </div>

          {imageUrl && (
            <div className="relative mx-3.5 mb-3 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[#F3F0E8]">
              <img src={imageUrl} alt="Ảnh kỷ niệm đính kèm" className="max-h-40 w-full object-cover" />
              <button
                onClick={() => setImageUrl('')}
                aria-label="Xóa ảnh đính kèm"
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-text-primary)]/80 text-white backdrop-blur transition active:scale-95"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
              </button>
            </div>
          )}

          <div className="flex items-center justify-between gap-2 px-3.5 pb-3 text-[9.5px] font-medium text-[var(--color-text-secondary)]">
            <div className="flex items-center gap-1.5" aria-live="polite">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  saveState === 'saving' ? 'animate-pulse bg-[#D49A55]' : 'bg-[var(--color-secondary)]'
                }`}
              />
              <span>
                {saveState === 'saving' ? 'Đang lưu...' : `Đã lưu nháp lúc ${lastSavedTime}`}
              </span>
            </div>
            <span>{charCount} ký tự</span>
          </div>
        </section>
      </main>

      {helperMessage && (
        <div
          className="fixed bottom-[72px] md:bottom-20 left-1/2 z-[70] w-[calc(100%-32px)] max-w-[388px] md:max-w-[440px] -translate-x-1/2 rounded-2xl bg-[var(--color-text-primary)] px-4 py-3 text-center text-[11.5px] md:text-[12.5px] font-medium text-white shadow-xl"
          role="status"
          aria-live="polite"
        >
          {helperMessage}
        </div>
      )}

      {showOptions && (
        <>
          <button
            onClick={() => setShowOptions(false)}
            aria-label="Đóng tùy chọn"
            className="fixed inset-0 z-[54] bg-[var(--color-text-primary)]/15 backdrop-blur-[1px]"
            type="button"
          />
          <section
            aria-label="Tùy chọn nhật ký"
            className="fixed bottom-[66px] left-1/2 z-[55] w-[calc(100%-24px)] max-w-[396px] -translate-x-1/2 rounded-[22px] border border-[#E1E4DB] bg-[var(--color-surface)] p-4 shadow-[0_16px_48px_rgba(31,92,67,0.18)] md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:max-w-[440px] md:p-5"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[14px] font-bold text-[var(--color-primary)]">Tùy chọn bài viết</h2>
              <button
                onClick={() => setShowOptions(false)}
                aria-label="Đóng"
                className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-mint)]"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="mb-3 rounded-2xl bg-[var(--color-chart-background)] p-3">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-[var(--color-primary)]">Cảm xúc ước lượng</span>
                <span className="font-bold text-[var(--color-primary)]">
                  {aiLabel} · {moodScore}/10
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--color-border)]">
                <div
                  className="h-full rounded-full bg-[var(--color-secondary)]"
                  style={{ width: `${moodScore * 10}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div>
                <label htmlFor="ai-toggle" className="text-[12px] font-bold text-[var(--color-primary)]">
                  Cá nhân hóa trò chuyện AI
                </label>
                <p className="mt-0.5 text-[10.5px] leading-4 text-[var(--color-text-secondary)]">
                  Cho phép MindCare tham khảo riêng bài viết này.
                </p>
              </div>
              <label className="relative inline-flex shrink-0 cursor-pointer items-center">
                <input
                  id="ai-toggle"
                  checked={allowAiRef}
                  onChange={(event) => setAllowAiRef(event.target.checked)}
                  className="peer sr-only"
                  type="checkbox"
                />
                <span className="h-7 w-12 rounded-full bg-[var(--color-border)] transition peer-checked:bg-[var(--color-primary)]" />
                <span className="absolute left-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
              </label>
            </div>

            <p className="mt-3 border-t border-[#ECEBE3] pt-3 text-[10px] leading-4 text-[var(--color-text-secondary)]">
              Nội dung nhật ký không được gửi cho người thân hay bên thứ ba.
            </p>
          </section>
        </>
      )}

      <nav
        aria-label="Công cụ soạn thảo"
        className="fixed bottom-0 left-1/2 z-50 flex w-full max-w-[420px] -translate-x-1/2 items-center justify-between bg-[var(--color-background)]/95 px-3 py-2 backdrop-blur-xl md:sticky md:bottom-4 md:left-auto md:translate-x-0 md:max-w-[712px] md:mx-auto md:rounded-2xl md:border md:border-[var(--color-border)] md:bg-[var(--color-surface)]/95 md:px-4 md:py-2.5 md:shadow-md md:mt-3"
      >
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => insertAtCursor('\n• ')}
            aria-label="Thêm danh sách"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[#4F755C] transition hover:bg-[var(--color-surface-mint)] active:scale-95"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
          </button>
          <button
            onClick={() => insertAtCursor('\n“”')}
            aria-label="Thêm trích dẫn"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[#4F755C] transition hover:bg-[var(--color-surface-mint)] active:scale-95"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">format_quote</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            aria-label="Thêm ảnh"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[#4F755C] transition hover:bg-[var(--color-surface-mint)] active:scale-95"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">add_photo_alternate</span>
          </button>
          <input
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="hidden"
            type="file"
            accept="image/*"
          />
          <button
            onClick={toggleRecording}
            aria-label={isRecording ? 'Dừng ghi âm' : 'Nhập bằng giọng nói'}
            aria-pressed={isRecording}
            className={`flex h-9 w-9 items-center justify-center rounded-xl transition active:scale-95 ${
              isRecording
                ? 'animate-pulse bg-[#F4DED6] text-[#9C4436]'
                : 'text-[#4F755C] hover:bg-[var(--color-surface-mint)]'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isRecording ? 'stop_circle' : 'mic'}
            </span>
          </button>
          <button
            onClick={() => setShowEmotionPicker((current) => !current)}
            aria-label="Chọn cảm xúc"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[#4F755C] transition hover:bg-[var(--color-surface-mint)] active:scale-95"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">mood</span>
          </button>
          <button
            onClick={() => setShowPromptHelper((prev) => !prev)}
            aria-label="Gợi ý viết bài"
            title="Gợi ý ý tưởng viết"
            className={`flex h-9 w-9 items-center justify-center rounded-xl transition active:scale-95 ${
              showPromptHelper
                ? 'bg-[var(--color-surface-mint)] text-[var(--color-primary)] font-bold'
                : 'text-[#4F755C] hover:bg-[var(--color-surface-mint)]'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">tips_and_updates</span>
          </button>
        </div>

        <button
          onClick={() => setShowOptions(true)}
          aria-label="Mở thêm tùy chọn"
          aria-expanded={showOptions}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-[#4F755C] transition hover:bg-[var(--color-surface-mint)] active:scale-95"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">more_horiz</span>
        </button>
      </nav>
    </div>
  );
};
