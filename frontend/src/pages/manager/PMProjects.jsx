import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Search, Folder, Calendar, Users as UsersIcon, CheckSquare } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

const PMProjects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await projectsAPI.getAll();
      setProjects(res.data);
    } catch (err) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? p.status === statusFilter : true;
    const matchesPriority = priorityFilter ? p.priority === priorityFilter : true;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">My Projects</h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-surface-900 p-4 rounded-xl border border-surface-200 dark:border-surface-800 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-surface-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-surface-200 dark:border-surface-700 rounded-lg bg-surface-50 dark:bg-surface-800 focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-surface-200 dark:border-surface-700 rounded-lg bg-surface-50 dark:bg-surface-800 focus:ring-2 focus:ring-primary-500 outline-none"
        >
          <option value="">All Statuses</option>
          <option value="planning">Planning</option>
          <option value="active">Active</option>
          <option value="on_hold">On Hold</option>
          <option value="completed">Completed</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-2 border border-surface-200 dark:border-surface-700 rounded-lg bg-surface-50 dark:bg-surface-800 focus:ring-2 focus:ring-primary-500 outline-none"
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><LoadingSpinner /></div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 shadow-sm">
          <EmptyState
            icon={Folder}
            title="No projects found"
            description="You have no assigned projects matching your filters."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <div
              key={project.id}
              onClick={() => navigate(`/manager/projects/${project.id}`)}
              className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 shadow-sm p-6 cursor-pointer hover:border-primary-500 transition-all flex flex-col h-full group"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-surface-900 dark:text-white group-hover:text-primary-600 transition-colors line-clamp-1">{project.name}</h3>
                <div className="flex flex-col gap-1 items-end shrink-0">
                  <StatusBadge type="status" value={project.status} />
                  <StatusBadge type="priority" value={project.priority} />
                </div>
              </div>
              
              <p className="text-sm text-surface-500 dark:text-surface-400 mb-6 line-clamp-2 flex-grow">
                {project.description}
              </p>

              <div className="space-y-3 mt-auto">
                <div className="flex items-center justify-between text-sm text-surface-600 dark:text-surface-300">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-surface-400" />
                    <span>
                      {new Date(project.start_date).toLocaleDateString()} - {new Date(project.end_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-surface-100 dark:border-surface-800">
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="text-surface-600 dark:text-surface-400 flex items-center gap-1.5">
                      <CheckSquare className="h-4 w-4" />
                      Tasks
                    </span>
                    <span className="font-medium text-surface-900 dark:text-white">
                      {project.completed_tasks || 0}/{project.total_tasks || 0}
                    </span>
                  </div>
                  <div className="w-full bg-surface-100 dark:bg-surface-800 rounded-full h-1.5">
                    <div 
                      className="bg-primary-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${project.total_tasks > 0 ? ((project.completed_tasks || 0) / project.total_tasks) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PMProjects;
