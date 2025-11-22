interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  target?: string;
  status: 'good' | 'excellent' | 'warning' | 'danger';
}

export default function StatCard({ title, value, subtitle, target, status }: StatCardProps) {
  const statusColors = {
    good: 'border-green-500 bg-green-50',
    excellent: 'border-blue-500 bg-blue-50',
    warning: 'border-yellow-500 bg-yellow-50',
    danger: 'border-red-500 bg-red-50'
  };

  const statusTextColors = {
    good: 'text-green-700',
    excellent: 'text-blue-700',
    warning: 'text-yellow-700',
    danger: 'text-red-700'
  };

  return (
    <div className={`bg-white rounded-lg shadow border-l-4 p-4 ${statusColors[status]}`}>
      <div className="text-sm text-gray-600 mb-1">{title}</div>
      <div className={`text-2xl font-bold ${statusTextColors[status]}`}>{value}</div>
      {target && <div className="text-xs text-gray-500 mt-1">{target}</div>}
      {subtitle && <div className={`text-xs mt-1 ${statusTextColors[status]}`}>{subtitle}</div>}
    </div>
  );
}
