import type React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/Button';
import { Input, Textarea } from '../components/Form';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import { useAppStore } from '../store';
import type { DefaultTask } from '../types';

export const EventEdit: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const {
    currentEvent,
    isLoading,
    fetchEventById,
    updateEvent,
    deleteEvent,
    createDefaultTask,
    updateDefaultTask,
    deleteDefaultTask,
  } = useAppStore();

  const [eventName, setEventName] = useState('');
  const [isEditNameModalOpen, setIsEditNameModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<DefaultTask | null>(null);
  const [taskFormData, setTaskFormData] = useState({
    name: '',
    daysBefore: 0,
    description: '',
  });

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

  const openTaskModal = (task?: DefaultTask) => {
    if (task) {
      setEditingTask(task);
      setTaskFormData({
        name: task.name,
        daysBefore: task.daysBefore,
        description: task.description,
      });
    } else {
      setEditingTask(null);
      setTaskFormData({
        name: '',
        daysBefore: 0,
        description: '',
      });
    }
    setIsTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
    setEditingTask(null);
    setTaskFormData({
      name: '',
      daysBefore: 0,
      description: '',
    });
  };

  const handleSaveTask = async () => {
    if (taskFormData.name.trim() === '' || taskFormData.daysBefore <= 0) {
      alert('タスク名と日数を正しく入力してください');
      return;
    }

    if (editingTask) {
      await updateDefaultTask(editingTask.id, taskFormData);
    } else {
      await createDefaultTask({
        eventId: eventId,
        ...taskFormData,
      });
    }
    closeTaskModal();
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('このタスクを削除してもよろしいですか?')) {
      await deleteDefaultTask(taskId);
    }
  };

  if (isLoading && !currentEvent) {
    return <LoadingSpinner />;
  }

  const sortedTasks = currentEvent?.tasks
    ? [...currentEvent.tasks].sort((a, b) => b.daysBefore - a.daysBefore)
    : [];

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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Task Button */}
        <div className="mb-6">
          <Button onClick={() => openTaskModal()}>+ デフォルトタスクを追加</Button>
        </div>

        {/* Tasks List */}
        {sortedTasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500 text-lg">タスクがありません。新しく追加してください。</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedTasks.map((task) => (
              <div key={task.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{task.name}</h3>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {task.daysBefore}日前
                      </span>
                    </div>
                    <p className="text-gray-600 whitespace-pre-wrap">{task.description}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      type="button"
                      onClick={() => openTaskModal(task)}
                      className="text-blue-600 hover:text-blue-800 p-2"
                      title="編集"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-red-600 hover:text-red-800 p-2"
                      title="削除"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

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

      {/* Task Modal */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={closeTaskModal}
        title={editingTask ? 'デフォルトタスクを編集' : 'デフォルトタスクを追加'}
      >
        <div className="space-y-4">
          <Input
            label="タスク名 *"
            placeholder="例: ゲーム募集開始"
            value={taskFormData.name}
            onChange={(e) => setTaskFormData({ ...taskFormData, name: e.target.value })}
          />
          <Input
            label="リマインド日数 (開催日の何日前) *"
            type="number"
            min="1"
            placeholder="例: 90"
            value={taskFormData.daysBefore || ''}
            onChange={(e) =>
              setTaskFormData({
                ...taskFormData,
                daysBefore: parseInt(e.target.value, 10) || 0,
              })
            }
          />
          <Textarea
            label="タスク詳細"
            placeholder="タスクの詳細説明を入力..."
            rows={5}
            value={taskFormData.description}
            onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
          />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={closeTaskModal}>
              キャンセル
            </Button>
            <Button onClick={handleSaveTask}>{editingTask ? '更新' : '追加'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
