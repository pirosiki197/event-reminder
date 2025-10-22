import { create } from 'zustand';
import { defaultTaskApi, eventApi, holdingApi, holdingTaskApi, traqApi } from '../api/api';
import type {
  Event,
  EventWithTasks,
  HoldingWithEvent,
  HoldingWithTasks,
  TraQChannel,
} from '../types';

interface AppState {
  // データ
  events: Event[];
  currentEvent: EventWithTasks | null;
  holdings: HoldingWithEvent[];
  currentHolding: HoldingWithTasks | null;
  traQChannels: TraQChannel[];

  // ローディング状態
  isLoading: boolean;

  // アクション: イベント (旧: テンプレート)
  fetchEvents: () => Promise<void>;
  searchEvents: (query: string) => Promise<void>;
  fetchEventById: (eventId: string) => Promise<void>;
  createEvent: (name: string) => Promise<Event>;
  updateEvent: (eventId: string, name: string) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;

  // アクション: デフォルトタスク (旧: タスクテンプレート)
  createDefaultTask: (task: {
    eventId: string;
    name: string;
    daysBefore: number;
    description: string;
  }) => Promise<void>;
  updateDefaultTask: (
    taskId: string,
    updates: {
      name?: string;
      daysBefore?: number;
      description?: string;
    }
  ) => Promise<void>;
  deleteDefaultTask: (taskId: string) => Promise<void>;

  // アクション: 開催 (旧: イベント)
  fetchHoldings: () => Promise<void>;
  fetchHoldingsByEventId: (eventId: string) => Promise<void>;
  fetchHoldingById: (holdingId: string) => Promise<void>;
  createHolding: (holding: {
    name: string;
    eventId: string;
    date: string;
    channelId: string;
    mention: string;
  }) => Promise<void>;
  updateHolding: (
    holdingId: string,
    updates: {
      name?: string;
      eventId?: string;
      date?: string;
      channelId?: string;
      mention?: string;
    }
  ) => Promise<void>;
  deleteHolding: (holdingId: string) => Promise<void>;

  // アクション: 開催タスク (新規)
  createHoldingTask: (task: {
    holdingId: string;
    name: string;
    daysBefore: number;
    description: string;
  }) => Promise<void>;
  updateHoldingTask: (
    taskId: string,
    updates: {
      name?: string;
      daysBefore?: number;
      description?: string;
    }
  ) => Promise<void>;
  deleteHoldingTask: (taskId: string) => Promise<void>;

  // アクション: Slack
  fetchTraQChannels: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // 初期状態
  events: [],
  currentEvent: null,
  holdings: [],
  currentHolding: null,
  traQChannels: [],
  isLoading: false,

