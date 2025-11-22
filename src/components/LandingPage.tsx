import { Plane, Calendar, Target, DollarSign, BarChart3, Scale, Sparkles, Zap, Brain } from 'lucide-react';
import { UserRole } from '../types';

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
    color: 'from-blue-500 to-blue-600'
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
    color: 'from-purple-500 to-purple-600'
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
    color: 'from-red-500 to-red-600'
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
    color: 'from-green-500 to-green-600'
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
    color: 'from-amber-500 to-amber-600'
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
    color: 'from-teal-500 to-teal-600'
  }
];

export default function LandingPage({ onSelectRole }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent" />
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 backdrop-blur-sm rounded-full border border-blue-400/30 mb-6">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-300 font-medium">AI-Powered Crew Intelligence</span>
          </div>

          <img
            src="/image copy.png"
            alt="Copa Airlines"
            className="h-24 w-auto mx-auto mb-8 drop-shadow-2xl"
          />

          <h1 className="text-6xl font-bold text-white mb-4 tracking-tight">
            Airline Crew Operating System
          </h1>
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-6 h-6 text-blue-400" />
            <p className="text-2xl bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent font-semibold">
              Powered by Advanced AI
            </p>
            <Zap className="w-6 h-6 text-cyan-400" />
          </div>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Unified intelligent platform for airline crew operations across all departments
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {personas.map((persona) => {
            const Icon = persona.icon;
            return (
              <button
                key={persona.role}
                onClick={() => onSelectRole(persona.role)}
                className="group bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 text-left overflow-hidden border border-gray-100"
              >
                <div className={`bg-gradient-to-br ${persona.color} p-6 relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                  <Icon className="w-12 h-12 text-white mb-3 relative z-10 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold text-white relative z-10">{persona.title}</h3>
                  <p className="text-white/90 text-sm relative z-10">{persona.subtitle}</p>
                </div>
                <div className="p-6 bg-white">
                  <ul className="space-y-2.5 text-sm text-gray-700 mb-6">
                    {persona.capabilities.map((capability, idx) => (
                      <li key={idx} className="flex items-start">
                        <Sparkles className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{capability}</span>
                      </li>
                    ))}
                  </ul>
                  <div className={`w-full bg-gradient-to-r ${persona.color} text-white py-3 rounded-xl group-hover:shadow-lg transition-all font-semibold text-center text-sm`}>
                    Access {persona.title} Portal
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-16 text-center space-y-6">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-blue-400/50 shadow-lg">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </div>
            <span className="text-sm text-white font-medium">
              Demo Mode - Select any persona to explore the AI-powered platform
            </span>
          </div>

          <div className="flex items-center justify-center gap-8 text-slate-400 text-xs">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              <span>AI-Powered Insights</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>Real-time Intelligence</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Smart Automation</span>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center text-slate-500 text-sm">
          <p>© 2024 Copa Airlines - AI-Powered Crew Operating System</p>
        </div>
      </div>
    </div>
  );
}
