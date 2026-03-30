import React from 'react';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  showSearch?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  title = '',
  showSearch = true 
}) => {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Sidebar />
      <Topbar title={title} showSearch={showSearch} />
      <main className="ml-64 mt-16 p-8">
        {children}
      </main>
    </div>
  );
};
