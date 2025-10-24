import type React from 'react';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useChannelName } from '../hooks/useChannelName';
import { useAppStore } from '../store';

export const HoldingDetail: React.FC = () => {
  const { holdingId } = useParams<{ holdingId: string }>();
  const navigate = useNavigate();
  const { currentHolding, isLoading, fetchHoldingById, fetchTraQChannels } = useAppStore();
  const channelName = useChannelName(currentHolding?.channelId || '');

  useEffect(() => {
    if (holdingId) {
      fetchHoldingById(holdingId);
    }
    fetchTraQChannels();
  }, [holdingId, fetchHoldingById, fetchTraQChannels]);

  if (!holdingId) {
    return <div>開催IDが指定されていません</div>;
  }

  if (isLoading && !currentHolding) {
    return <LoadingSpinner />;
  }

  if (!currentHolding) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">開催が見つかりません</h2>
          <Button onClick={() => navigate('/')}>ダッシュボードに戻る</Button>
        </div>
      </div>
    );
  }

  const holdingDate = new Date(currentHolding.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isPast = holdingDate < today;
  const daysUntil = Math.ceil((holdingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  // タスクを日数順にソート
  const sortedTasks = currentHolding.tasks
    ? [...currentHolding.tasks].sort((a, b) => b.daysBefore - a.daysBefore)
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              type="button"
              onClick={() => navigate(`/events/${currentHolding.eventId}`)}
              className="text-gray-600 hover:text-gray-900"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{currentHolding.name}</h1>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => navigate(`/holdings/${holdingId}/edit`)}>
              開催を編集・タスク管理
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Holding Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">開催情報</h2>
          <div className="space-y-3">
            <div className="flex items-start">
              <span className="font-medium text-gray-700 w-32">イベント:</span>
              <span className="text-gray-900">{currentHolding.event_name || '読み込み中...'}</span>
            </div>
            <div className="flex items-start">
              <span className="font-medium text-gray-700 w-32">開催日:</span>
              <div>
                <span className="text-gray-900">
                  {holdingDate.toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long',
                  })}
                </span>
                {!isPast && (
                  <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    あと{daysUntil}日
                  </span>
                )}
                {isPast && (
                  <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    開催済み
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-start">
              <span className="font-medium text-gray-700 w-32">通知先:</span>
              <span className="text-gray-900">{currentHolding.mention}</span>
            </div>
            <div className="flex items-start">
              <span className="font-medium text-gray-700 w-32">通知先チャンネル:</span>
              <span className="text-gray-900">#{channelName}</span>
            </div>
          </div>
        </div>

        {/* Tasks Timeline */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">タスクスケジュール</h2>

          {sortedTasks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">この開催にはタスクが登録されていません</p>
          ) : (
            <div className="space-y-6">
              {sortedTasks.map((task, index) => {
                const taskDate = new Date(holdingDate);
                taskDate.setDate(taskDate.getDate() - task.daysBefore);
                const isTaskPast = taskDate < today;
                const isTaskToday = taskDate.toDateString() === today.toDateString();
                const daysUntilTask = Math.ceil(
                  (taskDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
                );

                return (
                  <div key={task.id} className="relative">
                    {/* Timeline line */}
                    {index !== sortedTasks.length - 1 && (
                      <div className="absolute left-4 top-12 w-0.5 h-full bg-gray-200" />
                    )}

                    <div className="flex gap-4">
                      {/* Timeline dot */}
                      <div className="relative shrink-0">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            isTaskPast ? 'bg-gray-300' : isTaskToday ? 'bg-blue-600' : 'bg-blue-100'
                          }`}
                        >
                          {isTaskPast ? (
                            <svg
                              className="w-5 h-5 text-gray-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            <div
                              className={`w-3 h-3 rounded-full ${
                                isTaskToday ? 'bg-white' : 'bg-blue-600'
                              }`}
                            />
                          )}
                        </div>
                      </div>

                      {/* Task content */}
                      <div className="flex-1 pb-8">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{task.name}</h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                              {task.daysBefore}日前
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            <span>
                              {taskDate.toLocaleDateString('ja-JP', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </span>
                            {!isTaskPast && !isTaskToday && (
                              <span className="text-blue-600 font-medium">
                                （あと{daysUntilTask}日）
                              </span>
                            )}
                            {isTaskToday && (
                              <span className="text-blue-600 font-bold">（今日）</span>
                            )}
                            {isTaskPast && <span className="text-gray-500">（実施済み）</span>}
                          </div>
                          {task.description && (
                            <p className="text-gray-700 whitespace-pre-wrap">{task.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
