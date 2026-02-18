'use client';

import { useState, useMemo } from 'react';
import { useGardenStore, Reminder, Notification } from '@/stores/gardenStore';
import { getPlantById } from '@/lib/plants';

export default function GardenReminders() {
  const {
    reminders,
    notifications,
    unreadNotificationCount,
    addReminder,
    completeReminder,
    snoozeReminder,
    deleteReminder,
    getUpcomingReminders,
    getOverdueReminders,
    markNotificationRead,
    clearNotifications,
    placedPlants,
  } = useGardenStore();
  
  const [isOpen, setIsOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Form state
  const [newReminder, setNewReminder] = useState({
    type: 'water' as Reminder['type'],
    plantId: '',
    title: '',
    notes: '',
    dueDate: '',
    recurringDays: 0,
  });
  
  const upcomingReminders = getUpcomingReminders();
  const overdueReminders = getOverdueReminders();
  
  const getTypeEmoji = (type: Reminder['type']) => {
    switch (type) {
      case 'water': return '💧';
      case 'fertilize': return '🧪';
      case 'harvest': return '🌾';
      case 'check': return '👀';
      case 'custom': return '📝';
    }
  };
  
  const getTypeColor = (type: Reminder['type']) => {
    switch (type) {
      case 'water': return 'bg-blue-100 text-blue-700';
      case 'fertilize': return 'bg-purple-100 text-purple-700';
      case 'harvest': return 'bg-amber-100 text-amber-700';
      case 'check': return 'bg-gray-100 text-gray-700';
      case 'custom': return 'bg-green-100 text-green-700';
    }
  };
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `In ${diffDays} days`;
  };
  
  const handleAddReminder = () => {
    if (!newReminder.title || !newReminder.dueDate) return;
    
    const plant = newReminder.plantId ? getPlantById(newReminder.plantId) : null;
    const placedPlant = newReminder.plantId 
      ? placedPlants.find(p => p.plantId === newReminder.plantId)
      : null;
    
    addReminder({
      type: newReminder.type,
      plantId: newReminder.plantId || undefined,
      plantX: placedPlant?.x,
      plantY: placedPlant?.y,
      title: newReminder.title,
      notes: newReminder.notes || undefined,
      dueDate: new Date(newReminder.dueDate).toISOString(),
      completed: false,
      recurringDays: newReminder.recurringDays > 0 ? newReminder.recurringDays : undefined,
    });
    
    setNewReminder({
      type: 'water',
      plantId: '',
      title: '',
      notes: '',
      dueDate: '',
      recurringDays: 0,
    });
    setShowAddForm(false);
  };
  
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'info': return 'ℹ️';
      case 'warning': return '⚠️';
      case 'success': return '✅';
      case 'harvest_ready': return '🌾';
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between"
      >
        <h3 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
          <span>🔔</span> Reminders
          {overdueReminders.length > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              {overdueReminders.length}
            </span>
          )}
        </h3>
        <span className="text-gray-400">{isOpen ? '▼' : '▶'}</span>
      </button>
      
      {/* Notification bell */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="mt-2 w-full flex items-center justify-between text-sm text-gray-500 hover:text-gray-700"
      >
        <span>📫 Notifications</span>
        {unreadNotificationCount > 0 && (
          <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
            {unreadNotificationCount} new
          </span>
        )}
      </button>
      
      {/* Notifications panel */}
      {showNotifications && (
        <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg max-h-48 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No notifications yet</p>
          ) : (
            <div className="space-y-2">
              {notifications.slice(0, 10).map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markNotificationRead(notif.id)}
                  className={`p-2 rounded-lg text-sm cursor-pointer ${
                    notif.read ? 'bg-white dark:bg-gray-600 opacity-60' : 'bg-white dark:bg-gray-600'
                  }`}
                >
                  <span className="mr-2">{getNotificationIcon(notif.type)}</span>
                  {notif.message}
                </div>
              ))}
              <button
                onClick={clearNotifications}
                className="w-full mt-2 text-xs text-gray-500 hover:text-gray-700"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Content */}
      {isOpen && (
        <div className="mt-4 space-y-4">
          {/* Add reminder button */}
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-2 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <span>+</span> Add Reminder
            </button>
          ) : (
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-3">
              <h4 className="font-medium text-gray-700 dark:text-gray-200">New Reminder</h4>
              
              {/* Type */}
              <div>
                <label className="text-xs text-gray-500">Type</label>
                <div className="flex gap-1 mt-1">
                  {(['water', 'fertilize', 'harvest', 'check', 'custom'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setNewReminder({ ...newReminder, type })}
                      className={`flex-1 py-1 px-2 rounded text-xs capitalize ${
                        newReminder.type === type
                          ? getTypeColor(type)
                          : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {getTypeEmoji(type)} {type}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Title */}
              <div>
                <label className="text-xs text-gray-500">Title</label>
                <input
                  type="text"
                  value={newReminder.title}
                  onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                  placeholder="e.g., Water tomatoes"
                  className="w-full mt-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
              </div>
              
              {/* Plant (optional) */}
              <div>
                <label className="text-xs text-gray-500">Plant (optional)</label>
                <select
                  value={newReminder.plantId}
                  onChange={(e) => setNewReminder({ ...newReminder, plantId: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                >
                  <option value="">No specific plant</option>
                  {placedPlants.map((p) => {
                    const plant = getPlantById(p.plantId);
                    return plant ? (
                      <option key={p.id} value={p.plantId}>
                        {plant.emoji} {plant.name} (at {p.x},{p.y})
                      </option>
                    ) : null;
                  })}
                </select>
              </div>
              
              {/* Due date */}
              <div>
                <label className="text-xs text-gray-500">Due Date</label>
                <input
                  type="datetime-local"
                  value={newReminder.dueDate}
                  onChange={(e) => setNewReminder({ ...newReminder, dueDate: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
              </div>
              
              {/* Recurring */}
              <div>
                <label className="text-xs text-gray-500">Repeat every (days, 0 = one-time)</label>
                <input
                  type="number"
                  min="0"
                  value={newReminder.recurringDays}
                  onChange={(e) => setNewReminder({ ...newReminder, recurringDays: parseInt(e.target.value) || 0 })}
                  className="w-full mt-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
              </div>
              
              {/* Notes */}
              <div>
                <label className="text-xs text-gray-500">Notes (optional)</label>
                <textarea
                  value={newReminder.notes}
                  onChange={(e) => setNewReminder({ ...newReminder, notes: e.target.value })}
                  placeholder="Additional notes..."
                  className="w-full mt-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                  rows={2}
                />
              </div>
              
              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={handleAddReminder}
                  className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          
          {/* Overdue reminders */}
          {overdueReminders.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-red-600 mb-2">⚠️ Overdue</h4>
              <div className="space-y-2">
                {overdueReminders.map((reminder) => {
                  const plant = reminder.plantId ? getPlantById(reminder.plantId) : null;
                  return (
                    <div
                      key={reminder.id}
                      className="p-3 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getTypeEmoji(reminder.type)}</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">
                              {reminder.title}
                            </span>
                          </div>
                          {plant && (
                            <p className="text-xs text-gray-500 mt-1">
                              {plant.emoji} {plant.name}
                            </p>
                          )}
                          <p className="text-xs text-red-600 mt-1">
                            {formatDate(reminder.dueDate)}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => completeReminder(reminder.id)}
                            className="p-1.5 bg-green-500 hover:bg-green-600 text-white rounded text-xs"
                            title="Mark complete"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => snoozeReminder(reminder.id, 1)}
                            className="p-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-xs"
                            title="Snooze 1 day"
                          >
                            ⏰
                          </button>
                          <button
                            onClick={() => deleteReminder(reminder.id)}
                            className="p-1.5 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded text-xs"
                            title="Delete"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Upcoming reminders */}
          {upcomingReminders.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                📅 Upcoming ({upcomingReminders.length})
              </h4>
              <div className="space-y-2">
                {upcomingReminders.slice(0, 5).map((reminder) => {
                  const plant = reminder.plantId ? getPlantById(reminder.plantId) : null;
                  return (
                    <div
                      key={reminder.id}
                      className="p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getTypeEmoji(reminder.type)}</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">
                              {reminder.title}
                            </span>
                            {reminder.recurringDays && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                                🔄 {reminder.recurringDays}d
                              </span>
                            )}
                          </div>
                          {plant && (
                            <p className="text-xs text-gray-500 mt-1">
                              {plant.emoji} {plant.name}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(reminder.dueDate)}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => completeReminder(reminder.id)}
                            className="p-1.5 bg-green-500 hover:bg-green-600 text-white rounded text-xs"
                            title="Mark complete"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => snoozeReminder(reminder.id, 1)}
                            className="p-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-xs"
                            title="Snooze 1 day"
                          >
                            ⏰
                          </button>
                          <button
                            onClick={() => deleteReminder(reminder.id)}
                            className="p-1.5 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded text-xs"
                            title="Delete"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {upcomingReminders.length > 5 && (
                <p className="text-xs text-gray-400 text-center mt-2">
                  +{upcomingReminders.length - 5} more reminders
                </p>
              )}
            </div>
          )}
          
          {/* Empty state */}
          {upcomingReminders.length === 0 && overdueReminders.length === 0 && !showAddForm && (
            <p className="text-sm text-gray-400 text-center py-4">
              No upcoming reminders. Add one to stay on top of your garden!
            </p>
          )}
          
          {/* Completed reminders */}
          {reminders.filter(r => r.completed).length > 0 && (
            <details className="mt-4">
              <summary className="text-sm text-gray-500 cursor-pointer">
                ✅ {reminders.filter(r => r.completed).length} completed
              </summary>
              <div className="mt-2 space-y-1 opacity-60">
                {reminders.filter(r => r.completed).slice(0, 5).map((reminder) => (
                  <div key={reminder.id} className="text-sm text-gray-500 flex items-center gap-2">
                    <span>{getTypeEmoji(reminder.type)}</span>
                    <span>{reminder.title}</span>
                    <button
                      onClick={() => deleteReminder(reminder.id)}
                      className="ml-auto text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
