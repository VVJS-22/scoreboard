import { useState, useEffect, useCallback, useRef } from "react";

export interface GoalEvent {
  player: string;
  minute: number;
  second: number;
}

export interface CardEvent {
  player: string;
  minute: number;
  second: number;
  type: "yellow" | "red";
}

export interface GradientStop {
  color: string;
  percentage: number;
}

export interface ThemeSettings {
  backgroundColor: string;
  backgroundType: 'solid' | 'linear';
  backgroundGradientStart: string;
  backgroundGradientEnd: string;
  backgroundGradientAngle: number;
  gradientStops: GradientStop[];
  primaryTextColor: string;
  secondaryTextColor: string;
  timerColor: string;
  scoreColor: string;
  homeTeamColor: string;
  awayTeamColor: string;
  homeBadgeBackground: string;
  awayBadgeBackground: string;
  leagueIconBackground: string;
  goalCardBackground: string;
  goalCardTextColor: string;
}

export interface TeamData {
  name: string;
  shortName: string;
  logo: string;
  score: number;
  goals: GoalEvent[];
  cards: CardEvent[];
}

export interface SavedTheme {
  id: string;
  name: string;
  theme: ThemeSettings;
  createdAt: number;
}

export interface MatchState {
  homeTeam: TeamData;
  awayTeam: TeamData;
  stadium: string;
  league: string;
  matchDate: string;
  theme: ThemeSettings;
  customLogos?: string[]; // Shared array of data URLs for custom uploaded logos
}

const STORAGE_KEY = "match-state";
const TIMER_KEY = "match-timer";
const SAVED_THEMES_KEY = "saved-themes";

const defaultMatchState: MatchState = {
  homeTeam: {
    name: "ARGENTINA",
    shortName: "ARG",
    logo: "🇦🇷",
    score: 0,
    goals: [],
    cards: [],
  },
  awayTeam: {
    name: "BRAZIL",
    shortName: "BRA",
    logo: "🇧🇷",
    score: 0,
    goals: [],
    cards: [],
  },
  stadium: "Maracanã Stadium",
  league: "FIFA WORLD CUP",
  matchDate: "17.11.2021 - 10:30",
  customLogos: [],
  theme: {
    backgroundColor: "#0f1729",
    backgroundType: "linear",
    backgroundGradientStart: "#0f1729",
    backgroundGradientEnd: "#080a12",
    backgroundGradientAngle: 180,
    gradientStops: [
      { color: "#0f1729", percentage: 0 },
      { color: "#080a12", percentage: 100 }
    ],
    primaryTextColor: "#fafafa",
    secondaryTextColor: "#94a3b8",
    timerColor: "#fafafa",
    scoreColor: "#fafafa",
    homeTeamColor: "#60a5fa",
    awayTeamColor: "#2db97c",
    homeBadgeBackground: "radial-gradient(circle at center, hsla(200, 70%, 65%, 0.2), transparent 70%)",
    awayBadgeBackground: "radial-gradient(circle at center, hsla(340, 70%, 30%, 0.2), transparent 70%)",
    leagueIconBackground: "#fbbf24",
    goalCardBackground: "rgba(255, 255, 255, 0.05)",
    goalCardTextColor: "#94a3b8",
  },
};

