import type React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useAppStore } from '../store';

export const HoldingList: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { currentEvent, holdings, isLoading, fetchEventById, fetchHoldingsByEventId } =
    useAppStore();

  const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    if (eventId) {
      fetchEventById(eventId);
      fetchHoldingsByEventId(eventId);
    }
  }, [eventId, fetchEventById, fetchHoldingsByEventId]);

  if (!eventId) {
    return <div>イベントIDが指定されていません</div>;
  }

  const today = new Date().toISOString().split('T')[0];
  const upcomingHoldings = holdings.filter((h) => h.date >= today);
  const pastHoldings = holdings.filter((h) => h.date < today);
  const displayHoldings = filter === 'upcoming' ? upcomingHoldings : pastHoldings;

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
              {currentEvent?.name || 'Loading...'}
            </h1>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => navigate(`/events/${eventId}/edit`)}>
              イベント・タスクを編集
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create Holding Button */}
        <div className="mb-8">
          <Button
            size="lg"
            onClick={() => navigate(`/events/${eventId}/holdings/new`)}
            className="w-full sm:w-auto"
          >
            + 追加
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
              開催予定 ({upcomingHoldings.length})
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
              開催済み ({pastHoldings.length})
            </button>
          </div>
        </div>

        {/* Holdings List */}
        {isLoading ? (
          <LoadingSpinner />
        ) : displayHoldings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {filter === 'upcoming' ? '開催予定がありません' : '開催済みがありません'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayHoldings.map((holding) => (
              <Card key={holding.id} onClick={() => navigate(`/holdings/${holding.id}`)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{holding.name}</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>
                        📅 開催日:{' '}
                        <span className="font-medium">
                          {new Date(holding.date).toLocaleDateString('ja-JP', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </p>
                      <p>💬 通知先: {holding.mention}</p>
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
