// Mock data for Crew Controller 2.0 scenarios

export const weatherExposureData = {
  hub: { lat: 9.0714, lng: -79.3835, name: 'PTY' },
  weatherSeverity: 'deteriorating',
  affectedFlights: [
    { flight: 'CM 417', dest: 'BOG', destCoords: [4.7110, -74.0721], risk: 'high', delayProb: 0.78 },
    { flight: 'CM 234', dest: 'MIA', destCoords: [25.7617, -80.1918], risk: 'medium', delayProb: 0.62 },
    { flight: 'CM 891', dest: 'GRU', destCoords: [-23.5558, -46.6396], risk: 'medium', delayProb: 0.54 },
    { flight: 'CM 156', dest: 'CUN', destCoords: [21.0365, -86.8771], risk: 'low', delayProb: 0.42 },
    { flight: 'CM 523', dest: 'LIM', destCoords: [-12.0219, -77.1143], risk: 'medium', delayProb: 0.58 },
  ],
  crewAtRisk: [
    { name: 'F/O Mendez', flight: 'CM 417', legalityExpires: '14:30', hoursRemaining: 2.75 },
    { name: 'Capt. Silva', flight: 'CM 234', legalityExpires: '15:45', hoursRemaining: 4.0 },
    { name: 'F/O Chen', flight: 'CM 891', legalityExpires: '16:15', hoursRemaining: 5.25 },
    { name: 'Capt. Torres', flight: 'CM 156', legalityExpires: '17:00', hoursRemaining: 6.0 },
  ],
  financialExposure: {
    rebooking: 180000,
    hotels: 45000,
    compensation: 95000,
    crewRepositioning: 20000
  }
};

export const fatigueRiskData = {
  timeRange: { start: 'now', end: '+6h' },
  crewMembers: [
    {
      id: 'CM001',
      name: 'F/O Mendez',
      role: 'SIC',
      currentFlight: 'CM 417',
      dutyStarted: '06:00',
      dutyLimit: '14:30',
      hoursRemaining: 2.75,
      flightsAffectedIfTimeout: 3,
      riskLevel: 'critical'
    },
    {
      id: 'CM002',
      name: 'Capt. Torres',
      role: 'PIC',
      currentFlight: 'CM 234',
      dutyStarted: '07:30',
      dutyLimit: '16:00',
      hoursRemaining: 4.5,
      flightsAffectedIfTimeout: 2,
      riskLevel: 'warning'
    },
    {
      id: 'CM003',
      name: 'F/O Chen',
      role: 'SIC',
      currentFlight: 'CM 891',
      dutyStarted: '08:00',
      dutyLimit: '16:30',
      hoursRemaining: 5.0,
      flightsAffectedIfTimeout: 1,
      riskLevel: 'normal'
    },
    {
      id: 'CM004',
      name: 'Capt. Williams',
      role: 'PIC',
      currentFlight: 'CM 156',
      dutyStarted: '09:00',
      dutyLimit: '17:30',
      hoursRemaining: 6.0,
      flightsAffectedIfTimeout: 1,
      riskLevel: 'normal'
    },
  ],
  criticalThreshold: 1.0,
  warningThreshold: 2.0,
  bufferZone: [
    { name: 'F/O Mendez', becomesRiskAt: '+0:45 delay' },
    { name: 'Capt. Torres', becomesRiskAt: '+1:15 delay' },
    { name: 'F/O Chen', becomesRiskAt: '+1:30 delay' },
    { name: 'Capt. Williams', becomesRiskAt: '+2:00 delay' }
  ]
};

export const cancellationImpactData = {
  flight: 'CM 417',
  route: 'PTY → BOG',
  totalPassengers: 143,
  passengerFlows: [
    { segment: 'Final BOG', count: 89, impact: 'Rebook +2h', severity: 'low', missConnection: 0 },
    { segment: 'Connect MDE', count: 31, impact: 'Miss connection', severity: 'high', missConnection: 12 },
    { segment: 'Connect CLO', count: 15, impact: 'Miss connection', severity: 'high', missConnection: 8 },
    { segment: 'Connect Other', count: 8, impact: 'Miss connection', severity: 'medium', missConnection: 4 }
  ],
  costs: {
    rebooking: 12400,
    hotels: 8200,
    meals: 2100,
    compensation: 24300
  },
  alternatives: [
    {
      option: 'Cancel flight',
      totalCost: 47000,
      missedConnections: 24,
      passengerSatisfaction: 'Poor'
    },
    {
      option: 'Delay 2 hours',
      totalCost: 3200,
      missedConnections: 0,
      passengerSatisfaction: 'Acceptable'
    }
  ]
};