// Preset themes
export const presetThemes: SavedTheme[] = [
  {
    id: "classic-football",
    name: "Classic Football",
    createdAt: Date.now(),
    theme: {
      backgroundColor: "#0f1729",
      backgroundType: "linear",
      backgroundGradientStart: "#0f1729",
      backgroundGradientEnd: "#080a12",
      backgroundGradientAngle: 180,
      gradientStops: [
        { color: "#0f1729", percentage: 0 },
        { color: "#080a12", percentage: 100 }
      ],
      primaryTextColor: "#fafafa",
      secondaryTextColor: "#94a3b8",
      timerColor: "#fafafa",
      scoreColor: "#fafafa",
      homeTeamColor: "#60a5fa",
      awayTeamColor: "#2db97c",
      homeBadgeBackground: "radial-gradient(circle at center, hsla(200, 70%, 65%, 0.2), transparent 70%)",
      awayBadgeBackground: "radial-gradient(circle at center, hsla(340, 70%, 30%, 0.2), transparent 70%)",
      leagueIconBackground: "#fbbf24",
      goalCardBackground: "rgba(255, 255, 255, 0.05)",
      goalCardTextColor: "#94a3b8",
    }
  },
  {
    id: "dark-mode",
    name: "Dark Mode",
    createdAt: Date.now(),
    theme: {
      backgroundColor: "#000000",
      backgroundType: "solid",
      backgroundGradientStart: "#000000",
      backgroundGradientEnd: "#1a1a1a",
      backgroundGradientAngle: 180,
      gradientStops: [
        { color: "#000000", percentage: 0 },
        { color: "#1a1a1a", percentage: 100 }
      ],
      primaryTextColor: "#ffffff",
      secondaryTextColor: "#888888",
      timerColor: "#ffffff",
      scoreColor: "#ffffff",
      homeTeamColor: "#ff4444",
      awayTeamColor: "#44ff44",
      homeBadgeBackground: "radial-gradient(circle at center, hsla(0, 70%, 50%, 0.2), transparent 70%)",
      awayBadgeBackground: "radial-gradient(circle at center, hsla(120, 70%, 50%, 0.2), transparent 70%)",
      leagueIconBackground: "#ff9933",
      goalCardBackground: "rgba(255, 255, 255, 0.1)",
      goalCardTextColor: "#888888",
    }
  },
  {
    id: "high-contrast",
    name: "High Contrast",
    createdAt: Date.now(),
    theme: {
      backgroundColor: "#ffffff",
      backgroundType: "solid",
      backgroundGradientStart: "#ffffff",
      backgroundGradientEnd: "#f0f0f0",
      backgroundGradientAngle: 180,
      gradientStops: [
        { color: "#ffffff", percentage: 0 },
        { color: "#f0f0f0", percentage: 100 }
      ],
      primaryTextColor: "#000000",
      secondaryTextColor: "#333333",
      timerColor: "#000000",
      scoreColor: "#000000",
      homeTeamColor: "#0000ff",
      awayTeamColor: "#ff0000",
      homeBadgeBackground: "radial-gradient(circle at center, hsla(240, 100%, 50%, 0.2), transparent 70%)",
      awayBadgeBackground: "radial-gradient(circle at center, hsla(0, 100%, 50%, 0.2), transparent 70%)",
      leagueIconBackground: "#ffaa00",
      goalCardBackground: "rgba(0, 0, 0, 0.05)",
      goalCardTextColor: "#333333",
    }
  },
  {
    id: "sunset",
    name: "Sunset",
    createdAt: Date.now(),
    theme: {
      backgroundColor: "#1a0a28",
      backgroundType: "linear",
      backgroundGradientStart: "#ff6b6b",
      backgroundGradientEnd: "#4ecdc4",
      backgroundGradientAngle: 135,
      gradientStops: [
        { color: "#ff6b6b", percentage: 0 },
        { color: "#ffa500", percentage: 50 },
        { color: "#4ecdc4", percentage: 100 }
      ],
      primaryTextColor: "#ffffff",
      secondaryTextColor: "#2d1b3d",
      timerColor: "#ffffff",
      scoreColor: "#ffffff",
      homeTeamColor: "#b8390e",
      awayTeamColor: "#0d7377",
      homeBadgeBackground: "radial-gradient(circle at center, hsla(45, 100%, 70%, 0.3), transparent 70%)",
      awayBadgeBackground: "radial-gradient(circle at center, hsla(340, 100%, 70%, 0.3), transparent 70%)",
      leagueIconBackground: "#2d1b3d",
      goalCardBackground: "rgba(45, 27, 61, 0.5)",
      goalCardTextColor: "#ffffff",
    }
  },
  {
    id: "neon",
    name: "Neon",
    createdAt: Date.now(),
    theme: {
      backgroundColor: "#0a0e27",
      backgroundType: "linear",
      backgroundGradientStart: "#0a0e27",
      backgroundGradientEnd: "#1a1f3a",
      backgroundGradientAngle: 180,
      gradientStops: [
        { color: "#0a0e27", percentage: 0 },
        { color: "#1a1f3a", percentage: 100 }
      ],
      primaryTextColor: "#00ff88",
      secondaryTextColor: "#00ccff",
      timerColor: "#ff00ff",
      scoreColor: "#ffff00",
      homeTeamColor: "#00ff88",
      awayTeamColor: "#ff00ff",
      homeBadgeBackground: "radial-gradient(circle at center, hsla(160, 100%, 50%, 0.3), transparent 70%)",
      awayBadgeBackground: "radial-gradient(circle at center, hsla(300, 100%, 50%, 0.3), transparent 70%)",
      leagueIconBackground: "#00ccff",
      goalCardBackground: "rgba(0, 255, 136, 0.1)",
      goalCardTextColor: "#00ccff",
    }
  }
];

