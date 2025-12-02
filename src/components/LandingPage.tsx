import { useState } from 'react';
import { Plane, Calendar, Target, DollarSign, BarChart3, Scale, Building2, Sparkles, FlaskConical, Warehouse, Database, Zap } from 'lucide-react';
import { UserRole } from '../types';
import TestGenerator2Page from './TestGenerator2Page';
import TestLabPage from './TestLabPage';
import FleetManagementPage from './FleetManagementPage';
import FleetDataManagementPage from '../pages/FleetDataManagementPage';
import CrewController2 from './CrewController2';

interface LandingPageProps {
  onSelectRole: (role: UserRole) => void;
}

const personas = [
  {
    role: 'crew-member' as UserRole,
    icon: Plane,
    title: 'Crew Member',
    subtitle: 'Captain Sarah Martinez',
    capabilities: [
      'View schedule & trip details',
      'Submit & track pay claims',
      'Check training requirements'
    ],
    color: 'from-slate-900 via-blue-900 to-indigo-900',
    accent: 'from-blue-500/80 to-cyan-500/80'
  },
  {
    role: 'scheduler' as UserRole,
    icon: Calendar,
    title: 'Crew Scheduler',
    subtitle: 'Planning Team',
    capabilities: [
      'AI-powered roster optimization',
      'Pairing assignment & bidding',
      'Cost analysis & forecasting'
    ],
    color: 'from-slate-900 via-violet-900 to-purple-900',
    accent: 'from-purple-500/80 to-pink-500/80'
  },
  {
    role: 'crew-scheduler' as UserRole,
    icon: Calendar,
    title: 'Crew Scheduling System',
    subtitle: 'Regulatory Compliance & Rostering',
    capabilities: [
      'Regulatory rule engine & compliance',
      'Automated roster generation',
      'Disruption management & reassignment'
    ],
    color: 'from-slate-900 via-indigo-900 to-blue-900',
    accent: 'from-indigo-500/80 to-blue-500/80'
  },
  {
    role: 'controller' as UserRole,
    icon: Target,
    title: 'Crew Controller',
    subtitle: 'Real-time Operations',
    capabilities: [
      'Live disruption management',
      'Instant crew reassignment',
      'Reserve crew coordination'
    ],
    color: 'from-slate-900 via-rose-900 to-red-900',
    accent: 'from-rose-500/80 to-orange-500/80'
  },
  {
    role: 'payroll' as UserRole,
    icon: DollarSign,
    title: 'Payroll Admin',
    subtitle: 'Finance Team',
    capabilities: [
      'AI-validated claim processing',
      'Automated pay calculations',
      'Compliance audit trails'
    ],
    color: 'from-slate-900 via-emerald-900 to-teal-900',
    accent: 'from-emerald-500/80 to-teal-500/80'
  },
  {
    role: 'management' as UserRole,
    icon: BarChart3,
    title: 'Operations Manager',
    subtitle: 'Executive Leadership',
    capabilities: [
      'Real-time KPI dashboards',
      'Cost optimization insights',
      'Predictive staffing analytics'
    ],
    color: 'from-slate-900 via-amber-900 to-orange-900',
    accent: 'from-amber-500/80 to-orange-500/80'
  },
  {
    role: 'union' as UserRole,
    icon: Scale,
    title: 'Union Representative',
    subtitle: 'Workplace Advocacy',
    capabilities: [
      'Contract compliance monitoring',
      'Violation detection & alerts',
      'Member advocacy analytics'
    ],
    color: 'from-slate-900 via-teal-900 to-cyan-900',
    accent: 'from-teal-500/80 to-cyan-500/80'
  },
  {
    role: 'executive' as UserRole,
    icon: Building2,
    title: 'Executive Dashboard',
    subtitle: 'C-Suite Leadership',
    capabilities: [
      'Complete airline operations overview',
      'Multi-level operational dashboards',
      'Strategic KPI monitoring'
    ],
    color: 'from-slate-900 via-indigo-900 to-slate-900',
    accent: 'from-indigo-500/80 to-blue-500/80'
  }
] as const;

