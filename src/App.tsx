import React, { useState, useEffect, useCallback } from 'react';
import {
  MainTab,
  SubScreen,
  CheckIn,
  JournalEntry,
  TrustedContact,
  DailyHabit,
  ChatMessage,
  RiskSnapshot,
  ConsentProfile,
  AdaptiveScreeningPrompt,
  HealthStatusDTO,
} from './types';
import {
  INITIAL_CHECKINS,
  INITIAL_JOURNAL_ENTRIES,
  INITIAL_CONTACTS,
  INITIAL_HABITS,
  INITIAL_CHAT_MESSAGES,
} from './data/mockData';
import {
  apiClient,
  DEFAULT_CONSENT_PROFILE,
  DEFAULT_RISK_SNAPSHOT,
  streamMochiChat,
} from './services/apiClient';
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
import { localDateKey, getJournalStats } from './utils/journalStats';
import {
  SharingEntryRoute,
  SharingFlowScreen,
} from './components/SharingFlowScreen';
import { JournalGalleryScreen } from './components/JournalGalleryScreen';
import { JournalPhotoDetailScreen } from './components/JournalPhotoDetailScreen';
import { GalleryJournalEntryScreen } from './components/GalleryJournalEntryScreen';
import { buildGalleryPhotos } from './data/journalGallery';
import { DesktopSidebar } from './components/DesktopSidebar';
import { PwaUpdatePrompt } from './components/PwaUpdatePrompt';
import { CrisisSafeModeDrawer } from './components/CrisisSafeModeDrawer';
import { CounselorTriageDrawer } from './components/CounselorTriageDrawer';

const VIET_WEEKDAYS = [
  'Chủ nhật',
  'Thứ hai',
  'Thứ ba',
  'Thứ tư',
  'Thứ năm',
  'Thứ sáu',
  'Thứ bảy',
];

function formatRealVietnameseDate(now: Date): { date: string; dayLabel: string; time: string } {
  const dayLabel = VIET_WEEKDAYS[now.getDay()];
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  return {
    date: `${dayLabel}, ${dd}/${mm}/${yyyy}`,
    dayLabel,
    time: `${hh}:${min}`,
  };
}

