import React, { useState } from 'react';
import {
  BarChart3,
  DollarSign,
  FileText,
  TrendingUp,
  Users,
  Clock,
  Plane,
  AlertCircle,
  CheckCircle,
  TrendingDown,
  Calendar,
  Download,
  Filter,
  ChevronRight,
  Sparkles,
  Target,
  PieChart,
  Activity
} from 'lucide-react';

type TabType = 'utilization' | 'cost' | 'compliance' | 'forecasting';

interface UtilizationMetric {
  crewMember: string;
  employeeId: string;
  creditHours: number;
  flightHours: number;
  dutyHours: number;
  utilizationRate: number;
  trips: number;
  status: 'optimal' | 'underutilized' | 'overutilized';
}

interface CostMetric {
  category: string;
  budgeted: number;
  actual: number;
  variance: number;
  variancePercent: number;
  trend: 'up' | 'down' | 'stable';
}

interface ComplianceIssue {
  id: string;
  type: 'rest' | 'duty' | 'medical' | 'training' | 'documentation';
  severity: 'critical' | 'warning' | 'info';
  crewMember: string;
  description: string;
  dueDate: string;
  status: 'overdue' | 'due-soon' | 'compliant';
}

interface ForecastData {
  month: string;
  requiredCrew: number;
  availableCrew: number;
  surplus: number;
  projectedCost: number;
  confidence: number;
}

// Mock data
const utilizationData: UtilizationMetric[] = [
  { crewMember: 'Rodriguez, Maria', employeeId: 'EMP-1045', creditHours: 87, flightHours: 82, dutyHours: 95, utilizationRate: 96, trips: 18, status: 'optimal' },
  { crewMember: 'Chen, David', employeeId: 'EMP-1156', creditHours: 92, flightHours: 88, dutyHours: 102, utilizationRate: 102, trips: 20, status: 'overutilized' },
  { crewMember: 'Johnson, Sarah', employeeId: 'EMP-1089', creditHours: 65, flightHours: 61, dutyHours: 72, utilizationRate: 72, trips: 14, status: 'underutilized' },
  { crewMember: 'Williams, James', employeeId: 'EMP-1134', creditHours: 85, flightHours: 80, dutyHours: 93, utilizationRate: 94, trips: 17, status: 'optimal' },
  { crewMember: 'Martinez, Ana', employeeId: 'EMP-1201', creditHours: 78, flightHours: 74, dutyHours: 86, utilizationRate: 87, trips: 16, status: 'optimal' },
  { crewMember: 'Lee, Michael', employeeId: 'EMP-1178', creditHours: 58, flightHours: 54, dutyHours: 65, utilizationRate: 64, trips: 12, status: 'underutilized' },
];

const costData: CostMetric[] = [
  { category: 'Base Salaries', budgeted: 1250000, actual: 1248500, variance: -1500, variancePercent: -0.12, trend: 'down' },
  { category: 'Premium Pay', budgeted: 185000, actual: 198400, variance: 13400, variancePercent: 7.24, trend: 'up' },
  { category: 'Per Diem', budgeted: 95000, actual: 89200, variance: -5800, variancePercent: -6.11, trend: 'down' },
  { category: 'Training Costs', budgeted: 125000, actual: 132800, variance: 7800, variancePercent: 6.24, trend: 'up' },
  { category: 'Overtime', budgeted: 78000, actual: 94500, variance: 16500, variancePercent: 21.15, trend: 'up' },
  { category: 'Benefits', budgeted: 425000, actual: 422100, variance: -2900, variancePercent: -0.68, trend: 'stable' },
];

