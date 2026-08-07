import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Save, User, Mail, Phone, FileText } from 'lucide-react';

const ProfilePage = () => {
  const { user, login } = useAuth(); // Assuming login context can update user if we re-fetch or just update local
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authAPI.updateProfile({
        name: formData.name,
        phone: formData.phone,
        bio: formData.bio
      });
      // Update local storage and context if necessary, assuming response.data has updated user
      // For now just show toast
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="p-8 text-center">Loading profile...</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-6">Profile Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 p-6 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-4xl text-primary-600 dark:text-primary-400 font-bold mb-4">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-1">{user.name}</h2>
            <p className="text-surface-500 dark:text-surface-400 mb-3">{user.email}</p>
            <span className="px-3 py-1 bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 rounded-full text-sm capitalize mb-4">
              {user.role?.replace('_', ' ')}
            </span>
            <p className="text-xs text-surface-400 mt-auto pt-4 border-t border-surface-200 dark:border-surface-800 w-full">
              Member since {new Date(user.created_at || Date.now()).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Edit Form */}
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 p-6">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4 border-b border-surface-200 dark:border-surface-800 pb-2">
              Edit Details
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={18} className="text-surface-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={18} className="text-surface-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    className="w-full pl-10 pr-4 py-2 bg-surface-100 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg text-surface-500 cursor-not-allowed"
                    disabled
                  />
                </div>
                <p className="text-xs text-surface-400 mt-1">Email cannot be changed.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone size={18} className="text-surface-400" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                  Bio
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <FileText size={18} className="text-surface-400" />
                  </div>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="4"
                    className="w-full pl-10 pr-4 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none dark:text-white resize-none"
                    placeholder="Tell us a little about yourself..."
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-surface-200 dark:border-surface-800 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
