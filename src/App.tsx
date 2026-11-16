import React, { useState, useEffect } from 'react';
import {
  MainTab,
  SubScreen,
  CheckIn,
  JournalEntry,
  TrustedContact,
  DailyHabit,
  ChatMessage,
} from './types';
import {
  INITIAL_CHECKINS,
  INITIAL_JOURNAL_ENTRIES,
  INITIAL_CONTACTS,
  INITIAL_HABITS,
  INITIAL_CHAT_MESSAGES,
} from './data/mockData';
import { TopStatusBar } from './components/TopStatusBar';
import { BottomNavigation } from './components/BottomNavigation';
import { HomeScreen } from './components/HomeScreen';
import { JournalScreen } from './components/JournalScreen';
import { JournalEditorScreen } from './components/JournalEditorScreen';
import { MindCareAIScreen } from './components/MindCareAIScreen';
import { StatsScreen } from './components/StatsScreen';
import { CheckInModal } from './components/CheckInModal';
import { BreathingExerciseScreen } from './components/BreathingExerciseScreen';
import { SelfCareScreen } from './components/SelfCareScreen';
import { TrustedContactsScreen } from './components/TrustedContactsScreen';
import { AddContactScreen } from './components/AddContactScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { OnboardingScreen } from './components/OnboardingScreen';
import { ScreenSwitcherDrawer } from './components/ScreenSwitcherDrawer';
import { StreakDetailsScreen } from './components/StreakDetailsScreen';
import { ExerciseDetailScreen } from './components/ExerciseDetailScreen';
import { WellnessExerciseId } from './data/wellnessExercises';
import { localDateKey } from './utils/journalStats';
import {
  SharingEntryRoute,
  SharingFlowScreen,
} from './components/SharingFlowScreen';
import { JournalGalleryScreen } from './components/JournalGalleryScreen';
import { JournalPhotoDetailScreen } from './components/JournalPhotoDetailScreen';
import { GalleryJournalEntryScreen } from './components/GalleryJournalEntryScreen';
import { buildGalleryPhotos } from './data/journalGallery';
import { DesktopSidebar } from './components/DesktopSidebar';
import { getJournalStats } from './utils/journalStats';