const complianceIssues: ComplianceIssue[] = [
  { id: 'C001', type: 'medical', severity: 'critical', crewMember: 'Rodriguez, Maria', description: 'Medical certificate expires in 5 days', dueDate: '2024-11-27', status: 'due-soon' },
  { id: 'C002', type: 'rest', severity: 'warning', crewMember: 'Chen, David', description: 'Minimum rest period violation - 9.2hrs (req: 10hrs)', dueDate: '2024-11-22', status: 'overdue' },
  { id: 'C003', type: 'training', severity: 'warning', crewMember: 'Johnson, Sarah', description: 'Annual recurrent training due', dueDate: '2024-12-01', status: 'due-soon' },
  { id: 'C004', type: 'duty', severity: 'critical', crewMember: 'Williams, James', description: 'Monthly duty hours: 98/95 limit', dueDate: '2024-11-22', status: 'overdue' },
  { id: 'C005', type: 'documentation', severity: 'info', crewMember: 'Martinez, Ana', description: 'Missing trip report for Flight 1245', dueDate: '2024-11-25', status: 'due-soon' },
  { id: 'C006', type: 'training', severity: 'warning', crewMember: 'Lee, Michael', description: '737-MAX certification renewal required', dueDate: '2024-12-05', status: 'due-soon' },
];

const forecastData: ForecastData[] = [
  { month: 'Dec 2024', requiredCrew: 112, availableCrew: 115, surplus: 3, projectedCost: 2145000, confidence: 94 },
  { month: 'Jan 2025', requiredCrew: 108, availableCrew: 115, surplus: 7, projectedCost: 2089000, confidence: 91 },
  { month: 'Feb 2025', requiredCrew: 118, availableCrew: 115, surplus: -3, projectedCost: 2234000, confidence: 88 },
  { month: 'Mar 2025', requiredCrew: 125, availableCrew: 118, surplus: -7, projectedCost: 2398000, confidence: 85 },
  { month: 'Apr 2025', requiredCrew: 130, availableCrew: 118, surplus: -12, projectedCost: 2512000, confidence: 82 },
  { month: 'May 2025', requiredCrew: 128, availableCrew: 121, surplus: -7, projectedCost: 2467000, confidence: 79 },
];

const AnalyticsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('utilization');

  const tabs = [
    { id: 'utilization' as TabType, label: 'Utilization Metrics', icon: BarChart3 },
    { id: 'cost' as TabType, label: 'Cost Analysis', icon: DollarSign },
    { id: 'compliance' as TabType, label: 'Compliance Reports', icon: FileText },
    { id: 'forecasting' as TabType, label: 'Forecasting', icon: TrendingUp },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics & Reporting</h1>
        <p className="text-gray-600">Comprehensive insights into crew operations, costs, and compliance</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 border-b border-gray-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-[#003087] border-b-2 border-[#003087]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'utilization' && <UtilizationMetricsTab data={utilizationData} />}
        {activeTab === 'cost' && <CostAnalysisTab data={costData} />}
        {activeTab === 'compliance' && <ComplianceReportsTab data={complianceIssues} />}
        {activeTab === 'forecasting' && <ForecastingTab data={forecastData} />}
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
        Powered by AI from dCortex
      </div>
    </div>
  );
};

