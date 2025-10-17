
import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { dataService, SessionAnalytics } from '@/src/services/DataService';
import { useAuth } from './AuthContext';

// Types
export interface User {
  name: string;
  email: string;
}

export interface Session {
  isActive: boolean;
  currentSessionId?: string;
  mode: 'speed' | 'locked';
  speedSetting: number;
  timeSlotMultiplier: 1 | 2 | 3;
  timeSlotDuration: 15 | 30 | 50; // New: time slot duration in minutes
  slotEveryMinutes: number; // New: how often to apply slot advancement
  targetDuration: number; // minutes
  startTime?: Date;
  endTime?: Date;
  actualDuration: number; // seconds
  efficiency: {
    score: number;
    notes: string;
    suggestions: string[];
  };
}

export interface Clock {
  manipulatedTime: Date;
  speedMultiplier: number;
}

export interface Sounds {
  master: boolean;
  haptics: boolean;
  ticking: {
    enabled: boolean;
    selectedSound: string; // Sound ID from SOUND_LIBRARY
  };
  breathing: {
    enabled: boolean;
    selectedSound: string; // Sound ID from SOUND_LIBRARY
  };
  nature: {
    enabled: boolean;
    selectedSound: string; // Sound ID from SOUND_LIBRARY
  };
}

export interface Progress {
  totalSessions: number;
  totalTime: number; // minutes
  currentStreak: number;
  bestStreak: number;
  weeklyProgress: number[];
  monthlyProgress: number[];
  averageRating: number;
  averageEfficiency: number;
  completionRate: number;
}

export interface SessionHistoryItem {
  id: string;
  date: Date;
  duration: number; // seconds
  mode: 'speed' | 'locked';
  efficiency: number;
  notes: string;
  moodRating?: number;
  feedbackText?: string;
}

export interface Feedback {
  currentFeedback: {
    mood: number; // 1-5
    text: string;
  };
  aiSuggestions: string[];
}

export interface ScheduledSession {
  id: string;
  title: string;
  startTime: Date;
  duration: number; // minutes
  mode: 'speed' | 'locked';
  isRecurring: boolean;
  recurringDays?: number[]; // 0-6 (Sunday-Saturday)
  isEnabled: boolean;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  scheduledSessions: ScheduledSession[];
}

export interface AppState {
  user: User;
  session: Session;
  clock: Clock;
  sounds: Sounds;
  progress: Progress;
  history: SessionHistoryItem[];
  feedback: Feedback;
  settings: AppSettings;
  analytics: SessionAnalytics | null;
  isLoading: boolean;
  isInitialized: boolean;
}

// Initial state
const initialState: AppState = {
  user: {
    name: 'Focus User',
    email: 'user@example.com',
  },
  session: {
    isActive: false,
    mode: 'speed',
    speedSetting: 1.0,
    timeSlotMultiplier: 1,
    timeSlotDuration: 15, // Default to 15 minutes
    slotEveryMinutes: 30, // Default to every 30 minutes
    targetDuration: 25,
    actualDuration: 0,
    efficiency: {
      score: 0,
      notes: '',
      suggestions: [],
    },
  },
  clock: {
    manipulatedTime: new Date(),
    speedMultiplier: 1.0,
  },
  sounds: {
    master: true,
    haptics: true,
    ticking: {
      enabled: false,
      selectedSound: 'ticking-classic-clock', // Default to classic clock
    },
    breathing: {
      enabled: false,
      selectedSound: 'breathing-deep-calm', // Default to deep calm breathing
    },
    nature: {
      enabled: false,
      selectedSound: 'nature-gentle-rain', // Default to gentle rain
    },
  },
  progress: {
    totalSessions: 0,
    totalTime: 0,
    currentStreak: 0,
    bestStreak: 0,
    weeklyProgress: [0, 0, 0, 0, 0, 0, 0],
    monthlyProgress: Array(30).fill(0),
    averageRating: 0,
    averageEfficiency: 0,
    completionRate: 100,
  },
  history: [],
  feedback: {
    currentFeedback: {
      mood: 3,
      text: '',
    },
    aiSuggestions: [
      'Try taking a 5-minute break between sessions',
      'Consider adjusting your session length based on your energy levels',
      'Deep breathing can help improve focus',
    ],
  },
  settings: {
    theme: 'system',
    notifications: true,
    scheduledSessions: [],
  },
  analytics: null,
  isLoading: false,
  isInitialized: false,
};

