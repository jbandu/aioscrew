/**
 * Test Lab Seed CLI Script
 * Seeds predefined test scenarios for COPA and Avelo airlines into test_scenarios table
 *
 * Usage:
 *   npm run seed:test-lab           # Seed scenarios
 *   npm run seed:test-lab -- --list # List existing scenarios
 */

import 'dotenv/config';
import { seedTestScenarios, listTestScenarios, closePool } from '../services/test-lab-seed.js';

/**
 * Main seed function
 */
async function seed(): Promise<void> {
  const args = process.argv.slice(2);
  const shouldList = args.includes('--list') || args.includes('-l');

  try {
    if (shouldList) {
      // List existing scenarios
      await listTestScenarios();
    } else {
      // Seed scenarios
      await seedTestScenarios();

      // Show what was seeded
      console.log('📋 Scenarios seeded:\n');
      await listTestScenarios();
    }
  } catch (error) {
    console.error('❌ Test Lab seed failed:', error);
    throw error;
  } finally {
    await closePool();
  }
}

// Run seed if executed directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('seed-test-lab.ts')) {
  seed()
    .then(() => {
      console.log('✅ Test Lab seed script completed\n');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test Lab seed script failed:', error);
      process.exit(1);
    });
}

export { seed };
