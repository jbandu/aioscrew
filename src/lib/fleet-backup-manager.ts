/**
 * Fleet Backup Manager Library
 *
 * Specialized library for managing aircraft data backups, comparisons, and rollbacks.
 * Works in conjunction with fleet-scraper-client.ts for complete data management.
 *
 * Features:
 * - Create and manage backups
 * - Compare data versions
 * - Rollback to previous states
 * - Track backup history
 * - Calculate change diffs
 *
 * @module fleet-backup-manager
 */

import { fleetScraperClient, type BackupRecord, type DataChange } from './fleet-scraper-client';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface BackupSummary {
  backupId: string;
  airlineCode: string;
  airlineName: string;
  fleetSize: number;
  timestamp: Date;
  reason: string;
  ageInDays: number;
  isActive: boolean;
  canRestore: boolean;
}

export interface DataDifference {
  field: string;
  oldValue: any;
  newValue: any;
  changeType: 'added' | 'removed' | 'modified';
}

export interface AircraftComparison {
  registration: string;
  status: 'new' | 'updated' | 'removed' | 'unchanged';
  differences: DataDifference[];
  oldData?: any;
  newData?: any;
}

export interface BackupComparison {
  backupId: string;
  comparedWith: 'current' | 'job';
  totalAircraft: {
    backup: number;
    current: number;
  };
  changes: {
    new: AircraftComparison[];
    updated: AircraftComparison[];
    removed: AircraftComparison[];
    unchanged: number;
  };
  summary: {
    totalChanges: number;
    newAircraft: number;
    removedAircraft: number;
    updatedAircraft: number;
  };
}

export interface RestoreOptions {
  backupId: string;
  dryRun?: boolean;
  confirmOverwrite?: boolean;
  restoreBy?: string;
  notes?: string;
}

export interface RestoreResult {
  success: boolean;
  restoredCount: number;
  errors: string[];
  duration: number;
  timestamp: Date;
}

// ============================================================================
// BACKUP MANAGER CLASS
// ============================================================================

export class FleetBackupManager {
  /**
   * Create a backup for an airline with validation
   */
  async createBackup(
    airlineCode: string,
    reason: string,
    createdBy?: string
  ): Promise<BackupRecord> {
    // Validate airline exists
    try {
      await fleetScraperClient.getAirlineStatus(airlineCode);
    } catch (error) {
      throw new Error(`Cannot create backup: Airline ${airlineCode} not found`);
    }

    // Create the backup
    const backup = await fleetScraperClient.createBackup(airlineCode, reason, createdBy);

    console.log(`✅ Backup created for ${airlineCode}: ${backup.backupId}`);
    return backup;
  }

  /**
   * Get all backups for an airline with enhanced information
   */
  async getAirlineBackups(airlineCode: string): Promise<BackupSummary[]> {
    const backups = await fleetScraperClient.getAirlineBackups(airlineCode);

    return backups.map((backup) => this.enhanceBackupInfo(backup));
  }

  /**
   * Get the most recent backup for an airline
   */
  async getLatestBackup(airlineCode: string): Promise<BackupSummary | null> {
    const backups = await this.getAirlineBackups(airlineCode);

    if (backups.length === 0) return null;

    // Sort by timestamp descending
    return backups.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
  }

  /**
   * Enhance backup record with calculated fields
   */
  private enhanceBackupInfo(backup: BackupRecord): BackupSummary {
    const timestamp = new Date(backup.backupTimestamp);
    const now = new Date();
    const ageInMs = now.getTime() - timestamp.getTime();
    const ageInDays = Math.floor(ageInMs / (1000 * 60 * 60 * 24));

    return {
      backupId: backup.backupId,
      airlineCode: backup.airlineCode,
      airlineName: backup.airlineName,
      fleetSize: backup.fleetSize,
      timestamp,
      reason: backup.backupReason,
      ageInDays,
      isActive: backup.isActive,
      canRestore: backup.isActive && !backup.restoredAt,
    };
  }

