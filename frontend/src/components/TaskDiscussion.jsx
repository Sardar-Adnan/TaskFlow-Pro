import React, { useState, useEffect, useRef } from 'react';
import { discussionsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Send, User } from 'lucide-react';

const TaskDiscussion = ({ taskId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const endOfMessagesRef = useRef(null);

  const fetchDiscussions = async () => {
    try {
      const response = await discussionsAPI.getByTask(taskId);
      setComments(response.data);
    } catch (error) {
      toast.error('Failed to load discussions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (taskId) {
      fetchDiscussions();
    }
  }, [taskId]);

  useEffect(() => {
    // Auto-scroll to bottom
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      await discussionsAPI.create(taskId, newComment);
      setNewComment('');
      fetchDiscussions();
    } catch (error) {
      toast.error('Failed to post comment');
    } finally {
      setSubmitting(false);
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
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString();
  };

  if (loading) {
    return <div className="p-4 text-center text-surface-500">Loading discussions...</div>;
  }

  return (
    <div className="flex flex-col bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 mt-4 overflow-hidden">
      <div className="p-4 border-b border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-800/50">
        <h3 className="font-semibold text-surface-900 dark:text-white">Discussion</h3>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto max-h-96 min-h-[200px] flex flex-col gap-4">
        {comments.length === 0 ? (
          <div className="text-center text-surface-500 dark:text-surface-400 py-8">
            No comments yet. Start the discussion!
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-semibold text-sm">
                {comment.user?.name ? comment.user.name.charAt(0).toUpperCase() : <User size={16} />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-surface-900 dark:text-white">
                    {comment.user?.name || 'Unknown User'}
                  </span>
                  {comment.user?.role && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-500">
                      {comment.user.role.replace('_', ' ')}
                    </span>
                  )}
                  <span className="text-xs text-surface-400 ml-auto">
                    {formatTime(comment.created_at)}
                  </span>
                </div>
                <div className="text-sm text-surface-700 dark:text-surface-300 bg-surface-50 dark:bg-surface-800/50 p-3 rounded-lg rounded-tl-none border border-surface-100 dark:border-surface-800">
                  {comment.content}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={endOfMessagesRef} />
      </div>

      <div className="p-4 border-t border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-800/50">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Type a comment..."
            className="flex-1 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:outline-none dark:text-white"
            disabled={submitting}
          />
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-lg disabled:opacity-50 transition-colors flex items-center justify-center"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default TaskDiscussion;
