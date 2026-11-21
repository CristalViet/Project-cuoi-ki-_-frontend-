import React, { useState, useEffect, useId } from 'react';
import { CheckIn } from '../types';
import { soundEngine } from '../utils/audio';

function getLocalClockStr(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

const LEGACY_DEFAULT_NOTE = 'Hôm nay dành thời gian lắng nghe và chăm sóc cảm xúc bản thân.';

interface CheckInModalProps {
  initialCheckIn: CheckIn;
  defaultAllowAi?: boolean;
  onSave: (checkIn: CheckIn) => void;
  onComplete: (targetTab: 'home' | 'journal') => void;
  onClose: () => void;
}

/* ---------- Mood metadata matching MindCare_Checkin_UI_dcc05811 ---------- */
const MOODS = [
  { n: 'Rất tệ', c: '#DDD6FE', sub: 'Hôm nay có vẻ thật khó khăn', score: 2 },
  { n: 'Không ổn', c: '#DCEBFA', sub: 'Cảm ơn bạn đã chia sẻ điều này', score: 4 },
  { n: 'Bình thường', c: '#E7F1DF', sub: 'Một ngày bình thường cũng đáng ghi nhận', score: 6 },
  { n: 'Khá ổn', c: '#DDEBCF', sub: 'Một ngày khá dễ chịu', score: 8 },
  { n: 'Tuyệt vời', c: '#FFF0E1', sub: 'Thật vui khi có điều tích cực hôm nay', score: 10 },
];

const SLEEP_OPTIONS = [
  { dur: '< 6h', label: 'Ngủ ít', hours: 5, quality: 'restless' as const },
  { dur: '6–7h', label: 'Tạm ổn', hours: 6.5, quality: 'good' as const },
  { dur: '7–8h', label: 'Đủ giấc', hours: 7.5, quality: 'good' as const },
  { dur: '8h+', label: 'Ngủ sâu', hours: 8.5, quality: 'refreshed' as const },
];

const barColor = (i: number) => `hsl(${172 - i * 2.2}, 48%, ${78 - i * 2.8}%)`;

/* ---------- Mascot SVG Component ---------- */
interface MascotProps {
  w?: number;
  mouth?: 'smile' | 'happy' | 'sleep';
  heart?: boolean;
  className?: string;
  leafSway?: number;
}

const Mascot: React.FC<MascotProps> = ({
  w = 150,
  mouth = 'smile',
  heart = false,
  className = '',
  leafSway = 0,
}) => {
  const rawId = useId().replace(/:/g, '_');
  const gradId = 'grad_mascot_' + rawId;

  const eyes =
    mouth === 'sleep' ? (
      <path
        d="M70 108q8 7 16 0M114 108q8 7 16 0"
        stroke="var(--color-text-primary)"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
    ) : mouth === 'happy' ? (
      <path
        d="M70 110q8-10 16 0M114 110q8-10 16 0"
        stroke="var(--color-text-primary)"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
    ) : (
      <>
        <circle cx="78" cy="106" r="6" fill="var(--color-text-primary)" />
        <circle cx="122" cy="106" r="6" fill="var(--color-text-primary)" />
      </>
    );

  const m =
    mouth === 'happy' ? (
      <path
        d="M90 120q10 12 20 0"
        stroke="var(--color-text-primary)"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
    ) : mouth === 'sleep' ? (
      <path
        d="M94 122q6 5 12 0"
        stroke="var(--color-text-primary)"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />
    ) : (
      <path
        d="M88 118q12 13 24 0"
        stroke="var(--color-text-primary)"
        strokeWidth="4.2"
        fill="none"
        strokeLinecap="round"
      />
    );

  const heartEl = heart ? (
    <>
      <path
        d="M100 172C72 152 66 130 84 128c9-1 16 7 16 7s7-8 16-7c18 2 12 24-16 44z"
        fill="var(--color-secondary)"
        stroke="var(--color-primary)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M82 138q4-5 9-3"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity={0.7}
      />
    </>
  ) : null;

  return (
    <svg
      className={className}
      width={w}
      height={w * 0.85}
      viewBox="0 0 200 170"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={gradId} cx="40%" cy="30%" r="80%">
          <stop offset="0%" stopColor="var(--color-chart-background)" />
          <stop offset="55%" stopColor="var(--color-highlight)" />
          <stop offset="100%" stopColor="#BFE8D5" />
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="163" rx="62" ry="6" fill="var(--color-primary)" opacity={0.12} />
      <path
        d="M100 52 C100 40 102 34 106 28"
        stroke="var(--color-primary)"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M106 30 C112 6 140 2 156 12 C150 34 126 40 106 30z"
        fill="#73CBB4"
        stroke="var(--color-primary)"
        strokeWidth="4"
        strokeLinejoin="round"
        transform={`rotate(${leafSway} 106 30)`}
      />
      <path
        d="M104 32 C96 12 72 8 56 18 C60 38 84 44 104 32z"
        fill="#9DDEC9"
        stroke="var(--color-primary)"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M110 28q16-2 30-6"
        stroke="var(--color-primary)"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        opacity={0.6}
      />
      <path
        d="M28 142 C14 92 56 52 100 52 C144 52 186 92 172 142 C168 162 140 168 100 168 C60 168 32 162 28 142z"
        fill={`url(#${gradId})`}
        stroke="var(--color-primary)"
        strokeWidth="4.5"
        strokeLinejoin="round"
      />
      <ellipse
        cx="62"
        cy="78"
        rx="16"
        ry="9"
        fill="#fff"
        opacity={0.45}
        transform="rotate(-25 62 78)"
      />
      {eyes}
      <ellipse cx="60" cy="122" rx="12" ry="8" fill="#f6a5a5" opacity={0.75} />
      <ellipse cx="140" cy="122" rx="12" ry="8" fill="#f6a5a5" opacity={0.75} />
      {m}
      {heartEl}
    </svg>
  );
};

/* ---------- Mood Face SVGs ---------- */
const MoodFace: React.FC<{ index: number }> = ({ index }) => {
  const c = MOODS[index].c;
  const d = 'var(--color-text-primary)';

  return (
    <svg viewBox="0 0 40 40" className="w-full h-full">
      <circle cx="20" cy="20" r="20" fill={c} />
      {index === 0 && (
        <>
          <path d="M11 15l5 1.5M29 15l-5 1.5" stroke={d} strokeWidth="2" strokeLinecap="round" />
          <circle cx="14" cy="19" r="1.6" fill={d} />
          <circle cx="26" cy="19" r="1.6" fill={d} />
          <path d="M14 29q6-6 12 0" stroke={d} strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      )}
      {index === 1 && (
        <>
          <circle cx="14" cy="18" r="1.7" fill={d} />
          <circle cx="26" cy="18" r="1.7" fill={d} />
          <path
            d="M15 28.5q5-3.5 10 0"
            stroke={d}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </>
      )}
      {index === 2 && (
        <>
          <circle cx="14" cy="18" r="1.7" fill={d} />
          <circle cx="26" cy="18" r="1.7" fill={d} />
          <path d="M15 27h10" stroke={d} strokeWidth="2" strokeLinecap="round" />
        </>
      )}
      {index === 3 && (
        <>
          <circle cx="14" cy="18" r="1.8" fill="var(--color-primary)" />
          <circle cx="26" cy="18" r="1.8" fill="var(--color-primary)" />
          <path
            d="M14 25q6 6 12 0"
            stroke="var(--color-primary)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="9.5" cy="24" r="2.5" fill="#f6a5a5" opacity={0.7} />
          <circle cx="30.5" cy="24" r="2.5" fill="#f6a5a5" opacity={0.7} />
        </>
      )}
      {index === 4 && (
        <>
          <path
            d="M10.5 18q3.5-4 7 0M22.5 18q3.5-4 7 0"
            stroke={d}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M13 24h14q-1 8-7 8t-7-8z"
            fill="#fff"
            stroke={d}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <circle cx="9.5" cy="24" r="2.5" fill="#f6a5a5" opacity={0.7} />
          <circle cx="30.5" cy="24" r="2.5" fill="#f6a5a5" opacity={0.7} />
        </>
      )}
    </svg>
  );
};

/* ---------- Helper Icons ---------- */
const LeafIcon = ({ s = 20, c = 'var(--color-primary)' }: { s?: number; c?: string }) => (
  <svg
    width={s}
    height={s}
    viewBox="0 0 24 24"
    fill="none"
    stroke={c}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 20c0-9 5-15 15-15 0 10-6 15-15 15z" />
    <path d="M5 20c3-5 6-8 10-10" />
  </svg>
);

const MoonIcon = ({ c = 'var(--color-primary)', s = 20 }: { c?: string; s?: number }) => (
  <svg
    width={s}
    height={s}
    viewBox="0 0 24 24"
    fill="none"
    stroke={c}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z" />
  </svg>
);

const Dashes = ({ flip = false }: { flip?: boolean }) => (
  <svg
    width="34"
    height="22"
    viewBox="0 0 34 22"
    fill="none"
    stroke="var(--color-secondary)"
    strokeWidth="3.2"
    strokeLinecap="round"
    style={flip ? { transform: 'scaleX(-1)' } : undefined}
  >
    <path d="M3 4l9 5M4 17l7-1M16 2l3 8" />
  </svg>
);

export const CheckInModal: React.FC<CheckInModalProps> = ({
  initialCheckIn,
  defaultAllowAi,
  onSave,
  onComplete,
  onClose,
}) => {
  // Step 0: Mood, Step 1: Stress & Sleep, Step 2: Note & AI, Step 3: Done screen
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);

  // Map initialCheckIn mood (1-10) to 0-4
  const getInitialMoodIndex = () => {
    const m = initialCheckIn.mood || 6;
    if (m <= 2) return 0;
    if (m <= 4) return 1;
    if (m <= 6) return 2;
    if (m <= 8) return 3;
    return 4;
  };

  const getInitialSleepIndex = () => {
    const hours = initialCheckIn.sleepHours || 7.5;
    if (hours < 6) return 0;
    if (hours <= 7) return 1;
    if (hours <= 8) return 2;
    return 3;
  };

  const dt = new Date();
  const todayIso = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(
    dt.getDate()
  ).padStart(2, '0')}`;

  const [mood, setMood] = useState<number>(getInitialMoodIndex());
  const [stress, setStress] = useState<number>(initialCheckIn.stress ?? 4);
  const [sleep, setSleep] = useState<number>(getInitialSleepIndex());
  const [note, setNote] = useState<string>(
    initialCheckIn.date === todayIso &&
      initialCheckIn.note &&
      initialCheckIn.note !== LEGACY_DEFAULT_NOTE
      ? initialCheckIn.note
      : ''
  );
  const [ai, setAi] = useState<boolean>(
    defaultAllowAi ?? initialCheckIn.allowAiPersonalize ?? true
  );
  const [completedRecord, setCompletedRecord] = useState<CheckIn | null>(null);
  const [liveClock, setLiveClock] = useState<string>(getLocalClockStr);

  useEffect(() => {
    const timer = window.setInterval(() => setLiveClock(getLocalClockStr()), 15000);
    return () => window.clearInterval(timer);
  }, []);

  const DOW = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const SHORT_DOW = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const dateStr = `${DOW[dt.getDay()]}, ${dt.getDate()} tháng ${dt.getMonth() + 1}`;

  const stressInfo = () => {
    if (stress <= 3) return { label: 'Thư giãn', cls: 'bg-[var(--color-highlight)] text-[var(--color-primary)]' };
    if (stress <= 6) return { label: 'Căng vừa', cls: 'bg-[var(--color-surface-mint)] text-[var(--color-primary)]' };
    return { label: 'Khá căng', cls: 'bg-[var(--color-secondary)]/15 text-[var(--color-primary)]' };
  };

  const currentStressBadge = stressInfo();
  const currentMoodObj = MOODS[mood];

  const handleNext = () => {
    try {
      soundEngine.playChime('hold');
    } catch {
      // ignore
    }
    if (step === 2) {
      const record = createCheckInRecord();
      setCompletedRecord(record);
      onSave(record);
      setStep(3);
      return;
    }
    setStep((prev) => (Math.min(3, prev + 1) as 0 | 1 | 2 | 3));
  };

  const handleBack = () => {
    if (step === 0) {
      onClose();
    } else {
      setStep((prev) => (Math.max(0, prev - 1) as 0 | 1 | 2 | 3));
    }
  };

  const handleAppendPrompt = (promptText: string) => {
    try {
      soundEngine.playChime('inhale');
    } catch {
      // ignore
    }
    const updated = (note ? note + '\n' : '') + promptText;
    setNote(updated.slice(0, 500));
  };

  const createCheckInRecord = (): CheckIn => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const sleepOpt = SLEEP_OPTIONS[sleep];
    return {
      id: 'ci-' + Date.now(),
      date: `${yyyy}-${mm}-${dd}`,
      dayLabel: SHORT_DOW[now.getDay()],
      time: `${hh}:${min}`,
      mood: currentMoodObj.score,
      moodLabel: currentMoodObj.n,
      stress,
      stressLabel: currentStressBadge.label,
      sleepHours: sleepOpt.hours,
      sleepQuality: sleepOpt.quality,
      emotions: [currentMoodObj.n, currentStressBadge.label],
      note: note.trim(),
      allowAiPersonalize: ai,
      createdAt: now.getTime(),
    };
  };

  const handleFinish = (targetTab: 'home' | 'journal') => {
    if (!completedRecord) return;
    try {
      soundEngine.playChime('exhale');
    } catch {
      // ignore
    }
    onComplete(targetTab);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[var(--color-background)]/90 backdrop-blur-sm flex justify-center items-center overflow-y-auto p-2 sm:p-4">
      {/* Phone container styled identically to MindCare_Checkin_UI */}
      <div
        className="w-full max-w-[372px] h-[800px] max-h-[96vh] relative rounded-[44px] overflow-hidden flex flex-col shadow-2xl border-[6px] border-white select-none text-[var(--color-primary)] md:max-w-[540px] md:h-auto md:min-h-[650px] md:max-h-[90vh] md:rounded-[32px] md:overflow-y-auto"
        style={{
          background:
            'radial-gradient(circle at 105% 12%,var(--color-highlight) 0 70px,transparent 71px),radial-gradient(circle at -8% 45%,var(--color-surface-mint) 0 50px,transparent 51px),linear-gradient(var(--color-surface),var(--color-background))',
          boxShadow: '0 0 0 1px var(--color-border),0 24px 50px rgba(31,92,67,0.14),inset 0 0 30px var(--color-surface)',
        }}
      >
        {/* Soft decorative background circles */}
        <div className="absolute -right-[60px] bottom-[90px] w-[180px] h-[180px] rounded-full bg-[var(--color-highlight)] pointer-events-none z-0" />
        <div className="absolute -left-[40px] -bottom-[60px] w-[260px] h-[130px] rounded-full bg-[var(--color-surface-mint)] opacity-70 pointer-events-none z-0" />

        {/* Top Status Bar & Navigation (Steps 0, 1, 2) */}
        {step < 3 ? (
          <div className="relative z-20 pt-3 px-5 md:pt-5 md:px-7">
            {/* Live Local Time & Privacy Status (Mobile only) */}
            <div className="flex justify-between items-center text-[12px] font-semibold text-[var(--color-text-secondary)] px-1 md:hidden">
              <span className="tabular-nums font-bold text-[var(--color-text-primary)]">{liveClock}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/75 border border-[var(--color-border)] px-2 py-0.5 text-[10.5px]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                Riêng tư
              </span>
            </div>

            {/* Brand top bar */}
            <div className="flex items-center justify-center relative mt-2.5 h-10">
              <button
                onClick={handleBack}
                aria-label={step === 0 ? 'Đóng' : 'Quay lại'}
                className="absolute left-0 w-9 h-9 rounded-full bg-white shadow-[0_2px_8px_rgba(58,74,42,0.1)] flex items-center justify-center text-[var(--color-primary)] active:scale-95 transition-transform"
                type="button"
              >
                {step === 0 ? (
                  <span className="material-symbols-outlined text-[19px]">close</span>
                ) : (
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--color-primary)"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 12H5M11 6l-6 6 6 6" />
                  </svg>
                )}
              </button>

              <div className="flex items-center gap-1.5 font-black text-[19px] text-[var(--color-primary)] tracking-tight">
                <LeafIcon s={22} c="var(--color-primary)" />
                <span>MindCare</span>
              </div>

              <button
                onClick={onClose}
                aria-label="Đóng check-in"
                className="absolute right-0 w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-white/60 transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Step progress info */}
            <div className="flex justify-between items-center mt-2.5 font-bold text-[14px]">
              <span>Check-in cảm xúc</span>
              <span className="font-semibold text-[var(--color-text-secondary)]">Bước {step + 1}/3</span>
            </div>

            {/* 3 Progress Bars */}
            <div className="flex gap-1.5 mt-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                    i <= step
                      ? 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]'
                      : 'bg-[var(--color-border)]'
                  }`}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Completion Status bar */
          <div className="relative z-20 pt-3 px-5 md:pt-5 md:px-7">
            <div className="flex justify-between items-center text-[12px] font-semibold text-[var(--color-text-secondary)] px-1 md:hidden">
              <span className="tabular-nums font-bold text-[var(--color-text-primary)]">{liveClock}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/75 border border-[var(--color-border)] px-2 py-0.5 text-[10.5px]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                Đã ghi nhận
              </span>
            </div>
            <div className="flex items-center justify-center relative mt-2.5 h-10">
              <div className="flex items-center gap-1.5 font-black text-[19px] text-[var(--color-primary)] tracking-tight">
                <LeafIcon s={22} c="var(--color-primary)" />
                <span>MindCare</span>
              </div>
            </div>
          </div>
        )}

        {/* Screen 0: Mood Selection */}
        {step === 0 && (
          <div className="relative z-10 flex-1 px-5 pt-2 flex flex-col justify-between pb-6 animate-fade-in">
            <div>
              {/* Date */}
              <div className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--color-text-secondary)] mt-1">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-text-secondary)"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <rect x="3" y="5" width="18" height="16" rx="3" />
                  <path d="M3 10h18M8 3v4M16 3v4" />
                </svg>
                <span>{dateStr}</span>
              </div>

              {/* Title */}
              <h1 className="text-[26px] leading-[1.12] tracking-[-0.6px] font-black text-[var(--color-primary)] mt-2 mb-1">
                Hôm nay bạn cảm<br />thấy thế nào?
              </h1>

              {/* Glowing Sprout Mascot Hero */}
              <div className="relative w-[210px] h-[210px] mx-auto my-1 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,var(--color-highlight)_0_38%,var(--color-surface-mint)_39%_62%,var(--color-chart-background)_63%_100%)]" />
                <span className="absolute -right-1 -top-1">
                  <Dashes flip={false} />
                </span>
                <span className="absolute left-0 bottom-2">
                  <Dashes flip={true} />
                </span>
                <div className="relative z-10">
                  <Mascot
                    w={170}
                    mouth={mood === 4 ? 'happy' : 'smile'}
                    className="transform translate-y-1"
                  />
                </div>
              </div>

              {/* Mood title with dashes */}
              <div className="flex items-center justify-center gap-3 text-[26px] font-black text-[var(--color-primary)] mt-1">
                <Dashes flip={false} />
                <span>{currentMoodObj.n}</span>
                <Dashes flip={true} />
              </div>
              <div className="text-center text-[var(--color-text-secondary)] text-[13px] font-medium mt-0.5">
                {currentMoodObj.sub}
              </div>

              {/* 5 Mood Faces */}
              <div
                className="flex justify-between items-center mt-4 px-1"
                role="group"
                aria-label="Chọn tâm trạng"
              >
                {MOODS.map((item, idx) => {
                  const isSel = idx === mood;
                  return (
                    <button
                      key={item.n}
                      type="button"
                      onClick={() => {
                        setMood(idx);
                        try {
                          soundEngine.playChime('inhale');
                        } catch {
                          // ignore
                        }
                      }}
                      className={`flex flex-col items-center gap-1.5 w-[52px] text-[11px] transition-all ${
                        isSel ? 'text-[var(--color-primary)] font-black' : 'text-[var(--color-text-secondary)] font-semibold'
                      }`}
                    >
                      <span
                        className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                          isSel
                            ? 'shadow-[0_0_0_3px_var(--color-surface),0_0_0_5px_var(--color-primary)] scale-105'
                            : 'shadow-[0_2px_6px_rgba(58,74,42,0.08)] hover:scale-105'
                        }`}
                      >
                        <MoodFace index={idx} />
                      </span>
                      <span className="leading-tight text-center">
                        {item.n === 'Bình thường' ? 'Bình thường' : item.n}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Button */}
            <div className="pt-3">
              <button
                type="button"
                onClick={handleNext}
                className="w-full h-[50px] rounded-full font-black text-[16px] text-white flex items-center justify-center gap-2 shadow-[0_6px_14px_rgba(42,95,56,0.2),inset_0_1px_0_rgba(255,255,255,0.2)] bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-primary)] hover:brightness-105 active:scale-[0.97] transition-all"
              >
                <span>Tiếp tục</span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Screen 1: Stress & Sleep */}
        {step === 1 && (
          <div className="relative z-10 flex-1 px-5 pt-2 flex flex-col justify-between pb-6 animate-fade-in">
            <div>
              {/* Stress Header */}
              <div className="flex items-center justify-between mt-1">
                <h2 className="text-[20px] font-black tracking-[-0.3px] text-[var(--color-primary)]">
                  Mức căng thẳng
                </h2>
                <span className={`px-3 py-1 rounded-full font-extrabold text-[12px] ${currentStressBadge.cls}`}>
                  {currentStressBadge.label}
                </span>
              </div>

              {/* Stress Card with 11 dynamic bars */}
              <div className="mt-2.5 p-3.5 h-[190px] rounded-[22px] bg-white/90 border border-[var(--color-border)] shadow-[0_6px_18px_rgba(31,92,67,0.06)] relative overflow-hidden">
                <div className="text-[52px] font-black leading-none tracking-[-2px] text-[var(--color-primary)]">
                  {stress}
                  <small className="text-[20px] font-bold text-[var(--color-text-secondary)] tracking-normal ml-0.5">
                    /10
                  </small>
                </div>

                {/* Peeking Mascot top right */}
                <div className="absolute right-3 top-1 w-[78px]">
                  <Mascot w={78} mouth="smile" leafSway={8} />
                </div>

                {/* 11 Vertical Bars */}
                <div
                  className="flex gap-1.5 items-end h-[74px] absolute left-3.5 right-3.5 bottom-8"
                  role="group"
                  aria-label="Chọn mức căng thẳng"
                >
                  {Array.from({ length: 11 }, (_, i) => {
                    const h = 12 + i * 5.6;
                    const on = i <= stress;
                    const isAct = i === stress;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setStress(i);
                          try {
                            soundEngine.playChime('inhale');
                          } catch {
                            // ignore
                          }
                        }}
                        aria-label={`${i} trên 10`}
                        className={`flex-1 rounded-t-[6px] rounded-b-[4px] min-w-0 transition-all ${
                          isAct ? 'outline outline-[2.5px] outline-[var(--color-primary)] -outline-offset-1' : ''
                        }`}
                        style={{
                          height: `${h}px`,
                          backgroundColor: on ? barColor(i) : 'var(--color-border)',
                        }}
                      />
                    );
                  })}
                </div>

                {/* Ends labels */}
                <div className="absolute left-3.5 right-3.5 bottom-2 flex justify-between text-[11px] font-medium text-[var(--color-text-secondary)]">
                  <span>0 · Thư thả</span>
                  <span>10 · Rất căng</span>
                </div>
              </div>

              {/* Sleep section */}
              <h2 className="mt-4 text-[19px] font-black tracking-[-0.3px] text-[var(--color-primary)]">
                Giấc ngủ đêm qua
              </h2>

              <div className="grid grid-cols-2 gap-2 mt-2">
                {SLEEP_OPTIONS.map((item, idx) => {
                  const isSel = idx === sleep;
                  return (
                    <button
                      key={item.dur}
                      type="button"
                      onClick={() => {
                        setSleep(idx);
                        try {
                          soundEngine.playChime('inhale');
                        } catch {
                          // ignore
                        }
                      }}
                      className={`h-[60px] rounded-[16px] px-3 flex items-center gap-2.5 text-left relative transition-all active:scale-[0.98] ${
                        isSel
                          ? 'bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-primary)] text-white border border-[var(--color-primary)]'
                          : 'bg-white/85 border border-[var(--color-border)] text-[var(--color-primary)]'
                      }`}
                    >
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          isSel ? 'bg-white/20' : 'bg-[var(--color-surface-mint)]'
                        }`}
                      >
                        <MoonIcon c={isSel ? '#fff' : 'var(--color-primary)'} s={16} />
                      </span>
                      <div>
                        <b className="block text-[16px] leading-tight font-black">{item.dur}</b>
                        <small
                          className={`text-[11px] ${
                            isSel ? 'text-[var(--color-highlight)]' : 'text-[var(--color-text-secondary)]'
                          }`}
                        >
                          {item.label}
                        </small>
                      </div>
                      {isSel && (
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-xs">
                          <svg
                            width="11"
                            height="11"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="var(--color-primary)"
                            strokeWidth="3.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M5 12.5l4.5 4.5L19 7" />
                          </svg>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Sweet sleeping sprout on green hill with z z */}
              <div className="relative mt-2 h-[80px] overflow-hidden">
                <svg
                  width="372"
                  height="80"
                  viewBox="0 0 372 80"
                  preserveAspectRatio="none"
                  className="absolute -left-5 bottom-0 md:left-0 md:w-full"
                >
                  <path
                    d="M0 80V60q60-20 120-6t110-8q60 4 142 16v18z"
                    fill="var(--color-surface-mint)"
                  />
                </svg>
                <div className="absolute left-[58%] bottom-1 -translate-x-1/2">
                  <Mascot w={80} mouth="sleep" />
                </div>
                <span className="absolute left-[72%] bottom-10 font-black text-[var(--color-secondary)] text-[13px]">
                  z<span className="text-[10px]">z</span>
                </span>
              </div>
            </div>

            {/* Bottom buttons: Back & Next */}
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="w-[100px] h-[50px] rounded-full font-bold text-[15px] text-[var(--color-primary)] bg-[var(--color-surface)] border-[1.5px] border-[var(--color-border)] active:scale-[0.97] transition-all flex items-center justify-center"
              >
                Quay lại
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 h-[50px] rounded-full font-black text-[16px] text-white flex items-center justify-center gap-2 shadow-[0_6px_14px_rgba(42,95,56,0.2),inset_0_1px_0_rgba(255,255,255,0.2)] bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-primary)] hover:brightness-105 active:scale-[0.97] transition-all"
              >
                <span>Tiếp tục</span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Screen 2: Note & AI */}
        {step === 2 && (
          <div className="relative z-10 flex-1 px-5 pt-2 flex flex-col justify-between pb-6 animate-fade-in">
            <div>
              {/* Heading */}
              <h1 className="text-[21px] leading-[1.15] font-black text-[var(--color-primary)] mt-1">
                Bạn muốn ghi lại điều<br />gì hôm nay?
              </h1>

              {/* Summary chips */}
              <div className="flex flex-wrap gap-1.5 mt-2 max-w-[80%]">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-[var(--color-border)] text-[11px] font-bold">
                  <i className="w-2 h-2 rounded-full bg-[var(--color-secondary)]" />
                  <span>{currentMoodObj.n}</span>
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-[var(--color-border)] text-[11px] font-bold">
                  <i
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: stress <= 3 ? 'var(--color-highlight)' : stress <= 6 ? 'var(--color-secondary)' : 'var(--color-primary)',
                    }}
                  />
                  <span>Căng thẳng {stress}/10</span>
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-[var(--color-border)] text-[11px] font-bold">
                  <MoonIcon c="var(--color-primary)" s={12} />
                  <span>Ngủ {SLEEP_OPTIONS[sleep].dur}</span>
                </span>
              </div>

              {/* Peeking Mascot behind editor */}
              <div className="absolute right-5 top-[95px] w-[68px] overflow-hidden pointer-events-none">
                <Mascot w={68} mouth="smile" />
              </div>

              {/* Editor Textarea */}
              <textarea
                id="journal-input"
                maxLength={500}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Viết vài dòng về cảm xúc, suy nghĩ hoặc điều khiến bạn bận tâm hôm nay..."
                className="relative z-10 block w-full h-[135px] mt-3.5 border border-[var(--color-border)] rounded-[18px] bg-[var(--color-surface)] p-3 text-[14px] text-[var(--color-primary)] placeholder:text-[var(--color-text-secondary)] leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
              />

              {/* Character counter */}
              <div className="text-right text-[11px] text-[var(--color-text-secondary)] mt-1 font-medium">
                <span>{note.length}</span>/500
              </div>

              {/* Quick Prompts */}
              <div className="text-[12px] font-bold text-[var(--color-text-secondary)] mt-1 mb-1.5">
                Gợi ý để bắt đầu
              </div>
              <div className="flex flex-col items-start gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAppendPrompt('Hôm nay mình biết ơn ')}
                  className="flex items-center gap-2 rounded-full border border-dashed border-[var(--color-secondary)]/45 bg-[var(--color-highlight)] px-3 py-1.5 text-[12px] font-bold text-[var(--color-primary)] transition-all hover:bg-[var(--color-surface-mint)] active:scale-[0.98]"
                >
                  <LeafIcon s={14} c="var(--color-primary)" />
                  <span>Điều mình biết ơn</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAppendPrompt('Điều làm mình bận tâm là ')}
                  className="flex items-center gap-2 rounded-full border border-dashed border-[var(--color-secondary)]/45 bg-[var(--color-highlight)] px-3 py-1.5 text-[12px] font-bold text-[var(--color-primary)] transition-all hover:bg-[var(--color-surface-mint)] active:scale-[0.98]"
                >
                  <LeafIcon s={14} c="var(--color-primary)" />
                  <span>Điều làm mình bận tâm</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAppendPrompt('Một niềm vui nhỏ hôm nay là ')}
                  className="flex items-center gap-2 rounded-full border border-dashed border-[var(--color-secondary)]/45 bg-[var(--color-highlight)] px-3 py-1.5 text-[12px] font-bold text-[var(--color-primary)] transition-all hover:bg-[var(--color-surface-mint)] active:scale-[0.98]"
                >
                  <LeafIcon s={14} c="var(--color-primary)" />
                  <span>Một niềm vui nhỏ</span>
                </button>
              </div>

              {/* AI toggle card */}
              <div className="mt-3 flex items-center gap-3 rounded-[18px] border border-dashed border-[var(--color-secondary)]/35 bg-white p-3 shadow-[0_4px_12px_rgba(31,92,67,0.05)]">
                <div className="w-8 h-8 rounded-full bg-[var(--color-surface-mint)] flex items-center justify-center shrink-0">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--color-primary)"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  >
                    <path d="M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <b className="block text-[13px] font-black text-[var(--color-primary)]">Nhận gợi ý từ AI</b>
                  <small className="text-[11px] text-[var(--color-text-secondary)] leading-tight block">
                    Lời nhắc nhẹ nhàng dựa trên check-in hôm nay
                  </small>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={ai}
                  onClick={() => setAi(!ai)}
                  className={`w-[48px] h-[28px] rounded-full relative transition-colors duration-200 shrink-0 ${
                    ai ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'
                  }`}
                >
                  <span
                    className={`block w-[22px] h-[22px] rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.2)] transition-transform duration-200 absolute top-[3px] left-[3px] ${
                      ai ? 'translate-x-[20px]' : ''
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Foot: Back & Complete */}
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="w-[100px] h-[50px] rounded-full font-bold text-[15px] text-[var(--color-primary)] bg-[var(--color-surface)] border-[1.5px] border-[var(--color-border)] active:scale-[0.97] transition-all flex items-center justify-center"
              >
                Quay lại
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 h-[50px] rounded-full font-black text-[16px] text-white flex items-center justify-center gap-2 shadow-[0_6px_14px_rgba(42,95,56,0.2),inset_0_1px_0_rgba(255,255,255,0.2)] bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-primary)] hover:brightness-105 active:scale-[0.97] transition-all"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12.5l4.5 4.5L19 7" />
                </svg>
                <span>Hoàn tất</span>
              </button>
            </div>
          </div>
        )}

        {/* Screen 3: Done Screen */}
        {step === 3 && (
          <div className="relative z-10 flex-1 px-5 pt-1 flex flex-col justify-between pb-7 text-center animate-fade-in">
            <div>
              {/* Celebratory Mascot hugging heart */}
              <div className="relative w-[230px] h-[200px] mx-auto mt-4">
                <div className="absolute inset-[10px_4px_0_4px] rounded-[55%_45%_50%_50%/55%_50%_50%_45%] bg-[var(--color-chart-background)]" />
                <svg
                  width="36"
                  height="32"
                  viewBox="0 0 40 36"
                  className="absolute left-2 top-8 -rotate-12"
                >
                  <path
                    d="M20 33C6 22 2 14 7 8c5-5 11-1 13 3 2-4 8-8 13-3 5 6 1 14-13 25z"
                    fill="none"
                    stroke="var(--color-secondary)"
                    strokeWidth="3"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="absolute right-2 top-10">
                  <Dashes flip={true} />
                </span>
                <div className="absolute left-1/2 top-1 -translate-x-1/2">
                  <Mascot w={190} mouth="happy" heart={true} />
                </div>
              </div>

              {/* Celebration Title */}
              <h1 className="text-[30px] font-black leading-tight text-[var(--color-primary)] mt-2 mb-2">
                Đã hoàn tất<br />check-in!
              </h1>
              <p className="text-[var(--color-text-secondary)] text-[14px] leading-relaxed">
                Cảm ơn bạn đã dành thời gian<br />lắng nghe chính mình.
                <span className="material-symbols-outlined filled ml-1 text-[16px] text-[var(--color-secondary)]">
                  favorite
                </span>
              </p>

              <p role="status" aria-live="polite" className="mt-2 text-[12px] font-semibold text-[var(--color-primary)]">
                Check-in đã được ghi nhận trên thiết bị này.
              </p>

              {/* 3 Stats Badges */}
              <div className="flex gap-2 mt-5">
                <div className="flex-1 rounded-[16px] bg-[var(--color-highlight)] py-3 px-1 text-[11px] text-[var(--color-text-secondary)]">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--color-primary)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="mx-auto mb-1"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M8.5 14.5q3.5 3.5 7 0M9 9.5v.5M15 9.5v.5" />
                  </svg>
                  Tâm trạng
                  <b className="block text-[15px] font-black text-[var(--color-primary)] mt-0.5">
                    {currentMoodObj.n}
                  </b>
                </div>

                <div className="flex-1 rounded-[16px] bg-[var(--color-surface-mint)] py-3 px-1 text-[11px] text-[var(--color-text-secondary)]">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="var(--color-surface-mint)"
                    stroke="var(--color-secondary)"
                    strokeWidth="2"
                    strokeLinejoin="round"
                    className="mx-auto mb-1"
                  >
                    <path d="M13 2L4 14h7l-1 8 9-12h-7z" />
                  </svg>
                  Stress
                  <b className="block text-[15px] font-black text-[var(--color-primary)] mt-0.5">
                    {stress}/10
                  </b>
                </div>

                <div className="flex-1 rounded-[16px] bg-[var(--color-highlight)] py-3 px-1 text-[11px] text-[var(--color-text-secondary)]">
                  <div className="flex justify-center mb-1">
                    <MoonIcon c="var(--color-primary)" s={22} />
                  </div>
                  Ngủ
                  <b className="block text-[15px] font-black text-[var(--color-primary)] mt-0.5">
                    {SLEEP_OPTIONS[sleep].dur}
                  </b>
                </div>
              </div>
            </div>

            {/* Done Action Buttons */}
            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => handleFinish('home')}
                className="w-full h-[50px] rounded-full font-black text-[15px] text-white flex items-center justify-center gap-2 shadow-[0_6px_14px_rgba(42,95,56,0.2),inset_0_1px_0_rgba(255,255,255,0.2)] bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-primary)] hover:brightness-105 active:scale-[0.97] transition-all"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10" />
                </svg>
                <span>Về trang chủ</span>
              </button>

              <button
                type="button"
                onClick={() => handleFinish('journal')}
                className="w-full h-[48px] rounded-full font-bold text-[15px] text-[var(--color-primary)] bg-[var(--color-surface)] border-[1.5px] border-[var(--color-primary)] hover:bg-[var(--color-background)] active:scale-[0.97] transition-all flex items-center justify-center gap-2"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 6C9 4 6 4 3 5v14c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1zM12 6v14" />
                </svg>
                <span>Xem nhật ký</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
