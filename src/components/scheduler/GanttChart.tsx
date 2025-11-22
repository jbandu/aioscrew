interface GanttChartProps {
  crewMembers: Array<{
    id: string;
    name: string;
    assignments: Array<{
      startDay: number;
      duration: number;
      type: 'international' | 'domestic' | 'reserve' | 'off' | 'training';
      tripNumber?: string;
    }>;
  }>;
  daysInMonth: number;
}

export default function GanttChart({ crewMembers, daysInMonth }: GanttChartProps) {
  const typeColors = {
    international: 'bg-blue-900 text-white',
    domestic: 'bg-green-600 text-white',
    reserve: 'bg-yellow-500 text-white',
    off: 'bg-gray-300 text-gray-600',
    training: 'bg-purple-600 text-white'
  };

  const typeLabels = {
    international: 'INT',
    domestic: 'DOM',
    reserve: 'RSV',
    off: 'OFF',
    training: 'TRN'
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-bold text-lg mb-4">Crew Schedule Grid</h3>
      <div className="overflow-x-auto">
        <div className="min-w-[1200px]">
          {/* Header: Days */}
          <div className="flex border-b-2 border-gray-300 pb-2 mb-2">
            <div className="w-48 flex-shrink-0 font-semibold text-sm">Crew Member</div>
            <div className="flex-1 flex">
              {[...Array(daysInMonth)].map((_, i) => (
                <div
                  key={i}
                  className="flex-1 text-center text-xs font-semibold text-gray-600"
                  style={{ minWidth: '24px' }}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Rows: Each crew member */}
          {crewMembers.map((crew) => (
            <div key={crew.id} className="flex items-center border-t border-gray-200 py-2 hover:bg-gray-50">
              <div className="w-48 flex-shrink-0 text-sm font-medium">{crew.name}</div>
              <div className="flex-1 relative h-8">
                {crew.assignments.map((assignment, idx) => {
                  const leftPosition = ((assignment.startDay - 1) / daysInMonth) * 100;
                  const width = (assignment.duration / daysInMonth) * 100;

                  return (
                    <div
                      key={idx}
                      className={`absolute h-6 rounded text-[10px] flex items-center justify-center font-semibold ${typeColors[assignment.type]}`}
                      style={{
                        left: `${leftPosition}%`,
                        width: `${width}%`,
                        top: '2px'
                      }}
                      title={`${assignment.tripNumber || typeLabels[assignment.type]} - Days ${assignment.startDay}-${assignment.startDay + assignment.duration - 1}`}
                    >
                      {assignment.tripNumber || typeLabels[assignment.type]}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-blue-900 rounded"></div>
          <span>International</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-green-600 rounded"></div>
          <span>Domestic</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span>Reserve</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-gray-300 rounded"></div>
          <span>Days Off</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-purple-600 rounded"></div>
          <span>Training</span>
        </div>
      </div>
    </div>
  );
}
