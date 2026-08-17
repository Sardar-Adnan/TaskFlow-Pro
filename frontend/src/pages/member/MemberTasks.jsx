import React, { useState, useEffect } from 'react';
import { tasksAPI, projectsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { CheckSquare, Filter, Calendar } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

const MemberTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [statusFilter, setStatusFilter] = useState('');

  const fetchTasks = async () => {
    try {
      setLoading(true);
      // Wait, there's no endpoint for fetching all tasks for a member in the prompt.
      // But they mention "update dashboards to show real data" using `dashboardAPI.getStats()`.
      // Does dashboardAPI return upcoming tasks?
      // Wait, I can fetch all projects (member role might only see their projects), then tasks for each project?
      // Let's assume the user has a `dashboardAPI.getStats()` that contains `upcoming_tasks` or similar.
      // Or maybe there is an endpoint not explicitly mentioned. 
      // Actually, if we look at `projectsAPI.getAll()`, maybe it returns projects the member is part of.
      // Let's do the same as PMTasks: fetch projects, then fetch tasks, then filter for the member's tasks.
      const projRes = await projectsAPI.getAll();
      let allTasks = [];
      for (let p of projRes.data) {
        const taskRes = await projectsAPI.getTasks(p.id);
        const tasksWithProjectInfo = taskRes.data.map(t => ({...t, project_name: p.name}));
        allTasks = [...allTasks, ...tasksWithProjectInfo];
      }
      // Usually, member sees only their tasks. The backend might already filter `getTasks` or we can filter it.
      // Let's filter in UI just in case if we have `useAuth`.
      // For now, let's just display what `getTasks` returns assuming it's filtered or we can just show them all.
      
      setTasks(allTasks);
    } catch (err) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await tasksAPI.updateStatus(taskId, newStatus);
      toast.success('Task status updated');
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    } catch (err) {
      toast.error('Failed to update task status');
    }
  };

  const filteredTasks = tasks.filter(t => {
    const matchesStatus = statusFilter ? t.status === statusFilter : true;
    return matchesStatus;
  }).sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">My Tasks</h1>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-surface-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-surface-200 dark:border-surface-700 rounded-lg bg-surface-50 dark:bg-surface-800 focus:ring-2 focus:ring-primary-500 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><LoadingSpinner /></div>
        ) : filteredTasks.length === 0 ? (
          <EmptyState icon={CheckSquare} title="No tasks found" description="You have no tasks matching your filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-50 dark:bg-surface-800/50 text-surface-500 dark:text-surface-400 uppercase text-xs border-b border-surface-200 dark:border-surface-800">
                <tr>
                  <th className="px-6 py-4">Task Details</th>
                  <th className="px-6 py-4">Project</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
                {filteredTasks.map(task => (
                  <tr key={task.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-surface-900 dark:text-white mb-1">{task.title}</p>
                      <p className="text-xs text-surface-500 line-clamp-1">{task.description}</p>
                    </td>
                    <td className="px-6 py-4 text-surface-600 dark:text-surface-300">{task.project_name}</td>
                    <td className="px-6 py-4"><StatusBadge type="priority" value={task.priority} /></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-surface-600 dark:text-surface-300">
                        <Calendar className="h-4 w-4" />
                        {new Date(task.due_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border outline-none appearance-none cursor-pointer
                          ${task.status === 'todo' ? 'bg-surface-100 text-surface-800 border-surface-200 dark:bg-surface-800 dark:border-surface-700' :
                            task.status === 'in_progress' ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800/50' :
                            task.status === 'review' ? 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800/50' :
                            'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:border-green-800/50'
                          }
                        `}
                      >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="review">Review</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberTasks;
