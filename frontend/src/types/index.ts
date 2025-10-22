// イベント (旧: EventTemplate)
export interface Event {
  id: string;
  name: string;
}

// デフォルトタスク (旧: TaskTemplate)
export interface DefaultTask {
  id: string;
  eventId: string;
  name: string;
  daysBefore: number;
  description: string;
}

// 開催 (旧: Event)
export interface Holding {
  id: string;
  name: string;
  date: string; // ISO date string (YYYY-MM-DD)
  channelId: string;
  mention: string;
  eventId?: string; // コピー元のイベントID
}

// 開催タスク (新規)
export interface HoldingTask {
  id: string;
  holdingId: string;
  name: string;
  daysBefore: number;
  description: string;
}

// traQチャンネル (モック用)
export interface TraQChannel {
  id: string;
  name: string;
}

// イベントとデフォルトタスクを結合した型
export interface EventWithTasks extends Event {
  tasks: DefaultTask[];
}

// 開催とイベント情報を結合した型
export interface HoldingWithEvent extends Holding {
  event_name: string;
}

// 開催と開催タスクを結合した型
export interface HoldingWithTasks extends Holding {
  tasks: HoldingTask[];
  event_name?: string;
}
