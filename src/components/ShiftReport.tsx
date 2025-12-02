import React, { useState, useEffect } from 'react';
import { Check, Clock, AlertTriangle, Info, CheckCircle } from 'lucide-react';

// ============ TYPES ============
interface ShiftReportProps {
  data: {
    score: number;
    controller: string;
    date: string;
    shift: string;
    metrics: Array<{
      icon: string;
      value: string;
      label: string;
      subtext: string;
    }>;
    learningMoment: {
      flight: string;
      humanAction: string;
      result: string;
      aiFeedback: string;
    };
    achievements: Array<{
      icon: string;
      label: string;
      detail: string;
    }>;
    handoff: {
      outgoing: { name: string; startTime: string; endTime: string; resolved: number };
      incoming: { name: string; startTime: string; endTime: string; active: number };
      openItems: Array<{
        type: string;
        flight: string;
        route: string;
        issue: string;
        actionTaken: string;
        decisionPoint: string;
        priority: string;
      }>;
      watchItems: Array<{
        type: string;
        label: string;
        detail: string;
        due?: string;
      }>;
      resolvedItems: Array<{
        flight: string;
        action: string;
        time: string;
        outcome: string;
      }>;
      checklist: Array<{
        label: string;
        checked: boolean;
      }>;
    };
  };
}

// ============ SCORE RING COMPONENT ============
const ScoreRing: React.FC<{ score: number; maxScore?: number }> = ({ score, maxScore = 100 }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (animatedScore / maxScore) * circumference;

  useEffect(() => {
    let current = 0;
    const increment = score / 60; // 60 frames over 1.5s = 25ms per frame
    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(current));
      }
    }, 25);
    return () => clearInterval(timer);
  }, [score]);

  const getColor = (s: number) => {
    if (s >= 90) return '#10b981';
    if (s >= 75) return '#3b82f6';
    if (s >= 60) return '#eab308';
    return '#ef4444';
  };

  const getLabel = (s: number) => {
    if (s >= 90) return 'Excellent';
    if (s >= 75) return 'Good';
    if (s >= 60) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: '160px', height: '160px' }}>
        <svg width="160" height="160" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
          />
          {/* Animated progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={getColor(score)}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 50 50)"
            style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <span style={{ fontSize: '36px', fontWeight: 'bold', color: 'white' }}>
            {animatedScore}
          </span>
          <span style={{ fontSize: '14px', color: '#9ca3af' }}>/{maxScore}</span>
        </div>
      </div>
      <span
        style={{
          marginTop: '8px',
          fontSize: '14px',
          fontWeight: 500,
          color: getColor(score)
        }}
      >
        {getLabel(score)}
      </span>
    </div>
  );
};

// ============ METRIC CARD COMPONENT ============
const MetricCard: React.FC<{
  icon: string;
  value: string;
  label: string;
  subtext: string;
}> = ({ icon, value, label, subtext }) => (
  <div
    style={{
      backgroundColor: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '12px',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }}
  >
    <div style={{ fontSize: '24px' }}>{icon}</div>
    <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'white' }}>{value}</div>
    <div style={{ fontSize: '14px', color: '#9ca3af' }}>{label}</div>
    <div style={{ fontSize: '12px', color: '#6b7280' }}>{subtext}</div>
  </div>
);

// ============ LEARNING MOMENT COMPONENT ============
const LearningMoment: React.FC<{
  flight: string;
  humanAction: string;
  result: string;
  aiFeedback: string;
}> = ({ flight, humanAction, result, aiFeedback }) => (
  <div
    style={{
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      borderRadius: '12px',
      padding: '20px'
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
      <span style={{ fontSize: '20px' }}>💡</span>
      <span style={{ color: '#3b82f6', fontWeight: 600, fontSize: '14px' }}>
        Learning Moment
      </span>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
      <p style={{ color: '#d1d5db', margin: 0 }}>
        On <strong style={{ color: 'white' }}>{flight}</strong>, you {humanAction}.
      </p>
      <p style={{ color: '#10b981', fontWeight: 500, margin: 0 }}>
        Good call — {result}.
      </p>
      <div
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '8px',
          padding: '12px',
          display: 'flex',
          alignItems: 'start',
          gap: '8px'
        }}
      >
        <span style={{ color: '#10b981', flexShrink: 0 }}>✓</span>
        <span style={{ color: '#9ca3af' }}>{aiFeedback}</span>
      </div>
    </div>
  </div>
);

// ============ HANDOFF TIMELINE COMPONENT ============
const HandoffTimeline: React.FC<{
  outgoing: { name: string; startTime: string; endTime: string; resolved: number };
  incoming: { name: string; startTime: string; endTime: string; active: number };
}> = ({ outgoing, incoming }) => (
  <div style={{ marginBottom: '24px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
      <Clock size={18} color="#9ca3af" />
      <span style={{ fontSize: '14px', fontWeight: 600, color: '#9ca3af' }}>
        SHIFT TRANSITION
      </span>
    </div>
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      {/* Outgoing controller */}
      <div
        style={{
          flex: 1,
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '8px',
          padding: '16px'
        }}
      >
        <div style={{ fontSize: '16px', fontWeight: 600, color: 'white', marginBottom: '4px' }}>
          {outgoing.name}
        </div>
        <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
          {outgoing.startTime} - {outgoing.endTime}
        </div>
        <div style={{ fontSize: '12px', color: '#10b981' }}>
          {outgoing.resolved} issues resolved
        </div>
      </div>

      {/* Arrow */}
      <div style={{ fontSize: '24px', color: '#6b7280' }}>→</div>

      {/* Incoming controller */}
      <div
        style={{
          flex: 1,
          backgroundColor: 'rgba(59, 130, 246, 0.15)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '8px',
          padding: '16px'
        }}
      >
        <div style={{ fontSize: '16px', fontWeight: 600, color: 'white', marginBottom: '4px' }}>
          {incoming.name}
        </div>
        <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
          {incoming.startTime} - {incoming.endTime}
        </div>
        <div style={{ fontSize: '12px', color: '#3b82f6' }}>
          {incoming.active} active {incoming.active === 1 ? 'situation' : 'situations'}
        </div>
      </div>
    </div>
  </div>
);