export const reserveCoverageData = {
  airport: { code: 'PTY', name: 'Tocumen Intl', coords: [9.0714, -79.3835] },
  reserves: [
    {
      id: 'R001',
      name: 'F/O Rivera',
      role: 'First Officer',
      location: 'Airport - Gate Area',
      locationCoords: [9.0720, -79.3830],
      locationType: 'airport',
      responseTime: 12,
      dutyAvailable: '10h 00m',
      certifications: ['B737', 'B737 MAX'],
      status: 'Ready'
    },
    {
      id: 'R002',
      name: 'Capt. Santos',
      role: 'Captain',
      location: 'Marriott PTY',
      locationCoords: [9.0650, -79.3900],
      locationType: 'hotel',
      responseTime: 28,
      dutyAvailable: '11h 30m',
      certifications: ['B737', 'B787'],
      status: 'On call'
    },
    {
      id: 'R003',
      name: 'F/O Morales',
      role: 'First Officer',
      location: 'Residence - Costa del Este',
      locationCoords: [9.0200, -79.4500],
      locationType: 'home',
      responseTime: 52,
      dutyAvailable: '12h 00m',
      certifications: ['B737'],
      status: 'Standby'
    },
    {
      id: 'R004',
      name: 'Capt. Lopez',
      role: 'Captain',
      location: 'Airport - Crew Lounge',
      locationCoords: [9.0714, -79.3835],
      locationType: 'airport',
      responseTime: 8,
      dutyAvailable: '9h 30m',
      certifications: ['B737', 'B737 MAX', 'B787'],
      status: 'Ready'
    },
    {
      id: 'R005',
      name: 'F/O Castillo',
      role: 'First Officer',
      location: 'Hilton PTY Airport',
      locationCoords: [9.0680, -79.3850],
      locationType: 'hotel',
      responseTime: 22,
      dutyAvailable: '11h 00m',
      certifications: ['B737 MAX'],
      status: 'On call'
    }
  ],
  coverageSummary: {
    total: 5,
    within30min: 3,
    aircraftCoverage: {
      'B737': { available: 5, status: 'Good' },
      'B737 MAX': { available: 3, status: 'Good' },
      'B787': { available: 1, status: 'Limited' }
    }
  }
};

export const dayComparisonData = {
  today: {
    date: '2025-12-01',
    hourlyDisruptions: [0, 1, 1, 2, 3, 3, 4, 5, 5, 6, 7, 7, 7, 7, 7, 7],
    metrics: {
      delaysOver30: 7,
      crewSwaps: 3,
      cancellations: 0,
      costImpact: 43000
    }
  },
  comparison: {
    date: '2025-11-25',
    label: 'Last Tuesday',
    hourlyDisruptions: [0, 0, 2, 4, 5, 7, 8, 9, 10, 11, 12, 12, 12, 12, 12, 12],
    metrics: {
      delaysOver30: 12,
      crewSwaps: 8,
      cancellations: 2,
      costImpact: 127000
    }
  },
  insights: [
    {
      type: 'positive',
      text: 'Proactive reserve positioning at 06:00 prevented 3 crew swaps'
    },
    {
      type: 'positive',
      text: 'Weather monitoring triggered early passenger notifications'
    },
    {
      type: 'recommendation',
      text: 'Continue early positioning strategy on weather-risk days'
    }
  ],
  overallDelta: -18
};

export const rootCauseData = {
  station: 'MIA',
  period: 'Last 7 days',
  totalDelays: 14,
  rootCauses: [
    {
      cause: 'Weather',
      percentage: 40,
      count: 5.6,
      subCauses: [
        { name: 'Ground stops', count: 3 },
        { name: 'De-icing delays', count: 2.6 }
      ]
    },
    {
      cause: 'Crew Cascade',
      percentage: 35,
      count: 4.9,
      subCauses: [
        { name: 'PTY originating delays', count: 3 },
        { name: 'Legality timeouts', count: 1.9 }
      ]
    },
    {
      cause: 'Maintenance',
      percentage: 25,
      count: 3.5,
      subCauses: [
        { name: 'AOG parts wait', count: 2 },
        { name: 'Unscheduled checks', count: 1.5 }
      ]
    }
  ],
  cascadeExample: {
    rootEvent: { time: '08:00', flight: 'CM 201', cause: 'Weather hold PTY' },
    cascade: [
      { time: '09:30', flight: 'CM 305', impact: 'Crew unavailable' },
      { time: '11:00', flight: 'CM 412', impact: 'Crew from CM 305 delayed' },
      { time: '13:00', summary: '3 flights delayed from single event' }
    ]
  },
  recommendation: {
    pattern: 'Thursday MIA operations have 2.3x delay rate',
    rootCause: 'Insufficient reserve coverage for afternoon bank',
    action: 'Pre-position 1 additional reserve at MIA on Thursdays',
    estimatedSavings: { delays: '2-3/week', cost: 45000 }
  }
};

