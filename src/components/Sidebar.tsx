import { Home, Calendar, Users, DollarSign, BarChart3, FileText, Settings } from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  role: UserRole;
}

const sidebarMenus: Record<UserRole, Array<{ icon: any; label: string; active?: boolean }>> = {
  'crew-member': [
    { icon: Home, label: 'Dashboard', active: true },
    { icon: Calendar, label: 'Schedule' },
    { icon: DollarSign, label: 'Pay & Claims' },
    { icon: FileText, label: 'Documents' },
    { icon: Settings, label: 'Settings' }
  ],
  'scheduler': [
    { icon: Home, label: 'Planning Dashboard', active: true },
    { icon: Calendar, label: 'Roster Builder' },
    { icon: Users, label: 'Crew Management' },
    { icon: BarChart3, label: 'Analytics' },
    { icon: Settings, label: 'Settings' }
  ],
  'controller': [
    { icon: Home, label: 'Operations Center', active: true },
    { icon: Users, label: 'Active Crew' },
    { icon: Calendar, label: 'Reserve Pool' },
    { icon: FileText, label: 'Disruptions' },
    { icon: Settings, label: 'Settings' }
  ],
  'payroll': [
    { icon: Home, label: 'Payroll Dashboard', active: true },
    { icon: FileText, label: 'Claims Review' },
    { icon: DollarSign, label: 'Payments' },
    { icon: BarChart3, label: 'Reports' },
    { icon: Settings, label: 'Settings' }
  ],
  'management': [
    { icon: Home, label: 'Executive Dashboard', active: true },
    { icon: BarChart3, label: 'Analytics' },
    { icon: DollarSign, label: 'Cost Management' },
    { icon: Users, label: 'Workforce Planning' },
    { icon: Settings, label: 'Settings' }
  ],
  'union': [
    { icon: Home, label: 'Compliance Dashboard', active: true },
    { icon: FileText, label: 'Violations' },
    { icon: Users, label: 'Grievances' },
    { icon: BarChart3, label: 'Reports' },
    { icon: Settings, label: 'Settings' }
  ]
};

export default function Sidebar({ role }: SidebarProps) {
  const menuItems = sidebarMenus[role] || [];

  return (
    <nav className="flex items-center space-x-1">
      {menuItems.map((item, idx) => {
        const Icon = item.icon;
        return (
          <button
            key={idx}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm ${
              item.active
                ? 'bg-blue-600 text-white font-medium shadow-sm'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden lg:inline">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
