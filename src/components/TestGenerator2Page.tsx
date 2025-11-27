// This file is a copy of DataGenerationCard with pink/purple branding and full-screen wrapper
// For the complete implementation, please use the Automation Lab from the landing page.
// This serves as Test Generator 2.0 showcase.

import DataGenerationCard from './DataGenerationCard';

interface TestGenerator2PageProps {
  onBack?: () => void;
}

export default function TestGenerator2Page({ onBack }: TestGenerator2PageProps = {}) {
  console.log('🎨 [TEST-GEN-2.0] TestGenerator2Page loaded - wrapper for DataGenerationCard');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-slate-900 text-white py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
          >
            ← Back to Landing Page
          </button>
        )}

        <DataGenerationCard />
      </div>
    </div>
  );
}
