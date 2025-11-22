import { ReactNode, useState } from 'react';
import { LogOut, Home, Calendar, Users, DollarSign, BarChart3, Shield } from 'lucide-react';
import { UserRole } from '../types';
import FloatingAIChat from './FloatingAIChat';

interface DashboardLayoutProps {
  role: UserRole;
  onLogout: () => void;
  children: ReactNode;
  sidebar: ReactNode;
  title: string;
}

const roleConfig = {
  'crew-member': { name: 'Crew Member', color: 'blue', icon: Users },
  'scheduler': { name: 'Crew Scheduler', color: 'purple', icon: Calendar },
  'controller': { name: 'Crew Controller', color: 'red', icon: Shield },
  'payroll': { name: 'Payroll Admin', color: 'green', icon: DollarSign },
  'management': { name: 'Operations Manager', color: 'amber', icon: BarChart3 },
  'union': { name: 'Union Representative', color: 'teal', icon: Users }
};

export default function DashboardLayout({ role, onLogout, children, sidebar, title }: DashboardLayoutProps) {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const config = roleConfig[role];
  const RoleIcon = config.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <img
                  src="/image copy.png"
                  alt="Copa Airlines"
                  className="h-10 w-auto"
                />
                <div className="border-l border-gray-300 pl-3">
                  <h1 className="text-sm font-bold text-gray-900">{title}</h1>
                  <p className="text-xs text-blue-600">AI-Powered Crew System</p>
                </div>
              </div>

              <div className="hidden md:flex items-center space-x-1">
                {sidebar}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-3 px-3 py-1.5 bg-gray-50 rounded-lg">
                <RoleIcon className="w-4 h-4 text-blue-600" />
                <div className="text-right">
                  <span className="text-xs font-medium text-gray-900 block">Captain Sarah Martinez</span>
                  <div className="text-xs text-gray-600">{config.name}</div>
                </div>
              </div>
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-xs">SM</span>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto px-6 py-6">
        {children}
      </main>

      <FloatingAIChat role={role} />
    </div>
  );
}
