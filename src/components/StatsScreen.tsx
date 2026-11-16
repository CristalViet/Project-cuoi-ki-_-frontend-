import React, { useState } from 'react';
import { CheckIn } from '../types';

interface StatsScreenProps {
  checkIns: CheckIn[];
  onOpenSettings: () => void;
  onOpenSelfCare: () => void;
}

const DAYS_DATA = [
  { day: 'T2', mood: 5, stress: 6, sleep: 6.5, date: '12/10' },
  { day: 'T3', mood: 6, stress: 5, sleep: 7.2, date: '13/10' },
  { day: 'T4', mood: 5, stress: 6, sleep: 6.0, date: '14/10' },
  { day: 'T5', mood: 6, stress: 5, sleep: 7.5, date: '15/10' },
  { day: 'T6', mood: 7, stress: 4, sleep: 8.2, date: '16/10' },
  { day: 'T7', mood: 6, stress: 5, sleep: 7.8, date: '17/10' },
  { day: 'CN', mood: 6, stress: 4, sleep: 6.5, date: '18/10' },
];

export const StatsScreen: React.FC<StatsScreenProps> = ({
  checkIns,
  onOpenSettings,
  onOpenSelfCare,
}) => {
  // Mobile screen mode: 'overview' (first screen) or 'detail' (new screen on click)
  const [viewMode, setViewMode] = useState<'overview' | 'detail'>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState<'7days' | '30days' | 'month'>('7days');
  const [activeDayIndex, setActiveDayIndex] = useState<number>(4); // Default to T6 (Friday)
  const [showWhyAiSummary, setShowWhyAiSummary] = useState<boolean>(false);

  // States to toggle AI comment under each chart
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({
    'mood-stress': false,
    sleep: false,
    emotions: false,
  });

  const toggleComment = (key: string) => {
    setExpandedComments((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleOpenDetail = () => {
    setViewMode('detail');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleBackToOverview = () => {
    setViewMode('overview');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const hasData = checkIns.length > 0;

  const renderOverviewSummary = () => (
    <>
      {/* SECTION 1: AI Comment Section with dashed border */}
      <section className="space-y-1.5 pt-1">
        <p className="text-[13px] text-[var(--color-text-secondary)] font-medium px-0.5">
          {hasData ? 'Dựa trên 5/7 ngày có dữ liệu' : 'Chưa có đủ dữ liệu check-in trong tuần'}
        </p>
        <div className="border-[2.5px] border-dashed border-[var(--color-primary)]/55 bg-[var(--color-sage-light)]/75 rounded-2xl p-4 md:p-5 space-y-2 transition-all">
          <p className="text-[14px] md:text-[15px] leading-relaxed text-[var(--color-primary-text)]">
            {hasData
              ? 'Stress tuần này thấp hơn tuần trước một chút. Dữ liệu còn thưa nên chưa đủ để nói về xu hướng dài hạn.'
              : 'Hãy thực hiện check-in hằng ngày để MindCare tổng hợp xu hướng cảm xúc, mức stress và giấc ngủ của bạn.'}
          </p>
          <button
            type="button"
            onClick={() => setShowWhyAiSummary((prev) => !prev)}
            className="text-[13px] font-bold text-[var(--color-primary)] hover:underline block text-left"
          >
            Vì sao có nhận xét này?
          </button>
          {showWhyAiSummary && (
            <p className="text-[12px] text-[var(--color-text-secondary)] leading-relaxed pt-2 border-t border-[var(--color-border)]">
              Nguồn: check-in 4–10/11. Mood, stress, giờ ngủ tự báo cáo. Ngày bỏ trống không được tính là 0. Đây không phải chẩn đoán.
            </p>
          )}
        </div>
      </section>

      {/* SECTION 2: 3 Average Metric Cards */}
      <section className="grid grid-cols-3 gap-2.5 md:gap-4 pt-1">
        {/* Card 1: Tâm trạng TB */}
        <div className="bg-[var(--color-sage-light)]/85 border border-[var(--color-border)] rounded-2xl p-3 md:p-5 flex flex-col items-center text-center justify-between min-h-[114px] shadow-2xs">
          <div className="flex items-center justify-center pt-0.5">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
          </div>
          <span className="text-[12px] md:text-[13px] font-medium text-[var(--color-primary-text)] mt-1.5">
            Tâm trạng TB
          </span>
          <div className="text-[20px] md:text-[26px] font-bold text-[var(--color-primary)] tracking-tight mt-1 tabular-nums">
            6,1<span className="text-[12px] md:text-[13px] font-medium text-[var(--color-text-secondary)]">/10</span>
          </div>
        </div>

        {/* Card 2: Stress TB */}
        <div className="bg-[var(--color-peach-light)]/90 border border-[var(--color-border)] rounded-2xl p-3 md:p-5 flex flex-col items-center text-center justify-between min-h-[114px] shadow-2xs">
          <div className="flex items-center justify-center pt-0.5">
            <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <span className="text-[12px] md:text-[13px] font-medium text-[var(--color-secondary-text)] mt-1.5">
            Stress TB
          </span>
          <div className="text-[20px] md:text-[26px] font-bold text-[var(--color-primary)] tracking-tight mt-1 tabular-nums">
            4,8<span className="text-[12px] md:text-[13px] font-medium text-[var(--color-text-secondary)]">/10</span>
          </div>
        </div>

        {/* Card 3: Giấc ngủ TB */}
        <div className="bg-[var(--color-primary-light)]/75 border border-[var(--color-border)] rounded-2xl p-3 md:p-5 flex flex-col items-center text-center justify-between min-h-[114px] shadow-2xs">
          <div className="flex items-center justify-center pt-0.5">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary-text)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </div>
          <span className="text-[12px] md:text-[13px] font-medium text-[var(--color-primary-text)] mt-1.5">
            Giấc ngủ TB
          </span>
          <div className="text-[20px] md:text-[26px] font-bold text-[var(--color-primary)] tracking-tight mt-1 whitespace-nowrap tabular-nums">
            7,1 <span className="text-[11px] md:text-[12.5px] font-normal text-[var(--color-text-secondary)]">giờ/đêm</span>
          </div>
        </div>
      </section>
    </>
  );

  const renderDetailCharts = () => (
    <div className="space-y-4 md:space-y-6">
      {/* Period Control & Provenance */}
      <section className="space-y-3 md:flex md:items-center md:justify-between md:gap-4 md:space-y-0">
        <div className="md:hidden">
          <h2 className="text-[22px] font-bold text-text-primary tracking-tight">Phân tích &amp; Biểu đồ</h2>
          <p className="text-[12px] text-text-secondary mt-0.5">
            Dữ liệu ghi nhận cảm xúc, chỉ số stress và chất lượng giấc ngủ
          </p>
        </div>

        {/* Segmented Control (7 ngày qua | 30 ngày | Theo tháng) */}
        <div className="bg-surface-container-high/60 p-1 rounded-xl flex items-center border border-border-subtle md:w-[360px]">
          <button
            onClick={() => setSelectedPeriod('7days')}
            className={`flex-1 py-1.5 px-3 text-center text-[12px] font-semibold rounded-lg transition-all whitespace-nowrap ${
              selectedPeriod === '7days'
                ? 'bg-surface-card text-primary card-shadow'
                : 'text-text-secondary hover:text-text-primary'
            }`}
            type="button"
          >
            7 ngày qua
          </button>
          <button
            onClick={() => setSelectedPeriod('30days')}
            className={`flex-1 py-1.5 px-3 text-center text-[12px] font-semibold rounded-lg transition-all whitespace-nowrap ${
              selectedPeriod === '30days'
                ? 'bg-surface-card text-primary card-shadow'
                : 'text-text-secondary hover:text-text-primary'
            }`}
            type="button"
          >
            30 ngày
          </button>
          <button
            onClick={() => setSelectedPeriod('month')}
            className={`flex-1 py-1.5 px-3 text-center text-[12px] font-semibold rounded-lg transition-all whitespace-nowrap ${
              selectedPeriod === 'month'
                ? 'bg-surface-card text-primary card-shadow'
                : 'text-text-secondary hover:text-text-primary'
            }`}
            type="button"
          >
            Theo tháng
          </button>
        </div>

        {/* Provenance Badge */}
        <div className="bg-surface-mint/60 border border-border-subtle rounded-xl p-3 flex items-start md:items-center gap-2 md:px-4">
          <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5 md:mt-0">verified_user</span>
          <p className="text-[11px] md:text-[12px] text-text-secondary leading-snug">
            <span className="font-semibold text-primary">Dữ liệu do bạn tự đánh giá</span> từ 12/10 – 18/10/2026. Không
            phải kết luận y tế.
          </p>
        </div>
      </section>

      {/* Responsive 2-column chart grid on Desktop/Laptop */}
      <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0 lg:items-start">
        {/* Chart Card 1: Xu hướng Cảm xúc & Stress */}
        <section className="bg-surface-card rounded-2xl p-4 md:p-5 border border-border-subtle card-shadow space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-[16px] font-semibold text-text-primary">Xu hướng Cảm xúc &amp; Stress</h2>
              <p className="text-[11px] text-text-secondary">Thang điểm tự cảm nhận 1 - 10</p>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-3 text-[11px] shrink-0">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block"></span>
                <span className="text-text-primary font-medium">Tâm trạng</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-secondary)] inline-block"></span>
                <span className="text-text-secondary font-medium">Stress</span>
              </div>
            </div>
          </div>

          {/* Dual Line Chart SVG */}
          <div className="relative w-full pt-1">
            <svg className="w-full h-36 md:h-44 overflow-visible" fill="none" viewBox="0 0 320 120">
              {/* Gridlines */}
              <line stroke="var(--color-border)" strokeDasharray="3 3" strokeWidth="0.75" x1="0" x2="320" y1="20" y2="20" />
              <line stroke="var(--color-border)" strokeDasharray="3 3" strokeWidth="0.75" x1="0" x2="320" y1="60" y2="60" />
              <line stroke="var(--color-border)" strokeDasharray="3 3" strokeWidth="0.75" x1="0" x2="320" y1="100" y2="100" />

              {/* Area beneath Mood line */}
              <path
                d="M 15 60 L 65 48 L 115 60 L 165 48 L 215 36 L 265 48 L 305 48 L 305 105 L 15 105 Z"
                fill="var(--color-surface-mint)"
                fillOpacity="0.35"
              />

              {/* Stress Line */}
              <path
                d="M 15 48 L 65 60 L 115 48 L 165 60 L 215 72 L 265 60 L 305 72"
                stroke="var(--color-secondary)"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
              />

              {/* Mood Line */}
              <path
                d="M 15 60 L 65 48 L 115 60 L 165 48 L 215 36 L 265 48 L 305 48"
                stroke="var(--color-primary)"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
              />

              {/* Data Points */}
              <circle cx="15" cy="60" fill="var(--color-primary)" r="4" stroke="var(--color-surface)" strokeWidth="1.5" />
              <circle cx="15" cy="48" fill="var(--color-secondary)" r="4" stroke="var(--color-surface)" strokeWidth="1.5" />
              <circle cx="65" cy="48" fill="var(--color-primary)" r="4" stroke="var(--color-surface)" strokeWidth="1.5" />
              <circle cx="65" cy="60" fill="var(--color-secondary)" r="4" stroke="var(--color-surface)" strokeWidth="1.5" />
              <circle cx="115" cy="60" fill="var(--color-primary)" r="4" stroke="var(--color-surface)" strokeWidth="1.5" />
              <circle cx="115" cy="48" fill="var(--color-secondary)" r="4" stroke="var(--color-surface)" strokeWidth="1.5" />
              <circle cx="165" cy="48" fill="var(--color-primary)" r="4" stroke="var(--color-surface)" strokeWidth="1.5" />
              <circle cx="165" cy="60" fill="var(--color-secondary)" r="4" stroke="var(--color-surface)" strokeWidth="1.5" />
              <circle cx="215" cy="36" fill="var(--color-primary)" r="5" stroke="var(--color-surface-mint)" strokeWidth="2.5" />
              <circle cx="215" cy="72" fill="var(--color-secondary)" r="4" stroke="var(--color-surface)" strokeWidth="1.5" />
              <circle cx="265" cy="48" fill="var(--color-primary)" r="4" stroke="var(--color-surface)" strokeWidth="1.5" />
              <circle cx="265" cy="60" fill="var(--color-secondary)" r="4" stroke="var(--color-surface)" strokeWidth="1.5" />
              <circle cx="305" cy="48" fill="var(--color-primary)" r="4" stroke="var(--color-surface)" strokeWidth="1.5" />
              <circle cx="305" cy="72" fill="var(--color-secondary)" r="4" stroke="var(--color-surface)" strokeWidth="1.5" />
            </svg>

            {/* Daily Touch Markers */}
            <div className="grid grid-cols-7 text-center pt-2 border-t border-border-subtle/50">
              {DAYS_DATA.map((d, idx) => {
                const isSelected = activeDayIndex === idx;
                return (
                  <button
                    key={d.day}
                    onClick={() => setActiveDayIndex(idx)}
                    className={`flex flex-col items-center py-0.5 rounded-lg transition-all ${
                      isSelected ? 'bg-surface-mint/60' : 'hover:bg-page-background'
                    }`}
                    type="button"
                  >
                    <span className={`text-[11px] font-medium ${isSelected ? 'text-primary font-bold' : 'text-text-secondary'}`}>
                      {d.day}
                    </span>
                    <span className="text-[10px] font-semibold text-primary leading-tight mt-0.5 tabular-nums">
                      {d.mood}
                      <span className="text-[var(--color-secondary)]">/{d.stress}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Day Status */}
          <div className="bg-surface-container-low p-2.5 rounded-xl flex items-center justify-between text-[11px] text-text-secondary">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-primary">nature_people</span>
              Trạng thái {DAYS_DATA[activeDayIndex].day} ({DAYS_DATA[activeDayIndex].date}):
            </span>
            <span className="text-primary font-semibold tabular-nums">
              Tâm trạng {DAYS_DATA[activeDayIndex].mood} / Stress {DAYS_DATA[activeDayIndex].stress}
            </span>
          </div>

          {/* Clickable line to toggle AI Comment */}
          <button
            type="button"
            onClick={() => toggleComment('mood-stress')}
            className="w-full pt-2 flex items-center justify-between text-[12.5px] font-semibold text-[var(--color-primary)] border-t border-border-subtle/70 hover:underline transition-all"
          >
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[17px]">auto_awesome</span>
              <span>Nhận xét của AI về xu hướng cảm xúc &amp; stress</span>
            </span>
            <span className="material-symbols-outlined text-[18px]">
              {expandedComments['mood-stress'] ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
            </span>
          </button>

          {expandedComments['mood-stress'] && (
            <div className="border-[2.5px] border-dashed border-[var(--color-primary)]/55 bg-[var(--color-sage-light)]/75 rounded-2xl p-3.5 text-[12.5px] text-[var(--color-primary-text)] leading-relaxed transition-all">
              <div className="flex items-center gap-1.5 font-bold text-[var(--color-primary)] mb-1">
                <span className="material-symbols-outlined text-[16px]">psychology</span>
                <span>Góc nhìn phân tích AI</span>
              </div>
              <p>
                Stress tuần này có xu hướng giảm nhẹ về cuối tuần (từ 6/10 xuống 4/10), tương ứng với sự gia tăng của cảm giác nhẹ nhõm và điểm tâm trạng đạt đỉnh 7/10 vào Thứ 6. Bạn đang điều tiết áp lực tương đối tích cực sau các cột mốc học tập.
              </p>
            </div>
          )}
        </section>

        {/* Chart Card 2: Phân tích Giấc ngủ */}
        <section className="bg-surface-card rounded-2xl p-4 md:p-5 border border-border-subtle card-shadow space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[16px] font-semibold text-text-primary">Thời lượng &amp; Giấc ngủ</h2>
              <p className="text-[11px] text-text-secondary">Chu kỳ hồi phục ban đêm</p>
            </div>
            <div className="text-right">
              <div className="text-[18px] text-primary font-bold tabular-nums">
                7,1 <span className="text-[12px] font-normal text-text-secondary">giờ/đêm</span>
              </div>
              <span className="text-[11px] text-text-secondary">Trung bình tuần</span>
            </div>
          </div>

          {/* 7-Day Sleep Duration Bar Chart */}
          <div className="pt-2 pb-1">
            <div className="flex items-end justify-between h-28 md:h-36 gap-2 px-1">
              {DAYS_DATA.map((d) => {
                const isRestless = d.sleep < 7.0;
                const isTop = d.sleep >= 8.0;
                return (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                    <span
                      className={`text-[10px] font-medium tabular-nums ${
                        isTop ? 'text-primary font-bold' : isRestless ? 'text-tertiary' : 'text-text-secondary'
                      }`}
                    >
                      {d.sleep.toString().replace('.', ',')}h
                    </span>
                    <div
                      className={`w-full max-w-[36px] rounded-t-md transition-all ${
                        isTop
                          ? 'bg-primary'
                          : isRestless
                          ? 'bg-tertiary-fixed hover:bg-tertiary'
                          : 'bg-primary/80 hover:bg-primary'
                      }`}
                      style={{ height: `${(d.sleep / 10) * 100}%` }}
                    ></div>
                    <span
                      className={`text-[11px] mt-1 font-medium ${
                        isTop ? 'text-primary font-bold' : 'text-text-secondary'
                      }`}
                    >
                      {d.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sleep Quality Summary */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="bg-surface-mint/70 rounded-xl p-2.5 flex items-center gap-2 border border-border-subtle">
              <span className="material-symbols-outlined text-primary text-[20px]">bedtime</span>
              <div>
                <div className="text-[14px] font-semibold text-text-primary">5 đêm</div>
                <div className="text-[11px] text-text-secondary leading-none">Ngon giấc (≥7h)</div>
              </div>
            </div>
            <div className="bg-surface-container-high/60 rounded-xl p-2.5 flex items-center gap-2 border border-border-subtle">
              <span className="material-symbols-outlined text-tertiary text-[20px]">timelapse</span>
              <div>
                <div className="text-[14px] font-semibold text-text-primary">2 đêm</div>
                <div className="text-[11px] text-text-secondary leading-none">Chập chờn (&lt;7h)</div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => toggleComment('sleep')}
            className="w-full pt-2 flex items-center justify-between text-[12.5px] font-semibold text-[var(--color-primary)] border-t border-border-subtle/70 hover:underline transition-all"
          >
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[17px]">auto_awesome</span>
              <span>Nhận xét của AI về chất lượng giấc ngủ</span>
            </span>
            <span className="material-symbols-outlined text-[18px]">
              {expandedComments['sleep'] ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
            </span>
          </button>

          {expandedComments['sleep'] && (
            <div className="border-[2.5px] border-dashed border-[var(--color-primary)]/55 bg-[var(--color-sage-light)]/75 rounded-2xl p-3.5 text-[12.5px] text-[var(--color-primary-text)] leading-relaxed transition-all">
              <div className="flex items-center gap-1.5 font-bold text-[var(--color-primary)] mb-1">
                <span className="material-symbols-outlined text-[16px]">bedtime</span>
                <span>Góc nhìn phục hồi năng lượng</span>
              </div>
              <p>
                Thời lượng ngủ 7,1h/đêm nằm ở mức rất tốt cho sinh viên. Những ngày bạn ngủ trên 7,5h (như Thứ 5 và Thứ 6) ghi nhận mức stress ngày hôm sau chỉ còn 4-5/10. Giữ lịch đi ngủ đều đặn trước 23:30 sẽ củng cố sâu thêm chu kỳ hồi phục này.
              </p>
            </div>
          )}
        </section>

        {/* Chart Card 3: Cảm xúc xuất hiện nhiều nhất */}
        <section className="bg-surface-card rounded-2xl p-4 md:p-5 border border-border-subtle card-shadow space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-semibold text-text-primary">Cảm xúc xuất hiện nhiều nhất</h2>
            <span className="text-[11px] text-text-secondary bg-surface-container-high px-2 py-0.5 rounded-full font-medium">
              14 ghi nhận
            </span>
          </div>

          <div className="space-y-2.5">
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[13px]">
                <span className="flex items-center gap-1.5 font-medium text-text-primary">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                  Biết ơn &amp; Đầy năng lượng
                </span>
                <span className="text-primary font-bold text-[13px] tabular-nums">35%</span>
              </div>
              <div className="w-full bg-surface-container h-2.5 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: '35%' }}></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-[13px]">
                <span className="flex items-center gap-1.5 font-medium text-text-primary">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-secondary)]"></span>
                  Hơi lo lắng (Deadline, bài thi)
                </span>
                <span className="text-text-primary font-semibold text-[13px] tabular-nums">25%</span>
              </div>
              <div className="w-full bg-surface-container h-2.5 rounded-full overflow-hidden">
                <div className="bg-[var(--color-secondary)] h-full rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-[13px]">
                <span className="flex items-center gap-1.5 font-medium text-text-primary">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#5B8E6D]"></span>
                  Tập trung &amp; Hiệu quả
                </span>
                <span className="text-text-primary font-semibold text-[13px] tabular-nums">20%</span>
              </div>
              <div className="w-full bg-surface-container h-2.5 rounded-full overflow-hidden">
                <div className="bg-[#5B8E6D] h-full rounded-full" style={{ width: '20%' }}></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-[13px]">
                <span className="flex items-center gap-1.5 font-medium text-text-primary">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary-light)] border border-[var(--color-primary)]/30"></span>
                  Bình yên &amp; Thư thả
                </span>
                <span className="text-text-primary font-semibold text-[13px] tabular-nums">20%</span>
              </div>
              <div className="w-full bg-surface-container h-2.5 rounded-full overflow-hidden">
                <div className="bg-[var(--color-primary-light)] h-full rounded-full" style={{ width: '20%' }}></div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => toggleComment('emotions')}
            className="w-full pt-2 flex items-center justify-between text-[12.5px] font-semibold text-[var(--color-primary)] border-t border-border-subtle/70 hover:underline transition-all"
          >
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[17px]">auto_awesome</span>
              <span>Nhận xét của AI về phổ cảm xúc tuần này</span>
            </span>
            <span className="material-symbols-outlined text-[18px]">
              {expandedComments['emotions'] ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
            </span>
          </button>

          {expandedComments['emotions'] && (
            <div className="border-[2.5px] border-dashed border-[var(--color-primary)]/55 bg-[var(--color-sage-light)]/75 rounded-2xl p-3.5 text-[12.5px] text-[var(--color-primary-text)] leading-relaxed transition-all">
              <div className="flex items-center gap-1.5 font-bold text-[var(--color-primary)] mb-1">
                <span className="material-symbols-outlined text-[16px]">sentiment_satisfied</span>
                <span>Góc nhìn thấu cảm AI</span>
              </div>
              <p>
                Tỷ lệ cảm xúc tích cực và thư thái (Biết ơn, Tập trung, Bình yên) chiếm tới 75% bức tranh cảm xúc của bạn. Mặc dù áp lực thi cử và hạn nộp (25%) vẫn hiện diện, bạn đã kịp thời cân bằng lại nhờ các khoảng nghỉ ngơi ý nghĩa.
              </p>
            </div>
          )}
        </section>

        {/* Card 4: Nhận định tương quan AI */}
        <section className="bg-gradient-to-br from-surface-mint via-surface-card to-surface-container-low rounded-2xl p-4 md:p-5 border border-border-subtle card-shadow space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[20px]">auto_awesome</span>
              <span className="text-[13px] text-primary font-bold">Thấu hiểu Tương quan AI</span>
            </div>
            <span className="text-[11px] font-medium bg-surface-card text-primary px-2.5 py-0.5 rounded-full border border-border-subtle">
              Dựa trên 7 check-in tự ghi
            </span>
          </div>
          <p className="text-[14px] md:text-[15px] text-text-primary leading-relaxed">
            “Khi bạn <span className="font-semibold text-primary">ngủ trên 7 giờ</span>, mức độ stress ghi nhận vào ngày
            hôm sau thường <span className="font-semibold text-primary">thấp hơn đáng kể (3-4/10)</span> so với những ngày
            thiếu ngủ.”
          </p>
          <div className="pt-2 flex items-center justify-between text-[11px] md:text-[12px] text-text-secondary border-t border-border-subtle/80">
            <span>Gợi ý nhẹ nhàng: Duy trì giờ ngủ cố định 23:00</span>
            <button
              onClick={onOpenSelfCare}
              className="text-primary font-semibold flex items-center gap-0.5 hover:underline whitespace-nowrap"
              type="button"
            >
              Xem thêm <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col bg-page-background text-text-primary px-4 pt-1 pb-24 md:pb-12 md:px-8 md:pt-6">
      <div className="w-full md:max-w-6xl md:mx-auto space-y-4 md:space-y-6">
        {/* MOBILE HEADER: Overview vs Detail */}
        {viewMode === 'overview' ? (
          <header className="flex md:hidden justify-between items-center w-full py-2 shrink-0 z-20">
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenSettings}
                className="w-8 h-8 rounded-full bg-surface-mint flex items-center justify-center text-primary font-bold text-[13px] border border-border-subtle"
                type="button"
                aria-label="Cài đặt tài khoản"
              >
                <span className="material-symbols-outlined text-[20px]">account_circle</span>
              </button>
              <span className="text-[18px] font-semibold text-text-primary tracking-tight">MINDCARE</span>
            </div>
            <button
              aria-label="Thông báo"
              className="w-9 h-9 rounded-full flex items-center justify-center text-primary hover:bg-surface-mint active:scale-95 transition-all bg-surface-card border border-border-subtle"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
            </button>
          </header>
        ) : (
          <header className="flex md:hidden justify-between items-center w-full py-2 shrink-0 z-20">
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleBackToOverview}
                className="w-9 h-9 rounded-full bg-surface-card flex items-center justify-center text-primary font-bold text-[13px] border border-border-subtle active:scale-95 transition-all hover:bg-surface-mint"
                type="button"
                aria-label="Quay lại tổng quan"
              >
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              </button>
              <span className="text-[17px] font-bold text-text-primary tracking-tight">Chi tiết thống kê</span>
            </div>
            <button
              onClick={onOpenSettings}
              aria-label="Cài đặt"
              className="w-9 h-9 rounded-full flex items-center justify-center text-primary hover:bg-surface-mint active:scale-95 transition-all bg-surface-card border border-border-subtle"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">settings</span>
            </button>
          </header>
        )}

        {/* Title (Desktop always, Mobile on overview) */}
        <section className={`${viewMode === 'overview' ? 'block' : 'hidden md:block'} space-y-1`}>
          <div className="flex items-center justify-between">
            <h1 className="text-[24px] md:text-[28px] font-bold text-text-primary tracking-tight">
              Thống kê &amp; Thấu hiểu
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenSelfCare}
                type="button"
                className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-[12.5px] font-bold text-[var(--color-primary)] shadow-2xs transition hover:bg-[var(--color-surface-mint)]"
              >
                <span className="material-symbols-outlined text-[17px]">spa</span>
                <span>Thói quen chăm sóc</span>
              </button>
              <span className="material-symbols-outlined text-primary text-[22px] md:hidden">insights</span>
            </div>
          </div>
          <p className="text-[12.5px] md:text-[14px] text-text-secondary">
            Tổng quan cảm xúc, mức độ stress và giấc ngủ của bạn
          </p>
        </section>

        {/* Overview Summary (Always shown on desktop; on mobile shown only in overview mode) */}
        <div className={`${viewMode === 'overview' ? 'block' : 'hidden md:block'} space-y-4`}>
          {renderOverviewSummary()}
        </div>

        {/* Mobile Overview CTA & Nature Note */}
        {viewMode === 'overview' && (
          <div className="md:hidden space-y-4">
            <div className="pt-3">
              <button
                onClick={handleOpenDetail}
                className="w-full py-4 px-4 rounded-2xl bg-[var(--color-primary)] text-white font-bold text-[14px] shadow-md flex items-center justify-center gap-2 transition hover:brightness-105 active:scale-[0.99]"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">query_stats</span>
                <span>Xem chi tiết</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
            <div className="text-center pt-4 pb-2">
              <p className="text-[11.5px] text-text-secondary flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-primary">spa</span>
                Mỗi tuần là một nhịp điệu riêng. Hãy trân trọng từng khoảnh khắc của chính bạn.
              </p>
            </div>
          </div>
        )}

        {/* Detailed Charts (Always visible on md+; on mobile visible only in detail mode) */}
        <div className={viewMode === 'detail' ? 'block' : 'hidden md:block'}>
          {renderDetailCharts()}
          {viewMode === 'detail' && (
            <div className="pt-4 md:hidden">
              <button
                onClick={handleBackToOverview}
                className="w-full py-3.5 px-4 rounded-2xl border border-border-subtle bg-surface-card text-text-primary font-bold text-[13.5px] flex items-center justify-center gap-2 transition hover:bg-surface-mint/60 active:scale-[0.99]"
                type="button"
              >
                <span className="material-symbols-outlined text-[19px]">arrow_back</span>
                <span>Quay lại tổng quan</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
