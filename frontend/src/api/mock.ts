import type {
  Event,
  EventTemplate,
  EventTemplateWithTasks,
  EventWithTemplate,
  SlackChannel,
  TaskTemplate,
} from '../types';

// モックデータ
const eventTemplates: EventTemplate[] = [
  { template_id: '1', template_name: 'ゲーム展示イベント' },
  { template_id: '2', template_name: '夏合宿' },
  { template_id: '3', template_name: '新歓イベント' },
];

let taskTemplates: TaskTemplate[] = [
  {
    task_id: '1',
    template_id: '1',
    task_name: 'ゲーム募集開始',
    days_before: 90,
    description: '募集要項を作成し、Webサイトに掲載する',
  },
  {
    task_id: '2',
    template_id: '1',
    task_name: '会場予約',
    days_before: 60,
    description: '会場を予約し、必要な設備を確認する',
  },
  {
    task_id: '3',
    template_id: '1',
    task_name: '出展者への連絡',
    days_before: 30,
    description: '出展者に詳細情報を送付する',
  },
  {
    task_id: '4',
    template_id: '1',
    task_name: '最終確認',
    days_before: 7,
    description: '全体の最終確認を行う',
  },
  {
    task_id: '5',
    template_id: '2',
    task_name: '宿泊施設の予約',
    days_before: 120,
    description: '宿泊施設を予約する',
  },
  {
    task_id: '6',
    template_id: '2',
    task_name: '参加者募集',
    days_before: 60,
    description: '参加者を募集し、人数を確定する',
  },
  {
    task_id: '7',
    template_id: '2',
    task_name: 'スケジュール作成',
    days_before: 30,
    description: '合宿のスケジュールを作成し共有する',
  },
];

const events: Event[] = [
  {
    event_id: '1',
    event_name: '2026年春 ゲーム展示イベント',
    template_id: '1',
    event_date: '2026-04-18',
    slack_channel_id: 'C01234567',
    slack_mention: '@運営',
  },
  {
    event_id: '2',
    event_name: '2025年冬 ゲーム展示イベント',
    template_id: '1',
    event_date: '2025-12-20',
    slack_channel_id: 'C01234567',
    slack_mention: '@運営',
  },
  {
    event_id: '3',
    event_name: '2026年夏合宿',
    template_id: '2',
    event_date: '2026-08-15',
    slack_channel_id: 'C89012345',
    slack_mention: '@here',
  },
];

const slackChannels: SlackChannel[] = [
  { id: 'C01234567', name: '#運営-general' },
  { id: 'C89012345', name: '#イベント' },
  { id: 'C11111111', name: '#夏合宿' },
  { id: 'C22222222', name: '#新歓' },
  { id: 'C33333333', name: '#開発' },
];

// 遅延をシミュレートするためのヘルパー関数
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// イベントテンプレートAPI
export const eventTemplateApi = {
  // 全テンプレート取得
  async getAll(): Promise<EventTemplate[]> {
    await delay(300);
    return [...eventTemplates];
  },

  // テンプレート検索
  async search(query: string): Promise<EventTemplate[]> {
    await delay(300);
    const lowerQuery = query.toLowerCase();
    return eventTemplates.filter((template) =>
      template.template_name.toLowerCase().includes(lowerQuery)
    );
  },

  // テンプレート取得（タスク含む）
  async getById(templateId: string): Promise<EventTemplateWithTasks | null> {
    await delay(300);
    const template = eventTemplates.find((t) => t.template_id === templateId);
    if (!template) return null;

    const tasks = taskTemplates.filter((t) => t.template_id === templateId);
    return { ...template, tasks };
  },

  // テンプレート作成
  async create(name: string): Promise<EventTemplate> {
    await delay(300);
    const newTemplate: EventTemplate = {
      template_id: String(Date.now()),
      template_name: name,
    };
    eventTemplates.push(newTemplate);
    return newTemplate;
  },

  // テンプレート更新
  async update(templateId: string, name: string): Promise<EventTemplate | null> {
    await delay(300);
    const index = eventTemplates.findIndex((t) => t.template_id === templateId);
    if (index === -1) return null;

    eventTemplates[index] = {
      ...eventTemplates[index],
      template_name: name,
    };
    return eventTemplates[index];
  },

  // テンプレート削除
  async delete(templateId: string): Promise<boolean> {
    await delay(300);
    const index = eventTemplates.findIndex((t) => t.template_id === templateId);
    if (index === -1) return false;

    eventTemplates.splice(index, 1);
    // 関連タスクも削除
    taskTemplates = taskTemplates.filter((t) => t.template_id !== templateId);
    return true;
  },
};

