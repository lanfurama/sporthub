interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export default function StatCard({ title, value, icon, trend }: StatCardProps) {
  return (
    <div className="bg-white border border-border rounded-lg p-3 shadow-card flex flex-col justify-between h-24">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
          {title}
        </span>
        {icon && (
          <div className="text-gray-400">
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-baseline justify-between mt-2">
        <div className="text-[20px] font-semibold text-gray-900 tracking-tight">
          {value}
        </div>
        {trend && (
          <div className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
            trend.isPositive 
              ? 'bg-status-success-bg text-status-success-text' 
              : 'bg-status-danger-bg text-status-danger-text'
          }`}>
            {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
          </div>
        )}
      </div>
    </div>
  );
}