// Tab 1: Utilization Metrics
const UtilizationMetricsTab: React.FC<{ data: UtilizationMetric[] }> = ({ data }) => {
  const avgUtilization = Math.round(data.reduce((sum, d) => sum + d.utilizationRate, 0) / data.length);
  const optimalCount = data.filter(d => d.status === 'optimal').length;
  const underutilizedCount = data.filter(d => d.status === 'underutilized').length;
  const overutilizedCount = data.filter(d => d.status === 'overutilized').length;
  const totalCreditHours = data.reduce((sum, d) => sum + d.creditHours, 0);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Avg Utilization</span>
            <Activity className="w-4 h-4 text-[#003087]" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{avgUtilization}%</div>
          <div className="text-xs text-green-600 mt-1">Target: 85-95%</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Credit Hours</span>
            <Clock className="w-4 h-4 text-[#FFB81C]" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalCreditHours}</div>
          <div className="text-xs text-gray-500 mt-1">This month</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Optimal Crew</span>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{optimalCount}</div>
          <div className="text-xs text-gray-500 mt-1">85-95% utilization</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Needs Attention</span>
            <AlertCircle className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{underutilizedCount + overutilizedCount}</div>
          <div className="text-xs text-orange-600 mt-1">{underutilizedCount} under, {overutilizedCount} over</div>
        </div>
      </div>

      {/* AI Insights Panel */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Sparkles className="w-5 h-5 text-[#003087] mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">AI Optimization Insights</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <ChevronRight className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>Sarah Johnson</strong> and <strong>Michael Lee</strong> are underutilized (64-72%). Recommend assigning 2-3 additional trips each to reach optimal range.</span>
              </li>
              <li className="flex items-start">
                <ChevronRight className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>David Chen</strong> is overutilized (102%). Recommend redistributing 1-2 trips to underutilized crew to prevent fatigue.</span>
              </li>
              <li className="flex items-start">
                <ChevronRight className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>Projected savings of <strong>$8,400/month</strong> by optimizing crew utilization and reducing premium pay for overtime.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Utilization Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Crew Utilization Details</h3>
          <div className="flex space-x-2">
            <button className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center space-x-1">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
            <button className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center space-x-1">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crew Member</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Credit Hrs</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Flight Hrs</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Duty Hrs</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Trips</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Utilization</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.crewMember}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.employeeId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{row.creditHours}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{row.flightHours}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{row.dutyHours}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{row.trips}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-semibold">
                    {row.utilizationRate}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {row.status === 'optimal' && (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">Optimal</span>
                    )}
                    {row.status === 'underutilized' && (
                      <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">Underutilized</span>
                    )}
                    {row.status === 'overutilized' && (
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">Overutilized</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Chart Placeholder */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Utilization Distribution</h3>
        <div className="h-64 flex items-end justify-around space-x-4 border-b border-l border-gray-300 p-4">
          {data.map((d, idx) => (
            <div key={idx} className="flex flex-col items-center flex-1">
              <div
                className={`w-full rounded-t transition-all ${
                  d.status === 'optimal' ? 'bg-green-500' :
                  d.status === 'underutilized' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ height: `${d.utilizationRate * 2}px` }}
              />
              <span className="text-xs text-gray-600 mt-2 text-center">{d.crewMember.split(',')[0]}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-center space-x-6 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded mr-2" />
            <span>Optimal (85-95%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded mr-2" />
            <span>Underutilized (&lt;85%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded mr-2" />
            <span>Overutilized (&gt;95%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Tab 2: Cost Analysis
const CostAnalysisTab: React.FC<{ data: CostMetric[] }> = ({ data }) => {
  const totalBudgeted = data.reduce((sum, d) => sum + d.budgeted, 0);
  const totalActual = data.reduce((sum, d) => sum + d.actual, 0);
  const totalVariance = totalActual - totalBudgeted;
  const variancePercent = ((totalVariance / totalBudgeted) * 100).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Budget</span>
            <Target className="w-4 h-4 text-[#003087]" />
          </div>
          <div className="text-2xl font-bold text-gray-900">${(totalBudgeted / 1000000).toFixed(2)}M</div>
          <div className="text-xs text-gray-500 mt-1">November 2024</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Actual Spend</span>
            <DollarSign className="w-4 h-4 text-[#FFB81C]" />
          </div>
          <div className="text-2xl font-bold text-gray-900">${(totalActual / 1000000).toFixed(2)}M</div>
          <div className="text-xs text-gray-500 mt-1">Month to date</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Variance</span>
            {totalVariance > 0 ? (
              <TrendingUp className="w-4 h-4 text-red-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-green-500" />
            )}
          </div>
          <div className={`text-2xl font-bold ${totalVariance > 0 ? 'text-red-600' : 'text-green-600'}`}>
            ${Math.abs(totalVariance / 1000).toFixed(0)}K
          </div>
          <div className="text-xs text-gray-500 mt-1">{variancePercent}% vs budget</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Cost Per Flight Hour</span>
            <Plane className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">$428</div>
          <div className="text-xs text-green-600 mt-1">↓ 3.2% vs last month</div>
        </div>
      </div>

      {/* AI Cost Insights */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Sparkles className="w-5 h-5 text-green-700 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">Cost Optimization Opportunities</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <ChevronRight className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>Overtime is 21% over budget</strong> ($16.5K). Recommend better trip distribution to reduce premium pay.</span>
              </li>
              <li className="flex items-start">
                <ChevronRight className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>Per Diem under budget</strong> by $5.8K. Efficient trip planning is reducing hotel stays.</span>
              </li>
              <li className="flex items-start">
                <ChevronRight className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>Potential savings: $24K/month</strong> by optimizing crew scheduling and reducing overtime by 40%.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Cost Breakdown Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Cost Category Breakdown</h3>
          <div className="flex space-x-2">
            <button className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>This Month</span>
            </button>
            <button className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center space-x-1">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Budgeted</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actual</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Variance</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">% Variance</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    ${row.budgeted.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-semibold">
                    ${row.actual.toLocaleString()}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${
                    row.variance > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {row.variance > 0 ? '+' : ''}${row.variance.toLocaleString()}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${
                    Math.abs(row.variancePercent) > 10 ? 'text-red-600 font-semibold' :
                    Math.abs(row.variancePercent) > 5 ? 'text-orange-600' :
                    'text-gray-900'
                  }`}>
                    {row.variancePercent > 0 ? '+' : ''}{row.variancePercent.toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {row.trend === 'up' && <TrendingUp className="w-4 h-4 text-red-500 mx-auto" />}
                    {row.trend === 'down' && <TrendingDown className="w-4 h-4 text-green-500 mx-auto" />}
                    {row.trend === 'stable' && <span className="text-gray-400">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2 border-gray-300">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">TOTAL</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                  ${totalBudgeted.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                  ${totalActual.toLocaleString()}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right ${
                  totalVariance > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {totalVariance > 0 ? '+' : ''}${totalVariance.toLocaleString()}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right ${
                  parseFloat(variancePercent) > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {variancePercent}%
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Cost Visualization */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget vs Actual</h3>
          <div className="space-y-4">
            {data.map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{item.category}</span>
                  <span className="font-medium">{((item.actual / totalActual) * 100).toFixed(1)}%</span>
                </div>
                <div className="relative h-8 bg-gray-100 rounded overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-blue-200 opacity-50"
                    style={{ width: `${(item.budgeted / totalBudgeted) * 100}%` }}
                  />
                  <div
                    className={`absolute top-0 left-0 h-full ${
                      item.variance > 0 ? 'bg-red-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${(item.actual / totalBudgeted) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Cost Drivers</h3>
          <div className="space-y-3">
            {[...data].sort((a, b) => b.actual - a.actual).slice(0, 4).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{item.category}</div>
                  <div className="text-sm text-gray-500">${item.actual.toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-semibold ${
                    item.variance > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {item.variance > 0 ? '+' : ''}{item.variancePercent.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Tab 3: Compliance Reports
const ComplianceReportsTab: React.FC<{ data: ComplianceIssue[] }> = ({ data }) => {
  const criticalCount = data.filter(d => d.severity === 'critical').length;
  const warningCount = data.filter(d => d.severity === 'warning').length;
  const overdueCount = data.filter(d => d.status === 'overdue').length;
  const complianceRate = ((data.length - criticalCount - warningCount) / data.length * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Compliance Rate</span>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{complianceRate}%</div>
          <div className="text-xs text-gray-500 mt-1">Overall compliance</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Critical Issues</span>
            <AlertCircle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-600">{criticalCount}</div>
          <div className="text-xs text-red-600 mt-1">Requires immediate action</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Warnings</span>
            <AlertCircle className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-orange-600">{warningCount}</div>
          <div className="text-xs text-orange-600 mt-1">Monitor closely</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Overdue Items</span>
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-purple-600">{overdueCount}</div>
          <div className="text-xs text-purple-600 mt-1">Past due date</div>
        </div>
      </div>

      {/* AI Compliance Insights */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">Critical Compliance Alerts</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <ChevronRight className="w-4 h-4 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>David Chen</strong> has a rest period violation (9.2hrs vs 10hrs required). Trip CM-1156 needs review.</span>
              </li>
              <li className="flex items-start">
                <ChevronRight className="w-4 h-4 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>James Williams</strong> exceeded monthly duty hour limit (98/95). No additional trips should be assigned this month.</span>
              </li>
              <li className="flex items-start">
                <ChevronRight className="w-4 h-4 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>Maria Rodriguez</strong> medical certificate expires in 5 days. Grounding risk if not renewed immediately.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Compliance Issues Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Active Compliance Issues</h3>
          <div className="flex space-x-2">
            <button className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center space-x-1">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
            <button className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center space-x-1">
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crew Member</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((issue) => (
                <tr key={issue.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{issue.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded capitalize">
                      {issue.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {issue.severity === 'critical' && (
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">Critical</span>
                    )}
                    {issue.severity === 'warning' && (
                      <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded">Warning</span>
                    )}
                    {issue.severity === 'info' && (
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">Info</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{issue.crewMember}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">{issue.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{issue.dueDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {issue.status === 'overdue' && (
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">Overdue</span>
                    )}
                    {issue.status === 'due-soon' && (
                      <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">Due Soon</span>
                    )}
                    {issue.status === 'compliant' && (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">Compliant</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compliance by Category */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Issues by Type</h3>
          <div className="space-y-3">
            {['rest', 'duty', 'medical', 'training', 'documentation'].map((type) => {
              const count = data.filter(d => d.type === type).length;
              const percentage = (count / data.length) * 100;
              return (
                <div key={type}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 capitalize">{type}</span>
                    <span className="font-medium">{count} issues</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded overflow-hidden">
                    <div
                      className="h-full bg-[#003087]"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Recommendations</h3>
          <div className="space-y-3">
            <div className="flex items-start p-3 bg-blue-50 rounded border border-blue-200">
              <CheckCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <div className="font-medium text-gray-900">Automate Medical Renewals</div>
                <div className="text-gray-600 mt-1">Send automated reminders 30 days before certificate expiration</div>
              </div>
            </div>
            <div className="flex items-start p-3 bg-blue-50 rounded border border-blue-200">
              <CheckCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <div className="font-medium text-gray-900">Rest Period Monitoring</div>
                <div className="text-gray-600 mt-1">Implement AI-powered rest period validation before trip assignment</div>
              </div>
            </div>
            <div className="flex items-start p-3 bg-blue-50 rounded border border-blue-200">
              <CheckCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <div className="font-medium text-gray-900">Training Schedule Integration</div>
                <div className="text-gray-600 mt-1">Block crew from trip assignments during recurrent training periods</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Tab 4: Forecasting
const ForecastingTab: React.FC<{ data: ForecastData[] }> = ({ data }) => {
  const avgSurplus = data.reduce((sum, d) => sum + d.surplus, 0) / data.length;
  const shortageMonths = data.filter(d => d.surplus < 0).length;
  const totalProjectedCost = data.reduce((sum, d) => sum + d.projectedCost, 0);
  const avgConfidence = (data.reduce((sum, d) => sum + d.confidence, 0) / data.length).toFixed(0);

  return (
    <div className="space-y-6">
      {/* Forecast Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Avg Crew Surplus</span>
            <Users className="w-4 h-4 text-[#003087]" />
          </div>
          <div className={`text-2xl font-bold ${avgSurplus >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {avgSurplus > 0 ? '+' : ''}{avgSurplus.toFixed(0)}
          </div>
          <div className="text-xs text-gray-500 mt-1">Next 6 months</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Shortage Periods</span>
            <AlertCircle className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-orange-600">{shortageMonths}</div>
          <div className="text-xs text-orange-600 mt-1">Months with deficit</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Projected Cost</span>
            <DollarSign className="w-4 h-4 text-[#FFB81C]" />
          </div>
          <div className="text-2xl font-bold text-gray-900">${(totalProjectedCost / 1000000).toFixed(1)}M</div>
          <div className="text-xs text-gray-500 mt-1">6-month total</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Forecast Confidence</span>
            <Target className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{avgConfidence}%</div>
          <div className="text-xs text-gray-500 mt-1">AI prediction accuracy</div>
        </div>
      </div>

      {/* AI Forecasting Insights */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Sparkles className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">AI Staffing Predictions & Recommendations</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <ChevronRight className="w-4 h-4 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>March-May 2025: Crew shortage expected</strong> (7-12 crew deficit). Recommend starting hiring process in January 2025.</span>
              </li>
              <li className="flex items-start">
                <ChevronRight className="w-4 h-4 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>December-January: Surplus capacity</strong> (3-7 crew). Opportunity for additional training or voluntary time off.</span>
              </li>
              <li className="flex items-start">
                <ChevronRight className="w-4 h-4 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>Cost projection: $2.47M average/month</strong>. Staffing optimization could reduce by 8-12% ($200K-300K/month).</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Forecast Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">6-Month Staffing Forecast</h3>
          <div className="flex space-x-2">
            <button className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center space-x-1">
              <Filter className="w-4 h-4" />
              <span>Adjust Assumptions</span>
            </button>
            <button className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center space-x-1">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Required</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Available</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Surplus/Deficit</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Projected Cost</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.month}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{row.requiredCrew}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{row.availableCrew}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <span className={`font-semibold ${row.surplus >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {row.surplus > 0 ? '+' : ''}{row.surplus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    ${(row.projectedCost / 1000).toFixed(0)}K
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <span className={`font-medium ${
                      row.confidence >= 90 ? 'text-green-600' :
                      row.confidence >= 85 ? 'text-blue-600' :
                      'text-orange-600'
                    }`}>
                      {row.confidence}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Forecast Visualization */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Crew Availability Trend</h3>
        <div className="h-64 flex items-end justify-around space-x-2 border-b border-l border-gray-300 p-4">
          {data.map((d, idx) => {
            const maxCrew = Math.max(...data.map(x => Math.max(x.requiredCrew, x.availableCrew)));
            const requiredHeight = (d.requiredCrew / maxCrew) * 200;
            const availableHeight = (d.availableCrew / maxCrew) * 200;

            return (
              <div key={idx} className="flex flex-col items-center flex-1">
                <div className="w-full flex justify-center space-x-1">
                  <div
                    className="w-1/2 bg-red-300 rounded-t"
                    style={{ height: `${requiredHeight}px` }}
                    title={`Required: ${d.requiredCrew}`}
                  />
                  <div
                    className="w-1/2 bg-green-500 rounded-t"
                    style={{ height: `${availableHeight}px` }}
                    title={`Available: ${d.availableCrew}`}
                  />
                </div>
                <span className="text-xs text-gray-600 mt-2 text-center">{d.month.split(' ')[0]}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex justify-center space-x-6 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-300 rounded mr-2" />
            <span>Required Crew</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded mr-2" />
            <span>Available Crew</span>
          </div>
        </div>
      </div>

      {/* Scenario Planning */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <TrendingDown className="w-4 h-4 text-blue-600 mr-2" />
            Conservative Scenario
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Growth Rate:</span>
              <span className="font-medium">+2%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Surplus:</span>
              <span className="font-medium text-green-600">+4</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Hiring Needed:</span>
              <span className="font-medium">0</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg border-2 border-blue-500 p-4">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Activity className="w-4 h-4 text-blue-600 mr-2" />
            Most Likely Scenario
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Growth Rate:</span>
              <span className="font-medium">+5%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Surplus:</span>
              <span className="font-medium text-orange-600">-2</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Hiring Needed:</span>
              <span className="font-medium text-blue-600">8-10</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <TrendingUp className="w-4 h-4 text-red-600 mr-2" />
            Aggressive Scenario
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Growth Rate:</span>
              <span className="font-medium">+8%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Surplus:</span>
              <span className="font-medium text-red-600">-8</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Hiring Needed:</span>
              <span className="font-medium text-red-600">15-18</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