// Action types
type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'SET_USER'; payload: Partial<User> }
  | { type: 'START_SESSION'; payload: { mode: 'speed' | 'locked'; targetDuration: number; sessionId?: string } }
  | { type: 'END_SESSION'; payload: { duration: number; efficiency?: number; notes?: string; mood?: number; feedback?: string } }
  | { type: 'UPDATE_SESSION'; payload: Partial<Session> }
  | { type: 'UPDATE_SOUNDS'; payload: Partial<Sounds> }
  | { type: 'UPDATE_CLOCK'; payload: Partial<Clock> }
  | { type: 'UPDATE_FEEDBACK'; payload: Partial<Feedback> }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'SET_ANALYTICS'; payload: SessionAnalytics }
  | { type: 'SET_HISTORY'; payload: SessionHistoryItem[] }
  | { type: 'SET_PROGRESS'; payload: Partial<Progress> }
  | { type: 'ADD_SCHEDULED_SESSION'; payload: ScheduledSession }
  | { type: 'UPDATE_SCHEDULED_SESSION'; payload: { id: string; updates: Partial<ScheduledSession> } }
  | { type: 'DELETE_SCHEDULED_SESSION'; payload: string }
  | { type: 'LOAD_STATE'; payload: AppState }
  | { type: 'RESET_STATE' };

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_INITIALIZED':
      return {
        ...state,
        isInitialized: action.payload,
      };

    case 'SET_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };

    case 'START_SESSION':
      return {
        ...state,
        session: {
          ...state.session,
          isActive: true,
          currentSessionId: action.payload.sessionId,
          mode: action.payload.mode,
          targetDuration: action.payload.targetDuration,
          startTime: new Date(),
          actualDuration: 0,
        },
      };

    case 'END_SESSION': {
      const newSession: SessionHistoryItem = {
        id: state.session.currentSessionId || Date.now().toString(),
        date: new Date(),
        duration: action.payload.duration,
        mode: state.session.mode,
        efficiency: action.payload.efficiency || state.session.efficiency.score,
        notes: action.payload.notes || state.session.efficiency.notes,
        moodRating: action.payload.mood,
        feedbackText: action.payload.feedback,
      };

      return {
        ...state,
        session: {
          ...state.session,
          isActive: false,
          currentSessionId: undefined,
          endTime: new Date(),
          actualDuration: action.payload.duration,
        },
        history: [newSession, ...state.history.slice(0, 49)], // Keep last 50 sessions in local state
      };
    }

    case 'UPDATE_SESSION':
      return {
        ...state,
        session: { ...state.session, ...action.payload },
      };

    case 'UPDATE_SOUNDS':
      return {
        ...state,
        sounds: { ...state.sounds, ...action.payload },
      };

    case 'UPDATE_CLOCK':
      return {
        ...state,
        clock: { ...state.clock, ...action.payload },
      };

    case 'UPDATE_FEEDBACK':
      return {
        ...state,
        feedback: { ...state.feedback, ...action.payload },
      };

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };

    case 'SET_ANALYTICS':
      return {
        ...state,
        analytics: action.payload,
        progress: {
          ...state.progress,
          totalSessions: action.payload.totalSessions,
          totalTime: action.payload.totalTime,
          currentStreak: action.payload.currentStreak,
          bestStreak: action.payload.bestStreak,
          weeklyProgress: action.payload.weeklyProgress,
          monthlyProgress: action.payload.monthlyProgress,
          averageRating: action.payload.averageMood,
          averageEfficiency: action.payload.averageEfficiency,
          completionRate: action.payload.completionRate,
        },
      };

    case 'SET_HISTORY':
      return {
        ...state,
        history: action.payload,
      };

    case 'SET_PROGRESS':
      return {
        ...state,
        progress: { ...state.progress, ...action.payload },
      };

    case 'ADD_SCHEDULED_SESSION':
      return {
        ...state,
        settings: {
          ...state.settings,
          scheduledSessions: [...state.settings.scheduledSessions, action.payload],
        },
      };

    case 'UPDATE_SCHEDULED_SESSION':
      return {
        ...state,
        settings: {
          ...state.settings,
          scheduledSessions: state.settings.scheduledSessions.map(session =>
            session.id === action.payload.id
              ? { ...session, ...action.payload.updates }
              : session
          ),
        },
      };

    case 'DELETE_SCHEDULED_SESSION':
      return {
        ...state,
        settings: {
          ...state.settings,
          scheduledSessions: state.settings.scheduledSessions.filter(
            session => session.id !== action.payload
          ),
        },
      };

    case 'LOAD_STATE':
      return action.payload;

    case 'RESET_STATE':
      return initialState;

    default:
      return state;
  }
}

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  actions: {
    initializeUser: () => Promise<void>;
    startSession: (mode: 'speed' | 'locked', targetDuration: number) => Promise<void>;
    endSession: (duration: number, efficiency?: number, notes?: string, mood?: number, feedback?: string) => Promise<void>;
    updateSounds: (sounds: Partial<Sounds>) => Promise<void>;
    refreshAnalytics: () => Promise<void>;
    loadRecentHistory: () => Promise<void>;
  };
} | null>(null);

