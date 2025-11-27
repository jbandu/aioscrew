/**
 * Test Lab Export Service
 * Handles PDF and CSV export functionality for execution results
 */

import PDFDocument from 'pdfkit';
import { Parser } from 'json2csv';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// ============================================================================
// TYPES
// ============================================================================

interface ExecutionData {
  id: number;
  scenario_id: string;
  scenario_name: string;
  workflow_id: string;
  status: string;
  started_at: Date;
  completed_at: Date;
  results: any;
  expected_outcomes: any;
  data_profile: any;
}

interface DecisionData {
  agent_name: string;
  claim_id: string;
  decision: string;
  reasoning: string[];
  confidence: number;
  processing_time_ms: number;
  created_at: Date;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function fetchExecutionData(executionId: number): Promise<{ execution: ExecutionData, decisions: DecisionData[] }> {
  // Fetch execution details
  const executionQuery = `
    SELECT
      e.id,
      e.scenario_id,
      e.workflow_id,
      e.status,
      e.started_at,
      e.completed_at,
      e.results,
      s.name as scenario_name,
      s.expected_outcomes,
      s.data_profile
    FROM test_lab_executions e
    LEFT JOIN test_lab_scenarios s ON e.scenario_id = s.id
    WHERE e.id = $1
  `;
  const executionResult = await pool.query(executionQuery, [executionId]);

  if (executionResult.rows.length === 0) {
    throw new Error('Execution not found');
  }

  // Fetch decisions
  const decisionsQuery = `
    SELECT
      agent_name,
      claim_id,
      decision,
      reasoning,
      confidence,
      processing_time_ms,
      created_at
    FROM agent_decisions
    WHERE execution_id = $1
    ORDER BY created_at ASC
  `;
  const decisionsResult = await pool.query(decisionsQuery, [executionId]);

  return {
    execution: executionResult.rows[0],
    decisions: decisionsResult.rows
  };
}

function formatTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}

// ============================================================================
// PDF EXPORT
// ============================================================================

