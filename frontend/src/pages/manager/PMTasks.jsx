import React, { useState, useEffect } from 'react';
import { dashboardAPI, tasksAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Calendar, Clock, CheckCircle } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

const PMTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Re-using dashboard stats logic to get all tasks for PM across projects or just using an endpoint.
  // Wait, PM tasks: Shows all tasks across PM's managed projects. We don't have a specific endpoint for this in instructions,
  // let's fetch projects, then fetch tasks for each project, and combine them.
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchAllTasks = async () => {
      try {
        setLoading(true);
        // The API instructions don't give a "get all tasks for PM" endpoint, so we'll fetch stats or projects
        // wait, we can just fetch projects, then fetch tasks for each project.
        // Actually, we don't have projectsAPI imported here yet. Let's import it.
        const { projectsAPI } = require('../../services/api');
        const projRes = await projectsAPI.getAll();
        const projs = projRes.data;
        
        let allTasks = [];
        for (let p of projs) {
          const taskRes = await projectsAPI.getTasks(p.id);
          const tasksWithProjectInfo = taskRes.data.map(t => ({...t, project_name: p.name}));
          allTasks = [...allTasks, ...tasksWithProjectInfo];
        }
        setTasks(allTasks);
      } catch (err) {
        toast.error('Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllTasks();
  }, []);

  const columns = [
    { id: 'todo', title: 'To Do', color: 'border-surface-200' },
    { id: 'in_progress', title: 'In Progress', color: 'border-blue-200' },
    { id: 'review', title: 'Review', color: 'border-yellow-200' },
    { id: 'completed', title: 'Completed', color: 'border-green-200' },
  ];

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex justify-between items-center shrink-0">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Task Board</h1>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center"><LoadingSpinner /></div>
      ) : (
        <div className="flex-1 overflow-x-auto overflow-y-auto md:overflow-y-hidden">
          <div className="flex flex-col md:flex-row h-full gap-6 pb-4 md:min-w-max">
            {columns.map(col => (
              <div key={col.id} className="w-full md:w-80 flex flex-col bg-surface-50 dark:bg-surface-800/50 rounded-xl border border-surface-200 dark:border-surface-800 p-4 h-[500px] md:h-full shrink-0">
                <div className="flex justify-between items-center mb-4 shrink-0">
                  <h3 className="font-semibold text-surface-900 dark:text-white flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${col.id === 'todo' ? 'bg-surface-400' : col.id === 'in_progress' ? 'bg-blue-500' : col.id === 'review' ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
                    {col.title}
                  </h3>
                  <span className="bg-white dark:bg-surface-800 px-2 py-0.5 rounded-full text-xs font-medium text-surface-500">
                    {tasks.filter(t => t.status === col.id).length}
                  </span>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                  {tasks.filter(t => t.status === col.id).map(task => (
                    <div key={task.id} className="bg-white dark:bg-surface-900 p-4 rounded-lg border border-surface-200 dark:border-surface-700 shadow-sm hover:border-primary-500 transition-colors cursor-pointer group">
                      <div className="flex justify-between items-start mb-2">
                        <StatusBadge type="priority" value={task.priority} />
                      </div>
                      <h4 className="font-medium text-surface-900 dark:text-white mb-1 group-hover:text-primary-600 transition-colors">{task.title}</h4>
                      <p className="text-xs text-surface-500 dark:text-surface-400 mb-4 line-clamp-1">{task.project_name}</p>
                      
                      <div className="flex justify-between items-center border-t border-surface-100 dark:border-surface-800 pt-3">
                        <div className="flex items-center gap-2 text-xs text-surface-500">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(task.due_date).toLocaleDateString()}</span>
                        </div>
                        {task.assignee_name && (
                          <div className="h-6 w-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold" title={task.assignee_name}>
                            {task.assignee_name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PMTasks;