export const shiftReportData = {
  score: 87,
  controller: 'Ilango',
  date: 'December 1, 2025',
  shift: 'Day Shift (06:00 - 14:00)',

  metrics: [
    { icon: '⚡', value: '23 min', label: 'Avg Response', subtext: 'vs 45 min target' },
    { icon: '💰', value: '$127K', label: 'Cost Avoided', subtext: 'vs similar disruptions' },
    { icon: '✓', value: '4', label: 'Decisions', subtext: '0 escalations' },
    { icon: '🤖', value: '83%', label: 'AI Alignment', subtext: '5/6 accepted' }
  ],

  learningMoment: {
    flight: 'CM 801',
    humanAction: 'chose crew with Lima familiarity over my suggestion',
    result: 'saved 12 minutes on turnaround',
    aiFeedback: "I've updated my model. Future Lima operations will weight station experience higher."
  },

  achievements: [
    { icon: '🏆', label: 'Zero Escalations', detail: '5 shifts in a row' },
    { icon: '⚡', label: 'Speed Demon', detail: 'All resolutions under 30 min' }
  ],

  handoff: {
    outgoing: { name: 'Ilango', startTime: '06:00', endTime: '14:00', resolved: 3 },
    incoming: { name: 'Maria', startTime: '14:00', endTime: '22:00', active: 1 },

    openItems: [{
      type: 'monitor' as const,
      flight: 'CM 487',
      route: 'PTY → BOG',
      issue: 'BOG afternoon thunderstorms forecasted for 14:00-17:00 window',
      actionTaken: 'Reserve F/O Moreno on standby at PTY. Monitoring weather updates.',
      decisionPoint: '15:30',
      priority: 'medium' as const
    }],

    watchItems: [
      { type: 'action' as const, label: 'BOG Weather Decision', detail: 'Pre-position reserve if forecast worsens', due: '15:00' },
      { type: 'fyi' as const, label: 'F/O Vega Available', detail: 'Back from rest, available tomorrow 05:00 LIM base' }
    ],

    resolvedItems: [
      { flight: 'CM 208', action: 'Crew reassignment (Capt. Santos)', time: '09:02', outcome: 'On-time departure' },
      { flight: 'CM 135', action: 'Proactive reposition via CM 305', time: '10:15', outcome: 'Avoided delay' },
      { flight: 'CM 801', action: 'Schedule adjustment + Lima crew', time: '11:30', outcome: '12min saved' }
    ],

    checklist: [
      { label: 'Open situations reviewed', checked: true },
      { label: 'Watch items acknowledged', checked: true },
      { label: 'Crew status shared', checked: true },
      { label: 'Maria confirms ready', checked: false }
    ]
  }
};

export const suggestedQuestions = [
  {
    id: 'weather',
    icon: '🌧️',
    short: 'Weather Exposure',
    full: "What's my exposure if Panama weather gets worse?",
    visualization: 'WeatherExposure'
  },
  {
    id: 'fatigue',
    icon: '⏱️',
    short: 'Fatigue Risk',
    full: 'Show me crew fatigue risk for the next 6 hours',
    visualization: 'FatigueHeatmap'
  },
  {
    id: 'cancel',
    icon: '✈️',
    short: 'Cancel Impact',
    full: 'If I cancel CM 417, what happens to passengers?',
    visualization: 'PassengerImpact'
  },
  {
    id: 'reserve',
    icon: '👤',
    short: 'Reserve Coverage',
    full: "Who's my best reserve coverage at PTY right now?",
    visualization: 'ReserveCoverage'
  },
  {
    id: 'compare',
    icon: '📊',
    short: 'Compare Days',
    full: "Compare today vs. last Tuesday's operation",
    visualization: 'DayComparison'
  },
  {
    id: 'rootcause',
    icon: '🔍',
    short: 'Root Cause',
    full: 'What caused our Miami delays last week?',
    visualization: 'RootCauseTree'
  },
  {
    id: 'shiftreport',
    icon: '📋',
    short: 'Shift Report',
    full: 'Show my shift performance report and handoff briefing',
    visualization: 'ShiftReport'
  }
];
