/**
 * Test Lab Seed Service
 * Seeds predefined test scenarios for COPA and Avelo airlines
 */

import { config } from 'dotenv';
config();

import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

interface TestScenario {
  id: string;
  workflow_id: string;
  name: string;
  description: string;
  client_name: string;
  data_profile: {
    totalCrew: number;
    crewBreakdown: {
      captains: number;
      firstOfficers: number;
      seniorFA: number;
      juniorFA: number;
    };
    totalClaims: number;
    duration: string;
    claimDistribution: Record<string, number>;
    expectedApprovalRate: number;
    expectedViolations: number;
    expectedDisruptions: number;
    edgeCases?: {
      missingDocumentation?: number;
      conflictingData?: number;
      duplicates?: number;
      retroactive?: number;
    };
  };
  expected_outcomes: {
    autoApproved: number;
    escalated: number;
    rejected: number;
    avgProcessingTime: string;
  };
  timeline: string;
}

const scenarios: TestScenario[] = [
  // =========================================================================
  // COPA AIRLINES SCENARIOS
  // =========================================================================
  {
    id: 'copa-baseline',
    workflow_id: 'crew-pay',
    name: 'COPA Baseline Demo',
    description: 'Standard operational scenario for Copa Airlines demonstrating typical crew pay processing with high approval rates and minimal edge cases. Ideal for showcasing AI agent capabilities in normal conditions.',
    client_name: 'Copa Airlines',
    data_profile: {
      totalCrew: 20,
      crewBreakdown: {
        captains: 5,
        firstOfficers: 5,
        seniorFA: 6,
        juniorFA: 4
      },
      totalClaims: 40,
      duration: '1 month',
      claimDistribution: {
        international_premium: 37.5,
        per_diem: 30,
        layover_premium: 20,
        holiday_pay: 7.5,
        overtime: 5
      },
      expectedApprovalRate: 90,
      expectedViolations: 2,
      expectedDisruptions: 1
    },
    expected_outcomes: {
      autoApproved: 36,
      escalated: 4,
      rejected: 0,
      avgProcessingTime: '2 minutes'
    },
    timeline: '1 month'
  },
  {
    id: 'copa-holiday-rush',
    workflow_id: 'crew-pay',
    name: 'COPA Holiday Rush',
    description: 'High-volume holiday period scenario for Copa Airlines with increased overtime and holiday pay claims. Tests AI agent performance under stress with elevated claim volumes and multiple disruptions.',
    client_name: 'Copa Airlines',
    data_profile: {
      totalCrew: 30,
      crewBreakdown: {
        captains: 8,
        firstOfficers: 8,
        seniorFA: 8,
        juniorFA: 6
      },
      totalClaims: 120,
      duration: '2 weeks',
      claimDistribution: {
        holiday_pay: 25,
        overtime: 21,
        international_premium: 21,
        per_diem: 17,
        deadhead: 12,
        other: 4
      },
      expectedApprovalRate: 75,
      expectedViolations: 8,
      expectedDisruptions: 5
    },
    expected_outcomes: {
      autoApproved: 85,
      escalated: 28,
      rejected: 7,
      avgProcessingTime: '4 minutes'
    },
    timeline: '2 weeks'
  },
  {
    id: 'copa-edge-cases',
    workflow_id: 'crew-pay',
    name: 'COPA Edge Case Testing',
    description: 'Specialized scenario designed to test AI agent handling of unusual claims and edge cases. Includes missing documentation, conflicting data, duplicates, and retroactive claims. Lower approval rates expected.',
    client_name: 'Copa Airlines',
    data_profile: {
      totalCrew: 15,
      crewBreakdown: {
        captains: 4,
        firstOfficers: 4,
        seniorFA: 4,
        juniorFA: 3
      },
      totalClaims: 25,
      duration: '1 month',
      claimDistribution: {
        other: 40,
        training: 24,
        deadhead: 20,
        lead_premium: 16
      },
      expectedApprovalRate: 60,
      expectedViolations: 12,
      expectedDisruptions: 8,
      edgeCases: {
        missingDocumentation: 3,
        conflictingData: 2,
        duplicates: 1,
        retroactive: 2
      }
    },
    expected_outcomes: {
      autoApproved: 10,
      escalated: 12,
      rejected: 3,
      avgProcessingTime: '8 minutes'
    },
    timeline: '1 month'
  },

  // =========================================================================
  // AVELO AIRLINES SCENARIOS
  // =========================================================================
  {
    id: 'avelo-baseline',
    workflow_id: 'crew-pay',
    name: 'Avelo Baseline Demo',
    description: 'Standard operational scenario for Avelo Airlines showing typical crew pay processing for a smaller carrier. High approval rates with focus on domestic operations and training claims.',
    client_name: 'Avelo Airlines',
    data_profile: {
      totalCrew: 18,
      crewBreakdown: {
        captains: 4,
        firstOfficers: 4,
        seniorFA: 6,
        juniorFA: 4
      },
      totalClaims: 35,
      duration: '1 month',
      claimDistribution: {
        per_diem: 30,
        overtime: 25,
        international_premium: 20,
        layover_premium: 15,
        training: 10
      },
      expectedApprovalRate: 88,
      expectedViolations: 1,
      expectedDisruptions: 2
    },
    expected_outcomes: {
      autoApproved: 31,
      escalated: 3,
      rejected: 1,
      avgProcessingTime: '2.5 minutes'
    },
    timeline: '1 month'
  },
  {
    id: 'avelo-growth',
    workflow_id: 'crew-pay',
    name: 'Avelo Growth Period',
    description: 'Expansion phase scenario for Avelo Airlines with heavy emphasis on training claims as new crew members are onboarded. Tests AI agent handling of training documentation and new hire claim processing.',
    client_name: 'Avelo Airlines',
    data_profile: {
      totalCrew: 25,
      crewBreakdown: {
        captains: 6,
        firstOfficers: 6,
        seniorFA: 8,
        juniorFA: 5
      },
      totalClaims: 80,
      duration: '1 month',
      claimDistribution: {
        training: 30,
        per_diem: 25,
        overtime: 20,
        international_premium: 15,
        other: 10
      },
      expectedApprovalRate: 82,
      expectedViolations: 4,
      expectedDisruptions: 3
    },
    expected_outcomes: {
      autoApproved: 66,
      escalated: 12,
      rejected: 2,
      avgProcessingTime: '3 minutes'
    },
    timeline: '1 month'
  }
];

