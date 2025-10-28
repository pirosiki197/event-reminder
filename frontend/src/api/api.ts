import type {
  Event,
  Holding,
  HoldingTask,
  HoldingWithEvent,
  HoldingWithTasks,
  TraQChannel,
} from '../types';

// API Base URL
const API_BASE_URL = '/api/v1';

// ヘルパー関数
async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  // 204 No Content の場合は空オブジェクトを返す
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// Events API
export const eventApi = {
  getAll: async (searchQuery?: string): Promise<Event[]> => {
    const url = searchQuery
      ? `${API_BASE_URL}/events?q=${encodeURIComponent(searchQuery)}`
      : `${API_BASE_URL}/events`;
    return fetchJSON<Event[]>(url);
  },

  getById: async (eventId: string): Promise<Event> => {
    return fetchJSON<Event>(`${API_BASE_URL}/events/${eventId}`);
  },

  create: async (name: string): Promise<Event> => {
    return fetchJSON<Event>(`${API_BASE_URL}/events`, {
      method: 'POST',
      body: JSON.stringify({ name: name }),
    });
  },

  update: async (eventId: string, name: string): Promise<Event> => {
    return fetchJSON<Event>(`${API_BASE_URL}/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify({ name: name }),
    });
  },

  delete: async (eventId: string): Promise<void> => {
    await fetchJSON<void>(`${API_BASE_URL}/events/${eventId}`, {
      method: 'DELETE',
    });
  },
};

// Holdings API
export const holdingApi = {
  getAll: async (sourceEventId?: string): Promise<HoldingWithEvent[]> => {
    const url = sourceEventId
      ? `${API_BASE_URL}/holdings?source_event_id=${sourceEventId}`
      : `${API_BASE_URL}/holdings`;
    const holdings = await fetchJSON<Holding[]>(url);

    // イベント情報を付加
    const holdingsWithEvent: HoldingWithEvent[] = await Promise.all(
      holdings.map(async (holding) => {
        try {
          const event = await fetchJSON<Event>(`${API_BASE_URL}/events/${holding.eventId}`);
          return {
            ...holding,
            event_name: event.name,
          };
        } catch (error) {
          console.error(`Failed to fetch event for holding ${holding.id}:`, error);
          return {
            ...holding,
            event_name: '不明',
          };
        }
      })
    );

    return holdingsWithEvent;
  },

  getById: async (holdingId: string): Promise<HoldingWithTasks> => {
    const holding = await fetchJSON<Holding>(`${API_BASE_URL}/holdings/${holdingId}`);
    const tasks = await holdingTaskApi.getByHoldingId(holdingId);

    // イベント情報を取得
    let eventName = '不明';
    if (holding.eventId) {
      try {
        const event = await fetchJSON<Event>(`${API_BASE_URL}/events/${holding.eventId}`);
        eventName = event.name;
      } catch (error) {
        console.error(`Failed to fetch event for holding ${holdingId}:`, error);
      }
    }

    return {
      ...holding,
      event_name: eventName,
      tasks,
    };
  },

  create: async (holding: {
    name: string;
    eventId: string;
    date: string;
    channelId: string;
    mention: string;
  }): Promise<Holding> => {
    return fetchJSON<Holding>(`${API_BASE_URL}/holdings`, {
      method: 'POST',
      body: JSON.stringify(holding),
    });
  },

  update: async (
    holdingId: string,
    updates: {
      name?: string;
      eventId?: string;
      date?: string;
      channelId?: string;
      mention?: string;
    }
  ): Promise<Holding> => {
    return fetchJSON<Holding>(`${API_BASE_URL}/holdings/${holdingId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  delete: async (holdingId: string): Promise<void> => {
    await fetchJSON<void>(`${API_BASE_URL}/holdings/${holdingId}`, {
      method: 'DELETE',
    });
  },
};

// HoldingTasks API
export const holdingTaskApi = {
  getByHoldingId: async (holdingId: string): Promise<HoldingTask[]> => {
    return fetchJSON<HoldingTask[]>(`${API_BASE_URL}/holdings/${holdingId}/tasks`);
  },

  create: async (task: {
    holdingId: string;
    name: string;
    daysBefore: number;
    description: string;
  }): Promise<HoldingTask> => {
    return fetchJSON<HoldingTask>(`${API_BASE_URL}/holdings/${task.holdingId}/tasks`, {
      method: 'POST',
      body: JSON.stringify({
        name: task.name,
        daysBefore: task.daysBefore,
        description: task.description,
      }),
    });
  },

  update: async (
    taskId: string,
    updates: {
      name?: string;
      daysBefore?: number;
      description?: string;
    }
  ): Promise<HoldingTask> => {
    return fetchJSON<HoldingTask>(`${API_BASE_URL}/holding-tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  delete: async (taskId: string): Promise<void> => {
    await fetchJSON<void>(`${API_BASE_URL}/holding-tasks/${taskId}`, {
      method: 'DELETE',
    });
  },
};

// traQ API
export const traqApi = {
  getChannels: async (): Promise<TraQChannel[]> => {
    return fetchJSON<TraQChannel[]>(`${API_BASE_URL}/channels`);
  },
};
