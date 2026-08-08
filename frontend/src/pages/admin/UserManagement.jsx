import React, { useState, useEffect } from 'react';
import { usersAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, Search, Edit2, Trash2, Users } from 'lucide-react';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    role: 'member'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await usersAPI.getAll();
      setUsers(res.data);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!isEditMode) {
      if (formData.password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }
      if (formData.password !== formData.confirm_password) {
        toast.error('Passwords do not match');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await usersAPI.update(selectedUser.id, {
          username: formData.username,
          email: formData.email,
          role: formData.role
        });
        toast.success('User updated successfully');
      } else {
        const payload = { ...formData };
        delete payload.confirm_password;
        await usersAPI.create(payload);
        toast.success('User created successfully');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreateModal = () => {
    setIsEditMode(false);
    setSelectedUser(null);
    setFormData({ username: '', email: '', password: '', confirm_password: '', role: 'member' });
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setIsEditMode(true);
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      role: user.role
    });
    setIsModalOpen(true);
  };

  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await usersAPI.delete(userToDelete.id);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">User Management</h1>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add User
        </button>
      </div>

      <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-surface-200 dark:border-surface-800">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-surface-400" />
            </div>
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-surface-200 dark:border-surface-700 rounded-lg bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 flex justify-center"><LoadingSpinner /></div>
        ) : filteredUsers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No users found"
            description="We couldn't find any users matching your search."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-surface-600 dark:text-surface-300">
              <thead className="bg-surface-50 dark:bg-surface-800/50 text-xs uppercase font-semibold text-surface-500 dark:text-surface-400 border-b border-surface-200 dark:border-surface-800">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-surface-900 dark:text-white">{user.username}</td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">
                      <StatusBadge type="role" value={user.role} />
                    </td>
                    <td className="px-6 py-4">{new Date(user.date_joined).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-1 text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(user)}
                          className="p-1 text-surface-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditMode ? 'Edit User' : 'Create User'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Name</label>
            <input
              type="text"
              name="username"
              required
              value={formData.username}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-surface-200 dark:border-surface-700 rounded-lg bg-surface-50 dark:bg-surface-800 focus:ring-2 focus:ring-primary-500 outline-none text-surface-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-surface-200 dark:border-surface-700 rounded-lg bg-surface-50 dark:bg-surface-800 focus:ring-2 focus:ring-primary-500 outline-none text-surface-900 dark:text-white"
            />
          </div>
          {!isEditMode && (
            <>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-surface-200 dark:border-surface-700 rounded-lg bg-surface-50 dark:bg-surface-800 focus:ring-2 focus:ring-primary-500 outline-none text-surface-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Confirm Password</label>
                <input
                  type="password"
                  name="confirm_password"
                  required
                  value={formData.confirm_password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-surface-200 dark:border-surface-700 rounded-lg bg-surface-50 dark:bg-surface-800 focus:ring-2 focus:ring-primary-500 outline-none text-surface-900 dark:text-white"
                />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-surface-200 dark:border-surface-700 rounded-lg bg-surface-50 dark:bg-surface-800 focus:ring-2 focus:ring-primary-500 outline-none text-surface-900 dark:text-white"
            >
              <option value="member">Member</option>
              <option value="pm">Project Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-surface-200 dark:border-surface-700 rounded-lg text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create User')}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to delete ${userToDelete?.username}? This action cannot be undone.`}
        confirmText="Delete"
        confirmColor="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
};

export default UserManagement;
