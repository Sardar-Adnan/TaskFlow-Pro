import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsAPI, usersAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { ArrowLeft, Edit2, Plus, Trash2, Calendar, User, AlignLeft, Users, CheckSquare } from 'lucide-react';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import TaskDiscussion from '../../components/TaskDiscussion';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('tasks');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [expandedTaskId, setExpandedTaskId] = useState(null);

  // Modals state
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  
  const [memberToAdd, setMemberToAdd] = useState('');
  
  const [projectForm, setProjectForm] = useState({});
  const [taskForm, setTaskForm] = useState({
    title: '', description: '', status: 'todo', priority: 'medium', due_date: '', assigned_to_id: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projRes, membersRes, tasksRes, allUsersRes] = await Promise.all([
        projectsAPI.getById(id),
        projectsAPI.getMembers(id),
        projectsAPI.getTasks(id),
        usersAPI.getAll()
      ]);
      
      setProject(projRes.data);
      setMembers(membersRes.data);
      setTasks(tasksRes.data);
      
      const allUsers = allUsersRes.data;
      setManagers(allUsers.filter(u => u.role === 'pm'));
      
      // Filter out users already in the project to show in "Add Member" dropdown
      const memberIds = membersRes.data.map(m => m.user.id);
      setAvailableUsers(allUsers.filter(u => u.role === 'member' && !memberIds.includes(u.id)));

    } catch (err) {
      toast.error('Failed to load project details');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleEditProject = async (e) => {
    e.preventDefault();
    try {
      await projectsAPI.update(id, projectForm);
      toast.success('Project updated');
      setIsEditProjectOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to update project');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberToAdd) return;
    try {
      await projectsAPI.addMember(id, memberToAdd);
      toast.success('Member added');
      setIsAddMemberOpen(false);
      setMemberToAdd('');
      fetchData();
    } catch (err) {
      toast.error('Failed to add member');
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await projectsAPI.removeMember(id, memberId);
      toast.success('Member removed');
      fetchData();
    } catch (err) {
      toast.error('Failed to remove member');
    }
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    try {
      await projectsAPI.createTask(id, taskForm);
      toast.success('Task created');
      setIsTaskModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to create task');
    }
  };

  const openEditProject = () => {
    setProjectForm({
      name: project.name,
      description: project.description,
      status: project.status,
      priority: project.priority,
      start_date: project.start_date,
      end_date: project.end_date,
      manager_id: project.manager || project.manager_id
    });
    setIsEditProjectOpen(true);
  };

  const openCreateTask = () => {
    setTaskForm({
      title: '', description: '', status: 'todo', priority: 'medium', due_date: '', assigned_to_id: ''
    });
    setIsTaskModalOpen(true);
  };

  if (loading) return <div className="flex justify-center py-12"><LoadingSpinner /></div>;
  if (!project) return null;

  const isAdmin = user?.role === 'admin';
  const isPM = user?.role === 'pm';
  const canEditProject = isAdmin || (isPM && project.manager_id === user.id);

  return (
    <div className="space-y-6">
      <div>
        <button onClick={() => navigate(-1)} className="flex items-center text-sm text-surface-500 hover:text-surface-900 dark:hover:text-white transition-colors mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Projects
        </button>
        
        <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 shadow-sm p-6 relative">
          {canEditProject && (
            <button onClick={openEditProject} className="absolute top-6 right-6 p-2 text-surface-400 hover:text-primary-600 bg-surface-50 hover:bg-primary-50 rounded-lg transition-colors">
              <Edit2 className="h-5 w-5" />
            </button>
          )}
          
          <div className="pr-12">
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">{project.name}</h1>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <StatusBadge type="status" value={project.status} />
              <StatusBadge type="priority" value={project.priority} />
            </div>
            
            <p className="text-surface-600 dark:text-surface-300 mb-6 max-w-3xl">
              {project.description}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-surface-100 dark:border-surface-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-lg"><User className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm text-surface-500 dark:text-surface-400">Project Manager</p>
                  <p className="font-medium text-surface-900 dark:text-white">{project.manager_name || 'Unassigned'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg"><Calendar className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm text-surface-500 dark:text-surface-400">Timeline</p>
                  <p className="font-medium text-surface-900 dark:text-white">
                    {new Date(project.start_date).toLocaleDateString()} - {new Date(project.end_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 shadow-sm overflow-hidden">
        <div className="flex border-b border-surface-200 dark:border-surface-800">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'tasks' ? 'border-primary-600 text-primary-600 dark:text-primary-400' : 'border-transparent text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-300'}`}
          >
            Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'team' ? 'border-primary-600 text-primary-600 dark:text-primary-400' : 'border-transparent text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-300'}`}
          >
            Team Members ({members.length})
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'tasks' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-surface-900 dark:text-white">Project Tasks</h3>
                {canEditProject && (
                  <button onClick={openCreateTask} className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded-lg text-sm transition-colors">
                    <Plus className="h-4 w-4" /> Add Task
                  </button>
                )}
              </div>
              
              {tasks.length === 0 ? (
                <EmptyState icon={CheckSquare} title="No tasks yet" description="Create tasks to break down the project work." />
              ) : (
                <div className="overflow-x-auto border border-surface-200 dark:border-surface-800 rounded-lg">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-surface-50 dark:bg-surface-800/50 text-surface-500 dark:text-surface-400 uppercase text-xs">
                      <tr>
                        <th className="px-4 py-3">Task</th>
                        <th className="px-4 py-3">Assignee</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Priority</th>
                        <th className="px-4 py-3">Due Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
                      {tasks.map(task => (
                        <React.Fragment key={task.id}>
                          <tr 
                            className="hover:bg-surface-50 dark:hover:bg-surface-800/50 cursor-pointer"
                            onClick={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
                          >
                            <td className="px-4 py-3 font-medium text-surface-900 dark:text-white">{task.title}</td>
                            <td className="px-4 py-3">{task.assignee_name || 'Unassigned'}</td>
                            <td className="px-4 py-3"><StatusBadge type="status" value={task.status} /></td>
                            <td className="px-4 py-3"><StatusBadge type="priority" value={task.priority} /></td>
                            <td className="px-4 py-3">{new Date(task.due_date).toLocaleDateString()}</td>
                          </tr>
                          {expandedTaskId === task.id && (
                            <tr>
                              <td colSpan="5" className="px-4 py-4 bg-surface-50 dark:bg-surface-800/20">
                                <TaskDiscussion taskId={task.id} />
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'team' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-surface-900 dark:text-white">Team Members</h3>
                {canEditProject && (
                  <button onClick={() => setIsAddMemberOpen(true)} className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded-lg text-sm transition-colors">
                    <Plus className="h-4 w-4" /> Add Member
                  </button>
                )}
              </div>

              {members.length === 0 ? (
                <EmptyState icon={Users} title="No members yet" description="Add members to start collaborating." />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {members.map(member => (
                    <div key={member.id} className="flex items-center justify-between p-4 border border-surface-200 dark:border-surface-700 rounded-lg bg-surface-50 dark:bg-surface-800/50">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                          {member.user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-surface-900 dark:text-white">{member.user.username}</p>
                          <p className="text-xs text-surface-500">{member.role || 'Member'}</p>
                        </div>
                      </div>
                      {canEditProject && (
                        <button onClick={() => handleRemoveMember(member.id)} className="text-surface-400 hover:text-red-500 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isEditProjectOpen} onClose={() => setIsEditProjectOpen(false)} title="Edit Project">
        <form onSubmit={handleEditProject} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Project Name</label>
            <input type="text" value={projectForm.name || ''} onChange={e => setProjectForm({...projectForm, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-surface-50 dark:bg-surface-800 dark:border-surface-700" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={projectForm.description || ''} onChange={e => setProjectForm({...projectForm, description: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-surface-50 dark:bg-surface-800 dark:border-surface-700"></textarea>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select value={projectForm.status || ''} onChange={e => setProjectForm({...projectForm, status: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-surface-50 dark:bg-surface-800 dark:border-surface-700">
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select value={projectForm.priority || ''} onChange={e => setProjectForm({...projectForm, priority: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-surface-50 dark:bg-surface-800 dark:border-surface-700">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          {isAdmin && (
            <div>
              <label className="block text-sm font-medium mb-1">Manager</label>
              <select value={projectForm.manager_id || ''} onChange={e => setProjectForm({...projectForm, manager_id: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-surface-50 dark:bg-surface-800 dark:border-surface-700">
                <option value="">Select Manager</option>
                {managers.map(m => <option key={m.id} value={m.id}>{m.username}</option>)}
              </select>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setIsEditProjectOpen(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg">Save Changes</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isAddMemberOpen} onClose={() => setIsAddMemberOpen(false)} title="Add Team Member" size="sm">
        <form onSubmit={handleAddMember} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Select User</label>
            <select value={memberToAdd} onChange={e => setMemberToAdd(e.target.value)} required className="w-full px-3 py-2 border rounded-lg bg-surface-50 dark:bg-surface-800 dark:border-surface-700">
              <option value="">Choose a member...</option>
              {availableUsers.map(u => <option key={u.id} value={u.id}>{u.username} ({u.email})</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setIsAddMemberOpen(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg">Add Member</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="Create Task">
        <form onSubmit={handleTaskSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Task Title</label>
            <input type="text" required value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-surface-50 dark:bg-surface-800 dark:border-surface-700" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-surface-50 dark:bg-surface-800 dark:border-surface-700"></textarea>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Due Date</label>
              <input type="date" required value={taskForm.due_date} onChange={e => setTaskForm({...taskForm, due_date: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-surface-50 dark:bg-surface-800 dark:border-surface-700" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Assign To</label>
              <select value={taskForm.assigned_to_id} onChange={e => setTaskForm({...taskForm, assigned_to_id: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-surface-50 dark:bg-surface-800 dark:border-surface-700">
                <option value="">Unassigned</option>
                {members.map(m => <option key={m.user.id} value={m.user.id}>{m.user.username}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-surface-50 dark:bg-surface-800 dark:border-surface-700">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select value={taskForm.status} onChange={e => setTaskForm({...taskForm, status: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-surface-50 dark:bg-surface-800 dark:border-surface-700">
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setIsTaskModalOpen(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg">Create Task</button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default ProjectDetail;
