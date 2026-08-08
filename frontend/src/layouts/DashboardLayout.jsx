import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  LayoutDashboard, Users, Briefcase, CheckSquare, 
  Bell, Settings, LogOut, Menu, X, Sun, Moon, Search
} from 'lucide-react';
import NotificationDropdown from '../components/NotificationDropdown';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const adminLinks = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/projects', icon: Briefcase, label: 'Projects' },
    { to: '/notifications', icon: Bell, label: 'Notifications' },
    { to: '/profile', icon: Settings, label: 'Settings' },
  ];

  const pmLinks = [
    { to: '/manager', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/manager/projects', icon: Briefcase, label: 'Projects' },
    { to: '/manager/tasks', icon: CheckSquare, label: 'Tasks' },
    { to: '/notifications', icon: Bell, label: 'Notifications' },
    { to: '/profile', icon: Settings, label: 'Settings' },
  ];

  const memberLinks = [
    { to: '/member', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/member/tasks', icon: CheckSquare, label: 'My Tasks' },
    { to: '/notifications', icon: Bell, label: 'Notifications' },
    { to: '/profile', icon: Settings, label: 'Settings' },
  ];

  const links = user?.role === 'admin' ? adminLinks : 
                user?.role === 'pm' ? pmLinks : memberLinks;

  const NavItem = ({ to, icon: Icon, label }) => (
    <NavLink 
      to={to} 
      end={to === '/admin' || to === '/manager' || to === '/member'}
      onClick={() => setSidebarOpen(false)}
      className={({ isActive }) => `
        flex items-center gap-3 px-4 py-2.5 rounded-lg mb-1 transition-colors
        ${isActive 
          ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400' 
          : 'text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800'
        }
      `}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </NavLink>
  );

  return (
    <div className="flex h-screen bg-surface-50 dark:bg-surface-950 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800 flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-surface-200 dark:border-surface-800">
          <span className="text-xl font-bold text-primary-600 dark:text-primary-500">TaskFlow Pro</span>
          <button className="lg:hidden text-surface-500" onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-3">
          {links.map((link, idx) => <NavItem key={idx} {...link} />)}
        </div>

        <div className="p-4 border-t border-surface-200 dark:border-surface-800">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-surface-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-surface-500 dark:text-surface-400 capitalize truncate">{user?.role === 'pm' ? 'Project Manager' : user?.role}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-surface-500" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            
            <div className="hidden md:flex items-center gap-2 text-surface-400">
              <Search size={20} />
              <input 
                type="text" 
                placeholder="Search projects & tasks..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                className="bg-transparent border-none outline-none text-sm text-surface-900 dark:text-white placeholder-surface-400 w-64"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="p-2 text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-full transition-colors"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <NotificationDropdown />
          </div>
        </header>

        {/* Main Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
