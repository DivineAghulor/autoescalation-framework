import React from 'react';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'critical' | 'high' | 'medium' | 'low' | 'success' | 'warning' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  label, 
  variant = 'default',
  size = 'md',
  className = ''
}) => {
  const baseClass = 'inline-flex items-center font-semibold rounded-full transition-all duration-200';
  
  const variants = {
    default: 'bg-primary-100 text-primary-700 border border-primary-200',
    critical: 'bg-red-100 text-red-700 border border-red-200',
    high: 'bg-orange-100 text-orange-700 border border-orange-200',
    medium: 'bg-amber-100 text-amber-700 border border-amber-200',
    low: 'bg-blue-100 text-blue-700 border border-blue-200',
    success: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    warning: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    info: 'bg-cyan-100 text-cyan-700 border border-cyan-200',
  };

  const sizes = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  return (
    <span className={`${baseClass} ${variants[variant]} ${sizes[size]} ${className}`}>
      {label}
    </span>
  );
};

interface StatusBadgeProps {
  status: 'open' | 'in-progress' | 'resolved' | 'pending' | 'blocked';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const statusConfig = {
    open: { label: 'Open', variant: 'info' as const },
    'in-progress': { label: 'In Progress', variant: 'warning' as const },
    resolved: { label: 'Resolved', variant: 'success' as const },
    pending: { label: 'Pending', variant: 'default' as const },
    blocked: { label: 'Blocked', variant: 'critical' as const },
  };

  const config = statusConfig[status];
  return <Badge label={config.label} variant={config.variant} className={className} />;
};

interface SeverityBadgeProps {
  severity: 'critical' | 'high' | 'medium' | 'low';
  className?: string;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, className = '' }) => {
  const severityLabels = {
    critical: { label: 'Critical', variant: 'critical' as const },
    high: { label: 'High', variant: 'high' as const },
    medium: { label: 'Medium', variant: 'medium' as const },
    low: { label: 'Low', variant: 'low' as const },
  };

  const config = severityLabels[severity];
  return <Badge label={config.label} variant={config.variant} className={className} />;
};
