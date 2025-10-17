
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface User {
  name: string;
  email: string;
}

export interface Session {
  isActive: boolean;
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
  weeklyProgress: number[];
  averageRating: number;
}

export interface SessionHistoryItem {
  id: string;
  date: Date;
  duration: number; // seconds
  mode: 'speed' | 'locked';
  efficiency: number;
  notes: string;
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
    weeklyProgress: [0, 0, 0, 0, 0, 0, 0],
    averageRating: 0,
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
};

// Action types
type AppAction =
  | { type: 'SET_USER'; payload: Partial<User> }
  | { type: 'START_SESSION'; payload: { mode: 'speed' | 'locked'; targetDuration: number } }
  | { type: 'END_SESSION'; payload: { duration: number } }
  | { type: 'UPDATE_SESSION'; payload: Partial<Session> }
  | { type: 'UPDATE_SOUNDS'; payload: Partial<Sounds> }
  | { type: 'UPDATE_CLOCK'; payload: Partial<Clock> }
  | { type: 'UPDATE_FEEDBACK'; payload: Partial<Feedback> }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'ADD_SCHEDULED_SESSION'; payload: ScheduledSession }
  | { type: 'UPDATE_SCHEDULED_SESSION'; payload: { id: string; updates: Partial<ScheduledSession> } }
  | { type: 'DELETE_SCHEDULED_SESSION'; payload: string }
  | { type: 'LOAD_STATE'; payload: AppState }
  | { type: 'RESET_STATE' };

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
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
          mode: action.payload.mode,
          targetDuration: action.payload.targetDuration,
          startTime: new Date(),
          actualDuration: 0,
        },
      };

    case 'END_SESSION': {
      const newSession: SessionHistoryItem = {
        id: Date.now().toString(),
        date: new Date(),
        duration: action.payload.duration,
        mode: state.session.mode,
        efficiency: state.session.efficiency.score,
        notes: state.session.efficiency.notes,
      };

      const newWeeklyProgress = [...state.progress.weeklyProgress];
      const today = new Date().getDay();
      newWeeklyProgress[today] += action.payload.duration / 60; // Convert to minutes

      return {
        ...state,
        session: {
          ...state.session,
          isActive: false,
          endTime: new Date(),
          actualDuration: action.payload.duration,
        },
        history: [newSession, ...state.history],
        progress: {
          ...state.progress,
          totalSessions: state.progress.totalSessions + 1,
          totalTime: state.progress.totalTime + action.payload.duration / 60,
          currentStreak: state.progress.currentStreak + 1,
          weeklyProgress: newWeeklyProgress,
        },
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
} | null>(null);

// Provider
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load state from AsyncStorage on mount
  useEffect(() => {
    loadState();
  }, []);

  // Save state to AsyncStorage whenever it changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  const loadState = async () => {
    try {
      const savedState = await AsyncStorage.getItem('adhd_focus_app_state');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        // Convert date strings back to Date objects
        if (parsedState.session.startTime) {
          parsedState.session.startTime = new Date(parsedState.session.startTime);
        }
        if (parsedState.session.endTime) {
          parsedState.session.endTime = new Date(parsedState.session.endTime);
        }
        parsedState.clock.manipulatedTime = new Date(parsedState.clock.manipulatedTime);
        parsedState.history = parsedState.history.map((item: any) => ({
          ...item,
          date: new Date(item.date),
        }));
        
        // Handle scheduled sessions dates
        if (parsedState.settings?.scheduledSessions) {
          parsedState.settings.scheduledSessions = parsedState.settings.scheduledSessions.map((session: any) => ({
            ...session,
            startTime: new Date(session.startTime),
          }));
        }
        
        // Ensure settings exist with defaults
        if (!parsedState.settings) {
          parsedState.settings = initialState.settings;
        }
        
        dispatch({ type: 'LOAD_STATE', payload: parsedState });
      }
    } catch (error) {
      console.log('Error loading state:', error);
    }
  };

  const saveState = async (stateToSave: AppState) => {
    try {
      await AsyncStorage.setItem('adhd_focus_app_state', JSON.stringify(stateToSave));
    } catch (error) {
      console.log('Error saving state:', error);
    }
  };

  return (
    <AppContext.Provider value={{ state, dispatch }}>
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
