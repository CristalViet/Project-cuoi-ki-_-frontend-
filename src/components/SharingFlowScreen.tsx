import React, { useEffect, useMemo, useState } from 'react';
import { TrustedContact } from '../types';
import { LetterboxArtwork } from './LetterboxArtwork';
import { DesktopMailboxBackdrop, HeaderFlowerCluster } from './DesktopMailboxStage';

export type SharingEntryRoute = 'feed' | 'recipients';

type SharingRoute =
  | SharingEntryRoute
  | 'letter-transition'
  | 'letter-read'
  | 'reply-compose'
  | 'reply-complete'
  | 'anonymous-compose'
  | 'post-complete'
  | 'private-compose'
  | 'conversation'
  | 'message-complete';

type ModerationStatus = 'pending' | 'published' | 'hidden';
type AnimationStage = 'opening' | 'closing';
type PaperMailboxView = 'check' | 'reply' | 'letter' | 'archive' | 'mine';

interface CommunityLetter {
  id: string;
  alias: string;
  content: string;
  topic: string;
  time: string;
  date: string;
  replyCount: number;
  repliesAllowed: boolean;
  opened?: boolean;
  isOwn?: boolean;
  status?: ModerationStatus;
}

interface Reply {
  id: string;
  alias: string;
  content: string;
  time: string;
}

interface PrivateMessage {
  id: string;
  sender: 'me' | 'them';
  text: string;
  time: string;
  unread?: boolean;
}

interface SharingFlowScreenProps {
  initialRoute: SharingEntryRoute;
  contacts: TrustedContact[];
  onBackHome: () => void;
}

const MOCHI_MAILBOX_GIF = encodeURI('/Mochi lục tìm thư tình pastel.gif');

const INITIAL_LETTERS: CommunityLetter[] = [
  {
    id: 'letter-1',
    alias: 'Một chiếc lá nhỏ',
    content:
      'Dạo gần đây mình cảm thấy khá áp lực với việc học.\n\nDù đã cố gắng sắp xếp thời gian và học chăm hơn, mình vẫn lo là bản thân không đủ giỏi.\n\nNhiều lúc mình so sánh bản thân với bạn bè, thấy họ tiến bộ nhanh hơn, còn mình thì cứ loay hoay mãi. Mình sợ rằng mình đang làm chưa đủ tốt, và dần mất đi sự tự tin.\n\nMình không biết có ai từng trải qua cảm giác này không. Mình rất cần một chút động viên và góc nhìn khác để nhẹ lòng hơn.',
    topic: 'Học tập',
    time: '2 giờ trước',
    date: 'Hôm nay',
    replyCount: 8,
    repliesAllowed: true,
  },
  {
    id: 'letter-2',
    alias: 'Đám mây chiều',
    content:
      'Hôm nay mình đã nói ra điều mình giữ trong lòng suốt một tuần. Có chút lo lắng, nhưng cũng thấy nhẹ nhõm hơn. Mình mong ai đó đang chần chừ có thể cho bản thân thêm một cơ hội để được lắng nghe.',
    topic: 'Cảm xúc',
    time: '5 giờ trước',
    date: 'Hôm nay',
    replyCount: 3,
    repliesAllowed: true,
    opened: true,
  },
  {
    id: 'letter-3',
    alias: 'Hạt mưa nhỏ',
    content:
      'Mình đang băn khoăn về công việc hiện tại. Dù đã cố gắng, mình vẫn không biết có nên tiếp tục hay cho phép bản thân bắt đầu lại từ đầu.',
    topic: 'Công việc',
    time: '1 ngày trước',
    date: '07/11/2026',
    replyCount: 5,
    repliesAllowed: true,
  },
  {
    id: 'letter-4',
    alias: 'Ngọn gió nhẹ',
    content:
      'Có những ngày mọi thứ diễn ra rất chậm. Hôm nay mình chỉ muốn nói rằng việc nghỉ một chút không có nghĩa là mình đang bỏ cuộc.',
    topic: 'Cuộc sống',
    time: '2 ngày trước',
    date: '06/11/2026',
    replyCount: 2,
    repliesAllowed: true,
    opened: true,
  },
  {
    id: 'my-letter-1',
    alias: 'Mầm lá nhỏ',
    content:
      'Mình đang học cách cho bản thân thêm thời gian và không vội đánh giá mỗi khi một ngày trôi qua chưa như ý.',
    topic: 'Cảm xúc',
    time: 'Hôm qua',
    date: '07/11/2026',
    replyCount: 2,
    repliesAllowed: true,
    isOwn: true,
    status: 'published',
    opened: true,
  },
  {
    id: 'my-letter-2',
    alias: 'Mầm lá nhỏ',
    content:
      'Có một điều mình muốn chia sẻ, nhưng mình vẫn đang chờ đội an toàn xem xét trước khi lá thư được đưa vào hòm thư chung.',
    topic: 'Cuộc sống',
    time: 'Vừa xong',
    date: '08/11/2026',
    replyCount: 0,
    repliesAllowed: true,
    isOwn: true,
    status: 'pending',
  },
];

const INITIAL_REPLIES: Reply[] = [
  {
    id: 'reply-1',
    alias: 'Gió nhẹ',
    content:
      'Mình cũng từng như vậy. Điều giúp mình là chia nhỏ mục tiêu và nghỉ ngơi đủ. Bạn không một mình đâu.',
    time: '1 giờ trước',
  },
  {
    id: 'reply-2',
    alias: 'Ánh nắng',
    content:
      'Cố gắng của bạn đã rất đáng quý rồi. Hãy cho mình thêm thời gian và tìm người tin cậy nếu cần nhé.',
    time: '45 phút trước',
  },
];

const Header: React.FC<{
  title?: string;
  onBack: () => void;
  action?: React.ReactNode;
}> = ({ title, onBack, action }) => (
  <header className="sticky top-0 z-40 -mx-4 grid grid-cols-[44px_1fr_44px] items-center border-b border-[var(--color-border)] bg-[var(--color-background)]/95 px-3 py-2 shadow-[0_2px_10px_rgba(31,92,67,0.04)] backdrop-blur-xl md:mx-auto md:max-w-4xl md:rounded-b-2xl md:border-x md:px-5">
    <button
      onClick={onBack}
      aria-label="Quay lại"
      className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--color-primary)] hover:bg-[var(--color-surface-mint)] active:scale-95"
      type="button"
    >
      <span className="material-symbols-outlined text-[21px]">arrow_back</span>
    </button>
    <h1 className="truncate text-center text-[16px] font-bold text-[var(--color-primary)]">{title}</h1>
    <div className="flex h-11 w-11 items-center justify-center">{action}</div>
  </header>
);

