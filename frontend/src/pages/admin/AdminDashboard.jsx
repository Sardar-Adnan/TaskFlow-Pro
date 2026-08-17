import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dashboardAPI, projectsAPI } from '../../services/api';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import { Users, Briefcase, Activity, CheckCircle, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import ActivityTimeline from '../../components/ActivityTimeline';
import EmptyState from '../../components/EmptyState';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [statsData, setStatsData] = useState(null);
  const [recentProjects, setRecentProjects] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, projectsRes] = await Promise.all([
          dashboardAPI.getStats(),
          projectsAPI.getAll()
        ]);
        setStatsData(statsRes.data);
        
        // Assuming projects are ordered by created_at, or just take the last 5
        const sortedProjects = projectsRes.data.reverse().slice(0, 5);
        setRecentProjects(sortedProjects);
      } catch (err) {
        toast.error('Failed to load dashboard data');
      }
    };
    fetchDashboardData();
  }, []);

  const stats = [
    { title: 'Total Users', value: statsData?.total_users || '—', icon: Users, colorClass: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
    { title: 'Total Projects', value: statsData?.total_projects || '—', icon: Briefcase, colorClass: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' },
    { title: 'Active Tasks', value: statsData?.active_tasks || '—', icon: Activity, colorClass: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
    { title: 'Completed Tasks', value: statsData?.completed_tasks || '—', icon: CheckCircle, colorClass: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-surface-500 dark:text-surface-400">Welcome back, {user?.name || user?.email}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 p-6 min-h-[400px]">
        <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Recent Projects</h2>
        {recentProjects.length === 0 ? (
          <EmptyState 
            icon={PlusCircle}
            title="No projects found"
            message="Get started by creating your first project!"
            action={{ label: "Create Project", onClick: () => navigate('/admin/projects') }}
          />
        ) : (
          <div className="overflow-x-auto border border-surface-200 dark:border-surface-800 rounded-lg">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-50 dark:bg-surface-800/50 text-surface-500 dark:text-surface-400 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">Project Name</th>
                  <th className="px-4 py-3">Manager</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
                {recentProjects.map((project) => (
                  <tr key={project.id} onClick={() => navigate(`/admin/projects/${project.id}`)} className="cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-surface-900 dark:text-white">{project.name}</td>
                    <td className="px-4 py-3">{project.manager_name || 'Unassigned'}</td>
                    <td className="px-4 py-3"><StatusBadge type="status" value={project.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-surface-200 dark:bg-surface-700 rounded-full h-1.5 max-w-[100px]">
                          <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: `${project.total_tasks > 0 ? ((project.completed_tasks || 0) / project.total_tasks) * 100 : 0}%` }}></div>
                        </div>
                        <span className="text-xs text-surface-500">{project.completed_tasks || 0}/{project.total_tasks || 0}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 p-6">
        <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Activity Feed</h2>
        <ActivityTimeline />
      </div>
    </div>
  );
};

export default AdminDashboard;