  /**
   * Compare backup with current data
   */
  async compareWithCurrent(backupId: string): Promise<BackupComparison> {
    const backup = await fleetScraperClient.getBackup(backupId);
    const currentStatus = await fleetScraperClient.getAirlineStatus(backup.airlineCode);

    // Get current fleet data (would need an endpoint for this)
    // For now, we'll structure the comparison framework
    const comparison: BackupComparison = {
      backupId,
      comparedWith: 'current',
      totalAircraft: {
        backup: backup.fleetSize,
        current: currentStatus.fleetSize,
      },
      changes: {
        new: [],
        updated: [],
        removed: [],
        unchanged: 0,
      },
      summary: {
        totalChanges: 0,
        newAircraft: 0,
        removedAircraft: 0,
        updatedAircraft: 0,
      },
    };

    return comparison;
  }

  /**
   * Compare backup with a scraping job's results
   */
  async compareWithJob(backupId: string, jobId: string): Promise<BackupComparison> {
    const comparisonResult = await fleetScraperClient.compareWithBackup(jobId, backupId);

    // Transform the comparison result into our format
    const comparison: BackupComparison = {
      backupId,
      comparedWith: 'job',
      totalAircraft: {
        backup: 0, // Would be populated from backup
        current: 0, // Would be populated from job
      },
      changes: {
        new: [],
        updated: [],
        removed: [],
        unchanged: 0,
      },
      summary: comparisonResult.summary,
    };

    // Group changes by type
    for (const change of comparisonResult.differences) {
      const aircraft: AircraftComparison = {
        registration: change.aircraftRegistration,
        status: this.mapChangeType(change.changeType),
        differences: this.extractDifferences(change.differences),
        oldData: change.oldData,
        newData: change.newData,
      };

      switch (aircraft.status) {
        case 'new':
          comparison.changes.new.push(aircraft);
          break;
        case 'updated':
          comparison.changes.updated.push(aircraft);
          break;
        case 'removed':
          comparison.changes.removed.push(aircraft);
          break;
        case 'unchanged':
          comparison.changes.unchanged++;
          break;
      }
    }

    return comparison;
  }

  /**
   * Map change type from API to our format
   */
  private mapChangeType(
    changeType: string
  ): 'new' | 'updated' | 'removed' | 'unchanged' {
    const mapping: Record<string, 'new' | 'updated' | 'removed' | 'unchanged'> = {
      new: 'new',
      updated: 'updated',
      retired: 'removed',
      unchanged: 'unchanged',
    };
    return mapping[changeType] || 'unchanged';
  }

  /**
   * Extract field-level differences
   */
  private extractDifferences(differencesObj: any): DataDifference[] {
    if (!differencesObj || typeof differencesObj !== 'object') return [];

    const differences: DataDifference[] = [];

    for (const [field, value] of Object.entries(differencesObj)) {
      if (typeof value === 'object' && value !== null && 'old' in value && 'new' in value) {
        differences.push({
          field,
          oldValue: (value as any).old,
          newValue: (value as any).new,
          changeType: 'modified',
        });
      }
    }

    return differences;
  }

  /**
   * Restore from a backup with validation
   */
  async restoreBackup(options: RestoreOptions): Promise<RestoreResult> {
    const startTime = Date.now();

    try {
      // Validate backup exists and is active
      const backup = await fleetScraperClient.getBackup(options.backupId);

      if (!backup.isActive) {
        throw new Error('Cannot restore: Backup is inactive');
      }

      if (backup.restoredAt) {
        throw new Error('Cannot restore: Backup has already been used for restoration');
      }

      // Dry run: just validate and return what would happen
      if (options.dryRun) {
        return {
          success: true,
          restoredCount: backup.fleetSize,
          errors: [],
          duration: Date.now() - startTime,
          timestamp: new Date(),
        };
      }

      // Perform the actual restore
      const result = await fleetScraperClient.restoreBackup(
        options.backupId,
        options.restoreBy
      );

      return {
        success: result.success,
        restoredCount: result.restoredCount,
        errors: [],
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        restoredCount: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Create backups for multiple airlines
   */
  async createBulkBackups(
    airlineCodes: string[],
    reason: string,
    createdBy?: string
  ): Promise<{ success: BackupRecord[]; failed: { code: string; error: string }[] }> {
    const results = await Promise.allSettled(
      airlineCodes.map((code) => this.createBackup(code, reason, createdBy))
    );

    const success: BackupRecord[] = [];
    const failed: { code: string; error: string }[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        success.push(result.value);
      } else {
        failed.push({
          code: airlineCodes[index],
          error: result.reason.message || 'Unknown error',
        });
      }
    });

    return { success, failed };
  }

  /**
   * Delete old backups (cleanup)
   */
  async deleteOldBackups(
    airlineCode: string,
    olderThanDays: number = 30,
    keepMinimum: number = 5
  ): Promise<{ deleted: number; kept: number }> {
    const backups = await this.getAirlineBackups(airlineCode);

    // Sort by timestamp descending (newest first)
    const sortedBackups = backups.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );

    // Always keep the minimum number of backups
    const backupsToKeep = sortedBackups.slice(0, keepMinimum);
    const backupsToConsider = sortedBackups.slice(keepMinimum);

    // Filter backups older than threshold
    const backupsToDelete = backupsToConsider.filter(
      (backup) => backup.ageInDays > olderThanDays
    );

    // Note: You'll need to implement a delete endpoint in the API
    // For now, this is just the structure
    console.log(
      `Would delete ${backupsToDelete.length} backups older than ${olderThanDays} days`
    );

    return {
      deleted: backupsToDelete.length,
      kept: backups.length - backupsToDelete.length,
    };
  }