  // イベント関連 (旧: テンプレート)
  fetchEvents: async () => {
    set({ isLoading: true });
    try {
      const events = await eventApi.getAll();
      set({ events, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch events:', error);
      set({ isLoading: false });
    }
  },

  searchEvents: async (query: string) => {
    set({ isLoading: true });
    try {
      const events = await eventApi.getAll(query);
      set({ events, isLoading: false });
    } catch (error) {
      console.error('Failed to search events:', error);
      set({ isLoading: false });
    }
  },

  fetchEventById: async (eventId: string) => {
    set({ isLoading: true });
    try {
      const event = await eventApi.getById(eventId);
      set({ currentEvent: event, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch event:', error);
      set({ isLoading: false });
    }
  },

  createEvent: async (name: string) => {
    set({ isLoading: true });
    try {
      const newEvent = await eventApi.create(name);
      set((state) => ({
        events: [...state.events, newEvent],
        isLoading: false,
      }));
      return newEvent;
    } catch (error) {
      console.error('Failed to create event:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  updateEvent: async (eventId: string, name: string) => {
    set({ isLoading: true });
    try {
      const updated = await eventApi.update(eventId, name);
      if (updated) {
        set((state) => ({
          events: state.events.map((e) => (e.id === eventId ? updated : e)),
          currentEvent:
            state.currentEvent?.id === eventId
              ? { ...state.currentEvent, name: name }
              : state.currentEvent,
          isLoading: false,
        }));
      }
    } catch (error) {
      console.error('Failed to update event:', error);
      set({ isLoading: false });
    }
  },

  deleteEvent: async (eventId: string) => {
    set({ isLoading: true });
    try {
      await eventApi.delete(eventId);
      set((state) => ({
        events: state.events.filter((e) => e.id !== eventId),
        currentEvent: state.currentEvent?.id === eventId ? null : state.currentEvent,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to delete event:', error);
      set({ isLoading: false });
    }
  },

  // デフォルトタスク関連 (旧: タスクテンプレート)
  createDefaultTask: async (task) => {
    set({ isLoading: true });
    try {
      const newTask = await defaultTaskApi.create(task);
      set((state) => ({
        currentEvent: state.currentEvent
          ? {
              ...state.currentEvent,
              tasks: [...state.currentEvent.tasks, newTask],
            }
          : null,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to create default task:', error);
      set({ isLoading: false });
    }
  },

  updateDefaultTask: async (taskId, updates) => {
    set({ isLoading: true });
    try {
      const updated = await defaultTaskApi.update(taskId, updates);
      if (updated) {
        set((state) => ({
          currentEvent: state.currentEvent
            ? {
                ...state.currentEvent,
                tasks: state.currentEvent.tasks.map((t) => (t.id === taskId ? updated : t)),
              }
            : null,
          isLoading: false,
        }));
      }
    } catch (error) {
      console.error('Failed to update default task:', error);
      set({ isLoading: false });
    }
  },

  deleteDefaultTask: async (taskId) => {
    set({ isLoading: true });
    try {
      await defaultTaskApi.delete(taskId);
      set((state) => ({
        currentEvent: state.currentEvent
          ? {
              ...state.currentEvent,
              tasks: state.currentEvent.tasks.filter((t) => t.id !== taskId),
            }
          : null,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to delete default task:', error);
      set({ isLoading: false });
    }
  },

  // 開催関連 (旧: イベント)
  fetchHoldings: async () => {
    set({ isLoading: true });
    try {
      const holdings = await holdingApi.getAll();
      set({ holdings, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch holdings:', error);
      set({ isLoading: false });
    }
  },

  fetchHoldingsByEventId: async (eventId: string) => {
    set({ isLoading: true });
    try {
      const holdings = await holdingApi.getAll(eventId);
      set({ holdings, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch holdings:', error);
      set({ isLoading: false });
    }
  },

  fetchHoldingById: async (holdingId: string) => {
    set({ isLoading: true });
    try {
      const holding = await holdingApi.getById(holdingId);
      set({ currentHolding: holding, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch holding:', error);
      set({ isLoading: false });
    }
  },

  createHolding: async (holding) => {
    set({ isLoading: true });
    try {
      const _newHolding = await holdingApi.create(holding);
      // 開催一覧を再取得
      await get().fetchHoldingsByEventId(holding.eventId);
      set({ isLoading: false });
    } catch (error) {
      console.error('Failed to create holding:', error);
      set({ isLoading: false });
    }
  },

  updateHolding: async (holdingId, updates) => {
    set({ isLoading: true });
    try {
      await holdingApi.update(holdingId, updates);
      // 開催一覧を再取得
      const holdings = await holdingApi.getAll();
      set({ holdings, isLoading: false });
    } catch (error) {
      console.error('Failed to update holding:', error);
      set({ isLoading: false });
    }
  },

  deleteHolding: async (holdingId) => {
    set({ isLoading: true });
    try {
      await holdingApi.delete(holdingId);
      set((state) => ({
        holdings: state.holdings.filter((h) => h.id !== holdingId),
        currentHolding: state.currentHolding?.id === holdingId ? null : state.currentHolding,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to delete holding:', error);
      set({ isLoading: false });
    }
  },

  // 開催タスク関連 (新規)
  createHoldingTask: async (task) => {
    set({ isLoading: true });
    try {
      const newTask = await holdingTaskApi.create(task);
      set((state) => ({
        currentHolding: state.currentHolding
          ? {
              ...state.currentHolding,
              tasks: [...state.currentHolding.tasks, newTask],
            }
          : null,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to create holding task:', error);
      set({ isLoading: false });
    }
  },

  updateHoldingTask: async (taskId, updates) => {
    set({ isLoading: true });
    try {
      const updated = await holdingTaskApi.update(taskId, updates);
      if (updated) {
        set((state) => ({
          currentHolding: state.currentHolding
            ? {
                ...state.currentHolding,
                tasks: state.currentHolding.tasks.map((t) => (t.id === taskId ? updated : t)),
              }
            : null,
          isLoading: false,
        }));
      }
    } catch (error) {
      console.error('Failed to update holding task:', error);
      set({ isLoading: false });
    }
  },

  deleteHoldingTask: async (taskId) => {
    set({ isLoading: true });
    try {
      await holdingTaskApi.delete(taskId);
      set((state) => ({
        currentHolding: state.currentHolding
          ? {
              ...state.currentHolding,
              tasks: state.currentHolding.tasks.filter((t) => t.id !== taskId),
            }
          : null,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to delete holding task:', error);
      set({ isLoading: false });
    }
  },

  // Slack関連
  fetchTraQChannels: async () => {
    set({ isLoading: true });
    try {
      const channels = await traqApi.getChannels();
      set({ traQChannels: channels, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch slack channels:', error);
      set({ isLoading: false });
    }
  },
}));
