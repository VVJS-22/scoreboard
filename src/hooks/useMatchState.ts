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

export interface MatchState {
  homeTeam: TeamData;
  awayTeam: TeamData;
  stadium: string;
  league: string;
  matchDate: string;
  timerMinutes: number;
  timerSeconds: number;
  isTimerRunning: boolean;
  theme: ThemeSettings;
}

const STORAGE_KEY = "match-state";
const TIMER_KEY = "match-timer";

const defaultMatchState: MatchState = {
  homeTeam: {
    name: "BRAZIL",
    shortName: "BRA",
    logo: "🇦🇷",
    score: 0,
    goals: [],
    cards: [],
  },
  awayTeam: {
    name: "ARGENTINA",
    shortName: "ARG",
    logo: "🇧🇷",
    score: 0,
    goals: [],
    cards: [],
  },
  stadium: "Maracanã Stadium",
  league: "FIFA WORLD CUP",
  matchDate: "17.11.2021 - 10:30",
  timerMinutes: 0,
  timerSeconds: 0,
  isTimerRunning: false,
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
    awayTeamColor: "#b82c5d",
    homeBadgeBackground: "radial-gradient(circle at center, hsla(200, 70%, 65%, 0.2), transparent 70%)",
    awayBadgeBackground: "radial-gradient(circle at center, hsla(340, 70%, 30%, 0.2), transparent 70%)",
    leagueIconBackground: "#fbbf24",
    goalCardBackground: "rgba(255, 255, 255, 0.05)",
    goalCardTextColor: "#94a3b8",
  },
};

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

// Global interval ID to ensure only one timer runs across all hook instances
let globalTimerInterval: NodeJS.Timeout | null = null;
let activeHookCount = 0;