export default function LandingPage({ onSelectRole }: LandingPageProps) {
  const [showTestGenerator2, setShowTestGenerator2] = useState(false);
  const [showTestLab, setShowTestLab] = useState(false);
  const [showFleetManagement, setShowFleetManagement] = useState(false);
  const [showFleetDataManagement, setShowFleetDataManagement] = useState(false);
  const [showCrewController2, setShowCrewController2] = useState(false);

  // If showing test generator 2.0, render it full screen
  if (showTestGenerator2) {
    return <TestGenerator2Page onBack={() => setShowTestGenerator2(false)} />;
  }

  // If showing test lab, render it full screen
  if (showTestLab) {
    return <TestLabPage onBack={() => setShowTestLab(false)} />;
  }

  // If showing fleet management, render it full screen
  if (showFleetManagement) {
    return <FleetManagementPage onBack={() => setShowFleetManagement(false)} />;
  }

  // If showing fleet data management, render it full screen
  if (showFleetDataManagement) {
    return <FleetDataManagementPage onBack={() => setShowFleetDataManagement(false)} />;
  }

  // If showing crew controller 2.0, render it full screen
  if (showCrewController2) {
    return <CrewController2 />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <img
            src="/image copy.png"
            alt="Copa Airlines"
            className="h-24 w-auto mx-auto mb-6"
          />
          <h1 className="text-5xl font-bold text-white mb-4">
            Airline Crew Operating System
          </h1>
          <p className="text-xl text-blue-400 mb-2">
            Powered by AI from dCortex
          </p>
          <p className="text-slate-300 max-w-2xl mx-auto">
            Unified platform for airline crew operations across all departments
          </p>
        </div>

        {/* Persona Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {personas.map((persona) => {
              const Icon = persona.icon;
              return (
                <button
                  key={persona.role}
                  onClick={() => onSelectRole(persona.role)}
                  className="bg-slate-900/60 border border-white/10 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 text-left overflow-hidden backdrop-blur"
                >
                  <div className={`relative bg-gradient-to-br ${persona.color} p-6`}>
                    <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.3),_transparent_45%)]" />
                    <Icon className="relative w-12 h-12 text-white mb-3" />
                    <h3 className="relative text-xl font-bold text-white">{persona.title}</h3>
                    <p className="relative text-white/80 text-sm">{persona.subtitle}</p>
                  </div>
                  <div className="p-6 bg-slate-950/40">
                    <ul className="space-y-2 text-sm text-slate-200 mb-6">
                      {persona.capabilities.map((capability, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-emerald-300 mr-2">✓</span>
                          {capability}
                        </li>
                      ))}
                    </ul>
                    <div className={`w-full bg-gradient-to-r ${persona.accent} border border-white/10 text-white/90 py-3 rounded-lg hover:opacity-90 transition-opacity font-semibold text-center`}>
                      Login as {persona.title}
                    </div>
                  </div>
                </button>
              );
            })}

            {/* Test Generator 2.0 Card */}
            <button
              onClick={() => setShowTestGenerator2(true)}
              className="bg-slate-900/60 border border-pink-500/30 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 text-left overflow-hidden backdrop-blur"
            >
              <div className="relative bg-gradient-to-br from-purple-900 via-pink-900 to-slate-900 p-6">
                <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.3),_transparent_45%)]" />
                <Sparkles className="relative w-12 h-12 text-white mb-3" />
                <h3 className="relative text-xl font-bold text-white">Test Generator 2.0</h3>
                <p className="relative text-white/80 text-sm">Next-Gen AI Test Data</p>
              </div>
              <div className="p-6 bg-slate-950/40">
                <ul className="space-y-2 text-sm text-slate-200 mb-6">
                  <li className="flex items-start">
                    <span className="text-emerald-300 mr-2">✓</span>
                    Enhanced input preview
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-300 mr-2">✓</span>
                    Review & Submit workflow
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-300 mr-2">✓</span>
                    Token tracking & cost estimates
                  </li>
                </ul>
                <div className="w-full bg-gradient-to-r from-pink-500/80 to-purple-500/80 border border-white/10 text-white/90 py-3 rounded-lg hover:opacity-90 transition-opacity font-semibold text-center">
                  Open Test Generator 2.0
                </div>
              </div>
            </button>

            {/* Test Lab Card */}
            <button
              onClick={() => setShowTestLab(true)}
              className="bg-slate-900/60 border border-cyan-500/30 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 text-left overflow-hidden backdrop-blur"
            >
              <div className="relative bg-gradient-to-br from-cyan-900 via-blue-900 to-slate-900 p-6">
                <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.3),_transparent_45%)]" />
                <FlaskConical className="relative w-12 h-12 text-white mb-3" />
                <h3 className="relative text-xl font-bold text-white">Test Lab</h3>
                <p className="relative text-white/80 text-sm">Workflow-Specific Testing</p>
              </div>
              <div className="p-6 bg-slate-950/40">
                <ul className="space-y-2 text-sm text-slate-200 mb-6">
                  <li className="flex items-start">
                    <span className="text-emerald-300 mr-2">✓</span>
                    8 pre-built scenarios (COPA & Avelo)
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-300 mr-2">✓</span>
                    Real-time agent reasoning display
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-300 mr-2">✓</span>
                    Role-based demo views
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-300 mr-2">✓</span>
                    Export results to PDF/CSV
                  </li>
                </ul>
                <div className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 border border-white/10 text-white/90 py-3 rounded-lg hover:opacity-90 transition-opacity font-semibold text-center">
                  Launch Test Lab
                </div>
              </div>
            </button>

            {/* Fleet Management Card */}
            <button
              onClick={() => setShowFleetManagement(true)}
              className="bg-slate-900/60 border border-sky-500/30 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 text-left overflow-hidden backdrop-blur"
            >
              <div className="relative bg-gradient-to-br from-sky-900 via-blue-900 to-slate-900 p-6">
                <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.3),_transparent_45%)]" />
                <Plane className="relative w-12 h-12 text-white mb-3" />
                <h3 className="relative text-xl font-bold text-white">Fleet Management</h3>
                <p className="relative text-white/80 text-sm">Aircraft Database MCP</p>
              </div>
              <div className="p-6 bg-slate-950/40">
                <ul className="space-y-2 text-sm text-slate-200 mb-6">
                  <li className="flex items-start">
                    <span className="text-emerald-300 mr-2">✓</span>
                    240 aircraft across 10 airlines
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-300 mr-2">✓</span>
                    Real-time fleet statistics
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-300 mr-2">✓</span>
                    Aircraft type breakdowns
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-300 mr-2">✓</span>
                    MCP server integration demo
                  </li>
                </ul>
                <div className="w-full bg-gradient-to-r from-sky-500 to-blue-600 border border-white/10 text-white/90 py-3 rounded-lg hover:opacity-90 transition-opacity font-semibold text-center">
                  View Fleet Data
                </div>
              </div>
            </button>

            {/* Fleet Data Management & Scraping Card */}
            <button
              onClick={() => setShowFleetDataManagement(true)}
              className="bg-slate-900/60 border border-blue-500/30 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 text-left overflow-hidden backdrop-blur"
            >
              <div className="relative bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 p-6">
                <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.3),_transparent_45%)]" />
                <Database className="relative w-12 h-12 text-white mb-3" />
                <h3 className="relative text-xl font-bold text-white">Fleet Data Management</h3>
                <p className="relative text-white/80 text-sm">AI-Powered Scraping & Backup</p>
              </div>
              <div className="p-6 bg-slate-950/40">
                <ul className="space-y-2 text-sm text-slate-200 mb-6">
                  <li className="flex items-start">
                    <span className="text-emerald-300 mr-2">✓</span>
                    Automated fleet data scraping
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-300 mr-2">✓</span>
                    Real-time job monitoring
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-300 mr-2">✓</span>
                    Backup & rollback management
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-300 mr-2">✓</span>
                    Data quality tracking
                  </li>
                </ul>
                <div className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 border border-white/10 text-white/90 py-3 rounded-lg hover:opacity-90 transition-opacity font-semibold text-center">
                  Manage Fleet Data
                </div>
              </div>
            </button>

            {/* Crew Controller 2.0 Card */}
            <button
              onClick={() => setShowCrewController2(true)}
              className="bg-slate-900/60 border border-violet-500/30 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 text-left overflow-hidden backdrop-blur"
            >
              <div className="relative bg-gradient-to-br from-violet-900 via-purple-900 to-slate-900 p-6">
                <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.3),_transparent_45%)]" />
                <Zap className="relative w-12 h-12 text-white mb-3" />
                <h3 className="relative text-xl font-bold text-white">Crew Controller 2.0</h3>
                <p className="relative text-white/80 text-sm">AI-Powered Operations Intelligence</p>
              </div>
              <div className="p-6 bg-slate-950/40">
                <ul className="space-y-2 text-sm text-slate-200 mb-6">
                  <li className="flex items-start">
                    <span className="text-emerald-300 mr-2">✓</span>
                    6 interactive scenario visualizations
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-300 mr-2">✓</span>
                    Weather exposure & crew fatigue analysis
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-300 mr-2">✓</span>
                    Reserve coverage maps & day comparisons
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-300 mr-2">✓</span>
                    Root cause analytics & AI insights
                  </li>
                </ul>
                <div className="w-full bg-gradient-to-r from-violet-500 to-purple-600 border border-white/10 text-white/90 py-3 rounded-lg hover:opacity-90 transition-opacity font-semibold text-center">
                  Explore AI Intelligence
                </div>
              </div>
            </button>
          </div>

          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-blue-400/50">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-sm text-white">
                Demo Mode - Select any persona to explore the platform
              </span>
            </div>
          </div>

        <div className="mt-12 text-center text-slate-400 text-sm">
          <p>© 2024 Airline Crew Operating System</p>
        </div>
      </div>
    </div>
  );
}