/**
 * Seed test scenarios into the database
 */
export async function seedTestScenarios(): Promise<void> {
  console.log('\n🌱 Starting Test Lab scenario seeding...\n');

  try {
    // First, verify the crew-pay workflow exists
    const workflowCheck = await pool.query(
      'SELECT id FROM test_workflows WHERE id = $1',
      ['crew-pay']
    );

    if (workflowCheck.rows.length === 0) {
      throw new Error('Workflow "crew-pay" not found. Please run the test_lab_schema.sql migration first.');
    }

    console.log('✅ Verified workflow "crew-pay" exists\n');

    let insertedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const scenario of scenarios) {
      // Check if scenario already exists
      const existingCheck = await pool.query(
        'SELECT id FROM test_scenarios WHERE id = $1',
        [scenario.id]
      );

      if (existingCheck.rows.length > 0) {
        // Update existing scenario
        await pool.query(
          `UPDATE test_scenarios
           SET workflow_id = $2,
               name = $3,
               description = $4,
               client_name = $5,
               data_profile = $6,
               expected_outcomes = $7,
               timeline = $8,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [
            scenario.id,
            scenario.workflow_id,
            scenario.name,
            scenario.description,
            scenario.client_name,
            JSON.stringify(scenario.data_profile),
            JSON.stringify(scenario.expected_outcomes),
            scenario.timeline
          ]
        );
        console.log(`🔄 Updated: ${scenario.id} - ${scenario.name}`);
        updatedCount++;
      } else {
        // Insert new scenario
        await pool.query(
          `INSERT INTO test_scenarios (
            id, workflow_id, name, description, client_name,
            data_profile, expected_outcomes, timeline
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            scenario.id,
            scenario.workflow_id,
            scenario.name,
            scenario.description,
            scenario.client_name,
            JSON.stringify(scenario.data_profile),
            JSON.stringify(scenario.expected_outcomes),
            scenario.timeline
          ]
        );
        console.log(`✅ Inserted: ${scenario.id} - ${scenario.name}`);
        insertedCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Test Lab scenario seeding complete!');
    console.log('='.repeat(60));
    console.log(`📊 Summary:`);
    console.log(`   - Inserted: ${insertedCount} scenarios`);
    console.log(`   - Updated:  ${updatedCount} scenarios`);
    console.log(`   - Total:    ${scenarios.length} scenarios`);
    console.log('');
    console.log('📋 Scenarios by client:');
    console.log(`   - Copa Airlines: 3 scenarios`);
    console.log(`   - Avelo Airlines: 2 scenarios`);
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Error seeding test scenarios:', error);
    throw error;
  }
}

/**
 * Get all seeded scenarios (for verification)
 */
export async function listTestScenarios(): Promise<void> {
  try {
    const result = await pool.query(
      `SELECT id, name, client_name, timeline, created_at
       FROM test_scenarios
       ORDER BY client_name, id`
    );

    console.log('\n📋 Test Scenarios in Database:\n');
    console.log('='.repeat(80));

    if (result.rows.length === 0) {
      console.log('No scenarios found. Run seedTestScenarios() first.');
    } else {
      let currentClient = '';
      for (const row of result.rows) {
        if (row.client_name !== currentClient) {
          if (currentClient !== '') console.log('');
          currentClient = row.client_name;
          console.log(`\n${currentClient}:`);
          console.log('-'.repeat(80));
        }
        console.log(`  ${row.id.padEnd(25)} | ${row.name.padEnd(35)} | ${row.timeline}`);
      }
    }

    console.log('\n' + '='.repeat(80) + '\n');
  } catch (error) {
    console.error('❌ Error listing test scenarios:', error);
    throw error;
  }
}

/**
 * Close the database pool
 */
export async function closePool(): Promise<void> {
  await pool.end();
}
