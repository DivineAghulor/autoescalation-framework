import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Icons } from './Icons';

export const Sidebar: React.FC = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Icons.Dashboard },
    { name: 'Issues', href: '/issues', icon: Icons.AlertTriangle },
    { name: 'Report Issue', href: '/report', icon: Icons.FileText },
  ];

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-neutral-200 flex flex-col shadow-sm-light">
      {/* Logo */}
      <div className="px-8 py-6 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center text-white font-bold">
            Q
          </div>
          <div>
            <h1 className="text-lg font-bold text-neutral-900">Quidax</h1>
            <p className="text-xs text-neutral-500">Support Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg
                transition-all duration-200 font-medium
                ${
                  isActive
                    ? 'bg-gradient-primary text-white shadow-md-light'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                }
              `}
            >
              <Icon />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-6 border-t border-neutral-200">
        <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
          <p className="text-xs text-neutral-600 font-semibold mb-3">System Status</p>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-neutral-600">All Systems Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
