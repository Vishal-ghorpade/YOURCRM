import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Briefcase, Activity, LogOut } from 'lucide-react';

const Sidebar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Contacts', path: '/contacts', icon: Users },
    { name: 'Deals', path: '/deals', icon: Briefcase },
    { name: 'Activities', path: '/activities', icon: Activity },
  ];

  return (
    <aside className="w-[240px] bg-surface border-r border-borderTheme flex flex-col justify-between h-screen fixed left-0 top-0 z-20">
      <div>
        {/* Logo and Brand */}
        <div className="h-[60px] border-b border-borderTheme flex items-center px-6 gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent text-accentFg flex items-center justify-center font-bold text-lg">
            Y
          </div>
          <span className="font-bold text-lg tracking-tight">YOURCRM</span>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `h-[36px] rounded-[8px] flex items-center px-3 gap-3 text-secondary hover:bg-muted hover:text-primary transition-all duration-150 ${
                    isActive
                      ? 'border-l-2 border-accent bg-muted text-primary font-medium pl-[10px]'
                      : 'border-l-2 border-transparent'
                  }`
                }
              >
                <Icon size={16} />
                <span className="text-[13px]">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Session Info / Logout */}
      <div className="p-4 border-t border-borderTheme flex flex-col gap-3">
        {user && (
          <div className="px-3 py-2 bg-muted rounded-md flex flex-col gap-0.5">
            <span className="text-[12px] font-semibold text-primary truncate">{user.name}</span>
            <span className="text-[10px] text-secondary truncate">{user.email}</span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="h-[36px] rounded-[8px] flex items-center px-3 gap-3 text-secondary hover:bg-muted hover:text-red-500 w-full transition-all duration-150 border-l-2 border-transparent"
        >
          <LogOut size={16} />
          <span className="text-[13px] font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
