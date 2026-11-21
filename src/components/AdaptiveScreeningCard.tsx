import React, { useEffect, useState } from 'react';
import {
  AdaptiveScreeningPrompt,
  RiskSnapshot,
  ScreeningScaleDTO,
  ScreeningScaleType,
  ScreeningSubmitResult,
} from '../types';
import { apiClient } from '../services/apiClient';

interface AdaptiveScreeningCardProps {
  prompt?: AdaptiveScreeningPrompt | null;
  initialScale?: ScreeningScaleType;
  onRiskSnapshotUpdate: (snapshot: RiskSnapshot) => void;
  onOpenCrisisDrawer?: () => void;
  onOpenBreathing?: () => void;
  onDismiss?: () => void;
}

export const AdaptiveScreeningCard: React.FC<AdaptiveScreeningCardProps> = ({
  prompt,
  initialScale = 'PHQ2_GAD2',
  onRiskSnapshotUpdate,
  onOpenCrisisDrawer,
  onOpenBreathing,
  onDismiss,
}) => {
  const [activeScaleType, setActiveScaleType] = useState<ScreeningScaleType>(
    prompt?.recommendedScale || initialScale
  );
  const [scaleData, setScaleData] = useState<ScreeningScaleDTO | null>(null);
  const [isLoadingScale, setIsLoadingScale] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<ScreeningSubmitResult | null>(null);

  useEffect(() => {
    if (prompt?.recommendedScale) {
      setActiveScaleType(prompt.recommendedScale);
    }
  }, [prompt?.recommendedScale]);

  useEffect(() => {
    let mounted = true;
    setIsLoadingScale(true);
    apiClient
      .getScreeningScale(activeScaleType)
      .then((dto) => {
        if (!mounted) return;
        setScaleData(dto);
      })
      .finally(() => {
        if (mounted) setIsLoadingScale(false);
      });
    return () => {
      mounted = false;
    };
  }, [activeScaleType]);

  const totalQuestions = scaleData?.questions.length || 0;
  const answeredCount = scaleData
    ? scaleData.questions.filter((q) => answers[q.id] !== undefined).length
    : 0;
  const allAnswered = totalQuestions > 0 && answeredCount === totalQuestions;

  const handleSelectOption = (questionId: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (!scaleData || !allAnswered) return;
    setIsSubmitting(true);
    try {
      const res = await apiClient.submitScreening(scaleData.scaleType, answers);
      setSubmitResult(res);
      onRiskSnapshotUpdate(res.riskSnapshot);
      if (res.riskSnapshot.currentTier === 'L4' || res.phq9Item9Score >= 2) {
        onOpenCrisisDrawer?.();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartFollowUp = (nextScale: ScreeningScaleType) => {
    setSubmitResult(null);
    setActiveScaleType(nextScale);
    // Keep overlapping phq1/phq2/gad1/gad2 answers if already answered so user doesn't repeat unnecessarily, or allow editing
    setIsExpanded(true);
  };

  return (
    <section
      aria-label="Thẻ rà soát cảm xúc thích ứng"
      className="rounded-[24px] bg-[#FFFCF7] border border-[#CFE2CA] p-4 md:p-5 shadow-[0_6px_22px_rgba(31,92,67,0.07)] space-y-3.5 transition-all"
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-[#E7F1DF] border border-[#C5DEC0] flex items-center justify-center text-[#1F5C43] shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-[20px]">psychology_alt</span>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#1F5C43] bg-[#E7F1DF] px-2.5 py-0.5 rounded-full">
                Rà soát cảm xúc thích ứng
              </span>
              <span className="text-[11px] font-semibold text-[#A7683F] bg-[#FFF0E1] px-2 py-0.5 rounded-full">
                {activeScaleType === 'PHQ2_GAD2'
                  ? 'Pha 1 · 30 giây'
                  : activeScaleType === 'PHQ9'
                    ? 'Pha 2 · PHQ-9'
                    : 'Pha 2 · GAD-7'}
              </span>
            </div>
            <h3 className="text-[15px] font-bold text-[#1F5C43] mt-1">
              {scaleData?.title || 'Rà soát cảm xúc ngắn cùng Mochi'}
            </h3>
          </div>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Ẩn thẻ rà soát"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#756455] hover:bg-[#E7F1DF] hover:text-[#1F5C43] transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}
      </div>

      {/* State A: Gentle Invitation before expanding */}
      {!isExpanded && !submitResult && (
        <div className="space-y-3">
          <p className="text-[13px] leading-relaxed text-[#4E5E52]">
            {prompt?.reason ||
              'Mochi nhận thấy vài ngày gần đây năng lượng và giấc ngủ của bạn hơi thay đổi. Bạn có muốn làm nhanh 4 câu rà soát ngắn (khoảng 30 giây) để mình hỗ trợ sát hơn không?'}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="h-10 px-4 rounded-full bg-[#1F5C43] hover:brightness-105 text-white text-[13px] font-bold flex items-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[17px]">play_circle</span>
              <span>Làm nhanh ngay ({totalQuestions || 4} câu)</span>
            </button>
            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                className="h-10 px-3.5 rounded-full border border-[#E7E8DE] bg-white text-[12.5px] font-semibold text-[#756455] hover:bg-[#FAF7EE] transition-colors cursor-pointer"
              >
                Để lúc khác
              </button>
            )}
          </div>
        </div>
      )}

      {/* State B: Interactive 0..3 Scale Questions */}
      {isExpanded && !submitResult && (
        <div className="space-y-3.5 pt-1">
          {isLoadingScale || !scaleData ? (
            <div className="py-6 text-center text-[13px] text-[#756455]">
              Đang tải bộ câu hỏi rà soát...
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-[12px] text-[#756455] bg-[#FAF7EE] rounded-xl px-3 py-2 border border-[#E7E8DE]">
                <span>{scaleData.subtitle}</span>
                <span className="font-bold text-[#1F5C43] shrink-0 ml-2 tabular-nums">
                  {answeredCount}/{totalQuestions} câu
                </span>
              </div>

              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {scaleData.questions.map((q, index) => {
                  const selectedVal = answers[q.id];
                  return (
                    <div
                      key={q.id}
                      className="rounded-2xl bg-[#FAF7EE]/85 border border-[#E7E8DE] p-3 space-y-2.5"
                    >
                      <p className="text-[13px] font-semibold text-[#285C3D] leading-snug">
                        <span className="text-[#E78A45] font-bold mr-1.5">{index + 1}.</span>
                        {q.text}
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        {scaleData.options.map((opt) => {
                          const isSelected = selectedVal === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => handleSelectOption(q.id, opt.value)}
                              className={`rounded-xl px-2.5 py-2 text-left text-[11.5px] border transition-all active:scale-[0.98] cursor-pointer flex items-center gap-1.5 ${
                                isSelected
                                  ? 'bg-[#1F5C43] border-[#1F5C43] text-white font-bold shadow-2xs'
                                  : 'bg-white border-[#E7E8DE] text-[#4F5E53] hover:border-[#1F5C43]/50 hover:bg-[#E7F1DF]/40 font-medium'
                              }`}
                            >
                              <span
                                className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center shrink-0 font-bold ${
                                  isSelected
                                    ? 'bg-white text-[#1F5C43]'
                                    : 'bg-[#E7F1DF] text-[#1F5C43]'
                                }`}
                              >
                                {opt.value}
                              </span>
                              <span className="leading-tight">{opt.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="text-[11px] text-[#756455] italic">
                  * Công cụ tự rà soát hỗ trợ, không thay thế chẩn đoán y khoa.
                </span>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!allAnswered || isSubmitting}
                  className="h-10 px-5 rounded-full bg-[#1F5C43] text-white text-[13px] font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 disabled:bg-[#C8D3C9] disabled:cursor-not-allowed shrink-0 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px]">check_circle</span>
                  <span>{isSubmitting ? 'Đang tổng hợp...' : 'Xem phản hồi'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* State C: Empathetic Feedback & Optional Phase 2 Follow-up */}
      {submitResult && (
        <div className="space-y-3 pt-1 animate-fade-in">
          <div className="rounded-2xl bg-[#E7F1DF]/70 border border-[#C5DEC0] p-3.5 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[12px] font-bold text-[#1F5C43] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[17px]">favorite</span>
                Mức ghi nhận: {submitResult.severityLabel}
              </span>
              <span className="text-[11.5px] font-bold px-2.5 py-0.5 rounded-full bg-white text-[#1F5C43] border border-[#CFE2CA] tabular-nums">
                Tổng điểm: {submitResult.totalScore}
              </span>
            </div>
            <p className="text-[13px] leading-relaxed text-[#285C3D]">
              {submitResult.empatheticFeedback}
            </p>
          </div>

          {/* Phase 2 Adaptive Follow-Up Invitation (PHQ-9 or GAD-7) */}
          {submitResult.recommendFollowUpScale && (
            <div className="rounded-2xl bg-[#FFF8EF] border border-[#EAD4BA] p-3.5 space-y-2.5">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[19px] text-[#E78A45] mt-0.5">
                  auto_awesome
                </span>
                <div>
                  <p className="text-[13px] font-bold text-[#1F5C43]">
                    Mời mở rộng rà soát Pha 2 ({submitResult.recommendFollowUpScale})
                  </p>
                  <p className="text-[12px] text-[#756455] leading-relaxed mt-0.5">
                    Làm tiếp vài câu chuyên sâu ngay trên thẻ này giúp Mochi cá nhân hóa kế hoạch nghỉ ngơi và điểm tựa an toàn chuẩn xác hơn cho bạn.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleStartFollowUp(submitResult.recommendFollowUpScale as ScreeningScaleType)
                  }
                  className="h-9 px-4 rounded-full bg-[#1F5C43] text-white text-[12.5px] font-bold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                >
                  <span>
                    Mở tiếp thang{' '}
                    {submitResult.recommendFollowUpScale === 'PHQ9'
                      ? 'PHQ-9 (9 câu)'
                      : 'GAD-7 (7 câu)'}
                  </span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
                {onOpenBreathing && (
                  <button
                    type="button"
                    onClick={onOpenBreathing}
                    className="h-9 px-3.5 rounded-full border border-[#D8C6B0] bg-white text-[#756455] hover:text-[#1F5C43] text-[12px] font-semibold cursor-pointer"
                  >
                    Thở chậm 4-7-8 trước
                  </button>
                )}
              </div>
            </div>
          )}

          {!submitResult.recommendFollowUpScale && (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
              {onOpenBreathing && (
                <button
                  type="button"
                  onClick={onOpenBreathing}
                  className="h-9 px-3.5 rounded-full bg-[#E7F1DF] text-[#1F5C43] text-[12px] font-bold flex items-center gap-1.5 hover:brightness-97 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">air</span>
                  <span>Thực hành thở 4-7-8</span>
                </button>
              )}
              {onDismiss && (
                <button
                  type="button"
                  onClick={onDismiss}
                  className="h-9 px-4 rounded-full border border-[#E7E8DE] bg-white text-[#756455] text-[12px] font-semibold hover:text-[#1F5C43] cursor-pointer"
                >
                  Hoàn tất &amp; Thu gọn
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
