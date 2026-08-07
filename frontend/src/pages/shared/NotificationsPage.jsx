import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { Bell, UserPlus, RefreshCw, MessageSquare, Clock, FolderPlus, Check } from 'lucide-react';

const NotificationsPage = () => {
  const { notifications, fetchNotifications, markAsRead, markAllAsRead, loading } = useNotifications();
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.is_read) 
    : notifications;

  const getIcon = (type) => {
    switch (type) {
      case 'task_assigned': return <UserPlus size={20} className="text-blue-500" />;
      case 'task_status': return <RefreshCw size={20} className="text-purple-500" />;
      case 'new_comment': return <MessageSquare size={20} className="text-green-500" />;
      case 'deadline': return <Clock size={20} className="text-red-500" />;
      case 'project_added': return <FolderPlus size={20} className="text-indigo-500" />;
      default: return <Bell size={20} className="text-surface-500" />;
    }
  };

  const getBorderColor = (type) => {
    switch (type) {
      case 'task_assigned': return 'border-blue-500';
      case 'task_status': return 'border-purple-500';
      case 'new_comment': return 'border-green-500';
      case 'deadline': return 'border-red-500';
      case 'project_added': return 'border-indigo-500';
      default: return 'border-surface-500';
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Notifications</h1>
        {notifications.some(n => !n.is_read) && (
          <button 
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 bg-surface-100 hover:bg-surface-200 dark:bg-surface-800 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300 rounded-lg transition-colors text-sm font-medium"
          >
            <Check size={16} />
            Mark All as Read
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 overflow-hidden shadow-sm">
        <div className="border-b border-surface-200 dark:border-surface-800 flex bg-surface-50 dark:bg-surface-800/50">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              filter === 'all' 
                ? 'border-primary-500 text-primary-600 dark:text-primary-400' 
                : 'border-transparent text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
            }`}
          >
            All Notifications
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              filter === 'unread' 
                ? 'border-primary-500 text-primary-600 dark:text-primary-400' 
                : 'border-transparent text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
            }`}
          >
            Unread
          </button>
        </div>

        <div className="divide-y divide-surface-200 dark:divide-surface-800">
          {loading ? (
            <div className="p-8 text-center text-surface-500">Loading notifications...</div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-12 text-center text-surface-500">
              <Bell size={48} className="mx-auto text-surface-300 dark:text-surface-600 mb-4" />
              <p className="text-lg font-medium text-surface-700 dark:text-surface-300">No notifications found</p>
              <p className="text-sm mt-1">You're all caught up!</p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`p-4 sm:p-6 flex gap-4 transition-colors relative border-l-4 ${getBorderColor(notif.type)} ${
                  !notif.is_read 
                    ? 'bg-primary-50/50 dark:bg-primary-900/10 hover:bg-primary-50 dark:hover:bg-primary-900/20' 
                    : 'bg-white dark:bg-surface-900 hover:bg-surface-50 dark:hover:bg-surface-800/50'
                }`}
              >
                <div className="flex-shrink-0 mt-1">
                  <div className="w-10 h-10 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                    {getIcon(notif.type)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-base ${!notif.is_read ? 'font-medium text-surface-900 dark:text-white' : 'text-surface-700 dark:text-surface-300'}`}>
                    {notif.message}
                  </p>
                  <p className="text-sm text-surface-500 mt-1">{formatTime(notif.created_at)}</p>
                </div>
                {!notif.is_read && (
                  <div className="flex-shrink-0 flex items-center">
                    <button 
                      onClick={() => markAsRead(notif.id)}
                      className="px-3 py-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
                    >
                      Mark as read
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
