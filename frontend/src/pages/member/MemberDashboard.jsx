import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import { ClipboardList, PlayCircle, Search, CheckCircle } from 'lucide-react';

const MemberDashboard = () => {
  const { user } = useAuth();

  const stats = [
    { title: 'Assigned Tasks', value: '—', icon: ClipboardList, colorClass: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
    { title: 'In Progress', value: '—', icon: PlayCircle, colorClass: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' },
    { title: 'In Review', value: '—', icon: Search, colorClass: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
    { title: 'Completed', value: '—', icon: CheckCircle, colorClass: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Member Dashboard</h1>
        <p className="text-surface-500 dark:text-surface-400">Welcome back, {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 p-6 min-h-[400px]">
        <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">My Tasks</h2>
        <div className="flex items-center justify-center h-64 text-surface-400 border-2 border-dashed border-surface-200 dark:border-surface-800 rounded-lg">
          No tasks assigned to you right now.
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
