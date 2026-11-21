import React, { useState } from 'react';
import {
  WELLNESS_EXERCISES,
  WellnessExerciseId,
} from '../data/wellnessExercises';
import {
  MochiHappyCompanion,
  MochiLandingHero,
  MochiRestingCompanion,
  MochiThinkingCompanion,
} from './MochiIllustrations';

interface ExerciseDetailScreenProps {
  exerciseId: WellnessExerciseId;
  isCompleted: boolean;
  onComplete: (id: WellnessExerciseId) => void;
  onBack: () => void;
}

const EMOTIONS = ['Bình yên', 'Nhẹ nhõm', 'Hơi lo', 'Mệt', 'Biết ơn'];
const SELFCARE_OPTIONS = [
  'Uống một cốc nước',
  'Rời màn hình trong 5 phút',
  'Nhắn tin cho người mình tin tưởng',
  'Đi bộ và hít thở chậm',
];

export const ExerciseDetailScreen: React.FC<ExerciseDetailScreenProps> = ({
  exerciseId,
  isCompleted,
  onComplete,
  onBack,
}) => {
  const exercise = WELLNESS_EXERCISES.find((item) => item.id === exerciseId)!;
  const [gratitude, setGratitude] = useState(['', '', '']);
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [selectedSelfcare, setSelectedSelfcare] = useState('');
  const [breathStep, setBreathStep] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);

  const canComplete =
    exerciseId === 'gratitude'
      ? gratitude.some((value) => value.trim())
      : exerciseId === 'emotion'
        ? Boolean(selectedEmotion)
        : exerciseId === 'selfcare'
          ? Boolean(selectedSelfcare)
          : breathStep >= 3;

  if (showCompletion) {
    return (
      <div className="flex min-h-[calc(100vh-33px)] flex-1 flex-col items-center justify-center bg-[var(--color-background)] px-6 text-center text-[var(--color-text-primary)]">
        <div className="relative">
          <div className="absolute inset-6 rounded-full bg-[var(--color-highlight)]/70 blur-xl" />
          <MochiLandingHero className="relative h-44 w-52" />
        </div>
        <h1 className="mt-5 max-w-[300px] text-[22px] font-bold leading-8 text-[var(--color-primary)]">
          Bạn đã dành một chút thời gian cho mình
        </h1>
        <p className="mt-2 max-w-[300px] text-[13px] leading-5 text-[var(--color-text-secondary)]">
          Một khoảnh khắc nhỏ cũng có thể giúp ngày hôm nay dịu lại.
        </p>
        <button
          onClick={onBack}
          className="mt-7 min-h-11 w-full max-w-[280px] rounded-full bg-[var(--color-primary)] px-5 py-3 text-[13.5px] font-bold text-white active:scale-95 cursor-pointer"
          type="button"
        >
          Về hôm nay
        </button>
      </div>
    );
  }

  const complete = () => {
    if (!canComplete) return;
    onComplete(exercise.id);
    setShowCompletion(true);
  };

  const renderExerciseCompanion = () => {
    if (exerciseId === 'breathing') {
      return <MochiRestingCompanion className="mx-auto h-28 w-28" />;
    }
    if (exerciseId === 'emotion') {
      return <MochiThinkingCompanion className="mx-auto h-28 w-28" />;
    }
    return <MochiHappyCompanion className="mx-auto h-28 w-28" />;
  };

  return (
    <div className="flex min-h-[calc(100vh-33px)] md:min-h-screen flex-1 flex-col bg-[var(--color-background)] px-4 pb-6 md:px-8 md:pb-10 text-[var(--color-text-primary)]">
      <header className="sticky top-0 z-20 -mx-4 grid grid-cols-[44px_1fr_44px] items-center border-b border-[var(--color-border)] bg-[var(--color-background)]/95 px-3 py-2 backdrop-blur md:mx-auto md:w-full md:max-w-2xl md:rounded-b-2xl md:border-x md:px-5">
        <button
          onClick={onBack}
          aria-label="Quay lại"
          className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--color-primary)] hover:bg-[var(--color-surface-mint)] cursor-pointer"
          type="button"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <p className="text-center text-[12px] font-bold text-[var(--color-text-secondary)] md:text-[13px]">
          {exercise.duration}
        </p>
        <div />
      </header>

      <main className="flex flex-1 flex-col pt-4 md:mx-auto md:w-full md:max-w-2xl md:pt-8">
        <section className="text-center">
          {renderExerciseCompanion()}
          <h1 className="mt-2 text-[21px] font-bold text-[var(--color-primary)] md:text-[25px]">
            {exercise.title}
          </h1>
          <p className="mx-auto mt-1 max-w-[310px] text-[12.5px] leading-5 text-[var(--color-text-secondary)] md:max-w-md md:text-[14px]">
            {exercise.description}
          </p>
          {isCompleted && (
            <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-[var(--color-highlight)] px-3 py-1 text-[11.5px] font-bold text-[var(--color-primary)]">
              <span className="material-symbols-outlined text-[15px]">check_circle</span>
              Đã hoàn thành hôm nay
            </span>
          )}
        </section>

        <section className="mt-5 flex-1 rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 md:p-7">
          {exerciseId === 'gratitude' && (
            <>
              <h2 className="text-[14.5px] font-bold leading-6 text-[var(--color-primary)]">
                Hôm nay có 3 điều gì khiến bạn cảm thấy biết ơn?
              </h2>
              <p className="mt-1 text-[12px] leading-5 text-[var(--color-text-secondary)]">
                Bạn có thể viết một, hai hoặc cả ba điều. Nội dung chỉ được dùng trong bài tập này.
              </p>
              <div className="mt-4 space-y-3">
                {gratitude.map((value, index) => (
                  <label key={index} className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F8E5D2] text-[12px] font-bold text-[#8A6746]">
                      {index + 1}
                    </span>
                    <input
                      value={value}
                      onChange={(event) =>
                        setGratitude((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index ? event.target.value : item
                          )
                        )
                      }
                      placeholder="Một điều nhỏ mình trân trọng..."
                      className="min-h-11 flex-1 rounded-xl border border-[var(--color-border)] bg-white px-3 text-[13px] outline-none focus:border-[var(--color-secondary)]"
                    />
                  </label>
                ))}
              </div>
              <p className="mt-4 rounded-xl bg-[var(--color-chart-background)] p-3 text-[11.5px] leading-5 text-[var(--color-text-secondary)]">
                Bài tập này không tự tạo nhật ký. Bạn luôn có quyền quyết định nội dung nào được lưu vào Nhật ký.
              </p>
            </>
          )}

          {exerciseId === 'breathing' && (
            <div className="flex h-full min-h-[250px] flex-col items-center justify-center text-center">
              <div className="flex h-32 w-32 items-center justify-center rounded-full border-[10px] border-[var(--color-highlight)] bg-[var(--color-chart-background)]">
                <span className="text-[17px] font-bold text-[var(--color-primary)]">
                  {['Sẵn sàng', 'Hít vào', 'Giữ nhẹ', 'Thở ra'][breathStep]}
                </span>
              </div>
              <p className="mt-5 max-w-[260px] text-[12px] leading-5 text-[var(--color-text-secondary)]">
                Thả lỏng vai và đi qua ba nhịp thở theo tốc độ thoải mái của bạn.
              </p>
              <button
                onClick={() => setBreathStep((step) => Math.min(3, step + 1))}
                className="mt-4 min-h-11 rounded-full border border-[var(--color-secondary)] px-5 text-[12.5px] font-bold text-[var(--color-primary)] active:scale-95 cursor-pointer"
                type="button"
              >
                {breathStep === 0
                  ? 'Bắt đầu nhịp thở'
                  : breathStep < 3
                    ? 'Nhịp tiếp theo'
                    : 'Đã xong nhịp thở'}
              </button>
            </div>
          )}

          {exerciseId === 'emotion' && (
            <>
              <h2 className="text-[14.5px] font-bold text-[var(--color-primary)]">
                Cảm xúc nào gần với bạn nhất lúc này?
              </h2>
              <p className="mt-1 text-[12px] leading-5 text-[var(--color-text-secondary)]">
                Không có câu trả lời đúng hay sai. Chỉ cần chọn điều gần nhất.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {EMOTIONS.map((emotion) => (
                  <button
                    key={emotion}
                    onClick={() => setSelectedEmotion(emotion)}
                    aria-pressed={selectedEmotion === emotion}
                    className={`min-h-11 rounded-full border px-4 text-[12.5px] font-semibold transition cursor-pointer ${
                      selectedEmotion === emotion
                        ? 'border-[var(--color-secondary)] bg-[var(--color-highlight)] text-[var(--color-primary)]'
                        : 'border-[var(--color-border)] bg-white text-[var(--color-text-secondary)]'
                    }`}
                    type="button"
                  >
                    {emotion}
                  </button>
                ))}
              </div>
              {selectedEmotion && (
                <p className="mt-5 rounded-2xl bg-[var(--color-chart-background)] p-4 text-[12px] leading-5 text-[var(--color-text-secondary)]">
                  Cảm ơn bạn đã gọi tên cảm xúc “{selectedEmotion}”. Chỉ việc nhận ra nó cũng đã là một bước chăm sóc bản thân.
                </p>
              )}
            </>
          )}

          {exerciseId === 'selfcare' && (
            <>
              <h2 className="text-[14.5px] font-bold text-[var(--color-primary)]">
                Chọn một việc nhỏ phù hợp với bạn
              </h2>
              <p className="mt-1 text-[12px] leading-5 text-[var(--color-text-secondary)]">
                Đây là lời gợi ý, không phải danh sách bắt buộc.
              </p>
              <div className="mt-4 space-y-2.5">
                {SELFCARE_OPTIONS.map((option) => (
                  <button
                    key={option}
                    onClick={() => setSelectedSelfcare(option)}
                    className={`flex min-h-12 w-full items-center justify-between rounded-2xl border px-4 text-left text-[12.5px] font-semibold transition cursor-pointer ${
                      selectedSelfcare === option
                        ? 'border-[var(--color-secondary)] bg-[var(--color-surface-mint)] text-[var(--color-primary)]'
                        : 'border-[var(--color-border)] bg-white text-[var(--color-text-secondary)]'
                    }`}
                    type="button"
                  >
                    <span>{option}</span>
                    <span className="material-symbols-outlined text-[18px]">
                      {selectedSelfcare === option ? 'check_circle' : 'circle'}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </section>

        <div className="mt-4 grid grid-cols-[1fr_1.5fr] gap-3">
          <button
            onClick={onBack}
            className="min-h-11 rounded-full border border-[var(--color-border)] text-[12.5px] font-bold text-[var(--color-text-secondary)] active:scale-95 cursor-pointer"
            type="button"
          >
            Để sau
          </button>
          <button
            onClick={complete}
            disabled={!canComplete}
            className="min-h-11 rounded-full bg-[var(--color-primary)] text-[12.5px] font-bold text-white active:scale-95 disabled:cursor-not-allowed disabled:bg-[var(--color-text-secondary)] cursor-pointer"
            type="button"
          >
            Hoàn thành
          </button>
        </div>
      </main>
    </div>
  );
};
