import { Plane } from 'lucide-react';

interface TripCardProps {
  tripNumber: string;
  route: string;
  date: string;
  requiredRole: string;
  aircraft: string;
  creditHours: number;
  priority: 'high' | 'medium' | 'low';
  onAssign?: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
}

export default function TripCard({
  tripNumber,
  route,
  date,
  requiredRole,
  aircraft,
  creditHours,
  priority,
  onAssign,
  draggable = false,
  onDragStart
}: TripCardProps) {
  const priorityColors = {
    high: 'bg-red-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500'
  };

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      className="border rounded-lg p-3 cursor-move hover:shadow-lg transition-shadow bg-white"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-3 h-3 rounded-full ${priorityColors[priority]}`} />
        <span className="font-semibold text-sm">{tripNumber}</span>
      </div>
      <div className="text-xs text-gray-600 mb-1">
        <Plane className="w-3 h-3 inline mr-1" />
        {route}
      </div>
      <div className="text-xs text-gray-600 mb-1">
        {date} | {requiredRole}
      </div>
      <div className="text-xs text-blue-600 mb-2">
        {aircraft} | {creditHours} hrs
      </div>
      {onAssign && (
        <button
          onClick={onAssign}
          className="w-full text-xs bg-blue-600 text-white rounded py-1 hover:bg-blue-700"
        >
          Assign to crew
        </button>
      )}
    </div>
  );
}
