import type React from 'react';
import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { useNavigate, useParams } from 'react-router-dom';
import 'react-datepicker/dist/react-datepicker.css';
import { Button } from '../components/Button';
import { Input } from '../components/Form';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { SearchableSelect } from '../components/SearchableSelect';
import { useAppStore } from '../store';

export const HoldingForm: React.FC = () => {
  const { eventId, holdingId } = useParams<{ eventId: string; holdingId?: string }>();
  const navigate = useNavigate();
  const {
    events,
    traQChannels,
    holdings,
    currentHolding,
    isLoading,
    fetchEvents,
    fetchTraQChannels,
    fetchHoldingsByEventId,
    fetchHoldingById,
    createHolding,
    updateHolding,
  } = useAppStore();

  const [formData, setFormData] = useState({
    name: '',
    eventId: eventId || '',
    holdingDate: new Date(),
    channelId: '',
    mention: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchEvents();
    fetchTraQChannels();
    if (eventId) {
      fetchHoldingsByEventId(eventId);
      // eventIdをformDataに設定
      setFormData((prev) => ({ ...prev, eventId }));
    }
  }, [fetchEvents, fetchTraQChannels, fetchHoldingsByEventId, eventId]);

  // 同じイベントの最新開催からデフォルト値を設定
  useEffect(() => {
    if (!holdingId && eventId && holdings.length > 0) {
      // 同じイベントの開催でソート（最新順）
      const eventHoldings = holdings
        .filter((h) => h.eventId === eventId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      if (eventHoldings.length > 0) {
        const latestHolding = eventHoldings[0];
        setFormData((prev) => ({
          ...prev,
          channelId: latestHolding.channelId,
          mention: latestHolding.mention,
        }));
      }
    }
  }, [holdingId, eventId, holdings]);

  // holdingIdが指定されている場合、既存開催のデータを取得して編集フォームに反映
  useEffect(() => {
    if (holdingId) {
      fetchHoldingById(holdingId);
    }
  }, [holdingId, fetchHoldingById]);

  // currentHoldingが更新されたら、フォームデータに反映
  useEffect(() => {
    if (holdingId && currentHolding && currentHolding.id === holdingId) {
      setFormData({
        name: currentHolding.name,
        eventId: currentHolding.eventId || eventId || '',
        holdingDate: new Date(currentHolding.date),
        channelId: currentHolding.channelId,
        mention: currentHolding.mention,
      });
    }
  }, [holdingId, currentHolding, eventId]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.holding_name = '開催名は必須です';
    }

    if (!formData.eventId) {
      newErrors.source_event_id = 'イベントを選択してください';
    }

    if (!formData.channelId) {
      newErrors.slack_channel_id = '通知先チャンネルを選択してください';
    }

    if (!formData.mention.trim()) {
      newErrors.slack_mention = 'メンション先は必須です';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const holdingData = {
      ...formData,
      date: formData.holdingDate.toISOString().split('T')[0],
    };

    try {
      if (holdingId) {
        await updateHolding(holdingId, holdingData);
      } else {
        await createHolding(holdingData);
      }
      navigate(`/events/${formData.eventId}`);
    } catch (error) {
      console.error('Failed to save holding:', error);
    }
  };

  if (isLoading && (events.length === 0 || traQChannels.length === 0)) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
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
            <h1 className="text-3xl font-bold text-gray-900">{holdingId ? '編集' : '登録'}</h1>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 開催名 */}
            <Input
              label="開催名 *"
              placeholder="例: 2026年春 ゲーム展示イベント"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.holding_name}
            />

            {/* イベント選択 (読み取り専用) */}
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">イベント</label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600">
                {(() => {
                  if (!eventId) return 'イベントが指定されていません';
                  // eventIdは文字列、event.idは文字列として比較
                  const event = events.find((t) => String(t.id) === String(eventId));
                  return event?.name || '読み込み中...';
                })()}
              </div>
            </div>

            {/* 開催日 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">開催日 *</label>
              <DatePicker
                selected={formData.holdingDate}
                onChange={(date) => setFormData({ ...formData, holdingDate: date || new Date() })}
                dateFormat="yyyy年MM月dd日"
                placeholderText="開催日を選択"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                minDate={new Date()}
              />
            </div>

            {/* 通知先チャンネル */}
            <SearchableSelect
              label="通知先チャンネル *"
              value={formData.channelId}
              onChange={(value) => setFormData({ ...formData, channelId: value })}
              options={[
                { value: '', label: 'チャンネルを選択' },
                ...traQChannels.map((c) => ({
                  value: c.id,
                  label: c.name,
                })),
              ]}
              error={errors.slack_channel_id}
              placeholder="チャンネルを検索..."
            />

            {/* メンション先 */}
            <Input
              label="メンション先 *"
              placeholder="例: @運営, @here"
              value={formData.mention}
              onChange={(e) => setFormData({ ...formData, mention: e.target.value })}
              error={errors.slack_mention}
            />

            {/* Submit Buttons */}
            <div className="flex gap-3 justify-end pt-4">
              <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
                キャンセル
              </Button>
              <Button type="submit" disabled={isLoading}>
                {holdingId ? '更新' : '登録'}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};
