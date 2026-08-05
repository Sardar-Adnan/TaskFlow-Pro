const StatCard = ({ title, value, icon: Icon, colorClass }) => {
  return (
    <div className="bg-white dark:bg-surface-900 p-6 rounded-xl border border-surface-200 dark:border-surface-800 shadow-sm flex items-center gap-4">
      <div className={`p-4 rounded-lg ${colorClass}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm font-medium text-surface-500 dark:text-surface-400">{title}</p>
        <p className="text-2xl font-bold text-surface-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