export default function App() {
  const [activeTab, setActiveTab] = useState<MainTab>('home');
  const [subScreen, setSubScreen] = useState<SubScreen>(null);

  // Core Persistent States
  const [checkIns, setCheckIns] = useState<CheckIn[]>(() => {
    const saved = localStorage.getItem('mindcare_checkins');
    return saved ? JSON.parse(saved) : INITIAL_CHECKINS;
  });

  const [journals, setJournals] = useState<JournalEntry[]>(() => {
    try {
      const saved = localStorage.getItem('mindcare_journals');
      return saved !== null ? JSON.parse(saved) : INITIAL_JOURNAL_ENTRIES;
    } catch {
      return INITIAL_JOURNAL_ENTRIES;
    }
  });

  const [contacts, setContacts] = useState<TrustedContact[]>(() => {
    try {
      const saved = localStorage.getItem('mindcare_contacts');
      return saved !== null ? JSON.parse(saved) : INITIAL_CONTACTS;
    } catch {
      return INITIAL_CONTACTS;
    }
  });

  const [habits, setHabits] = useState<DailyHabit[]>(() => {
    const saved = localStorage.getItem('mindcare_habits');
    return saved ? JSON.parse(saved) : INITIAL_HABITS;
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('mindcare_chat');
    return saved ? JSON.parse(saved) : INITIAL_CHAT_MESSAGES;
  });

  // Phase 4 Risk Engine & Safety States
  const [riskSnapshot, setRiskSnapshot] = useState<RiskSnapshot>(() => {
    try {
      const saved = localStorage.getItem('mindcare_risk_snapshot_v2');
      return saved ? JSON.parse(saved) : DEFAULT_RISK_SNAPSHOT;
    } catch {
      return DEFAULT_RISK_SNAPSHOT;
    }
  });

  const [consentProfile, setConsentProfile] = useState<ConsentProfile>(() => {
    try {
      const saved = localStorage.getItem('mindcare_consent_profile_v2');
      return saved ? JSON.parse(saved) : DEFAULT_CONSENT_PROFILE;
    } catch {
      return DEFAULT_CONSENT_PROFILE;
    }
  });

  const [crisisDrawerOpen, setCrisisDrawerOpen] = useState(false);
  const [counselorDrawerOpen, setCounselorDrawerOpen] = useState(false);
  const [activeScreeningPrompt, setActiveScreeningPrompt] =
    useState<AdaptiveScreeningPrompt | null>(null);
  const [isMochiStreaming, setIsMochiStreaming] = useState(false);
  const [healthStatus, setHealthStatus] = useState<HealthStatusDTO>({
    status: 'offline_pwa',
    version: '2.0.0',
    geminiConfigured: false,
    model: 'client-safety-fallback',
    online: false,
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

  const applyIncomingRiskSnapshot = useCallback(
    (snapshot: RiskSnapshot, forceOpenCrisis = false) => {
      setRiskSnapshot(snapshot);
      if (snapshot.adaptiveScreeningPrompt) {
        setActiveScreeningPrompt(snapshot.adaptiveScreeningPrompt);
      }
      if (snapshot.currentTier === 'L4' || forceOpenCrisis) {
        setCrisisDrawerOpen(true);
      }
    },
    []
  );

  // Initial Synchronization with Backend (gracefully falling back to localStorage)
  useEffect(() => {
    apiClient.getClientId();
    let mounted = true;

    Promise.all([
      apiClient.checkHealth(),
      apiClient.getRiskState(),
      apiClient.getConsent(),
      apiClient.getCheckIns(),
      apiClient.getJournals(),
      apiClient.getContacts(),
    ]).then(([health, snap, consent, remoteCheckins, remoteJournals, remoteContacts]) => {
      if (!mounted) return;
      setHealthStatus(health);
      setRiskSnapshot(snap);
      if (snap.adaptiveScreeningPrompt) {
        setActiveScreeningPrompt(snap.adaptiveScreeningPrompt);
      }
      if (snap.currentTier === 'L4') {
        setCrisisDrawerOpen(true);
      }
      setConsentProfile(consent);
      if (Array.isArray(remoteCheckins) && remoteCheckins.length > 0) {
        setCheckIns(remoteCheckins);
      }
      if (health.online) {
        if (Array.isArray(remoteJournals)) {
          setJournals(remoteJournals);
        }
        if (Array.isArray(remoteContacts)) {
          setContacts(remoteContacts);
        }
      } else {
        if (Array.isArray(remoteJournals) && remoteJournals.length > 0) {
          setJournals(remoteJournals);
        }
        if (Array.isArray(remoteContacts) && remoteContacts.length > 0) {
          setContacts(remoteContacts);
        }
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  // Sync to localStorage
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

  const handleUpdateConsent = (nextConsent: ConsentProfile) => {
    setConsentProfile(nextConsent);
    apiClient.updateConsent(nextConsent).then((saved) => {
      setConsentProfile(saved);
    });
  };

  // Actions
  const handleSaveCheckIn = (newCheckIn: CheckIn) => {
    const nextCheckIns = [newCheckIn, ...checkIns.filter((c) => c.id !== newCheckIn.id)];
    setCheckIns((prev) => [newCheckIn, ...prev.filter((c) => c.id !== newCheckIn.id)]);
    try {
      localStorage.setItem('mindcare_checkins', JSON.stringify(nextCheckIns));
    } catch {
      // The component state remains usable if browser storage is unavailable.
    }

    apiClient.createCheckIn(newCheckIn).then((res) => {
      setCheckIns((prev) => [
        res.checkIn,
        ...prev.filter((c) => c.id !== res.checkIn.id && c.id !== newCheckIn.id),
      ]);
      applyIncomingRiskSnapshot(res.riskSnapshot);
    });

    // If user wrote a personal note during check-in, sync it as an encrypted journal entry
    if (newCheckIn.note && newCheckIn.note.trim()) {
      const now = new Date();
      const formatted = formatRealVietnameseDate(now);
      const entryId = 'j-' + Date.now();
      const optimisticEntry: JournalEntry = {
        id: entryId,
        date: formatted.date,
        dayLabel: formatted.dayLabel,
        time: formatted.time,
        title: `Ghi chép tâm trạng: ${newCheckIn.moodLabel}`,
        content: newCheckIn.note,
        tag: newCheckIn.moodLabel,
        moodScore: newCheckIn.mood,
        aiEstimateLabel: newCheckIn.moodLabel,
        aiEstimateScore: newCheckIn.mood,
        aiBarWidth: Math.min(100, newCheckIn.mood * 10),
        isEncrypted: true,
        allowAiRef: newCheckIn.allowAiPersonalize,
        createdAt: now.getTime(),
      };
      setJournals((prev) => [optimisticEntry, ...prev]);

      apiClient.createJournal(optimisticEntry).then((res) => {
        setJournals((prev) =>
          prev.map((item) => (item.id === entryId ? res.journal : item))
        );
        applyIncomingRiskSnapshot(res.riskSnapshot);
      });
    }

  };

  const handleSaveJournal = async (journalData: Partial<JournalEntry>) => {
    if (editingJournal) {
      const mergedDraft: JournalEntry = {
        ...editingJournal,
        ...journalData,
        isEncrypted: true,
      };
      const res = await apiClient.updateJournal(editingJournal.id, mergedDraft);
      setJournals((prev) =>
        prev.map((j) => (j.id === editingJournal.id ? res.journal : j))
      );
      applyIncomingRiskSnapshot(res.riskSnapshot);
    } else {
      const now = new Date();
      const formatted = formatRealVietnameseDate(now);
      const newId = 'j-' + Date.now();
      const payload: JournalEntry = {
        id: newId,
        date: formatted.date,
        dayLabel: formatted.dayLabel,
        time: formatted.time,
        title: journalData.title || 'Nhật ký cá nhân',
        content: journalData.content || '',
        tag: journalData.tag || 'Nhẹ nhõm',
        moodScore: journalData.moodScore || 6,
        aiEstimateLabel: journalData.aiEstimateLabel || 'Tích cực nhẹ',
        aiEstimateScore: journalData.aiEstimateScore || 6,
        aiBarWidth: journalData.aiBarWidth || 60,
        isEncrypted: true,
        allowAiRef: journalData.allowAiRef || false,
        createdAt: now.getTime(),
        imageUrl: journalData.imageUrl,
      };
      const res = await apiClient.createJournal(payload);
      setJournals((prev) => [res.journal, ...prev]);
      applyIncomingRiskSnapshot(res.riskSnapshot);
    }
    setEditingJournal(null);
    setSubScreen(null);
    setActiveTab('journal');
  };

  const handleDeleteJournal = (journalId: string) => {
    setJournals((prev) => prev.filter((j) => j.id !== journalId));
    if (editingJournal?.id === journalId) {
      setEditingJournal(null);
      if (subScreen === 'journal_edit') {
        setSubScreen(null);
        setActiveTab('journal');
      }
    }
    apiClient.deleteJournal(journalId);
  };

  const handleToggleHabit = (id: string) => {
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, completed: !h.completed } : h))
    );
  };

  const handleAddHabit = (title: string) => {
    setHabits((prev) => [...prev, { id: 'h-' + Date.now(), title, completed: false }]);
  };

  const handleDeleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  const handleEditHabit = (id: string, title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, title: trimmed } : h))
    );
  };

  const handleSaveContact = (contact: TrustedContact) => {
    setContacts((prev) => [...prev, contact]);
    setSubScreen('contacts');
    apiClient.createContact(contact).then((saved) => {
      setContacts((prev) => prev.map((c) => (c.id === contact.id ? saved : c)));
    });
  };

  const handleUpdateContact = (contactId: string, patch: Partial<TrustedContact>) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === contactId ? { ...c, ...patch, neverShareJournal: true } : c))
    );
    apiClient.updateContact(contactId, patch).then((saved) => {
      setContacts((prev) => prev.map((c) => (c.id === contactId ? saved : c)));
    });
  };

  const handleDeleteContact = (contactId: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== contactId));
    apiClient.deleteContact(contactId);
  };

  // Real-time SSE Streaming Mochi Chat with 4-Layer Safety Engine
  const handleSendMessage = (text: string) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    const userMsg: ChatMessage = {
      id: 'm-' + Date.now(),
      sender: 'user',
      text,
      time: timeStr,
    };

    const assistantMsgId = 'm-ai-' + (Date.now() + 1);
    const placeholderAiMsg: ChatMessage = {
      id: assistantMsgId,
      sender: 'assistant',
      text: '',
      time: timeStr,
    };

    const historyPayload = [...chatMessages, userMsg]
      .filter((m) => m.text.trim().length > 0)
      .slice(-8)
      .map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

    setChatMessages((prev) => [...prev, userMsg, placeholderAiMsg]);
    setIsMochiStreaming(true);

    const canSendCheckinContext =
      consentProfile.allowAiCheckinPersonalize && latestCheckIn.allowAiPersonalize;

    streamMochiChat(
      {
        message: text,
        history: historyPayload,
        latestCheckIn: canSendCheckinContext
          ? {
              mood: latestCheckIn.mood,
              stress: latestCheckIn.stress,
              sleepHours: latestCheckIn.sleepHours,
              allowAiPersonalize: true,
            }
          : {
              mood: 6,
              stress: 5,
              sleepHours: 7,
              allowAiPersonalize: false,
            },
      },
      {
        onMeta: (meta) => {
          if (meta.riskSnapshot) {
            applyIncomingRiskSnapshot(meta.riskSnapshot, meta.openCrisisDrawer);
          } else if (meta.openCrisisDrawer) {
            setCrisisDrawerOpen(true);
          }
          if (meta.adaptiveScreeningPrompt) {
            setActiveScreeningPrompt(meta.adaptiveScreeningPrompt);
          }
          setChatMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? {
                    ...m,
                    gateRoute: meta.gateRoute,
                    riskTier: meta.riskSnapshot?.currentTier,
                    circuitBreakerActivated: meta.circuitBreakerActivated,
                    isInsightCard: Boolean(meta.insightData),
                    insightData: meta.insightData,
                  }
                : m
            )
          );
        },
        onChunk: (chunkText) => {
          setChatMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId ? { ...m, text: m.text + chunkText } : m
            )
          );
        },
        onSafetyRewrite: (fullSafeText) => {
          setChatMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? { ...m, text: fullSafeText, safetyRewritten: true }
                : m
            )
          );
        },
        onDone: (fullText, outputVerified) => {
          setChatMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? {
                    ...m,
                    text: fullText || m.text,
                    outputVerified,
                  }
                : m
            )
          );
          setIsMochiStreaming(false);
        },
      }
    ).catch(() => {
      setIsMochiStreaming(false);
    });
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

  const isComposing =
    subScreen === 'journal_edit' ||
    subScreen === 'checkin' ||
    subScreen === 'sharing' ||
    subScreen === 'add_contact' ||
    (activeTab === 'ai' && isAiChatActive);

  return (
    <div className="min-h-[100dvh] bg-[var(--color-background)] flex justify-center items-start text-text-primary selection:bg-surface-mint selection:text-primary md:justify-start md:w-full">
      {/* Quick Inspection & Safety Console Drawer */}
      <ScreenSwitcherDrawer
        currentTab={activeTab}
        currentSub={subScreen}
        currentRiskTier={riskSnapshot.currentTier}
        onSelectScreen={(tab, sub) => {
          setActiveTab(tab);
          setSubScreen(sub);
          setIsAiChatActive(false);
        }}
        onOpenCounselorTriage={() => setCounselorDrawerOpen(true)}
        onOpenCrisisDrawer={() => setCrisisDrawerOpen(true)}
      />

      {/* Desktop & Tablet Left Sidebar Navigation */}
      <DesktopSidebar
        activeTab={activeTab}
        subScreen={subScreen}
        currentStreak={currentJournalStreak}
        collapsed={sidebarCollapsed}
        currentRiskTier={riskSnapshot.currentTier}
        healthStatus={healthStatus}
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
        onOpenCrisisDrawer={() => setCrisisDrawerOpen(true)}
        onOpenCounselorTriage={() => setCounselorDrawerOpen(true)}
      />

      {/* Responsive Container */}
      <main className="w-full max-w-[420px] min-h-[100dvh] bg-[var(--color-background)] flex flex-col relative shadow-2xl border-x border-[var(--color-border)] overflow-x-clip md:max-w-none md:flex-1 md:min-w-0 md:shadow-none md:border-x-0">
        <TopStatusBar />

        {subScreen === 'onboarding' ? (
          <OnboardingScreen onStart={() => setSubScreen(null)} />
        ) : subScreen === 'checkin' ? (
          <CheckInModal
            initialCheckIn={latestCheckIn}
            defaultAllowAi={consentProfile.allowAiCheckinPersonalize}
            onSave={handleSaveCheckIn}
            onComplete={(targetTab) => {
              setSubScreen(null);
              setActiveTab(targetTab);
            }}
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
            defaultAllowAiRef={consentProfile.allowAiJournalContext}
            onSave={handleSaveJournal}
            onDelete={handleDeleteJournal}
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
            riskSnapshot={riskSnapshot}
            onRiskSnapshotUpdate={(snap) => applyIncomingRiskSnapshot(snap)}
            onOpenCrisisSupport={() => setCrisisDrawerOpen(true)}
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
            riskSnapshot={riskSnapshot}
            onRiskSnapshotUpdate={(snap) => applyIncomingRiskSnapshot(snap)}
            onToggleHabit={handleToggleHabit}
            onAddHabit={handleAddHabit}
            onDeleteHabit={handleDeleteHabit}
            onEditHabit={handleEditHabit}
            onOpenSafetyPlan={() => setSubScreen('contacts')}
            onOpenCrisisDrawer={() => setCrisisDrawerOpen(true)}
            onStartBreathing={() => setSubScreen('breathing')}
            onBack={() => setSubScreen(null)}
          />
        ) : subScreen === 'contacts' ? (
          <TrustedContactsScreen
            contacts={contacts}
            consentProfile={consentProfile}
            onUpdateConsent={handleUpdateConsent}
            onUpdateContact={handleUpdateContact}
            onDeleteContact={handleDeleteContact}
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
            consentProfile={consentProfile}
            riskSnapshot={riskSnapshot}
            healthStatus={healthStatus}
            onHealthStatusUpdate={setHealthStatus}
            onUpdateConsent={handleUpdateConsent}
            onOpenCounselorTriage={() => setCounselorDrawerOpen(true)}
            onOpenCrisisSafeMode={() => setCrisisDrawerOpen(true)}
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
                riskSnapshot={riskSnapshot}
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
                onOpenCrisisDrawer={() => setCrisisDrawerOpen(true)}
                onOpenSelfCare={() => setSubScreen('selfcare')}
                onOpenContacts={() => setSubScreen('contacts')}
                onNavigateTab={(tab) => {
                  setActiveTab(tab);
                  setSubScreen(null);
                }}
              />
            )}

            {activeTab === 'journal' && (
              <JournalScreen
                entries={journals}
                checkIns={checkIns}
                onDeleteJournal={handleDeleteJournal}
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
                isStreaming={isMochiStreaming}
                riskSnapshot={riskSnapshot}
                consentProfile={consentProfile}
                healthStatus={healthStatus}
                activeScreeningPrompt={activeScreeningPrompt}
                onSendMessage={handleSendMessage}
                onOpenBreathing={() => setSubScreen('breathing')}
                onOpenSettings={() => setSubScreen('settings')}
                onOpenCrisisDrawer={() => setCrisisDrawerOpen(true)}
                onRiskSnapshotUpdate={(snap) => applyIncomingRiskSnapshot(snap)}
                onDismissScreeningPrompt={() => setActiveScreeningPrompt(null)}
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

        {/* Global Bottom Navigation */}
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
                  <h2 className="text-[15px] font-bold text-[var(--color-primary)]">
                    Bạn muốn làm gì?
                  </h2>
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

      {/* WHO PFA Crisis Safe Mode Drawer (Auto-opens on L4 or manual Safe Buoy trigger) */}
      <CrisisSafeModeDrawer
        isOpen={crisisDrawerOpen}
        riskSnapshot={riskSnapshot}
        contacts={contacts}
        consentProfile={consentProfile}
        onClose={() => setCrisisDrawerOpen(false)}
        onOpenBreathing={() => setSubScreen('breathing')}
        onOpenSafetyPlanEditor={() => setSubScreen('contacts')}
      />

      {/* Counselor HITL Triage & Audit Verification Console */}
      <CounselorTriageDrawer
        isOpen={counselorDrawerOpen}
        onClose={() => setCounselorDrawerOpen(false)}
        onRiskStateRefresh={() => {
          apiClient.getRiskState().then(setRiskSnapshot);
        }}
      />

      <PwaUpdatePrompt isComposing={isComposing} />
    </div>
  );
}
