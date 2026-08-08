import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2, Eye, EyeOff, LayoutDashboard } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const user = await login(email, password);
      toast.success('Logged in successfully!');
      
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'pm') navigate('/manager');
      else navigate('/member');
    } catch (error) {
      const message = error?.response?.data?.detail || 'Login failed. Please check your credentials.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-surface-50 dark:bg-surface-950">
      <div className="flex-1 bg-gradient-to-br from-primary-700 via-primary-600 to-indigo-800 flex flex-col justify-center items-center p-8 text-white relative overflow-hidden">
        {/* Subtle background patterns */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxjaXJjbGUgY3g9IjIiIGN5PSIyIiByPSIyIiBmaWxsPSIjZmZmIi8+Cjwvc3ZnPg==')] bg-repeat" />
        <div className="max-w-md text-center relative z-10">
          <div className="mb-6 flex justify-center">
            <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 shadow-2xl">
              <LayoutDashboard size={48} className="text-white drop-shadow-md" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 drop-shadow-md">TaskFlow Pro</h1>
          <p className="text-primary-100 text-lg md:text-xl font-medium drop-shadow-sm">Your ultimate project management solution. Collaborate, track, and deliver with ease.</p>
        </div>
      </div>
      
      <div className="flex-1 flex justify-center items-center p-8">
        <div className="w-full max-w-md bg-white dark:bg-surface-900 p-8 rounded-2xl shadow-xl">
          <h2 className="text-3xl font-bold text-surface-900 dark:text-white mb-6 text-center">Welcome Back</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors dark:text-white"
                placeholder="you@example.com"
                required
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Password</label>
                <button 
                  type="button" 
                  onClick={() => toast('Contact your admin to reset your password', { icon: '🔑' })}
                  className="text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors dark:text-white"
                  placeholder="••••••••"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-3 top-2.5 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
