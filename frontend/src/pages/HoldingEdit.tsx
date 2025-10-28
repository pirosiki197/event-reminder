import type React from 'react';
import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { useNavigate, useParams } from 'react-router-dom';
import 'react-datepicker/dist/react-datepicker.css';
import { Button } from '../components/Button';
import { Input, Textarea } from '../components/Form';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import { SearchableSelect } from '../components/SearchableSelect';
import { useAppStore } from '../store';
import type { HoldingTask } from '../types';

export const HoldingEdit: React.FC = () => {
  const { holdingId } = useParams<{ holdingId: string }>();
  const navigate = useNavigate();
  const {
    currentHolding,
    traQChannels,
    isLoading,
    fetchHoldingById,
    fetchTraQChannels,
    updateHolding,
    deleteHolding,
    createHoldingTask,
    updateHoldingTask,
    deleteHoldingTask,
  } = useAppStore();

  const [isEditInfoModalOpen, setIsEditInfoModalOpen] = useState(false);
  const [holdingFormData, setHoldingFormData] = useState({
    name: '',
    date: new Date(),
    channelId: '',
    mention: '',
  });
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<HoldingTask | null>(null);
  const [taskFormData, setTaskFormData] = useState({
    name: '',
    daysBefore: 0,
    description: '',
  });

  useEffect(() => {
    if (holdingId) {
      fetchHoldingById(holdingId);
    }
    fetchTraQChannels();
  }, [holdingId, fetchHoldingById, fetchTraQChannels]);

  useEffect(() => {
    if (currentHolding) {
      setHoldingFormData({
        name: currentHolding.name,
        date: new Date(currentHolding.date),
        channelId: currentHolding.channelId,
        mention: currentHolding.mention,
      });
    }
  }, [currentHolding]);

  if (!holdingId) {
    return <div>開催IDが指定されていません</div>;
  }

  const openEditInfoModal = () => {
    if (currentHolding) {
      setHoldingFormData({
        name: currentHolding.name,
        date: new Date(currentHolding.date),
        channelId: currentHolding.channelId,
        mention: currentHolding.mention,
      });
      setIsEditInfoModalOpen(true);
    }
  };

  const handleUpdateHoldingInfo = async () => {
    if (holdingFormData.name.trim() === '') {
      alert('開催名を入力してください');
      return;
    }

    if (!holdingFormData.channelId) {
      alert('通知先チャンネルを選択してください');
      return;
    }

    if (holdingFormData.mention.trim() === '') {
      alert('メンション先を入力してください');
      return;
    }

    if (currentHolding) {
      await updateHolding(holdingId, {
        name: holdingFormData.name,
        eventId: currentHolding.eventId || '',
        date: holdingFormData.date.toISOString().split('T')[0],
        channelId: holdingFormData.channelId,
        mention: holdingFormData.mention,
      });
    }
    setIsEditInfoModalOpen(false);
  };

  const handleDeleteHolding = async () => {
    if (window.confirm('この開催を削除してもよろしいですか?')) {
      await deleteHolding(holdingId);
      navigate('/');
    }
  };

  const openTaskModal = (task?: HoldingTask) => {
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
      await updateHoldingTask(editingTask.id, taskFormData);
    } else {
      await createHoldingTask({
        holdingId: holdingId,
        ...taskFormData,
      });
    }
    closeTaskModal();
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('このタスクを削除してもよろしいですか?')) {
      await deleteHoldingTask(taskId);
    }
  };

  if (isLoading && !currentHolding) {
    return <LoadingSpinner />;
  }

  const sortedTasks = currentHolding?.tasks
    ? [...currentHolding.tasks].sort((a, b) => b.daysBefore - a.daysBefore)
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              type="button"
              onClick={() => navigate(`/holdings/${holdingId}`)}
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
            <h1 className="text-3xl font-bold text-gray-900">{currentHolding?.name}</h1>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={openEditInfoModal}>
              編集
            </Button>
            <Button variant="danger" onClick={handleDeleteHolding}>
              削除
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Task Button */}
        <div className="mb-6">
          <Button onClick={() => openTaskModal()}>+ タスクを追加</Button>
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

      {/* Edit Holding Info Modal */}
      <Modal
        isOpen={isEditInfoModalOpen}
        onClose={() => setIsEditInfoModalOpen(false)}
        title="開催情報を編集"
      >
        <div className="space-y-4">
          <Input
            label="開催名"
            value={holdingFormData.name}
            onChange={(e) => setHoldingFormData({ ...holdingFormData, name: e.target.value })}
            placeholder="開催名を入力"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">開催日</label>
            <DatePicker
              selected={holdingFormData.date}
              onChange={(date) =>
                setHoldingFormData({ ...holdingFormData, date: date || new Date() })
              }
              dateFormat="yyyy年MM月dd日"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              minDate={new Date()}
            />
          </div>

          <SearchableSelect
            label="通知先チャンネル"
            value={holdingFormData.channelId}
            onChange={(value) => setHoldingFormData({ ...holdingFormData, channelId: value })}
            options={[
              { value: '', label: 'チャンネルを選択' },
              ...traQChannels.map((c) => ({
                value: c.id,
                label: c.name,
              })),
            ]}
            placeholder="チャンネルを検索..."
          />

          <Input
            label="メンション先"
            value={holdingFormData.mention}
            onChange={(e) => setHoldingFormData({ ...holdingFormData, mention: e.target.value })}
            placeholder="例: @運営, @here"
          />

          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setIsEditInfoModalOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleUpdateHoldingInfo}>保存</Button>
          </div>
        </div>
      </Modal>

      {/* Task Modal */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={closeTaskModal}
        title={editingTask ? 'タスクを編集' : 'タスクを追加'}
      >
        <div className="space-y-4">
          <Input
            label="タスク名"
            value={taskFormData.name}
            onChange={(e) => setTaskFormData({ ...taskFormData, name: e.target.value })}
            placeholder="例: ゲーム募集開始"
          />
          <Input
            label="日数（開催日の何日前か）"
            type="number"
            value={taskFormData.daysBefore}
            onChange={(e) =>
              setTaskFormData({ ...taskFormData, daysBefore: Number(e.target.value) || 0 })
            }
            onFocus={(e) => e.target.select()}
            placeholder="例: 90"
            min="0"
          />
          <Textarea
            label="説明"
            value={taskFormData.description}
            onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
            placeholder="タスクの詳細を入力..."
            rows={5}
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
