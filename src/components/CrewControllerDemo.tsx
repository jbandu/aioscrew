import React, { useState, useEffect } from 'react';

interface ChatMessage {
  role: 'ai' | 'user';
  content: string;
}

interface Alert {
  id: number;
  severity: 'high' | 'medium' | 'low';
  flight: string;
  route: string;
  issue: string;
  probability: string;
  eta: string;
}

interface ResolutionOption {
  id: number;
  label: string;
  detail: string;
  tag: string;
  cost: string;
  impact: string;
}

interface CrewMember {
  name: string;
  role: string;
  status: string;
  flight: string;
  dutyRemaining: string;
  location: string;
  alert?: boolean;
}

type Scene = 'overview' | 'disruption' | 'resolution' | 'resolved';

const CrewControllerDemo: React.FC = () => {
  const [currentScene, setCurrentScene] = useState<Scene>('overview');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [actionTaken, setActionTaken] = useState<ResolutionOption | null>(null);

  // Scene data
  const alerts: Alert[] = [
    { id: 1, severity: 'high', flight: 'CM 417', route: 'PTY → BOG', issue: 'Weather delay + crew legality', probability: '78%', eta: '09:47' },
    { id: 2, severity: 'medium', flight: 'CM 234', route: 'PTY → MIA', issue: 'Connecting crew delayed', probability: '62%', eta: '10:15' },
    { id: 3, severity: 'medium', flight: 'CM 891', route: 'PTY → GRU', issue: 'Aircraft swap cascade', probability: '54%', eta: '11:30' },
    { id: 4, severity: 'low', flight: 'CM 156', route: 'PTY → CUN', issue: 'Thin duty time margin', probability: '51%', eta: '14:00' },
  ];

  const resolutionOptions: ResolutionOption[] = [
    { id: 1, label: 'F/O Rivera (Reserve)', detail: 'Available now at PTY, 12-min report time', tag: 'Fastest', cost: '$0', impact: 'None' },
    { id: 2, label: 'F/O Castillo (Inbound)', detail: 'Landing CM 892 in 22 min, legal for extension', tag: 'Requires confirmation', cost: '$0', impact: 'Minimal' },
    { id: 3, label: 'Crew Swap with CM 156', detail: 'Swap with Cancún crew, delays CM 156 by 35 min', tag: 'Both flights complete', cost: '$2.1K', impact: '35 min delay CUN' },
    { id: 4, label: 'Extension Request (Mendez)', detail: 'Union notification required, 67% historical approval', tag: 'Risk', cost: '$0', impact: 'Uncertain' },
    { id: 5, label: 'Cancel CM 417', detail: '143 PAX, 12 connections, rebooking required', tag: 'Last resort', cost: '$47K', impact: 'Severe' },
  ];

  const crewData: CrewMember[] = [
    { name: 'Capt. Rodriguez', role: 'PIC', status: 'On duty', flight: 'CM 417', dutyRemaining: '6h 12m', location: 'PTY' },
    { name: 'F/O Mendez', role: 'SIC', status: 'At risk', flight: 'CM 417', dutyRemaining: '2h 45m', location: 'PTY', alert: true },
    { name: 'F/O Rivera', role: 'Reserve', status: 'Available', flight: '-', dutyRemaining: '10h 00m', location: 'PTY' },
    { name: 'F/O Castillo', role: 'SIC', status: 'Inbound', flight: 'CM 892', dutyRemaining: '8h 30m', location: 'Airborne' },
  ];

  // Initial greeting
  useEffect(() => {
    const greeting: ChatMessage = {
      role: 'ai',
      content: `Good morning, Controller. Today's operation: **187 flights**, **412 crew members** on duty.\n\nI've analyzed weather patterns, crew legalities, and maintenance status. **4 situations need your attention** — potential disruptions I'm tracking proactively.\n\nThe highest risk is **CM 417 to Bogotá** — thunderstorms plus a crew legality squeeze. Want me to walk you through the exposure?`
    };
    setTimeout(() => setChatMessages([greeting]), 500);
  }, []);

  const handleAlertClick = (alert: Alert) => {
    setSelectedAlert(alert);
    setCurrentScene('disruption');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setChatMessages(prev => [...prev, {
        role: 'ai',
        content: `**CM 417 Disruption Analysis**\n\nThunderstorm activity at PTY is causing ground stops. CM 417 is now delayed **90 minutes**.\n\n⚠️ **Critical Issue**: First Officer Mendez's duty time expires at 14:30 — insufficient for the revised departure at 14:15.\n\nI've identified **5 resolution options** ranked by speed and cost. My recommendation: **Option 1 or 2** — both preserve schedule integrity with zero passenger impact.\n\nClick an option to see full details, or ask me anything.`
      }]);
    }, 1500);
  };

  const handleOptionSelect = (option: ResolutionOption) => {
    setActionTaken(option);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      if (option.id === 2) {
        setChatMessages(prev => [...prev, {
          role: 'ai',
          content: `**Initiating Option 2: F/O Castillo**\n\n✓ Sending message to CM 892 cockpit: "Extension request for CM 417 coverage"\n✓ Holding F/O Rivera as backup\n✓ Notifying dispatch of contingency plan\n\nI'll update you when Castillo responds. Estimated response in **8-10 minutes** based on arrival sequence.\n\n*Monitoring 3 other risk situations in background...*`
        }]);
        setCurrentScene('resolution');
      }
    }, 1000);
  };

  const handleResolutionComplete = () => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setChatMessages(prev => [...prev, {
        role: 'ai',
        content: `**✓ Resolution Confirmed**\n\nF/O Castillo accepted CM 417 assignment.\n\n**Actions completed:**\n• Crew assignment updated in AIMS\n• Dispatch notified\n• Duty time adjustment logged\n• CBA compliance documented (Section 4.2.3)\n\nF/O Mendez released — duty time preserved for tomorrow's early departure.\n\n**Cascading impact resolved**: CM 892's late arrival no longer affects crew availability. 3 downstream risks eliminated.\n\n---\n\nReady to review the next situation? CM 234 to Miami has a 62% disruption probability.`
      }]);
      setCurrentScene('resolved');
    }, 2000);
  };

  const formatContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #f1f5f9">$1</strong>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a1628 0%, #1a2942 50%, #0d1929 100%)',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      color: '#e2e8f0',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <header style={{
        padding: '16px 32px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px'
          }}>◎</div>
          <div>
            <div style={{ fontWeight: '600', fontSize: '18px' }}>Crew Controller</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Real-time Operations • Copa Airlines</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '13px', color: '#94a3b8' }}>December 1, 2025 • 06:47 UTC-5</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Panama City (PTY) Hub</div>
          </div>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '600',
            fontSize: '14px'
          }}>IL</div>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Left Panel - AI Chat */}
        <div style={{
          width: '380px',
          borderRight: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(0,0,0,0.15)'
        }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
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
              <span style={{ fontSize: '16px' }}>✦</span>
            </div>
            <div>
              <div style={{ fontWeight: '600', fontSize: '14px' }}>Operations AI</div>
              <div style={{ fontSize: '11px', color: '#10b981' }}>● Active • Monitoring 187 flights</div>
            </div>
          </div>

          {/* Chat Messages */}
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
                background: msg.role === 'ai' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                border: `1px solid ${msg.role === 'ai' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)'}`,
                fontSize: '13px',
                lineHeight: '1.6'
              }}>
                <div style={{ whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{
                  __html: formatContent(msg.content)
                }} />
              </div>
            ))}
            {isTyping && (
              <div style={{
                padding: '14px 16px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                fontSize: '13px'
              }}>
                <span style={{ opacity: 0.7 }}>Analyzing...</span>
                <span style={{
                  display: 'inline-block',
                  animation: 'pulse 1s infinite',
                  marginLeft: '4px'
                }}>●</span>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div style={{
            padding: '16px 20px',
            borderTop: '1px solid rgba(255,255,255,0.08)'
          }}>
            <div style={{
              display: 'flex',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <input
                type="text"
                placeholder="Ask about operations, crew, or flights..."
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  color: '#e2e8f0',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
              <button style={{
                padding: '6px 12px',
                borderRadius: '6px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                border: 'none',
                color: 'white',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}>Send</button>
            </div>
          </div>
        </div>

        {/* Right Panel - Dynamic Context Display */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Scene: Overview */}
          {currentScene === 'overview' && (
            <>
              {/* Stats Bar */}
              <div style={{
                display: 'flex',
                gap: '1px',
                background: 'rgba(255,255,255,0.05)',
                borderBottom: '1px solid rgba(255,255,255,0.08)'
              }}>
                {[
                  { label: 'Active Flights', value: '187', trend: '+12 vs yesterday' },
                  { label: 'Crew On Duty', value: '412', trend: '98.2% availability' },
                  { label: 'Disruption Risk', value: '4', trend: 'situations flagged', alert: true },
                  { label: 'On-Time Performance', value: '94.2%', trend: '↑ 1.3% MTD' }
                ].map((stat, idx) => (
                  <div key={idx} style={{
                    flex: 1,
                    padding: '16px 20px',
                    background: stat.alert ? 'rgba(249, 115, 22, 0.1)' : 'transparent'
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: stat.alert ? '#f97316' : '#f1f5f9' }}>{stat.value}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{stat.label}</div>
                    <div style={{ fontSize: '11px', color: stat.alert ? '#fb923c' : '#475569', marginTop: '2px' }}>{stat.trend}</div>
                  </div>
                ))}
              </div>

              {/* Main Grid */}
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'rgba(255,255,255,0.05)' }}>

                {/* Map Area */}
                <div style={{ background: '#0d1929', padding: '20px', position: 'relative' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '16px', color: '#94a3b8' }}>NETWORK STATUS</div>
                  <div style={{
                    height: '280px',
                    borderRadius: '12px',
                    background: 'linear-gradient(180deg, #0a1525 0%, #132238 100%)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    {/* Simplified map representation */}
                    <svg viewBox="0 0 400 200" style={{ width: '100%', height: '100%' }}>
                      {/* Hub - PTY */}
                      <circle cx="180" cy="120" r="8" fill="#10b981" />
                      <text x="180" y="140" textAnchor="middle" fill="#64748b" fontSize="10">PTY</text>

                      {/* Flight routes */}
                      <line x1="180" y1="120" x2="220" y2="70" stroke="#3b82f6" strokeWidth="1" opacity="0.5" />
                      <line x1="180" y1="120" x2="280" y2="90" stroke="#3b82f6" strokeWidth="1" opacity="0.5" />
                      <line x1="180" y1="120" x2="320" y2="150" stroke="#3b82f6" strokeWidth="1" opacity="0.5" />
                      <line x1="180" y1="120" x2="250" y2="60" stroke="#f97316" strokeWidth="2" strokeDasharray="4" />

                      {/* Destinations */}
                      <circle cx="220" cy="70" r="4" fill="#64748b" />
                      <text x="220" y="60" textAnchor="middle" fill="#64748b" fontSize="8">BOG</text>
                      <circle cx="280" cy="90" r="4" fill="#64748b" />
                      <text x="280" y="80" textAnchor="middle" fill="#64748b" fontSize="8">MIA</text>
                      <circle cx="320" cy="150" r="4" fill="#64748b" />
                      <text x="320" y="165" textAnchor="middle" fill="#64748b" fontSize="8">GRU</text>
                      <circle cx="250" cy="60" r="4" fill="#64748b" />
                      <text x="250" y="50" textAnchor="middle" fill="#64748b" fontSize="8">CUN</text>

                      {/* Alert indicator */}
                      <circle cx="200" cy="95" r="6" fill="#f97316" opacity="0.8">
                        <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
                      </circle>
                      <text x="200" y="85" textAnchor="middle" fill="#f97316" fontSize="8">CM417</text>
                    </svg>

                    {/* Legend */}
                    <div style={{
                      position: 'absolute',
                      bottom: '12px',
                      left: '12px',
                      display: 'flex',
                      gap: '16px',
                      fontSize: '10px',
                      color: '#64748b'
                    }}>
                      <span>● Active</span>
                      <span style={{ color: '#f97316' }}>● At Risk</span>
                    </div>
                  </div>
                </div>

                {/* Alerts Panel */}
                <div style={{ background: '#0d1929', padding: '20px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '16px', color: '#94a3b8' }}>
                    PROACTIVE ALERTS
                    <span style={{
                      marginLeft: '8px',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      background: 'rgba(249, 115, 22, 0.2)',
                      color: '#fb923c',
                      fontSize: '11px'
                    }}>4 flagged</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {alerts.map((alert) => (
                      <div
                        key={alert.id}
                        onClick={() => handleAlertClick(alert)}
                        style={{
                          padding: '14px 16px',
                          borderRadius: '10px',
                          background: alert.severity === 'high' ? 'rgba(249, 115, 22, 0.1)' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${alert.severity === 'high' ? 'rgba(249, 115, 22, 0.3)' : 'rgba(255,255,255,0.08)'}`,
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ fontWeight: '600', fontSize: '14px' }}>{alert.flight}</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{alert.route}</div>
                          </div>
                          <div style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            background: alert.severity === 'high' ? '#f97316' : alert.severity === 'medium' ? '#eab308' : '#64748b',
                            fontSize: '11px',
                            fontWeight: '600',
                            color: alert.severity === 'high' ? 'white' : '#1a1a1a'
                          }}>{alert.probability}</div>
                        </div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>{alert.issue}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Crew Status */}
                <div style={{ background: '#0d1929', padding: '20px', gridColumn: 'span 2' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '16px', color: '#94a3b8' }}>CREW AVAILABILITY MATRIX</div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(6, 1fr)',
                    gap: '8px',
                    fontSize: '12px'
                  }}>
                    <div style={{ color: '#64748b', fontWeight: '600' }}>Name</div>
                    <div style={{ color: '#64748b', fontWeight: '600' }}>Role</div>
                    <div style={{ color: '#64748b', fontWeight: '600' }}>Status</div>
                    <div style={{ color: '#64748b', fontWeight: '600' }}>Flight</div>
                    <div style={{ color: '#64748b', fontWeight: '600' }}>Duty Remaining</div>
                    <div style={{ color: '#64748b', fontWeight: '600' }}>Location</div>
                    {crewData.map((crew, idx) => (
                      <React.Fragment key={idx}>
                        <div style={{ color: crew.alert ? '#f97316' : '#e2e8f0' }}>{crew.name}</div>
                        <div style={{ color: '#94a3b8' }}>{crew.role}</div>
                        <div style={{
                          color: crew.status === 'Available' ? '#10b981' : crew.status === 'At risk' ? '#f97316' : '#94a3b8'
                        }}>{crew.status}</div>
                        <div style={{ color: '#94a3b8' }}>{crew.flight}</div>
                        <div style={{
                          color: crew.alert ? '#f97316' : '#94a3b8',
                          fontWeight: crew.alert ? '600' : '400'
                        }}>{crew.dutyRemaining}</div>
                        <div style={{ color: '#94a3b8' }}>{crew.location}</div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Scene: Disruption Detail */}
          {(currentScene === 'disruption' || currentScene === 'resolution' || currentScene === 'resolved') && selectedAlert && (
            <>
              {/* Flight Header */}
              <div style={{
                padding: '20px 24px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(249, 115, 22, 0.05)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ fontSize: '24px', fontWeight: '700' }}>CM 417</div>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        background: currentScene === 'resolved' ? '#10b981' : '#f97316',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>{currentScene === 'resolved' ? 'RESOLVED' : 'DISRUPTION ACTIVE'}</span>
                    </div>
                    <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>
                      Panama City (PTY) → Bogotá (BOG) • Boeing 737-800 • 143 passengers
                    </div>
                  </div>
                  <button
                    onClick={() => { setCurrentScene('overview'); setSelectedAlert(null); setActionTaken(null); }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.1)',
                      border: 'none',
                      color: '#94a3b8',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >← Back to Overview</button>
                </div>
              </div>

              {/* Disruption Content */}
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'rgba(255,255,255,0.05)', overflow: 'auto' }}>

                {/* Issue Summary */}
                <div style={{ background: '#0d1929', padding: '20px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '16px', color: '#94a3b8' }}>DISRUPTION SUMMARY</div>
                  <div style={{
                    padding: '16px',
                    borderRadius: '10px',
                    background: 'rgba(249, 115, 22, 0.1)',
                    border: '1px solid rgba(249, 115, 22, 0.2)'
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#fb923c' }}>Primary Issue: Crew Legality Violation</div>
                    <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '8px', lineHeight: '1.6' }}>
                      Weather delay of 90 minutes will cause F/O Mendez to exceed duty time limits before revised departure.
                      CBA Section 4.2.1 prohibits operations beyond 14-hour duty period.
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '12px',
                      marginTop: '16px'
                    }}>
                      <div style={{ padding: '10px', borderRadius: '6px', background: 'rgba(0,0,0,0.2)' }}>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Original Departure</div>
                        <div style={{ fontSize: '16px', fontWeight: '600', marginTop: '4px' }}>12:45 UTC</div>
                      </div>
                      <div style={{ padding: '10px', borderRadius: '6px', background: 'rgba(0,0,0,0.2)' }}>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Revised Departure</div>
                        <div style={{ fontSize: '16px', fontWeight: '600', marginTop: '4px', color: '#f97316' }}>14:15 UTC</div>
                      </div>
                      <div style={{ padding: '10px', borderRadius: '6px', background: 'rgba(0,0,0,0.2)' }}>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Mendez Duty Limit</div>
                        <div style={{ fontSize: '16px', fontWeight: '600', marginTop: '4px', color: '#ef4444' }}>14:30 UTC</div>
                      </div>
                      <div style={{ padding: '10px', borderRadius: '6px', background: 'rgba(0,0,0,0.2)' }}>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Gap</div>
                        <div style={{ fontSize: '16px', fontWeight: '600', marginTop: '4px', color: '#ef4444' }}>-45 min</div>
                      </div>
                    </div>
                  </div>

                  {/* Affected Crew */}
                  <div style={{ marginTop: '20px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px', color: '#94a3b8' }}>ASSIGNED CREW</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{
                        padding: '12px',
                        borderRadius: '8px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '13px' }}>Capt. Rodriguez</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>PIC • 6h 12m remaining</div>
                        </div>
                        <span style={{ padding: '4px 10px', borderRadius: '10px', background: '#10b981', fontSize: '11px', fontWeight: '600' }}>OK</span>
                      </div>
                      <div style={{
                        padding: '12px',
                        borderRadius: '8px',
                        background: 'rgba(249, 115, 22, 0.1)',
                        border: '1px solid rgba(249, 115, 22, 0.3)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '13px', color: '#fb923c' }}>F/O Mendez</div>
                          <div style={{ fontSize: '12px', color: '#fb923c' }}>SIC • 2h 45m remaining ⚠️</div>
                        </div>
                        <span style={{ padding: '4px 10px', borderRadius: '10px', background: '#f97316', fontSize: '11px', fontWeight: '600' }}>AT RISK</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resolution Options */}
                <div style={{ background: '#0d1929', padding: '20px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '16px', color: '#94a3b8' }}>
                    {currentScene === 'resolved' ? 'RESOLUTION APPLIED' : 'AI-GENERATED OPTIONS'}
                    {currentScene !== 'resolved' && <span style={{ color: '#10b981', fontWeight: '400', marginLeft: '8px' }}>Ranked by impact</span>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {resolutionOptions.map((option, idx) => (
                      <div
                        key={option.id}
                        onClick={() => !actionTaken && handleOptionSelect(option)}
                        style={{
                          padding: '14px 16px',
                          borderRadius: '10px',
                          background: actionTaken?.id === option.id ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${actionTaken?.id === option.id ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255,255,255,0.08)'}`,
                          cursor: actionTaken ? 'default' : 'pointer',
                          opacity: actionTaken && actionTaken.id !== option.id ? 0.4 : 1,
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                background: idx < 2 ? '#10b981' : idx < 4 ? '#eab308' : '#ef4444',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '11px',
                                fontWeight: '700',
                                color: idx < 2 ? 'white' : '#1a1a1a'
                              }}>{idx + 1}</span>
                              <span style={{ fontWeight: '600', fontSize: '13px' }}>{option.label}</span>
                              {actionTaken?.id === option.id && <span style={{ color: '#10b981', fontSize: '12px' }}>✓ Selected</span>}
                            </div>
                            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px', marginLeft: '28px' }}>{option.detail}</div>
                          </div>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: 'rgba(255,255,255,0.1)',
                            fontSize: '10px',
                            color: '#94a3b8'
                          }}>{option.tag}</span>
                        </div>
                        <div style={{
                          display: 'flex',
                          gap: '16px',
                          marginTop: '10px',
                          marginLeft: '28px',
                          fontSize: '11px'
                        }}>
                          <span style={{ color: '#64748b' }}>Cost: <span style={{ color: '#e2e8f0' }}>{option.cost}</span></span>
                          <span style={{ color: '#64748b' }}>Impact: <span style={{ color: '#e2e8f0' }}>{option.impact}</span></span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {currentScene === 'resolution' && (
                    <button
                      onClick={handleResolutionComplete}
                      style={{
                        marginTop: '20px',
                        width: '100%',
                        padding: '14px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        border: 'none',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >Simulate: Castillo Confirms Acceptance →</button>
                  )}

                  {currentScene === 'resolved' && (
                    <div style={{
                      marginTop: '20px',
                      padding: '16px',
                      borderRadius: '10px',
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.3)'
                    }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#10b981' }}>✓ Disruption Resolved</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>
                        CM 417 will depart at 14:15 with Capt. Rodriguez and F/O Castillo. All downstream impacts cleared.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
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

export default CrewControllerDemo;
