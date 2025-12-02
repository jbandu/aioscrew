// Mock data for Crew Controller 4.0 Interactive Visualization Scenarios

// ============ SCENARIO 1: CREW UTILIZATION DATA ============
export interface CrewMemberDetail {
  id: string;
  name: string;
  status: 'active' | 'reserve' | 'rest' | 'off' | 'critical';
  dutyRemaining: string;
  base: string;
  currentFlight: string | null;
  rank: 'Captain' | 'First Officer' | 'Flight Attendant';
}

export interface UtilizationData {
  statusBreakdown: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  byBase: Array<{
    base: string;
    utilization: number;
    crew: number;
  }>;
  crewDetails: CrewMemberDetail[];
}

export const utilizationData: UtilizationData = {
  statusBreakdown: [
    { name: 'On Duty', value: 412, color: '#10b981' },
    { name: 'Reserve', value: 24, color: '#3b82f6' },
    { name: 'Rest', value: 156, color: '#6b7280' },
    { name: 'Off', value: 89, color: '#374151' }
  ],
  byBase: [
    { base: 'PTY', utilization: 87, crew: 156 },
    { base: 'MIA', utilization: 62, crew: 89 },
    { base: 'BOG', utilization: 71, crew: 67 },
    { base: 'GRU', utilization: 45, crew: 54 },
    { base: 'MDE', utilization: 82, crew: 46 }
  ],
  crewDetails: [
    { id: 'C001', name: 'Capt. Herrera', status: 'active', dutyRemaining: '6h 12m', base: 'PTY', currentFlight: 'CM 208', rank: 'Captain' },
    { id: 'C002', name: 'F/O Vega', status: 'critical', dutyRemaining: '2h 45m', base: 'PTY', currentFlight: 'CM 417', rank: 'First Officer' },
    { id: 'C003', name: 'F/O Santos', status: 'reserve', dutyRemaining: '10h 00m', base: 'PTY', currentFlight: null, rank: 'First Officer' },
    { id: 'C004', name: 'Capt. Silva', status: 'active', dutyRemaining: '5h 30m', base: 'MIA', currentFlight: 'CM 234', rank: 'Captain' },
    { id: 'C005', name: 'F/O Moreno', status: 'active', dutyRemaining: '4h 15m', base: 'MIA', currentFlight: 'CM 891', rank: 'First Officer' },
    { id: 'C006', name: 'Capt. Rodriguez', status: 'reserve', dutyRemaining: '8h 00m', base: 'PTY', currentFlight: null, rank: 'Captain' },
    { id: 'C007', name: 'F/O Martinez', status: 'active', dutyRemaining: '3h 45m', base: 'BOG', currentFlight: 'CM 523', rank: 'First Officer' },
    { id: 'C008', name: 'Capt. Lopez', status: 'rest', dutyRemaining: '—', base: 'PTY', currentFlight: null, rank: 'Captain' },
    { id: 'C009', name: 'F/O Chen', status: 'critical', dutyRemaining: '1h 30m', base: 'PTY', currentFlight: 'CM 512', rank: 'First Officer' },
    { id: 'C010', name: 'Capt. Garcia', status: 'active', dutyRemaining: '7h 00m', base: 'GRU', currentFlight: 'CM 801', rank: 'Captain' },
    { id: 'C011', name: 'F/O Castillo', status: 'off', dutyRemaining: '—', base: 'MDE', currentFlight: null, rank: 'First Officer' },
    { id: 'C012', name: 'Capt. Torres', status: 'active', dutyRemaining: '5h 00m', base: 'BOG', currentFlight: 'CM 156', rank: 'Captain' }
  ]
};

// ============ SCENARIO 2: COST COMPARISON DATA ============
export interface CostBreakdownItem {
  component: string;
  cost: number;
  notes: string;
}

export interface ResolutionOption {
  id: number;
  label: string;
  cost: number;
  time: number;
  risk: 'low' | 'medium' | 'high' | 'critical';
  recommended?: boolean;
  breakdown: CostBreakdownItem[];
}

