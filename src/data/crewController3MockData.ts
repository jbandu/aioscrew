// Mock data for Crew Controller 3.0 - Copa Airlines Operations
// Focus: Traditional Gantt timeline interface with AI augmentation

export interface CrewMember {
  id: string;
  name: string;
  rank: 'CA' | 'FO' | 'FA'; // Captain, First Officer, Flight Attendant
  base: string;
  certifications: string[];
  currentStatus: 'legal' | 'warning' | 'critical' | 'deadhead' | 'rest' | 'reserve';
  dutyStart: string;
  dutyEnd: string;
  hoursRemaining: number;
  assignments: CrewAssignment[];
}

export interface CrewAssignment {
  flightNumber: string;
  route: string;
  std: string; // scheduled departure time
  sta: string; // scheduled arrival time
  atd?: string; // actual departure time
  ata?: string; // actual arrival time
  status: 'scheduled' | 'delayed' | 'departed' | 'arrived' | 'cancelled';
  aircraftType: string;
  position: 'PIC' | 'SIC' | 'FA1' | 'FA2' | 'FA3' | 'DH'; // DH = Deadhead
}

export interface Alert {
  id: string;
  type: 'legality' | 'coverage' | 'delay' | 'mechanical' | 'weather';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  flightNumbers: string[];
  crewAffected: string[];
  timeToImpact: number; // minutes
  suggestedActions: string[];
  timestamp: string;
}

export interface Flight {
  flightNumber: string;
  route: string;
  origin: string;
  destination: string;
  aircraftType: string;
  std: string;
  sta: string;
  atd?: string;
  ata?: string;
  status: 'scheduled' | 'delayed' | 'departed' | 'arrived' | 'cancelled';
  delayReason?: string;
  assignedCrew: {
    captain: string;
    firstOfficer: string;
    flightAttendants: string[];
  };
}

// Current time for simulation: 11:30 AM PTY Time
export const currentTime = '11:30';

