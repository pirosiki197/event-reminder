// イベントテンプレート
export interface EventTemplate {
  template_id: string;
  template_name: string;
}

// タスクテンプレート
export interface TaskTemplate {
  task_id: string;
  template_id: string;
  task_name: string;
  days_before: number;
  description: string;
}

// イベント
export interface Event {
  event_id: string;
  event_name: string;
  template_id: string;
  event_date: string; // ISO date string (YYYY-MM-DD)
  slack_channel_id: string;
  slack_mention: string;
}

// Slackチャンネル (モック用)
export interface SlackChannel {
  id: string;
  name: string;
}

// イベントテンプレートとタスクテンプレートを結合した型
export interface EventTemplateWithTasks extends EventTemplate {
  tasks: TaskTemplate[];
}

// イベントとテンプレート情報を結合した型
export interface EventWithTemplate extends Event {
  template_name: string;
}
