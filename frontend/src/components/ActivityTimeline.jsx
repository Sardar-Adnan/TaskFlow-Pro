import { useState, useEffect } from 'react';
import { activityAPI } from '../services/api';
import { 
  Plus, Edit, Trash2, RefreshCw, 
  UserPlus, UserMinus, MessageSquare, AlertCircle
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';

const getActionIcon = (actionType) => {
  switch (actionType) {
    case 'created': return <Plus size={16} className="text-green-500" />;
    case 'updated': return <Edit size={16} className="text-blue-500" />;
    case 'deleted': return <Trash2 size={16} className="text-red-500" />;
    case 'status_changed': return <RefreshCw size={16} className="text-yellow-500" />;
    case 'member_added': return <UserPlus size={16} className="text-purple-500" />;
    case 'member_removed': return <UserMinus size={16} className="text-orange-500" />;
    case 'comment_added': return <MessageSquare size={16} className="text-teal-500" />;
    default: return <AlertCircle size={16} className="text-surface-500" />;
  }
};

const getActionBg = (actionType) => {
  switch (actionType) {
    case 'created': return 'bg-green-100 dark:bg-green-900/30';
    case 'updated': return 'bg-blue-100 dark:bg-blue-900/30';
    case 'deleted': return 'bg-red-100 dark:bg-red-900/30';
    case 'status_changed': return 'bg-yellow-100 dark:bg-yellow-900/30';
    case 'member_added': return 'bg-purple-100 dark:bg-purple-900/30';
    case 'member_removed': return 'bg-orange-100 dark:bg-orange-900/30';
    case 'comment_added': return 'bg-teal-100 dark:bg-teal-900/30';
    default: return 'bg-surface-100 dark:bg-surface-800';
  }
};

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.round((now - date) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const ActivityTimeline = ({ projectId = null }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const res = await activityAPI.getAll(projectId);
        // Assuming API returns array or { results: array }
        const data = Array.isArray(res.data) ? res.data : res.data.results || [];
        setActivities(data);
      } catch (err) {
        console.error('Failed to fetch activity', err);
        setError('Failed to load activity feed.');
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, [projectId]);

  if (loading) return <div className="py-8"><LoadingSpinner /></div>;
  if (error) return <div className="text-red-500 p-4 text-center">{error}</div>;
  if (activities.length === 0) {
    return (
      <EmptyState 
        icon={RefreshCw} 
        title="No Activity Yet" 
        message="When things happen, they'll show up here." 
      />
    );
  }

  return (
    <div className="relative border-l border-surface-200 dark:border-surface-700 ml-4 space-y-6">
      {activities.map((activity, idx) => (
        <div key={activity.id || idx} className="relative pl-6">
          <span className={`absolute -left-3 top-1 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-surface-900 ${getActionBg(activity.action)}`}>
            {getActionIcon(activity.action)}
          </span>
          <div className="bg-white dark:bg-surface-800 p-4 rounded-xl shadow-sm border border-surface-100 dark:border-surface-700">
            <p className="text-sm text-surface-800 dark:text-surface-200">
              <span className="font-semibold text-surface-900 dark:text-white">
                {activity.user?.name || 'Someone'}
              </span>
              {' '}
              {activity.description || 'performed an action'}
            </p>
            <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
              {activity.created_at ? formatTimeAgo(activity.created_at) : 'just now'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityTimeline;