// Copa Airlines crew members at PTY base
export const crewMembers: CrewMember[] = [
  {
    id: 'CA001',
    name: 'Capt. Rodriguez',
    rank: 'CA',
    base: 'PTY',
    certifications: ['B737-800', 'B737-MAX'],
    currentStatus: 'warning',
    dutyStart: '06:00',
    dutyEnd: '14:30',
    hoursRemaining: 3.0,
    assignments: [
      { flightNumber: 'CM201', route: 'PTY-MIA', std: '07:00', sta: '10:15', atd: '07:15', status: 'departed', aircraftType: 'B737-800', position: 'PIC' },
      { flightNumber: 'CM234', route: 'MIA-PTY', std: '11:30', sta: '14:45', status: 'delayed', aircraftType: 'B737-800', position: 'PIC' },
    ]
  },
  {
    id: 'FO001',
    name: 'F/O Mendez',
    rank: 'FO',
    base: 'PTY',
    certifications: ['B737-800'],
    currentStatus: 'critical',
    dutyStart: '06:00',
    dutyEnd: '14:00',
    hoursRemaining: 2.5,
    assignments: [
      { flightNumber: 'CM201', route: 'PTY-MIA', std: '07:00', sta: '10:15', atd: '07:15', status: 'departed', aircraftType: 'B737-800', position: 'SIC' },
      { flightNumber: 'CM234', route: 'MIA-PTY', std: '11:30', sta: '14:45', status: 'delayed', aircraftType: 'B737-800', position: 'SIC' },
    ]
  },
  {
    id: 'CA002',
    name: 'Capt. Silva',
    rank: 'CA',
    base: 'PTY',
    certifications: ['B737-800', 'B737-MAX', 'B787'],
    currentStatus: 'legal',
    dutyStart: '08:00',
    dutyEnd: '18:00',
    hoursRemaining: 6.5,
    assignments: [
      { flightNumber: 'CM417', route: 'PTY-BOG', std: '12:45', sta: '14:30', status: 'scheduled', aircraftType: 'B737-800', position: 'PIC' },
      { flightNumber: 'CM512', route: 'BOG-PTY', std: '15:30', sta: '17:15', status: 'scheduled', aircraftType: 'B737-800', position: 'PIC' },
    ]
  },
  {
    id: 'FO002',
    name: 'F/O Chen',
    rank: 'FO',
    base: 'PTY',
    certifications: ['B737-800', 'B737-MAX'],
    currentStatus: 'legal',
    dutyStart: '08:00',
    dutyEnd: '18:00',
    hoursRemaining: 6.5,
    assignments: [
      { flightNumber: 'CM417', route: 'PTY-BOG', std: '12:45', sta: '14:30', status: 'scheduled', aircraftType: 'B737-800', position: 'SIC' },
      { flightNumber: 'CM512', route: 'BOG-PTY', std: '15:30', sta: '17:15', status: 'scheduled', aircraftType: 'B737-800', position: 'SIC' },
    ]
  },
  {
    id: 'CA003',
    name: 'Capt. Torres',
    rank: 'CA',
    base: 'PTY',
    certifications: ['B737-800'],
    currentStatus: 'legal',
    dutyStart: '09:00',
    dutyEnd: '19:00',
    hoursRemaining: 7.5,
    assignments: [
      { flightNumber: 'CM891', route: 'PTY-GRU', std: '14:00', sta: '19:30', status: 'scheduled', aircraftType: 'B737-800', position: 'PIC' },
    ]
  },
  {
    id: 'FO003',
    name: 'F/O Williams',
    rank: 'FO',
    base: 'PTY',
    certifications: ['B737-800'],
    currentStatus: 'legal',
    dutyStart: '09:00',
    dutyEnd: '19:00',
    hoursRemaining: 7.5,
    assignments: [
      { flightNumber: 'CM891', route: 'PTY-GRU', std: '14:00', sta: '19:30', status: 'scheduled', aircraftType: 'B737-800', position: 'SIC' },
    ]
  },
  {
    id: 'CA004',
    name: 'Capt. Rivera',
    rank: 'CA',
    base: 'PTY',
    certifications: ['B737-MAX'],
    currentStatus: 'rest',
    dutyStart: '14:00',
    dutyEnd: '23:00',
    hoursRemaining: 9.0,
    assignments: [
      { flightNumber: 'CM523', route: 'PTY-LIM', std: '16:00', sta: '19:15', status: 'scheduled', aircraftType: 'B737-MAX', position: 'PIC' },
      { flightNumber: 'CM524', route: 'LIM-PTY', std: '20:00', sta: '23:00', status: 'scheduled', aircraftType: 'B737-MAX', position: 'PIC' },
    ]
  },
  {
    id: 'FO004',
    name: 'F/O Morales',
    rank: 'FO',
    base: 'PTY',
    certifications: ['B737-MAX'],
    currentStatus: 'rest',
    dutyStart: '14:00',
    dutyEnd: '23:00',
    hoursRemaining: 9.0,
    assignments: [
      { flightNumber: 'CM523', route: 'PTY-LIM', std: '16:00', sta: '19:15', status: 'scheduled', aircraftType: 'B737-MAX', position: 'SIC' },
      { flightNumber: 'CM524', route: 'LIM-PTY', std: '20:00', sta: '23:00', status: 'scheduled', aircraftType: 'B737-MAX', position: 'SIC' },
    ]
  },
  {
    id: 'CA005',
    name: 'Capt. Santos',
    rank: 'CA',
    base: 'PTY',
    certifications: ['B737-800', 'B787'],
    currentStatus: 'reserve',
    dutyStart: '10:00',
    dutyEnd: '20:00',
    hoursRemaining: 10.0,
    assignments: []
  },
  {
    id: 'FO005',
    name: 'F/O Lopez',
    rank: 'FO',
    base: 'PTY',
    certifications: ['B737-800', 'B737-MAX'],
    currentStatus: 'reserve',
    dutyStart: '10:00',
    dutyEnd: '20:00',
    hoursRemaining: 10.0,
    assignments: []
  },
];

