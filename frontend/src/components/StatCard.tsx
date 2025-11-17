import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  color = 'green',
  subtitle 
}) => {
  const colorClasses = {
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <h3 className="text-3xl font-bold text-gray-800 mt-2">{value}</h3>
          {subtitle && (
            <p className="text-gray-400 text-xs mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-4 rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon size={28} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;