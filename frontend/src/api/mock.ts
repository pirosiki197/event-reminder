import type {
  DefaultTask,
  Event,
  EventWithTasks,
  Holding,
  HoldingTask,
  HoldingWithEvent,
  HoldingWithTasks,
  TraQChannel,
} from '../types';

// モックデータ
const events: Event[] = [
  { id: '1', name: 'ゲーム展示イベント' },
  { id: '2', name: '夏合宿' },
  { id: '3', name: '新歓イベント' },
];

let defaultTasks: DefaultTask[] = [
  {
    id: '1',
    eventId: '1',
    name: 'ゲーム募集開始',
    daysBefore: 90,
    description: '募集要項を作成し、Webサイトに掲載する',
  },
  {
    id: '2',
    eventId: '1',
    name: '会場予約',
    daysBefore: 60,
    description: '会場を予約し、必要な設備を確認する',
  },
  {
    id: '3',
    eventId: '1',
    name: '出展者への連絡',
    daysBefore: 30,
    description: '出展者に詳細情報を送付する',
  },
  {
    id: '4',
    eventId: '1',
    name: '最終確認',
    daysBefore: 7,
    description: '全体の最終確認を行う',
  },
  {
    id: '5',
    eventId: '2',
    name: '宿泊施設の予約',
    daysBefore: 120,
    description: '宿泊施設を予約する',
  },
  {
    id: '6',
    eventId: '2',
    name: '参加者募集',
    daysBefore: 60,
    description: '参加者を募集し、人数を確定する',
  },
  {
    id: '7',
    eventId: '2',
    name: 'スケジュール作成',
    daysBefore: 30,
    description: '合宿のスケジュールを作成し共有する',
  },
];

const holdings: Holding[] = [
  {
    id: '1',
    name: '第21回 ゲーム展示イベント',
    date: '2026-04-18',
    channelId: 'C01234567',
    mention: '@運営',
    eventId: '1',
  },
  {
    id: '2',
    name: '第20回 ゲーム展示イベント',
    date: '2025-12-20',
    channelId: 'C01234567',
    mention: '@運営',
    eventId: '1',
  },
  {
    id: '3',
    name: '2026年夏合宿',
    date: '2026-08-15',
    channelId: 'C89012345',
    mention: '@here',
    eventId: '2',
  },
];

let holdingTasks: HoldingTask[] = [
  // 開催1のタスク
  {
    id: '1',
    holdingId: '1',
    name: 'ゲーム募集開始',
    daysBefore: 90,
    description: '募集要項を作成し、Webサイトに掲載する',
  },
  {
    id: '2',
    holdingId: '1',
    name: '会場予約',
    daysBefore: 60,
    description: '会場を予約し、必要な設備を確認する',
  },
  {
    id: '3',
    holdingId: '1',
    name: '出展者への連絡',
    daysBefore: 30,
    description: '出展者に詳細情報を送付する',
  },
  {
    id: '4',
    holdingId: '1',
    name: '最終確認',
    daysBefore: 7,
    description: '全体の最終確認を行う',
  },
  // 開催2のタスク
  {
    id: '5',
    holdingId: '2',
    name: 'ゲーム募集開始',
    daysBefore: 90,
    description: '募集要項を作成し、Webサイトに掲載する',
  },
  {
    id: '6',
    holdingId: '2',
    name: '会場予約',
    daysBefore: 60,
    description: '会場を予約し、必要な設備を確認する',
  },
  {
    id: '7',
    holdingId: '2',
    name: '出展者への連絡',
    daysBefore: 30,
    description: '出展者に詳細情報を送付する',
  },
  {
    id: '8',
    holdingId: '2',
    name: '最終確認',
    daysBefore: 7,
    description: '全体の最終確認を行う',
  },
  // 開催3のタスク
  {
    id: '9',
    holdingId: '3',
    name: '宿泊施設の予約',
    daysBefore: 120,
    description: '宿泊施設を予約する',
  },
  {
    id: '10',
    holdingId: '3',
    name: '参加者募集',
    daysBefore: 60,
    description: '参加者を募集し、人数を確定する',
  },
  {
    id: '11',
    holdingId: '3',
    name: 'スケジュール作成',
    daysBefore: 30,
    description: '合宿のスケジュールを作成し共有する',
  },
];

