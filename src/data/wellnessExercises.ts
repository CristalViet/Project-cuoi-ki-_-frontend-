export type WellnessExerciseId = 'gratitude' | 'breathing' | 'emotion' | 'selfcare';

export interface WellnessExercise {
  id: WellnessExerciseId;
  title: string;
  description: string;
  duration: string;
  action: string;
  icon: string;
  accent: 'peach' | 'sage' | 'yellow' | 'mint';
}

export const WELLNESS_EXERCISES: WellnessExercise[] = [
  {
    id: 'gratitude',
    title: '3 điều mình biết ơn',
    description: 'Ghi lại những điều nhỏ khiến bạn thấy ấm áp.',
    duration: '3 phút',
    action: 'Bắt đầu',
    icon: 'edit_note',
    accent: 'peach',
  },
  {
    id: 'breathing',
    title: 'Thở chậm cùng Mochi',
    description: 'Dành một phút để thư giãn.',
    duration: '1 phút',
    action: 'Bắt đầu',
    icon: 'air',
    accent: 'sage',
  },
  {
    id: 'emotion',
    title: 'Gọi tên cảm xúc',
    description: 'Lắng nghe điều bạn đang cảm nhận.',
    duration: '2 phút',
    action: 'Khám phá',
    icon: 'sentiment_calm',
    accent: 'yellow',
  },
  {
    id: 'selfcare',
    title: 'Một việc nhỏ cho bản thân',
    description: 'Chọn một hành động dịu dàng với chính mình.',
    duration: '2 phút',
    action: 'Khám phá',
    icon: 'spa',
    accent: 'mint',
  },
];
