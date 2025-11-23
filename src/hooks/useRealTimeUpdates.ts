/**
 * React hook for real-time WebSocket updates
 * Provides auto-refresh and live data updates for controller views
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  websocketService,
  type WebSocketEventType,
  type FlightUpdate,
  type CrewStatusUpdate,
  type DisruptionAlert,
  type DutyTimeWarning,
  type ReserveCallout
} from '../services/websocket-service';

export interface UseRealTimeUpdatesOptions {
  /**
   * Auto-refresh interval in milliseconds (default: 10000 = 10 seconds)
   * Set to 0 to disable polling
   */
  refreshInterval?: number;

  /**
   * Enable WebSocket real-time updates (default: true)
   */
  enableWebSocket?: boolean;

  /**
   * Callback for data refresh
   */
  onRefresh?: () => Promise<void>;
}

export function useRealTimeUpdates(options: UseRealTimeUpdatesOptions = {}) {
  const {
    refreshInterval = 10000,
    enableWebSocket = true,
    onRefresh
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [updateCount, setUpdateCount] = useState(0);
  const refreshTimerRef = useRef<number | null>(null);

  // Handle connection status updates
  useEffect(() => {
    if (!enableWebSocket) return;

    const unsubscribe = websocketService.subscribe('connection-status', (data: { connected: boolean }) => {
      setIsConnected(data.connected);
    });

    // Check initial connection status
    setIsConnected(websocketService.isConnected());

    return unsubscribe;
  }, [enableWebSocket]);

  // Handle auto-refresh polling
  useEffect(() => {
    if (refreshInterval <= 0) return;

    const doRefresh = async () => {
      try {
        if (onRefresh) {
          await onRefresh();
        }
        setLastUpdate(new Date());
        setUpdateCount(prev => prev + 1);
      } catch (error) {
        console.error('Error during auto-refresh:', error);
      }
    };

    // Initial refresh
    doRefresh();

    // Set up interval
    refreshTimerRef.current = window.setInterval(doRefresh, refreshInterval);

    return () => {
      if (refreshTimerRef.current !== null) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [refreshInterval, onRefresh]);

  // Manual refresh function
  const manualRefresh = useCallback(async () => {
    try {
      if (onRefresh) {
        await onRefresh();
      }
      setLastUpdate(new Date());
      setUpdateCount(prev => prev + 1);
    } catch (error) {
      console.error('Error during manual refresh:', error);
    }
  }, [onRefresh]);

  // Calculate time since last update
  const [timeSinceUpdate, setTimeSinceUpdate] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const seconds = Math.floor((Date.now() - lastUpdate.getTime()) / 1000);
      setTimeSinceUpdate(seconds);
    }, 1000);

    return () => clearInterval(timer);
  }, [lastUpdate]);

  return {
    isConnected,
    lastUpdate,
    timeSinceUpdate,
    updateCount,
    manualRefresh
  };
}

/**
 * Hook for subscribing to flight updates
 */
export function useFlightUpdates(onUpdate: (update: FlightUpdate) => void) {
  useEffect(() => {
    const unsubscribe = websocketService.subscribe('flight-update', onUpdate);
    return unsubscribe;
  }, [onUpdate]);
}

/**
 * Hook for subscribing to crew status updates
 */
export function useCrewStatusUpdates(onUpdate: (update: CrewStatusUpdate) => void) {
  useEffect(() => {
    const unsubscribe = websocketService.subscribe('crew-status-update', onUpdate);
    return unsubscribe;
  }, [onUpdate]);
}

/**
 * Hook for subscribing to disruption alerts
 */
export function useDisruptionAlerts(onAlert: (alert: DisruptionAlert) => void) {
  useEffect(() => {
    const unsubscribe = websocketService.subscribe('disruption-alert', onAlert);
    return unsubscribe;
  }, [onAlert]);
}

/**
 * Hook for subscribing to duty time warnings
 */
export function useDutyTimeWarnings(onWarning: (warning: DutyTimeWarning) => void) {
  useEffect(() => {
    const unsubscribe = websocketService.subscribe('duty-time-warning', onWarning);
    return unsubscribe;
  }, [onWarning]);
}

/**
 * Hook for subscribing to reserve callouts
 */
export function useReserveCallouts(onCallout: (callout: ReserveCallout) => void) {
  useEffect(() => {
    const unsubscribe = websocketService.subscribe('reserve-callout', onCallout);
    return unsubscribe;
  }, [onCallout]);
}

/**
 * Format time since update as human-readable string
 */
export function formatTimeSince(seconds: number): string {
  if (seconds < 60) return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
}
