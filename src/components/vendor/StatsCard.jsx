import React from 'react';
import { 
  TrendingUp, 
  TrendingDown,
  MoreVertical,
  HelpCircle
} from 'lucide-react';

const StatsCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color = 'blue',
  trend = 'up',
  isLoading = false,
  onClick,
  tooltip
}) => {
  const colorConfig = {
    blue: {
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      text: 'text-blue-600',
      border: 'border-blue-200'
    },
    green: {
      bg: 'bg-green-50',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      text: 'text-green-600',
      border: 'border-green-200'
    },
    purple: {
      bg: 'bg-purple-50',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      text: 'text-purple-600',
      border: 'border-purple-200'
    },
    orange: {
      bg: 'bg-orange-50',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      text: 'text-orange-600',
      border: 'border-orange-200'
    },
    red: {
      bg: 'bg-red-50',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      text: 'text-red-600',
      border: 'border-red-200'
    },
    gray: {
      bg: 'bg-gray-50',
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-600',
      text: 'text-gray-600',
      border: 'border-gray-200'
    }
  };

  const config = colorConfig[color] || colorConfig.blue;

  if (isLoading) {
    return (
      <div className={`${config.bg} border ${config.border} rounded-xl p-5 animate-pulse`}>
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
          <div className="w-8 h-8 bg-gray-200 rounded"></div>
        </div>
        <div className="mt-4">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`${config.bg} border ${config.border} rounded-xl p-5 hover:shadow-md transition-all duration-300 cursor-pointer group`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        {/* Icon */}
        <div className={`${config.iconBg} p-3 rounded-lg`}>
          <Icon className={`w-6 h-6 ${config.iconColor}`} />
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {tooltip && (
            <button className="p-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <HelpCircle className="w-4 h-4 text-gray-400" />
            </button>
          )}
          <button className="p-1 hover:bg-white/50 rounded">
            <MoreVertical className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Value */}
      <div className="mb-2">
        <div className="text-3xl font-bold text-gray-800">{value}</div>
        <div className="text-sm font-medium text-gray-600">{title}</div>
      </div>

      {/* Change Indicator */}
      {change && (
        <div className="flex items-center space-x-1">
          {trend === 'up' ? (
            <TrendingUp className="w-4 h-4 text-green-500" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500" />
          )}
          <span className={`text-sm font-medium ${
            trend === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            {change}
          </span>
          <span className="text-sm text-gray-500">from previous period</span>
        </div>
      )}

      {/* Trend Line (Optional) */}
      <div className="mt-4">
        <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${
              trend === 'up' ? 'bg-green-500' : 'bg-red-500'
            } rounded-full`}
            style={{ width: '75%' }}
          ></div>
        </div>
      </div>

      {/* Additional Info (Optional) */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Daily Avg</span>
          <span className="font-medium">+12%</span>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;