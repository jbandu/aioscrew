import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend
} from 'recharts';
import {
  utilizationData,
  costComparisonData,
  fatigueHeatmapData,
  rootCauseAnalysisData,
  passengerImpactData,
  performanceTrendsData,
  reserveAvailabilityData,
  cc4SuggestedQuestions,
  type CrewMemberDetail,
  type ResolutionOption,
  type FatigueCrewMember
} from '../data/crewController4MockData';

type VisualizationType =
  | 'CrewUtilization'
  | 'CostComparison'
  | 'FatigueHeatmap'
  | 'RootCauseAnalysis'
  | 'PassengerImpact'
  | 'PerformanceTrends'
  | 'ReserveAvailability'
  | null;

interface ChatMessage {
  role: 'ai' | 'user';
  content: string;
}

// ============ SCENARIO 1: CREW UTILIZATION DASHBOARD ============
const CrewUtilizationViz: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedBase, setSelectedBase] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof CrewMemberDetail>('name');
  const [sortAsc, setSortAsc] = useState(true);

  const filteredCrew = utilizationData.crewDetails.filter(c => {
    const statusMatch = !selectedStatus ||
      (selectedStatus === 'On Duty' && c.status === 'active') ||
      (selectedStatus === 'Reserve' && c.status === 'reserve') ||
      (selectedStatus === 'Rest' && c.status === 'rest') ||
      (selectedStatus === 'Off' && c.status === 'off') ||
      (c.status === 'critical' && selectedStatus === 'On Duty');
    const baseMatch = !selectedBase || c.base === selectedBase;
    return statusMatch && baseMatch;
  });

  const sortedCrew = [...filteredCrew].sort((a, b) => {
    const aVal = a[sortField] || '';
    const bVal = b[sortField] || '';
    return sortAsc ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
  });

  const handleSort = (field: keyof CrewMemberDetail) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
          Crew Utilization Dashboard
        </h2>
        <select
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
            background: 'white',
            fontSize: '13px',
            color: '#1e293b'
          }}
        >
          <option>Today</option>
          <option>Yesterday</option>
          <option>Last 7 Days</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Donut Chart */}
        <div style={{
          padding: '20px',
          borderRadius: '12px',
          background: 'white',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', marginBottom: '16px' }}>
            Crew Status
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={utilizationData.statusBreakdown}
                innerRadius={60}
                outerRadius={80}
                dataKey="value"
                onClick={(entry) => setSelectedStatus(selectedStatus === entry.name ? null : entry.name)}
                style={{ cursor: 'pointer' }}
              >
                {utilizationData.statusBreakdown.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.color}
                    stroke={selectedStatus === entry.name ? '#1e293b' : 'transparent'}
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ payload }) => payload?.[0] && (
                  <div style={{
                    background: '#1e293b',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: 'white'
                  }}>
                    <div style={{ fontWeight: '600' }}>{payload[0].name}</div>
                    <div>{payload[0].value} crew members</div>
                  </div>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
            {utilizationData.statusBreakdown.map((s, i) => (
              <button
                key={i}
                onClick={() => setSelectedStatus(selectedStatus === s.name ? null : s.name)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: 'none',
                  background: selectedStatus === s.name ? '#e2e8f0' : '#f8fafc',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                <span style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: s.color
                }} />
                <span style={{ color: '#64748b' }}>{s.name}</span>
                <span style={{ fontWeight: '600', color: '#1e293b' }}>{s.value}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Bar Chart - By Base */}
        <div style={{
          padding: '20px',
          borderRadius: '12px',
          background: 'white',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', marginBottom: '16px' }}>
            Utilization by Base
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={utilizationData.byBase} layout="vertical">
              <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis type="category" dataKey="base" tick={{ fill: '#94a3b8', fontSize: 11 }} width={40} />
              <Tooltip
                content={({ payload }) => payload?.[0] && (
                  <div style={{
                    background: '#1e293b',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: 'white'
                  }}>
                    <div style={{ fontWeight: '600' }}>{payload[0].payload.base}</div>
                    <div style={{ color: '#94a3b8' }}>{payload[0].payload.crew} crew</div>
                    <div style={{ color: '#10b981' }}>{payload[0].value}% utilized</div>
                  </div>
                )}
              />
              <Bar
                dataKey="utilization"
                fill="#3b82f6"
                onClick={(entry) => setSelectedBase(selectedBase === entry.base ? null : entry.base)}
                style={{ cursor: 'pointer' }}
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '12px' }}>
            Click bar to filter crew list
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div style={{
        padding: '20px',
        borderRadius: '12px',
        background: 'white',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', margin: 0 }}>
            Crew Details
            {selectedStatus && <span style={{ color: '#3b82f6', marginLeft: '8px' }}>({selectedStatus})</span>}
            {selectedBase && <span style={{ color: '#3b82f6', marginLeft: '8px' }}>@ {selectedBase}</span>}
          </h3>
          {(selectedStatus || selectedBase) && (
            <button
              onClick={() => { setSelectedStatus(null); setSelectedBase(null); }}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                background: 'white',
                cursor: 'pointer',
                fontSize: '12px',
                color: '#64748b'
              }}
            >
              Clear filters
            </button>
          )}
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th
                onClick={() => handleSort('name')}
                style={{
                  textAlign: 'left',
                  padding: '12px',
                  fontSize: '12px',
                  color: '#64748b',
                  fontWeight: '600',
                  borderBottom: '1px solid #e2e8f0',
                  cursor: 'pointer'
                }}
              >
                Name {sortField === 'name' && (sortAsc ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('status')}
                style={{
                  textAlign: 'left',
                  padding: '12px',
                  fontSize: '12px',
                  color: '#64748b',
                  fontWeight: '600',
                  borderBottom: '1px solid #e2e8f0',
                  cursor: 'pointer'
                }}
              >
                Status {sortField === 'status' && (sortAsc ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('dutyRemaining')}
                style={{
                  textAlign: 'left',
                  padding: '12px',
                  fontSize: '12px',
                  color: '#64748b',
                  fontWeight: '600',
                  borderBottom: '1px solid #e2e8f0',
                  cursor: 'pointer'
                }}
              >
                Duty Remaining {sortField === 'dutyRemaining' && (sortAsc ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('base')}
                style={{
                  textAlign: 'left',
                  padding: '12px',
                  fontSize: '12px',
                  color: '#64748b',
                  fontWeight: '600',
                  borderBottom: '1px solid #e2e8f0',
                  cursor: 'pointer'
                }}
              >
                Base {sortField === 'base' && (sortAsc ? '↑' : '↓')}
              </th>
              <th style={{
                textAlign: 'left',
                padding: '12px',
                fontSize: '12px',
                color: '#64748b',
                fontWeight: '600',
                borderBottom: '1px solid #e2e8f0'
              }}>
                Current Flight
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedCrew.slice(0, 8).map((crew) => (
              <tr key={crew.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px', fontSize: '13px', color: '#1e293b', fontWeight: '500' }}>
                  {crew.name}
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '600',
                    background: crew.status === 'critical' ? '#fef2f2' :
                      crew.status === 'reserve' ? '#dbeafe' :
                      crew.status === 'active' ? '#dcfce7' :
                      crew.status === 'rest' ? '#f3f4f6' : '#f3f4f6',
                    color: crew.status === 'critical' ? '#ef4444' :
                      crew.status === 'reserve' ? '#3b82f6' :
                      crew.status === 'active' ? '#10b981' : '#6b7280'
                  }}>
                    {crew.status === 'critical' ? '⚠️ Critical' : crew.status}
                  </span>
                </td>
                <td style={{ padding: '12px', fontSize: '13px', color: '#64748b' }}>
                  {crew.dutyRemaining}
                </td>
                <td style={{ padding: '12px', fontSize: '13px', color: '#64748b' }}>
                  {crew.base}
                </td>
                <td style={{ padding: '12px', fontSize: '13px', color: '#94a3b8' }}>
                  {crew.currentFlight || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sortedCrew.length > 8 && (
          <div style={{
            padding: '12px',
            textAlign: 'center',
            fontSize: '12px',
            color: '#3b82f6',
            cursor: 'pointer'
          }}>
            Show {sortedCrew.length - 8} more...
          </div>
        )}
      </div>
    </div>
  );
};

// ============ SCENARIO 2: COST COMPARISON ============
const CostComparisonViz: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<ResolutionOption>(costComparisonData[0]);
  const [showDoNothing, setShowDoNothing] = useState(true);

  const options = showDoNothing ? costComparisonData : costComparisonData.filter(o => o.risk !== 'critical');
  const maxCost = Math.max(...options.map(o => o.cost));

  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '24px' }}>
        Resolution Cost Comparison
      </h2>

      {/* Bar Chart */}
      <div style={{
        padding: '20px',
        borderRadius: '12px',
        background: 'white',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '24px'
      }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', marginBottom: '16px' }}>
          Total Cost by Option
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {options.map((option) => (
            <div
              key={option.id}
              onClick={() => setSelectedOption(option)}
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                background: selectedOption.id === option.id ? '#f1f5f9' : 'white',
                border: selectedOption.id === option.id ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: '#1e293b', fontWeight: '500' }}>{option.label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontFamily: 'monospace',
                    fontWeight: '700',
                    fontSize: '14px',
                    color: option.cost === 0 ? '#10b981' : option.cost > 10000 ? '#ef4444' : '#1e293b'
                  }}>
                    ${option.cost.toLocaleString()}
                  </span>
                  {option.recommended && (
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '10px',
                      background: '#dcfce7',
                      color: '#10b981',
                      fontSize: '10px',
                      fontWeight: '600'
                    }}>
                      Best
                    </span>
                  )}
                  {option.risk === 'critical' && (
                    <span style={{ color: '#ef4444' }}>⚠️</span>
                  )}
                </div>
              </div>
              <div style={{
                height: '8px',
                background: '#f1f5f9',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: maxCost > 0 ? `${(option.cost / maxCost) * 100}%` : '0%',
                  background: option.cost === 0 ? '#10b981' : option.cost > 10000 ? '#ef4444' : '#3b82f6',
                  borderRadius: '4px',
                  transition: 'width 0.5s'
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cost Breakdown Table */}
      <div style={{
        padding: '20px',
        borderRadius: '12px',
        background: 'white',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', margin: 0 }}>
            {selectedOption.label}
          </h3>
          <span style={{
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: '600',
            background: selectedOption.recommended ? '#dcfce7' :
              selectedOption.risk === 'critical' ? '#fef2f2' : '#f1f5f9',
            color: selectedOption.recommended ? '#10b981' :
              selectedOption.risk === 'critical' ? '#ef4444' : '#64748b'
          }}>
            {selectedOption.recommended ? 'Recommended' :
              selectedOption.risk === 'critical' ? 'Not Recommended' : 'Alternative'}
          </span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '8px', fontSize: '12px', color: '#64748b', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>
                Component
              </th>
              <th style={{ textAlign: 'right', padding: '8px', fontSize: '12px', color: '#64748b', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>
                Cost
              </th>
              <th style={{ textAlign: 'left', padding: '8px', fontSize: '12px', color: '#64748b', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>
                Notes
              </th>
            </tr>
          </thead>
          <tbody>
            {selectedOption.breakdown.map((item, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '10px 8px', fontSize: '13px', color: '#64748b' }}>{item.component}</td>
                <td style={{ padding: '10px 8px', fontSize: '13px', color: '#1e293b', fontFamily: 'monospace', textAlign: 'right', fontWeight: '500' }}>
                  ${item.cost.toLocaleString()}
                </td>
                <td style={{ padding: '10px 8px', fontSize: '12px', color: '#94a3b8' }}>{item.notes}</td>
              </tr>
            ))}
            <tr style={{ background: '#f8fafc' }}>
              <td style={{ padding: '12px 8px', fontSize: '14px', color: '#1e293b', fontWeight: '600' }}>TOTAL</td>
              <td style={{ padding: '12px 8px', fontSize: '14px', color: '#1e293b', fontFamily: 'monospace', textAlign: 'right', fontWeight: '700' }}>
                ${selectedOption.cost.toLocaleString()}
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>

        <div style={{ display: 'flex', gap: '24px', fontSize: '13px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: '#64748b' }}>Resolution:</span>
            <span style={{ color: '#1e293b', fontWeight: '500' }}>{selectedOption.time} min</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: '#64748b' }}>Risk:</span>
            <span style={{
              fontWeight: '500',
              color: selectedOption.risk === 'low' ? '#10b981' :
                selectedOption.risk === 'medium' ? '#f97316' : '#ef4444'
            }}>
              {selectedOption.risk}
            </span>
          </div>
        </div>

        <button style={{
          width: '100%',
          padding: '12px',
          borderRadius: '8px',
          border: 'none',
          background: '#3b82f6',
          color: 'white',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer'
        }}>
          Select This Option
        </button>
      </div>

      {/* Toggle */}
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={showDoNothing}
          onChange={(e) => setShowDoNothing(e.target.checked)}
          style={{ width: '16px', height: '16px' }}
        />
        <span style={{ fontSize: '13px', color: '#64748b' }}>Show "Do Nothing" scenario</span>
      </label>
    </div>
  );
};

// ============ SCENARIO 3: FATIGUE HEATMAP ============
const FatigueHeatmapViz: React.FC = () => {
  const [filterBase, setFilterBase] = useState('all');
  const [hoveredCell, setHoveredCell] = useState<{ crew: string; hour: number } | null>(null);

  const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00'];

  const getColor = (hoursRemaining: number) => {
    if (hoursRemaining <= 0) return { bg: '#1f2937', emoji: '⬛', label: 'Illegal' };
    if (hoursRemaining < 1) return { bg: '#ef4444', emoji: '🔴', label: '<1h' };
    if (hoursRemaining < 2) return { bg: '#f97316', emoji: '🟠', label: '1-2h' };
    if (hoursRemaining < 4) return { bg: '#eab308', emoji: '🟡', label: '2-4h' };
    return { bg: '#22c55e', emoji: '🟢', label: '>4h' };
  };

  const filteredCrew = filterBase === 'all'
    ? fatigueHeatmapData
    : fatigueHeatmapData.filter(c => c.base === filterBase);

  const criticalCrew = fatigueHeatmapData.filter(c =>
    c.fatigueData.some(f => f.remaining <= 0)
  );

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
          Crew Fatigue Risk - Next 6 Hours
        </h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <select
            value={filterBase}
            onChange={(e) => setFilterBase(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              background: 'white',
              fontSize: '13px'
            }}
          >
            <option value="all">All Bases</option>
            <option value="PTY">PTY</option>
            <option value="MIA">MIA</option>
            <option value="BOG">BOG</option>
            <option value="GRU">GRU</option>
          </select>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div style={{
        padding: '20px',
        borderRadius: '12px',
        background: 'white',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '24px',
        overflowX: 'auto'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '12px', fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                Crew
              </th>
              {hours.map(h => (
                <th key={h} style={{ textAlign: 'center', padding: '12px', fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredCrew.map((crew) => (
              <tr key={crew.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                <td style={{ padding: '8px 12px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: '#1e293b' }}>{crew.name}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>{crew.base} • {crew.role}</div>
                </td>
                {crew.fatigueData.map((cell, i) => {
                  const color = getColor(cell.remaining);
                  const isHovered = hoveredCell?.crew === crew.id && hoveredCell?.hour === i;
                  return (
                    <td key={i} style={{ padding: '8px', textAlign: 'center' }}>
                      <button
                        onMouseEnter={() => setHoveredCell({ crew: crew.id, hour: i })}
                        onMouseLeave={() => setHoveredCell(null)}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          border: 'none',
                          background: `${color.bg}22`,
                          cursor: 'pointer',
                          fontSize: '14px',
                          transform: isHovered ? 'scale(1.2)' : 'scale(1)',
                          transition: 'transform 0.2s'
                        }}
                        title={`${cell.remaining}h remaining`}
                      >
                        {color.emoji}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '24px',
        fontSize: '12px',
        color: '#64748b'
      }}>
        <span style={{ fontWeight: '600' }}>Legend:</span>
        <span>🟢 {'>'}4h</span>
        <span>🟡 2-4h</span>
        <span>🟠 1-2h</span>
        <span>🔴 {'<'}1h</span>
        <span>⬛ Illegal</span>
      </div>

      {/* Critical Alerts */}
      {criticalCrew.length > 0 && (
        <div style={{
          padding: '20px',
          borderRadius: '12px',
          background: '#fef2f2',
          border: '1px solid #fecaca'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#ef4444', marginBottom: '12px' }}>
            ⚠️ Critical Alerts ({criticalCrew.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {criticalCrew.map((crew) => (
              <div
                key={crew.id}
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  background: 'white',
                  border: '1px solid #fecaca',
                  fontSize: '13px'
                }}
              >
                <span style={{ fontWeight: '600', color: '#ef4444' }}>{crew.name}</span>
                <span style={{ color: '#64748b' }}> reaches limit at {crew.limitTime} — </span>
                <span style={{ color: '#1e293b', fontWeight: '500' }}>{crew.currentFlight} at risk</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ============ SCENARIO 4: ROOT CAUSE ANALYSIS ============
const RootCauseAnalysisViz: React.FC = () => {
  const [selectedCause, setSelectedCause] = useState<string | null>('Weather');

  const data = rootCauseAnalysisData;
  const drilldown = data.drilldown;

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
          Root Cause Analysis - {data.period}
        </h2>
      </div>

      {/* Summary */}
      <div style={{
        padding: '24px',
        borderRadius: '12px',
        background: 'white',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '24px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', fontWeight: '700', color: '#ef4444', marginBottom: '8px' }}>
          {data.totalDelays}
        </div>
        <div style={{ fontSize: '14px', color: '#64748b' }}>Total Delays</div>
      </div>

      {/* Treemap-style Breakdown */}
      <div style={{
        padding: '20px',
        borderRadius: '12px',
        background: 'white',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '24px'
      }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', marginBottom: '16px' }}>
          Root Cause Breakdown
        </h3>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          {data.breakdown.map((cause) => (
            <button
              key={cause.name}
              onClick={() => setSelectedCause(selectedCause === cause.name ? null : cause.name)}
              style={{
                flex: cause.value,
                padding: '20px',
                borderRadius: '8px',
                border: selectedCause === cause.name ? '2px solid #1e293b' : 'none',
                background: cause.color,
                color: 'white',
                cursor: 'pointer',
                textAlign: 'center',
                minWidth: '100px'
              }}
            >
              <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>{cause.value}%</div>
              <div style={{ fontSize: '12px', fontWeight: '600' }}>{cause.name}</div>
            </button>
          ))}
        </div>

        {/* Sub-causes */}
        {selectedCause && (
          <div style={{ paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '12px' }}>
              {selectedCause} Breakdown
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {data.breakdown.find(c => c.name === selectedCause)?.children?.map((sub) => (
                <div
                  key={sub.name}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '6px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    flex: sub.value
                  }}
                >
                  <div style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>{sub.value}%</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{sub.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Drill-down Table */}
      <div style={{
        padding: '20px',
        borderRadius: '12px',
        background: 'white',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '24px'
      }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', marginBottom: '16px' }}>
          Drill-down: {drilldown.cause} {'>'} {drilldown.location} ({((drilldown.incidents / data.totalDelays) * 100).toFixed(0)}% of total)
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '10px', fontSize: '12px', color: '#64748b', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>
                Specific Cause
              </th>
              <th style={{ textAlign: 'center', padding: '10px', fontSize: '12px', color: '#64748b', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>
                Incidents
              </th>
              <th style={{ textAlign: 'center', padding: '10px', fontSize: '12px', color: '#64748b', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>
                Delay Mins
              </th>
              <th style={{ textAlign: 'right', padding: '10px', fontSize: '12px', color: '#64748b', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>
                Cost Impact
              </th>
            </tr>
          </thead>
          <tbody>
            {drilldown.details.map((item, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '10px', fontSize: '13px', color: '#1e293b' }}>{item.specificCause}</td>
                <td style={{ padding: '10px', fontSize: '13px', color: '#64748b', textAlign: 'center' }}>{item.incidents}</td>
                <td style={{ padding: '10px', fontSize: '13px', color: '#64748b', textAlign: 'center' }}>{item.delayMins}</td>
                <td style={{ padding: '10px', fontSize: '13px', color: '#1e293b', textAlign: 'right', fontFamily: 'monospace' }}>
                  ${item.costImpact.toLocaleString()}
                </td>
              </tr>
            ))}
            <tr style={{ background: '#f8fafc' }}>
              <td style={{ padding: '10px', fontSize: '13px', color: '#1e293b', fontWeight: '600' }}>TOTAL</td>
              <td style={{ padding: '10px', fontSize: '13px', color: '#1e293b', fontWeight: '600', textAlign: 'center' }}>{drilldown.incidents}</td>
              <td style={{ padding: '10px', fontSize: '13px', color: '#1e293b', fontWeight: '600', textAlign: 'center' }}>{drilldown.delayMins}</td>
              <td style={{ padding: '10px', fontSize: '13px', color: '#1e293b', fontWeight: '600', textAlign: 'right', fontFamily: 'monospace' }}>
                ${drilldown.costImpact.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Recommendation */}
      <div style={{
        padding: '20px',
        borderRadius: '12px',
        background: '#eff6ff',
        border: '1px solid #93c5fd'
      }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#3b82f6', marginBottom: '12px' }}>
          💡 Recommendation
        </h3>
        <p style={{ fontSize: '13px', color: '#1e293b', marginBottom: '12px', margin: 0 }}>
          {data.recommendation.text}
        </p>
        <div style={{ fontSize: '12px', color: '#64748b' }}>
          Estimated savings: <strong>${data.recommendation.estimatedSavings.toLocaleString()}/month</strong> •
          Preventable delays: <strong>{data.recommendation.preventableDelays}/week</strong>
        </div>
      </div>
    </div>
  );
};

// ============ SCENARIO 5: PASSENGER IMPACT ============
const PassengerImpactViz: React.FC = () => {
  const [showDelayScenario, setShowDelayScenario] = useState(false);
  const data = passengerImpactData;

  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '24px' }}>
        Passenger Impact - {data.flight} Cancellation
      </h2>

      {/* Summary */}
      <div style={{
        padding: '20px',
        borderRadius: '12px',
        background: 'white',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '24px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
          {data.totalPassengers}
        </div>
        <div style={{ fontSize: '14px', color: '#64748b' }}>Passengers on {data.flight} ({data.route})</div>
      </div>

      {/* Sankey-style Flow */}
      <div style={{
        padding: '20px',
        borderRadius: '12px',
        background: 'white',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '24px'
      }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', marginBottom: '16px' }}>
          Passenger Flow
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {/* Source */}
          <div style={{
            padding: '20px',
            borderRadius: '8px',
            background: '#f1f5f9',
            textAlign: 'center',
            minWidth: '100px'
          }}>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>{data.flight}</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>{data.route}</div>
          </div>

          {/* Flows */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data.flows.map((flow, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  height: '24px',
                  background: flow.color,
                  borderRadius: '4px',
                  width: `${(flow.value / data.totalPassengers) * 100}%`,
                  minWidth: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  paddingRight: '8px',
                  color: 'white',
                  fontSize: '11px',
                  fontWeight: '600'
                }}>
                  {flow.value}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: '#1e293b' }}>{flow.target}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Arrive {flow.delay}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rebooking Options Table */}
      <div style={{
        padding: '20px',
        borderRadius: '12px',
        background: 'white',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '24px'
      }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', marginBottom: '16px' }}>
          Rebooking Options
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '10px', fontSize: '12px', color: '#64748b', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>
                Option
              </th>
              <th style={{ textAlign: 'center', padding: '10px', fontSize: '12px', color: '#64748b', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>
                Capacity
              </th>
              <th style={{ textAlign: 'center', padding: '10px', fontSize: '12px', color: '#64748b', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>
                Delay
              </th>
              <th style={{ textAlign: 'right', padding: '10px', fontSize: '12px', color: '#64748b', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>
                Cost/PAX
              </th>
              <th style={{ textAlign: 'right', padding: '10px', fontSize: '12px', color: '#64748b', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>
                Total Cost
              </th>
            </tr>
          </thead>
          <tbody>
            {data.rebookingOptions.map((opt, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '10px', fontSize: '13px', color: '#1e293b' }}>{opt.option}</td>
                <td style={{ padding: '10px', fontSize: '13px', color: '#64748b', textAlign: 'center' }}>{opt.capacity}</td>
                <td style={{ padding: '10px', fontSize: '13px', color: '#64748b', textAlign: 'center' }}>{opt.delay}</td>
                <td style={{ padding: '10px', fontSize: '13px', color: '#1e293b', textAlign: 'right', fontFamily: 'monospace' }}>
                  ${opt.costPerPax}
                </td>
                <td style={{ padding: '10px', fontSize: '13px', color: '#1e293b', textAlign: 'right', fontFamily: 'monospace', fontWeight: '500' }}>
                  ${opt.totalCost.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Total Cost & Warning */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div style={{
          padding: '20px',
          borderRadius: '12px',
          background: '#fef2f2',
          border: '1px solid #fecaca'
        }}>
          <div style={{ fontSize: '12px', color: '#ef4444', fontWeight: '600', marginBottom: '8px' }}>TOTAL CANCELLATION COST</div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#ef4444' }}>
            ${data.totalCancellationCost.toLocaleString()}
          </div>
        </div>
        <div style={{
          padding: '20px',
          borderRadius: '12px',
          background: '#fef3c7',
          border: '1px solid #fcd34d'
        }}>
          <div style={{ fontSize: '12px', color: '#d97706', fontWeight: '600', marginBottom: '8px' }}>CONNECTION WARNING</div>
          <div style={{ fontSize: '14px', color: '#92400e' }}>
            ⚠️ <strong>{data.tightConnections} passengers</strong> have tight connections in GRU
          </div>
        </div>
      </div>

      {/* Compare Scenario */}
      <button
        onClick={() => setShowDelayScenario(!showDelayScenario)}
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          background: 'white',
          cursor: 'pointer',
          fontSize: '13px',
          color: '#3b82f6',
          fontWeight: '500'
        }}
      >
        {showDelayScenario ? 'Hide' : 'Compare with'} "Delay {data.delayScenario.delay}" Scenario
      </button>

      {showDelayScenario && (
        <div style={{
          marginTop: '16px',
          padding: '20px',
          borderRadius: '12px',
          background: '#f0fdf4',
          border: '2px solid #10b981'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#10b981', marginBottom: '12px' }}>
            Alternative: Delay {data.delayScenario.delay}
          </h3>
          <div style={{ display: 'flex', gap: '24px' }}>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>
                ${data.delayScenario.cost.toLocaleString()}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Total cost</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>
                {data.delayScenario.missedConnections}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Missed connections</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>
                ${(data.totalCancellationCost - data.delayScenario.cost).toLocaleString()}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Savings vs Cancel</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============ SCENARIO 6: PERFORMANCE TRENDS ============
const PerformanceTrendsViz: React.FC = () => {
  const [activeMetric, setActiveMetric] = useState<'otp' | 'delays' | 'cost' | 'resolutionTime'>('otp');
  const data = performanceTrendsData;

  const chartData = data.thisWeek.map((tw, i) => ({
    day: tw.day,
    thisWeek: tw[activeMetric],
    lastWeek: data.lastWeek[i][activeMetric]
  }));

  const metricLabels = {
    otp: 'On-Time Performance (%)',
    delays: 'Number of Delays',
    cost: 'Cost Impact ($)',
    resolutionTime: 'Resolution Time (min)'
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
          Performance Trends
        </h2>
        <select
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
            background: 'white',
            fontSize: '13px'
          }}
        >
          <option>Last 7 Days</option>
          <option>Last 14 Days</option>
          <option>Last 30 Days</option>
        </select>
      </div>

      {/* Metric Toggle */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        padding: '4px',
        background: '#f1f5f9',
        borderRadius: '8px',
        width: 'fit-content'
      }}>
        {(['otp', 'delays', 'cost', 'resolutionTime'] as const).map((metric) => (
          <button
            key={metric}
            onClick={() => setActiveMetric(metric)}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: activeMetric === metric ? 'white' : 'transparent',
              boxShadow: activeMetric === metric ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600',
              color: activeMetric === metric ? '#1e293b' : '#64748b'
            }}
          >
            {metric === 'otp' ? 'OTP' : metric === 'resolutionTime' ? 'Time' : metric.charAt(0).toUpperCase() + metric.slice(1)}
          </button>
        ))}
      </div>

      {/* Line Chart */}
      <div style={{
        padding: '20px',
        borderRadius: '12px',
        background: 'white',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '24px'
      }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', marginBottom: '16px' }}>
          {metricLabels[activeMetric]}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                background: '#1e293b',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                fontSize: '12px'
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="thisWeek"
              name="This Week"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="lastWeek"
              name="Last Week"
              stroke="#94a3b8"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#94a3b8', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Comparison Table */}
      <div style={{
        padding: '20px',
        borderRadius: '12px',
        background: 'white',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '24px'
      }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', marginBottom: '16px' }}>
          Comparison
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '10px', fontSize: '12px', color: '#64748b', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>
                Metric
              </th>
              <th style={{ textAlign: 'center', padding: '10px', fontSize: '12px', color: '#64748b', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>
                This Week
              </th>
              <th style={{ textAlign: 'center', padding: '10px', fontSize: '12px', color: '#64748b', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>
                Last Week
              </th>
              <th style={{ textAlign: 'center', padding: '10px', fontSize: '12px', color: '#64748b', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>
                Change
              </th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '12px 10px', fontSize: '13px', color: '#1e293b' }}>On-Time Performance</td>
              <td style={{ padding: '12px 10px', fontSize: '14px', color: '#1e293b', fontWeight: '600', textAlign: 'center' }}>
                {data.comparison.onTimePerformance.thisWeek}%
              </td>
              <td style={{ padding: '12px 10px', fontSize: '14px', color: '#64748b', textAlign: 'center' }}>
                {data.comparison.onTimePerformance.lastWeek}%
              </td>
              <td style={{ padding: '12px 10px', fontSize: '13px', fontWeight: '600', textAlign: 'center', color: '#10b981' }}>
                ↑ +{data.comparison.onTimePerformance.change}%
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '12px 10px', fontSize: '13px', color: '#1e293b' }}>Avg Resolution Time</td>
              <td style={{ padding: '12px 10px', fontSize: '14px', color: '#1e293b', fontWeight: '600', textAlign: 'center' }}>
                {data.comparison.avgResolutionTime.thisWeek} min
              </td>
              <td style={{ padding: '12px 10px', fontSize: '14px', color: '#64748b', textAlign: 'center' }}>
                {data.comparison.avgResolutionTime.lastWeek} min
              </td>
              <td style={{ padding: '12px 10px', fontSize: '13px', fontWeight: '600', textAlign: 'center', color: '#10b981' }}>
                ↓ {data.comparison.avgResolutionTime.change}%
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '12px 10px', fontSize: '13px', color: '#1e293b' }}>Cost Avoided</td>
              <td style={{ padding: '12px 10px', fontSize: '14px', color: '#1e293b', fontWeight: '600', textAlign: 'center' }}>
                ${(data.comparison.costAvoided.thisWeek / 1000).toFixed(0)}K
              </td>
              <td style={{ padding: '12px 10px', fontSize: '14px', color: '#64748b', textAlign: 'center' }}>
                ${(data.comparison.costAvoided.lastWeek / 1000).toFixed(0)}K
              </td>
              <td style={{ padding: '12px 10px', fontSize: '13px', fontWeight: '600', textAlign: 'center', color: '#10b981' }}>
                ↑ +{data.comparison.costAvoided.change}%
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '12px 10px', fontSize: '13px', color: '#1e293b' }}>Escalations</td>
              <td style={{ padding: '12px 10px', fontSize: '14px', color: '#1e293b', fontWeight: '600', textAlign: 'center' }}>
                {data.comparison.escalations.thisWeek}
              </td>
              <td style={{ padding: '12px 10px', fontSize: '14px', color: '#64748b', textAlign: 'center' }}>
                {data.comparison.escalations.lastWeek}
              </td>
              <td style={{ padding: '12px 10px', fontSize: '13px', fontWeight: '600', textAlign: 'center', color: '#10b981' }}>
                ↓ {data.comparison.escalations.change}%
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '12px 10px', fontSize: '13px', color: '#1e293b' }}>AI Recommendations Accepted</td>
              <td style={{ padding: '12px 10px', fontSize: '14px', color: '#1e293b', fontWeight: '600', textAlign: 'center' }}>
                {data.comparison.aiRecommendations.thisWeek}%
              </td>
              <td style={{ padding: '12px 10px', fontSize: '14px', color: '#64748b', textAlign: 'center' }}>
                {data.comparison.aiRecommendations.lastWeek}%
              </td>
              <td style={{ padding: '12px 10px', fontSize: '13px', fontWeight: '600', textAlign: 'center', color: '#10b981' }}>
                ↑ +{data.comparison.aiRecommendations.change}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Key Insight */}
      <div style={{
        padding: '16px 20px',
        borderRadius: '12px',
        background: '#eff6ff',
        border: '1px solid #93c5fd'
      }}>
        <span style={{ fontSize: '13px', color: '#1e293b' }}>
          💡 <strong>Key Insight:</strong> {data.keyInsight}
        </span>
      </div>
    </div>
  );
};

// ============ SCENARIO 7: RESERVE AVAILABILITY ============
const ReserveAvailabilityViz: React.FC = () => {
  const [selectedHour, setSelectedHour] = useState<string | null>('13:00');
  const data = reserveAvailabilityData;

  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '24px' }}>
        Reserve Availability - Next 12 Hours
      </h2>

      {/* Stacked Bar Chart */}
      <div style={{
        padding: '20px',
        borderRadius: '12px',
        background: 'white',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '24px'
      }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', marginBottom: '16px' }}>
          Reserves by Hour
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data.hourlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="hour" tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                background: '#1e293b',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                fontSize: '12px'
              }}
            />
            <Legend />
            <Bar
              dataKey="captain"
              name="Captain"
              fill="#3b82f6"
              stackId="a"
              onClick={(entry) => setSelectedHour(entry.hour)}
              style={{ cursor: 'pointer' }}
            />
            <Bar
              dataKey="firstOfficer"
              name="First Officer"
              fill="#10b981"
              stackId="a"
              onClick={(entry) => setSelectedHour(entry.hour)}
              style={{ cursor: 'pointer' }}
            />
            <Bar
              dataKey="flightAttendant"
              name="Flight Attendant"
              fill="#f97316"
              stackId="a"
              onClick={(entry) => setSelectedHour(entry.hour)}
              style={{ cursor: 'pointer' }}
            />
          </BarChart>
        </ResponsiveContainer>

        {/* Gap Warning */}
        {data.gapWarning && (
          <div style={{
            marginTop: '16px',
            padding: '12px 16px',
            borderRadius: '6px',
            background: '#fef3c7',
            border: '1px solid #fcd34d',
            fontSize: '13px',
            color: '#92400e'
          }}>
            ⚠️ Gap at <strong>{data.gapWarning.hour}</strong> - {data.gapWarning.message}
          </div>
        )}
      </div>

      {/* Available Crew at Selected Hour */}
      {selectedHour && (
        <div style={{
          padding: '20px',
          borderRadius: '12px',
          background: 'white',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', marginBottom: '16px' }}>
            {selectedHour} - Available Reserves ({data.availableAt13.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.availableAt13.map((reserve) => (
              <div
                key={reserve.id}
                style={{
                  padding: '16px',
                  borderRadius: '8px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  display: 'grid',
                  gridTemplateColumns: '1fr 120px 120px',
                  gap: '16px',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>
                    {reserve.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                    {reserve.role} • {reserve.base}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                    {reserve.certifications.join(', ')}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
                    {reserve.responseTime}m
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>response time</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#3b82f6',
                    color: 'white',
                    fontSize: '11px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}>
                    Call
                  </button>
                  <button style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    background: 'white',
                    color: '#64748b',
                    fontSize: '11px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}>
                    Schedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ============ MAIN CREW CONTROLLER 4.0 COMPONENT ============
const CrewController4: React.FC = () => {
  const [activeVisualization, setActiveVisualization] = useState<VisualizationType>(null);
  const [dataMode, setDataMode] = useState<'mock' | 'live'>('mock');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'ai',
      content: "Good morning, Controller. I'm monitoring **187 flights** and **412 crew members** across your network.\n\nSelect a scenario below to explore interactive visualizations, or ask me about crew utilization, fatigue risks, or operational costs."
    }
  ]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleQuestionClick = (question: typeof cc4SuggestedQuestions[0]) => {
    setChatMessages(prev => [...prev, { role: 'user', content: question.full }]);
    setIsAnalyzing(true);

    setTimeout(() => {
      setIsAnalyzing(false);
      const aiResponse = getAIResponse(question.id);
      setChatMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
      setActiveVisualization(question.visualization as VisualizationType);
    }, 1200);
  };

  const getAIResponse = (questionId: string): string => {
    const responses: Record<string, string> = {
      utilization: `**Crew Utilization Dashboard**\n\nCurrent network status:\n• **412** crew on duty\n• **24** reserves available\n• **156** in rest period\n• **89** off duty\n\n**PTY** has highest utilization at **87%**. **GRU** is underutilized at **45%** - consider repositioning.`,

      cost: `**Resolution Cost Analysis**\n\nFor the CM 208 crew shortage, I've analyzed 4 options:\n\n• **Option 1** (F/O Santos): **$0** - Recommended\n• **Option 2** (F/O Moreno): **$450**\n• **Option 3** (Crew Swap): **$2,100**\n• **Do Nothing**: **$47,000**\n\nRecommendation: Assign F/O Santos for zero cost and 12-minute resolution.`,

      fatigue: `**Fatigue Risk Assessment**\n\n**2 crew members** will hit duty limits within the visualization window:\n\n• **F/O Vega** - reaches limit at **14:30** (CM 208 at risk)\n• **F/O Chen** - reaches limit at **13:45** (CM 512 at risk)\n\nRecommendation: Activate reserves for these flights proactively.`,

      rootcause: `**Root Cause Analysis - Last 7 Days**\n\n**47 delays** traced to:\n• **Weather** (40%) - PTY thunderstorms primary cause\n• **Crew Cascade** (35%) - legality timeouts\n• **Maintenance** (25%) - AOG parts delays\n\nRecommendation: Pre-position 2 reserve crew at PTY during afternoon storm season.`,

      passenger: `**CM 208 Cancellation Impact**\n\n**143 passengers** affected:\n• 78 → CM 210 same day (+4h)\n• 31 → LATAM partner (+6h)\n• 22 → Next day + hotel (+24h)\n• 12 → Refund requests\n\n**Total cost: $47,200**\n\nAlternative: 2-hour delay costs only **$3,200** with zero missed connections.`,

      trends: `**Weekly Performance Comparison**\n\n**This week vs. last week:**\n• OTP: **94.2%** vs 87.1% (↑ 7.1%)\n• Resolution time: **23 min** vs 38 min (↓ 39%)\n• Cost avoided: **$847K** vs $412K (↑ 105%)\n• Escalations: **1** vs 7 (↓ 86%)\n\nKey driver: Pre-positioning reserves before weather events.`,

      reserve: `**Reserve Coverage Analysis**\n\n**Current availability by hour:**\n• **08:00-12:00**: Good coverage (10-12 reserves)\n• **13:00-14:00**: Gap alert - only 4 reserves\n• **15:00-19:00**: Recovering to 10+ reserves\n\nRecommendation: Monitor 13:00-14:00 window closely. Consider calling in additional coverage.`
    };

    return responses[questionId] || 'Analysis complete.';
  };

  const formatContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #1e293b">$1</strong>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <header style={{
        padding: '16px 32px',
        borderBottom: '1px solid rgba(0,0,0,0.1)',
        background: 'white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              color: 'white'
            }}>📊</div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '18px', color: '#1e293b' }}>Crew Controller 4.0</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Interactive Dashboard • Copa Airlines</div>
            </div>
          </div>

          {/* Data Mode Toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 16px',
            borderRadius: '8px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0'
          }}>
            <span style={{
              fontSize: '12px',
              fontWeight: '600',
              color: dataMode === 'mock' ? '#8b5cf6' : '#94a3b8'
            }}>Mock</span>
            <button
              onClick={() => setDataMode(dataMode === 'mock' ? 'live' : 'mock')}
              style={{
                width: '44px',
                height: '24px',
                borderRadius: '12px',
                background: dataMode === 'live' ? '#10b981' : '#cbd5e1',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.2s'
              }}
            >
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: 'white',
                position: 'absolute',
                top: '2px',
                left: dataMode === 'live' ? '22px' : '2px',
                transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
              }} />
            </button>
            <span style={{
              fontSize: '12px',
              fontWeight: '600',
              color: dataMode === 'live' ? '#10b981' : '#94a3b8'
            }}>Live</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Panel - Chat */}
        <div style={{
          width: '35%',
          borderRight: '1px solid rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          background: 'white'
        }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '16px' }}>🤖</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '600', fontSize: '14px', color: '#1e293b' }}>Operations AI</div>
              <div style={{ fontSize: '11px', color: '#10b981' }}>● Active • Monitoring 187 flights</div>
            </div>
          </div>

          {/* Suggested Questions */}
          <div style={{
            padding: '20px',
            borderBottom: '1px solid rgba(0,0,0,0.1)',
            background: '#f8fafc'
          }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '12px' }}>
              INTERACTIVE SCENARIOS
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px'
            }}>
              {cc4SuggestedQuestions.map((q) => (
                <button
                  key={q.id}
                  onClick={() => handleQuestionClick(q)}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    background: activeVisualization === q.visualization ? '#ede9fe' : 'white',
                    border: activeVisualization === q.visualization ? '1px solid #8b5cf6' : '1px solid #e2e8f0',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontSize: '16px', marginBottom: '4px' }}>{q.icon}</div>
                  <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '12px' }}>{q.short}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat History */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {chatMessages.map((msg, idx) => (
              <div key={idx} style={{
                padding: '14px 16px',
                borderRadius: '12px',
                background: msg.role === 'ai' ? '#f1f5f9' : '#ede9fe',
                border: `1px solid ${msg.role === 'ai' ? '#e2e8f0' : '#c4b5fd'}`,
                fontSize: '13px',
                lineHeight: '1.6',
                color: '#1e293b'
              }}>
                <div style={{ whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{
                  __html: formatContent(msg.content)
                }} />
              </div>
            ))}
            {isAnalyzing && (
              <div style={{
                padding: '14px 16px',
                borderRadius: '12px',
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                fontSize: '13px',
                color: '#64748b'
              }}>
                <span>Analyzing data...</span>
                <span style={{
                  display: 'inline-block',
                  animation: 'pulse 1s infinite',
                  marginLeft: '4px'
                }}>●</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Visualization */}
        <div style={{ flex: 1, background: '#f8fafc', overflow: 'auto' }}>
          {!activeVisualization && (
            <div style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px',
              color: '#64748b',
              textAlign: 'center'
            }}>
              <div>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
                <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                  Select a scenario to explore
                </div>
                <div style={{ fontSize: '14px' }}>
                  Click any scenario button to see interactive charts and analytics
                </div>
              </div>
            </div>
          )}

          {activeVisualization === 'CrewUtilization' && <CrewUtilizationViz />}
          {activeVisualization === 'CostComparison' && <CostComparisonViz />}
          {activeVisualization === 'FatigueHeatmap' && <FatigueHeatmapViz />}
          {activeVisualization === 'RootCauseAnalysis' && <RootCauseAnalysisViz />}
          {activeVisualization === 'PassengerImpact' && <PassengerImpactViz />}
          {activeVisualization === 'PerformanceTrends' && <PerformanceTrendsViz />}
          {activeVisualization === 'ReserveAvailability' && <ReserveAvailabilityViz />}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default CrewController4;