  /**
   * Get backup statistics
   */
  async getBackupStatistics(airlineCode?: string): Promise<{
    totalBackups: number;
    oldestBackup: Date | null;
    newestBackup: Date | null;
    averageBackupSize: number;
    totalStorageUsed: number;
  }> {
    let backups: BackupSummary[];

    if (airlineCode) {
      backups = await this.getAirlineBackups(airlineCode);
    } else {
      // Get all backups (would need an endpoint for this)
      backups = [];
    }

    if (backups.length === 0) {
      return {
        totalBackups: 0,
        oldestBackup: null,
        newestBackup: null,
        averageBackupSize: 0,
        totalStorageUsed: 0,
      };
    }

    const timestamps = backups.map((b) => b.timestamp);
    const averageSize = backups.reduce((sum, b) => sum + b.fleetSize, 0) / backups.length;

    return {
      totalBackups: backups.length,
      oldestBackup: new Date(Math.min(...timestamps.map((d) => d.getTime()))),
      newestBackup: new Date(Math.max(...timestamps.map((d) => d.getTime()))),
      averageBackupSize: Math.round(averageSize),
      totalStorageUsed: backups.reduce((sum, b) => sum + b.fleetSize, 0),
    };
  }

  /**
   * Validate a backup's integrity
   */
  async validateBackup(backupId: string): Promise<{
    valid: boolean;
    issues: string[];
    warnings: string[];
  }> {
    try {
      const backup = await fleetScraperClient.getBackup(backupId);

      const issues: string[] = [];
      const warnings: string[] = [];

      // Check if backup has data
      if (!backup.aircraftData || typeof backup.aircraftData !== 'object') {
        issues.push('Backup data is missing or invalid');
      }

      // Check if fleet size matches data
      const dataSize = Array.isArray(backup.aircraftData)
        ? backup.aircraftData.length
        : 0;
      if (dataSize !== backup.fleetSize) {
        warnings.push(
          `Fleet size mismatch: expected ${backup.fleetSize}, found ${dataSize} aircraft`
        );
      }

      // Check backup age
      const backupSummary = this.enhanceBackupInfo(backup);
      if (backupSummary.ageInDays > 90) {
        warnings.push(`Backup is ${backupSummary.ageInDays} days old`);
      }

      return {
        valid: issues.length === 0,
        issues,
        warnings,
      };
    } catch (error) {
      return {
        valid: false,
        issues: [error instanceof Error ? error.message : 'Failed to validate backup'],
        warnings: [],
      };
    }
  }

