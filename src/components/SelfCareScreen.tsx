import React, { useState } from 'react';
import { DailyHabit } from '../types';

interface SelfCareScreenProps {
  habits: DailyHabit[];
  onToggleHabit: (id: string) => void;
  onAddHabit: (title: string) => void;
  onStartBreathing: () => void;
  onBack: () => void;
}

export const SelfCareScreen: React.FC<SelfCareScreenProps> = ({
  habits,
  onToggleHabit,
  onAddHabit,
  onStartBreathing,
  onBack,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [newHabitText, setNewHabitText] = useState('');
  const [showAddHabitInput, setShowAddHabitInput] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState<{
    title: string;
    duration: string;
    category: string;
    steps: string[];
  } | null>(null);

  const categories = ['Tất cả', 'Thở & Thư giãn', 'Tâm trí', 'Giấc ngủ'];

  const completedCount = habits.filter((h) => h.completed).length;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitText.trim()) return;
    onAddHabit(newHabitText.trim());
    setNewHabitText('');
    setShowAddHabitInput(false);
  };

  return (
    <div className="flex-1 flex flex-col bg-page-background text-text-primary px-4 md:px-8 pt-1 pb-24 md:pb-12 space-y-4">
      {/* Top App Bar compliant with Image 10 */}
      <header className="sticky top-0 z-30 bg-page-background/95 backdrop-blur-md pt-2 pb-2 md:pt-4 md:max-w-5xl md:mx-auto md:w-full">
        <div className="flex items-center justify-between h-12">
          <button
            onClick={onBack}
            aria-label="Quay lại"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-text-primary hover:bg-surface-mint active:scale-95 transition-all"
            type="button"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <span className="text-[18px] font-bold tracking-tight text-primary">MINDCARE</span>
          <button
            onClick={() => setBookmarked(!bookmarked)}
            aria-label="Lưu trữ & Yêu thích"
            className={`w-10 h-10 rounded-xl flex items-center justify-center active:scale-95 transition-all ${
              bookmarked ? 'text-primary bg-surface-mint' : 'text-text-secondary hover:bg-surface-mint'
            }`}
            type="button"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: bookmarked ? "'FILL' 1" : "'FILL' 0" }}
            >
              bookmark
            </span>
          </button>
        </div>

        {/* Title & Subtitle Header */}
        <div className="pt-1 pb-1">
          <h1 className="text-[24px] md:text-[28px] font-bold text-text-primary tracking-tight">Chăm sóc bản thân</h1>
          <p className="text-[14px] text-text-secondary mt-0.5">
            Các bài tập thực hành vi mô giúp xoa dịu tâm trí
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col gap-4 lg:grid lg:grid-cols-12 lg:gap-6 lg:items-start md:max-w-5xl md:mx-auto md:w-full">
        <div className="flex flex-col gap-4 lg:col-span-7">
        {/* Disclaimer Banner */}
        <section className="bg-surface-container-low rounded-2xl p-3.5 border border-border-subtle flex items-start gap-2.5 relative overflow-hidden">
          <div className="w-7 h-7 rounded-full bg-surface-mint flex items-center justify-center text-primary shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              spa
            </span>
          </div>
          <div className="flex-1 pr-1">
            <p className="text-[11px] text-text-secondary leading-relaxed">
              Nội dung hướng dẫn tự chăm sóc và điều hòa cảm xúc, không thay thế trị liệu tâm lý chuyên sâu.
            </p>
          </div>
        </section>

        {/* Category Filter Tabs */}
        <section className="-mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto no-scrollbar">
          <div aria-label="Chuyên mục thực hành" className="flex items-center gap-2 py-1" role="tablist">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  aria-selected={isSelected}
                  className={`text-[13px] px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-primary text-white font-semibold shadow-xs'
                      : 'bg-surface-card border border-border-subtle text-text-secondary hover:bg-surface-mint hover:text-primary font-medium'
                  }`}
                  role="tab"
                  type="button"
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </section>

        {/* Featured Exercise Card (Bento Focus) */}
        {(selectedCategory === 'Tất cả' || selectedCategory === 'Thở & Thư giãn') && (
          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                Bài tập nổi bật
              </span>
              <span className="inline-flex items-center gap-1 text-[12px] text-primary font-semibold">
                <span className="material-symbols-outlined text-[16px]">bolt</span> Vi mô 2 phút
              </span>
            </div>

            <article className="bg-surface-card rounded-2xl p-4 border border-border-subtle card-shadow relative overflow-hidden flex flex-col gap-3">
              <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-surface-mint/60 pointer-events-none blur-xl"></div>
              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-surface-mint text-primary">
                    <span className="material-symbols-outlined text-[14px]">air</span> Thở điều hòa
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] text-text-secondary bg-page-background">
                    <span className="material-symbols-outlined text-[14px]">schedule</span> 2 phút
                  </span>
                </div>

                <div className="w-10 h-10 rounded-2xl bg-surface-mint/80 flex items-center justify-center text-primary shadow-xs">
                  <span
                    className="material-symbols-outlined text-[22px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    energy_savings_leaf
                  </span>
                </div>
              </div>

              <div className="relative z-10">
                <h2 className="text-[18px] font-bold text-text-primary">Hít thở 4-7-8</h2>
                <p className="text-[14px] text-text-secondary mt-1">Điều hòa nhịp tim, giảm căng thẳng tức thì</p>
              </div>

              <div className="flex items-center justify-between pt-1 relative z-10">
                <div className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
                  <span className="text-[11px] text-text-secondary ml-2">Phổ biến cho giờ giải lao</span>
                </div>
                <button
                  onClick={onStartBreathing}
                  className="bg-primary text-white text-[13px] font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs hover:bg-primary-container active:scale-95 transition-all"
                  type="button"
                >
                  <span>Bắt đầu ngay</span>
                  <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                </button>
              </div>
            </article>
          </section>
        )}

        {/* Other Exercises Section */}
        <section className="flex flex-col gap-2">
          <h2 className="text-[16px] font-semibold text-text-primary">Các bài thực hành khác</h2>
          <div className="flex flex-col gap-2.5">
            {/* Card 2: Thư giãn cơ bắp */}
            {(selectedCategory === 'Tất cả' || selectedCategory === 'Thở & Thư giãn') && (
              <article
                onClick={() =>
                  setSelectedGuide({
                    title: 'Thư giãn cơ bắp tiến triển',
                    duration: '5 phút',
                    category: 'Cơ thể',
                    steps: [
                      'Ngồi tựa lưng thoải mái, thả lỏng hai bàn chân trên mặt sàn.',
                      'Hít vào sâu và nhún nhẹ hai vai lên gần tai trong 5 giây.',
                      'Thở ra chậm rãi và buông thõng vai hoàn toàn trong 10 giây.',
                      'Lặp lại nhẹ nhàng với bàn tay, cơ mặt và vùng lưng trên.',
                    ],
                  })
                }
                className="bg-surface-card rounded-2xl p-3.5 border border-border-subtle card-shadow flex items-start gap-3 hover:border-secondary transition-all cursor-pointer active:scale-[0.99]"
              >
                <div className="w-12 h-12 rounded-2xl bg-secondary-container/40 flex items-center justify-center text-secondary shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[24px]">accessibility_new</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] text-secondary font-semibold bg-surface-mint px-2 py-0.5 rounded-md">
                      Cơ thể
                    </span>
                    <span className="text-[11px] text-text-secondary flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[12px]">schedule</span> 5 phút
                    </span>
                  </div>
                  <h3 className="text-[15px] font-semibold text-text-primary truncate">Thư giãn cơ bắp tiến triển</h3>
                  <p className="text-[12px] text-text-secondary mt-0.5 line-clamp-2">
                    Giải phóng căng cứng ở vai, cổ và lưng sau giờ học.
                  </p>
                </div>
                <button
                  aria-label="Mở bài tập"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:text-primary hover:bg-surface-mint transition-colors self-center"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                </button>
              </article>
            )}

            {/* Card 3: Viết 3 điều tích cực */}
            {(selectedCategory === 'Tất cả' || selectedCategory === 'Tâm trí') && (
              <article
                onClick={() =>
                  setSelectedGuide({
                    title: 'Thực hành 3 điều tích cực',
                    duration: '3 phút',
                    category: 'Tâm trí',
                    steps: [
                      'Nghĩ về 1 khoảnh khắc dễ chịu dù nhỏ bé trong hôm nay (tách trà, cơn gió mát...).',
                      'Ghi nhận 1 điều bạn đã cố gắng hoàn thành cho bản thân.',
                      'Nhớ lại 1 lời nói hoặc cử chỉ ấm áp bạn nhận được hoặc trao đi.',
                    ],
                  })
                }
                className="bg-surface-card rounded-2xl p-3.5 border border-border-subtle card-shadow flex items-start gap-3 hover:border-secondary transition-all cursor-pointer active:scale-[0.99]"
              >
                <div className="w-12 h-12 rounded-2xl bg-tertiary-fixed/40 flex items-center justify-center text-tertiary shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[24px]">edit_note</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] text-tertiary font-semibold bg-tertiary-fixed/30 px-2 py-0.5 rounded-md">
                      Tâm trí
                    </span>
                    <span className="text-[11px] text-text-secondary flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[12px]">schedule</span> 3 phút
                    </span>
                  </div>
                  <h3 className="text-[15px] font-semibold text-text-primary truncate">Viết 3 điều tích cực</h3>
                  <p className="text-[12px] text-text-secondary mt-0.5 line-clamp-2">
                    Tái định hình góc nhìn và nuôi dưỡng lòng biết ơn.
                  </p>
                </div>
                <button
                  aria-label="Mở bài tập"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:text-primary hover:bg-surface-mint transition-colors self-center"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                </button>
              </article>
            )}

            {/* Card 4: Nghỉ ngơi ngắn & Thả lỏng mắt */}
            {(selectedCategory === 'Tất cả' || selectedCategory === 'Giấc ngủ' || selectedCategory === 'Thở & Thư giãn') && (
              <article
                onClick={() =>
                  setSelectedGuide({
                    title: 'Nghỉ ngơi ngắn & Thả lỏng mắt (20-20-20)',
                    duration: '2 phút',
                    category: 'Giác quan',
                    steps: [
                      'Rời mắt khỏi màn hình máy tính hoặc điện thoại sau mỗi 20 phút.',
                      'Hướng tầm nhìn ra một điểm xa khoảng 6 mét (ví dụ: tán cây hoặc bầu trời ngoài cửa sổ).',
                      'Chớp mắt nhẹ và giữ ánh nhìn thư giãn trong 20 giây trước khi quay lại làm việc.',
                    ],
                  })
                }
                className="bg-surface-card rounded-2xl p-3.5 border border-border-subtle card-shadow flex items-start gap-3 hover:border-secondary transition-all cursor-pointer active:scale-[0.99]"
              >
                <div className="w-12 h-12 rounded-2xl bg-surface-mint flex items-center justify-center text-primary shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[24px]">visibility</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] text-primary font-semibold bg-surface-mint px-2 py-0.5 rounded-md">
                      Giác quan
                    </span>
                    <span className="text-[11px] text-text-secondary flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[12px]">schedule</span> 2 phút
                    </span>
                  </div>
                  <h3 className="text-[15px] font-semibold text-text-primary truncate">Nghỉ ngơi ngắn &amp; Thả lỏng mắt</h3>
                  <p className="text-[12px] text-text-secondary mt-0.5 line-clamp-2">
                    Kỹ thuật 20-20-20 cho sinh viên học tập bên màn hình máy tính.
                  </p>
                </div>
                <button
                  aria-label="Mở bài tập"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:text-primary hover:bg-surface-mint transition-colors self-center"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                </button>
              </article>
            )}
          </div>
        </section>
        </div>

        <div className="flex flex-col gap-4 lg:col-span-5 lg:sticky lg:top-28">
        {/* Personal Self-Care Checklist */}
        <section className="bg-surface-card rounded-2xl p-4 border border-border-subtle card-shadow flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-border-subtle pb-2.5">
            <div>
              <h2 className="text-[16px] font-semibold text-text-primary">Kế hoạch cá nhân hôm nay</h2>
              <p className="text-[11px] text-text-secondary">Nhẹ nhàng hoàn thành theo tốc độ của bạn</p>
            </div>
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-surface-mint text-primary tabular-nums whitespace-nowrap">
              {completedCount} / {habits.length} hoàn thành
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {habits.map((habit) => (
              <label
                key={habit.id}
                onClick={() => onToggleHabit(habit.id)}
                className={`flex items-center gap-3 p-2.5 rounded-xl border transition-colors cursor-pointer select-none ${
                  habit.completed
                    ? 'bg-page-background/80 border-border-subtle'
                    : 'bg-surface-card border-border-subtle hover:bg-surface-mint/40'
                }`}
              >
                <input
                  type="checkbox"
                  checked={habit.completed}
                  readOnly
                  className="sr-only"
                />
                <span
                  className={`flex-1 text-[14px] ${
                    habit.completed ? 'line-through text-text-secondary' : 'text-text-primary font-medium'
                  }`}
                >
                  {habit.title}
                </span>
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    habit.completed ? 'text-primary' : 'text-text-secondary/60'
                  }`}
                  style={{ fontVariationSettings: habit.completed ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {habit.completed ? 'check_circle' : 'radio_button_unchecked'}
                </span>
              </label>
            ))}
          </div>

          {/* Add Habit Prompt or Form */}
          {showAddHabitInput ? (
            <form onSubmit={handleAddSubmit} className="flex items-center gap-2 pt-1">
              <input
                value={newHabitText}
                onChange={(e) => setNewHabitText(e.target.value)}
                placeholder="Nhập thói quen mới (ví dụ: Uống trà hoa cúc)..."
                className="flex-1 px-3 py-2 text-[13px] rounded-xl border border-border-subtle bg-page-background focus:outline-none focus:ring-1 focus:ring-primary"
                autoFocus
              />
              <button
                type="submit"
                className="px-3 py-2 bg-primary text-white text-[12px] font-semibold rounded-xl active:scale-95"
              >
                Thêm
              </button>
              <button
                type="button"
                onClick={() => setShowAddHabitInput(false)}
                className="px-2 py-2 text-text-secondary text-[12px]"
              >
                Hủy
              </button>
            </form>
          ) : (
            <button
              onClick={() => setShowAddHabitInput(true)}
              className="w-full py-2.5 rounded-xl border border-dashed border-border-subtle text-primary hover:bg-surface-mint/50 active:scale-95 transition-all flex items-center justify-center gap-1.5 text-[12px] font-semibold"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Thêm thói quen nhỏ của bạn</span>
            </button>
          )}
        </section>

        {/* Supportive Philosophy Note */}
        <section className="text-center px-4 py-1 mb-2">
          <p className="text-[11px] text-text-secondary leading-relaxed">
            Thực hành chánh niệm vi mô không tạo áp lực hoàn hảo. Bạn chỉ cần dành trọn 2 phút cho chính mình.
          </p>
        </section>
        </div>
      </main>

      {/* Inline Exercise Guide Modal */}
      {selectedGuide && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedGuide(null)}
        >
          <div
            className="bg-surface-card rounded-2xl max-w-[440px] w-full p-5 border border-border-subtle shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-surface-mint text-primary">
                    {selectedGuide.category}
                  </span>
                  <span className="text-[11px] text-text-secondary">{selectedGuide.duration}</span>
                </div>
                <h3 className="text-[17px] font-bold text-text-primary">{selectedGuide.title}</h3>
              </div>
              <button
                onClick={() => setSelectedGuide(null)}
                aria-label="Đóng hướng dẫn"
                className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:bg-surface-mint"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <ol className="space-y-2.5">
              {selectedGuide.steps.map((step, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 bg-page-background p-3 rounded-xl border border-border-subtle"
                >
                  <span className="w-5 h-5 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                    {idx + 1}
                  </span>
                  <span className="text-[13px] text-text-primary leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>

            <button
              onClick={() => setSelectedGuide(null)}
              className="w-full py-2.5 rounded-xl bg-primary text-white text-[13px] font-semibold hover:bg-primary-container active:scale-95 transition-all"
              type="button"
            >
              Đã hiểu, cảm ơn
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
