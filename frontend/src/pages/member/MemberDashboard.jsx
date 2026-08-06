import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dashboardAPI, projectsAPI } from '../../services/api';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import { ClipboardList, PlayCircle, Search, CheckCircle, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const MemberDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [statsData, setStatsData] = useState(null);
  const [upcomingTasks, setUpcomingTasks] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsRes = await dashboardAPI.getStats();
        setStatsData(statsRes.data);

        // Fetching tasks across projects for the member
        const projRes = await projectsAPI.getAll();
        let allTasks = [];
        for (let p of projRes.data) {
          const taskRes = await projectsAPI.getTasks(p.id);
          // Just filtering out completed tasks to show upcoming
          const pendingTasks = taskRes.data.filter(t => t.status !== 'completed').map(t => ({...t, project_name: p.name}));
          allTasks = [...allTasks, ...pendingTasks];
        }
        
        // Sort by due date, take top 5
        allTasks.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
        setUpcomingTasks(allTasks.slice(0, 5));
      } catch (err) {
        toast.error('Failed to load dashboard data');
      }
    };
    fetchDashboardData();
  }, []);

  // Use stats from API, fallback to 0
  const stats = [
    { title: 'Assigned Tasks', value: (statsData?.active_tasks || 0) + (statsData?.completed_tasks || 0) || '—', icon: ClipboardList, colorClass: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
    { title: 'In Progress', value: statsData?.active_tasks || '—', icon: PlayCircle, colorClass: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' },
    { title: 'In Review', value: statsData?.review_tasks || '—', icon: Search, colorClass: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
    { title: 'Completed', value: statsData?.completed_tasks || '—', icon: CheckCircle, colorClass: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Member Dashboard</h1>
        <p className="text-surface-500 dark:text-surface-400">Welcome back, {user?.username || user?.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 p-6 min-h-[400px]">
        <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Upcoming Tasks</h2>
        {upcomingTasks.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-surface-400 border-2 border-dashed border-surface-200 dark:border-surface-800 rounded-lg">
            No upcoming tasks assigned to you.
          </div>
        ) : (
          <div className="overflow-x-auto border border-surface-200 dark:border-surface-800 rounded-lg">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-50 dark:bg-surface-800/50 text-surface-500 dark:text-surface-400 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">Task Name</th>
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
                {upcomingTasks.map((task) => (
                  <tr key={task.id} onClick={() => navigate('/member/tasks')} className="cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-surface-900 dark:text-white">{task.title}</td>
                    <td className="px-4 py-3 text-surface-600 dark:text-surface-300">{task.project_name}</td>
                    <td className="px-4 py-3"><StatusBadge type="priority" value={task.priority} /></td>
                    <td className="px-4 py-3"><StatusBadge type="status" value={task.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-surface-600 dark:text-surface-300">
                        <Calendar className="h-4 w-4" />
                        {new Date(task.due_date).toLocaleDateString()}
                      </div>
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

export default MemberDashboard;
