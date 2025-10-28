import type React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Form';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import { useAppStore } from '../store';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { events, isLoading, fetchEvents, searchEvents, createEvent } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newEventName, setNewEventName] = useState('');

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim() === '') {
      fetchEvents();
    } else {
      searchEvents(query);
    }
  };

  const handleCreateEvent = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (newEventName.trim() === '') return;

    try {
      await createEvent(newEventName);
      setIsCreateModalOpen(false);
      setNewEventName('');
    } catch (error) {
      console.error('Failed to create event:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">イベントリマインドBot</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Create Section */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="イベントを検索..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full"
            />
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>+ 新しいイベントを作成</Button>
        </div>

        {/* Events Grid */}
        {isLoading ? (
          <LoadingSpinner />
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {searchQuery
                ? 'イベントが見つかりませんでした'
                : 'イベントがありません。新しく作成してください。'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card key={event.id} onClick={() => navigate(`/events/${event.id}`)}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.name}</h3>
                    <p className="text-sm text-gray-500">クリックして詳細を表示</p>
                  </div>
                  <svg
                    className="w-6 h-6 text-gray-400"
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

      {/* Create Event Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setNewEventName('');
        }}
        title="新しいイベントを作成"
      >
        <form onSubmit={handleCreateEvent} className="space-y-4">
          <Input
            label="イベント名"
            placeholder="例: ゲーム展示イベント"
            value={newEventName}
            onChange={(e) => setNewEventName(e.target.value)}
          />
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsCreateModalOpen(false);
                setNewEventName('');
              }}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={newEventName.trim() === ''}>
              作成
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