export const costComparisonData: ResolutionOption[] = [
  {
    id: 1,
    label: 'Option 1: Assign F/O Santos',
    cost: 0,
    time: 12,
    risk: 'low',
    recommended: true,
    breakdown: [
      { component: 'Reserve Activation', cost: 0, notes: 'Already on reserve pay' },
      { component: 'Crew Transport', cost: 0, notes: 'At airport' },
      { component: 'Delay Costs', cost: 0, notes: 'No additional delay' },
      { component: 'Passenger Impact', cost: 0, notes: 'No rebooking' }
    ]
  },
  {
    id: 2,
    label: 'Option 2: F/O Moreno (Inbound)',
    cost: 450,
    time: 22,
    risk: 'medium',
    breakdown: [
      { component: 'Standby Pay', cost: 200, notes: 'Extension premium' },
      { component: 'Crew Meals', cost: 50, notes: 'Extended duty' },
      { component: 'Buffer Risk', cost: 200, notes: 'Tight connection' }
    ]
  },
  {
    id: 3,
    label: 'Option 3: Crew Swap with CM 487',
    cost: 2100,
    time: 35,
    risk: 'medium',
    breakdown: [
      { component: 'Delay Cost (CM 487)', cost: 1200, notes: '35 min delay' },
      { component: 'Passenger Rebooking', cost: 600, notes: '12 connections' },
      { component: 'Crew Transport', cost: 300, notes: 'Taxi between gates' }
    ]
  },
  {
    id: 4,
    label: 'Do Nothing',
    cost: 47000,
    time: 0,
    risk: 'critical',
    breakdown: [
      { component: 'Flight Cancellation', cost: 18000, notes: 'CM 208 cancelled' },
      { component: 'Passenger Rebooking', cost: 12400, notes: '143 passengers' },
      { component: 'Hotel Accommodations', cost: 8200, notes: '67 overnight stays' },
      { component: 'EU261 Compensation', cost: 8400, notes: '28 eligible passengers' }
    ]
  }
];

// ============ SCENARIO 3: FATIGUE HEATMAP DATA ============
export interface FatigueCell {
  hour: string;
  remaining: number;
}

export interface FatigueCrewMember {
  id: string;
  name: string;
  base: string;
  role: 'Captain' | 'First Officer' | 'Flight Attendant';
  currentFlight: string;
  limitTime: string;
  fatigueData: FatigueCell[];
}

export const fatigueHeatmapData: FatigueCrewMember[] = [
  {
    id: 'F001',
    name: 'Herrera',
    base: 'PTY',
    role: 'Captain',
    currentFlight: 'CM 208',
    limitTime: '14:00',
    fatigueData: [
      { hour: '08:00', remaining: 8 },
      { hour: '09:00', remaining: 7 },
      { hour: '10:00', remaining: 6 },
      { hour: '11:00', remaining: 5 },
      { hour: '12:00', remaining: 4 },
      { hour: '13:00', remaining: 3 },
      { hour: '14:00', remaining: 2 }
    ]
  },
  {
    id: 'F002',
    name: 'Vega',
    base: 'PTY',
    role: 'First Officer',
    currentFlight: 'CM 208',
    limitTime: '14:30',
    fatigueData: [
      { hour: '08:00', remaining: 4.5 },
      { hour: '09:00', remaining: 3.5 },
      { hour: '10:00', remaining: 2.5 },
      { hour: '11:00', remaining: 1.5 },
      { hour: '12:00', remaining: 0.5 },
      { hour: '13:00', remaining: 0 },
      { hour: '14:00', remaining: -1 }
    ]
  },
  {
    id: 'F003',
    name: 'Santos',
    base: 'PTY',
    role: 'First Officer',
    currentFlight: 'Reserve',
    limitTime: '18:00',
    fatigueData: [
      { hour: '08:00', remaining: 12 },
      { hour: '09:00', remaining: 11 },
      { hour: '10:00', remaining: 10 },
      { hour: '11:00', remaining: 9 },
      { hour: '12:00', remaining: 8 },
      { hour: '13:00', remaining: 7 },
      { hour: '14:00', remaining: 6 }
    ]
  },
  {
    id: 'F004',
    name: 'Moreno',
    base: 'MIA',
    role: 'First Officer',
    currentFlight: 'CM 305',
    limitTime: '15:30',
    fatigueData: [
      { hour: '08:00', remaining: 9 },
      { hour: '09:00', remaining: 8 },
      { hour: '10:00', remaining: 7 },
      { hour: '11:00', remaining: 6 },
      { hour: '12:00', remaining: 5 },
      { hour: '13:00', remaining: 4 },
      { hour: '14:00', remaining: 3 }
    ]
  },
  {
    id: 'F005',
    name: 'Martinez',
    base: 'BOG',
    role: 'First Officer',
    currentFlight: 'CM 523',
    limitTime: '14:45',
    fatigueData: [
      { hour: '08:00', remaining: 7 },
      { hour: '09:00', remaining: 6 },
      { hour: '10:00', remaining: 5 },
      { hour: '11:00', remaining: 4 },
      { hour: '12:00', remaining: 3 },
      { hour: '13:00', remaining: 2 },
      { hour: '14:00', remaining: 1 }
    ]
  },
  {
    id: 'F006',
    name: 'Chen',
    base: 'PTY',
    role: 'First Officer',
    currentFlight: 'CM 512',
    limitTime: '13:45',
    fatigueData: [
      { hour: '08:00', remaining: 4 },
      { hour: '09:00', remaining: 3 },
      { hour: '10:00', remaining: 2 },
      { hour: '11:00', remaining: 1 },
      { hour: '12:00', remaining: 0 },
      { hour: '13:00', remaining: -1 },
      { hour: '14:00', remaining: -2 }
    ]
  },
  {
    id: 'F007',
    name: 'Garcia',
    base: 'GRU',
    role: 'Captain',
    currentFlight: 'CM 801',
    limitTime: '16:00',
    fatigueData: [
      { hour: '08:00', remaining: 10 },
      { hour: '09:00', remaining: 9 },
      { hour: '10:00', remaining: 8 },
      { hour: '11:00', remaining: 7 },
      { hour: '12:00', remaining: 6 },
      { hour: '13:00', remaining: 5 },
      { hour: '14:00', remaining: 4 }
    ]
  },
  {
    id: 'F008',
    name: 'Lopez',
    base: 'PTY',
    role: 'Captain',
    currentFlight: 'CM 156',
    limitTime: '17:00',
    fatigueData: [
      { hour: '08:00', remaining: 11 },
      { hour: '09:00', remaining: 10 },
      { hour: '10:00', remaining: 9 },
      { hour: '11:00', remaining: 8 },
      { hour: '12:00', remaining: 7 },
      { hour: '13:00', remaining: 6 },
      { hour: '14:00', remaining: 5 }
    ]
  }
];

