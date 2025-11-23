/**
 * WebSocket service for real-time crew operations updates
 * Provides live updates for flights, crew status, disruptions, and alerts
 */

export type WebSocketEventType =
  | 'flight-update'
  | 'crew-status-update'
  | 'disruption-alert'
  | 'duty-time-warning'
  | 'reserve-callout'
  | 'connection-status';

export interface WebSocketMessage {
  type: WebSocketEventType;
  timestamp: Date;
  data: any;
}

export interface FlightUpdate {
  flightId: string;
  status: 'scheduled' | 'boarding' | 'departed' | 'in-flight' | 'arrived' | 'delayed' | 'cancelled';
  departureTime?: string;
  arrivalTime?: string;
  delayMinutes?: number;
  gate?: string;
  crewAffected?: string[];
}

export interface CrewStatusUpdate {
  crewId: string;
  status: 'active' | 'rest' | 'reserve' | 'off-duty';
  location?: string;
  dutyTime?: number;
  maxDutyTime?: number;
  currentFlight?: string;
}

export interface DisruptionAlert {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: 'cancellation' | 'delay' | 'mechanical' | 'weather' | 'crew';
  flightId: string;
  message: string;
  crewAffected: number;
  aiRecommendation?: string;
}

export interface DutyTimeWarning {
  crewId: string;
  crewName: string;
  currentDuty: number;
  maxDuty: number;
  percentUsed: number;
  flightId?: string;
  timeRemaining: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface ReserveCallout {
  id: string;
  reserveId: string;
  reserveName: string;
  flightId: string;
  status: 'pending' | 'accepted' | 'declined' | 'no-response';
  calledAt: Date;
  respondedAt?: Date;
  responseTime?: number;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;
  private listeners: Map<WebSocketEventType, Set<(data: any) => void>> = new Map();
  private isConnecting = false;
  private heartbeatInterval: number | null = null;

  constructor() {
    // Initialize listener sets
    const eventTypes: WebSocketEventType[] = [
      'flight-update',
      'crew-status-update',
      'disruption-alert',
      'duty-time-warning',
      'reserve-callout',
      'connection-status'
    ];
    eventTypes.forEach(type => this.listeners.set(type, new Set()));
  }

  /**
   * Connect to WebSocket server
   */
  connect() {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      console.log('WebSocket already connected or connecting');
      return;
    }

    this.isConnecting = true;
    // Use wss:// for HTTPS pages, ws:// for HTTP pages
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = import.meta.env.VITE_WS_URL ||
      (import.meta.env.DEV ? 'ws://localhost:3001/ws' : `${protocol}//${window.location.host}/ws`);

    console.log(`Connecting to WebSocket: ${wsUrl}`);

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('✓ WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.notifyListeners('connection-status', { connected: true });
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          message.timestamp = new Date(message.timestamp);
          this.handleMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnecting = false;
        this.stopHeartbeat();
        this.notifyListeners('connection-status', { connected: false });
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      this.isConnecting = false;
      this.attemptReconnect();
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.reconnectAttempts = 0;
  }

  /**
   * Subscribe to specific event type
   */
  subscribe(eventType: WebSocketEventType, callback: (data: any) => void) {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.add(callback);
    }

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(eventType);
      if (listeners) {
        listeners.delete(callback);
      }
    };
  }

  /**
   * Send message to server
   */
  send(type: string, data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  // Private methods

  private handleMessage(message: WebSocketMessage) {
    this.notifyListeners(message.type, message.data);
  }

  private notifyListeners(eventType: WebSocketEventType, data: any) {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in listener for ${eventType}:`, error);
        }
      });
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = window.setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send('ping', { timestamp: Date.now() });
      }
    }, 30000); // 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval !== null) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}

// Singleton instance
export const websocketService = new WebSocketService();

// Auto-connect on module load (can be disabled if needed)
if (typeof window !== 'undefined') {
  // Connect after a short delay to allow app to initialize
  setTimeout(() => {
    websocketService.connect();
  }, 1000);
}
