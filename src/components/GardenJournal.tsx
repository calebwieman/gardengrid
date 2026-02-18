'use client';

import { useState } from 'react';
import { useGardenStore, JournalEntry } from '@/stores/gardenStore';

const typeEmojis: Record<JournalEntry['type'], string> = {
  observation: '👁️',
  tip: '💡',
  harvest: '🌾',
  problem: '🐛',
};

const typeLabels: Record<JournalEntry['type'], string> = {
  observation: 'Observation',
  tip: 'Tip',
  harvest: 'Harvest',
  problem: 'Problem',
};

export default function GardenJournal() {
  const { journalEntries, addJournalEntry, removeJournalEntry } = useGardenStore();
  const [isOpen, setIsOpen] = useState(false);
  const [newEntryText, setNewEntryText] = useState('');
  const [newEntryType, setNewEntryType] = useState<JournalEntry['type']>('observation');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEntryText.trim()) {
      addJournalEntry(newEntryText.trim(), newEntryType);
      setNewEntryText('');
      setNewEntryType('observation');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left"
      >
        <h3 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
          <span>📓</span> Garden Journal
          {journalEntries.length > 0 && (
            <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs px-2 py-0.5 rounded-full">
              {journalEntries.length}
            </span>
          )}
        </h3>
        <span className="text-gray-400">{isOpen ? '▼' : '▶'}</span>
      </button>

      {isOpen && (
        <div className="mt-4 space-y-4">
          {/* Add new entry form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
              value={newEntryText}
              onChange={(e) => setNewEntryText(e.target.value)}
              placeholder="Write a note about your garden..."
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg focus:outline-none focus:border-green-500 resize-none"
              rows={2}
            />
            <div className="flex gap-2 items-center">
              <select
                value={newEntryType}
                onChange={(e) => setNewEntryType(e.target.value as JournalEntry['type'])}
                className="text-sm bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded px-2 py-1 focus:outline-none focus:border-green-500"
              >
                {(['observation', 'tip', 'harvest', 'problem'] as const).map((type) => (
                  <option key={type} value={type}>
                    {typeEmojis[type]} {typeLabels[type]}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={!newEntryText.trim()}
                className="flex-1 px-4 py-1.5 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors"
              >
                Add Note
              </button>
            </div>
          </form>

          {/* Journal entries list */}
          {journalEntries.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              No journal entries yet. Start documenting your garden journey!
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {journalEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg group"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg">{typeEmojis[entry.type]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
                        {entry.text}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(entry.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeJournalEntry(entry.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                      title="Delete note"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
