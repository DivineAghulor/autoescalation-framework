import React, { useState } from 'react';
import { Icons } from './Icons';

interface TopbarProps {
  title?: string;
  showSearch?: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({ 
  title = '', 
  showSearch = true 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <div className="fixed top-0 left-64 right-0 h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-8 shadow-sm-light z-40">
      {/* Left section */}
      <div>
        {title && (
          <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-6">
        {showSearch && (
          <div className="relative w-64">
            <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search issues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-neutral-200 rounded-lg pl-10 pr-4 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all duration-200"
            />
          </div>
        )}

        {/* Notifications */}
        <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors duration-200">
          <Icons.AlertCircle className="w-5 h-5 text-neutral-600" />
        </button>

        {/* Settings */}
        <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors duration-200">
          <Icons.Settings className="w-5 h-5 text-neutral-600" />
        </button>

        {/* Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors duration-200"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-bold">
              TL
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-neutral-900">Team Lead</p>
              <p className="text-xs text-neutral-500">Operations</p>
            </div>
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-md-light py-2 z-50">
              <button className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors">
                Profile Settings
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors">
                Help & Support
              </button>
              <div className="border-t border-neutral-200 my-1"></div>
              <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2">
                <Icons.LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