// ============ OPEN ITEM CARD COMPONENT ============
const OpenItemCard: React.FC<{
  type: string;
  flight: string;
  route: string;
  issue: string;
  actionTaken: string;
  decisionPoint: string;
}> = ({ type, flight, route, issue, actionTaken, decisionPoint }) => {
  const getTypeConfig = (t: string) => {
    switch (t) {
      case 'monitor':
        return { color: '#eab308', bg: 'rgba(234, 179, 8, 0.15)', border: 'rgba(234, 179, 8, 0.3)', label: 'MONITOR' };
      case 'action':
        return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)', label: 'ACTION' };
      default:
        return { color: '#6b7280', bg: 'rgba(107, 114, 128, 0.15)', border: 'rgba(107, 114, 128, 0.3)', label: 'FYI' };
    }
  };

  const config = getTypeConfig(type);

  return (
    <div
      style={{
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '12px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
        <div>
          <div style={{ fontSize: '16px', fontWeight: 600, color: 'white', marginBottom: '4px' }}>
            {flight}
          </div>
          <div style={{ fontSize: '13px', color: '#9ca3af' }}>{route}</div>
        </div>
        <div
          style={{
            padding: '4px 10px',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 600,
            color: config.color
          }}
        >
          {config.label}
        </div>
      </div>
      <div style={{ fontSize: '14px', color: '#d1d5db', marginBottom: '8px' }}>
        <strong>Issue:</strong> {issue}
      </div>
      <div style={{ fontSize: '14px', color: '#d1d5db', marginBottom: '12px' }}>
        <strong>Action Taken:</strong> {actionTaken}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13px',
          color: config.color,
          fontWeight: 500
        }}
      >
        <Clock size={14} />
        <span>Decision needed by {decisionPoint}</span>
      </div>
    </div>
  );
};

