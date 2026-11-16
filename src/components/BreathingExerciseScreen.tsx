import React, { useState, useEffect, useRef } from 'react';
import { soundEngine } from '../utils/audio';

interface BreathingExerciseProps {
  onComplete: () => void;
  onClose: () => void;
}

type Phase = 'inhale' | 'hold' | 'exhale';

export const BreathingExerciseScreen: React.FC<BreathingExerciseProps> = ({
  onComplete,
  onClose,
}) => {
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [phase, setPhase] = useState<Phase>('inhale');
  const [secondsLeft, setSecondsLeft] = useState<number>(4);
  const [currentCycle, setCurrentCycle] = useState<number>(2);
  const totalCycles = 4;
  const [vibrationOn, setVibrationOn] = useState<boolean>(true);
  const [soundMode, setSoundMode] = useState<'rain' | 'ocean' | 'silence'>('rain');
  const [ambientAudioOn, setAmbientAudioOn] = useState<boolean>(true);

  const phaseRef = useRef<Phase>('inhale');
  const secondsRef = useRef<number>(4);
  const isRunningRef = useRef<boolean>(true);

  phaseRef.current = phase;
  secondsRef.current = secondsLeft;
  isRunningRef.current = isRunning;

  // Sound mode management
  useEffect(() => {
    if (ambientAudioOn) {
      if (soundMode === 'rain') soundEngine.playRain();
      else if (soundMode === 'ocean') soundEngine.playOcean();
      else soundEngine.stop();
    } else {
      soundEngine.stop();
    }

    return () => {
      soundEngine.stop();
    };
  }, [soundMode, ambientAudioOn]);

  // Breathing loop timer
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isRunningRef.current) return;

      if (secondsRef.current > 1) {
        setSecondsLeft((s) => s - 1);
      } else {
        // Transition to next phase
        if (phaseRef.current === 'inhale') {
          setPhase('hold');
          setSecondsLeft(7);
          soundEngine.playChime('hold');
        } else if (phaseRef.current === 'hold') {
          setPhase('exhale');
          setSecondsLeft(8);
          soundEngine.playChime('exhale');
        } else {
          // Exhale finished, cycle progresses
          setPhase('inhale');
          setSecondsLeft(4);
          soundEngine.playChime('inhale');
          setCurrentCycle((c) => (c < totalCycles ? c + 1 : 1));
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSoundChange = (mode: 'rain' | 'ocean' | 'silence') => {
    setSoundMode(mode);
    setAmbientAudioOn(mode !== 'silence');
  };

  const toggleAmbientAudio = () => {
    setAmbientAudioOn((prev) => !prev);
  };

  // Dynamic values depending on current phase
  const getPhaseDetails = () => {
    switch (phase) {
      case 'inhale':
        return {
          title: 'Nhịp Hít',
          subtitle: 'Căng cơ nhẹ',
          icon: 'air',
          heading: 'Hít vào nhẹ nhàng bằng mũi (4 giây)',
          instruction: 'Thả lỏng hai vai, mở rộng lồng ngực tự nhiên',
          orbScale: 'scale-110',
          haloOpacity: 'opacity-80 scale-115',
        };
      case 'hold':
        return {
          title: 'Nhịp Giữ',
          subtitle: 'Ổn định nhịp',
          icon: 'timer',
          heading: 'Giữ hơi tĩnh lặng trong lồng ngực (7 giây)',
          instruction: 'Giữ sự bình an, cảm nhận nhịp đập êm đềm',
          orbScale: 'scale-105',
          haloOpacity: 'opacity-60 scale-105',
        };
      case 'exhale':
        return {
          title: 'Nhịp Thở',
          subtitle: 'Giải tỏa áp lực',
          icon: 'spa',
          heading: 'Thở ra chậm rãi bằng miệng (8 giây)',
          instruction: 'Đẩy hết muộn phiền và áp lực ra ngoài, thư giãn toàn thân',
          orbScale: 'scale-90',
          haloOpacity: 'opacity-40 scale-95',
        };
    }
  };

  const details = getPhaseDetails();

  return (
    <div className="flex-1 flex flex-col bg-page-background text-text-primary min-h-screen relative pb-16 md:px-8 md:pb-10">
      {/* Top Header compliant with Image 4 */}
      <header className="w-full px-4 pt-3 pb-2 flex items-center justify-between z-20 md:mx-auto md:max-w-2xl md:px-0 md:pt-5">
        <button
          onClick={onClose}
          aria-label="Đóng bài tập"
          className="w-10 h-10 rounded-full bg-surface-card border border-border-subtle flex items-center justify-center text-text-primary active:scale-95 transition-transform duration-150 shadow-xs focus:outline-none"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        <div className="text-center px-1">
          <span className="text-[11px] text-secondary uppercase tracking-wider block font-semibold">
            Chánh niệm vi mô
          </span>
          <h1 className="text-[16px] text-text-primary font-semibold truncate max-w-[210px] md:max-w-none md:text-[19px]">
            Thực hành vi mô: Hít thở 4-7-8
          </h1>
        </div>

        <button
          onClick={toggleAmbientAudio}
          aria-label="Bật tắt nhạc nền"
          className={`w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-all shadow-xs ${
            ambientAudioOn ? 'bg-surface-mint text-focus-ring' : 'bg-surface-card text-text-secondary border border-border-subtle'
          }`}
          type="button"
        >
          <span
            className="material-symbols-outlined text-[20px]"
            style={{ fontVariationSettings: ambientAudioOn ? "'FILL' 1" : "'FILL' 0" }}
          >
            {ambientAudioOn ? 'music_note' : 'music_off'}
          </span>
        </button>
      </header>

      {/* Main Flow Container */}
      <div className="flex-1 flex flex-col px-4 pb-6 space-y-4 overflow-y-auto no-scrollbar md:mx-auto md:w-full md:max-w-2xl md:px-0 md:pt-2">
        {/* Disclaimer Card */}
        <section className="bg-surface-card border border-border-subtle rounded-xl p-3 flex items-start gap-2.5">
          <div className="p-1 rounded-lg bg-surface-mint text-focus-ring flex-shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              spa
            </span>
          </div>
          <div className="space-y-0.5">
            <div className="inline-flex items-center gap-1 bg-surface-mint px-1.5 py-0.5 rounded text-focus-ring text-[11px] font-medium">
              <span>Dựa trên điều hòa sinh học</span>
            </div>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              Nội dung hướng dẫn điều hòa hơi thở sinh học, hỗ trợ giảm căng thẳng tức thì. Không phải điều trị y tế chuyên sâu.
            </p>
          </div>
        </section>

        {/* Session Progress Pill */}
        <div className="flex items-center justify-between bg-surface-card border border-border-subtle rounded-xl px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
            <span className="text-[13px] text-text-primary font-semibold">
              Chu kỳ {currentCycle} / {totalCycles}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-text-secondary text-[12px]">
            <span className="material-symbols-outlined text-[16px]">schedule</span>
            <span>Thời lượng: 2 phút</span>
          </div>
        </div>

        {/* Core Interactive Visual Breathing Circle */}
        <section aria-live="polite" className="relative py-4 flex flex-col items-center justify-center min-h-[280px] select-none md:min-h-[320px]">
          {/* Diffuse Background Ambient Rays */}
          <div
            className={`absolute w-64 h-64 rounded-full bg-surface-container-low transition-all duration-1000 pointer-events-none -z-0 md:w-72 md:h-72 ${details.haloOpacity}`}
          ></div>
          <div
            className={`absolute w-52 h-52 rounded-full bg-surface-mint/80 border border-primary/20 transition-all duration-1000 pointer-events-none -z-0 md:w-60 md:h-60 ${details.haloOpacity}`}
          ></div>

          {/* The Interactive Orb */}
          <div
            className={`relative w-48 h-48 rounded-full bg-surface-card border-2 border-primary flex flex-col items-center justify-center p-4 text-center z-10 shadow-[0_8px_24px_rgba(20,87,64,0.08)] transition-transform duration-1000 ease-in-out md:w-52 md:h-52 ${details.orbScale}`}
          >
            <span className="text-[11px] text-secondary uppercase font-semibold tracking-wide">
              {details.title}
            </span>
            <span className="text-[32px] text-focus-ring my-0.5 font-bold font-mono tabular-nums">
              {secondsLeft}s
            </span>
            <div className="flex items-center gap-1 text-primary">
              <span className="material-symbols-outlined text-[16px]">{details.icon}</span>
              <span className="text-[12px] font-semibold">{details.subtitle}</span>
            </div>
          </div>

          {/* Dynamic Guidance Prompt */}
          <div className="mt-4 text-center max-w-[280px] md:max-w-md">
            <h2 className="text-[16px] text-text-primary font-semibold md:text-[18px]">
              {details.heading}
            </h2>
            <p className="text-[11px] text-text-secondary mt-0.5 md:text-[13px]">
              {details.instruction}
            </p>
          </div>
        </section>

        {/* 3-Phase Biological Rhythm Breakdown */}
        <section aria-label="Các bước nhịp điệu sinh học" className="space-y-1.5">
          <h3 className="text-[13px] text-text-secondary px-1 font-semibold">Tiến trình nhịp điệu</h3>
          <div className="grid grid-cols-3 gap-2">
            {/* Step 1: Inhale */}
            <div
              className={`rounded-xl p-2.5 flex flex-col items-center text-center transition-all ${
                phase === 'inhale'
                  ? 'bg-surface-mint border border-primary shadow-xs'
                  : 'bg-surface-card border border-border-subtle opacity-80'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-semibold mb-1 ${
                  phase === 'inhale' ? 'bg-focus-ring text-white' : 'bg-surface-container-high text-text-primary'
                }`}
              >
                1
              </div>
              <span className={`text-[12px] font-semibold ${phase === 'inhale' ? 'text-focus-ring' : 'text-text-primary'}`}>
                Hít vào (4s)
              </span>
              <span className="text-[10px] text-text-secondary mt-0.5">Làm dịu ngực</span>
            </div>

            {/* Step 2: Hold */}
            <div
              className={`rounded-xl p-2.5 flex flex-col items-center text-center transition-all ${
                phase === 'hold'
                  ? 'bg-surface-mint border border-primary shadow-xs'
                  : 'bg-surface-card border border-border-subtle opacity-80'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-semibold mb-1 ${
                  phase === 'hold' ? 'bg-focus-ring text-white' : 'bg-surface-container-high text-text-primary'
                }`}
              >
                2
              </div>
              <span className={`text-[12px] font-semibold ${phase === 'hold' ? 'text-focus-ring' : 'text-text-primary'}`}>
                Giữ hơi (7s)
              </span>
              <span className="text-[10px] text-text-secondary mt-0.5">Ổn định nhịp</span>
            </div>

            {/* Step 3: Exhale */}
            <div
              className={`rounded-xl p-2.5 flex flex-col items-center text-center transition-all ${
                phase === 'exhale'
                  ? 'bg-surface-mint border border-primary shadow-xs'
                  : 'bg-surface-card border border-border-subtle opacity-80'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-semibold mb-1 ${
                  phase === 'exhale' ? 'bg-focus-ring text-white' : 'bg-surface-container-high text-text-primary'
                }`}
              >
                3
              </div>
              <span className={`text-[12px] font-semibold ${phase === 'exhale' ? 'text-focus-ring' : 'text-text-primary'}`}>
                Thở ra (8s)
              </span>
              <span className="text-[10px] text-text-secondary mt-0.5">Giải tỏa áp lực</span>
            </div>
          </div>
        </section>

        {/* Settings & Controls Deck */}
        <section className="bg-surface-card border border-border-subtle rounded-2xl p-4 space-y-4 card-shadow">
          {/* Pause/Resume & Haptic Feedback Toggles */}
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsRunning(!isRunning)}
                aria-label="Tạm dừng hoặc tiếp tục"
                className="w-10 h-10 rounded-xl bg-surface-mint text-focus-ring flex items-center justify-center active:scale-95 transition-transform"
                type="button"
              >
                <span className="material-symbols-outlined text-[22px]">
                  {isRunning ? 'pause' : 'play_arrow'}
                </span>
              </button>
              <div>
                <span className="text-[13px] text-text-primary block font-semibold">
                  {isRunning ? 'Tạm dừng nhịp' : 'Tiếp tục nhịp'}
                </span>
                <span className="text-[11px] text-text-secondary">
                  {isRunning ? 'Đang vận hành êm' : 'Đang tạm dừng'}
                </span>
              </div>
            </div>

            {/* Vibration Switch */}
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-text-secondary text-[20px]">vibration</span>
              <button
                onClick={() => setVibrationOn(!vibrationOn)}
                aria-checked={vibrationOn}
                className={`w-12 h-6 rounded-full relative p-0.5 transition-colors duration-200 focus:outline-none ${
                  vibrationOn ? 'bg-primary' : 'bg-border-subtle'
                }`}
                role="switch"
                type="button"
              >
                <span
                  className={`block w-5 h-5 bg-surface-card rounded-full shadow-md transform transition-transform duration-200 ${
                    vibrationOn ? 'translate-x-6' : 'translate-x-0'
                  }`}
                ></span>
              </button>
            </div>
          </div>

          {/* Ambient Sound Choice Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] text-text-primary font-semibold">Âm thanh thư giãn</span>
              <span className="text-[11px] text-text-secondary">Âm lượng êm 45%</span>
            </div>
            <div className="flex gap-2">
              {/* Option 1: Rain */}
              <button
                onClick={() => handleSoundChange('rain')}
                className={`flex-1 py-2 px-1 rounded-xl flex flex-col items-center gap-1 active:scale-95 transition-all ${
                  soundMode === 'rain' && ambientAudioOn
                    ? 'bg-surface-mint border border-primary text-focus-ring font-semibold shadow-xs'
                    : 'bg-surface-card border border-border-subtle text-text-secondary hover:bg-surface-mint/40'
                }`}
                type="button"
              >
                <span
                  className="material-symbols-outlined text-[18px]"
                  style={{ fontVariationSettings: soundMode === 'rain' ? "'FILL' 1" : "'FILL' 0" }}
                >
                  rainy
                </span>
                <span className="text-[11px]">Mưa đêm</span>
              </button>

              {/* Option 2: Ocean */}
              <button
                onClick={() => handleSoundChange('ocean')}
                className={`flex-1 py-2 px-1 rounded-xl flex flex-col items-center gap-1 active:scale-95 transition-all ${
                  soundMode === 'ocean' && ambientAudioOn
                    ? 'bg-surface-mint border border-primary text-focus-ring font-semibold shadow-xs'
                    : 'bg-surface-card border border-border-subtle text-text-secondary hover:bg-surface-mint/40'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">waves</span>
                <span className="text-[11px]">Sóng biển</span>
              </button>

              {/* Option 3: Silence */}
              <button
                onClick={() => handleSoundChange('silence')}
                className={`flex-1 py-2 px-1 rounded-xl flex flex-col items-center gap-1 active:scale-95 transition-all ${
                  soundMode === 'silence' || !ambientAudioOn
                    ? 'bg-surface-mint border border-primary text-focus-ring font-semibold shadow-xs'
                    : 'bg-surface-card border border-border-subtle text-text-secondary hover:bg-surface-mint/40'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">volume_off</span>
                <span className="text-[11px]">Yên lặng</span>
              </button>
            </div>
          </div>
        </section>

        {/* Primary Completion CTA */}
        <div className="pt-1 pb-2">
          <button
            onClick={() => {
              soundEngine.stop();
              onComplete();
            }}
            className="w-full py-3.5 px-4 bg-focus-ring text-white rounded-xl text-[16px] font-semibold flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(20,87,64,0.2)] active:scale-98 transition-transform"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
            <span>Hoàn thành bài tập</span>
          </button>
          <p className="text-[11px] text-center text-text-secondary mt-2">
            Ghi nhận phản hồi cảm giác sau khi tập xong
          </p>
        </div>
      </div>
    </div>
  );
};