// タスクテンプレートAPI
export const taskTemplateApi = {
  // テンプレートIDでタスク取得
  async getByTemplateId(templateId: string): Promise<TaskTemplate[]> {
    await delay(300);
    return taskTemplates.filter((t) => t.template_id === templateId);
  },

  // タスク作成
  async create(task: Omit<TaskTemplate, 'task_id'>): Promise<TaskTemplate> {
    await delay(300);
    const newTask: TaskTemplate = {
      ...task,
      task_id: String(Date.now()),
    };
    taskTemplates.push(newTask);
    return newTask;
  },

  // タスク更新
  async update(
    taskId: string,
    updates: Partial<Omit<TaskTemplate, 'task_id'>>
  ): Promise<TaskTemplate | null> {
    await delay(300);
    const index = taskTemplates.findIndex((t) => t.task_id === taskId);
    if (index === -1) return null;

    taskTemplates[index] = {
      ...taskTemplates[index],
      ...updates,
    };
    return taskTemplates[index];
  },

  // タスク削除
  async delete(taskId: string): Promise<boolean> {
    await delay(300);
    const index = taskTemplates.findIndex((t) => t.task_id === taskId);
    if (index === -1) return false;

    taskTemplates.splice(index, 1);
    return true;
  },
};

// イベントAPI
export const eventApi = {
  // 全イベント取得
  async getAll(): Promise<EventWithTemplate[]> {
    await delay(300);
    return events.map((event) => {
      const template = eventTemplates.find((t) => t.template_id === event.template_id);
      return {
        ...event,
        template_name: template?.template_name || '不明',
      };
    });
  },

  // テンプレートIDでイベント取得
  async getByTemplateId(templateId: string): Promise<EventWithTemplate[]> {
    await delay(300);
    const template = eventTemplates.find((t) => t.template_id === templateId);
    return events
      .filter((e) => e.template_id === templateId)
      .map((event) => ({
        ...event,
        template_name: template?.template_name || '不明',
      }));
  },

  // イベントID取得
  async getById(eventId: string): Promise<EventWithTemplate | null> {
    await delay(300);
    const event = events.find((e) => e.event_id === eventId);
    if (!event) return null;

    const template = eventTemplates.find((t) => t.template_id === event.template_id);
    return {
      ...event,
      template_name: template?.template_name || '不明',
    };
  },

  // イベント作成
  async create(event: Omit<Event, 'event_id'>): Promise<Event> {
    await delay(300);
    const newEvent: Event = {
      ...event,
      event_id: String(Date.now()),
    };
    events.push(newEvent);
    return newEvent;
  },

  // イベント更新
  async update(eventId: string, updates: Partial<Omit<Event, 'event_id'>>): Promise<Event | null> {
    await delay(300);
    const index = events.findIndex((e) => e.event_id === eventId);
    if (index === -1) return null;

    events[index] = {
      ...events[index],
      ...updates,
    };
    return events[index];
  },

  // イベント削除
  async delete(eventId: string): Promise<boolean> {
    await delay(300);
    const index = events.findIndex((e) => e.event_id === eventId);
    if (index === -1) return false;

    events.splice(index, 1);
    return true;
  },
};

// SlackチャンネルAPI
export const slackApi = {
  // チャンネル一覧取得
  async getChannels(): Promise<SlackChannel[]> {
    await delay(300);
    return [...slackChannels];
  },
};
