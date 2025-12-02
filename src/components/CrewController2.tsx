import React, { useState } from 'react';
import {
  weatherExposureData,
  fatigueRiskData,
  cancellationImpactData,
  reserveCoverageData,
  dayComparisonData,
  rootCauseData,
  suggestedQuestions
} from '../data/crewController2MockData';

type VisualizationType = 'WeatherExposure' | 'FatigueHeatmap' | 'PassengerImpact' | 'ReserveCoverage' | 'DayComparison' | 'RootCauseTree' | null;

interface ChatMessage {
  role: 'ai' | 'user';
  content: string;
}

const CrewController2: React.FC = () => {
  const [activeVisualization, setActiveVisualization] = useState<VisualizationType>(null);
  const [dataMode, setDataMode] = useState<'mock' | 'live'>('mock');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'ai',
      content: 'Good morning, Controller. I\'m monitoring **187 flights** and **412 crew members** across your network.\n\nSelect a question below to explore specific operational insights, or ask me anything about your operation.'
    }
  ]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Handle data mode changes
  React.useEffect(() => {
    if (dataMode === 'live') {
      setChatMessages(prev => [...prev, {
        role: 'ai',
        content: '**Switched to Live Data Mode**\n\nNow connecting to PostgreSQL database on Railway...\n\n⚠️ Note: Backend API integration is in progress. Currently showing mock data with database schema ready for:\n\n• Weather exposure queries\n• Crew duty time tracking\n• Disruption analysis\n• Reserve crew availability\n• Historical comparisons\n• Root cause analytics\n\nSee `CREW_CONTROLLER_2_DATABASE_MAPPING.md` for details.'
      }]);
    } else {
      // Reset to initial greeting when switching back to mock
      if (chatMessages.length > 1) {
        setChatMessages([{
          role: 'ai',
          content: 'Good morning, Controller. I\'m monitoring **187 flights** and **412 crew members** across your network.\n\nSelect a question below to explore specific operational insights, or ask me anything about your operation.'
        }]);
        setActiveVisualization(null);
      }
    }
  }, [dataMode]);

  const handleQuestionClick = (question: typeof suggestedQuestions[0]) => {
    // Add user question to chat
    setChatMessages(prev => [...prev, { role: 'user', content: question.full }]);

    setIsAnalyzing(true);

    // Simulate AI analysis
    setTimeout(() => {
      setIsAnalyzing(false);

      // Add AI response based on scenario
      const aiResponse = getAIResponse(question.id);
      setChatMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);

      // Show visualization
      setActiveVisualization(question.visualization as VisualizationType);
    }, 1500);
  };

  const getAIResponse = (questionId: string): string => {
    const responses: Record<string, string> = {
      weather: `**Weather Exposure Analysis**\n\nCurrent thunderstorm activity at PTY poses **78% disruption probability** for afternoon operations.\n\n**Critical findings:**\n• **23 flights** at risk of delays >30 min\n• **67 crew members** approaching legality limits\n• **$340K** estimated exposure\n\nRecommendation: Pre-position 3 reserve crew and delay non-critical maintenance.`,

      fatigue: `**Crew Fatigue Risk Assessment**\n\n**4 crew members** become critical if any delay exceeds 30 minutes:\n\n• F/O Mendez (CM 417) - 2.75h remaining\n• Capt. Torres (CM 234) - 4.5h remaining\n• F/O Chen (CM 891) - 5h remaining\n• Capt. Williams (CM 156) - 6h remaining\n\nRecommendation: Activate reserve crew for high-risk flights.`,

      cancel: `**CM 417 Cancellation Impact**\n\n**143 passengers** would be affected:\n• 89 local BOG (rebook next flight)\n• 24 would miss connections\n\n**Financial impact: $47,000**\n\n**Alternative:** 2-hour delay costs only **$3,200** with zero missed connections.\n\nRecommendation: Delay, don't cancel.`,

      reserve: `**Reserve Crew Coverage at PTY**\n\n**5 reserves available:**\n• 3 can respond within 30 minutes\n• Full B737/737 MAX coverage\n• Limited B787 coverage (1 captain)\n\n**Fastest response:** F/O Rivera (12 min) and Capt. Lopez (8 min) at airport now.\n\nRecommendation: Keep airport-based reserves on standby for afternoon ops.`,

      compare: `**Today vs. Last Tuesday Comparison**\n\n**18% better performance overall:**\n• Delays: 7 vs 12 (↓42%)\n• Crew swaps: 3 vs 8 (↓63%)\n• Cancellations: 0 vs 2 (↓100%)\n• Cost: $43K vs $127K (↓66%)\n\n**Key difference:** Proactive reserve positioning at 06:00 prevented 3 crew swaps.\n\nRecommendation: Continue early positioning on weather-risk days.`,

      rootcause: `**Miami Delays Root Cause Analysis**\n\n**14 delays last week** traced to 3 root causes:\n• 40% Weather (ground stops, de-icing)\n• 35% Crew cascade (PTY delays)\n• 25% Maintenance (AOG parts)\n\n**Pattern detected:** Thursday MIA ops have 2.3x delay rate due to insufficient reserve coverage.\n\nRecommendation: Pre-position 1 reserve at MIA on Thursdays. Est. savings: **$45K/month**.`
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
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              color: 'white'
            }}>✦</div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '18px', color: '#1e293b' }}>Crew Controller 2.0</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>AI-Powered Operations Intelligence • Copa Airlines</div>
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
              color: dataMode === 'mock' ? '#3b82f6' : '#94a3b8'
            }}>Mock Data</span>
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
                transition: 'background 0.2s'
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
            }}>Live Data</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Left Panel - AI Chat */}
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
            <div style={{
              padding: '4px 8px',
              borderRadius: '6px',
              background: dataMode === 'live' ? '#dcfce7' : '#dbeafe',
              border: `1px solid ${dataMode === 'live' ? '#86efac' : '#93c5fd'}`,
              fontSize: '10px',
              fontWeight: '600',
              color: dataMode === 'live' ? '#166534' : '#1e40af'
            }}>
              {dataMode === 'live' ? '🔴 LIVE' : '📋 MOCK'}
            </div>
          </div>

          {/* Suggested Questions - NOW AT TOP */}
          <div style={{
            padding: '20px',
            borderBottom: '1px solid rgba(0,0,0,0.1)',
            background: '#f8fafc'
          }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '12px' }}>
              SUGGESTED QUESTIONS
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px'
            }}>
              {suggestedQuestions.map((q) => (
                <button
                  key={q.id}
                  onClick={() => handleQuestionClick(q)}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    fontSize: '13px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ fontSize: '16px', marginBottom: '4px' }}>{q.icon}</div>
                  <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '12px' }}>{q.short}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat History - NOW BELOW QUESTIONS */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '8px' }}>
              CONVERSATION HISTORY
            </div>
            {chatMessages.map((msg, idx) => (
              <div key={idx} style={{
                padding: '14px 16px',
                borderRadius: '12px',
                background: msg.role === 'ai' ? '#f1f5f9' : '#dbeafe',
                border: `1px solid ${msg.role === 'ai' ? '#e2e8f0' : '#93c5fd'}`,
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
                <span style={{ opacity: 0.7 }}>Analyzing data...</span>
                <span style={{
                  display: 'inline-block',
                  animation: 'pulse 1s infinite',
                  marginLeft: '4px'
                }}>●</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Dynamic Visualization */}
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
                  Select a question to visualize insights
                </div>
                <div style={{ fontSize: '14px' }}>
                  Click any suggested question to see dynamic visualizations and AI analysis
                </div>
              </div>
            </div>
          )}

          {activeVisualization === 'WeatherExposure' && (
            <WeatherExposureViz data={weatherExposureData} />
          )}

          {activeVisualization === 'FatigueHeatmap' && (
            <FatigueHeatmapViz data={fatigueRiskData} />
          )}

          {activeVisualization === 'PassengerImpact' && (
            <PassengerImpactViz data={cancellationImpactData} />
          )}

          {activeVisualization === 'ReserveCoverage' && (
            <ReserveCoverageViz data={reserveCoverageData} />
          )}

          {activeVisualization === 'DayComparison' && (
            <DayComparisonViz data={dayComparisonData} />
          )}

          {activeVisualization === 'RootCauseTree' && (
            <RootCauseTreeViz data={rootCauseData} />
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

// Visualization Components

const WeatherExposureViz: React.FC<{ data: typeof weatherExposureData }> = ({ data }) => {
  const totalExposure = Object.values(data.financialExposure).reduce((a, b) => a + b, 0);

  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#1e293b' }}>
        Weather Exposure Analysis
      </h2>

      {/* Exposure Counters */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div style={{
          padding: '20px',
          borderRadius: '12px',
          background: 'white',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#ef4444', marginBottom: '4px' }}>
            {data.affectedFlights.length}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>FLIGHTS AT RISK</div>
        </div>
        <div style={{
          padding: '20px',
          borderRadius: '12px',
          background: 'white',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#f97316', marginBottom: '4px' }}>
            {data.crewAtRisk.length}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>CREW AFFECTED</div>
        </div>
        <div style={{
          padding: '20px',
          borderRadius: '12px',
          background: 'white',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#dc2626', marginBottom: '4px' }}>
            ${(totalExposure / 1000).toFixed0}K
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>POTENTIAL EXPOSURE</div>
        </div>
      </div>

      {/* Simplified Map Visualization */}
      <div style={{
        padding: '24px',
        borderRadius: '12px',
        background: 'white',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '24px'
      }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#64748b' }}>
          NETWORK IMPACT MAP
        </h3>
        <svg viewBox="0 0 800 400" style={{ width: '100%', height: '300px' }}>
          {/* Hub */}
          <circle cx="400" cy="200" r="20" fill="#ef4444" opacity="0.8">
            <animate attributeName="r" values="20;30;20" dur="2s" repeatCount="indefinite" />
          </circle>
          <text x="400" y="235" textAnchor="middle" fill="#1e293b" fontSize="14" fontWeight="600">PTY</text>

          {/* Weather overlay */}
          <circle cx="400" cy="200" r="60" fill="#f97316" opacity="0.2">
            <animate attributeName="r" values="60;80;60" dur="3s" repeatCount="indefinite" />
          </circle>

          {/* Flight routes */}
          {data.affectedFlights.map((flight, idx) => {
            const angle = (idx / data.affectedFlights.length) * 2 * Math.PI;
            const x = 400 + Math.cos(angle) * 250;
            const y = 200 + Math.sin(angle) * 150;
            const color = flight.risk === 'high' ? '#ef4444' : flight.risk === 'medium' ? '#f97316' : '#fbbf24';

            return (
              <g key={flight.flight}>
                <line
                  x1="400"
                  y1="200"
                  x2={x}
                  y2={y}
                  stroke={color}
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  opacity="0.6"
                />
                <circle cx={x} cy={y} r="8" fill={color} />
                <text x={x} y={y - 15} textAnchor="middle" fill="#1e293b" fontSize="11">
                  {flight.dest}
                </text>
                <text x={x} y={y + 25} textAnchor="middle" fill="#64748b" fontSize="10">
                  {(flight.delayProb * 100).toFixed(0)}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Crew at Risk */}
      <div style={{
        padding: '24px',
        borderRadius: '12px',
        background: 'white',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#64748b' }}>
          CREW LEGALITY AT RISK
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {data.crewAtRisk.map((crew) => (
            <div key={crew.name} style={{
              padding: '12px 16px',
              borderRadius: '8px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontWeight: '600', fontSize: '13px', color: '#1e293b' }}>{crew.name}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{crew.flight}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#ef4444' }}>
                  {crew.hoursRemaining.toFixed(1)}h
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>remaining</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const FatigueHeatmapViz: React.FC<{ data: typeof fatigueRiskData }> = ({ data }) => {
  const getRiskColor = (hours: number) => {
    if (hours < 1) return '#ef4444';
    if (hours < 2) return '#f97316';
    if (hours < 4) return '#fbbf24';
    return '#10b981';
  };

  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#1e293b' }}>
        Crew Fatigue Risk Heatmap
      </h2>

      {/* Crew Risk Grid */}
      <div style={{
        padding: '24px',
        borderRadius: '12px',
        background: 'white',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '24px'
      }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#64748b' }}>
          DUTY TIME REMAINING
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {data.crewMembers.map((crew) => (
            <div key={crew.id} style={{
              display: 'grid',
              gridTemplateColumns: '200px 1fr 120px',
              gap: '16px',
              alignItems: 'center',
              padding: '12px',
              borderRadius: '8px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0'
            }}>
              <div>
                <div style={{ fontWeight: '600', fontSize: '13px', color: '#1e293b' }}>{crew.name}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{crew.role} • {crew.currentFlight}</div>
              </div>
              <div style={{ position: 'relative', height: '24px', background: '#f1f5f9', borderRadius: '4px' }}>
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  height: '100%',
                  width: `${(crew.hoursRemaining / 14) * 100}%`,
                  background: getRiskColor(crew.hoursRemaining),
                  borderRadius: '4px',
                  transition: 'width 0.5s'
                }} />
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: getRiskColor(crew.hoursRemaining) }}>
                  {crew.hoursRemaining.toFixed(1)}h
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  {crew.flightsAffectedIfTimeout} flights affected
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Critical Alerts */}
      <div style={{
        padding: '20px',
        borderRadius: '12px',
        background: '#fef2f2',
        border: '1px solid #fecaca'
      }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#ef4444' }}>
          ⚠️ CRITICAL BUFFER ZONE
        </h3>
        <div style={{ fontSize: '13px', color: '#1e293b', marginBottom: '12px' }}>
          These crew members become at-risk with any delay:
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {data.bufferZone.map((item) => (
            <div key={item.name} style={{
              padding: '10px 12px',
              background: 'white',
              borderRadius: '6px',
              fontSize: '12px',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontWeight: '600', color: '#1e293b' }}>{item.name}</span>
              <span style={{ color: '#64748b' }}>{item.becomesRiskAt}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const PassengerImpactViz: React.FC<{ data: typeof cancellationImpactData }> = ({ data }) => {
  const totalCost = Object.values(data.costs).reduce((a, b) => a + b, 0);

  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#1e293b' }}>
        Cancellation Passenger Impact - {data.flight}
      </h2>

      {/* Passenger Flow Sankey */}
      <div style={{
        padding: '24px',
        borderRadius: '12px',
        background: 'white',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '24px'
      }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#64748b' }}>
          PASSENGER FLOW ANALYSIS
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {data.passengerFlows.map((flow, idx) => {
            const percentage = (flow.count / data.totalPassengers) * 100;
            const severityColor = flow.severity === 'high' ? '#ef4444' : flow.severity === 'medium' ? '#f97316' : '#10b981';

            return (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px' }}>
                  <span style={{ fontWeight: '600', color: '#1e293b' }}>{flow.segment}</span>
                  <span style={{ color: '#64748b' }}>{flow.count} passengers</span>
                </div>
                <div style={{ position: 'relative', height: '32px', background: '#f1f5f9', borderRadius: '6px' }}>
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: '100%',
                    width: `${percentage}%`,
                    background: severityColor,
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 12px',
                    color: 'white',
                    fontSize: '11px',
                    fontWeight: '600'
                  }}>
                    {flow.missConnection > 0 && `${flow.missConnection} miss connection`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cost Breakdown */}
      <div style={{
        padding: '24px',
        borderRadius: '12px',
        background: 'white',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '24px'
      }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#64748b' }}>
          COST BREAKDOWN
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {Object.entries(data.costs).map(([key, value]) => (
            <div key={key} style={{
              padding: '16px',
              borderRadius: '8px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>
                ${(value / 1000).toFixed(1)}K
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'capitalize' }}>
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </div>
            </div>
          ))}
        </div>
        <div style={{
          marginTop: '16px',
          padding: '16px',
          borderRadius: '8px',
          background: '#fef2f2',
          border: '1px solid #fecaca'
        }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#ef4444', marginBottom: '4px' }}>
            ${(totalCost / 1000).toFixed(1)}K
          </div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>Total Cancellation Cost</div>
        </div>
      </div>

      {/* Alternative Comparison */}
      <div style={{
        padding: '24px',
        borderRadius: '12px',
        background: 'white',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#64748b' }}>
          ALTERNATIVE COMPARISON
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {data.alternatives.map((alt) => (
            <div key={alt.option} style={{
              padding: '20px',
              borderRadius: '8px',
              background: alt.option === 'Delay 2 hours' ? '#f0fdf4' : '#fef2f2',
              border: `2px solid ${alt.option === 'Delay 2 hours' ? '#10b981' : '#ef4444'}`
            }}>
              <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px', color: '#1e293b' }}>
                {alt.option}
              </div>
              <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: alt.option === 'Delay 2 hours' ? '#10b981' : '#ef4444' }}>
                ${(alt.totalCost / 1000).toFixed(1)}K
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                {alt.missedConnections} missed connections
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Satisfaction: {alt.passengerSatisfaction}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ReserveCoverageViz: React.FC<{ data: typeof reserveCoverageData }> = ({ data }) => {
  const getLocationIcon = (type: string) => {
    if (type === 'airport') return '🏢';
    if (type === 'hotel') return '🏨';
    return '🏠';
  };

  const getStatusColor = (responseTime: number) => {
    if (responseTime <= 15) return '#10b981';
    if (responseTime <= 30) return '#fbbf24';
    return '#f97316';
  };

  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#1e293b' }}>
        Reserve Crew Coverage - {data.airport.code}
      </h2>

      {/* Coverage Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div style={{
          padding: '20px',
          borderRadius: '12px',
          background: 'white',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#3b82f6', marginBottom: '4px' }}>
            {data.coverageSummary.total}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>RESERVES AVAILABLE</div>
        </div>
        <div style={{
          padding: '20px',
          borderRadius: '12px',
          background: 'white',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981', marginBottom: '4px' }}>
            {data.coverageSummary.within30min}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>WITHIN 30 MIN</div>
        </div>
        <div style={{
          padding: '20px',
          borderRadius: '12px',
          background: 'white',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>
            B737: Good
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>AIRCRAFT COVERAGE</div>
        </div>
      </div>

      {/* Simplified Map */}
      <div style={{
        padding: '24px',
        borderRadius: '12px',
        background: 'white',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '24px'
      }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#64748b' }}>
          RESPONSE TIME MAP
        </h3>
        <svg viewBox="0 0 400 300" style={{ width: '100%', height: '250px' }}>
          {/* Response zones */}
          <circle cx="200" cy="150" r="120" fill="#10b981" opacity="0.1" />
          <circle cx="200" cy="150" r="80" fill="#fbbf24" opacity="0.1" />
          <circle cx="200" cy="150" r="40" fill="#10b981" opacity="0.2" />

          {/* Airport */}
          <circle cx="200" cy="150" r="15" fill="#3b82f6" />
          <text x="200" y="185" textAnchor="middle" fill="#1e293b" fontSize="12" fontWeight="600">
            {data.airport.code}
          </text>

          {/* Reserve locations */}
          {data.reserves.slice(0, 5).map((reserve, idx) => {
            const angle = (idx / 5) * 2 * Math.PI;
            const distance = reserve.locationType === 'airport' ? 20 : reserve.locationType === 'hotel' ? 60 : 100;
            const x = 200 + Math.cos(angle) * distance;
            const y = 150 + Math.sin(angle) * distance;

            return (
              <g key={reserve.id}>
                <circle cx={x} cy={y} r="8" fill={getStatusColor(reserve.responseTime)} />
                <text x={x} y={y - 15} textAnchor="middle" fill="#1e293b" fontSize="10">
                  {reserve.name.split(' ')[1]}
                </text>
              </g>
            );
          })}

          {/* Legend */}
          <text x="20" y="20" fill="#64748b" fontSize="10">● 15min</text>
          <text x="20" y="35" fill="#64748b" fontSize="10">● 30min</text>
          <text x="20" y="50" fill="#64748b" fontSize="10">● 45min+</text>
        </svg>
      </div>

      {/* Reserve List */}
      <div style={{
        padding: '24px',
        borderRadius: '12px',
        background: 'white',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#64748b' }}>
          RANKED RESERVE LIST
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {data.reserves.map((reserve) => (
            <div key={reserve.id} style={{
              padding: '16px',
              borderRadius: '8px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              display: 'grid',
              gridTemplateColumns: '40px 1fr 100px 120px',
              gap: '16px',
              alignItems: 'center'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '18px',
                fontWeight: '600'
              }}>
                {reserve.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '13px', color: '#1e293b' }}>{reserve.name}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  {getLocationIcon(reserve.locationType)} {reserve.location}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                  {reserve.certifications.join(', ')}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: getStatusColor(reserve.responseTime),
                  marginBottom: '2px'
                }}>
                  {reserve.responseTime}m
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>response</div>
              </div>
              <button style={{
                padding: '8px 16px',
                borderRadius: '6px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}>
                Quick Assign
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const DayComparisonViz: React.FC<{ data: typeof dayComparisonData }> = ({ data }) => {
  const deltaPercent = Math.abs(data.overallDelta);
  const isImproved = data.overallDelta < 0;

  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#1e293b' }}>
        Day Comparison Analytics
      </h2>

      {/* Overall Performance */}
      <div style={{
        padding: '24px',
        borderRadius: '12px',
        background: isImproved ? '#f0fdf4' : '#fef2f2',
        border: `2px solid ${isImproved ? '#10b981' : '#ef4444'}`,
        marginBottom: '24px',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '48px',
          fontWeight: '700',
          color: isImproved ? '#10b981' : '#ef4444',
          marginBottom: '8px'
        }}>
          {isImproved ? '↓' : '↑'} {deltaPercent}%
        </div>
        <div style={{ fontSize: '16px', color: '#1e293b', fontWeight: '600' }}>
          {isImproved ? 'Better' : 'Worse'} than {data.comparison.label}
        </div>
      </div>

      {/* Metrics Comparison */}
      <div style={{
        padding: '24px',
        borderRadius: '12px',
        background: 'white',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '24px'
      }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#64748b' }}>
          METRICS COMPARISON
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '12px', fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                Metric
              </th>
              <th style={{ textAlign: 'center', padding: '12px', fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                {data.comparison.label}
              </th>
              <th style={{ textAlign: 'center', padding: '12px', fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                Today
              </th>
              <th style={{ textAlign: 'center', padding: '12px', fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                Delta
              </th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderTop: '1px solid #e2e8f0' }}>
              <td style={{ padding: '12px', fontSize: '13px', color: '#1e293b' }}>Delays &gt;30min</td>
              <td style={{ padding: '12px', fontSize: '14px', fontWeight: '600', color: '#1e293b', textAlign: 'center' }}>
                {data.comparison.metrics.delaysOver30}
              </td>
              <td style={{ padding: '12px', fontSize: '14px', fontWeight: '600', color: '#1e293b', textAlign: 'center' }}>
                {data.today.metrics.delaysOver30}
              </td>
              <td style={{ padding: '12px', fontSize: '13px', fontWeight: '600', color: '#10b981', textAlign: 'center' }}>
                ↓ 42%
              </td>
            </tr>
            <tr style={{ borderTop: '1px solid #e2e8f0' }}>
              <td style={{ padding: '12px', fontSize: '13px', color: '#1e293b' }}>Crew swaps</td>
              <td style={{ padding: '12px', fontSize: '14px', fontWeight: '600', color: '#1e293b', textAlign: 'center' }}>
                {data.comparison.metrics.crewSwaps}
              </td>
              <td style={{ padding: '12px', fontSize: '14px', fontWeight: '600', color: '#1e293b', textAlign: 'center' }}>
                {data.today.metrics.crewSwaps}
              </td>
              <td style={{ padding: '12px', fontSize: '13px', fontWeight: '600', color: '#10b981', textAlign: 'center' }}>
                ↓ 63%
              </td>
            </tr>
            <tr style={{ borderTop: '1px solid #e2e8f0' }}>
              <td style={{ padding: '12px', fontSize: '13px', color: '#1e293b' }}>Cancellations</td>
              <td style={{ padding: '12px', fontSize: '14px', fontWeight: '600', color: '#1e293b', textAlign: 'center' }}>
                {data.comparison.metrics.cancellations}
              </td>
              <td style={{ padding: '12px', fontSize: '14px', fontWeight: '600', color: '#1e293b', textAlign: 'center' }}>
                {data.today.metrics.cancellations}
              </td>
              <td style={{ padding: '12px', fontSize: '13px', fontWeight: '600', color: '#10b981', textAlign: 'center' }}>
                ↓ 100%
              </td>
            </tr>
            <tr style={{ borderTop: '1px solid #e2e8f0' }}>
              <td style={{ padding: '12px', fontSize: '13px', color: '#1e293b' }}>Cost impact</td>
              <td style={{ padding: '12px', fontSize: '14px', fontWeight: '600', color: '#1e293b', textAlign: 'center' }}>
                ${(data.comparison.metrics.costImpact / 1000).toFixed(0)}K
              </td>
              <td style={{ padding: '12px', fontSize: '14px', fontWeight: '600', color: '#1e293b', textAlign: 'center' }}>
                ${(data.today.metrics.costImpact / 1000).toFixed(0)}K
              </td>
              <td style={{ padding: '12px', fontSize: '13px', fontWeight: '600', color: '#10b981', textAlign: 'center' }}>
                ↓ 66%
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* AI Insights */}
      <div style={{
        padding: '24px',
        borderRadius: '12px',
        background: 'white',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#64748b' }}>
          AI INSIGHTS
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {data.insights.map((insight, idx) => (
            <div key={idx} style={{
              padding: '14px 16px',
              borderRadius: '8px',
              background: insight.type === 'positive' ? '#f0fdf4' : '#eff6ff',
              border: `1px solid ${insight.type === 'positive' ? '#86efac' : '#93c5fd'}`,
              fontSize: '13px',
              color: '#1e293b'
            }}>
              {insight.type === 'positive' && '✓ '}
              {insight.type === 'recommendation' && '💡 '}
              {insight.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const RootCauseTreeViz: React.FC<{ data: typeof rootCauseData }> = ({ data }) => {
  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#1e293b' }}>
        Root Cause Analysis - {data.station}
      </h2>

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
        <div style={{ fontSize: '14px', color: '#64748b' }}>
          Total Delays • {data.period}
        </div>
      </div>

      {/* Root Causes Sunburst */}
      <div style={{
        padding: '24px',
        borderRadius: '12px',
        background: 'white',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '24px'
      }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#64748b' }}>
          ROOT CAUSE BREAKDOWN
        </h3>
        {data.rootCauses.map((cause, idx) => {
          const colors = ['#ef4444', '#f97316', '#fbbf24'];

          return (
            <div key={idx} style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>{cause.cause}</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: colors[idx] }}>{cause.percentage}%</span>
              </div>
              <div style={{ position: 'relative', height: '40px', background: '#f1f5f9', borderRadius: '6px', marginBottom: '12px' }}>
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  height: '100%',
                  width: `${cause.percentage}%`,
                  background: colors[idx],
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 12px',
                  color: 'white',
                  fontSize: '13px',
                  fontWeight: '600'
                }}>
                  {cause.count.toFixed(1)} delays
                </div>
              </div>
              <div style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {cause.subCauses.map((sub, sidx) => (
                  <div key={sidx} style={{
                    fontSize: '12px',
                    color: '#64748b',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <span>→ {sub.name}</span>
                    <span>{sub.count} delays</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cascade Timeline */}
      <div style={{
        padding: '24px',
        borderRadius: '12px',
        background: 'white',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '24px'
      }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#64748b' }}>
          CASCADE EXAMPLE
        </h3>
        <div style={{ position: 'relative', paddingLeft: '40px' }}>
          {/* Root event */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              position: 'absolute',
              left: '10px',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: '#ef4444',
              border: '3px solid white',
              boxShadow: '0 0 0 1px #e2e8f0'
            }} />
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>
              {data.cascadeExample.rootEvent.time}
            </div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>
              {data.cascadeExample.rootEvent.flight}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              {data.cascadeExample.rootEvent.cause}
            </div>
          </div>

          {/* Cascade events */}
          {data.cascadeExample.cascade.map((event, idx) => (
            <div key={idx} style={{ marginBottom: '20px' }}>
              <div style={{
                position: 'absolute',
                left: '0',
                width: '2px',
                height: '20px',
                background: '#e2e8f0',
                marginLeft: '19px',
                marginTop: '-20px'
              }} />
              <div style={{
                position: 'absolute',
                left: '10px',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: idx === data.cascadeExample.cascade.length - 1 ? '#10b981' : '#f97316',
                border: '3px solid white',
                boxShadow: '0 0 0 1px #e2e8f0'
              }} />
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>
                {event.time}
              </div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>
                {event.flight || event.summary}
              </div>
              {event.impact && (
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  {event.impact}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recommendation */}
      <div style={{
        padding: '24px',
        borderRadius: '12px',
        background: '#eff6ff',
        border: '1px solid #93c5fd'
      }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#3b82f6' }}>
          💡 AI RECOMMENDATION
        </h3>
        <div style={{ marginBottom: '12px', fontSize: '13px', color: '#1e293b' }}>
          <strong>Pattern detected:</strong> {data.recommendation.pattern}
        </div>
        <div style={{ marginBottom: '12px', fontSize: '13px', color: '#1e293b' }}>
          <strong>Root cause:</strong> {data.recommendation.rootCause}
        </div>
        <div style={{
          padding: '16px',
          borderRadius: '8px',
          background: 'white',
          marginBottom: '12px'
        }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
            {data.recommendation.action}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            Estimated impact: Prevent {data.recommendation.estimatedSavings.delays} delays,
            save ${(data.recommendation.estimatedSavings.cost / 1000).toFixed(0)}K/month
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrewController2;
