import { useState, useEffect } from 'react';
import { Database, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { initializeDatabase, seedDatabase } from '../lib/db';

interface DatabaseInitProps {
  onComplete: () => void;
}

export default function DatabaseInit({ onComplete }: DatabaseInitProps) {
  const [status, setStatus] = useState<'checking' | 'initializing' | 'seeding' | 'complete' | 'error'>('checking');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    initDB();
  }, []);

  const initDB = async () => {
    try {
      setStatus('initializing');
      await new Promise(resolve => setTimeout(resolve, 500));

      const initialized = await initializeDatabase();
      if (!initialized) {
        throw new Error('Failed to initialize database');
      }

      setStatus('seeding');
      await new Promise(resolve => setTimeout(resolve, 500));

      await seedDatabase();

      setStatus('complete');
      await new Promise(resolve => setTimeout(resolve, 1000));
      onComplete();
    } catch (err) {
      console.error('Database initialization error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-copa-blue via-copa-blue-dark to-copa-blue flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center">
          <img
            src="/image.png"
            alt="Copa Airlines"
            className="h-16 w-auto mx-auto mb-4"
          />

          <h2 className="text-2xl font-bold text-copa-blue mb-2">
            Initializing Copa Airlines Crew System
          </h2>
          <p className="text-gray-600 mb-6">
            Setting up database and loading crew data...
          </p>

          <div className="space-y-4">
            <div className={`flex items-center gap-3 p-3 rounded-lg ${
              status === 'checking' || status === 'initializing' ? 'bg-copa-blue-50' :
              status === 'seeding' || status === 'complete' ? 'bg-green-50' : 'bg-gray-50'
            }`}>
              {status === 'checking' || status === 'initializing' ? (
                <Loader className="w-5 h-5 text-copa-blue animate-spin" />
              ) : (
                <CheckCircle className="w-5 h-5 text-copa-gold" />
              )}
              <span className={`text-sm font-medium ${
                status === 'checking' || status === 'initializing' ? 'text-copa-blue' :
                status === 'seeding' || status === 'complete' ? 'text-green-700' : 'text-gray-600'
              }`}>
                Creating database tables
              </span>
            </div>

            <div className={`flex items-center gap-3 p-3 rounded-lg ${
              status === 'seeding' ? 'bg-copa-blue-50' :
              status === 'complete' ? 'bg-green-50' : 'bg-gray-50'
            }`}>
              {status === 'seeding' ? (
                <Loader className="w-5 h-5 text-copa-blue animate-spin" />
              ) : status === 'complete' ? (
                <CheckCircle className="w-5 h-5 text-copa-gold" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
              )}
              <span className={`text-sm font-medium ${
                status === 'seeding' ? 'text-copa-blue' :
                status === 'complete' ? 'text-green-700' : 'text-gray-600'
              }`}>
                Loading crew and flight data
              </span>
            </div>

            <div className={`flex items-center gap-3 p-3 rounded-lg ${
              status === 'complete' ? 'bg-green-50' : 'bg-gray-50'
            }`}>
              {status === 'complete' ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
              )}
              <span className={`text-sm font-medium ${
                status === 'complete' ? 'text-green-700' : 'text-gray-600'
              }`}>
                Initialization complete
              </span>
            </div>
          </div>

          {status === 'error' && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div className="text-left">
                  <div className="font-semibold text-red-900 mb-1">Initialization Failed</div>
                  <div className="text-sm text-red-700">{error}</div>
                  <button
                    onClick={initDB}
                    className="mt-3 px-4 py-2 bg-copa-blue text-white rounded hover:bg-copa-blue-light transition-colors text-sm"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          )}

          {status === 'complete' && (
            <div className="mt-6 text-copa-gold font-medium flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Copa Airlines Crew System Ready!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
