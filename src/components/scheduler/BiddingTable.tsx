import { CheckCircle, AlertTriangle, XCircle, Star } from 'lucide-react';

interface BidResult {
  id: string;
  crewName: string;
  role: string;
  seniority: number;
  pref1: string;
  pref2: string;
  pref3: string;
  status: 'granted' | 'partial' | 'denied';
  satisfaction: number;
  satisfactionPct: number;
}

interface BiddingTableProps {
  bidResults: BidResult[];
  onViewDetails?: (bidId: string) => void;
}

export default function BiddingTable({ bidResults, onViewDetails }: BiddingTableProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">CREW NAME</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">BID PREFS</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">AWARD STATUS</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">SATISFACTION</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {bidResults.map((bid) => (
            <tr key={bid.id} className="border-t border-gray-200 hover:bg-gray-50">
              <td className="px-4 py-3">
                <div className="font-semibold text-sm">{bid.crewName}</div>
                <div className="text-xs text-gray-600">{bid.role} #{bid.seniority}</div>
              </td>
              <td className="px-4 py-3 text-sm">
                <div className="text-xs">1. {bid.pref1}</div>
                <div className="text-xs">2. {bid.pref2}</div>
                <div className="text-xs">3. {bid.pref3}</div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {bid.status === 'granted' && <CheckCircle className="text-green-600 w-4 h-4" />}
                  {bid.status === 'partial' && <AlertTriangle className="text-yellow-600 w-4 h-4" />}
                  {bid.status === 'denied' && <XCircle className="text-red-600 w-4 h-4" />}
                  <span className="text-sm capitalize">{bid.status}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < bid.satisfaction ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-xs text-gray-600">{bid.satisfactionPct}%</div>
              </td>
              <td className="px-4 py-3">
                {onViewDetails && (
                  <button
                    onClick={() => onViewDetails(bid.id)}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    View
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
