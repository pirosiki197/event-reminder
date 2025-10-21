import { create } from 'zustand';
import { eventApi, eventTemplateApi, slackApi, taskTemplateApi } from '../api/mock';
import type {
  EventTemplate,
  EventTemplateWithTasks,
  EventWithTemplate,
  SlackChannel,
} from '../types';

interface AppState {
  // データ
  templates: EventTemplate[];
  currentTemplate: EventTemplateWithTasks | null;
  events: EventWithTemplate[];
  slackChannels: SlackChannel[];

  // ローディング状態
  isLoading: boolean;

  // アクション: テンプレート
  fetchTemplates: () => Promise<void>;
  searchTemplates: (query: string) => Promise<void>;
  fetchTemplateById: (templateId: string) => Promise<void>;
  createTemplate: (name: string) => Promise<EventTemplate>;
  updateTemplate: (templateId: string, name: string) => Promise<void>;
  deleteTemplate: (templateId: string) => Promise<void>;

  // アクション: タスク
  createTask: (task: {
    template_id: string;
    task_name: string;
    days_before: number;
    description: string;
  }) => Promise<void>;
  updateTask: (
    taskId: string,
    updates: {
      task_name?: string;
      days_before?: number;
      description?: string;
    }
  ) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;

  // アクション: イベント
  fetchEvents: () => Promise<void>;
  fetchEventsByTemplateId: (templateId: string) => Promise<void>;
  createEvent: (event: {
    event_name: string;
    template_id: string;
    event_date: string;
    slack_channel_id: string;
    slack_mention: string;
  }) => Promise<void>;
  updateEvent: (
    eventId: string,
    updates: {
      event_name?: string;
      template_id?: string;
      event_date?: string;
      slack_channel_id?: string;
      slack_mention?: string;
    }
  ) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;

  // アクション: Slack
  fetchSlackChannels: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // 初期状態
  templates: [],
  currentTemplate: null,
  events: [],
  slackChannels: [],
  isLoading: false,

  // テンプレート関連
  fetchTemplates: async () => {
    set({ isLoading: true });
    try {
      const templates = await eventTemplateApi.getAll();
      set({ templates, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      set({ isLoading: false });
    }
  },

  searchTemplates: async (query: string) => {
    set({ isLoading: true });
    try {
      const templates = await eventTemplateApi.search(query);
      set({ templates, isLoading: false });
    } catch (error) {
      console.error('Failed to search templates:', error);
      set({ isLoading: false });
    }
  },

  fetchTemplateById: async (templateId: string) => {
    set({ isLoading: true });
    try {
      const template = await eventTemplateApi.getById(templateId);
      set({ currentTemplate: template, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch template:', error);
      set({ isLoading: false });
    }
  },

  createTemplate: async (name: string) => {
    set({ isLoading: true });
    try {
      const newTemplate = await eventTemplateApi.create(name);
      set((state) => ({
        templates: [...state.templates, newTemplate],
        isLoading: false,
      }));
      return newTemplate;
    } catch (error) {
      console.error('Failed to create template:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  updateTemplate: async (templateId: string, name: string) => {
    set({ isLoading: true });
    try {
      const updated = await eventTemplateApi.update(templateId, name);
      if (updated) {
        set((state) => ({
          templates: state.templates.map((t) => (t.template_id === templateId ? updated : t)),
          currentTemplate:
            state.currentTemplate?.template_id === templateId
              ? { ...state.currentTemplate, template_name: name }
              : state.currentTemplate,
          isLoading: false,
        }));
      }
    } catch (error) {
      console.error('Failed to update template:', error);
      set({ isLoading: false });
    }
  },

  deleteTemplate: async (templateId: string) => {
    set({ isLoading: true });
    try {
      await eventTemplateApi.delete(templateId);
      set((state) => ({
        templates: state.templates.filter((t) => t.template_id !== templateId),
        currentTemplate:
          state.currentTemplate?.template_id === templateId ? null : state.currentTemplate,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to delete template:', error);
      set({ isLoading: false });
    }
  },

  // タスク関連
  createTask: async (task) => {
    set({ isLoading: true });
    try {
      const newTask = await taskTemplateApi.create(task);
      set((state) => ({
        currentTemplate: state.currentTemplate
          ? {
              ...state.currentTemplate,
              tasks: [...state.currentTemplate.tasks, newTask],
            }
          : null,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to create task:', error);
      set({ isLoading: false });
    }
  },

  updateTask: async (taskId, updates) => {
    set({ isLoading: true });
    try {
      const updated = await taskTemplateApi.update(taskId, updates);
      if (updated) {
        set((state) => ({
          currentTemplate: state.currentTemplate
            ? {
                ...state.currentTemplate,
                tasks: state.currentTemplate.tasks.map((t) => (t.task_id === taskId ? updated : t)),
              }
            : null,
          isLoading: false,
        }));
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      set({ isLoading: false });
    }
  },

  deleteTask: async (taskId) => {
    set({ isLoading: true });
    try {
      await taskTemplateApi.delete(taskId);
      set((state) => ({
        currentTemplate: state.currentTemplate
          ? {
              ...state.currentTemplate,
              tasks: state.currentTemplate.tasks.filter((t) => t.task_id !== taskId),
            }
          : null,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to delete task:', error);
      set({ isLoading: false });
    }
  },

  // イベント関連
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

  fetchEventsByTemplateId: async (templateId: string) => {
    set({ isLoading: true });
    try {
      const events = await eventApi.getByTemplateId(templateId);
      set({ events, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch events:', error);
      set({ isLoading: false });
    }
  },

  createEvent: async (event) => {
    set({ isLoading: true });
    try {
      const _newEvent = await eventApi.create(event);
      // イベント一覧を再取得
      await get().fetchEventsByTemplateId(event.template_id);
      set({ isLoading: false });
    } catch (error) {
      console.error('Failed to create event:', error);
      set({ isLoading: false });
    }
  },

  updateEvent: async (eventId, updates) => {
    set({ isLoading: true });
    try {
      await eventApi.update(eventId, updates);
      // イベント一覧を再取得
      const events = await eventApi.getAll();
      set({ events, isLoading: false });
    } catch (error) {
      console.error('Failed to update event:', error);
      set({ isLoading: false });
    }
  },

  deleteEvent: async (eventId) => {
    set({ isLoading: true });
    try {
      await eventApi.delete(eventId);
      set((state) => ({
        events: state.events.filter((e) => e.event_id !== eventId),
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to delete event:', error);
      set({ isLoading: false });
    }
  },

  // Slack関連
  fetchSlackChannels: async () => {
    set({ isLoading: true });
    try {
      const channels = await slackApi.getChannels();
      set({ slackChannels: channels, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch slack channels:', error);
      set({ isLoading: false });
    }
  },
}));
