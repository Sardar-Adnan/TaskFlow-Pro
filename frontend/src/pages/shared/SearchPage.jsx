import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { projectsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Search, Briefcase, CheckSquare, ChevronRight, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState({ projects: [], tasks: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);
        // Call projects API. If the API supports ?search=query, we use it.
        // As per typical DRF, ?search=query applies to both projects and maybe nested tasks if configured.
        // Let's assume projectsAPI.getAll() supports a query parameter, or we filter client-side.
        // For robustness, let's filter client-side if no backend support, but usually we just append it.
        const res = await projectsAPI.getAll(); // Assuming we don't have search params on the backend out of the box in this phase, or we can just filter client side for now.
        
        let allProjects = res.data;
        let matchedProjects = [];
        let matchedTasks = [];

        const lowerQuery = query.toLowerCase();

        allProjects.forEach(project => {
          if (project.name.toLowerCase().includes(lowerQuery) || project.description?.toLowerCase().includes(lowerQuery)) {
            matchedProjects.push(project);
          }

          // Search in tasks if available
          if (project.tasks && Array.isArray(project.tasks)) {
            project.tasks.forEach(task => {
              if (task.title.toLowerCase().includes(lowerQuery) || task.description?.toLowerCase().includes(lowerQuery)) {
                matchedTasks.push({ ...task, projectName: project.name, projectId: project.id });
              }
            });
          }
        });

        setResults({ projects: matchedProjects, tasks: matchedTasks });
      } catch (err) {
        setError('Failed to fetch search results.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const handleProjectClick = (projectId) => {
    if (user.role === 'admin') {
      navigate(`/admin/projects/${projectId}`);
    } else if (user.role === 'pm') {
      navigate(`/manager/projects/${projectId}`);
    } else {
      // member doesn't have project detail page, maybe navigate somewhere or nowhere
    }
  };

  const handleTaskClick = (projectId, taskId) => {
    if (user.role === 'admin') {
      navigate(`/admin/projects/${projectId}`); // Can't go directly to task usually unless there's a task page
    } else if (user.role === 'pm') {
      navigate(`/manager/projects/${projectId}`);
    } else {
      navigate(`/member/tasks`);
    }
  };

  if (loading) return <div className="p-8"><LoadingSpinner /></div>;
  if (error) return (
    <div className="p-8 text-center text-red-500 flex flex-col items-center">
      <AlertCircle size={48} className="mb-4 text-red-400" />
      <p>{error}</p>
    </div>
  );

  const hasResults = results.projects.length > 0 || results.tasks.length > 0;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">Search Results</h1>
        <p className="text-surface-600 dark:text-surface-400">
          Showing results for "{query}"
        </p>
      </div>

      {!hasResults && query ? (
        <EmptyState
          icon={Search}
          title="No results found"
          message={`We couldn't find anything matching "${query}". Try different keywords.`}
        />
      ) : null}

      {!query && (
         <EmptyState
         icon={Search}
         title="Search TaskFlow Pro"
         message={`Enter a keyword above to search for projects and tasks.`}
       />
      )}

      {results.projects.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
            <Briefcase size={20} className="text-primary-500" />
            Projects ({results.projects.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {results.projects.map(project => (
              <div 
                key={project.id}
                onClick={() => handleProjectClick(project.id)}
                className="bg-white dark:bg-surface-800 p-4 rounded-xl border border-surface-200 dark:border-surface-700 hover:border-primary-500 dark:hover:border-primary-500 cursor-pointer transition-all flex justify-between items-center group shadow-sm hover:shadow"
              >
                <div>
                  <h3 className="font-semibold text-surface-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-sm text-surface-500 dark:text-surface-400 line-clamp-1">
                    {project.description || 'No description provided'}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status={project.status} />
                  <ChevronRight size={20} className="text-surface-400 group-hover:text-primary-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {results.tasks.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
            <CheckSquare size={20} className="text-blue-500" />
            Tasks ({results.tasks.length})
          </h2>
          <div className="space-y-3">
            {results.tasks.map(task => (
              <div 
                key={task.id}
                onClick={() => handleTaskClick(task.projectId, task.id)}
                className="bg-white dark:bg-surface-800 p-4 rounded-xl border border-surface-200 dark:border-surface-700 hover:border-blue-500 dark:hover:border-blue-500 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group shadow-sm hover:shadow"
              >
                <div>
                  <h3 className="font-semibold text-surface-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {task.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-surface-500 dark:text-surface-400">
                    <span className="truncate max-w-[200px]">In: {task.projectName}</span>
                    <span>•</span>
                    <span className="capitalize">{task.priority} Priority</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status={task.status} />
                  <ChevronRight size={20} className="text-surface-400 group-hover:text-blue-500 hidden sm:block" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
