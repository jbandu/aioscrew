/**
 * Fleet Data Management Page
 *
 * Full-page interface for managing fleet data scraping, backups, and quality monitoring.
 */

import { ArrowLeft } from 'lucide-react';
import FleetDataManagementCard from '../components/FleetDataManagementCard';

interface FleetDataManagementPageProps {
  onBack?: () => void;
}

export default function FleetDataManagementPage({ onBack }: FleetDataManagementPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-6">
          {onBack && (
            <button
              onClick={onBack}
              className="mb-4 flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>
          )}
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Fleet Data Management
          </h1>
          <p className="text-gray-600">
            AI-powered fleet data scraping, backup management, and quality monitoring
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        <FleetDataManagementCard />
      </div>
    </div>
  );
}