const traQChannels: TraQChannel[] = [
  { id: 'C01234567', name: '#運営-general' },
  { id: 'C89012345', name: '#イベント' },
  { id: 'C11111111', name: '#夏合宿' },
  { id: 'C22222222', name: '#新歓' },
  { id: 'C33333333', name: '#開発' },
];

// 遅延をシミュレートするためのヘルパー関数
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// イベントAPI (旧: eventTemplateApi)
export const eventApi = {
  // 全イベント取得
  async getAll(): Promise<Event[]> {
    await delay(300);
    return [...events];
  },

  // イベント検索
  async search(query: string): Promise<Event[]> {
    await delay(300);
    const lowerQuery = query.toLowerCase();
    return events.filter((event) => event.name.toLowerCase().includes(lowerQuery));
  },

  // イベント取得（タスク含む）
  async getById(eventId: string): Promise<EventWithTasks | null> {
    await delay(300);
    const event = events.find((e) => e.id === eventId);
    if (!event) return null;

    const tasks = defaultTasks.filter((t) => t.eventId === eventId);
    return { ...event, tasks };
  },

  // イベント作成
  async create(name: string): Promise<Event> {
    await delay(300);
    const newEvent: Event = {
      id: String(Date.now()),
      name: name,
    };
    events.push(newEvent);
    return newEvent;
  },

  // イベント更新
  async update(eventId: string, name: string): Promise<Event | null> {
    await delay(300);
    const index = events.findIndex((e) => e.id === eventId);
    if (index === -1) return null;

    events[index] = {
      ...events[index],
      name: name,
    };
    return events[index];
  },

  // イベント削除
  async delete(eventId: string): Promise<boolean> {
    await delay(300);
    const index = events.findIndex((e) => e.id === eventId);
    if (index === -1) return false;

    events.splice(index, 1);
    // 関連タスクも削除
    defaultTasks = defaultTasks.filter((t) => t.eventId !== eventId);
    return true;
  },
};

// デフォルトタスクAPI (旧: taskTemplateApi)
export const defaultTaskApi = {
  // イベントIDでタスク取得
  async getByEventId(eventId: string): Promise<DefaultTask[]> {
    await delay(300);
    return defaultTasks.filter((t) => t.eventId === eventId);
  },

  // タスク作成
  async create(task: Omit<DefaultTask, 'default_task_id'>): Promise<DefaultTask> {
    await delay(300);
    const newTask: DefaultTask = {
      ...task,
      id: String(Date.now()),
    };
    defaultTasks.push(newTask);
    return newTask;
  },

  // タスク更新
  async update(
    taskId: string,
    updates: Partial<Omit<DefaultTask, 'default_task_id'>>
  ): Promise<DefaultTask | null> {
    await delay(300);
    const index = defaultTasks.findIndex((t) => t.id === taskId);
    if (index === -1) return null;

    defaultTasks[index] = {
      ...defaultTasks[index],
      ...updates,
    };
    return defaultTasks[index];
  },

  // タスク削除
  async delete(taskId: string): Promise<boolean> {
    await delay(300);
    const index = defaultTasks.findIndex((t) => t.id === taskId);
    if (index === -1) return false;

    defaultTasks.splice(index, 1);
    return true;
  },
};

