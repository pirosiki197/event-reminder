import type React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useAppStore } from '../store';

export const EventList: React.FC = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const { currentTemplate, events, isLoading, fetchTemplateById, fetchEventsByTemplateId } =
    useAppStore();

  const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    if (templateId) {
      fetchTemplateById(templateId);
      fetchEventsByTemplateId(templateId);
    }
  }, [templateId, fetchTemplateById, fetchEventsByTemplateId]);

  if (!templateId) {
    return <div>テンプレートIDが指定されていません</div>;
  }

  const today = new Date().toISOString().split('T')[0];
  const upcomingEvents = events.filter((e) => e.event_date >= today);
  const pastEvents = events.filter((e) => e.event_date < today);
  const displayEvents = filter === 'upcoming' ? upcomingEvents : pastEvents;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              type="button"
              onClick={() => navigate('/')}
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
            <h1 className="text-3xl font-bold text-gray-900">
              {currentTemplate?.template_name || 'Loading...'}
            </h1>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => navigate(`/templates/${templateId}/edit`)}>
              テンプレートを編集
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create Event Button */}
        <div className="mb-8">
          <Button
            size="lg"
            onClick={() => navigate(`/templates/${templateId}/events/new`)}
            className="w-full sm:w-auto"
          >
            + このテンプレートで新しいイベントを登録する
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-8">
            <button
              type="button"
              onClick={() => setFilter('upcoming')}
              className={`pb-4 px-2 font-medium transition-colors ${
                filter === 'upcoming'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              開催予定 ({upcomingEvents.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('past')}
              className={`pb-4 px-2 font-medium transition-colors ${
                filter === 'past'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              開催済み ({pastEvents.length})
            </button>
          </div>
        </div>

        {/* Events List */}
        {isLoading ? (
          <LoadingSpinner />
        ) : displayEvents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {filter === 'upcoming'
                ? '開催予定のイベントがありません'
                : '開催済みのイベントがありません'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayEvents.map((event) => (
              <Card key={event.event_id} onClick={() => navigate(`/events/${event.event_id}`)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.event_name}</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>
                        📅 開催日:{' '}
                        <span className="font-medium">
                          {new Date(event.event_date).toLocaleDateString('ja-JP', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </p>
                      <p>💬 通知先: {event.slack_mention}</p>
                    </div>
                  </div>
                  <svg
                    className="w-6 h-6 text-gray-400 shrink-0"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M9 5l7 7-7 7"></path>
                  </svg>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