const getStoredState = (): MatchState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsedState = JSON.parse(stored);
      return { 
        ...defaultMatchState, 
        ...parsedState,
        theme: { ...defaultMatchState.theme, ...parsedState.theme }
      };
    }
  } catch (e) {
    console.error("Failed to parse stored match state:", e);
  }
  return defaultMatchState;
};

const getStoredTimer = (): { minutes: number; seconds: number; isRunning: boolean; endMinutes: number | null; addedTime: number; showAddedTime: boolean; lastUpdate: number } => {
  try {
    const stored = localStorage.getItem(TIMER_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to parse stored timer:", e);
  }
  return { minutes: 0, seconds: 0, isRunning: false, endMinutes: null, addedTime: 0, showAddedTime: false, lastUpdate: Date.now() };
};

const getSavedThemes = (): SavedTheme[] => {
  try {
    const stored = localStorage.getItem(SAVED_THEMES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to parse saved themes:", e);
  }
  return [];
};

const saveSavedThemes = (themes: SavedTheme[]) => {
  try {
    localStorage.setItem(SAVED_THEMES_KEY, JSON.stringify(themes));
  } catch (e) {
    console.error("Failed to save themes:", e);
  }
};

// Global interval ID to ensure only one timer runs across all hook instances
let globalTimerInterval: NodeJS.Timeout | null = null;
let activeHookCount = 0;

export const useMatchState = () => {
  const [matchState, setMatchState] = useState<MatchState>(getStoredState);
  const [timerState, setTimerState] = useState(getStoredTimer);
  const [savedThemes, setSavedThemes] = useState<SavedTheme[]>(getSavedThemes);
  const hideAddedTimeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Listen for storage events from other tabs (real-time sync)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const newState = JSON.parse(e.newValue);
          setMatchState(newState);
        } catch (err) {
          console.error("Failed to parse storage event:", err);
        }
      }
      if (e.key === TIMER_KEY && e.newValue) {
        try {
          const newTimer = JSON.parse(e.newValue);
          setTimerState(newTimer);
        } catch (err) {
          console.error("Failed to parse timer event:", err);
        }
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      // Cleanup timeout on unmount
      if (hideAddedTimeTimeoutRef.current) {
        clearTimeout(hideAddedTimeTimeoutRef.current);
      }
    };
  }, []);

  // Timer tick effect - global singleton pattern
  useEffect(() => {
    activeHookCount++;
    
    // Only start interval if not already running
    if (!globalTimerInterval) {
      globalTimerInterval = setInterval(() => {
        const currentTimer = getStoredTimer();
        
        // Don't update if timer is not running
        if (!currentTimer.isRunning) return;
        
        // Prevent rapid updates - ensure at least 950ms has passed
        const now = Date.now();
        if (now - currentTimer.lastUpdate < 950) return;
        
        const newSeconds = currentTimer.seconds + 1;
        let newTimer = newSeconds >= 60
          ? { ...currentTimer, minutes: currentTimer.minutes + 1, seconds: 0, lastUpdate: now }
          : { ...currentTimer, seconds: newSeconds, lastUpdate: now };
        
        // Check if end time is reached (including added time)
        if (newTimer.endMinutes !== null) {
          const totalEndTime = newTimer.endMinutes + newTimer.addedTime;
          const currentTime = newTimer.minutes + (newTimer.seconds / 60);
          if (currentTime >= totalEndTime) {
            newTimer = { ...newTimer, isRunning: false };
          }
        }
        
        localStorage.setItem(TIMER_KEY, JSON.stringify(newTimer));
        
        // Trigger storage event manually for same-tab updates
        window.dispatchEvent(new StorageEvent('storage', {
          key: TIMER_KEY,
          newValue: JSON.stringify(newTimer),
          storageArea: localStorage
        }));
      }, 1000);
    }

    return () => {
      activeHookCount--;
      // Only clear interval when all hooks are unmounted
      if (activeHookCount === 0 && globalTimerInterval) {
        clearInterval(globalTimerInterval);
        globalTimerInterval = null;
      }
    };
  }, []);

  // Helper to update state and persist to localStorage
  const persistMatchState = useCallback((updater: (prev: MatchState) => MatchState) => {
    setMatchState(prev => {
      const newState = updater(prev);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      } catch (err) {
        console.error("Failed to save match state to localStorage:", err);
      }
      return newState;
    });
  }, []);

  const updateMatchState = useCallback((updates: Partial<MatchState>) => {
    persistMatchState(prev => ({ ...prev, ...updates }));
  }, [persistMatchState]);

  const updateHomeTeam = useCallback((updates: Partial<TeamData>) => {
    persistMatchState(prev => ({ ...prev, homeTeam: { ...prev.homeTeam, ...updates } }));
  }, [persistMatchState]);

  const updateAwayTeam = useCallback((updates: Partial<TeamData>) => {
    persistMatchState(prev => ({ ...prev, awayTeam: { ...prev.awayTeam, ...updates } }));
  }, [persistMatchState]);

  // Unified goal adding logic
  const addGoal = useCallback((player: string, team: 'home' | 'away') => {
    setTimerState(currentTimer => {
      const newGoal: GoalEvent = { player, minute: currentTimer.minutes, second: currentTimer.seconds };
      const teamKey = team === 'home' ? 'homeTeam' : 'awayTeam';
      
      persistMatchState(prev => ({
        ...prev,
        [teamKey]: {
          ...prev[teamKey],
          score: prev[teamKey].score + 1,
          goals: [...prev[teamKey].goals, newGoal],
        },
      }));
      return currentTimer;
    });
  }, [persistMatchState]);

  const addHomeGoal = useCallback((player: string) => addGoal(player, 'home'), [addGoal]);
  const addAwayGoal = useCallback((player: string) => addGoal(player, 'away'), [addGoal]);

  // Unified card adding logic
  const addCard = useCallback((player: string, type: "yellow" | "red", team: 'home' | 'away') => {
    setTimerState(currentTimer => {
      const newCard: CardEvent = { player, minute: currentTimer.minutes, second: currentTimer.seconds, type };
      const teamKey = team === 'home' ? 'homeTeam' : 'awayTeam';
      
      persistMatchState(prev => ({
        ...prev,
        [teamKey]: {
          ...prev[teamKey],
          cards: [...prev[teamKey].cards, newCard],
        },
      }));
      return currentTimer;
    });
  }, [persistMatchState]);

  const addHomeCard = useCallback((player: string, type: "yellow" | "red") => addCard(player, type, 'home'), [addCard]);
  const addAwayCard = useCallback((player: string, type: "yellow" | "red") => addCard(player, type, 'away'), [addCard]);

  // Helper to update timer state and persist
  const updateTimer = useCallback((updates: Partial<{ minutes: number; seconds: number; isRunning: boolean; endMinutes: number | null; addedTime: number; showAddedTime: boolean; lastUpdate: number }>) => {
    setTimerState(prev => {
      const newTimer = { ...prev, ...updates, lastUpdate: Date.now() };
      try {
        localStorage.setItem(TIMER_KEY, JSON.stringify(newTimer));
      } catch (err) {
        console.error("Failed to save timer state to localStorage:", err);
      }
      return newTimer;
    });
  }, []);

  const startTimer = useCallback(() => updateTimer({ isRunning: true }), [updateTimer]);
  const stopTimer = useCallback(() => updateTimer({ isRunning: false }), [updateTimer]);

  const resetTimer = useCallback(() => {
    updateTimer({ minutes: 0, seconds: 0, isRunning: false, endMinutes: null, addedTime: 0, showAddedTime: false });
  }, [updateTimer]);

  const setTimerEndTime = useCallback((endMinutes: number | null) => {
    updateTimer({ endMinutes });
  }, [updateTimer]);

  const setAddedTime = useCallback((minutes: number) => {
    if (hideAddedTimeTimeoutRef.current) {
      clearTimeout(hideAddedTimeTimeoutRef.current);
    }

    setTimerState(prev => {
      // If minutes is 0, clear. Otherwise, always accumulate with existing added time
      const newAddedTime = minutes === 0 ? 0 : prev.addedTime + minutes;
      
      const shouldStart = minutes > 0 && !prev.isRunning;
      const newTimer = { 
        ...prev, 
        addedTime: newAddedTime, 
        showAddedTime: minutes > 0, 
        isRunning: shouldStart || prev.isRunning,
        lastUpdate: Date.now() 
      };
      try {
        localStorage.setItem(TIMER_KEY, JSON.stringify(newTimer));
      } catch (err) {
        console.error("Failed to save added time to localStorage:", err);
      }
      return newTimer;
    });
    
    if (minutes > 0) {
      hideAddedTimeTimeoutRef.current = setTimeout(() => {
        updateTimer({ showAddedTime: false });
      }, 3000);
    }
  }, [updateTimer]);

  const resetMatch = useCallback(() => {
    // Only reset timer, goals, scorer, and cards
    // Preserve team names, logos, stadium, league, match date, and theme
    persistMatchState(prev => ({
      ...prev,
      homeTeam: {
        ...prev.homeTeam,
        score: 0,
        goals: [],
        cards: [],
      },
      awayTeam: {
        ...prev.awayTeam,
        score: 0,
        goals: [],
        cards: [],
      },
    }));
    
    // Reset timer
    const resetTimerData = { 
      minutes: 0, 
      seconds: 0, 
      isRunning: false, 
      endMinutes: null, 
      addedTime: 0, 
      showAddedTime: false, 
      lastUpdate: Date.now() 
    };
    setTimerState(resetTimerData);
    localStorage.setItem(TIMER_KEY, JSON.stringify(resetTimerData));
  }, [persistMatchState]);

  const updateTheme = useCallback((updates: Partial<ThemeSettings>) => {
    persistMatchState(prev => ({ ...prev, theme: { ...prev.theme, ...updates } }));
  }, [persistMatchState]);

  const resetTheme = useCallback(() => {
    persistMatchState(prev => ({ ...prev, theme: defaultMatchState.theme }));
  }, [persistMatchState]);

  const saveTheme = useCallback((name: string) => {
    const newTheme: SavedTheme = {
      id: `theme-${Date.now()}`,
      name,
      theme: matchState.theme,
      createdAt: Date.now(),
    };
    const updatedThemes = [...savedThemes, newTheme];
    setSavedThemes(updatedThemes);
    saveSavedThemes(updatedThemes);
    return newTheme;
  }, [matchState.theme, savedThemes]);

  const loadTheme = useCallback((themeId: string) => {
    // Check preset themes first
    const presetTheme = presetThemes.find(t => t.id === themeId);
    if (presetTheme) {
      persistMatchState(prev => ({ ...prev, theme: presetTheme.theme }));
      return;
    }
    
    // Check saved themes
    const savedTheme = savedThemes.find(t => t.id === themeId);
    if (savedTheme) {
      persistMatchState(prev => ({ ...prev, theme: savedTheme.theme }));
    }
  }, [savedThemes, persistMatchState]);

  const deleteTheme = useCallback((themeId: string) => {
    const updatedThemes = savedThemes.filter(t => t.id !== themeId);
    setSavedThemes(updatedThemes);
    saveSavedThemes(updatedThemes);
  }, [savedThemes]);

  return {
    matchState,
    timerState,
    updateMatchState,
    updateHomeTeam,
    updateAwayTeam,
    addHomeGoal,
    addAwayGoal,
    addHomeCard,
    addAwayCard,
    startTimer,
    stopTimer,
    resetTimer,
    setTimerEndTime,
    setAddedTime,
    resetMatch,
    updateTheme,
    resetTheme,
    savedThemes,
    saveTheme,
    loadTheme,
    deleteTheme,
  };
};