export default function App() {
  const [activeTab, setActiveTab] = useState<MainTab>('home');
  const [subScreen, setSubScreen] = useState<SubScreen>(null);

  // Persistent States
  const [checkIns, setCheckIns] = useState<CheckIn[]>(() => {
    const saved = localStorage.getItem('mindcare_checkins');
    return saved ? JSON.parse(saved) : INITIAL_CHECKINS;
  });

  const [journals, setJournals] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem('mindcare_journals');
    return saved ? JSON.parse(saved) : INITIAL_JOURNAL_ENTRIES;
  });

  const [contacts, setContacts] = useState<TrustedContact[]>(() => {
    const saved = localStorage.getItem('mindcare_contacts');
    return saved ? JSON.parse(saved) : INITIAL_CONTACTS;
  });

  const [habits, setHabits] = useState<DailyHabit[]>(() => {
    const saved = localStorage.getItem('mindcare_habits');
    return saved ? JSON.parse(saved) : INITIAL_HABITS;
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('mindcare_chat');
    return saved ? JSON.parse(saved) : INITIAL_CHAT_MESSAGES;
  });

  const [editingJournal, setEditingJournal] = useState<JournalEntry | null>(null);
  const [activeExerciseId, setActiveExerciseId] = useState<WellnessExerciseId>('gratitude');
  const [completedExerciseIds, setCompletedExerciseIds] = useState<WellnessExerciseId[]>(() => {
    const saved = localStorage.getItem('mindcare_completed_exercises');
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return parsed?.date === localDateKey(new Date()) ? parsed.ids || [] : [];
  });
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [homeScrollPosition, setHomeScrollPosition] = useState(0);
  const [startedExerciseIds, setStartedExerciseIds] = useState<WellnessExerciseId[]>([]);
  const [sharingEntryRoute, setSharingEntryRoute] = useState<SharingEntryRoute>('feed');
  const [selectedGalleryIndex, setSelectedGalleryIndex] = useState(0);
  const [journalScrollPosition, setJournalScrollPosition] = useState(0);
  const [galleryScrollPosition, setGalleryScrollPosition] = useState(0);
  const [galleryFavoriteIds, setGalleryFavoriteIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('mindcare_gallery_favorites');
    return saved
      ? JSON.parse(saved)
      : buildGalleryPhotos(journals)
          .filter((photo) => photo.favoriteByDefault)
          .map((photo) => photo.id);
  });
  const [galleryNotes, setGalleryNotes] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('mindcare_gallery_notes');
    return saved ? JSON.parse(saved) : {};
  });
  const galleryPhotos = buildGalleryPhotos(journals);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('mindcare_checkins', JSON.stringify(checkIns));
  }, [checkIns]);

  useEffect(() => {
    localStorage.setItem('mindcare_journals', JSON.stringify(journals));
  }, [journals]);

  useEffect(() => {
    localStorage.setItem('mindcare_contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('mindcare_habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('mindcare_chat', JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem(
      'mindcare_completed_exercises',
      JSON.stringify({ date: localDateKey(new Date()), ids: completedExerciseIds })
    );
  }, [completedExerciseIds]);

  useEffect(() => {
    localStorage.setItem('mindcare_gallery_favorites', JSON.stringify(galleryFavoriteIds));
  }, [galleryFavoriteIds]);

  useEffect(() => {
    localStorage.setItem('mindcare_gallery_notes', JSON.stringify(galleryNotes));
  }, [galleryNotes]);

  const latestCheckIn = checkIns[0] || INITIAL_CHECKINS[0];

  // Actions
  const handleSaveCheckIn = (newCheckIn: CheckIn, targetTab?: 'home' | 'journal') => {
    setCheckIns((prev) => [newCheckIn, ...prev.filter((c) => c.id !== newCheckIn.id)]);
    
    // If user wrote a personal note during check-in, sync it as a journal entry
    if (newCheckIn.note && newCheckIn.note.trim()) {
      const now = new Date();
      const newEntry: JournalEntry = {
        id: 'j-' + Date.now(),
        date: `Chủ nhật, ${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`,
        dayLabel: 'Chủ nhật',
        time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
        title: `Ghi chép tâm trạng: ${newCheckIn.moodLabel}`,
        content: newCheckIn.note,
        tag: newCheckIn.moodLabel,
        moodScore: newCheckIn.mood,
        aiEstimateLabel: newCheckIn.moodLabel,
        aiEstimateScore: newCheckIn.mood,
        aiBarWidth: Math.min(100, newCheckIn.mood * 10),
        isEncrypted: true,
        allowAiRef: newCheckIn.allowAiPersonalize,
        createdAt: Date.now(),
      };
      setJournals((prev) => [newEntry, ...prev]);
    }

    setSubScreen(null);
    if (targetTab === 'journal') {
      setActiveTab('journal');
    } else {
      setActiveTab('home');
    }
  };

  const handleSaveJournal = (journalData: Partial<JournalEntry>) => {
    if (editingJournal) {
      setJournals((prev) =>
        prev.map((j) => (j.id === editingJournal.id ? { ...j, ...journalData } as JournalEntry : j))
      );
    } else {
      const now = new Date();
      const newEntry: JournalEntry = {
        id: 'j-' + Date.now(),
        date: `Chủ nhật, ${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`,
        dayLabel: 'Chủ nhật',
        time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
        title: journalData.title || 'Nhật ký cá nhân',
        content: journalData.content || '',
        tag: journalData.tag || 'Nhẹ nhõm',
        moodScore: journalData.moodScore || 6,
        aiEstimateLabel: journalData.aiEstimateLabel || 'Tích cực nhẹ',
        aiEstimateScore: journalData.aiEstimateScore || 6,
        aiBarWidth: journalData.aiBarWidth || 62,
        isEncrypted: true,
        allowAiRef: journalData.allowAiRef || false,
        createdAt: Date.now(),
      };
      setJournals((prev) => [newEntry, ...prev]);
    }
    setEditingJournal(null);
    setSubScreen(null);
    setActiveTab('journal');
  };

  const handleToggleHabit = (id: string) => {
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, completed: !h.completed } : h))
    );
  };

  const handleAddHabit = (title: string) => {
    setHabits((prev) => [...prev, { id: 'h-' + Date.now(), title, completed: false }]);
  };

  const handleSaveContact = (contact: TrustedContact) => {
    setContacts((prev) => [...prev, contact]);
    setSubScreen('contacts');
  };

  const handleSendMessage = (text: string) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const userMsg: ChatMessage = {
      id: 'm-' + Date.now(),
      sender: 'user',
      text,
      time: timeStr,
    };

    setChatMessages((prev) => [...prev, userMsg]);

    // Generate supportive empathetic student response
    setTimeout(() => {
      let replyText = 'Mình luôn ở đây lắng nghe bạn. Bạn đang làm rất tốt trong hành trình học tập và hoàn thiện bản thân.';
      const lower = text.toLowerCase();

      if (lower.includes('thở') || lower.includes('4-7-8')) {
        replyText = 'Kỹ thuật thở 4-7-8 giúp kích hoạt hệ thần kinh phó giao cảm, làm giảm nhịp tim và ổn định tinh thần. Bạn có thể bấm vào nút Hướng dẫn thở 4-7-8 bên dưới để bắt đầu ngay 2 phút nhé.';
      } else if (lower.includes('áp lực') || lower.includes('deadline') || lower.includes('đồ án') || lower.includes('thi')) {
        replyText = 'Khi đối diện với hạn nộp và đồ án dồn dập, cảm giác choáng ngợp là hoàn toàn tự nhiên. Một cách hiệu quả là hãy chọn ra chỉ 1 phần nhỏ nhất cần làm trong 25 phút tới, sau đó tự thưởng cho mình một cốc nước ấm hoặc 5 phút vươn vai nhé.';
      } else if (lower.includes('ngủ') || lower.includes('mệt') || lower.includes('thức khuya')) {
        replyText = 'Giấc ngủ là chiếc phao cứu sinh lớn nhất cho trí nhớ và cảm xúc sinh viên. Đêm nay hãy thử tắt màn hình trước 23:00 và nghe tiếng mưa nhẹ cùng MindCare xem sao nhé.';
      } else if (lower.includes('stress') || lower.includes('cảm xúc')) {
        replyText = `Tuần này mức stress của bạn duy trì quanh ${latestCheckIn.stress}/10, có xu hướng giảm nhẹ khi bạn duy trì giấc ngủ đủ. Hãy tiếp tục lắng nghe cơ thể mình nhé.`;
      }

      const aiMsg: ChatMessage = {
        id: 'm-' + (Date.now() + 1),
        sender: 'assistant',
        text: replyText,
        time: timeStr,
      };

      setChatMessages((prev) => [...prev, aiMsg]);
    }, 600);
  };

  const [isAiChatActive, setIsAiChatActive] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 768 && window.innerWidth < 1024 : false
  );
  const currentJournalStreak = getJournalStats(journals).currentStreak;

  const openHomeDetail = (screen: 'streak_details' | 'exercise_details' | 'sharing') => {
    setHomeScrollPosition(window.scrollY);
    setSubScreen(screen);
  };

  const returnToHomeFeed = () => {
    setSubScreen(null);
    setActiveTab('home');
    requestAnimationFrame(() => window.scrollTo({ top: homeScrollPosition }));
  };

  const completeWellnessExercise = (id: WellnessExerciseId) => {
    setCompletedExerciseIds((current) =>
      current.includes(id) ? current : [...current, id]
    );
  };

  const returnToJournal = () => {
    setSubScreen(null);
    setActiveTab('journal');
    requestAnimationFrame(() => window.scrollTo({ top: journalScrollPosition }));
  };

  const returnToGallery = () => {
    setSubScreen('journal_gallery');
    requestAnimationFrame(() => window.scrollTo({ top: galleryScrollPosition }));
  };

  // Determine whether to show bottom navigation
  // Suppressed on immersive tasks: checkin, breathing, journal_edit, add_contact, onboarding, or active AI chat
  const hideBottomNav =
    subScreen === 'checkin' ||
    subScreen === 'breathing' ||
    subScreen === 'journal_edit' ||
    subScreen === 'add_contact' ||
    subScreen === 'onboarding' ||
    subScreen === 'streak_details' ||
    subScreen === 'exercise_details' ||
    subScreen === 'sharing' ||
    subScreen === 'journal_gallery' ||
    subScreen === 'journal_photo' ||
    subScreen === 'gallery_journal' ||
    (activeTab === 'ai' && isAiChatActive);

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex justify-center items-start text-text-primary selection:bg-surface-mint selection:text-primary md:justify-start md:w-full">
      {/* 12-Screen Quick Inspection Drawer */}
      <ScreenSwitcherDrawer
        currentTab={activeTab}
        currentSub={subScreen}
        onSelectScreen={(tab, sub) => {
          setActiveTab(tab);
          setSubScreen(sub);
          setIsAiChatActive(false);
        }}
      />

      {/* Desktop & Tablet Left Sidebar Navigation */}
      <DesktopSidebar
        activeTab={activeTab}
        subScreen={subScreen}
        currentStreak={currentJournalStreak}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setSubScreen(null);
          setIsAiChatActive(false);
          setShowQuickActions(false);
        }}
        onOpenSubScreen={(sub) => {
          if (sub === 'sharing') setSharingEntryRoute('feed');
          setSubScreen(sub);
          setShowQuickActions(false);
        }}
        onQuickAdd={() => setShowQuickActions(true)}
      />

      {/* Responsive Container: Mobile preserves 420px phone ratio, Tablet/Desktop expands cleanly */}
      <main className="w-full max-w-[420px] min-h-screen bg-[var(--color-background)] flex flex-col relative shadow-2xl border-x border-[var(--color-border)] overflow-x-clip md:max-w-none md:flex-1 md:min-w-0 md:shadow-none md:border-x-0">
        {/* Status bar (Mobile only) */}
        <TopStatusBar />

        {/* Dynamic Screen Routing */}
        {subScreen === 'onboarding' ? (
          <OnboardingScreen onStart={() => setSubScreen(null)} />
        ) : subScreen === 'checkin' ? (
          <CheckInModal
            initialCheckIn={latestCheckIn}
            onSave={handleSaveCheckIn}
            onClose={() => setSubScreen(null)}
          />
        ) : subScreen === 'breathing' ? (
          <BreathingExerciseScreen
            onComplete={() => {
              setSubScreen(null);
              setActiveTab('home');
            }}
            onClose={() => setSubScreen(null)}
          />
        ) : subScreen === 'journal_edit' ? (
          <JournalEditorScreen
            initialEntry={editingJournal}
            onSave={handleSaveJournal}
            onClose={() => {
              setEditingJournal(null);
              setSubScreen(null);
            }}
          />
        ) : subScreen === 'streak_details' ? (
          <StreakDetailsScreen journals={journals} onBack={returnToHomeFeed} />
        ) : subScreen === 'exercise_details' ? (
          <ExerciseDetailScreen
            exerciseId={activeExerciseId}
            isCompleted={completedExerciseIds.includes(activeExerciseId)}
            onComplete={completeWellnessExercise}
            onBack={returnToHomeFeed}
          />
        ) : subScreen === 'sharing' ? (
          <SharingFlowScreen
            initialRoute={sharingEntryRoute}
            contacts={contacts}
            onBackHome={returnToHomeFeed}
          />
        ) : subScreen === 'journal_gallery' ? (
          <JournalGalleryScreen
            photos={galleryPhotos}
            favoriteIds={galleryFavoriteIds}
            onToggleFavorite={(id) =>
              setGalleryFavoriteIds((current) =>
                current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
              )
            }
            onBack={returnToJournal}
            onOpenPhoto={(index) => {
              setGalleryScrollPosition(window.scrollY);
              setSelectedGalleryIndex(index);
              setSubScreen('journal_photo');
              window.scrollTo({ top: 0 });
            }}
            onWriteJournal={() => {
              setEditingJournal(null);
              setSubScreen('journal_edit');
            }}
          />
        ) : subScreen === 'journal_photo' ? (
          <JournalPhotoDetailScreen
            photos={galleryPhotos}
            index={selectedGalleryIndex}
            favoriteIds={galleryFavoriteIds}
            notes={galleryNotes}
            journalAvailable={Boolean(
              journals.find(
                (entry) => entry.id === galleryPhotos[selectedGalleryIndex]?.journalId
              )
            )}
            onBack={returnToGallery}
            onChangeIndex={setSelectedGalleryIndex}
            onToggleFavorite={(id) =>
              setGalleryFavoriteIds((current) =>
                current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
              )
            }
            onSaveNote={(id, note) =>
              setGalleryNotes((current) => ({ ...current, [id]: note }))
            }
            onOpenJournal={() => {
              setSubScreen('gallery_journal');
              window.scrollTo({ top: 0 });
            }}
          />
        ) : subScreen === 'gallery_journal' ? (
          <GalleryJournalEntryScreen
            entry={
              journals.find(
                (entry) => entry.id === galleryPhotos[selectedGalleryIndex]?.journalId
              ) || null
            }
            onBack={() => {
              setSubScreen('journal_photo');
              window.scrollTo({ top: 0 });
            }}
          />
        ) : subScreen === 'selfcare' ? (
          <SelfCareScreen
            habits={habits}
            onToggleHabit={handleToggleHabit}
            onAddHabit={handleAddHabit}
            onStartBreathing={() => setSubScreen('breathing')}
            onBack={() => setSubScreen(null)}
          />
        ) : subScreen === 'contacts' ? (
          <TrustedContactsScreen
            contacts={contacts}
            onOpenAddContact={() => setSubScreen('add_contact')}
            onBack={() => setSubScreen(null)}
          />
        ) : subScreen === 'add_contact' ? (
          <AddContactScreen
            onSaveContact={handleSaveContact}
            onBack={() => setSubScreen('contacts')}
          />
        ) : subScreen === 'settings' ? (
          <SettingsScreen
            checkIns={checkIns}
            journals={journals}
            onBack={() => setSubScreen(null)}
          />
        ) : (
          /* Main 4 Tabs */
          <>
            {activeTab === 'home' && (
              <HomeScreen
                checkIn={latestCheckIn}
                checkIns={checkIns}
                journals={journals}
                completedExerciseIds={completedExerciseIds}
                startedExerciseIds={startedExerciseIds}
                onOpenCheckIn={() => {
                  setHomeScrollPosition(window.scrollY);
                  setSubScreen('checkin');
                }}
                onOpenSettings={() => setSubScreen('settings')}
                onOpenStreak={() => openHomeDetail('streak_details')}
                onOpenJournal={() => {
                  setEditingJournal(null);
                  setSubScreen('journal_edit');
                }}
                onOpenExercise={(id) => {
                  setActiveExerciseId(id);
                  setStartedExerciseIds((current) =>
                    current.includes(id) ? current : [...current, id]
                  );
                  openHomeDetail('exercise_details');
                }}
                onOpenSharing={(route) => {
                  setSharingEntryRoute(route);
                  openHomeDetail('sharing');
                }}
                onNavigateTab={(tab) => {
                  setActiveTab(tab);
                  setSubScreen(null);
                }}
              />
            )}

            {activeTab === 'journal' && (
              <JournalScreen
                entries={journals}
                onOpenGallery={() => {
                  setJournalScrollPosition(window.scrollY);
                  setSubScreen('journal_gallery');
                  window.scrollTo({ top: 0 });
                }}
                onOpenNewJournal={() => {
                  setEditingJournal(null);
                  setSubScreen('journal_edit');
                }}
                onEditJournal={(entry) => {
                  setEditingJournal(entry);
                  setSubScreen('journal_edit');
                }}
                onOpenSettings={() => setSubScreen('settings')}
                onNavigateTab={(tab) => {
                  setActiveTab(tab);
                  setSubScreen(null);
                }}
              />
            )}

            {activeTab === 'ai' && (
              <MindCareAIScreen
                checkIn={latestCheckIn}
                messages={chatMessages}
                onSendMessage={handleSendMessage}
                onOpenBreathing={() => setSubScreen('breathing')}
                onOpenSettings={() => setSubScreen('settings')}
                onActiveChatChange={setIsAiChatActive}
              />
            )}

            {activeTab === 'stats' && (
              <StatsScreen
                checkIns={checkIns}
                onOpenSettings={() => setSubScreen('settings')}
                onOpenSelfCare={() => setSubScreen('selfcare')}
              />
            )}
          </>
        )}

        {/* Global Bottom Navigation (Visible on Main Flows) */}
        {!hideBottomNav && (
          <BottomNavigation
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
              setSubScreen(null);
              setIsAiChatActive(false);
              setShowQuickActions(false);
            }}
            onFloatingAdd={() => {
              setShowQuickActions(true);
            }}
          />
        )}

        {showQuickActions && (
          <>
            <button
              onClick={() => setShowQuickActions(false)}
              aria-label="Đóng menu thao tác nhanh"
              className="fixed inset-0 z-40 bg-[var(--color-text-primary)]/20 backdrop-blur-[1px]"
              type="button"
            />
            <section
              aria-label="Thao tác nhanh"
              className="fixed bottom-[86px] left-1/2 z-50 w-[calc(100%-32px)] max-w-[388px] -translate-x-1/2 rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[0_16px_48px_rgba(31,92,67,0.18)] md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:max-w-[460px] md:p-6"
            >
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-[15px] font-bold text-[var(--color-primary)]">Bạn muốn làm gì?</h2>
                  <p className="mt-0.5 text-[10.5px] text-[var(--color-text-secondary)]">
                    Chọn một hoạt động phù hợp lúc này.
                  </p>
                </div>
                <button
                  onClick={() => setShowQuickActions(false)}
                  aria-label="Đóng"
                  className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-mint)]"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Check-in', icon: 'favorite', action: 'checkin' },
                  { label: 'Viết nhật ký', icon: 'edit_note', action: 'journal' },
                  { label: 'Thở chậm', icon: 'air', action: 'breathing' },
                ].map((item) => (
                  <button
                    key={item.action}
                    onClick={() => {
                      setShowQuickActions(false);
                      if (item.action === 'checkin') {
                        setSubScreen('checkin');
                      } else if (item.action === 'journal') {
                        setEditingJournal(null);
                        setSubScreen('journal_edit');
                      } else {
                        setSubScreen('breathing');
                      }
                    }}
                    className="flex min-h-[86px] flex-col items-center justify-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[#FAF8F2] px-2 text-[10.5px] font-bold text-[var(--color-primary)] transition hover:bg-[var(--color-surface-mint)] active:scale-95"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[23px]">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
