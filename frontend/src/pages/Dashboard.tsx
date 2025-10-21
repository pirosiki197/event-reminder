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
  const { templates, isLoading, fetchTemplates, searchTemplates, createTemplate } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim() === '') {
      fetchTemplates();
    } else {
      searchTemplates(query);
    }
  };

  const handleCreateTemplate = async () => {
    if (newTemplateName.trim() === '') return;

    try {
      await createTemplate(newTemplateName);
      setIsCreateModalOpen(false);
      setNewTemplateName('');
    } catch (error) {
      console.error('Failed to create template:', error);
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
              placeholder="テンプレートを検索..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full"
            />
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>+ 新しいテンプレートを作成</Button>
        </div>

        {/* Templates Grid */}
        {isLoading ? (
          <LoadingSpinner />
        ) : templates.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {searchQuery
                ? 'テンプレートが見つかりませんでした'
                : 'テンプレートがありません。新しく作成してください。'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card
                key={template.template_id}
                onClick={() => navigate(`/templates/${template.template_id}`)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {template.template_name}
                    </h3>
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

      {/* Create Template Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setNewTemplateName('');
        }}
        title="新しいテンプレートを作成"
      >
        <div className="space-y-4">
          <Input
            label="テンプレート名"
            placeholder="例: ゲーム展示イベント"
            value={newTemplateName}
            onChange={(e) => setNewTemplateName(e.target.value)}
          />
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setIsCreateModalOpen(false);
                setNewTemplateName('');
              }}
            >
              キャンセル
            </Button>
            <Button onClick={handleCreateTemplate} disabled={newTemplateName.trim() === ''}>
              作成
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