// ============ HANDOFF CHECKLIST COMPONENT ============
const HandoffChecklist: React.FC<{
  items: Array<{ label: string; checked: boolean }>;
  onComplete: () => void;
}> = ({ items, onComplete }) => {
  const allChecked = items.every(item => item.checked);

  return (
    <div
      style={{
        backgroundColor: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        padding: '20px'
      }}
    >
      <div style={{ fontSize: '14px', fontWeight: 600, color: '#9ca3af', marginBottom: '16px' }}>
        HANDOFF CHECKLIST
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
        {items.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '4px',
                backgroundColor: item.checked ? '#10b981' : 'rgba(255,255,255,0.1)',
                border: item.checked ? 'none' : '1px solid rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {item.checked && <Check size={14} color="white" />}
            </div>
            <span style={{ fontSize: '14px', color: item.checked ? 'white' : '#9ca3af' }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
      <button
        onClick={onComplete}
        disabled={!allChecked}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: allChecked ? '#10b981' : 'rgba(255,255,255,0.1)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 600,
          cursor: allChecked ? 'pointer' : 'not-allowed',
          opacity: allChecked ? 1 : 0.5,
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          if (allChecked) {
            e.currentTarget.style.backgroundColor = '#059669';
          }
        }}
        onMouseLeave={(e) => {
          if (allChecked) {
            e.currentTarget.style.backgroundColor = '#10b981';
          }
        }}
      >
        {allChecked ? 'Complete Handoff' : 'Complete Checklist First'}
      </button>
    </div>
  );
};

// ============ MAIN SHIFT REPORT COMPONENT ============
const ShiftReport: React.FC<ShiftReportProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'report' | 'handoff'>('report');

  const handleCompleteHandoff = () => {
    alert('Handoff completed! Maria is now in control.');
  };

  return (
    <div
      style={{
        backgroundColor: '#0a0f1a',
        minHeight: '100%',
        padding: '32px',
        color: 'white'
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
          Shift Performance Report
        </h1>
        <div style={{ fontSize: '14px', color: '#9ca3af' }}>
          {data.controller} • {data.date} • {data.shift}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <button
          onClick={() => setActiveTab('report')}
          style={{
            padding: '12px 24px',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'report' ? '2px solid #3b82f6' : '2px solid transparent',
            color: activeTab === 'report' ? '#3b82f6' : '#9ca3af',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Report Card
        </button>
        <button
          onClick={() => setActiveTab('handoff')}
          style={{
            padding: '12px 24px',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'handoff' ? '2px solid #3b82f6' : '2px solid transparent',
            color: activeTab === 'handoff' ? '#3b82f6' : '#9ca3af',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Handoff Briefing
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'report' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Score Ring */}
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '16px', paddingBottom: '16px' }}>
            <ScoreRing score={data.score} />
          </div>

          {/* Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {data.metrics.map((metric, idx) => (
              <MetricCard key={idx} {...metric} />
            ))}
          </div>

          {/* Learning Moment */}
          <LearningMoment {...data.learningMoment} />

          {/* Achievements */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#9ca3af', marginBottom: '16px' }}>
              ACHIEVEMENTS
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
              {data.achievements.map((achievement, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <div style={{ fontSize: '32px' }}>{achievement.icon}</div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'white', marginBottom: '4px' }}>
                      {achievement.label}
                    </div>
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>{achievement.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'handoff' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Handoff Timeline */}
          <HandoffTimeline outgoing={data.handoff.outgoing} incoming={data.handoff.incoming} />

          {/* Open Items */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#9ca3af', marginBottom: '16px' }}>
              OPEN SITUATIONS
            </h3>
            {data.handoff.openItems.map((item, idx) => (
              <OpenItemCard key={idx} {...item} />
            ))}
          </div>

          {/* Watch Items */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#9ca3af', marginBottom: '16px' }}>
              WATCH ITEMS
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data.handoff.watchItems.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  {item.type === 'action' ? (
                    <AlertTriangle size={16} color="#ef4444" />
                  ) : (
                    <Info size={16} color="#6b7280" />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: 'white', marginBottom: '2px' }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: '13px', color: '#9ca3af' }}>{item.detail}</div>
                  </div>
                  {item.due && (
                    <div style={{ fontSize: '12px', color: '#ef4444', fontWeight: 500 }}>
                      Due: {item.due}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Resolved Items */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#9ca3af', marginBottom: '16px' }}>
              RESOLVED THIS SHIFT
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data.handoff.resolvedItems.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: '8px',
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <CheckCircle size={16} color="#10b981" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: 'white', marginBottom: '2px' }}>
                      {item.flight} • {item.action}
                    </div>
                    <div style={{ fontSize: '13px', color: '#9ca3af' }}>
                      {item.time} • {item.outcome}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Handoff Checklist */}
          <HandoffChecklist items={data.handoff.checklist} onComplete={handleCompleteHandoff} />
        </div>
      )}
    </div>
  );
};

export default ShiftReport;
