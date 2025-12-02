import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, AlertTriangle, Users, Plane, TrendingUp, X, MessageSquare, ChevronUp, ChevronDown } from 'lucide-react';
import {
  crewMembers,
  alerts,
  flights,
  operationalStats,
  currentTime,
  type Alert,
  type CrewMember,
  type CrewAssignment
} from '../data/crewController3MockData';

type ContextMode = 'overview' | 'alert' | 'crew' | 'flight';

interface ContextState {
  mode: ContextMode;
  data?: Alert | CrewMember | any;
}

const CrewController3: React.FC = () => {
  const [currentTimeDisplay, setCurrentTimeDisplay] = useState(currentTime);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [selectedCrew, setSelectedCrew] = useState<CrewMember | null>(null);
  const [contextState, setContextState] = useState<ContextState>({ mode: 'overview' });
  const [aiBarExpanded, setAiBarExpanded] = useState(false);
  const [aiMessages, setAiMessages] = useState<Array<{ role: 'user' | 'ai', content: string }>>([]);

  // Simulate live clock (increment every minute)
  useEffect(() => {
    const interval = setInterval(() => {
      const [hours, minutes] = currentTimeDisplay.split(':').map(Number);
      const newMinutes = (minutes + 1) % 60;
      const newHours = minutes === 59 ? (hours + 1) % 24 : hours;
      setCurrentTimeDisplay(`${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [currentTimeDisplay]);

  const handleAlertClick = (alert: Alert) => {
    setSelectedAlert(alert);
    setContextState({ mode: 'alert', data: alert });
  };

  const handleCrewClick = (crew: CrewMember) => {
    setSelectedCrew(crew);
    setContextState({ mode: 'crew', data: crew });
  };

  const handleBackToLanding = () => {
    window.location.reload();
  };

  // Calculate time position for Gantt chart (6am to 11pm = 17 hours)
  const getTimePosition = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = (hours - 6) * 60 + minutes;
    const maxMinutes = 17 * 60; // 6am to 11pm
    return (totalMinutes / maxMinutes) * 100;
  };

  // Render Gantt timeline for a crew member
  const renderCrewTimeline = (crew: CrewMember) => {
    const statusColors = {
      legal: '#10b981',
      warning: '#f59e0b',
      critical: '#ef4444',
      deadhead: '#a855f7',
      rest: '#6b7280',
      reserve: '#3b82f6'
    };

    return (
      <div
        key={crew.id}
        style={{
          display: 'flex',
          alignItems: 'center',
          height: '48px',
          borderBottom: '1px solid #e5e7eb',
          cursor: 'pointer',
          backgroundColor: selectedCrew?.id === crew.id ? '#f3f4f6' : 'transparent'
        }}
        onClick={() => handleCrewClick(crew)}
      >
        {/* Crew name column */}
        <div style={{ width: '200px', padding: '0 12px', fontSize: '13px', fontWeight: 500 }}>
          <div>{crew.name}</div>
          <div style={{ fontSize: '11px', color: '#6b7280' }}>
            {crew.rank} • {crew.hoursRemaining.toFixed(1)}h remaining
          </div>
        </div>

        {/* Timeline area */}
        <div style={{ flex: 1, position: 'relative', height: '40px' }}>
          {/* Current time indicator */}
          <div
            style={{
              position: 'absolute',
              left: `${getTimePosition(currentTimeDisplay)}%`,
              top: 0,
              bottom: 0,
              width: '2px',
              backgroundColor: '#ef4444',
              zIndex: 10
            }}
          />

          {/* Assignments */}
          {crew.assignments.map((assignment, idx) => {
            const startPos = getTimePosition(assignment.std);
            const endPos = getTimePosition(assignment.sta);
            const width = endPos - startPos;

            return (
              <div
                key={idx}
                style={{
                  position: 'absolute',
                  left: `${startPos}%`,
                  width: `${width}%`,
                  height: '32px',
                  top: '4px',
                  backgroundColor: statusColors[crew.currentStatus],
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '11px',
                  color: 'white',
                  fontWeight: 500,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  border: assignment.status === 'delayed' ? '2px solid #fbbf24' : 'none'
                }}
                title={`${assignment.flightNumber} ${assignment.route} (${assignment.std}-${assignment.sta})`}
              >
                {assignment.flightNumber}
              </div>
            );
          })}

          {/* Reserve status */}
          {crew.assignments.length === 0 && (
            <div
              style={{
                position: 'absolute',
                left: `${getTimePosition(crew.dutyStart)}%`,
                width: `${getTimePosition(crew.dutyEnd) - getTimePosition(crew.dutyStart)}%`,
                height: '32px',
                top: '4px',
                backgroundColor: statusColors.reserve,
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '11px',
                color: 'white',
                fontWeight: 500,
                textAlign: 'center',
                opacity: 0.7
              }}
            >
              RESERVE
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render context panel based on mode
  const renderContextPanel = () => {
    if (contextState.mode === 'overview') {
      return (
        <div style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>
            Operations Overview
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            Copa Airlines PTY Base • December 1, 2025
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Crew Status</div>
              <div style={{ fontSize: '24px', fontWeight: 600 }}>
                {operationalStats.crewOnDuty} <span style={{ fontSize: '14px', color: '#6b7280' }}>on duty</span>
              </div>
              <div style={{ fontSize: '14px', color: '#10b981' }}>
                {operationalStats.crewAvailable} available reserves
              </div>
            </div>

            <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Flights Today</div>
              <div style={{ fontSize: '24px', fontWeight: 600 }}>
                {operationalStats.flightsToday}
              </div>
              <div style={{ fontSize: '14px', color: '#f59e0b' }}>
                {operationalStats.delaysActive} delay active
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Active Situations</h3>
            <div style={{ padding: '12px', backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444', borderRadius: '4px', marginBottom: '8px' }}>
              <div style={{ fontWeight: 600, fontSize: '14px', color: '#991b1b' }}>Critical: Crew Timeout Risk</div>
              <div style={{ fontSize: '13px', color: '#7f1d1d', marginTop: '4px' }}>
                F/O Mendez - 2.5h remaining on CM234 (delayed)
              </div>
            </div>
            <div style={{ padding: '12px', backgroundColor: '#fef9e7', borderLeft: '4px solid #f59e0b', borderRadius: '4px' }}>
              <div style={{ fontWeight: 600, fontSize: '14px', color: '#92400e' }}>Warning: Weather Impact</div>
              <div style={{ fontSize: '13px', color: '#78350f', marginTop: '4px' }}>
                MIA ground stop affecting CM234 + 2 downstream flights
              </div>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Quick Stats</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: '#6b7280' }}>Legal crew:</span>
                <span style={{ fontWeight: 500 }}>4 pilots</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: '#6b7280' }}>Warning status:</span>
                <span style={{ fontWeight: 500, color: '#f59e0b' }}>1 pilot</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: '#6b7280' }}>Critical status:</span>
                <span style={{ fontWeight: 500, color: '#ef4444' }}>1 pilot</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: '#6b7280' }}>On rest:</span>
                <span style={{ fontWeight: 500 }}>2 pilots</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: '#6b7280' }}>Reserve:</span>
                <span style={{ fontWeight: 500 }}>2 pilots</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (contextState.mode === 'alert' && contextState.data) {
      const alert = contextState.data as Alert;
      return (
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600 }}>{alert.title}</h2>
            <button
              onClick={() => setContextState({ mode: 'overview' })}
              style={{ padding: '4px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              <X size={20} color="#6b7280" />
            </button>
          </div>

          <div style={{
            display: 'inline-block',
            padding: '4px 12px',
            backgroundColor: alert.severity === 'critical' ? '#fef2f2' : alert.severity === 'warning' ? '#fef9e7' : '#f0f9ff',
            color: alert.severity === 'critical' ? '#991b1b' : alert.severity === 'warning' ? '#92400e' : '#1e40af',
            borderRadius: '16px',
            fontSize: '12px',
            fontWeight: 600,
            marginBottom: '16px'
          }}>
            {alert.severity.toUpperCase()} • {alert.type.toUpperCase()}
          </div>

          <p style={{ color: '#374151', marginBottom: '24px', lineHeight: '1.6' }}>
            {alert.description}
          </p>

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#6b7280' }}>
              TIME TO IMPACT
            </h3>
            <div style={{ fontSize: '28px', fontWeight: 700, color: alert.severity === 'critical' ? '#ef4444' : '#f59e0b' }}>
              {alert.timeToImpact} minutes
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#6b7280' }}>
              AFFECTED FLIGHTS
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {alert.flightNumbers.map(fn => (
                <div
                  key={fn}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 500
                  }}
                >
                  {fn}
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#6b7280' }}>
              AFFECTED CREW
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {alert.crewAffected.map(crewId => {
                const crew = crewMembers.find(c => c.id === crewId);
                return crew ? (
                  <div
                    key={crewId}
                    style={{
                      padding: '12px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '6px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '14px' }}>{crew.name}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {crew.rank} • {crew.hoursRemaining.toFixed(1)}h remaining
                      </div>
                    </div>
                    <div
                      style={{
                        padding: '4px 8px',
                        backgroundColor: crew.currentStatus === 'critical' ? '#fef2f2' : '#fef9e7',
                        color: crew.currentStatus === 'critical' ? '#991b1b' : '#92400e',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 600
                      }}
                    >
                      {crew.currentStatus.toUpperCase()}
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#6b7280' }}>
              SUGGESTED ACTIONS
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {alert.suggestedActions.map((action, idx) => (
                <button
                  key={idx}
                  style={{
                    padding: '12px',
                    backgroundColor: '#ffffff',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 500,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.backgroundColor = '#f0f9ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.backgroundColor = '#ffffff';
                  }}
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (contextState.mode === 'crew' && contextState.data) {
      const crew = contextState.data as CrewMember;
      return (
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600 }}>{crew.name}</h2>
              <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                {crew.rank} • Base: {crew.base}
              </div>
            </div>
            <button
              onClick={() => setContextState({ mode: 'overview' })}
              style={{ padding: '4px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              <X size={20} color="#6b7280" />
            </button>
          </div>

          <div
            style={{
              display: 'inline-block',
              padding: '4px 12px',
              backgroundColor: crew.currentStatus === 'critical' ? '#fef2f2' : crew.currentStatus === 'warning' ? '#fef9e7' : '#f0fdf4',
              color: crew.currentStatus === 'critical' ? '#991b1b' : crew.currentStatus === 'warning' ? '#92400e' : '#166534',
              borderRadius: '16px',
              fontSize: '12px',
              fontWeight: 600,
              marginBottom: '24px'
            }}
          >
            {crew.currentStatus.toUpperCase()}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#6b7280' }}>
              DUTY INFORMATION
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: '#6b7280' }}>Duty Start:</span>
                <span style={{ fontWeight: 500 }}>{crew.dutyStart}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: '#6b7280' }}>Duty End:</span>
                <span style={{ fontWeight: 500 }}>{crew.dutyEnd}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: '#6b7280' }}>Hours Remaining:</span>
                <span style={{
                  fontWeight: 600,
                  color: crew.hoursRemaining < 3 ? '#ef4444' : crew.hoursRemaining < 5 ? '#f59e0b' : '#10b981'
                }}>
                  {crew.hoursRemaining.toFixed(1)}h
                </span>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#6b7280' }}>
              CERTIFICATIONS
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {crew.certifications.map(cert => (
                <div
                  key={cert}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#f0f9ff',
                    color: '#1e40af',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 500
                  }}
                >
                  {cert}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#6b7280' }}>
              TODAY'S ASSIGNMENTS
            </h3>
            {crew.assignments.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {crew.assignments.map((assignment, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '12px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                      border: assignment.status === 'delayed' ? '2px solid #fbbf24' : '1px solid #e5e7eb'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>{assignment.flightNumber}</div>
                      <div
                        style={{
                          padding: '2px 8px',
                          backgroundColor: assignment.status === 'departed' ? '#f0fdf4' : assignment.status === 'delayed' ? '#fef9e7' : '#f3f4f6',
                          color: assignment.status === 'departed' ? '#166534' : assignment.status === 'delayed' ? '#92400e' : '#374151',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 600
                        }}
                      >
                        {assignment.status.toUpperCase()}
                      </div>
                    </div>
                    <div style={{ fontSize: '13px', color: '#6b7280' }}>
                      {assignment.route} • {assignment.aircraftType}
                    </div>
                    <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                      STD: {assignment.std} • STA: {assignment.sta}
                    </div>
                    {assignment.atd && (
                      <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>
                        ATD: {assignment.atd}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '16px', backgroundColor: '#f0f9ff', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#1e40af', fontWeight: 500 }}>
                  Reserve Crew
                </div>
                <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                  Available for assignment
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#ffffff' }}>
      {/* Header */}
      <div
        style={{
          height: '60px',
          backgroundColor: '#1f2937',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          borderBottom: '2px solid #374151'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={handleBackToLanding}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '8px'
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 style={{ fontSize: '18px', fontWeight: 600' }}>Crew Controller 3.0</h1>
          <div style={{ fontSize: '13px', color: '#9ca3af' }}>Gantt Timeline Interface</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} />
            <span style={{ fontSize: '16px', fontWeight: 600 }}>{currentTimeDisplay}</span>
            <span style={{ fontSize: '13px', color: '#9ca3af' }}>PTY</span>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div
        style={{
          height: '56px',
          backgroundColor: '#f9fafb',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          gap: '32px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={16} color="#6b7280" />
          <span style={{ fontSize: '13px', color: '#6b7280' }}>On Duty:</span>
          <span style={{ fontSize: '15px', fontWeight: 600 }}>{operationalStats.crewOnDuty}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={16} color="#10b981" />
          <span style={{ fontSize: '13px', color: '#6b7280' }}>Available:</span>
          <span style={{ fontSize: '15px', fontWeight: 600, color: '#10b981' }}>{operationalStats.crewAvailable}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plane size={16} color="#6b7280" />
          <span style={{ fontSize: '13px', color: '#6b7280' }}>Flights:</span>
          <span style={{ fontSize: '15px', fontWeight: 600 }}>{operationalStats.flightsToday}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={16} color="#ef4444" />
          <span style={{ fontSize: '13px', color: '#6b7280' }}>Critical:</span>
          <span style={{ fontSize: '15px', fontWeight: 600, color: '#ef4444' }}>{operationalStats.alertsCritical}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={16} color="#f59e0b" />
          <span style={{ fontSize: '13px', color: '#6b7280' }}>Warnings:</span>
          <span style={{ fontSize: '15px', fontWeight: 600, color: '#f59e0b' }}>{operationalStats.alertsWarning}</span>
        </div>
      </div>

      {/* Main Content: Three Panels */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Alert Panel - 15% */}
        <div
          style={{
            width: '15%',
            borderRight: '1px solid #e5e7eb',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#ffffff'
          }}
        >
          <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#6b7280' }}>ACTIVE ALERTS</h2>
            <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
              {alerts.length} active
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {alerts.map(alert => (
              <div
                key={alert.id}
                onClick={() => handleAlertClick(alert)}
                style={{
                  padding: '12px',
                  borderBottom: '1px solid #e5e7eb',
                  cursor: 'pointer',
                  backgroundColor: selectedAlert?.id === alert.id ? '#f3f4f6' : 'transparent',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (selectedAlert?.id !== alert.id) {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedAlert?.id !== alert.id) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'start', gap: '8px', marginBottom: '8px' }}>
                  <AlertTriangle
                    size={16}
                    color={alert.severity === 'critical' ? '#ef4444' : alert.severity === 'warning' ? '#f59e0b' : '#3b82f6'}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                      {alert.title}
                    </div>
                    <div style={{ fontSize: '11px', color: '#6b7280', lineHeight: '1.4' }}>
                      {alert.description.substring(0, 60)}...
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                  {alert.timeToImpact > 0 ? `${alert.timeToImpact} min` : 'Immediate'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gantt Timeline - 45% */}
        <div
          style={{
            width: '45%',
            borderRight: '1px solid #e5e7eb',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#ffffff'
          }}
        >
          <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#6b7280' }}>CREW TIMELINE</h2>
            <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
              06:00 - 23:00 PTY Time
            </div>
          </div>

          {/* Time axis */}
          <div style={{ display: 'flex', borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
            <div style={{ width: '200px', padding: '8px 12px', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>
              CREW
            </div>
            <div style={{ flex: 1, display: 'flex', position: 'relative' }}>
              {[6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].map(hour => (
                <div
                  key={hour}
                  style={{
                    flex: 1,
                    padding: '8px 4px',
                    fontSize: '11px',
                    color: '#6b7280',
                    textAlign: 'center',
                    borderLeft: '1px solid #e5e7eb'
                  }}
                >
                  {hour}:00
                </div>
              ))}
            </div>
          </div>

          {/* Crew timelines */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {crewMembers.map(crew => renderCrewTimeline(crew))}
          </div>

          {/* Legend */}
          <div style={{ padding: '12px', borderTop: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '11px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '2px' }} />
                <span>Legal</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: '#f59e0b', borderRadius: '2px' }} />
                <span>Warning</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: '#ef4444', borderRadius: '2px' }} />
                <span>Critical</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: '#a855f7', borderRadius: '2px' }} />
                <span>Deadhead</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: '#6b7280', borderRadius: '2px' }} />
                <span>Rest</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: '#3b82f6', borderRadius: '2px' }} />
                <span>Reserve</span>
              </div>
            </div>
          </div>
        </div>

        {/* Context Panel - 40% */}
        <div style={{ width: '40%', backgroundColor: '#ffffff', overflowY: 'auto' }}>
          {renderContextPanel()}
        </div>
      </div>

      {/* AI Assistant Bar - Bottom (Collapsed only for Phase 1) */}
      <div
        style={{
          borderTop: '2px solid #e5e7eb',
          backgroundColor: '#f9fafb'
        }}
      >
        <div
          style={{
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer'
          }}
          onClick={() => setAiBarExpanded(!aiBarExpanded)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <MessageSquare size={18} color="#6b7280" />
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
              AI Assistant
            </span>
            <span style={{ fontSize: '12px', color: '#9ca3af' }}>
              (Phase 2 - Coming Soon)
            </span>
          </div>
          {aiBarExpanded ? <ChevronDown size={18} color="#6b7280" /> : <ChevronUp size={18} color="#6b7280" />}
        </div>

        {aiBarExpanded && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid #e5e7eb', backgroundColor: '#ffffff' }}>
            <div style={{ fontSize: '13px', color: '#6b7280', textAlign: 'center', fontStyle: 'italic' }}>
              AI-powered assistant for scenario analysis, crew recommendations, and what-if planning will be available in Phase 2.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CrewController3;
