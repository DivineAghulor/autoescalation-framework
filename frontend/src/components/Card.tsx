import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  onClick,
  hover = true 
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-xl border border-neutral-200 p-6
        shadow-sm-light transition-all duration-200
        ${hover ? 'hover:shadow-md-light hover:border-neutral-300 cursor-pointer' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: { value: number; positive: boolean };
  className?: string;
  bgColor?: 'purple' | 'blue' | 'green' | 'red';
}

export const StatCard: React.FC<StatCardProps> = ({ 
  label, 
  value, 
  icon, 
  trend,
  className = '',
  bgColor = 'purple'
}) => {
  const bgColors = {
    purple: 'bg-gradient-light',
    blue: 'bg-blue-50',
    green: 'bg-emerald-50',
    red: 'bg-red-50',
  };

  const iconColors = {
    purple: 'text-primary-600',
    blue: 'text-blue-600',
    green: 'text-emerald-600',
    red: 'text-red-600',
  };

  return (
    <Card className={`${bgColors[bgColor]} border-none ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-600">{label}</p>
          <p className="text-3xl font-bold text-neutral-900 mt-2">{value}</p>
          {trend && (
            <p className={`text-xs font-semibold mt-3 ${trend.positive ? 'text-emerald-600' : 'text-red-600'}`}>
              {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}% from last week
            </p>
          )}
        </div>
        {icon && (
          <div className={`${iconColors[bgColor]} text-2xl`}>{icon}</div>
        )}
      </div>
    </Card>
  );
};
