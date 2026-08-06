import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/auth/login/', { email, password }),
  getProfile: () => api.get('/auth/me/'),
  updateProfile: (data) => api.put('/auth/me/', data),
};

export const usersAPI = {
  getAll: () => api.get('/users/'),
  getById: (id) => api.get(`/users/${id}/`),
  create: (data) => api.post('/auth/register/', data),
  update: (id, data) => api.put(`/users/${id}/`, data),
  delete: (id) => api.delete(`/users/${id}/`),
};

export const projectsAPI = {
  getAll: () => api.get('/projects/'),
  getById: (id) => api.get(`/projects/${id}/`),
  create: (data) => api.post('/projects/', data),
  update: (id, data) => api.put(`/projects/${id}/`, data),
  delete: (id) => api.delete(`/projects/${id}/`),
  getMembers: (projectId) => api.get(`/projects/${projectId}/members/`),
  addMember: (projectId, userId) => api.post(`/projects/${projectId}/members/`, { user_id: userId }),
  removeMember: (projectId, memberId) => api.delete(`/projects/${projectId}/members/${memberId}/`),
  getTasks: (projectId) => api.get(`/projects/${projectId}/tasks/`),
  createTask: (projectId, data) => api.post(`/projects/${projectId}/tasks/`, data),
  updateTask: (projectId, taskId, data) => api.put(`/projects/${projectId}/tasks/${taskId}/`, data),
  deleteTask: (projectId, taskId) => api.delete(`/projects/${projectId}/tasks/${taskId}/`),
};

export const tasksAPI = {
  getById: (id) => api.get(`/tasks/${id}/`),
  updateStatus: (id, status) => api.patch(`/tasks/${id}/status/`, { status }),
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats/'),
};

export default api;