// ============ SCENARIO 4: ROOT CAUSE ANALYSIS DATA ============
export interface RootCauseSubItem {
  name: string;
  value: number;
}

export interface RootCauseItem {
  name: string;
  value: number;
  color: string;
  children?: RootCauseSubItem[];
}

export interface RootCauseDrilldown {
  cause: string;
  location: string;
  incidents: number;
  delayMins: number;
  costImpact: number;
  details: Array<{
    specificCause: string;
    incidents: number;
    delayMins: number;
    costImpact: number;
  }>;
}

export const rootCauseAnalysisData = {
  period: 'Last 7 Days',
  totalDelays: 47,
  breakdown: [
    {
      name: 'Weather',
      value: 40,
      color: '#ef4444',
      children: [
        { name: 'PTY', value: 25 },
        { name: 'BOG', value: 10 },
        { name: 'MIA', value: 5 }
      ]
    },
    {
      name: 'Crew Cascade',
      value: 35,
      color: '#f97316',
      children: [
        { name: 'Legality Timeout', value: 20 },
        { name: 'Late Inbound', value: 15 }
      ]
    },
    {
      name: 'Maintenance',
      value: 25,
      color: '#eab308',
      children: [
        { name: 'AOG Parts', value: 15 },
        { name: 'Unscheduled', value: 10 }
      ]
    }
  ] as RootCauseItem[],
  drilldown: {
    cause: 'Weather',
    location: 'PTY',
    incidents: 20,
    delayMins: 888,
    costImpact: 64800,
    details: [
      { specificCause: 'Thunderstorms', incidents: 12, delayMins: 487, costImpact: 34200 },
      { specificCause: 'Low Visibility', incidents: 5, delayMins: 156, costImpact: 12100 },
      { specificCause: 'Ground Stops', incidents: 3, delayMins: 245, costImpact: 18500 }
    ]
  } as RootCauseDrilldown,
  recommendation: {
    text: 'Pre-position 2 reserve crew at PTY during afternoon storm season (14:00-18:00)',
    estimatedSavings: 45000,
    preventableDelays: 8
  }
};

// ============ SCENARIO 5: PASSENGER IMPACT DATA ============
export interface PassengerFlow {
  source: string;
  target: string;
  value: number;
  delay: string;
  color: string;
}

