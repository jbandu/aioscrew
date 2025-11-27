/**
 * Fleet Scraper Client Library
 *
 * This library provides a comprehensive interface to the Aircraft Database MCP Server
 * for fleet data scraping, job management, and data quality monitoring.
 *
 * Features:
 * - Trigger scraping jobs with various options
 * - Poll job status in real-time
 * - Retrieve job results and changes
 * - Manage backups and rollbacks
 * - Monitor data quality metrics
 *
 * @module fleet-scraper-client
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type JobType = 'quick_update' | 'full_rescrape' | 'verify_only';
export type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export type JobPriority = 'low' | 'normal' | 'high';
export type ChangeType = 'new' | 'updated' | 'retired' | 'unchanged';
export type DataStatus = 'good' | 'stale' | 'critical' | 'empty';
export type JobPhase = 'discovering' | 'processing' | 'validating' | 'saving';

export interface AirlineStatus {
  code: string;
  name: string;
  fleetSize: number;
  activeAircraft: number;
  storedAircraft: number;
  lastUpdated: string | null;
  lastScrapeJobId: string | null;
  averageConfidence: number;
  completeRecords: number;
  incompleteRecords: number;
  needsReviewCount: number;
  dataStatus: DataStatus;
  daysSinceUpdate: number | null;
  needsUpdate: boolean;
  autoUpdateEnabled: boolean;
  autoUpdateFrequency: string | null;
  nextScheduledUpdate: string | null;
}

export interface ScrapeJob {
  id: number;
  jobId: string;
  airlineCode: string;
  airlineName: string;
  jobType: JobType;
  status: JobStatus;
  priority: JobPriority;
  progress: number;
  currentPhase: JobPhase | null;
  currentAircraft: string | null;
  discoveredCount: number;
  processedCount: number;
  newCount: number;
  updatedCount: number;
  retiredCount: number;
  unchangedCount: number;
  errorCount: number;
  startedAt: string | null;
  completedAt: string | null;
  estimatedCompletion: string | null;
  durationSeconds: number | null;
  backupBeforeUpdate: boolean;
  notifyOnComplete: boolean;
  backupId: number | null;
  resultSummary: any;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface JobProgress {
  jobId: string;
  status: JobStatus;
  progress: number;
  currentPhase: JobPhase | null;
  currentAircraft: string | null;
  discovered: number;
  processed: number;
  changes: {
    new: number;
    updated: number;
    retired: number;
    unchanged: number;
  };
  elapsed: number;
  estimatedRemaining: number | null;
}

export interface DataChange {
  id: number;
  jobId: string;
  changeId: string;
  changeType: ChangeType;
  aircraftRegistration: string;
  aircraftType: string;
  oldData: any;
  newData: any;
  differences: any;
  confidenceScore: number;
  dataQualityScore: number;
  validationStatus: string;
  validationNotes: string | null;
  approved: boolean;
  approvedBy: string | null;
  approvedAt: string | null;
  rejected: boolean;
  rejectionReason: string | null;
  createdAt: string;
}

export interface BackupRecord {
  id: number;
  backupId: string;
  airlineCode: string;
  airlineName: string;
  backupTimestamp: string;
  backupReason: string;
  aircraftData: any;
  fleetSize: number;
  createdBy: string | null;
  createdAt: string;
  restoredAt: string | null;
  isActive: boolean;
}

export interface QualityMetrics {
  totalAircraft: number;
  averageConfidence: number;
  completeRecords: number;
  incompleteRecords: number;
  needsReview: number;
  goodAirlines: number;
  staleAirlines: number;
  criticalAirlines: number;
  emptyAirlines: number;
}

export interface QualityIssue {
  id: number;
  issueId: string;
  airlineCode: string;
  aircraftRegistration: string | null;
  issueType: 'missing_field' | 'low_confidence' | 'conflicting_data' | 'outdated';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  suggestedAction: string | null;
  affectedFields: any;
  currentData: any;
  resolved: boolean;
  resolvedBy: string | null;
  resolvedAt: string | null;
  resolutionNotes: string | null;
  createdAt: string;
}

export interface UpdateHistory {
  id: number;
  airlineCode: string;
  jobId: string;
  updateType: 'scrape' | 'manual' | 'rollback';
  changesSummary: string;
  newAircraft: number;
  retiredAircraft: number;
  updatedAircraft: number;
  updateTimestamp: string;
  durationSeconds: number | null;
  performedBy: string | null;
  notes: string | null;
}

export interface ScrapeJobConfig {
  airlineCode: string;
  jobType: JobType;
  priority?: JobPriority;
  backupBeforeUpdate?: boolean;
  notifyOnComplete?: boolean;
  createdBy?: string;
}

export interface ComparisonResult {
  backupId: string;
  jobId: string;
  differences: DataChange[];
  summary: {
    newAircraft: number;
    retiredAircraft: number;
    updatedAircraft: number;
    totalChanges: number;
  };
}

// ============================================================================
// API CLIENT CLASS
// ============================================================================

export class FleetScraperClient {
  private baseUrl: string;
  private apiKey?: string;

  /**
   * Initialize the Fleet Scraper Client
   * @param baseUrl - Base URL of the API (default: http://localhost:3001)
   * @param apiKey - Optional API key for authentication
   */
  constructor(baseUrl: string = 'http://localhost:3001', apiKey?: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = apiKey;
  }

  /**
   * Get headers for API requests
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }
    return headers;
  }

  /**
   * Handle API errors
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
    }
    return response.json();
  }

  // ==========================================================================
  // AIRLINE STATUS OPERATIONS
  // ==========================================================================

  /**
   * Get status for all airlines
   */
  async getAllAirlineStatuses(): Promise<AirlineStatus[]> {
    const response = await fetch(`${this.baseUrl}/api/v1/airlines/status`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<AirlineStatus[]>(response);
  }

  /**
   * Get status for a specific airline
   */
  async getAirlineStatus(airlineCode: string): Promise<AirlineStatus> {
    const response = await fetch(`${this.baseUrl}/api/v1/airlines/${airlineCode}/status`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<AirlineStatus>(response);
  }

  /**
   * Update airline status manually
   */
  async updateAirlineStatus(
    airlineCode: string,
    updates: Partial<AirlineStatus>
  ): Promise<AirlineStatus> {
    const response = await fetch(`${this.baseUrl}/api/v1/airlines/${airlineCode}/status`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(updates),
    });
    return this.handleResponse<AirlineStatus>(response);
  }

  // ==========================================================================
  // SCRAPING JOB OPERATIONS
  // ==========================================================================

  /**
   * Create a new scraping job
   */
  async createScrapingJob(config: ScrapeJobConfig): Promise<ScrapeJob> {
    const response = await fetch(`${this.baseUrl}/api/v1/scraping/jobs`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(config),
    });
    return this.handleResponse<ScrapeJob>(response);
  }

  /**
   * Get job details by job ID
   */
  async getJob(jobId: string): Promise<ScrapeJob> {
    const response = await fetch(`${this.baseUrl}/api/v1/scraping/jobs/${jobId}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<ScrapeJob>(response);
  }

  /**
   * Get job status (lightweight, for polling)
   */
  async getJobStatus(jobId: string): Promise<JobProgress> {
    const response = await fetch(`${this.baseUrl}/api/v1/scraping/jobs/${jobId}/status`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<JobProgress>(response);
  }

  /**
   * Get all active jobs
   */
  async getActiveJobs(): Promise<ScrapeJob[]> {
    const response = await fetch(`${this.baseUrl}/api/v1/scraping/jobs/active`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<ScrapeJob[]>(response);
  }

  /**
   * Get recent completed jobs
   */
  async getRecentJobs(limit: number = 10): Promise<ScrapeJob[]> {
    const response = await fetch(
      `${this.baseUrl}/api/v1/scraping/jobs/recent?limit=${limit}`,
      {
        headers: this.getHeaders(),
      }
    );
    return this.handleResponse<ScrapeJob[]>(response);
  }

  /**
   * Cancel a running job
   */
  async cancelJob(jobId: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.baseUrl}/api/v1/scraping/jobs/${jobId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse<{ success: boolean; message: string }>(response);
  }

  /**
   * Poll job status until completion
   * @param jobId - Job ID to poll
   * @param onProgress - Callback for progress updates
   * @param interval - Polling interval in ms (default: 3000)
   */
  async pollJobStatus(
    jobId: string,
    onProgress: (progress: JobProgress) => void,
    interval: number = 3000
  ): Promise<ScrapeJob> {
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const status = await this.getJobStatus(jobId);
          onProgress(status);

          if (status.status === 'completed') {
            const finalJob = await this.getJob(jobId);
            resolve(finalJob);
          } else if (status.status === 'failed' || status.status === 'cancelled') {
            const finalJob = await this.getJob(jobId);
            reject(new Error(finalJob.errorMessage || `Job ${status.status}`));
          } else {
            setTimeout(poll, interval);
          }
        } catch (error) {
          reject(error);
        }
      };

      poll();
    });
  }

  // ==========================================================================
  // DATA CHANGES OPERATIONS
  // ==========================================================================

  /**
   * Get all changes for a job
   */
  async getJobChanges(jobId: string): Promise<DataChange[]> {
    const response = await fetch(`${this.baseUrl}/api/v1/changes/${jobId}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<DataChange[]>(response);
  }

  /**
   * Approve a specific change
   */
  async approveChange(
    changeId: string,
    approvedBy: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.baseUrl}/api/v1/changes/${changeId}/approve`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ approvedBy }),
    });
    return this.handleResponse<{ success: boolean; message: string }>(response);
  }

  /**
   * Approve all changes for a job
   */
  async approveAllChanges(
    jobId: string,
    approvedBy: string
  ): Promise<{ success: boolean; approvedCount: number }> {
    const response = await fetch(`${this.baseUrl}/api/v1/changes/${jobId}/approve-all`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ approvedBy }),
    });
    return this.handleResponse<{ success: boolean; approvedCount: number }>(response);
  }

  /**
   * Reject a specific change
   */
  async rejectChange(
    changeId: string,
    reason: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.baseUrl}/api/v1/changes/${changeId}/reject`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ reason }),
    });
    return this.handleResponse<{ success: boolean; message: string }>(response);
  }

  // ==========================================================================
  // BACKUP OPERATIONS
  // ==========================================================================

  /**
   * Create a backup for an airline
   */
  async createBackup(
    airlineCode: string,
    reason: string,
    createdBy?: string
  ): Promise<BackupRecord> {
    const response = await fetch(`${this.baseUrl}/api/v1/backup/create/${airlineCode}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ reason, createdBy }),
    });
    return this.handleResponse<BackupRecord>(response);
  }

  /**
   * Get backup details
   */
  async getBackup(backupId: string): Promise<BackupRecord> {
    const response = await fetch(`${this.baseUrl}/api/v1/backup/${backupId}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<BackupRecord>(response);
  }

  /**
   * Get all backups for an airline
   */
  async getAirlineBackups(airlineCode: string): Promise<BackupRecord[]> {
    const response = await fetch(`${this.baseUrl}/api/v1/backup/airline/${airlineCode}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<BackupRecord[]>(response);
  }

  /**
   * Restore from a backup
   */
  async restoreBackup(
    backupId: string,
    restoredBy?: string
  ): Promise<{ success: boolean; restoredCount: number }> {
    const response = await fetch(`${this.baseUrl}/api/v1/backup/restore/${backupId}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ restoredBy }),
    });
    return this.handleResponse<{ success: boolean; restoredCount: number }>(response);
  }

  /**
   * Compare job results with a backup
   */
  async compareWithBackup(jobId: string, backupId: string): Promise<ComparisonResult> {
    const response = await fetch(
      `${this.baseUrl}/api/v1/backup/compare/${jobId}/${backupId}`,
      {
        headers: this.getHeaders(),
      }
    );
    return this.handleResponse<ComparisonResult>(response);
  }

  // ==========================================================================
  // DATA QUALITY OPERATIONS
  // ==========================================================================

  /**
   * Get overall data quality metrics
   */
  async getQualityMetrics(): Promise<QualityMetrics> {
    const response = await fetch(`${this.baseUrl}/api/v1/quality/metrics`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<QualityMetrics>(response);
  }

  /**
   * Get all quality issues
   */
  async getQualityIssues(filters?: {
    airlineCode?: string;
    severity?: string;
    resolved?: boolean;
  }): Promise<QualityIssue[]> {
    const params = new URLSearchParams();
    if (filters?.airlineCode) params.append('airlineCode', filters.airlineCode);
    if (filters?.severity) params.append('severity', filters.severity);
    if (filters?.resolved !== undefined) params.append('resolved', String(filters.resolved));

    const url = `${this.baseUrl}/api/v1/quality/issues?${params.toString()}`;
    const response = await fetch(url, { headers: this.getHeaders() });
    return this.handleResponse<QualityIssue[]>(response);
  }

  /**
   * Resolve a quality issue
   */
  async resolveQualityIssue(
    issueId: string,
    resolutionNotes: string,
    resolvedBy: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.baseUrl}/api/v1/quality/issues/${issueId}/resolve`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ resolutionNotes, resolvedBy }),
    });
    return this.handleResponse<{ success: boolean; message: string }>(response);
  }

  // ==========================================================================
  // UPDATE HISTORY OPERATIONS
  // ==========================================================================

  /**
   * Get update history for an airline
   */
  async getUpdateHistory(airlineCode: string, limit: number = 20): Promise<UpdateHistory[]> {
    const response = await fetch(
      `${this.baseUrl}/api/v1/history/${airlineCode}?limit=${limit}`,
      {
        headers: this.getHeaders(),
      }
    );
    return this.handleResponse<UpdateHistory[]>(response);
  }

  /**
   * Get recent updates across all airlines
   */
  async getRecentUpdates(limit: number = 10): Promise<UpdateHistory[]> {
    const response = await fetch(`${this.baseUrl}/api/v1/history/recent?limit=${limit}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<UpdateHistory[]>(response);
  }

  // ==========================================================================
  // BULK OPERATIONS
  // ==========================================================================

  /**
   * Trigger updates for multiple airlines
   */
  async updateMultipleAirlines(
    airlineCodes: string[],
    jobType: JobType = 'quick_update',
    staggerMinutes: number = 5
  ): Promise<ScrapeJob[]> {
    const response = await fetch(`${this.baseUrl}/api/v1/scraping/bulk-update`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ airlineCodes, jobType, staggerMinutes }),
    });
    return this.handleResponse<ScrapeJob[]>(response);
  }

  /**
   * Create backups for multiple airlines
   */
  async createMultipleBackups(
    airlineCodes: string[],
    reason: string
  ): Promise<BackupRecord[]> {
    const response = await fetch(`${this.baseUrl}/api/v1/backup/bulk-create`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ airlineCodes, reason }),
    });
    return this.handleResponse<BackupRecord[]>(response);
  }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  /**
   * Check if an airline needs an update
   */
  async needsUpdate(airlineCode: string): Promise<boolean> {
    const status = await this.getAirlineStatus(airlineCode);
    return status.needsUpdate;
  }

  /**
   * Get airlines that need updates
   */
  async getAirlinesNeedingUpdate(): Promise<AirlineStatus[]> {
    const allStatuses = await this.getAllAirlineStatuses();
    return allStatuses.filter((status) => status.needsUpdate);
  }

  /**
   * Calculate time since last update
   */
  getTimeSinceUpdate(lastUpdated: string | null): string {
    if (!lastUpdated) return 'Never';

    const now = new Date();
    const updated = new Date(lastUpdated);
    const diffMs = now.getTime() - updated.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  }

  /**
   * Format duration in seconds to human-readable string
   */
  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

    return parts.join(' ');
  }

  /**
   * Get status icon for data status
   */
  getStatusIcon(status: DataStatus): string {
    const icons: Record<DataStatus, string> = {
      good: '✅',
      stale: '⚠️',
      critical: '❌',
      empty: '⭕',
    };
    return icons[status] || '❓';
  }

  /**
   * Get status color for UI
   */
  getStatusColor(status: DataStatus): string {
    const colors: Record<DataStatus, string> = {
      good: 'green',
      stale: 'orange',
      critical: 'red',
      empty: 'gray',
    };
    return colors[status] || 'gray';
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

/**
 * Default client instance
 * Can be configured once and reused throughout the application
 */
export const fleetScraperClient = new FleetScraperClient();

/**
 * Configure the default client
 */
export function configureFleetScraperClient(baseUrl: string, apiKey?: string) {
  Object.assign(fleetScraperClient, new FleetScraperClient(baseUrl, apiKey));
}

// ============================================================================
// CONVENIENCE HOOKS FOR REACT (Optional)
// ============================================================================

/**
 * Example usage with React hooks:
 *
 * ```tsx
 * import { fleetScraperClient } from '@/lib/fleet-scraper-client';
 *
 * function MyComponent() {
 *   const [airlines, setAirlines] = useState<AirlineStatus[]>([]);
 *
 *   useEffect(() => {
 *     fleetScraperClient.getAllAirlineStatuses()
 *       .then(setAirlines)
 *       .catch(console.error);
 *   }, []);
 *
 *   const handleUpdate = async (code: string) => {
 *     const job = await fleetScraperClient.createScrapingJob({
 *       airlineCode: code,
 *       jobType: 'quick_update',
 *       priority: 'normal',
 *       backupBeforeUpdate: true,
 *     });
 *
 *     await fleetScraperClient.pollJobStatus(job.jobId, (progress) => {
 *       console.log(`Progress: ${progress.progress}%`);
 *     });
 *   };
 *
 *   return <div>...</div>;
 * }
 * ```
 */