// 開催API (旧: eventApi)
export const holdingApi = {
  // 全開催取得
  async getAll(): Promise<HoldingWithEvent[]> {
    await delay(300);
    return holdings.map((holding) => {
      const event = events.find((e) => e.id === holding.eventId);
      return {
        ...holding,
        event_name: event?.name || '不明',
      };
    });
  },

  // イベントIDで開催取得
  async getByEventId(eventId: string): Promise<HoldingWithEvent[]> {
    await delay(300);
    const event = events.find((e) => e.id === eventId);
    return holdings
      .filter((h) => h.eventId === eventId)
      .map((holding) => ({
        ...holding,
        event_name: event?.name || '不明',
      }));
  },

  // 開催ID取得（タスク含む）
  async getById(holdingId: string): Promise<HoldingWithTasks | null> {
    await delay(300);
    const holding = holdings.find((h) => h.id === holdingId);
    if (!holding) return null;

    const event = events.find((e) => e.id === holding.eventId);
    const tasks = holdingTasks.filter((t) => t.holdingId === holdingId);

    return {
      ...holding,
      event_name: event?.name,
      tasks,
    };
  },

  // 開催作成（タスクを自動コピー）
  async create(holding: Omit<Holding, 'holding_id'>): Promise<Holding> {
    await delay(300);
    const newHolding: Holding = {
      ...holding,
      id: String(Date.now()),
    };
    holdings.push(newHolding);

    // デフォルトタスクをコピーして開催タスクを作成
    if (holding.eventId) {
      const tasksToCopy = defaultTasks.filter((t) => t.eventId === holding.eventId);
      const newHoldingTasks: HoldingTask[] = tasksToCopy.map((task, index) => ({
        id: `${Date.now()}_${index}`,
        holdingId: newHolding.id,
        name: task.name,
        daysBefore: task.daysBefore,
        description: task.description,
      }));
      holdingTasks.push(...newHoldingTasks);
    }

    return newHolding;
  },

  // 開催更新
  async update(
    holdingId: string,
    updates: Partial<Omit<Holding, 'holding_id'>>
  ): Promise<Holding | null> {
    await delay(300);
    const index = holdings.findIndex((h) => h.id === holdingId);
    if (index === -1) return null;

    holdings[index] = {
      ...holdings[index],
      ...updates,
    };
    return holdings[index];
  },

  // 開催削除
  async delete(holdingId: string): Promise<boolean> {
    await delay(300);
    const index = holdings.findIndex((h) => h.id === holdingId);
    if (index === -1) return false;

    holdings.splice(index, 1);
    // 関連タスクも削除
    holdingTasks = holdingTasks.filter((t) => t.holdingId !== holdingId);
    return true;
  },
};

// 開催タスクAPI (新規)
export const holdingTaskApi = {
  // 開催IDでタスク取得
  async getByHoldingId(holdingId: string): Promise<HoldingTask[]> {
    await delay(300);
    return holdingTasks.filter((t) => t.holdingId === holdingId);
  },

  // タスク作成
  async create(task: Omit<HoldingTask, 'holding_task_id'>): Promise<HoldingTask> {
    await delay(300);
    const newTask: HoldingTask = {
      ...task,
      id: String(Date.now()),
    };
    holdingTasks.push(newTask);
    return newTask;
  },

  // タスク更新
  async update(
    taskId: string,
    updates: Partial<Omit<HoldingTask, 'holding_task_id'>>
  ): Promise<HoldingTask | null> {
    await delay(300);
    const index = holdingTasks.findIndex((t) => t.id === taskId);
    if (index === -1) return null;

    holdingTasks[index] = {
      ...holdingTasks[index],
      ...updates,
    };
    return holdingTasks[index];
  },

  // タスク削除
  async delete(taskId: string): Promise<boolean> {
    await delay(300);
    const index = holdingTasks.findIndex((t) => t.id === taskId);
    if (index === -1) return false;

    holdingTasks.splice(index, 1);
    return true;
  },
};

// SlackチャンネルAPI
export const traQApi = {
  // チャンネル一覧取得
  async getChannels(): Promise<TraQChannel[]> {
    await delay(300);
    return [...traQChannels];
  },
};