export interface RebookingOption {
  option: string;
  capacity: string;
  delay: string;
  costPerPax: number;
  totalCost: number;
}

export const passengerImpactData = {
  flight: 'CM 208',
  route: 'PTY → GRU',
  totalPassengers: 143,
  flows: [
    { source: 'CM 208', target: 'CM 210 (Same Day)', value: 78, delay: '+4h', color: '#10b981' },
    { source: 'CM 208', target: 'Partner (LATAM)', value: 31, delay: '+6h', color: '#3b82f6' },
    { source: 'CM 208', target: 'Next Day CM 208', value: 22, delay: '+24h', color: '#f97316' },
    { source: 'CM 208', target: 'Refund Request', value: 12, delay: 'N/A', color: '#ef4444' }
  ] as PassengerFlow[],
  rebookingOptions: [
    { option: 'CM 210 (18:30)', capacity: '78 seats', delay: '+4 hours', costPerPax: 0, totalCost: 0 },
    { option: 'LATAM LA 8045', capacity: '45 seats', delay: '+6 hours', costPerPax: 180, totalCost: 5580 },
    { option: 'Next Day + Hotel', capacity: 'No limit', delay: '+24 hours', costPerPax: 250, totalCost: 5500 },
    { option: 'Full Refund', capacity: 'No limit', delay: 'N/A', costPerPax: 890, totalCost: 10680 }
  ] as RebookingOption[],
  totalCancellationCost: 47200,
  tightConnections: 34,
  delayScenario: {
    delay: '2 hours',
    cost: 3200,
    missedConnections: 0
  }
};

// ============ SCENARIO 6: WEEKLY PERFORMANCE TRENDS DATA ============
export interface DailyMetrics {
  day: string;
  otp: number;
  delays: number;
  cost: number;
  resolutionTime: number;
}

export const performanceTrendsData = {
  thisWeek: [
    { day: 'Mon', otp: 92, delays: 8, cost: 45000, resolutionTime: 22 },
    { day: 'Tue', otp: 89, delays: 12, cost: 67000, resolutionTime: 28 },
    { day: 'Wed', otp: 95, delays: 5, cost: 32000, resolutionTime: 18 },
    { day: 'Thu', otp: 91, delays: 9, cost: 54000, resolutionTime: 25 },
    { day: 'Fri', otp: 96, delays: 4, cost: 28000, resolutionTime: 15 },
    { day: 'Sat', otp: 94, delays: 6, cost: 38000, resolutionTime: 20 },
    { day: 'Sun', otp: 97, delays: 3, cost: 22000, resolutionTime: 12 }
  ] as DailyMetrics[],
  lastWeek: [
    { day: 'Mon', otp: 85, delays: 15, cost: 89000, resolutionTime: 35 },
    { day: 'Tue', otp: 82, delays: 18, cost: 102000, resolutionTime: 42 },
    { day: 'Wed', otp: 88, delays: 12, cost: 75000, resolutionTime: 38 },
    { day: 'Thu', otp: 84, delays: 16, cost: 95000, resolutionTime: 40 },
    { day: 'Fri', otp: 90, delays: 10, cost: 62000, resolutionTime: 30 },
    { day: 'Sat', otp: 87, delays: 13, cost: 78000, resolutionTime: 32 },
    { day: 'Sun', otp: 91, delays: 9, cost: 55000, resolutionTime: 28 }
  ] as DailyMetrics[],
  comparison: {
    onTimePerformance: { thisWeek: 94.2, lastWeek: 87.1, change: 7.1 },
    avgResolutionTime: { thisWeek: 23, lastWeek: 38, change: -39 },
    costAvoided: { thisWeek: 847000, lastWeek: 412000, change: 105 },
    escalations: { thisWeek: 1, lastWeek: 7, change: -86 },
    aiRecommendations: { thisWeek: 82, lastWeek: 71, change: 11 }
  },
  keyInsight: 'Pre-positioning reserves before weather events reduced cascade effects by 45%'
};

// ============ SCENARIO 7: RESERVE AVAILABILITY DATA ============
export interface HourlyReserve {
  hour: string;
  captain: number;
  firstOfficer: number;
  flightAttendant: number;
}

export interface AvailableReserve {
  id: string;
  name: string;
  role: 'Captain' | 'First Officer' | 'Flight Attendant';
  base: string;
  hoursRemaining: string;
  certifications: string[];
  responseTime: number;
}

