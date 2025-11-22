import { User } from 'lucide-react';

interface CrewAssignmentCardProps {
  name: string;
  role: string;
  qualification: string;
  availableHours: number;
  onAssignTrip?: () => void;
}

export default function CrewAssignmentCard({
  name,
  role,
  qualification,
  availableHours,
  onAssignTrip
}: CrewAssignmentCardProps) {
  return (
    <div className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-2 mb-2">
        <User className="w-5 h-5 text-gray-600" />
        <div className="flex-1">
          <div className="font-semibold text-sm">{name}</div>
          <div className="text-xs text-gray-600">{role} • {qualification}</div>
          <div className="text-xs text-blue-600">Avail: {availableHours} hrs</div>
        </div>
      </div>
      {onAssignTrip && (
        <button
          onClick={onAssignTrip}
          className="w-full mt-2 text-sm text-blue-600 border border-blue-600 rounded py-1 hover:bg-blue-50"
        >
          Assign Trip +
        </button>
      )}
    </div>
  );
}