export async function exportResultsToPDF(executionId: number): Promise<Buffer> {
  const { execution, decisions } = await fetchExecutionData(executionId);

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'LETTER',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Calculate metrics
      const results = execution.results || {};
      const totalClaims = results.totalClaims || 0;
      const approved = results.approved || 0;
      const escalated = results.escalated || 0;
      const rejected = results.rejected || 0;

      const approvedPct = totalClaims > 0 ? (approved / totalClaims) * 100 : 0;
      const escalatedPct = totalClaims > 0 ? (escalated / totalClaims) * 100 : 0;
      const rejectedPct = totalClaims > 0 ? (rejected / totalClaims) * 100 : 0;

      // Header
      doc.fontSize(24).fillColor('#0891b2').text('Test Lab Results', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(12).fillColor('#666666').text(`Execution Report`, { align: 'center' });
      doc.moveDown(1);

      // Execution Info
      doc.fontSize(14).fillColor('#000000').text('Execution Details', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor('#333333');
      doc.text(`Execution ID: ${execution.id}`);
      doc.text(`Scenario: ${execution.scenario_name}`);
      doc.text(`Workflow: ${execution.workflow_id}`);
      doc.text(`Started: ${new Date(execution.started_at).toLocaleString()}`);
      doc.text(`Completed: ${new Date(execution.completed_at).toLocaleString()}`);
      const executionTime = new Date(execution.completed_at).getTime() - new Date(execution.started_at).getTime();
      doc.text(`Duration: ${formatTime(executionTime)}`);
      doc.moveDown(1.5);

      // Summary Section
      doc.fontSize(14).fillColor('#000000').text('Summary', { underline: true });
      doc.moveDown(0.5);

      // Summary table
      const summaryY = doc.y;
      doc.fontSize(10).fillColor('#333333');
      doc.text(`Total Claims Processed: ${totalClaims}`, 50, summaryY);
      doc.text(`Auto-Approved: ${approved} (${approvedPct.toFixed(1)}%)`, 50, summaryY + 20);
      doc.text(`Escalated: ${escalated} (${escalatedPct.toFixed(1)}%)`, 50, summaryY + 40);
      doc.text(`Rejected: ${rejected} (${rejectedPct.toFixed(1)}%)`, 50, summaryY + 60);
      doc.text(`Avg Decision Time: ${formatTime(results.avgDecisionTime || 0)}`, 50, summaryY + 80);
      doc.moveDown(6);

      // Agent Performance Section
      if (results.agentPerformance) {
        doc.fontSize(14).fillColor('#000000').text('Agent Performance', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10).fillColor('#333333');

        Object.entries(results.agentPerformance).forEach(([agentName, perf]: [string, any]) => {
          doc.text(`${agentName}:`, { continued: false });
          doc.text(`  • Processed: ${perf.processed} claims`, { indent: 20 });
          doc.text(`  • Accuracy: ${perf.avgConfidence?.toFixed(1) || 'N/A'}%`, { indent: 20 });
          doc.text(`  • Avg Time: ${formatTime(perf.avgDecisionTime || 0)}`, { indent: 20 });
          doc.moveDown(0.5);
        });
        doc.moveDown(1);
      }

      // Decision Breakdown Section
      doc.fontSize(14).fillColor('#000000').text('Decision Breakdown', { underline: true });
      doc.moveDown(0.5);

      const decisionCounts = {
        APPROVED: decisions.filter(d => d.decision === 'APPROVED').length,
        ESCALATED: decisions.filter(d => d.decision === 'ESCALATED').length,
        REJECTED: decisions.filter(d => d.decision === 'REJECTED').length,
        ERROR: decisions.filter(d => d.decision === 'ERROR').length
      };

      doc.fontSize(10).fillColor('#333333');
      Object.entries(decisionCounts).forEach(([decision, count]) => {
        if (count > 0) {
          doc.text(`${decision}: ${count} claims`);
        }
      });
      doc.moveDown(1.5);

      // Notable Cases Section
      const notableCases = [
        ...decisions.filter(d => d.decision === 'REJECTED' && d.confidence >= 90).slice(0, 2),
        ...decisions.filter(d => d.decision === 'ESCALATED').slice(0, 2),
        ...decisions.filter(d => d.decision === 'APPROVED' && d.processing_time_ms < 1000).slice(0, 1)
      ];

      if (notableCases.length > 0) {
        doc.fontSize(14).fillColor('#000000').text('Notable Cases', { underline: true });
        doc.moveDown(0.5);

        notableCases.forEach((decision, idx) => {
          doc.fontSize(10).fillColor('#0891b2').text(`Case ${idx + 1}: ${decision.claim_id}`, { continued: false });
          doc.fontSize(9).fillColor('#333333');
          doc.text(`Agent: ${decision.agent_name}`, { indent: 20 });
          doc.text(`Decision: ${decision.decision}`, { indent: 20 });
          doc.text(`Confidence: ${decision.confidence}%`, { indent: 20 });
          doc.text(`Processing Time: ${formatTime(decision.processing_time_ms)}`, { indent: 20 });

          if (decision.reasoning && decision.reasoning.length > 0) {
            doc.text(`Reasoning:`, { indent: 20 });
            decision.reasoning.slice(0, 3).forEach((reason: string) => {
              doc.fontSize(8).text(`• ${reason}`, { indent: 30 });
            });
          }
          doc.moveDown(0.5);
        });
      }

      // Footer
      doc.fontSize(8).fillColor('#999999');
      const pageCount = doc.bufferedPageRange();
      for (let i = 0; i < pageCount.count; i++) {
        doc.switchToPage(i);
        doc.text(
          `Generated by Test Lab - ${new Date().toLocaleDateString()}`,
          50,
          doc.page.height - 50,
          { align: 'center' }
        );
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

// ============================================================================
// CSV EXPORT
// ============================================================================

export async function exportResultsToCSV(executionId: number): Promise<string> {
  const { execution, decisions } = await fetchExecutionData(executionId);

  // Calculate summary metrics
  const results = execution.results || {};
  const totalClaims = results.totalClaims || 0;
  const approved = results.approved || 0;
  const escalated = results.escalated || 0;
  const rejected = results.rejected || 0;

  const approvedPct = totalClaims > 0 ? (approved / totalClaims) * 100 : 0;
  const escalatedPct = totalClaims > 0 ? (escalated / totalClaims) * 100 : 0;
  const rejectedPct = totalClaims > 0 ? (rejected / totalClaims) * 100 : 0;

  const executionTime = new Date(execution.completed_at).getTime() - new Date(execution.started_at).getTime();

  // Summary CSV
  const summaryData = [
    {
      'Metric': 'Execution ID',
      'Value': execution.id.toString()
    },
    {
      'Metric': 'Scenario',
      'Value': execution.scenario_name
    },
    {
      'Metric': 'Workflow',
      'Value': execution.workflow_id
    },
    {
      'Metric': 'Started At',
      'Value': new Date(execution.started_at).toISOString()
    },
    {
      'Metric': 'Completed At',
      'Value': new Date(execution.completed_at).toISOString()
    },
    {
      'Metric': 'Duration',
      'Value': formatTime(executionTime)
    },
    {
      'Metric': 'Total Claims',
      'Value': totalClaims.toString()
    },
    {
      'Metric': 'Approved',
      'Value': `${approved} (${approvedPct.toFixed(1)}%)`
    },
    {
      'Metric': 'Escalated',
      'Value': `${escalated} (${escalatedPct.toFixed(1)}%)`
    },
    {
      'Metric': 'Rejected',
      'Value': `${rejected} (${rejectedPct.toFixed(1)}%)`
    },
    {
      'Metric': 'Avg Decision Time',
      'Value': formatTime(results.avgDecisionTime || 0)
    }
  ];

  const summaryParser = new Parser({ fields: ['Metric', 'Value'] });
  const summaryCSV = summaryParser.parse(summaryData);

  // Decisions CSV
  const decisionsData = decisions.map((decision) => ({
    'Claim ID': decision.claim_id,
    'Agent': decision.agent_name,
    'Decision': decision.decision,
    'Confidence': `${decision.confidence}%`,
    'Processing Time (ms)': decision.processing_time_ms,
    'Timestamp': new Date(decision.created_at).toISOString(),
    'Reasoning': Array.isArray(decision.reasoning) ? decision.reasoning.join('; ') : decision.reasoning
  }));

  const decisionsParser = new Parser({
    fields: ['Claim ID', 'Agent', 'Decision', 'Confidence', 'Processing Time (ms)', 'Timestamp', 'Reasoning']
  });
  const decisionsCSV = decisionsParser.parse(decisionsData);

  // Combine both CSVs
  return `EXECUTION SUMMARY\n${summaryCSV}\n\n\nDECISIONS DETAIL\n${decisionsCSV}`;
}