export const reserveAvailabilityData = {
  hourlyData: [
    { hour: '08:00', captain: 4, firstOfficer: 6, flightAttendant: 8 },
    { hour: '09:00', captain: 4, firstOfficer: 5, flightAttendant: 7 },
    { hour: '10:00', captain: 3, firstOfficer: 5, flightAttendant: 7 },
    { hour: '11:00', captain: 3, firstOfficer: 4, flightAttendant: 6 },
    { hour: '12:00', captain: 2, firstOfficer: 3, flightAttendant: 5 },
    { hour: '13:00', captain: 1, firstOfficer: 2, flightAttendant: 4 },
    { hour: '14:00', captain: 2, firstOfficer: 3, flightAttendant: 5 },
    { hour: '15:00', captain: 3, firstOfficer: 4, flightAttendant: 6 },
    { hour: '16:00', captain: 4, firstOfficer: 5, flightAttendant: 7 },
    { hour: '17:00', captain: 4, firstOfficer: 5, flightAttendant: 8 },
    { hour: '18:00', captain: 3, firstOfficer: 4, flightAttendant: 7 },
    { hour: '19:00', captain: 3, firstOfficer: 4, flightAttendant: 6 }
  ] as HourlyReserve[],
  gapWarning: {
    hour: '13:00',
    message: 'Only 4 reserves available',
    severity: 'warning' as const
  },
  availableAt13: [
    {
      id: 'R001',
      name: 'Capt. Rodriguez',
      role: 'Captain' as const,
      base: 'PTY',
      hoursRemaining: '8h remaining',
      certifications: ['B737-800', 'MAX 9'],
      responseTime: 12
    },
    {
      id: 'R002',
      name: 'F/O Santos',
      role: 'First Officer' as const,
      base: 'PTY',
      hoursRemaining: '10h remaining',
      certifications: ['B737-800', 'MAX 9'],
      responseTime: 15
    },
    {
      id: 'R003',
      name: 'F/O Chen',
      role: 'First Officer' as const,
      base: 'PTY',
      hoursRemaining: '6h remaining',
      certifications: ['B737-800'],
      responseTime: 20
    },
    {
      id: 'R004',
      name: 'FA Martinez',
      role: 'Flight Attendant' as const,
      base: 'PTY',
      hoursRemaining: '9h remaining',
      certifications: ['B737', 'B787'],
      responseTime: 8
    }
  ] as AvailableReserve[]
};

// ============ SUGGESTED QUESTIONS FOR CC4 ============
export const cc4SuggestedQuestions = [
  {
    id: 'utilization',
    icon: '👥',
    short: 'Crew Utilization',
    full: 'Show me crew utilization',
    trigger: ['crew utilization', 'crew status', 'who is available'],
    visualization: 'CrewUtilization'
  },
  {
    id: 'cost',
    icon: '💰',
    short: 'Cost Comparison',
    full: 'Compare costs of these options',
    trigger: ['compare costs', 'cost comparison', 'resolution options'],
    visualization: 'CostComparison'
  },
  {
    id: 'fatigue',
    icon: '⚠️',
    short: 'Fatigue Risk',
    full: 'Show fatigue risk',
    trigger: ['fatigue risk', 'who is getting tired', 'duty limits'],
    visualization: 'FatigueHeatmap'
  },
  {
    id: 'rootcause',
    icon: '🔍',
    short: 'Root Cause',
    full: 'What caused delays last week?',
    trigger: ['root cause', 'what caused delays', 'delay analysis'],
    visualization: 'RootCauseAnalysis'
  },
  {
    id: 'passenger',
    icon: '✈️',
    short: 'Passenger Impact',
    full: 'If I cancel CM 208, what happens to passengers?',
    trigger: ['cancel', 'passenger impact', 'what happens to passengers'],
    visualization: 'PassengerImpact'
  },
  {
    id: 'trends',
    icon: '📈',
    short: 'Performance Trends',
    full: 'Compare today vs last week',
    trigger: ['compare today', 'performance trends', 'show trends'],
    visualization: 'PerformanceTrends'
  },
  {
    id: 'reserve',
    icon: '👤',
    short: 'Reserve Coverage',
    full: 'Show reserve coverage',
    trigger: ['reserve coverage', 'who is available', 'reserve availability'],
    visualization: 'ReserveAvailability'
  }
];