// Active alerts sorted by urgency
export const alerts: Alert[] = [
  {
    id: 'A001',
    type: 'legality',
    severity: 'critical',
    title: 'Crew Timeout Risk - F/O Mendez',
    description: 'F/O Mendez has 2.5 hours remaining. CM234 delay puts crew at risk of timing out before return to PTY.',
    flightNumbers: ['CM234'],
    crewAffected: ['FO001'],
    timeToImpact: 150,
    suggestedActions: [
      'Swap with reserve F/O Lopez (10h available)',
      'Cancel CM234 and reposition crew via commercial',
      'Request duty time extension (requires approval)'
    ],
    timestamp: '11:25'
  },
  {
    id: 'A002',
    type: 'delay',
    severity: 'warning',
    title: 'MIA Ground Stop - CM234 Delayed',
    description: 'MIA ground stop due to weather. CM234 delayed by 45 minutes. Cascades to 2 downstream flights.',
    flightNumbers: ['CM234', 'CM305', 'CM412'],
    crewAffected: ['CA001', 'FO001'],
    timeToImpact: 45,
    suggestedActions: [
      'Pre-position reserve crew for CM305',
      'Monitor weather for further delays',
      'Notify passengers on CM305/CM412'
    ],
    timestamp: '11:20'
  },
  {
    id: 'A003',
    type: 'weather',
    severity: 'warning',
    title: 'Weather Watch - BOG Afternoon Storms',
    description: 'Thunderstorms forecast for BOG 14:00-17:00. CM417 and CM891 may face delays or diversions.',
    flightNumbers: ['CM417', 'CM512', 'CM891'],
    crewAffected: ['CA002', 'FO002', 'CA003', 'FO003'],
    timeToImpact: 90,
    suggestedActions: [
      'Monitor BOG weather updates',
      'Prep alternate crew for CM512 return',
      'Consider early departure for CM417'
    ],
    timestamp: '11:15'
  },
  {
    id: 'A004',
    type: 'coverage',
    severity: 'info',
    title: 'Reserve Coverage - 2 Available',
    description: 'Capt. Santos and F/O Lopez available as reserves. Good coverage for afternoon bank.',
    flightNumbers: [],
    crewAffected: ['CA005', 'FO005'],
    timeToImpact: 0,
    suggestedActions: [
      'Keep reserves on standby for CM234 situation',
      'Monitor for additional delays'
    ],
    timestamp: '11:10'
  },
];

// Flights in today's operation
export const flights: Flight[] = [
  {
    flightNumber: 'CM201',
    route: 'PTY-MIA',
    origin: 'PTY',
    destination: 'MIA',
    aircraftType: 'B737-800',
    std: '07:00',
    sta: '10:15',
    atd: '07:15',
    status: 'departed',
    assignedCrew: {
      captain: 'CA001',
      firstOfficer: 'FO001',
      flightAttendants: ['FA001', 'FA002', 'FA003']
    }
  },
  {
    flightNumber: 'CM234',
    route: 'MIA-PTY',
    origin: 'MIA',
    destination: 'PTY',
    aircraftType: 'B737-800',
    std: '11:30',
    sta: '14:45',
    status: 'delayed',
    delayReason: 'Weather - MIA ground stop',
    assignedCrew: {
      captain: 'CA001',
      firstOfficer: 'FO001',
      flightAttendants: ['FA001', 'FA002', 'FA003']
    }
  },
  {
    flightNumber: 'CM417',
    route: 'PTY-BOG',
    origin: 'PTY',
    destination: 'BOG',
    aircraftType: 'B737-800',
    std: '12:45',
    sta: '14:30',
    status: 'scheduled',
    assignedCrew: {
      captain: 'CA002',
      firstOfficer: 'FO002',
      flightAttendants: ['FA004', 'FA005', 'FA006']
    }
  },
  {
    flightNumber: 'CM512',
    route: 'BOG-PTY',
    origin: 'BOG',
    destination: 'PTY',
    aircraftType: 'B737-800',
    std: '15:30',
    sta: '17:15',
    status: 'scheduled',
    assignedCrew: {
      captain: 'CA002',
      firstOfficer: 'FO002',
      flightAttendants: ['FA004', 'FA005', 'FA006']
    }
  },
  {
    flightNumber: 'CM891',
    route: 'PTY-GRU',
    origin: 'PTY',
    destination: 'GRU',
    aircraftType: 'B737-800',
    std: '14:00',
    sta: '19:30',
    status: 'scheduled',
    assignedCrew: {
      captain: 'CA003',
      firstOfficer: 'FO003',
      flightAttendants: ['FA007', 'FA008', 'FA009']
    }
  },
  {
    flightNumber: 'CM523',
    route: 'PTY-LIM',
    origin: 'PTY',
    destination: 'LIM',
    aircraftType: 'B737-MAX',
    std: '16:00',
    sta: '19:15',
    status: 'scheduled',
    assignedCrew: {
      captain: 'CA004',
      firstOfficer: 'FO004',
      flightAttendants: ['FA010', 'FA011', 'FA012']
    }
  },
  {
    flightNumber: 'CM524',
    route: 'LIM-PTY',
    origin: 'LIM',
    destination: 'PTY',
    aircraftType: 'B737-MAX',
    std: '20:00',
    sta: '23:00',
    status: 'scheduled',
    assignedCrew: {
      captain: 'CA004',
      firstOfficer: 'FO004',
      flightAttendants: ['FA010', 'FA011', 'FA012']
    }
  },
];

// Stats for header
export const operationalStats = {
  crewOnDuty: 8,
  crewAvailable: 2,
  flightsToday: 12,
  delaysActive: 1,
  alertsCritical: 1,
  alertsWarning: 2,
};
