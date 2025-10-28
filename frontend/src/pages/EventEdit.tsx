import type React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/Button';
import { Input } from '../components/Form';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import { useAppStore } from '../store';

export const EventEdit: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { currentEvent, isLoading, fetchEventById, updateEvent, deleteEvent } = useAppStore();

  const [eventName, setEventName] = useState('');
  const [isEditNameModalOpen, setIsEditNameModalOpen] = useState(false);

  useEffect(() => {
    if (eventId) {
      fetchEventById(eventId);
    }
  }, [eventId, fetchEventById]);

  useEffect(() => {
    if (currentEvent) {
      setEventName(currentEvent.name);
    }
  }, [currentEvent]);

  if (!eventId) {
    return <div>イベントIDが指定されていません</div>;
  }

  const handleUpdateEventName = async () => {
    if (eventName.trim() === '') return;
    await updateEvent(eventId, eventName);
    setIsEditNameModalOpen(false);
  };

  const handleDeleteEvent = async () => {
    if (window.confirm('このイベントを削除してもよろしいですか?')) {
      await deleteEvent(eventId);
      navigate('/');
    }
  };

  if (isLoading && !currentEvent) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              type="button"
              onClick={() => navigate(`/events/${eventId}`)}
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
            <h1 className="text-3xl font-bold text-gray-900">{currentEvent?.name}</h1>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setIsEditNameModalOpen(true)}>
              イベント名を変更
            </Button>
            <Button variant="danger" onClick={handleDeleteEvent}>
              イベントを削除
            </Button>
          </div>
        </div>
      </header>

      {/* Edit Event Name Modal */}
      <Modal
        isOpen={isEditNameModalOpen}
        onClose={() => setIsEditNameModalOpen(false)}
        title="イベント名を変更"
      >
        <div className="space-y-4">
          <Input
            label="イベント名"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
          />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setIsEditNameModalOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleUpdateEventName} disabled={eventName.trim() === ''}>
              更新
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
