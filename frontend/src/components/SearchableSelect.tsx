import type React from 'react';
import { useEffect, useRef, useState } from 'react';

interface SearchableSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  error?: string;
  placeholder?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  value,
  onChange,
  options,
  error,
  placeholder = '検索して選択...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // 選択された値のラベルを取得
  const selectedLabel = options.find((opt) => opt.value === value)?.label || '';

  // 検索クエリでオプションをフィルタリングし、優先順位をつけてソート
  const filteredOptions = (() => {
    if (!searchQuery) return options;

    const query = searchQuery.toLowerCase();
    const matched = options
      .map((option) => {
        const label = option.label.toLowerCase();

        // マッチしない場合はnullを返す
        if (!label.includes(query)) return null;

        // 優先順位を計算
        let priority = 0;
        if (label === query) {
          // 完全一致: 最優先
          priority = 0;
        } else if (label.startsWith(query)) {
          // 前方一致: 2番目
          priority = 1;
        } else {
          // 部分一致: 3番目
          priority = 2;
        }

        return { option, priority };
      })
      .filter(
        (item): item is { option: { value: string; label: string }; priority: number } =>
          item !== null
      )
      .sort((a, b) => {
        // 優先順位で比較
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }
        // 同じ優先順位なら元の順序を維持（安定ソート）
        return 0;
      })
      .map((item) => item.option);

    return matched;
  })();

  // クリック外側を検出
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ドロップダウンを開いたときにフォーカス
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // キーボードナビゲーション
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex].value);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchQuery('');
        break;
    }
  };

  // ハイライトされた項目がビューに入るようにスクロール
  useEffect(() => {
    if (isOpen && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
      }
    }
  }, [highlightedIndex, isOpen]);

  // ハイライトインデックスをリセット
  useEffect(() => {
    setHighlightedIndex(0);
  }, []);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="w-full" ref={containerRef}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}

      <div className="relative">
        {/* 選択ボタン/入力エリア */}
        <div
          className={`w-full px-3 py-2 border rounded-lg cursor-pointer flex items-center justify-between ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${isOpen ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
        >
          {isOpen ? (
            <input
              ref={inputRef}
              type="text"
              className="flex-1 outline-none bg-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className={selectedLabel ? 'text-gray-900' : 'text-gray-500'}>
              {selectedLabel || placeholder}
            </span>
          )}
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* ドロップダウンリスト */}
        {isOpen && (
          <ul
            ref={listRef}
            className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
          >
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-2 text-gray-500 text-center">該当なし</li>
            ) : (
              filteredOptions.map((option, index) => (
                <li
                  key={option.value}
                  className={`px-3 py-2 cursor-pointer ${
                    index === highlightedIndex
                      ? 'bg-blue-500 text-white'
                      : option.value === value
                        ? 'bg-blue-50 text-blue-900'
                        : 'text-gray-900 hover:bg-gray-100'
                  }`}
                  onClick={() => handleSelect(option.value)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  {option.label}
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};