const EnvelopeCard: React.FC<{
  letter: CommunityLetter;
  selected?: boolean;
  onClick: () => void;
}> = ({ letter, selected = false, onClick }) => (
  <button
    onClick={onClick}
    className={`letter-card relative min-h-[142px] w-full overflow-hidden rounded-[20px] border p-4 text-left shadow-[0_4px_12px_rgba(103,76,52,0.08)] transition duration-200 active:scale-[0.98] motion-reduce:transition-none ${
      selected
        ? 'scale-[1.015] border-[#D89B73] ring-2 ring-[#EFC7A8]/50'
        : letter.opened
          ? 'border-[#D8E2D1] bg-[#F7F4EB]'
          : 'border-[#EDC9AD] bg-[#FFF7ED]'
    }`}
    type="button"
    aria-label={`Mở thư từ ${letter.alias}, chủ đề ${letter.topic}`}
  >
    <div className="absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-[#F4E4D2] to-transparent opacity-70" />
    <div className="absolute -bottom-12 -right-8 h-28 w-28 rotate-45 border border-[#E7C3A7] bg-[#FFF9F0]/70" />
    <div className="absolute left-0 top-0 h-2 w-full bg-[repeating-linear-gradient(135deg,#EAB59A_0_7px,#FFF8EE_7px_14px,#A8C3A3_14px_21px,#FFF8EE_21px_28px)] opacity-65" />
    <div className="relative flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/75 text-[#B8754F]">
        <span className="material-symbols-outlined text-[21px]">
          {letter.opened ? 'drafts' : 'mail'}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate text-[13.5px] font-bold text-[#3E4F42]">{letter.alias}</h3>
          <span className="shrink-0 text-[9px] text-[#82776C]">{letter.time}</span>
        </div>
        <p className="mt-1 line-clamp-2 text-[10.5px] leading-4 text-[#665F58]">
          {letter.content}
        </p>
        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#FFF9F0]/85 px-2.5 py-1 text-[9.5px] font-bold text-[#7A674F]">
          <span className="material-symbols-outlined text-[13px]">menu_book</span>
          {letter.topic}
        </span>
      </div>
    </div>
    <div className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#E5A98A] bg-[#F6C4A9] text-white shadow-sm">
      <span className="material-symbols-outlined filled text-[15px]">favorite</span>
    </div>
    {!letter.opened && (
      <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-[#E78A45] ring-2 ring-[#FFF7ED]" />
    )}
  </button>
);

const statusMeta: Record<ModerationStatus, { label: string; className: string }> = {
  pending: { label: 'Đang chờ duyệt', className: 'bg-[#FFF0D5] text-[#8A693C]' },
  published: { label: 'Đã phát hành', className: 'bg-[var(--color-highlight)] text-[var(--color-primary)]' },
  hidden: { label: 'Đã ẩn', className: 'bg-[var(--color-border)] text-[#707A73]' },
};

export const SharingFlowScreen: React.FC<SharingFlowScreenProps> = ({
  initialRoute,
  contacts,
  onBackHome,
}) => {
  const [route, setRoute] = useState<SharingRoute>(initialRoute);
  const [history, setHistory] = useState<SharingRoute[]>([]);
  const [mailboxTab, setMailboxTab] = useState<'inbox' | 'mine'>('inbox');
  const [letters, setLetters] = useState<CommunityLetter[]>(INITIAL_LETTERS);
  const [hiddenLetterIds, setHiddenLetterIds] = useState<string[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<CommunityLetter>(INITIAL_LETTERS[0]);
  const [animationStage, setAnimationStage] = useState<AnimationStage>('opening');
  const [selectedLetterId, setSelectedLetterId] = useState<string | null>(null);
  const [postText, setPostText] = useState(
    () => localStorage.getItem('mindcare_anonymous_letter_draft') || ''
  );
  const [postTopic] = useState('Cảm xúc');
  const [allowReplies] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [replies, setReplies] = useState<Reply[]>(INITIAL_REPLIES);
  const [paperMailboxView, setPaperMailboxView] = useState<PaperMailboxView>('check');
  const [handledReplyIds, setHandledReplyIds] = useState<string[]>(['reply-2']);
  const [archivedReplyIds, setArchivedReplyIds] = useState<string[]>(['reply-2']);
  const [handledPaperLetterIds, setHandledPaperLetterIds] = useState<string[]>([]);
  const [activeReplyId, setActiveReplyId] = useState<string>('reply-1');
  const [heartedReplyIds, setHeartedReplyIds] = useState<string[]>([]);
  const [archivePreviewOpen, setArchivePreviewOpen] = useState(false);
  const [archiveSwipeStart, setArchiveSwipeStart] = useState<number | null>(null);
  const [paperHandoffActive, setPaperHandoffActive] = useState(false);
  const [replyText, setReplyText] = useState(
    () => localStorage.getItem('mindcare_letter_reply_draft') || ''
  );
  const [isReplySending, setIsReplySending] = useState(false);
  const [showLetterMenu, setShowLetterMenu] = useState(false);
  const [showMailboxInfo, setShowMailboxInfo] = useState(false);
  const [showDesktopOverflow, setShowDesktopOverflow] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [selectedContact, setSelectedContact] = useState<TrustedContact | null>(null);
  const [recipientSearch, setRecipientSearch] = useState('');
  const [privateText, setPrivateText] = useState('');
  const [showSendConfirm, setShowSendConfirm] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<PrivateMessage[]>([
    {
      id: 'message-1',
      sender: 'me',
      text: 'Hôm nay mình hơi mệt và muốn chia sẻ một chút...',
      time: '14:20',
    },
    {
      id: 'message-2',
      sender: 'them',
      text: 'Cảm ơn bạn đã tin tưởng chia sẻ với mình. Mình luôn sẵn sàng lắng nghe.',
      time: '14:32',
      unread: true,
    },
  ]);
  const [conversationText, setConversationText] = useState('');
  const [showConversationMenu, setShowConversationMenu] = useState(false);
  const [receivingMessages, setReceivingMessages] = useState(true);
  const [toast, setToast] = useState('');
  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    localStorage.setItem('mindcare_anonymous_letter_draft', postText);
  }, [postText]);

  useEffect(() => {
    localStorage.setItem('mindcare_letter_reply_draft', replyText);
  }, [replyText]);

  const go = (next: SharingRoute) => {
    setHistory((current) => [...current, route]);
    setRoute(next);
    window.scrollTo({ top: 0 });
  };

  const back = () => {
    if (route === 'letter-read') {
      closeLetter();
      return;
    }
    const previous = history[history.length - 1];
    if (!previous || previous === 'letter-transition') {
      if (initialRoute === 'feed') {
        setRoute('feed');
        setHistory([]);
      } else {
        onBackHome();
      }
      return;
    }
    setHistory((current) => current.slice(0, -1));
    setRoute(previous);
    window.scrollTo({ top: 0 });
  };

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  };

  const incomingLetters = letters.filter(
    (letter) => !letter.isOwn && !hiddenLetterIds.includes(letter.id)
  );
  const myLetters = letters.filter((letter) => letter.isOwn);
  const pendingReplies = replies.filter((reply) => !handledReplyIds.includes(reply.id));
  const archivedReplies = replies.filter((reply) => archivedReplyIds.includes(reply.id));
  const pendingPaperLetters = incomingLetters.filter(
    (letter) => !handledPaperLetterIds.includes(letter.id)
  );
  const activeReply =
    replies.find((reply) => reply.id === activeReplyId) ?? pendingReplies[0] ?? replies[0];
  const originalPost = myLetters[0];
  const activePaperLetter =
    pendingPaperLetters.find((letter) => letter.id === selectedLetter.id) ??
    pendingPaperLetters[0] ??
    incomingLetters[0];
  const hasPendingReply = pendingReplies.length > 0;

  const confirmedContacts = useMemo(
    () =>
      contacts.filter(
        (contact) =>
          contact.status === 'confirmed' &&
          contact.name.toLowerCase().includes(recipientSearch.toLowerCase())
      ),
    [contacts, recipientSearch]
  );

  const finishOpen = () => {
    setLetters((current) =>
      current.map((letter) =>
        letter.id === selectedLetter.id ? { ...letter, opened: true } : letter
      )
    );
    setSelectedLetter((letter) => ({ ...letter, opened: true }));
    setSelectedLetterId(null);
    setRoute('letter-read');
    window.scrollTo({ top: 0 });
  };

  const openLetter = (letter: CommunityLetter) => {
    setSelectedLetter(letter);
    setSelectedLetterId(letter.id);
    window.setTimeout(() => {
      setAnimationStage('opening');
      setHistory(['feed']);
      setRoute('letter-transition');
      window.scrollTo({ top: 0 });
      window.setTimeout(finishOpen, reduceMotion ? 80 : 820);
    }, reduceMotion ? 0 : 120);
  };

  const closeLetter = () => {
    setAnimationStage('closing');
    setRoute('letter-transition');
    window.scrollTo({ top: 0 });
    window.setTimeout(() => {
      setHistory([]);
      setRoute('feed');
    }, reduceMotion ? 80 : 650);
  };

  const openPendingPaperMail = () => {
    if (hasPendingReply) {
      setActiveReplyId(pendingReplies[0].id);
      setPaperMailboxView('reply');
      return;
    }
    if (pendingPaperLetters.length > 0) {
      const randomIndex = Math.floor(Math.random() * pendingPaperLetters.length);
      setSelectedLetter(pendingPaperLetters[randomIndex]);
      setPaperMailboxView('letter');
      return;
    }
    showToast('Hòm thư đang yên tĩnh. Hãy quay lại sau nhé.');
  };

  const finishReplyAction = (archive: boolean) => {
    if (!activeReply) return;
    setHandledReplyIds((current) =>
      current.includes(activeReply.id) ? current : [...current, activeReply.id]
    );
    if (archive) {
      setArchivedReplyIds((current) =>
        current.includes(activeReply.id) ? current : [...current, activeReply.id]
      );
      showToast('Đã thêm phản hồi vào lưu trữ.');
    } else {
      showToast('Lá thư đã được đốt và biến mất.');
    }
    setPaperMailboxView('check');
  };

  const runPaperHandoff = (letterId: string, onComplete?: () => void) => {
    setPaperHandoffActive(true);
    window.setTimeout(() => {
      setHandledPaperLetterIds((current) =>
        current.includes(letterId) ? current : [...current, letterId]
      );
      setPaperHandoffActive(false);
      setPaperMailboxView('check');
      onComplete?.();
    }, reduceMotion ? 80 : 900);
  };

  const publishLetter = () => {
    setIsPublishing(true);
    window.setTimeout(() => {
      const letter: CommunityLetter = {
        id: `letter-${Date.now()}`,
        alias: 'Mầm lá nhỏ',
        content: postText.trim(),
        topic: postTopic,
        time: 'Vừa xong',
        date: new Intl.DateTimeFormat('vi-VN').format(new Date()),
        replyCount: 0,
        repliesAllowed: allowReplies,
        isOwn: true,
        status: 'pending',
      };
      setLetters((current) => [letter, ...current]);
      setSelectedLetter(letter);
      localStorage.removeItem('mindcare_anonymous_letter_draft');
      setPostText('');
      setIsPublishing(false);
      setHistory([]);
      setRoute('post-complete');
    }, 750);
  };

  const sendReply = () => {
    setIsReplySending(true);
    window.setTimeout(() => {
      localStorage.removeItem('mindcare_letter_reply_draft');
      setReplyText('');
      setIsReplySending(false);
      setHistory([]);
      setRoute('feed');
      runPaperHandoff(selectedLetter.id);
    }, 700);
  };

  const sendPrivateMessage = () => {
    setIsSending(true);
    window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          id: `message-${Date.now()}`,
          sender: 'me',
          text: privateText.trim(),
          time: new Intl.DateTimeFormat('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }).format(new Date()),
        },
      ]);
      setShowSendConfirm(false);
      setIsSending(false);
      setHistory([]);
      setRoute('message-complete');
    }, 750);
  };

  const renderMailboxShell = (
    children: React.ReactNode,
    blurBackdrop = false,
    contentKey?: string
  ) => (
    <div className="relative md:mx-auto md:flex md:max-w-[1160px] md:flex-col md:py-5 lg:py-6">
      {/* Desktop & Tablet Header */}
      <header className="relative z-30 hidden md:flex items-center justify-between gap-4 pb-4 lg:pb-5">
        {/* Left: Flower decoration + Title + Subtitle */}
        <div className="flex min-w-0 items-center gap-3">
          <HeaderFlowerCluster className="h-12 w-14 shrink-0 lg:h-14 lg:w-16" />
          <div className="min-w-0">
            <h1 className="truncate text-[22px] font-bold tracking-tight text-[#1F5C43] lg:text-[26px]">
              Góc sẻ chia &amp; Hòm thư
            </h1>
            <p className="mt-0.5 truncate text-[12.5px] text-[var(--color-text-secondary)] lg:text-[13.5px]">
              Lắng nghe ẩn danh, chia sẻ chân thành và nhận những lời hồi đáp ấm áp.
            </p>
          </div>
        </div>

        {/* Right: Actions + Notification + Avatar */}
        <div className="flex shrink-0 items-center gap-2 lg:gap-2.5">
          <button
            onClick={() => {
              setMailboxTab('mine');
              setPaperMailboxView((current) =>
                route === 'feed' && current === 'mine' ? 'check' : 'mine'
              );
              setHistory([]);
              setRoute('feed');
              setShowDesktopOverflow(false);
              setShowAvatarMenu(false);
            }}
            aria-pressed={route === 'feed' && paperMailboxView === 'mine'}
            className={`inline-flex h-10 items-center gap-1.5 rounded-full border px-3.5 text-[12.5px] font-semibold whitespace-nowrap shadow-[0_2px_8px_rgba(31,92,67,0.05)] transition-all active:scale-95 ${
              route === 'feed' && paperMailboxView === 'mine'
                ? 'border-[#1F5C43] bg-[#E7F1DF] text-[#1F5C43]'
                : 'border-[var(--color-border)] bg-white text-[var(--color-text-primary)] hover:border-[#1F5C43]/40 hover:bg-[#E7F1DF]'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] text-[#1F5C43]">mail</span>
            <span>Thư của tôi</span>
          </button>

          <button
            onClick={() => {
              setPaperMailboxView((current) =>
                route === 'feed' && current === 'archive' ? 'check' : 'archive'
              );
              setHistory([]);
              setRoute('feed');
              setShowDesktopOverflow(false);
              setShowAvatarMenu(false);
            }}
            aria-pressed={route === 'feed' && paperMailboxView === 'archive'}
            className={`relative inline-flex h-10 items-center gap-1.5 rounded-full border px-3.5 text-[12.5px] font-semibold whitespace-nowrap shadow-[0_2px_8px_rgba(31,92,67,0.05)] transition-all active:scale-95 ${
              route === 'feed' && paperMailboxView === 'archive'
                ? 'border-[#1F5C43] bg-[#E7F1DF] text-[#1F5C43]'
                : 'border-[var(--color-border)] bg-white text-[var(--color-text-primary)] hover:border-[#1F5C43]/40 hover:bg-[#E7F1DF]'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] text-[#1F5C43]">inventory_2</span>
            <span>Hộp lưu trữ</span>
            {archivedReplies.length > 0 && (
              <span className="ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-secondary)] px-1 text-[9.5px] font-bold text-white tabular-nums">
                {archivedReplies.length}
              </span>
            )}
          </button>

          <div className="hidden min-[1200px]:block h-5 w-px bg-[var(--color-border)] mx-0.5" aria-hidden="true" />

          <button
            onClick={() => {
              setShowMailboxInfo(true);
              setShowDesktopOverflow(false);
              setShowAvatarMenu(false);
            }}
            className="hidden min-[1200px]:inline-flex h-10 items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-white px-3.5 text-[12.5px] font-semibold text-[var(--color-text-primary)] whitespace-nowrap shadow-[0_2px_8px_rgba(31,92,67,0.05)] transition-all hover:border-[#1F5C43]/40 hover:bg-[#E7F1DF] active:scale-95"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] text-[#1F5C43]">help</span>
            <span>Cách hoạt động</span>
          </button>

          {/* Tablet Overflow Menu (<1200px) */}
          <div className="relative min-[1200px]:hidden">
            <button
              onClick={() => {
                setShowDesktopOverflow((prev) => !prev);
                setShowAvatarMenu(false);
              }}
              aria-label="Thêm tùy chọn"
              aria-expanded={showDesktopOverflow}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] shadow-[0_2px_8px_rgba(31,92,67,0.05)] transition hover:bg-[#E7F1DF] hover:text-[#1F5C43]"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">more_horiz</span>
            </button>
            {showDesktopOverflow && (
              <div className="absolute right-0 top-12 z-50 w-52 rounded-2xl border border-[var(--color-border)] bg-white p-1.5 shadow-xl">
                <button
                  onClick={() => {
                    setShowDesktopOverflow(false);
                    setShowMailboxInfo(true);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[12.5px] font-semibold text-[var(--color-text-primary)] hover:bg-[#E7F1DF]"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#1F5C43]">help</span>
                  <span>Cách hoạt động</span>
                </button>
                <button
                  onClick={() => {
                    setShowDesktopOverflow(false);
                    go('recipients');
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[12.5px] font-semibold text-[var(--color-text-primary)] hover:bg-[#E7F1DF]"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#1F5C43]">group</span>
                  <span>Nhắn người tin cậy</span>
                </button>
              </div>
            )}
          </div>

          {/* Notification Bell */}
          <button
            onClick={() => {
              setHistory([]);
              setRoute('feed');
              setShowDesktopOverflow(false);
              setShowAvatarMenu(false);
              openPendingPaperMail();
            }}
            aria-label="Thông báo hòm thư"
            title={
              hasPendingReply
                ? 'Có phản hồi mới chờ bạn'
                : pendingPaperLetters.length > 0
                  ? 'Có lá thư mới chờ bạn'
                  : 'Hòm thư đang yên tĩnh'
            }
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-white text-[var(--color-text-primary)] shadow-[0_2px_8px_rgba(31,92,67,0.05)] transition hover:bg-[#E7F1DF] active:scale-95"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {(hasPendingReply || pendingPaperLetters.length > 0) && (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#E78A45] ring-2 ring-white" />
            )}
          </button>

          {/* User Avatar */}
          <div className="relative">
            <button
              onClick={() => {
                setShowAvatarMenu((prev) => !prev);
                setShowDesktopOverflow(false);
              }}
              aria-label="Hồ sơ Minh Nguyễn"
              aria-expanded={showAvatarMenu}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#C8DAC4] bg-[#DDEBCF] text-[13px] font-bold text-[#1F5C43] shadow-[0_2px_8px_rgba(31,92,67,0.06)] transition hover:brightness-95 active:scale-95"
              type="button"
            >
              M
            </button>
            {showAvatarMenu && (
              <div className="absolute right-0 top-12 z-50 w-56 rounded-2xl border border-[var(--color-border)] bg-white p-2 shadow-xl">
                <div className="border-b border-[var(--color-border)]/70 px-2.5 py-2">
                  <p className="text-[13px] font-bold text-[var(--color-text-primary)]">Minh Nguyễn</p>
                  <p className="text-[11px] text-[var(--color-text-secondary)]">Ẩn danh · Biệt danh: Mầm lá nhỏ</p>
                </div>
                <button
                  onClick={() => {
                    setShowAvatarMenu(false);
                    go('recipients');
                  }}
                  className="mt-1 flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[12.5px] font-semibold text-[#1F5C43] hover:bg-[#E7F1DF]"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">group</span>
                  <span>Nhắn người tin cậy</span>
                </button>
                <button
                  onClick={() => {
                    setShowAvatarMenu(false);
                    setShowMailboxInfo(true);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[12.5px] font-medium text-[var(--color-text-secondary)] hover:bg-[#E7F1DF]"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">shield</span>
                  <span>Quy tắc an toàn &amp; ẩn danh</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Full-Width Mochi Mailbox Container */}
      <main className="relative -mx-4 flex min-h-[calc(100vh-33px)] flex-col overflow-hidden bg-[#FAF7EE] px-4 pb-0 pt-3 md:mx-0 md:h-[560px] md:min-h-[560px] md:w-full md:rounded-[28px] md:border-[3px] md:border-white md:bg-[#FBF4E8] md:px-8 md:py-6 md:shadow-[0_18px_46px_rgba(31,92,67,0.10)] lg:h-[600px] lg:min-h-[600px] xl:h-[630px] xl:min-h-[630px]">
        {/* Mobile Portrait Mochi Mailbox GIF (Unchanged on <768px) */}
        <img
          src={MOCHI_MAILBOX_GIF}
          alt="Mochi lục tìm thư tình pastel"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-top md:hidden"
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-28 bg-gradient-to-b from-black/25 via-black/10 to-transparent md:hidden" />

        {/* Desktop & Tablet Full-Width Widescreen Cozy Mochi Mailbox Illustration */}
        <div className="hidden md:block">
          <DesktopMailboxBackdrop />
          {blurBackdrop && (
            <div className="pointer-events-none absolute inset-0 bg-[#FAF7EE]/72 backdrop-blur-[3px]" />
          )}
        </div>

        <div
          key={contentKey ?? paperMailboxView}
          className="paper-mail-content relative z-20 flex min-h-0 flex-1 flex-col"
        >
          {children}
        </div>

        {paperHandoffActive && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-[var(--color-background)]/82 backdrop-blur-sm">
            <div className="paper-boat-handoff flex flex-col items-center">
              <img
                src="/assets/MindCare_2D_Assets/characters/mochi_happy.png"
                alt="Mochi đang trao lá thư cho người đưa thư"
                className="h-28 w-28 object-contain [image-rendering:pixelated]"
              />
              <svg width="150" height="82" viewBox="0 0 150 82" aria-hidden="true">
                <path d="M8 31L72 9L141 31L116 69H35Z" fill="white" stroke="var(--color-primary)" strokeWidth="3" strokeLinejoin="round" />
                <path d="M8 31H141L76 48Z" fill="var(--color-highlight)" stroke="var(--color-primary)" strokeWidth="3" strokeLinejoin="round" />
                <path d="M35 69L76 48L116 69" fill="none" stroke="var(--color-secondary)" strokeWidth="3" strokeLinecap="round" />
              </svg>
              <p className="mt-2 text-[12px] font-bold text-[var(--color-primary)]">Mochi đang chuyển lá thư đi...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );

  const renderMailbox = () => {
    const mailboxShell = (children: React.ReactNode) =>
      renderMailboxShell(children, paperMailboxView !== 'check', paperMailboxView);

    if (paperMailboxView === 'mine') {
      return mailboxShell(
        <div className="flex min-h-0 flex-1 flex-col md:mx-auto md:w-full md:max-w-2xl">
          {/* Top bar: Circular back button matching Image 3 */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setPaperMailboxView('check')}
              aria-label="Quay lại hòm thư"
              className="flex h-[46px] w-[46px] items-center justify-center rounded-full border border-white/70 bg-white/80 text-[#1F5C43] shadow-md backdrop-blur-md transition-all duration-200 ease-out hover:bg-white/95 active:scale-90"
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]">arrow_back</span>
            </button>
            <div className="rounded-full border border-white/70 bg-white/90 px-4 py-1.5 shadow-sm backdrop-blur-md md:hidden">
              <h2 className="text-[14px] font-bold text-[var(--color-primary)]">
                Thư của tôi ({myLetters.length})
              </h2>
            </div>
            <button
              onClick={() => go('anonymous-compose')}
              aria-label="Viết tâm sự"
              className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-md transition active:scale-95 md:hidden"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">edit_note</span>
            </button>
            <div className="hidden h-[46px] w-[46px] md:block" />
          </div>

          {/* Mobile list (<768px): preserved unchanged */}
          <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1 md:hidden">
            {myLetters.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-[var(--color-border)] bg-white/90 p-8 text-center shadow-sm">
                <span className="material-symbols-outlined text-[32px] text-[var(--color-secondary)]">mail_outline</span>
                <p className="mt-2 text-[14px] font-bold text-[var(--color-primary)]">Bạn chưa gửi lá thư nào</p>
                <p className="mt-1 text-[12px] text-[var(--color-text-secondary)]">
                  Viết tâm sự ẩn danh bất kỳ lúc nào khi bạn muốn được lắng nghe.
                </p>
              </div>
            ) : (
              myLetters.map((letter) => (
                <div key={letter.id} className="space-y-1.5">
                  {letter.status && (
                    <div className="flex items-center justify-between px-1">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10.5px] font-bold ${statusMeta[letter.status].className}`}>
                        {statusMeta[letter.status].label}
                      </span>
                      <span className="text-[11px] text-[var(--color-text-secondary)] tabular-nums">
                        {letter.replyCount} hồi đáp
                      </span>
                    </div>
                  )}
                  <EnvelopeCard
                    letter={letter}
                    selected={selectedLetterId === letter.id}
                    onClick={() => openLetter(letter)}
                  />
                </div>
              ))
            )}
          </div>

          {/* Desktop list (>=768px): unified Image 3 white rounded paper card */}
          <section className="my-auto hidden max-h-[58vh] w-full flex-col overflow-hidden rounded-[28px] bg-white/95 shadow-[0_18px_48px_rgba(31,92,67,0.16)] backdrop-blur-sm md:flex">
            <div className="flex items-center justify-between border-b border-[var(--color-border)]/80 px-7 py-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-secondary)]">
                Thư của tôi ({myLetters.length})
              </p>
              <span className="text-[11.5px] text-[var(--color-text-secondary)]">
                Biệt danh: Mầm lá nhỏ
              </span>
            </div>

            <div className="flex-1 divide-y divide-[var(--color-border)]/80 overflow-y-auto px-7">
              {myLetters.length === 0 ? (
                <div className="py-12 text-center">
                  <span className="material-symbols-outlined text-[34px] text-[var(--color-secondary)]">
                    mail_outline
                  </span>
                  <p className="mt-2 text-[15px] font-bold text-[var(--color-primary)]">
                    Bạn chưa gửi lá thư nào
                  </p>
                  <p className="mt-1 text-[12.5px] text-[var(--color-text-secondary)]">
                    Viết tâm sự ẩn danh bất kỳ lúc nào khi bạn muốn được lắng nghe.
                  </p>
                </div>
              ) : (
                myLetters.map((letter) => (
                  <button
                    key={letter.id}
                    onClick={() => openLetter(letter)}
                    className={`group flex w-full items-start gap-4 py-5 text-left transition hover:bg-[#FFF8EF]/70 -mx-3 px-3 rounded-2xl my-1 ${
                      selectedLetterId === letter.id ? 'bg-[#E7F1DF]' : ''
                    }`}
                    type="button"
                  >
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#EEF8F3] text-[#1F5C43]">
                      <span className="material-symbols-outlined text-[20px]">
                        {letter.status === 'pending' ? 'hourglass_top' : 'drafts'}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {letter.status && (
                            <span className={`rounded-full px-2.5 py-0.5 text-[10.5px] font-bold ${statusMeta[letter.status].className}`}>
                              {statusMeta[letter.status].label}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#F5F7F3] px-2.5 py-0.5 text-[10.5px] font-semibold text-[var(--color-text-secondary)]">
                            {letter.topic}
                          </span>
                        </div>
                        <span className="text-[11.5px] text-[var(--color-text-secondary)] tabular-nums">
                          {letter.time} · {letter.replyCount} hồi đáp
                        </span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-[14px] leading-6 text-[var(--color-text-primary)]">
                        {letter.content}
                      </p>
                    </div>
                    <span className="material-symbols-outlined mt-2 shrink-0 text-[19px] text-[var(--color-text-secondary)] transition group-hover:translate-x-0.5 group-hover:text-[#1F5C43]">
                      chevron_right
                    </span>
                  </button>
                ))
              )}
            </div>
          </section>

          {/* Desktop bottom soft-mint action bar matching Image 3 */}
          <div className="relative z-20 mt-auto hidden rounded-[26px] border border-[#E7E8DE] bg-[#FFF8EF]/95 p-3.5 shadow-[0_10px_28px_rgba(31,92,67,0.10)] backdrop-blur-md md:block">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaperMailboxView('check')}
                className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-5 text-[13.5px] font-semibold text-[var(--color-text-primary)] transition hover:bg-[#FFF8EF] active:scale-[0.98]"
                type="button"
              >
                <span className="material-symbols-outlined text-[19px] text-[#1F5C43]">mail</span>
                <span>Về hòm thư</span>
              </button>
              <button
                onClick={() => go('anonymous-compose')}
                className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-5 text-[13.5px] font-bold text-white shadow-[0_8px_22px_rgba(31,92,67,0.22)] transition hover:brightness-105 active:scale-[0.98]"
                type="button"
              >
                <span className="material-symbols-outlined text-[19px]">edit_note</span>
                <span>Viết tâm sự mới</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (paperMailboxView === 'archive') {
      return mailboxShell(
        <div className="flex min-h-0 flex-1 flex-col md:mx-auto md:w-full md:max-w-2xl">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setPaperMailboxView('check')}
              aria-label="Quay lại kiểm tra hòm thư"
              className="flex h-[46px] w-[46px] items-center justify-center rounded-full border border-white/70 bg-white/80 text-[#1F5C43] shadow-md backdrop-blur-md transition-all duration-200 ease-out hover:bg-white/95 active:scale-90"
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]">arrow_back</span>
            </button>
            <div className="rounded-full border border-white/60 bg-white/85 px-4 py-1.5 shadow-sm backdrop-blur-md md:hidden">
              <h2 className="text-[15px] font-bold text-[var(--color-primary)]">Phản hồi đã lưu</h2>
            </div>
            <span className="flex h-[46px] w-[46px] items-center justify-center rounded-full border border-white/70 bg-white/75 text-[var(--color-secondary)] shadow-md backdrop-blur-md md:hidden">
              <span className="material-symbols-outlined text-[22px]">inventory_2</span>
            </span>
            <div className="hidden h-[46px] w-[46px] md:block" />
          </div>

          {/* Mobile list (<768px): preserved */}
          <div className="mt-5 flex-1 space-y-3 overflow-y-auto pr-1 md:hidden">
            {archivedReplies.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-[var(--color-border)] bg-white/90 p-8 text-center shadow-sm">
                <span className="material-symbols-outlined text-[32px] text-[var(--color-secondary)]">inventory_2</span>
                <p className="mt-2 text-[14px] font-bold text-[var(--color-primary)]">Chưa có phản hồi nào được lưu</p>
                <p className="mt-1 text-[12px] text-[var(--color-text-secondary)]">
                  Khi nhận được lời động viên muốn giữ lại, bạn có thể thêm vào hộp lưu trữ.
                </p>
              </div>
            ) : (
              archivedReplies.map((reply) => (
                <article
                  key={reply.id}
                  onClick={() => setArchivePreviewOpen(true)}
                  onPointerDown={(event) => setArchiveSwipeStart(event.clientX)}
                  onPointerUp={(event) => {
                    if (archiveSwipeStart !== null && event.clientX - archiveSwipeStart < -45) {
                      setArchivePreviewOpen(true);
                    }
                    setArchiveSwipeStart(null);
                  }}
                  className="cursor-pointer touch-pan-y rounded-[22px] border border-[var(--color-border)] bg-white/95 p-4 shadow-[0_8px_22px_rgba(31,92,67,0.08)] backdrop-blur-sm transition hover:border-[var(--color-secondary)]"
                >
                  <p className="line-clamp-3 text-[13px] leading-6 text-[var(--color-text-primary)]">
                    {reply.content}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-[10px] text-[var(--color-text-secondary)]">
                    <span>{reply.time}</span>
                  </div>
                </article>
              ))
            )}
          </div>

          {/* Desktop unified white paper card matching Image 3 */}
          <section className="my-auto hidden max-h-[58vh] w-full flex-col overflow-hidden rounded-[28px] bg-white/95 shadow-[0_18px_48px_rgba(31,92,67,0.16)] backdrop-blur-sm md:flex">
            <div className="flex items-center justify-between border-b border-[var(--color-border)]/80 px-7 py-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-secondary)]">
                Phản hồi đã lưu ({archivedReplies.length})
              </p>
              <span className="text-[11.5px] text-[var(--color-text-secondary)]">
                Những lời động viên bạn giữ lại
              </span>
            </div>

            <div className="flex-1 divide-y divide-[var(--color-border)]/80 overflow-y-auto px-7">
              {archivedReplies.length === 0 ? (
                <div className="py-12 text-center">
                  <span className="material-symbols-outlined text-[34px] text-[var(--color-secondary)]">inventory_2</span>
                  <p className="mt-2 text-[15px] font-bold text-[var(--color-primary)]">
                    Chưa có phản hồi nào được lưu
                  </p>
                  <p className="mt-1 text-[12.5px] text-[var(--color-text-secondary)]">
                    Khi nhận được lời động viên muốn giữ lại, bạn có thể thêm vào hộp lưu trữ.
                  </p>
                </div>
              ) : (
                archivedReplies.map((reply) => (
                  <button
                    key={reply.id}
                    onClick={() => setArchivePreviewOpen(true)}
                    className="group -mx-3 my-1 flex w-full flex-col rounded-2xl px-3 py-5 text-left transition hover:bg-[#FFF8EF]/70"
                    type="button"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-[var(--color-secondary)]">
                        {reply.alias}
                      </span>
                      <span className="text-[11.5px] text-[var(--color-text-secondary)]">{reply.time}</span>
                    </div>
                    <p className="mt-2 text-[14.5px] leading-7 text-[var(--color-text-primary)]">
                      {reply.content}
                    </p>
                    <span className="mt-2.5 inline-flex items-center gap-1 text-[12px] font-semibold text-[#1F5C43] opacity-85 transition group-hover:opacity-100">
                      <span>Xem tâm sự gốc của bạn</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </span>
                  </button>
                ))
              )}
            </div>
          </section>

          {/* Desktop bottom soft-mint tray matching Image 3 */}
          <div className="relative z-20 mt-auto hidden rounded-[26px] border border-[#E7E8DE] bg-[#FFF8EF]/95 p-3.5 shadow-[0_10px_28px_rgba(31,92,67,0.10)] backdrop-blur-md md:block">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaperMailboxView('check')}
                className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-5 text-[13.5px] font-semibold text-[var(--color-text-primary)] transition hover:bg-[#FFF8EF] active:scale-[0.98]"
                type="button"
              >
                <span className="material-symbols-outlined text-[19px] text-[#1F5C43]">mail</span>
                <span>Về hòm thư</span>
              </button>
              <button
                onClick={() => setArchivePreviewOpen(true)}
                disabled={!originalPost}
                className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-5 text-[13.5px] font-bold text-white shadow-[0_8px_22px_rgba(31,92,67,0.22)] transition hover:brightness-105 active:scale-[0.98] disabled:opacity-45"
                type="button"
              >
                <span className="material-symbols-outlined text-[19px]">article</span>
                <span>Xem tâm sự gốc</span>
              </button>
            </div>
          </div>

          {archivePreviewOpen && (
            <div className="absolute inset-0 z-40 flex items-center justify-center bg-[var(--color-text-primary)]/30 px-5 backdrop-blur-sm">
              <button
                onClick={() => setArchivePreviewOpen(false)}
                aria-label="Đóng bài tâm sự gốc"
                className="absolute inset-0"
                type="button"
              />
              <article className="relative z-10 max-h-[68vh] w-full max-w-xl overflow-y-auto rounded-[28px] bg-white p-6 shadow-2xl">
                <button
                  onClick={() => setArchivePreviewOpen(false)}
                  aria-label="Đóng"
                  className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-mint)]"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
                <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-[var(--color-secondary)]">
                  Tâm sự của bạn
                </p>
                <p className="mt-3 whitespace-pre-line text-[14px] leading-7 text-[var(--color-text-primary)]">
                  {originalPost?.content}
                </p>
              </article>
            </div>
          )}
        </div>
      );
    }

    if (paperMailboxView === 'reply' && activeReply) {
      return mailboxShell(
        <div className="flex min-h-0 flex-1 flex-col md:mx-auto md:w-full md:max-w-2xl">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setPaperMailboxView('check')}
              aria-label="Quay lại kiểm tra hòm thư"
              className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-white/80 shadow-md backdrop-blur-md border border-white/70 text-[#1F5C43] transition-all duration-200 ease-out active:scale-90 hover:bg-white/95"
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]">arrow_back</span>
            </button>
            <div className="h-[46px] w-[46px]" />
          </div>
          <section className="my-auto max-h-[58vh] overflow-y-auto rounded-[28px] bg-white/95 p-5 md:p-7 shadow-[0_18px_48px_rgba(31,92,67,0.16)] backdrop-blur-sm">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-secondary)]">Phản hồi</p>
              <p className="mt-3 text-[14px] md:text-[15px] leading-7 text-[var(--color-text-primary)]">{activeReply.content}</p>
              <p className="mt-3 text-[10px] md:text-[11px] text-[var(--color-text-secondary)]">{activeReply.time}</p>
            </div>
            <div className="my-5 h-px w-full bg-[var(--color-border)]" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">Tâm sự của bạn</p>
              <p className="mt-3 whitespace-pre-line text-[12.5px] md:text-[13.5px] leading-6 text-[var(--color-text-secondary)]">
                {originalPost?.content}
              </p>
            </div>
          </section>

          <div className="relative z-20 -mx-4 -mb-5 mt-auto rounded-t-[28px] border-t border-[#E7E8DE] bg-[#FFF8EF] px-5 pt-4 pb-6 shadow-[0_-12px_32px_rgba(31,92,67,0.12)] md:mx-0 md:mb-0 md:rounded-[26px] md:border md:bg-[#FFF8EF]/95 md:p-3.5 md:shadow-[0_10px_28px_rgba(31,92,67,0.10)] md:backdrop-blur-md">
            <div className="flex flex-col gap-2.5 md:grid md:grid-cols-3 md:items-center md:gap-3">
              <button
                onClick={() =>
                  setHeartedReplyIds((current) =>
                    current.includes(activeReply.id)
                      ? current.filter((id) => id !== activeReply.id)
                      : [...current, activeReply.id]
                  )
                }
                className={`flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[14.5px] font-bold transition-all duration-200 ease-out active:scale-[0.98] md:min-h-[50px] md:px-4 md:py-0 md:text-[13.5px] ${
                  heartedReplyIds.includes(activeReply.id)
                    ? 'bg-[#E06D53] text-white shadow-[0_6px_20px_rgba(224,109,83,0.32)]'
                    : 'border border-[#F8CFC4] bg-[#FFF2EE] text-[#C25438] hover:bg-[#FFEAE3]'
                }`}
                type="button"
              >
                <span className={`material-symbols-outlined text-[20px] ${heartedReplyIds.includes(activeReply.id) ? 'filled text-white' : 'filled text-[#E06D53]'}`}>
                  favorite
                </span>
                <span>{heartedReplyIds.includes(activeReply.id) ? 'Đã gửi yêu thích' : 'Gửi yêu thích'}</span>
              </button>
              <button
                onClick={() => finishReplyAction(true)}
                className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-3.5 text-[14px] font-bold text-white shadow-[0_8px_22px_rgba(31,92,67,0.22)] transition-all duration-200 ease-out active:scale-[0.98] md:min-h-[50px] md:px-4 md:py-0 md:text-[13.5px]"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">bookmark</span>
                Thêm vào lưu trữ
              </button>
              <button
                onClick={() => finishReplyAction(false)}
                className="flex min-h-[42px] w-full items-center justify-center gap-1.5 text-[13px] font-medium text-[#7D736A] transition-all duration-200 ease-out active:scale-[0.98] hover:text-[#C53030] md:min-h-[50px] md:rounded-full md:border md:border-[var(--color-border)] md:bg-white md:text-[13.5px]"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">local_fire_department</span>
                <span>Đốt thư</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (paperMailboxView === 'letter' && activePaperLetter) {
      return mailboxShell(
        <div className="flex min-h-0 flex-1 flex-col md:mx-auto md:w-full md:max-w-2xl">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setPaperMailboxView('check')}
              aria-label="Quay lại kiểm tra hòm thư"
              className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-white/80 shadow-md backdrop-blur-md border border-white/70 text-[#1F5C43] transition-all duration-200 ease-out active:scale-90 hover:bg-white/95"
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]">arrow_back</span>
            </button>
            <div className="h-[46px] w-[46px]" />
          </div>
          <article className="my-auto max-h-[58vh] overflow-y-auto rounded-[28px] bg-white/95 p-5 shadow-[0_18px_48px_rgba(31,92,67,0.16)] backdrop-blur-sm md:p-7">
            <div className="mb-3 hidden items-center justify-between border-b border-[var(--color-border)]/70 pb-3 md:flex">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E7F1DF] px-3 py-1 text-[11px] font-bold text-[var(--color-primary)]">
                <span className="material-symbols-outlined text-[14px]">menu_book</span>
                {activePaperLetter.topic}
              </span>
              <span className="text-[11.5px] text-[var(--color-text-secondary)]">
                {activePaperLetter.alias} · {activePaperLetter.time}
              </span>
            </div>
            <p className="whitespace-pre-line text-[14px] leading-7 text-[var(--color-text-primary)] md:text-[15px] md:leading-8">
              {activePaperLetter.content}
            </p>
          </article>

          <div className="relative z-20 -mx-4 -mb-5 mt-auto rounded-t-[28px] border-t border-[#E7E8DE] bg-[#FFF8EF] px-5 pt-4 pb-6 shadow-[0_-12px_32px_rgba(31,92,67,0.12)] md:mx-0 md:mb-0 md:rounded-[26px] md:border md:bg-[#FFF8EF]/95 md:p-3.5 md:shadow-[0_10px_28px_rgba(31,92,67,0.10)] md:backdrop-blur-md">
            <div className="flex flex-col gap-2.5 md:grid md:grid-cols-2 md:gap-3">
              <button
                onClick={() => {
                  setSelectedLetter(activePaperLetter);
                  setReplyText(localStorage.getItem('mindcare_letter_reply_draft') || '');
                  go('reply-compose');
                }}
                className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-3.5 text-[14px] font-bold text-white shadow-[0_8px_22px_rgba(31,92,67,0.22)] transition-all duration-200 ease-out active:scale-[0.98] md:min-h-[50px] md:py-0"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">reply</span>
                Trả lời
              </button>
              <button
                onClick={() => runPaperHandoff(activePaperLetter.id)}
                className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-full border border-[#DDEBCF] bg-[#E7F1DF] px-6 text-[14.5px] font-bold text-[#1F5C43] transition-all duration-200 ease-out active:scale-[0.98] hover:bg-[#DDEBCF] md:min-h-[50px] md:text-[13.5px]"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">forward</span>
                <span>Chuyền đi</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return mailboxShell(
      <>
        {/* Nút góc trên dạng kính mờ (Mobile only; desktop sử dụng header phía trên) */}
        <div className="flex items-center justify-between md:hidden">
          <button
            onClick={onBackHome}
            aria-label="Quay về trang Hôm nay"
            className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-white/75 shadow-md backdrop-blur-md border border-white/70 text-[#1F5C43] transition-all duration-200 ease-out active:scale-90 hover:bg-white/95"
            type="button"
          >
            <span className="material-symbols-outlined text-[22px]">arrow_back</span>
          </button>
          <button
            onClick={() => setPaperMailboxView('archive')}
            aria-label={`Mở lưu trữ, ${archivedReplies.length} phản hồi đã lưu`}
            className="relative flex h-[46px] w-[46px] items-center justify-center rounded-full bg-white/75 shadow-md backdrop-blur-md border border-white/70 text-[#1F5C43] transition-all duration-200 ease-out active:scale-90 hover:bg-white/95"
            type="button"
          >
            <span className="material-symbols-outlined text-[22px]">inventory_2</span>
            {archivedReplies.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-secondary)] px-1.5 text-[9px] font-bold text-white shadow ring-2 ring-white">
                {archivedReplies.length}
              </span>
            )}
          </button>
        </div>

        {/* Bong bóng thoại của Mochi */}
        <div className="relative z-20 mt-4 flex justify-center md:mt-3 lg:mt-5">
          <div className="mochi-bubble-bounce relative flex items-center gap-2 rounded-full border border-emerald-950/10 bg-white/95 px-4 py-2 text-center shadow-[0_6px_20px_rgba(0,0,0,0.08)] backdrop-blur-md md:px-5 md:py-2.5">
            <span className="material-symbols-outlined text-[19px] text-[#1F5C43]">
              {hasPendingReply ? 'mark_email_unread' : 'mail'}
            </span>
            <span className="text-[13.5px] font-bold text-[#1F5C43] md:text-[14.5px]">
              {hasPendingReply ? (
                'Có ai đó đã trả lời bạn'
              ) : pendingPaperLetters.length > 0 ? (
                <>
                  <span className="md:hidden">Có ai đó đã gửi thư cho bạn</span>
                  <span className="hidden md:inline">Một lá thư đang chờ bạn</span>
                </>
              ) : (
                'Hòm thư đang yên tĩnh'
              )}
            </span>
            {/* Đuôi nhọn của bóng thoại chỉ xuống Mochi */}
            <div
              className="absolute -bottom-[7px] left-1/2 -translate-x-1/2 h-0 w-0 border-x-[7px] border-x-transparent border-t-[8px] border-t-white/95"
              aria-hidden="true"
            />
            {(hasPendingReply || pendingPaperLetters.length > 0) && (
              <svg
                className="pointer-events-none absolute -right-7 -top-4 hidden h-6 w-6 md:block"
                viewBox="0 0 28 28"
                fill="none"
                aria-hidden="true"
              >
                <path d="M5 12L9 3M13 15L21 8M16 21L25 19" stroke="#F4D37B" strokeWidth="3" strokeLinecap="round" />
              </svg>
            )}
          </div>
        </div>

        {/* Khoảng trống giữa để lộ Mochi và phần trên của chồng thư pastel */}
        <div className="flex-1 min-h-[140px] md:min-h-[210px]" aria-hidden="true" />

        {/* Khay hành động riêng */}
        <div className="relative z-20 -mx-4 -mb-5 rounded-t-[30px] border-t border-[#E7E8DE] bg-[#FFF8EF] px-5 pt-4 pb-6 shadow-[0_-14px_36px_rgba(31,92,67,0.14)] md:mx-auto md:mb-0 md:w-full md:max-w-[440px] md:rounded-[28px] md:border md:border-[#EFE4D5] md:bg-[#FAF8F3]/96 md:px-7 md:py-5 md:shadow-[0_14px_36px_rgba(31,92,67,0.14)]">
          <div className="flex flex-col gap-3">
            {/* Nút chính "Nhận một lá thư" / "Mở phản hồi" */}
            {(hasPendingReply || pendingPaperLetters.length > 0) && (
              <div className="relative flex items-center justify-center">
                <svg
                  className="pointer-events-none absolute -left-8 hidden h-7 w-7 md:block"
                  viewBox="0 0 28 28"
                  fill="none"
                  aria-hidden="true"
                >
                  <path d="M22 6L12 10M21 14L9 14M22 22L12 18" stroke="#F4D37B" strokeWidth="3" strokeLinecap="round" />
                </svg>
                <button
                  onClick={openPendingPaperMail}
                  className="relative flex h-[58px] w-full items-center justify-center gap-2.5 rounded-full bg-[#1F5C43] px-6 text-[16px] font-bold text-white shadow-[0_8px_20px_rgba(31,92,67,0.22)] button-glow-pulse ring-4 ring-[#DDEBCF]/70 transition-all duration-200 ease-out hover:brightness-105 active:scale-[0.98] md:h-[50px] md:ring-0"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[24px] md:text-[21px]">
                    {hasPendingReply ? 'mark_email_unread' : 'mail'}
                  </span>
                  <span>
                    {hasPendingReply ? (
                      'Mở phản hồi'
                    ) : (
                      <>
                        <span className="md:hidden">Mở thư</span>
                        <span className="hidden md:inline">Nhận một lá thư</span>
                      </>
                    )}
                  </span>
                </button>
                <svg
                  className="pointer-events-none absolute -right-8 hidden h-7 w-7 md:block"
                  viewBox="0 0 28 28"
                  fill="none"
                  aria-hidden="true"
                >
                  <path d="M6 6L16 10M7 14L19 14M6 22L16 18" stroke="#F4D37B" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
            )}

            {/* Nút phụ "Viết tâm sự" */}
            <button
              onClick={() => {
                go('anonymous-compose');
              }}
              className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full border border-[#DDEBCF] bg-[#E7F1DF] px-6 text-[15px] font-bold text-[#1F5C43] transition-all duration-200 ease-out hover:bg-[#DDEBCF] active:scale-[0.98] md:h-[46px]"
              type="button"
            >
              <span className="material-symbols-outlined text-[21px]">edit_note</span>
              <span>Viết tâm sự</span>
            </button>

            <p className="hidden items-center justify-center gap-1.5 pt-0.5 text-center text-[11.5px] font-medium text-[var(--color-text-secondary)] md:flex">
              <span className="material-symbols-outlined text-[15px] text-[var(--color-text-secondary)]">info</span>
              <span>Bạn sẽ chỉ nhận một lá thư ngẫu nhiên tại một thời điểm.</span>
            </p>
          </div>
        </div>
      </>
    );
  };

  const renderTransition = () => (
    <main
      className={`letter-transition-backdrop fixed inset-y-0 left-1/2 z-[60] flex w-full max-w-[420px] -translate-x-1/2 items-center justify-center bg-[#F6F0E7]/70 px-5 backdrop-blur-[3px] md:inset-0 md:left-0 md:max-w-none md:translate-x-0 ${
        animationStage === 'opening' ? 'is-opening' : 'is-closing'
      }`}
      aria-live="polite"
    >
      <button
        onClick={animationStage === 'opening' ? finishOpen : () => {
          setHistory([]);
          setRoute('feed');
        }}
        className="absolute right-4 top-4 min-h-11 rounded-full px-4 text-[10px] font-bold text-[var(--color-text-secondary)] hover:bg-white/60"
        type="button"
      >
        Bỏ qua
      </button>
      <div className={`mail-transition ${animationStage === 'opening' ? 'is-opening' : 'is-closing'}`}>
        <div className="mail-paper">
          <span className="material-symbols-outlined text-[20px] text-[#B8754F]">eco</span>
          <p className="mt-2 text-[12px] font-bold text-[var(--color-text-secondary)]">{selectedLetter.alias}</p>
          <p className="mt-1 line-clamp-3 text-[10px] leading-4 text-[#756B60]">
            {selectedLetter.content}
          </p>
        </div>
        <div className="mail-envelope">
          <div className="mail-envelope-back" />
          <div className="mail-envelope-flap" />
          <div className="mail-envelope-front">
            <span className="material-symbols-outlined filled text-[24px] text-[#F3B199]">
              favorite
            </span>
          </div>
        </div>
      </div>
      <p className="absolute bottom-[18%] text-[11px] font-medium text-[#7A7065]">
        {animationStage === 'opening' ? 'Đang mở lá thư...' : 'Đang gấp lá thư lại...'}
      </p>
    </main>
  );

  const renderLetterRead = () => (
    <>
      {/* Mobile (<768px): preserved unchanged */}
      <div className="md:hidden">
        <Header
          title=""
          onBack={closeLetter}
          action={
            <button
              onClick={() => setShowLetterMenu(true)}
              aria-label="Tùy chọn lá thư"
              className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-mint)]"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">more_horiz</span>
            </button>
          }
        />
        <main className="pb-8 pt-4">
          <article className="letter-paper relative rounded-t-[8px] rounded-b-[24px] border border-[#E8DCCB] bg-[var(--color-surface)] px-5 pb-8 pt-5 shadow-[0_8px_24px_rgba(103,76,52,0.10)]">
            <span className="material-symbols-outlined absolute right-5 top-4 text-[28px] text-[#9EBF8F]">
              eco
            </span>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-[#B8754F]">nest_eco_leaf</span>
              <div>
                <p className="text-[11.5px] font-bold text-[#4A5A4D]">{selectedLetter.alias}</p>
                <p className="text-[8.5px] text-[#8A8177]">{selectedLetter.time}</p>
              </div>
            </div>
            <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-[#E7F1DF] px-2.5 py-1 text-[9.5px] font-bold text-[var(--color-primary)]">
              <span className="material-symbols-outlined text-[13px]">menu_book</span>
              {selectedLetter.topic}
            </span>
            <div className="mt-5 whitespace-pre-line text-[13px] leading-[1.8] text-[var(--color-text-primary)]">
              {selectedLetter.content}
            </div>
            <span className="material-symbols-outlined filled absolute bottom-5 right-5 rotate-12 text-[26px] text-[#E9977D]">
              favorite
            </span>
          </article>
          <div className="relative -mt-1 h-28 overflow-hidden rounded-b-[24px] bg-[#C9DDBA] shadow-[0_6px_18px_rgba(56,89,59,0.10)]">
            <div className="absolute -left-[10%] -top-[72%] h-48 w-[72%] rotate-[27deg] border border-[#AFC9A4] bg-[var(--color-highlight)]" />
            <div className="absolute -right-[10%] -top-[72%] h-48 w-[72%] -rotate-[27deg] border border-[#AFC9A4] bg-[var(--color-highlight)]" />
            <div className="absolute left-1/2 top-3 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full border-[3px] border-[#F6D1BC] bg-[#EFA98C] text-white shadow">
              <span className="material-symbols-outlined filled text-[20px]">favorite</span>
            </div>
          </div>

          {selectedLetter.isOwn ? (
            <section className="mt-4 rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              {selectedLetter.status === 'published' ? (
                <>
                  <h2 className="text-[13px] font-bold text-[var(--color-primary)]">
                    {replies.length} lời hồi đáp riêng
                  </h2>
                  <div className="mt-3 space-y-3">
                    {replies.map((reply) => (
                      <div key={reply.id} className="rounded-2xl bg-[var(--color-chart-background)] p-3">
                        <p className="text-[9.5px] font-bold text-[var(--color-primary)]">{reply.alias}</p>
                        <p className="mt-1 text-[10.5px] leading-5 text-[var(--color-text-secondary)]">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#A17643]">hourglass_top</span>
                  <p className="text-[10.5px] leading-5 text-[#6D655C]">
                    Lá thư đang chờ kiểm duyệt nên chưa được đưa vào hòm thư chung và chưa thể nhận hồi đáp.
                  </p>
                </div>
              )}
            </section>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={() => showToast('Đã gửi một lời đồng cảm nhẹ nhàng.')}
                className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#D7B58D] bg-[#FFF9F0] text-[11px] font-bold text-[#8A6746]"
                type="button"
              >
                <span className="material-symbols-outlined text-[19px]">favorite</span>
                Đồng cảm
              </button>
              <button
                onClick={() => {
                  setReplyText(localStorage.getItem('mindcare_letter_reply_draft') || '');
                  go('reply-compose');
                }}
                disabled={!selectedLetter.repliesAllowed}
                className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--color-highlight)] text-[11px] font-bold text-[var(--color-primary)] disabled:bg-[var(--color-border)] disabled:text-[var(--color-text-secondary)]"
                type="button"
              >
                <span className="material-symbols-outlined text-[19px]">reply</span>
                Trả lời thư
              </button>
            </div>
          )}
          <p className="mt-3 text-center text-[9px] leading-4 text-[var(--color-text-secondary)]">
            Bạn có thể chỉ đọc và lắng nghe. Không bắt buộc phải hồi đáp.
          </p>
        </main>
      </div>

      {/* Desktop (>=768px): Unified Image 3 Cozy Garden Mailbox Frame */}
      <div className="hidden md:block">
        {renderMailboxShell(
          <div className="flex min-h-0 flex-1 flex-col md:mx-auto md:w-full md:max-w-2xl">
            <div className="flex items-center justify-between">
              <button
                onClick={closeLetter}
                aria-label="Quay lại"
                className="flex h-[46px] w-[46px] items-center justify-center rounded-full border border-white/70 bg-white/80 text-[#1F5C43] shadow-md backdrop-blur-md transition-all duration-200 ease-out hover:bg-white/95 active:scale-90"
                type="button"
              >
                <span className="material-symbols-outlined text-[22px]">arrow_back</span>
              </button>
              <button
                onClick={() => setShowLetterMenu(true)}
                aria-label="Tùy chọn lá thư"
                className="flex h-[46px] w-[46px] items-center justify-center rounded-full border border-white/70 bg-white/80 text-[#1F5C43] shadow-md backdrop-blur-md transition-all duration-200 ease-out hover:bg-white/95 active:scale-90"
                type="button"
              >
                <span className="material-symbols-outlined text-[22px]">more_horiz</span>
              </button>
            </div>

            <section className="my-auto max-h-[58vh] overflow-y-auto rounded-[28px] bg-white/95 p-7 shadow-[0_18px_48px_rgba(31,92,67,0.16)] backdrop-blur-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-secondary)]">
                    {selectedLetter.isOwn ? 'Tâm sự của bạn' : 'Lá thư ẩn danh'}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#E7F1DF] px-2.5 py-0.5 text-[10.5px] font-bold text-[var(--color-primary)]">
                    <span className="material-symbols-outlined text-[13px]">menu_book</span>
                    {selectedLetter.topic}
                  </span>
                  {selectedLetter.isOwn && selectedLetter.status && (
                    <span className={`rounded-full px-2.5 py-0.5 text-[10.5px] font-bold ${statusMeta[selectedLetter.status].className}`}>
                      {statusMeta[selectedLetter.status].label}
                    </span>
                  )}
                </div>
                <span className="text-[11.5px] text-[var(--color-text-secondary)]">
                  {selectedLetter.alias} · {selectedLetter.time}
                </span>
              </div>

              <div className="mt-4 whitespace-pre-line text-[15px] leading-7 text-[var(--color-text-primary)]">
                {selectedLetter.content}
              </div>

              <div className="my-5 h-px w-full bg-[var(--color-border)]" />

              {selectedLetter.isOwn ? (
                selectedLetter.status === 'published' ? (
                  <div>
                    <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">
                      {replies.length} lời hồi đáp riêng
                    </p>
                    <div className="mt-3 space-y-2.5">
                      {replies.map((reply) => (
                        <div key={reply.id} className="rounded-2xl bg-[#FFF8EF] px-4 py-3">
                          <div className="flex items-center justify-between">
                            <p className="text-[11px] font-bold text-[var(--color-primary)]">{reply.alias}</p>
                            <span className="text-[10.5px] text-[var(--color-text-secondary)]">{reply.time}</span>
                          </div>
                          <p className="mt-1 text-[13px] leading-6 text-[var(--color-text-primary)]">
                            {reply.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2.5 rounded-2xl bg-[#FFF8EB] px-4 py-3 text-[#8A693C]">
                    <span className="material-symbols-outlined mt-0.5 text-[18px]">hourglass_top</span>
                    <p className="text-[12.5px] leading-5">
                      Lá thư đang chờ kiểm duyệt nên chưa được đưa vào hòm thư chung và chưa thể nhận hồi đáp.
                    </p>
                  </div>
                )
              ) : (
                <p className="text-[12px] leading-5 text-[var(--color-text-secondary)]">
                  Bạn có thể chỉ đọc và lắng nghe. Không bắt buộc phải hồi đáp.
                </p>
              )}
            </section>

            {/* Bottom soft-mint pill tray matching Image 3 */}
            <div className="relative z-20 mt-auto rounded-[26px] border border-[#E7E8DE] bg-[#FFF8EF]/95 p-3.5 shadow-[0_10px_28px_rgba(31,92,67,0.10)] backdrop-blur-md">
              {selectedLetter.isOwn ? (
                <div className="grid grid-cols-3 items-center gap-3">
                  <button
                    onClick={() => {
                      setLetters((current) =>
                        current.map((letter) =>
                          letter.id === selectedLetter.id
                            ? { ...letter, repliesAllowed: !letter.repliesAllowed }
                            : letter
                        )
                      );
                      setSelectedLetter((letter) => ({ ...letter, repliesAllowed: !letter.repliesAllowed }));
                    }}
                    className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-full border border-[#DDEBCF] bg-[#E7F1DF] px-4 text-[13.5px] font-bold text-[#1F5C43] transition hover:bg-[#DDEBCF] active:scale-[0.98]"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[19px]">
                      {selectedLetter.repliesAllowed ? 'comments_disabled' : 'chat_bubble'}
                    </span>
                    <span>{selectedLetter.repliesAllowed ? 'Tắt hồi đáp' : 'Bật hồi đáp'}</span>
                  </button>
                  <button
                    onClick={closeLetter}
                    className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-4 text-[13.5px] font-bold text-white shadow-[0_8px_22px_rgba(31,92,67,0.22)] transition hover:brightness-105 active:scale-[0.98]"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[19px]">mark_email_read</span>
                    <span>Về thư của tôi</span>
                  </button>
                  <button
                    onClick={() => {
                      setLetters((current) => current.filter((letter) => letter.id !== selectedLetter.id));
                      setShowLetterMenu(false);
                      setMailboxTab('mine');
                      setPaperMailboxView('mine');
                      setHistory([]);
                      setRoute('feed');
                    }}
                    className="flex min-h-[50px] w-full items-center justify-center gap-1.5 rounded-full border border-[var(--color-border)] bg-white px-4 text-[13.5px] font-medium text-[#7D736A] transition hover:text-[#C53030] active:scale-[0.98]"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                    <span>Xóa thư</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 items-center gap-3">
                  <button
                    onClick={() => showToast('Đã gửi một lời đồng cảm nhẹ nhàng.')}
                    className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-full border border-[#F8CFC4] bg-[#FFF2EE] px-4 text-[13.5px] font-bold text-[#C25438] transition hover:bg-[#FFEAE3] active:scale-[0.98]"
                    type="button"
                  >
                    <span className="material-symbols-outlined filled text-[20px] text-[#E06D53]">favorite</span>
                    <span>Đồng cảm</span>
                  </button>
                  <button
                    onClick={() => {
                      setReplyText(localStorage.getItem('mindcare_letter_reply_draft') || '');
                      go('reply-compose');
                    }}
                    disabled={!selectedLetter.repliesAllowed}
                    className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-4 text-[13.5px] font-bold text-white shadow-[0_8px_22px_rgba(31,92,67,0.22)] transition hover:brightness-105 active:scale-[0.98] disabled:opacity-45"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[20px]">reply</span>
                    <span>Trả lời thư</span>
                  </button>
                </div>
              )}
            </div>
          </div>,
          true,
          'letter-read'
        )}
      </div>
    </>
  );

  const renderReplyComposer = () => (
    <>
      {/* Mobile (<768px): preserved unchanged */}
      <main className="relative -mx-4 flex min-h-[calc(100vh-33px)] flex-col overflow-hidden bg-[#FAF7EE] px-4 pb-5 pt-3 md:hidden">
        <img
          src={MOCHI_MAILBOX_GIF}
          alt="Mochi lục tìm thư tình pastel"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="pointer-events-none absolute inset-0 bg-white/35 backdrop-blur-[2px]" />
        <button
          onClick={back}
          aria-label="Quay lại lá thư"
          className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/85 shadow-md backdrop-blur-md border border-white/60 text-[var(--color-primary)] transition-all duration-200 ease-out active:scale-90 hover:bg-white"
          type="button"
        >
          <span className="material-symbols-outlined text-[24px]">arrow_back</span>
        </button>

        <section className="paper-mail-content relative z-10 my-auto rounded-[28px] bg-white/95 p-5 shadow-[0_18px_48px_rgba(31,92,67,0.18)] backdrop-blur-sm">
          <textarea
            id="letter-reply-mobile"
            value={replyText}
            onChange={(event) => setReplyText(event.target.value.slice(0, 500))}
            placeholder="Viết lời hồi đáp của bạn..."
            className="min-h-[320px] w-full resize-none bg-transparent text-[14px] leading-7 text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-secondary)]/55"
            autoFocus
          />
          <p className="mt-2 text-right text-[11px] text-[var(--color-text-secondary)] tabular-nums">{replyText.length} / 500</p>
        </section>

        <button
          onClick={sendReply}
          disabled={!replyText.trim() || isReplySending}
          className="relative z-10 mt-auto flex min-h-[54px] w-full items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-3.5 text-[15px] font-bold text-white shadow-[0_8px_24px_rgba(31,92,67,0.25)] transition-all duration-200 ease-out active:scale-[0.98] disabled:opacity-45"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">send</span>
          {isReplySending ? 'Đang gửi...' : 'Gửi hồi đáp'}
        </button>
      </main>

      {/* Desktop (>=768px): Unified Image 3 Cozy Garden Frame */}
      <div className="hidden md:block">
        {renderMailboxShell(
          <div className="flex min-h-0 flex-1 flex-col md:mx-auto md:w-full md:max-w-2xl">
            <div className="flex items-center justify-between">
              <button
                onClick={back}
                aria-label="Quay lại lá thư"
                className="flex h-[46px] w-[46px] items-center justify-center rounded-full border border-white/70 bg-white/80 text-[#1F5C43] shadow-md backdrop-blur-md transition-all duration-200 ease-out hover:bg-white/95 active:scale-90"
                type="button"
              >
                <span className="material-symbols-outlined text-[22px]">arrow_back</span>
              </button>
              <div className="h-[46px] w-[46px]" />
            </div>

            <section className="my-auto w-full rounded-[28px] bg-white/95 p-7 shadow-[0_18px_48px_rgba(31,92,67,0.16)] backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-[var(--color-border)]/70 pb-3">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-[var(--color-secondary)]">
                  Hồi đáp ẩn danh đến {selectedLetter.alias}
                </p>
                <span className="text-[11px] font-semibold text-[var(--color-text-secondary)] tabular-nums">
                  {replyText.length} / 500
                </span>
              </div>
              <textarea
                id="letter-reply"
                value={replyText}
                onChange={(event) => setReplyText(event.target.value.slice(0, 500))}
                placeholder="Viết lời hồi đáp ấm áp và chân thành của bạn..."
                className="mt-4 min-h-[210px] w-full resize-none bg-transparent text-[15px] leading-7 text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-secondary)]/55"
                autoFocus
              />
            </section>

            <div className="relative z-20 mt-auto rounded-[26px] border border-[#E7E8DE] bg-[#FFF8EF]/95 p-3.5 shadow-[0_10px_28px_rgba(31,92,67,0.10)] backdrop-blur-md">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={back}
                  className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-5 text-[13.5px] font-semibold text-[var(--color-text-primary)] transition hover:bg-[#FFF8EF] active:scale-[0.98]"
                  type="button"
                >
                  <span>Hủy</span>
                </button>
                <button
                  onClick={sendReply}
                  disabled={!replyText.trim() || isReplySending}
                  className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-5 text-[13.5px] font-bold text-white shadow-[0_8px_22px_rgba(31,92,67,0.22)] transition hover:brightness-105 active:scale-[0.98] disabled:opacity-45"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[19px]">send</span>
                  <span>{isReplySending ? 'Đang gửi...' : 'Gửi hồi đáp'}</span>
                </button>
              </div>
            </div>
          </div>,
          true,
          'reply-compose'
        )}
      </div>
    </>
  );

  const renderReplyComplete = () => (
    <>
      <main className="flex min-h-[calc(100vh-33px)] flex-col items-center justify-center px-5 text-center md:hidden">
        <div className="relative">
          <div className="absolute inset-5 rounded-full bg-[var(--color-highlight)]/70 blur-xl" />
          <img
            src="/assets/MindCare_2D_Assets/characters/mochi_happy.png"
            alt="Mochi ôm một lời hồi đáp"
            className="relative h-40 w-40 object-contain [image-rendering:pixelated]"
          />
          <span className="material-symbols-outlined filled absolute right-2 top-5 text-[28px] text-[#E9977D]">
            favorite
          </span>
        </div>
        <h1 className="mt-5 text-[21px] font-bold leading-8 text-[var(--color-primary)]">
          Cảm ơn bạn đã dành thời gian lắng nghe
        </h1>
        <p className="mt-2 max-w-[290px] text-[11px] leading-5 text-[var(--color-text-secondary)]">
          Lời hồi đáp đã được gửi riêng đến người viết thư và không hiển thị công khai.
        </p>
        <button
          onClick={() => {
            setHistory([]);
            setRoute('feed');
            setMailboxTab('inbox');
            setPaperMailboxView('check');
          }}
          className="mt-7 flex min-h-[52px] w-full max-w-[290px] items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-3.5 text-[14px] font-bold text-white shadow-[0_8px_20px_rgba(31,92,67,0.22)] transition-all active:scale-[0.98]"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">drafts</span>
          Về hòm thư
        </button>
      </main>

      <div className="hidden md:block">
        {renderMailboxShell(
          <div className="flex min-h-0 flex-1 flex-col md:mx-auto md:w-full md:max-w-2xl">
            <section className="my-auto rounded-[28px] bg-white/95 p-8 text-center shadow-[0_18px_48px_rgba(31,92,67,0.16)] backdrop-blur-sm">
              <div className="relative mx-auto w-fit">
                <div className="absolute inset-4 rounded-full bg-[var(--color-highlight)]/70 blur-xl" />
                <img
                  src="/assets/MindCare_2D_Assets/characters/mochi_happy.png"
                  alt="Mochi ôm một lời hồi đáp"
                  className="relative h-32 w-32 object-contain [image-rendering:pixelated]"
                />
                <span className="material-symbols-outlined filled absolute right-1 top-3 text-[24px] text-[#E9977D]">
                  favorite
                </span>
              </div>
              <h2 className="mt-4 text-[21px] font-bold leading-8 text-[var(--color-primary)]">
                Cảm ơn bạn đã dành thời gian lắng nghe
              </h2>
              <p className="mx-auto mt-2 max-w-md text-[13.5px] leading-6 text-[var(--color-text-secondary)]">
                Lời hồi đáp đã được gửi riêng đến người viết thư và không hiển thị công khai.
              </p>
            </section>

            <div className="relative z-20 mt-auto rounded-[26px] border border-[#E7E8DE] bg-[#FFF8EF]/95 p-3.5 shadow-[0_10px_28px_rgba(31,92,67,0.10)] backdrop-blur-md">
              <button
                onClick={() => {
                  setHistory([]);
                  setRoute('feed');
                  setMailboxTab('inbox');
                  setPaperMailboxView('check');
                }}
                className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-6 text-[14px] font-bold text-white shadow-[0_8px_22px_rgba(31,92,67,0.22)] transition hover:brightness-105 active:scale-[0.98]"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">drafts</span>
                <span>Về hòm thư</span>
              </button>
            </div>
          </div>,
          true,
          'reply-complete'
        )}
      </div>
    </>
  );

  const renderLetterComposer = () => (
    <>
      {/* Mobile (<768px): preserved unchanged */}
      <main className="relative -mx-4 flex min-h-[calc(100vh-33px)] flex-col overflow-hidden bg-[#FAF7EE] px-4 pb-5 pt-3 md:hidden">
        <img
          src={MOCHI_MAILBOX_GIF}
          alt="Mochi lục tìm thư tình pastel"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="pointer-events-none absolute inset-0 bg-white/35 backdrop-blur-[2px]" />
        <button
          onClick={back}
          aria-label="Quay lại hòm thư"
          className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/85 shadow-md backdrop-blur-md border border-white/60 text-[var(--color-primary)] transition-all duration-200 ease-out active:scale-90 hover:bg-white"
          type="button"
        >
          <span className="material-symbols-outlined text-[24px]">arrow_back</span>
        </button>

        <section className="paper-mail-content relative z-10 my-auto rounded-[28px] bg-white/95 p-5 shadow-[0_18px_48px_rgba(31,92,67,0.18)] backdrop-blur-sm">
          <textarea
            value={postText}
            onChange={(event) => setPostText(event.target.value.slice(0, 1000))}
            placeholder="Viết tâm sự của bạn..."
            className="min-h-[360px] w-full resize-none bg-transparent text-[14px] leading-7 text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-secondary)]/55"
            autoFocus
          />
          <p className="mt-2 text-right text-[11px] text-[var(--color-text-secondary)] tabular-nums">{postText.length} / 1000</p>
        </section>

        <button
          onClick={publishLetter}
          disabled={!postText.trim() || isPublishing}
          className="relative z-10 mt-auto flex min-h-[54px] w-full items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-3.5 text-[15px] font-bold text-white shadow-[0_8px_24px_rgba(31,92,67,0.25)] transition-all duration-200 ease-out active:scale-[0.98] disabled:opacity-45"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">check</span>
          {isPublishing ? 'Đang hoàn thành...' : 'Hoàn thành và thả thư'}
        </button>
      </main>

      {/* Desktop (>=768px): Unified Image 3 Cozy Garden Frame */}
      <div className="hidden md:block">
        {renderMailboxShell(
          <div className="flex min-h-0 flex-1 flex-col md:mx-auto md:w-full md:max-w-2xl">
            <div className="flex items-center justify-between">
              <button
                onClick={back}
                aria-label="Quay lại hòm thư"
                className="flex h-[46px] w-[46px] items-center justify-center rounded-full border border-white/70 bg-white/80 text-[#1F5C43] shadow-md backdrop-blur-md transition-all duration-200 ease-out hover:bg-white/95 active:scale-90"
                type="button"
              >
                <span className="material-symbols-outlined text-[22px]">arrow_back</span>
              </button>
              <div className="h-[46px] w-[46px]" />
            </div>

            <section className="my-auto w-full rounded-[28px] bg-white/95 p-7 shadow-[0_18px_48px_rgba(31,92,67,0.16)] backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-[var(--color-border)]/70 pb-3">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-[var(--color-secondary)]">
                  Tâm sự ẩn danh gửi vào hòm thư chung
                </p>
                <span className="text-[11px] font-semibold text-[var(--color-text-secondary)] tabular-nums">
                  {postText.length} / 1000
                </span>
              </div>
              <textarea
                value={postText}
                onChange={(event) => setPostText(event.target.value.slice(0, 1000))}
                placeholder="Viết ra những điều bạn muốn được lắng nghe..."
                className="mt-4 min-h-[225px] w-full resize-none bg-transparent text-[15px] leading-7 text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-secondary)]/55"
                autoFocus
              />
            </section>

            <div className="relative z-20 mt-auto rounded-[26px] border border-[#E7E8DE] bg-[#FFF8EF]/95 p-3.5 shadow-[0_10px_28px_rgba(31,92,67,0.10)] backdrop-blur-md">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={back}
                  className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-5 text-[13.5px] font-semibold text-[var(--color-text-primary)] transition hover:bg-[#FFF8EF] active:scale-[0.98]"
                  type="button"
                >
                  <span>Hủy</span>
                </button>
                <button
                  onClick={publishLetter}
                  disabled={!postText.trim() || isPublishing}
                  className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-5 text-[13.5px] font-bold text-white shadow-[0_8px_22px_rgba(31,92,67,0.22)] transition hover:brightness-105 active:scale-[0.98] disabled:opacity-45"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[19px]">check</span>
                  <span>{isPublishing ? 'Đang hoàn thành...' : 'Hoàn thành và thả thư'}</span>
                </button>
              </div>
            </div>
          </div>,
          true,
          'anonymous-compose'
        )}
      </div>
    </>
  );

  const renderPostComplete = () => (
    <>
      <main className="flex min-h-[calc(100vh-33px)] flex-col items-center justify-center px-5 text-center md:hidden">
        <div className="relative h-40 w-48">
          <LetterboxArtwork className="h-full w-full" />
        </div>
        <h1 className="mt-4 text-[21px] font-bold leading-8 text-[var(--color-primary)]">
          Lá thư đang chờ duyệt
        </h1>
        <p className="mt-2 max-w-[300px] text-[11px] leading-5 text-[var(--color-text-secondary)]">
          Đội an toàn sẽ xem xét trước khi thư đủ điều kiện vào hòm thư chung. Chưa có người nhận
          nào được xác nhận ở bước này.
        </p>
        <button
          onClick={() => {
            setMailboxTab('mine');
            setPaperMailboxView('mine');
            setHistory([]);
            setRoute('feed');
          }}
          className="mt-7 flex min-h-[52px] w-full max-w-[290px] items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-3.5 text-[14px] font-bold text-white shadow-[0_8px_20px_rgba(31,92,67,0.22)] transition-all active:scale-[0.98]"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">mark_email_read</span>
          Xem thư của tôi
        </button>
        <button
          onClick={onBackHome}
          className="mt-2.5 flex min-h-[48px] w-full max-w-[290px] items-center justify-center gap-2 rounded-full border border-[#B8CCB6] px-6 py-3 text-[13px] font-bold text-[var(--color-primary)] transition-all active:scale-[0.98] hover:bg-[#E7F1DF]"
          type="button"
        >
          Quay lại trang hôm nay
        </button>
      </main>

      <div className="hidden md:block">
        {renderMailboxShell(
          <div className="flex min-h-0 flex-1 flex-col md:mx-auto md:w-full md:max-w-2xl">
            <section className="my-auto rounded-[28px] bg-white/95 p-8 text-center shadow-[0_18px_48px_rgba(31,92,67,0.16)] backdrop-blur-sm">
              <div className="relative mx-auto h-32 w-40">
                <LetterboxArtwork className="h-full w-full" />
              </div>
              <h2 className="mt-3 text-[21px] font-bold leading-8 text-[var(--color-primary)]">
                Lá thư đang chờ duyệt
              </h2>
              <p className="mx-auto mt-2 max-w-md text-[13.5px] leading-6 text-[var(--color-text-secondary)]">
                Đội an toàn sẽ xem xét trước khi thư đủ điều kiện vào hòm thư chung. Chưa có người nhận
                nào được xác nhận ở bước này.
              </p>
            </section>

            <div className="relative z-20 mt-auto rounded-[26px] border border-[#E7E8DE] bg-[#FFF8EF]/95 p-3.5 shadow-[0_10px_28px_rgba(31,92,67,0.10)] backdrop-blur-md">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setPaperMailboxView('check');
                    setHistory([]);
                    setRoute('feed');
                  }}
                  className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-5 text-[13.5px] font-semibold text-[var(--color-text-primary)] transition hover:bg-[#FFF8EF] active:scale-[0.98]"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[19px] text-[#1F5C43]">mail</span>
                  <span>Về hòm thư</span>
                </button>
                <button
                  onClick={() => {
                    setMailboxTab('mine');
                    setPaperMailboxView('mine');
                    setHistory([]);
                    setRoute('feed');
                  }}
                  className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-5 text-[13.5px] font-bold text-white shadow-[0_8px_22px_rgba(31,92,67,0.22)] transition hover:brightness-105 active:scale-[0.98]"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[19px]">mark_email_read</span>
                  <span>Xem thư của tôi</span>
                </button>
              </div>
            </div>
          </div>,
          true,
          'post-complete'
        )}
      </div>
    </>
  );

  const renderRecipients = () => (
    <>
      <Header title="Gửi tâm sự riêng" onBack={back} />
      <main className="space-y-4 pb-24 pt-4 md:mx-auto md:max-w-3xl md:pb-10 md:pt-6">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-[var(--color-text-secondary)]">
            search
          </span>
          <input
            value={recipientSearch}
            onChange={(event) => setRecipientSearch(event.target.value)}
            placeholder="Tìm người đã kết nối..."
            className="min-h-11 w-full rounded-full border border-[var(--color-border)] bg-white pl-10 pr-4 text-[11px] outline-none focus:border-[var(--color-secondary)] md:text-[13px]"
          />
        </div>
        <div className="rounded-2xl border border-[var(--color-highlight)] bg-[var(--color-chart-background)] p-3 md:p-4">
          <p className="text-[9.5px] leading-4 text-[var(--color-text-secondary)] md:text-[12px] md:leading-5">
            Chỉ hiển thị người đã kết nối và đồng ý nhận lời nhắn. Không hỗ trợ gửi tin ẩn danh
            cho người lạ.
          </p>
        </div>
        <section>
          <h2 className="mb-2 text-[11px] font-bold text-[var(--color-primary)] md:text-[13px]">
            Người đã đồng ý nhận lời nhắn
          </h2>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-3">
            {confirmedContacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`flex min-h-[68px] w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                  selectedContact?.id === contact.id
                    ? 'border-[var(--color-secondary)] bg-[var(--color-surface-mint)]'
                    : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-secondary)]/50'
                }`}
                type="button"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-highlight)] text-[13px] font-bold text-[var(--color-primary)]">
                  {contact.avatarLetter}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-bold text-[var(--color-text-primary)] md:text-[14px]">{contact.name}</p>
                  <p className="text-[9.5px] text-[var(--color-text-secondary)] md:text-[11.5px]">{contact.relationship} · Đã đồng ý</p>
                </div>
                <span className="material-symbols-outlined text-[20px] text-[var(--color-secondary)]">
                  {selectedContact?.id === contact.id ? 'check_circle' : 'circle'}
                </span>
              </button>
            ))}
          </div>
          {confirmedContacts.length === 0 && (
            <div className="rounded-[22px] border border-dashed border-[var(--color-border)] p-6 text-center">
              <span className="material-symbols-outlined text-[28px] text-[var(--color-secondary)]">person_search</span>
              <p className="mt-2 text-[11px] font-bold text-[var(--color-primary)]">Không tìm thấy người phù hợp</p>
            </div>
          )}
        </section>
      </main>
      <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-[420px] -translate-x-1/2 border-t border-[var(--color-border)] bg-[var(--color-background)]/95 px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:sticky md:bottom-4 md:left-auto md:mx-auto md:max-w-3xl md:translate-x-0 md:rounded-2xl md:border md:p-3.5 md:shadow-[0_8px_28px_rgba(31,92,67,0.08)]">
        <button
          onClick={() => {
            setPrivateText('');
            go('private-compose');
          }}
          disabled={!selectedContact}
          className="min-h-12 w-full rounded-full bg-[var(--color-primary)] text-[12px] font-bold text-white disabled:bg-[var(--color-text-secondary)] md:text-[14px]"
          type="button"
        >
          Tiếp tục
        </button>
      </div>
    </>
  );

  const renderPrivateComposer = () => (
    <>
      <Header title="Viết lời nhắn" onBack={back} />
      <main className="space-y-4 pb-24 pt-4 md:mx-auto md:max-w-3xl md:pb-10 md:pt-6">
        <div className="flex items-center gap-3 rounded-2xl border border-[var(--color-highlight)] bg-[var(--color-chart-background)] p-3 md:p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-highlight)] text-[12px] font-bold text-[var(--color-primary)]">
            {selectedContact?.avatarLetter}
          </div>
          <div>
            <p className="text-[9px] text-[var(--color-text-secondary)] md:text-[11px]">Gửi đến</p>
            <p className="text-[12px] font-bold text-[var(--color-primary)] md:text-[14px]">{selectedContact?.name}</p>
          </div>
        </div>
        <div className="rounded-[20px] border border-[var(--color-border)] bg-white p-3 focus-within:border-[var(--color-secondary)] md:p-5">
          <textarea
            value={privateText}
            onChange={(event) => setPrivateText(event.target.value.slice(0, 500))}
            placeholder={`Viết lời nhắn cho ${selectedContact?.name || 'người bạn tin tưởng'}...`}
            className="min-h-56 w-full resize-none text-[13px] leading-6 outline-none placeholder:text-[#A0AAA3] md:min-h-64 md:text-[14.5px] md:leading-7"
          />
          <p className="text-right text-[9px] text-[var(--color-text-secondary)] tabular-nums md:text-[11px]">{privateText.length} / 500</p>
        </div>
        <div className="rounded-2xl border border-[#F0E0C9] bg-[#FFF7E8] p-3 text-[9.5px] leading-4 text-[#796A57] md:p-4 md:text-[12px] md:leading-5">
          Lời nhắn chỉ hiển thị cho {selectedContact?.name}. Nội dung không bao giờ được đăng lên
          cộng đồng hoặc lấy tự động từ nhật ký riêng tư.
        </div>
      </main>
      <div className="fixed bottom-0 left-1/2 z-30 grid w-full max-w-[420px] -translate-x-1/2 grid-cols-[1fr_1.6fr] gap-2 border-t border-[var(--color-border)] bg-[var(--color-background)]/95 px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:sticky md:bottom-4 md:left-auto md:mx-auto md:max-w-3xl md:translate-x-0 md:rounded-2xl md:border md:p-3.5 md:shadow-[0_8px_28px_rgba(31,92,67,0.08)]">
        <button onClick={back} className="min-h-12 rounded-full border border-[var(--color-border)] text-[11px] font-bold text-[var(--color-text-secondary)] md:text-[13px]" type="button">
          Hủy
        </button>
        <button
          onClick={() => setShowSendConfirm(true)}
          disabled={!privateText.trim()}
          className="min-h-12 rounded-full bg-[var(--color-primary)] text-[11px] font-bold text-white disabled:bg-[var(--color-text-secondary)] md:text-[13px]"
          type="button"
        >
          Xem lại và gửi
        </button>
      </div>
    </>
  );

  const renderConversation = () => {
    const submitConversationMsg = () => {
      if (!conversationText.trim() || !receivingMessages) return;
      setMessages((current) => [
        ...current,
        {
          id: `message-${Date.now()}`,
          sender: 'me',
          text: conversationText.trim(),
          time: new Intl.DateTimeFormat('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }).format(new Date()),
        },
      ]);
      setConversationText('');
    };

    return (
      <>
        <Header
          title={selectedContact?.name || 'Cuộc trò chuyện'}
          onBack={back}
          action={
            <button
              onClick={() => setShowConversationMenu(true)}
              aria-label="Tùy chọn cuộc trò chuyện"
              className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--color-text-secondary)] hover:bg-[var(--color-chart-background)]"
              type="button"
            >
              <span className="material-symbols-outlined text-[19px]">more_vert</span>
            </button>
          }
        />
        <main className="space-y-3 pb-24 pt-4 md:mx-auto md:min-h-[calc(100vh-170px)] md:max-w-3xl md:pb-8 md:pt-6">
          <div className="mx-auto w-fit rounded-full bg-[var(--color-chart-background)] px-3 py-1.5 text-[9px] font-semibold text-[var(--color-text-secondary)] md:text-[11px]">
            Cuộc trò chuyện riêng tư · dữ liệu minh họa
          </div>
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`relative max-w-[82%] rounded-[20px] px-3.5 py-2.5 md:max-w-[70%] md:px-4 md:py-3 ${
                  message.sender === 'me'
                    ? 'rounded-br-md bg-[var(--color-highlight)]'
                    : 'rounded-bl-md border border-[var(--color-border)] bg-white'
                }`}
              >
                {message.unread && (
                  <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[#E78A45] ring-2 ring-[var(--color-background)]" />
                )}
                <p className="mb-0.5 text-[8.5px] font-bold text-[var(--color-text-secondary)] md:text-[10.5px]">
                  {message.sender === 'me' ? 'Bạn' : selectedContact?.name || 'Người nhận'}
                </p>
                <p className="text-[11.5px] leading-5 md:text-[14px] md:leading-6">{message.text}</p>
                <p className="mt-1 text-right text-[8px] text-[var(--color-text-secondary)] md:text-[10px]">{message.time}</p>
              </div>
            </div>
          ))}
          {!receivingMessages && (
            <div className="rounded-2xl bg-[#FFF8EF] p-3 text-center text-[10px] text-[#796A57] md:text-[12px]">
              Bạn đã dừng nhận lời nhắn trong cuộc trò chuyện này.
            </div>
          )}
        </main>
        <div className="fixed bottom-0 left-1/2 z-30 flex w-full max-w-[420px] -translate-x-1/2 items-center gap-2 border-t border-[var(--color-border)] bg-[var(--color-background)]/95 px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:sticky md:bottom-4 md:left-auto md:mx-auto md:max-w-3xl md:translate-x-0 md:rounded-2xl md:border md:p-3 md:shadow-[0_8px_28px_rgba(31,92,67,0.08)]">
          <input
            value={conversationText}
            onChange={(event) => setConversationText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                submitConversationMsg();
              }
            }}
            disabled={!receivingMessages}
            placeholder={receivingMessages ? `Nhắn cho ${selectedContact?.name || 'người nhận'}...` : 'Đã dừng nhận lời nhắn'}
            className="min-h-11 flex-1 rounded-full border border-[var(--color-border)] bg-white px-4 text-[11px] outline-none disabled:bg-[#F1F0EB] md:text-[13px]"
          />
          <button
            onClick={submitConversationMsg}
            disabled={!conversationText.trim() || !receivingMessages}
            aria-label="Gửi tin nhắn"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-primary)] text-white disabled:bg-[var(--color-text-secondary)]"
            type="button"
          >
            <span className="material-symbols-outlined text-[19px]">send</span>
          </button>
        </div>
      </>
    );
  };

  const renderMessageComplete = () => (
    <main className="flex min-h-[calc(100vh-33px)] flex-col items-center justify-center px-5 text-center md:mx-auto md:max-w-xl md:min-h-[80vh]">
      <img
        src="/assets/MindCare_2D_Assets/items/item_gift.png"
        alt=""
        className="h-36 w-36 object-contain [image-rendering:pixelated]"
      />
      <h1 className="mt-5 text-[21px] font-bold text-[var(--color-primary)]">Lời nhắn đã được gửi</h1>
      <p className="mt-2 max-w-[290px] text-[11px] leading-5 text-[var(--color-text-secondary)]">
        {selectedContact?.name || 'Người nhận'} sẽ thấy lời nhắn trong cuộc trò chuyện riêng.
      </p>
      <button
        onClick={() => {
          setHistory([]);
          setRoute('conversation');
        }}
        className="mt-7 min-h-12 w-full max-w-[290px] rounded-full bg-[var(--color-primary)] text-[12px] font-bold text-white"
        type="button"
      >
        Về cuộc trò chuyện
      </button>
    </main>
  );

  return (
    <div className="relative min-h-[calc(100vh-33px)] flex-1 bg-[var(--color-background)] md:bg-[#FAF7EE] px-4 md:min-h-screen md:px-6 lg:px-8 text-[var(--color-text-primary)] overflow-x-clip">
      {/* Subtle Desktop Cozy Garden Corner Botanical Silhouettes */}
      <svg
        className="pointer-events-none fixed bottom-0 left-0 z-0 hidden h-28 w-40 opacity-55 md:block"
        viewBox="0 0 180 120"
        fill="none"
        aria-hidden="true"
      >
        <ellipse cx="32" cy="112" rx="48" ry="26" fill="#CFE4B4" />
        <ellipse cx="94" cy="118" rx="44" ry="20" fill="#DFEECC" />
        <path d="M18 96C40 78 72 86 84 114C56 116 32 108 18 96Z" fill="#B5D692" />
      </svg>
      <svg
        className="pointer-events-none fixed bottom-0 right-0 z-0 hidden h-28 w-44 opacity-55 md:block"
        viewBox="0 0 180 120"
        fill="none"
        aria-hidden="true"
      >
        <ellipse cx="148" cy="112" rx="48" ry="26" fill="#CFE4B4" />
        <ellipse cx="88" cy="118" rx="42" ry="20" fill="#DFEECC" />
        <path d="M162 92C136 74 106 84 96 114C124 116 148 106 162 92Z" fill="#B5D692" />
      </svg>

      {(route === 'feed' || route === 'letter-transition') && renderMailbox()}
      {route === 'letter-transition' && renderTransition()}
      {route === 'letter-read' && renderLetterRead()}
      {route === 'reply-compose' && renderReplyComposer()}
      {route === 'reply-complete' && renderReplyComplete()}
      {route === 'anonymous-compose' && renderLetterComposer()}
      {route === 'post-complete' && renderPostComplete()}
      {route === 'recipients' && renderRecipients()}
      {route === 'private-compose' && renderPrivateComposer()}
      {route === 'conversation' && renderConversation()}
      {route === 'message-complete' && renderMessageComplete()}

      {toast && (
        <div
          className="fixed bottom-20 left-1/2 z-[70] w-[calc(100%-32px)] max-w-[388px] -translate-x-1/2 rounded-2xl bg-[var(--color-text-primary)] px-4 py-3 text-center text-[10.5px] font-semibold text-white shadow-xl"
          role="status"
        >
          {toast}
        </div>
      )}

      {showMailboxInfo && (
        <>
          <button onClick={() => setShowMailboxInfo(false)} aria-label="Đóng thông tin" className="fixed inset-0 z-50 bg-[var(--color-text-primary)]/20" type="button" />
          <section className="fixed bottom-0 left-1/2 z-[51] w-full max-w-[420px] -translate-x-1/2 rounded-t-[26px] bg-[var(--color-surface)] p-4 shadow-2xl md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:max-w-md md:rounded-[26px] md:p-6">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[var(--color-border)] md:hidden" />
            <h2 className="text-[14px] font-bold text-[var(--color-primary)] md:text-[16px]">Hòm thư hoạt động thế nào?</h2>
            <p className="mt-2 text-[10px] leading-5 text-[var(--color-text-secondary)] md:text-[13px] md:leading-6">
              Thư ẩn danh đi vào một hòm thư chung có kiểm duyệt, không gửi hàng loạt đến mọi
              người. Người đọc có thể mở, bỏ qua, ẩn hoặc hồi đáp riêng. Tên thật được ẩn với
              cộng đồng nhưng không tuyệt đối ẩn với hệ thống an toàn.
            </p>
            <button onClick={() => setShowMailboxInfo(false)} className="mt-4 min-h-11 w-full rounded-full border border-[#B8CCB6] text-[11px] font-bold text-[var(--color-primary)] md:text-[13px]" type="button">
              Đã hiểu
            </button>
          </section>
        </>
      )}

      {showLetterMenu && (
        <>
          <button onClick={() => setShowLetterMenu(false)} aria-label="Đóng tùy chọn thư" className="fixed inset-0 z-50 bg-[var(--color-text-primary)]/20" type="button" />
          <section className="fixed bottom-0 left-1/2 z-[51] w-full max-w-[420px] -translate-x-1/2 rounded-t-[26px] bg-[var(--color-surface)] p-4 shadow-2xl md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:max-w-md md:rounded-[26px] md:p-6">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[var(--color-border)] md:hidden" />
            <h2 className="mb-3 text-[14px] font-bold text-[var(--color-primary)] md:text-[16px]">Tùy chọn lá thư</h2>
            {selectedLetter.isOwn ? (
              <>
                <button
                  onClick={() => {
                    setLetters((current) =>
                      current.map((letter) =>
                        letter.id === selectedLetter.id
                          ? { ...letter, repliesAllowed: !letter.repliesAllowed }
                          : letter
                      )
                    );
                    setSelectedLetter((letter) => ({ ...letter, repliesAllowed: !letter.repliesAllowed }));
                    setShowLetterMenu(false);
                  }}
                  className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-[11px] font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-chart-background)]"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[19px]">comments_disabled</span>
                  {selectedLetter.repliesAllowed ? 'Tắt hồi đáp' : 'Bật lại hồi đáp'}
                </button>
                <button
                  onClick={() => {
                    setLetters((current) => current.filter((letter) => letter.id !== selectedLetter.id));
                    setShowLetterMenu(false);
                    setMailboxTab('mine');
                    setPaperMailboxView('mine');
                    setHistory([]);
                    setRoute('feed');
                  }}
                  className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-[11px] font-semibold text-[#A64D42] hover:bg-[#FFF0EA]"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[19px]">delete</span>
                  Xóa thư
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setHiddenLetterIds((current) => [...current, selectedLetter.id]);
                    setShowLetterMenu(false);
                    setHistory([]);
                    setRoute('feed');
                    showToast('Đã ẩn lá thư khỏi hòm thư của bạn.');
                  }}
                  className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-[11px] font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-chart-background)]"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[19px]">visibility_off</span>
                  Ẩn lá thư
                </button>
                <button onClick={() => { setShowLetterMenu(false); showToast('Đã mở quy trình báo cáo an toàn.'); }} className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-[11px] font-semibold text-[#A64D42] hover:bg-[#FFF0EA]" type="button">
                  <span className="material-symbols-outlined text-[19px]">flag</span>
                  Báo cáo thư
                </button>
                <button onClick={() => { setShowLetterMenu(false); showToast(`Bạn sẽ không nhận thêm thư chủ đề ${selectedLetter.topic}.`); }} className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-[11px] font-semibold text-[#A64D42] hover:bg-[#FFF0EA]" type="button">
                  <span className="material-symbols-outlined text-[19px]">do_not_disturb_on</span>
                  Không nhận thư từ chủ đề này
                </button>
              </>
            )}
          </section>
        </>
      )}

      {showConversationMenu && (
        <>
          <button onClick={() => setShowConversationMenu(false)} aria-label="Đóng tùy chọn cuộc trò chuyện" className="fixed inset-0 z-50 bg-[var(--color-text-primary)]/20" type="button" />
          <section className="fixed bottom-0 left-1/2 z-[51] w-full max-w-[420px] -translate-x-1/2 rounded-t-[26px] bg-[var(--color-surface)] p-4 shadow-2xl md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:max-w-md md:rounded-[26px] md:p-6">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[var(--color-border)] md:hidden" />
            <h2 className="mb-3 text-[14px] font-bold text-[var(--color-primary)] md:text-[16px]">Quyền kiểm soát cuộc trò chuyện</h2>
            {[
              { icon: 'notifications_off', label: receivingMessages ? 'Dừng nhận lời nhắn' : 'Cho phép nhận lại' },
              { icon: 'block', label: 'Chặn người này' },
              { icon: 'flag', label: 'Báo cáo cuộc trò chuyện' },
            ].map((item, index) => (
              <button
                key={item.label}
                onClick={() => {
                  if (index === 0) setReceivingMessages((current) => !current);
                  setShowConversationMenu(false);
                  showToast(index === 0 ? 'Đã cập nhật quyền nhận lời nhắn.' : 'Đã mở quy trình an toàn.');
                }}
                className={`flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-[11px] font-semibold ${
                  index > 0 ? 'text-[#A64D42] hover:bg-[#FFF0EA]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-chart-background)]'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[19px]">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </section>
        </>
      )}

      {showSendConfirm && (
        <>
          <div className="fixed inset-0 z-50 bg-[var(--color-text-primary)]/25 backdrop-blur-[1px]" />
          <section role="dialog" aria-modal="true" aria-label="Xác nhận gửi lời nhắn riêng" className="fixed left-1/2 top-1/2 z-[51] w-[calc(100%-32px)] max-w-[370px] -translate-x-1/2 -translate-y-1/2 rounded-[24px] bg-[var(--color-surface)] p-5 shadow-2xl">
            <h2 className="text-[15px] font-bold text-[var(--color-primary)]">Gửi lời nhắn cho {selectedContact?.name}?</h2>
            <div className="mt-3 max-h-28 overflow-y-auto rounded-2xl bg-[var(--color-chart-background)] p-3 text-[10.5px] leading-5 text-[var(--color-text-secondary)]">{privateText}</div>
            <p className="mt-3 text-[9.5px] leading-4 text-[var(--color-text-secondary)]">
              Đây là lời nhắn riêng, không được đăng lên cộng đồng.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button onClick={() => setShowSendConfirm(false)} disabled={isSending} className="min-h-11 rounded-full border border-[var(--color-border)] text-[11px] font-bold text-[var(--color-text-secondary)]" type="button">
                Sửa lại
              </button>
              <button onClick={sendPrivateMessage} disabled={isSending} className="min-h-11 rounded-full bg-[var(--color-primary)] text-[11px] font-bold text-white" type="button">
                {isSending ? 'Đang gửi...' : 'Xác nhận gửi'}
              </button>
            </div>
          </section>
        </>
      )}
    </div>
  );
};
