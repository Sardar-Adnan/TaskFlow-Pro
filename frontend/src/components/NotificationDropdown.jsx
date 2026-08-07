import React, { useState, useEffect, useRef } from 'react';
import { Bell, UserPlus, RefreshCw, MessageSquare, Clock, FolderPlus, Check } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { Link } from 'react-router-dom';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead, loading } = useNotifications();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications(true); // Fetch unread notifications for dropdown
    }
  }, [isOpen]);

  const getIcon = (type) => {
    switch (type) {
      case 'task_assigned': return <UserPlus size={16} className="text-blue-500" />;
      case 'task_status': return <RefreshCw size={16} className="text-purple-500" />;
      case 'new_comment': return <MessageSquare size={16} className="text-green-500" />;
      case 'deadline': return <Clock size={16} className="text-red-500" />;
      case 'project_added': return <FolderPlus size={16} className="text-indigo-500" />;
      default: return <Bell size={16} className="text-surface-500" />;
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-surface-500 hover:text-surface-900 dark:hover:text-white rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors relative"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-surface-900" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 shadow-xl overflow-hidden z-50">
          <div className="p-4 border-b border-surface-200 dark:border-surface-800 flex justify-between items-center bg-surface-50 dark:bg-surface-800/50">
            <h3 className="font-semibold text-surface-900 dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
              >
                <Check size={12} />
                Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-surface-500 text-sm">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-surface-500 dark:text-surface-400 text-sm">
                No new notifications
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`p-4 border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors flex gap-3 ${!notif.is_read ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}
                >
                  <div className="mt-1 flex-shrink-0">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-surface-900 dark:text-surface-100">{notif.message}</p>
                    <p className="text-xs text-surface-500 mt-1">{formatTime(notif.created_at)}</p>
                  </div>
                  {!notif.is_read && (
                    <button 
                      onClick={() => markAsRead(notif.id)}
                      className="flex-shrink-0 w-2 h-2 rounded-full bg-primary-500 mt-2"
                      title="Mark as read"
                    />
                  )}
                </div>
              ))
            )}
          </div>
          
          <div className="p-3 border-t border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-800/50 text-center">
            <Link 
              to="/notifications" 
              onClick={() => setIsOpen(false)}
              className="text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline"
            >
              View All Notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