// Provider
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { user } = useAuth();

  const initializeUser = useCallback(async () => {
    if (!user) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      console.log('Initializing user data...');

      // Get or create user profile
      let profile = await dataService.getProfile(user.id);
      if (!profile) {
        const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'Focus User';
        profile = await dataService.createProfile(user.id, userName, user.email || '');
      }

      if (profile) {
        dispatch({ 
          type: 'SET_USER', 
          payload: { 
            name: profile.name || 'Focus User', 
            email: user.email || '' 
          } 
        });
      }

      // Get or create user settings
      const settings = await dataService.getUserSettings(user.id);
      if (settings) {
        dispatch({
          type: 'UPDATE_SOUNDS',
          payload: {
            master: settings.sounds_master ?? true,
            haptics: settings.sounds_haptics ?? true,
            ticking: {
              enabled: settings.sounds_ticking ?? false,
              selectedSound: settings.sound_ticking_type ?? 'ticking-classic-clock',
            },
            breathing: {
              enabled: settings.sounds_breathing ?? false,
              selectedSound: settings.sound_breathing_type ?? 'breathing-deep-calm',
            },
            nature: {
              enabled: settings.sounds_nature ?? false,
              selectedSound: settings.sound_nature_type ?? 'nature-gentle-rain',
            },
          },
        });

        dispatch({
          type: 'UPDATE_SESSION',
          payload: {
            speedSetting: settings.speed_multiplier ?? 1.0,
            timeSlotMultiplier: (settings.time_slot_multiplier as 1 | 2 | 3) ?? 1,
          },
        });
      }

      // Initialize with sample data if no sessions exist (for demo purposes)
      await dataService.initializeUserWithSampleData(user.id);

      // Load analytics and history
      await refreshAnalytics();
      await loadRecentHistory();

      dispatch({ type: 'SET_INITIALIZED', payload: true });
      console.log('User initialization complete');
    } catch (error) {
      console.error('Error initializing user:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [user]);

  const startSession = useCallback(async (mode: 'speed' | 'locked', targetDuration: number) => {
    if (!user) return;

    try {
      console.log('Starting session:', { mode, targetDuration });
      
      const sessionRecord = await dataService.createSession(user.id, {
        mode,
        target_duration: targetDuration,
        speed_multiplier: state.session.speedSetting,
        time_slot_multiplier: state.session.timeSlotMultiplier,
      });

      if (sessionRecord) {
        dispatch({
          type: 'START_SESSION',
          payload: {
            mode,
            targetDuration,
            sessionId: sessionRecord.id,
          },
        });
      }
    } catch (error) {
      console.error('Error starting session:', error);
    }
  }, [user, state.session.speedSetting, state.session.timeSlotMultiplier]);

  const endSession = useCallback(async (
    duration: number, 
    efficiency?: number, 
    notes?: string, 
    mood?: number, 
    feedback?: string
  ) => {
    if (!user || !state.session.currentSessionId) return;

    try {
      console.log('Ending session:', { duration, efficiency, notes, mood, feedback });
      
      const completedSession = await dataService.completeSession(state.session.currentSessionId, {
        actual_duration: duration,
        efficiency_score: efficiency,
        efficiency_notes: notes,
        mood_rating: mood,
        feedback_text: feedback,
      });

      if (completedSession) {
        dispatch({
          type: 'END_SESSION',
          payload: {
            duration,
            efficiency,
            notes,
            mood,
            feedback,
          },
        });

        // Refresh analytics after completing a session
        setTimeout(() => {
          refreshAnalytics();
          loadRecentHistory();
        }, 1000);
      }
    } catch (error) {
      console.error('Error ending session:', error);
    }
  }, [user, state.session.currentSessionId]);

  const updateSounds = useCallback(async (sounds: Partial<Sounds>) => {
    if (!user) return;

    try {
      dispatch({ type: 'UPDATE_SOUNDS', payload: sounds });

      // Update settings in database
      const updates: any = {};
      if (sounds.master !== undefined) updates.sounds_master = sounds.master;
      if (sounds.haptics !== undefined) updates.sounds_haptics = sounds.haptics;
      if (sounds.ticking?.enabled !== undefined) updates.sounds_ticking = sounds.ticking.enabled;
      if (sounds.breathing?.enabled !== undefined) updates.sounds_breathing = sounds.breathing.enabled;
      if (sounds.nature?.enabled !== undefined) updates.sounds_nature = sounds.nature.enabled;
      if (sounds.ticking?.selectedSound) updates.sound_ticking_type = sounds.ticking.selectedSound;
      if (sounds.breathing?.selectedSound) updates.sound_breathing_type = sounds.breathing.selectedSound;
      if (sounds.nature?.selectedSound) updates.sound_nature_type = sounds.nature.selectedSound;

      if (Object.keys(updates).length > 0) {
        await dataService.updateUserSettings(user.id, updates);
      }
    } catch (error) {
      console.error('Error updating sounds:', error);
    }
  }, [user]);

  const refreshAnalytics = useCallback(async () => {
    if (!user) return;

    try {
      console.log('Refreshing analytics...');
      const analytics = await dataService.getSessionAnalytics(user.id);
      dispatch({ type: 'SET_ANALYTICS', payload: analytics });
    } catch (error) {
      console.error('Error refreshing analytics:', error);
    }
  }, [user]);

  const loadRecentHistory = useCallback(async () => {
    if (!user) return;

    try {
      console.log('Loading recent history...');
      const sessions = await dataService.getUserSessions(user.id, 20);
      const history: SessionHistoryItem[] = sessions
        .filter(s => s.completed_at)
        .map(s => ({
          id: s.id,
          date: new Date(s.completed_at!),
          duration: s.actual_duration || 0,
          mode: s.mode,
          efficiency: s.efficiency_score || 0,
          notes: s.efficiency_notes || '',
          moodRating: s.mood_rating || undefined,
          feedbackText: s.feedback_text || undefined,
        }));

      dispatch({ type: 'SET_HISTORY', payload: history });
    } catch (error) {
      console.error('Error loading recent history:', error);
    }
  }, [user]);

  // Initialize user data when authenticated
  useEffect(() => {
    if (user && !state.isInitialized) {
      initializeUser();
    }
  }, [user, state.isInitialized, initializeUser]);

  // Load state from AsyncStorage on mount (for offline data)
  useEffect(() => {
    loadLocalState();
  }, []);

  // Save state to AsyncStorage whenever it changes (for offline data)
  useEffect(() => {
    if (state.isInitialized) {
      saveLocalState(state);
    }
  }, [state]);

  const loadLocalState = async () => {
    try {
      const savedState = await AsyncStorage.getItem('adhd_focus_app_state');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        // Only load non-server data from local storage
        dispatch({
          type: 'UPDATE_FEEDBACK',
          payload: parsedState.feedback || initialState.feedback,
        });
      }
    } catch (error) {
      console.log('Error loading local state:', error);
    }
  };

  const saveLocalState = async (stateToSave: AppState) => {
    try {
      // Only save non-server data to local storage
      const localData = {
        feedback: stateToSave.feedback,
        settings: stateToSave.settings,
      };
      await AsyncStorage.setItem('adhd_focus_app_state', JSON.stringify(localData));
    } catch (error) {
      console.log('Error saving local state:', error);
    }
  };

  const actions = {
    initializeUser,
    startSession,
    endSession,
    updateSounds,
    refreshAnalytics,
    loadRecentHistory,
  };

  return (
    <AppContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </AppContext.Provider>
  );
}

// Hook
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
