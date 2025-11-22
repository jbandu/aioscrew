import { TrendingDown, TrendingUp } from 'lucide-react';

interface OptimizationResultsProps {
  current: {
    cost: number;
    violations: number;
    satisfaction: number;
    utilization: number;
  };
  optimized: {
    cost: number;
    violations: number;
    satisfaction: number;
    utilization: number;
  };
  processingTime: number;
  iterations: number;
  onAccept?: () => void;
  onReject?: () => void;
  onAdjust?: () => void;
  onViewDetails?: () => void;
}

export default function OptimizationResults({
  current,
  optimized,
  processingTime,
  iterations,
  onAccept,
  onReject,
  onAdjust,
  onViewDetails
}: OptimizationResultsProps) {
  const savings = current.cost - optimized.cost;
  const savingsPercent = ((savings / current.cost) * 100).toFixed(1);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-4">Optimization Results</h3>
      <div className="text-sm text-gray-600 mb-4">
        Processing Time: {processingTime} seconds | Iterations: {iterations.toLocaleString()}
      </div>

      {/* Comparison Table */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-3">Current Plan</h4>
          <div className="space-y-2 text-sm">
            <div>Total Cost: <span className="font-bold">${current.cost.toLocaleString()}</span></div>
            <div>Violations: <span className="text-red-600 font-bold">{current.violations}</span></div>
            <div>Crew Satisfaction: <span className="font-bold">{current.satisfaction}/10</span></div>
            <div>Avg Utilization: <span className="font-bold">{current.utilization}%</span></div>
          </div>
        </div>

        <div className="border rounded-lg p-4 bg-green-50 border-green-200">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            Optimized Plan
            <TrendingUp className="w-4 h-4 text-green-600" />
          </h4>
          <div className="space-y-2 text-sm">
            <div>Total Cost: <span className="font-bold text-green-600">${optimized.cost.toLocaleString()}</span></div>
            <div>Violations: <span className="text-green-600 font-bold">{optimized.violations}</span></div>
            <div>Crew Satisfaction: <span className="font-bold text-green-600">{optimized.satisfaction}/10</span></div>
            <div>Avg Utilization: <span className="font-bold text-green-600">{optimized.utilization}%</span></div>
          </div>
        </div>
      </div>

      {/* Cost Savings */}
      <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <TrendingDown className="w-8 h-8 text-green-700" />
          <div>
            <div className="text-2xl font-bold text-green-700">
              COST SAVINGS: ${savings.toLocaleString()} ({savingsPercent}%)
            </div>
            <div className="text-sm text-green-700">
              Based on current roster optimization
            </div>
          </div>
        </div>
      </div>

      {/* Changes Summary */}
      <div className="mb-6">
        <h4 className="font-semibold mb-2">Changes Summary</h4>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li>7 pairings swapped (reduce deadheads)</li>
          <li>12 crew reassignments</li>
          <li>3 reserve → line holder conversions</li>
          <li>4 training slots rescheduled</li>
        </ul>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            View Detailed Changes
          </button>
        )}
        {onAccept && (
          <button
            onClick={onAccept}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Accept Changes
          </button>
        )}
        {onReject && (
          <button
            onClick={onReject}
            className="px-6 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50"
          >
            Reject
          </button>
        )}
        {onAdjust && (
          <button
            onClick={onAdjust}
            className="px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
          >
            Adjust & Re-optimize
          </button>
        )}
      </div>
    </div>
  );
}