  /**
   * Format backup age for display
   */
  formatBackupAge(backup: BackupSummary): string {
    if (backup.ageInDays === 0) return 'Today';
    if (backup.ageInDays === 1) return 'Yesterday';
    if (backup.ageInDays < 7) return `${backup.ageInDays} days ago`;
    if (backup.ageInDays < 30) {
      const weeks = Math.floor(backup.ageInDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    }
    const months = Math.floor(backup.ageInDays / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  }

  /**
   * Export backup to JSON file
   */
  async exportBackup(backupId: string): Promise<Blob> {
    const backup = await fleetScraperClient.getBackup(backupId);

    const exportData = {
      metadata: {
        backupId: backup.backupId,
        airlineCode: backup.airlineCode,
        airlineName: backup.airlineName,
        timestamp: backup.backupTimestamp,
        reason: backup.backupReason,
        fleetSize: backup.fleetSize,
      },
      data: backup.aircraftData,
      exportedAt: new Date().toISOString(),
    };

    const json = JSON.stringify(exportData, null, 2);
    return new Blob([json], { type: 'application/json' });
  }

  /**
   * Generate backup report
   */
  async generateBackupReport(airlineCode: string): Promise<string> {
    const backups = await this.getAirlineBackups(airlineCode);
    const stats = await this.getBackupStatistics(airlineCode);

    let report = `# Backup Report for ${airlineCode}\n\n`;
    report += `Generated: ${new Date().toISOString()}\n\n`;
    report += `## Summary\n\n`;
    report += `- Total Backups: ${stats.totalBackups}\n`;
    report += `- Oldest Backup: ${stats.oldestBackup?.toISOString() || 'N/A'}\n`;
    report += `- Newest Backup: ${stats.newestBackup?.toISOString() || 'N/A'}\n`;
    report += `- Average Fleet Size: ${stats.averageBackupSize}\n\n`;

    report += `## Backups\n\n`;
    for (const backup of backups) {
      report += `### ${backup.backupId}\n`;
      report += `- Timestamp: ${backup.timestamp.toISOString()}\n`;
      report += `- Age: ${this.formatBackupAge(backup)}\n`;
      report += `- Fleet Size: ${backup.fleetSize}\n`;
      report += `- Reason: ${backup.reason}\n`;
      report += `- Active: ${backup.isActive ? 'Yes' : 'No'}\n\n`;
    }

    return report;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

/**
 * Default backup manager instance
 */
export const fleetBackupManager = new FleetBackupManager();

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Quick backup before a risky operation
 */
export async function quickBackup(
  airlineCode: string,
  reason: string = 'Pre-operation backup'
): Promise<BackupRecord> {
  console.log(`🔄 Creating quick backup for ${airlineCode}...`);
  const backup = await fleetBackupManager.createBackup(airlineCode, reason);
  console.log(`✅ Quick backup created: ${backup.backupId}`);
  return backup;
}

/**
 * Safe restore with validation
 */
export async function safeRestore(
  backupId: string,
  restoredBy: string
): Promise<RestoreResult> {
  // First, validate the backup
  const validation = await fleetBackupManager.validateBackup(backupId);

  if (!validation.valid) {
    console.error('❌ Backup validation failed:', validation.issues);
    return {
      success: false,
      restoredCount: 0,
      errors: validation.issues,
      duration: 0,
      timestamp: new Date(),
    };
  }

  if (validation.warnings.length > 0) {
    console.warn('⚠️ Backup warnings:', validation.warnings);
  }

  // Perform the restore
  console.log(`🔄 Restoring from backup ${backupId}...`);
  const result = await fleetBackupManager.restoreBackup({
    backupId,
    restoreBy: restoredBy,
    dryRun: false,
  });

  if (result.success) {
    console.log(`✅ Restore completed: ${result.restoredCount} aircraft restored`);
  } else {
    console.error('❌ Restore failed:', result.errors);
  }

  return result;
}

/**
 * Create backup before starting a scraping job
 */
export async function backupBeforeScrape(
  airlineCode: string,
  jobId: string
): Promise<BackupRecord> {
  return quickBackup(airlineCode, `Pre-scrape backup for job ${jobId}`);
}

/**
 * Download backup as a file
 */
export async function downloadBackup(backupId: string, filename?: string): Promise<void> {
  const blob = await fleetBackupManager.exportBackup(backupId);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `backup-${backupId}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Example usage:
 *
 * ```tsx
 * import { fleetBackupManager, quickBackup, safeRestore } from '@/lib/fleet-backup-manager';
 *
 * // Create a backup before update
 * const backup = await quickBackup('UA', 'Before fleet update');
 *
 * // Compare backup with current data
 * const comparison = await fleetBackupManager.compareWithCurrent(backup.backupId);
 * console.log(`Found ${comparison.summary.totalChanges} changes`);
 *
 * // Restore if needed
 * if (somethingWentWrong) {
 *   await safeRestore(backup.backupId, 'admin@example.com');
 * }
 *
 * // Get all backups for an airline
 * const backups = await fleetBackupManager.getAirlineBackups('UA');
 *
 * // Export a backup
 * await downloadBackup(backup.backupId, 'ua-backup-2024-11-27.json');
 * ```
 */