export const useMatchState = () => {
  const [matchState, setMatchState] = useState<MatchState>(getStoredState);
  const [timerState, setTimerState] = useState(getStoredTimer);
  const hideAddedTimeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync timer to state
  useEffect(() => {
    setMatchState(prev => ({
      ...prev,
      timerMinutes: timerState.minutes,
      timerSeconds: timerState.seconds,
      isTimerRunning: timerState.isRunning,
    }));
  }, [timerState]);

  // Listen for storage events from other tabs (real-time sync)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const newState = JSON.parse(e.newValue);
          setMatchState(prev => ({ ...prev, ...newState }));
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
    return () => window.removeEventListener("storage", handleStorage);
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
          if (newTimer.minutes >= totalEndTime) {
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

  const updateMatchState = useCallback((updates: Partial<MatchState>) => {
    setMatchState(prev => {
      const newState = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      // Dispatch custom event for same-tab updates
      window.dispatchEvent(new CustomEvent("match-state-update", { detail: newState }));
      return newState;
    });
  }, []);

  const updateHomeTeam = useCallback((updates: Partial<TeamData>) => {
    setMatchState(prev => {
      const newState = { ...prev, homeTeam: { ...prev.homeTeam, ...updates } };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      window.dispatchEvent(new CustomEvent("match-state-update", { detail: newState }));
      return newState;
    });
  }, []);

  const updateAwayTeam = useCallback((updates: Partial<TeamData>) => {
    setMatchState(prev => {
      const newState = { ...prev, awayTeam: { ...prev.awayTeam, ...updates } };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      window.dispatchEvent(new CustomEvent("match-state-update", { detail: newState }));
      return newState;
    });
  }, []);

  const addHomeGoal = useCallback((player: string) => {
    setTimerState(currentTimer => {
      setMatchState(prev => {
        const newGoal: GoalEvent = { player, minute: currentTimer.minutes, second: currentTimer.seconds };
        const newState = {
          ...prev,
          homeTeam: {
            ...prev.homeTeam,
            score: prev.homeTeam.score + 1,
            goals: [...prev.homeTeam.goals, newGoal],
          },
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
        window.dispatchEvent(new CustomEvent("match-state-update", { detail: newState }));
        return newState;
      });
      return currentTimer;
    });
  }, []);

  const addAwayGoal = useCallback((player: string) => {
    setTimerState(currentTimer => {
      setMatchState(prev => {
        const newGoal: GoalEvent = { player, minute: currentTimer.minutes, second: currentTimer.seconds };
        const newState = {
          ...prev,
          awayTeam: {
            ...prev.awayTeam,
            score: prev.awayTeam.score + 1,
            goals: [...prev.awayTeam.goals, newGoal],
          },
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
        window.dispatchEvent(new CustomEvent("match-state-update", { detail: newState }));
        return newState;
      });
      return currentTimer;
    });
  }, []);

  const addHomeCard = useCallback((player: string, type: "yellow" | "red") => {
    setTimerState(currentTimer => {
      setMatchState(prev => {
        const newCard: CardEvent = { player, minute: currentTimer.minutes, second: currentTimer.seconds, type };
        const newState = {
          ...prev,
          homeTeam: {
            ...prev.homeTeam,
            cards: [...prev.homeTeam.cards, newCard],
          },
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
        window.dispatchEvent(new CustomEvent("match-state-update", { detail: newState }));
        return newState;
      });
      return currentTimer;
    });
  }, []);

  const addAwayCard = useCallback((player: string, type: "yellow" | "red") => {
    setTimerState(currentTimer => {
      setMatchState(prev => {
        const newCard: CardEvent = { player, minute: currentTimer.minutes, second: currentTimer.seconds, type };
        const newState = {
          ...prev,
          awayTeam: {
            ...prev.awayTeam,
            cards: [...prev.awayTeam.cards, newCard],
          },
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
        window.dispatchEvent(new CustomEvent("match-state-update", { detail: newState }));
        return newState;
      });
      return currentTimer;
    });
  }, []);

  const startTimer = useCallback(() => {
    setTimerState(prev => {
      const newTimer = { ...prev, isRunning: true, lastUpdate: Date.now() };
      localStorage.setItem(TIMER_KEY, JSON.stringify(newTimer));
      return newTimer;
    });
  }, []);

  const stopTimer = useCallback(() => {
    setTimerState(prev => {
      const newTimer = { ...prev, isRunning: false, lastUpdate: Date.now() };
      localStorage.setItem(TIMER_KEY, JSON.stringify(newTimer));
      return newTimer;
    });
  }, []);

  const resetTimer = useCallback(() => {
    const newTimer = { minutes: 0, seconds: 0, isRunning: false, endMinutes: null, addedTime: 0, showAddedTime: false, lastUpdate: Date.now() };
    setTimerState(newTimer);
    localStorage.setItem(TIMER_KEY, JSON.stringify(newTimer));
  }, []);

  const setTimerEndTime = useCallback((endMinutes: number | null) => {
    setTimerState(prev => {
      const newTimer = { ...prev, endMinutes, lastUpdate: Date.now() };
      localStorage.setItem(TIMER_KEY, JSON.stringify(newTimer));
      return newTimer;
    });
  }, []);

  const setAddedTime = useCallback((minutes: number) => {
    // Clear any existing timeout
    if (hideAddedTimeTimeoutRef.current) {
      clearTimeout(hideAddedTimeTimeoutRef.current);
    }

    setTimerState(prev => {
      // Auto-start timer when adding injury time if it was stopped
      const shouldStart = minutes > 0 && !prev.isRunning;
      const newTimer = { 
        ...prev, 
        addedTime: minutes, 
        showAddedTime: minutes > 0, 
        isRunning: shouldStart ? true : prev.isRunning,
        lastUpdate: Date.now() 
      };
      localStorage.setItem(TIMER_KEY, JSON.stringify(newTimer));
      return newTimer;
    });
    
    // Hide the added time notification after 3 seconds
    if (minutes > 0) {
      hideAddedTimeTimeoutRef.current = setTimeout(() => {
        setTimerState(current => {
          const updated = { ...current, showAddedTime: false, lastUpdate: Date.now() };
          localStorage.setItem(TIMER_KEY, JSON.stringify(updated));
          return updated;
        });
      }, 3000);
    }
  }, []);

  const resetMatch = useCallback(() => {
    setMatchState(defaultMatchState);
    setTimerState({ minutes: 0, seconds: 0, isRunning: false, endMinutes: null, addedTime: 0, showAddedTime: false, lastUpdate: Date.now() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultMatchState));
    localStorage.setItem(TIMER_KEY, JSON.stringify({ minutes: 0, seconds: 0, isRunning: false, endMinutes: null, addedTime: 0, showAddedTime: false }));
    window.dispatchEvent(new CustomEvent("match-state-update", { detail: defaultMatchState }));
  }, []);

  const updateTheme = useCallback((updates: Partial<ThemeSettings>) => {
    setMatchState(prev => {
      const newState = { ...prev, theme: { ...prev.theme, ...updates } };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      window.dispatchEvent(new CustomEvent("match-state-update", { detail: newState }));
      return newState;
    });
  }, []);

  const resetTheme = useCallback(() => {
    setMatchState(prev => {
      const newState = { ...prev, theme: defaultMatchState.theme };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      window.dispatchEvent(new CustomEvent("match-state-update", { detail: newState }));
      return newState;
    });
  }, []);

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
  };
};
