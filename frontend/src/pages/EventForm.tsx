import type React from 'react';
import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { useNavigate, useParams } from 'react-router-dom';
import 'react-datepicker/dist/react-datepicker.css';
import { Button } from '../components/Button';
import { Input, Select } from '../components/Form';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useAppStore } from '../store';

export const EventForm: React.FC = () => {
  const { templateId, eventId } = useParams<{ templateId: string; eventId?: string }>();
  const navigate = useNavigate();
  const {
    templates,
    slackChannels,
    events,
    isLoading,
    fetchTemplates,
    fetchSlackChannels,
    fetchEventsByTemplateId,
    createEvent,
    updateEvent,
  } = useAppStore();

  const [formData, setFormData] = useState({
    event_name: '',
    template_id: templateId || '',
    event_date: new Date(),
    slack_channel_id: '',
    slack_mention: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchTemplates();
    fetchSlackChannels();
    if (templateId) {
      fetchEventsByTemplateId(templateId);
    }
  }, [fetchTemplates, fetchSlackChannels, fetchEventsByTemplateId, templateId]);

  // 同じテンプレートの最新イベントからデフォルト値を設定
  useEffect(() => {
    if (!eventId && templateId && events.length > 0) {
      // 同じテンプレートのイベントでソート（最新順）
      const templateEvents = events
        .filter((e) => e.template_id === templateId)
        .sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());

      if (templateEvents.length > 0) {
        const latestEvent = templateEvents[0];
        setFormData((prev) => ({
          ...prev,
          slack_channel_id: latestEvent.slack_channel_id,
          slack_mention: latestEvent.slack_mention,
        }));
      }
    }
  }, [eventId, templateId, events]);

  // TODO: eventIdが指定されている場合、既存イベントのデータを取得

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.event_name.trim()) {
      newErrors.event_name = 'イベント名は必須です';
    }

    if (!formData.template_id) {
      newErrors.template_id = 'テンプレートを選択してください';
    }

    if (!formData.slack_channel_id) {
      newErrors.slack_channel_id = '通知先チャンネルを選択してください';
    }

    if (!formData.slack_mention.trim()) {
      newErrors.slack_mention = 'メンション先は必須です';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const eventData = {
      ...formData,
      event_date: formData.event_date.toISOString().split('T')[0],
    };

    try {
      if (eventId) {
        await updateEvent(eventId, eventData);
      } else {
        await createEvent(eventData);
      }
      navigate(`/templates/${formData.template_id}`);
    } catch (error) {
      console.error('Failed to save event:', error);
    }
  };

  if (isLoading && (templates.length === 0 || slackChannels.length === 0)) {
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
            <h1 className="text-3xl font-bold text-gray-900">
              {eventId ? 'イベントを編集' : '新しいイベントを登録'}
            </h1>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* イベント名 */}
            <Input
              label="イベント名 *"
              placeholder="例: 2026年春 ゲーム展示イベント"
              value={formData.event_name}
              onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
              error={errors.event_name}
            />

            {/* 使用テンプレート */}
            <Select
              label="使用テンプレート *"
              value={formData.template_id}
              onChange={(e) => setFormData({ ...formData, template_id: e.target.value })}
              options={[
                { value: '', label: 'テンプレートを選択' },
                ...templates.map((t) => ({
                  value: t.template_id,
                  label: t.template_name,
                })),
              ]}
              error={errors.template_id}
              disabled={!!templateId}
            />

            {/* 開催日 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">開催日 *</label>
              <DatePicker
                selected={formData.event_date}
                onChange={(date) => setFormData({ ...formData, event_date: date || new Date() })}
                dateFormat="yyyy年MM月dd日"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                minDate={new Date()}
              />
            </div>

            {/* 通知先チャンネル */}
            <Select
              label="通知先チャンネル *"
              value={formData.slack_channel_id}
              onChange={(e) => setFormData({ ...formData, slack_channel_id: e.target.value })}
              options={[
                { value: '', label: 'チャンネルを選択' },
                ...slackChannels.map((c) => ({
                  value: c.id,
                  label: c.name,
                })),
              ]}
              error={errors.slack_channel_id}
            />

            {/* メンション先 */}
            <Input
              label="メンション先 *"
              placeholder="例: @運営, @here"
              value={formData.slack_mention}
              onChange={(e) => setFormData({ ...formData, slack_mention: e.target.value })}
              error={errors.slack_mention}
            />

            {/* Submit Buttons */}
            <div className="flex gap-3 justify-end pt-4">
              <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
                キャンセル
              </Button>
              <Button type="submit" disabled={isLoading}>
                {eventId ? '更新' : '登録'}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};
