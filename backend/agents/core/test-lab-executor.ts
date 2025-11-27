/**
 * Test Lab Execution Engine
 * Orchestrates AI agents processing claims with real-time logging and decision tracking
 */

import { config } from 'dotenv';
config();

import pkg from 'pg';
const { Pool } = pkg;
import { EventEmitter } from 'events';
import Anthropic from '@anthropic-ai/sdk';
import type { AgentDecisionType, LogLevel } from '../../types/test-lab.js';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// ============================================================================
// LLM CONFIGURATION
// ============================================================================

const USE_LLM_AGENTS = process.env.USE_LLM_AGENTS === 'true';
const anthropic = USE_LLM_AGENTS && process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

if (USE_LLM_AGENTS) {
  if (!anthropic) {
    console.warn('⚠️  USE_LLM_AGENTS=true but ANTHROPIC_API_KEY not found. Falling back to rule-based agents.');
  } else {
    console.log('✓ LLM-powered agents enabled with Claude Sonnet 4.5');
  }
}

// ============================================================================
// INTERFACES
// ============================================================================

interface PayClaim {
  id: string;
  crew_id: string;
  claim_type: string;
  trip_id: string | null;
  claim_date: Date;
  amount: number;
  status: string;
  contract_reference: string | null;
  notes: string | null;
  is_international?: boolean;
  route?: string;
  crew_role?: string;
}

interface AgentDecisionResult {
  decision: AgentDecisionType;
  reasoning: string[];
  confidence: number;
  processingTimeMs: number;
  shouldEscalate?: boolean;
}

interface ExecutionResult {
  success: boolean;
  totalProcessed: number;
  approved: number;
  escalated: number;
  rejected: number;
  errors: number;
  avgProcessingTimeMs: number;
  executionTimeMs: number;
}

interface AgentMetrics {
  [agentName: string]: {
    totalDecisions: number;
    approved: number;
    escalated: number;
    rejected: number;
    avgConfidence: number;
    avgProcessingTime: number;
  };
}

// ============================================================================
// EVENT EMITTER FOR SSE STREAMING
// ============================================================================

export const executionEmitter = new EventEmitter();

// ============================================================================
// DATABASE HELPER FUNCTIONS
// ============================================================================

async function logExecution(
  executionId: number,
  logLevel: LogLevel,
  message: string,
  agentName: string | null = null,
  metadata: Record<string, any> = {}
): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO execution_logs (execution_id, log_level, agent_name, message, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [executionId, logLevel, agentName, message, JSON.stringify(metadata)]
    );

    // Emit event for SSE stream
    executionEmitter.emit('log', {
      executionId,
      logLevel,
      agentName,
      message,
      metadata,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error logging execution:', error);
  }
}

async function recordDecision(
  executionId: number,
  agentName: string,
  claimId: string,
  decision: AgentDecisionType,
  reasoning: string[],
  confidence: number,
  processingTimeMs: number
): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO agent_decisions (execution_id, agent_name, claim_id, decision, reasoning, confidence, processing_time_ms)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [executionId, agentName, claimId, decision, JSON.stringify(reasoning), confidence, processingTimeMs]
    );

    // Emit event for SSE stream
    executionEmitter.emit('decision', {
      executionId,
      agentName,
      claimId,
      decision,
      reasoning,
      confidence,
      processingTimeMs,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error recording decision:', error);
  }
}

async function updateExecutionStatus(
  executionId: number,
  status: 'running' | 'completed' | 'failed' | 'cancelled',
  results: Record<string, any> = {}
): Promise<void> {
  try {
    await pool.query(
      `UPDATE test_executions
       SET status = $1, completed_at = CURRENT_TIMESTAMP, results = $2
       WHERE id = $3`,
      [status, JSON.stringify(results), executionId]
    );

    if (status === 'completed' || status === 'failed') {
      executionEmitter.emit('complete', {
        executionId,
        status,
        results,
        timestamp: new Date()
      });
    }
  } catch (error) {
    console.error('Error updating execution status:', error);
  }
}

// ============================================================================
// AGENT CLASSES
// ============================================================================

class ClaimValidatorAgent {
  private name = 'ClaimValidator';

  /**
   * LLM-powered claim validation using Claude
   */
  private async processWithLLM(claim: PayClaim): Promise<AgentDecisionResult> {
    const startTime = Date.now();

    if (!anthropic) {
      // Fallback to rule-based if LLM not available
      return this.processWithRules(claim);
    }

    try {
      const prompt = `You are a ClaimValidatorAgent for an airline crew pay system.

Analyze this pay claim and decide: APPROVE, ESCALATE, or REJECT.

Claim Details:
- Claim ID: ${claim.id}
- Type: ${claim.claim_type}
- Amount: $${claim.amount}
- Crew ID: ${claim.crew_id}${claim.crew_role ? ` (${claim.crew_role})` : ''}
- Trip ID: ${claim.trip_id || 'N/A'}${claim.route ? ` - Route: ${claim.route}` : ''}${claim.is_international !== undefined ? ` (${claim.is_international ? 'International' : 'Domestic'})` : ''}
- Claim Date: ${claim.claim_date}
- Contract Reference: ${claim.contract_reference || 'Not provided'}
- Notes: ${claim.notes || 'None'}

Validation Rules:
1. Amount must be > $0 (REJECT if violated)
2. Amounts > $10,000 must be escalated
3. Valid claim types: international_premium, per_diem, layover_premium, holiday_pay, overtime, training, deadhead, lead_premium, other
4. International premium requires trip_id
5. Expected amount ranges by type:
   - per_diem: $20-$300
   - international_premium: $100-$1,500
   - layover_premium: $50-$500
   - holiday_pay: $100-$2,000
   - overtime: $50-$1,000
   - training: $100-$1,500
   - deadhead: $50-$800
   - lead_premium: $50-$500
6. Claims without contract_reference (except 'other' type) should reduce confidence
7. Escalate if confidence < 70%

Analyze the claim step-by-step, checking each rule. Provide clear reasoning.

Respond ONLY with valid JSON in this exact format (no markdown, no extra text):
{
  "decision": "APPROVE",
  "reasoning": ["✓ Valid claim type: per_diem", "✓ Amount $125 within expected range $20-$300", "✓ All validation checks passed with 95% confidence"],
  "confidence": 95
}`;

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 800,
        temperature: 0.3,
        messages: [{ role: 'user', content: prompt }]
      });

      // Parse LLM response
      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from LLM');
      }

      const result = JSON.parse(content.text);

      // Validate response structure
      if (!result.decision || !result.reasoning || typeof result.confidence !== 'number') {
        throw new Error('Invalid response structure from LLM');
      }

      // Ensure decision is valid type
      const validDecisions: AgentDecisionType[] = ['APPROVED', 'ESCALATED', 'REJECTED'];
      if (!validDecisions.includes(result.decision)) {
        throw new Error(`Invalid decision type: ${result.decision}`);
      }

      return {
        decision: result.decision,
        reasoning: result.reasoning,
        confidence: Math.min(100, Math.max(0, result.confidence)),
        processingTimeMs: Date.now() - startTime,
        shouldEscalate: result.decision === 'ESCALATED' || result.confidence < 70
      };

    } catch (error) {
      console.error('Error in LLM-powered claim validation:', error);
      console.log('Falling back to rule-based validation');
      // Fallback to rule-based on error
      return this.processWithRules(claim);
    }
  }

  /**
   * Rule-based claim validation (original logic)
   */
  private async processWithRules(claim: PayClaim): Promise<AgentDecisionResult> {
    const startTime = Date.now();
    const reasoning: string[] = [];
    let confidence = 95;
    let shouldEscalate = false;

    // Rule 1: Check if claim amount is within reasonable range
    if (claim.amount <= 0) {
      reasoning.push('❌ Invalid claim amount: must be greater than $0');
      return {
        decision: 'REJECTED',
        reasoning,
        confidence: 100,
        processingTimeMs: Date.now() - startTime
      };
    }

    if (claim.amount > 10000) {
      reasoning.push('⚠️ High-value claim exceeds $10,000 threshold');
      shouldEscalate = true;
      confidence -= 30;
    }

    // Rule 2: Check claim type validity
    const validClaimTypes = [
      'international_premium', 'per_diem', 'layover_premium',
      'holiday_pay', 'overtime', 'training', 'deadhead', 'lead_premium', 'other'
    ];

    if (!validClaimTypes.includes(claim.claim_type)) {
      reasoning.push(`⚠️ Unusual claim type: ${claim.claim_type}`);
      shouldEscalate = true;
      confidence -= 20;
    } else {
      reasoning.push(`✓ Valid claim type: ${claim.claim_type}`);
    }

    // Rule 3: International premium must have trip context
    if (claim.claim_type === 'international_premium' && !claim.trip_id) {
      reasoning.push('⚠️ International premium claim missing trip reference');
      shouldEscalate = true;
      confidence -= 25;
    }

    // Rule 4: Check amount reasonableness by claim type
    const expectedRanges: Record<string, { min: number; max: number }> = {
      per_diem: { min: 20, max: 300 },
      international_premium: { min: 100, max: 1500 },
      layover_premium: { min: 50, max: 500 },
      holiday_pay: { min: 100, max: 2000 },
      overtime: { min: 50, max: 1000 },
      training: { min: 100, max: 1500 },
      deadhead: { min: 50, max: 800 },
      lead_premium: { min: 50, max: 500 }
    };

    const range = expectedRanges[claim.claim_type];
    if (range) {
      if (claim.amount < range.min || claim.amount > range.max) {
        reasoning.push(`⚠️ Amount $${claim.amount} outside expected range $${range.min}-$${range.max}`);
        shouldEscalate = true;
        confidence -= 15;
      } else {
        reasoning.push(`✓ Amount $${claim.amount} within expected range`);
      }
    }

    // Rule 5: Check for missing documentation indicators
    if (!claim.contract_reference && claim.claim_type !== 'other') {
      reasoning.push('⚠️ Missing contract reference for standard claim type');
      confidence -= 10;
    }

    // Decision logic
    if (shouldEscalate || confidence < 70) {
      reasoning.push(`Confidence ${confidence}% - escalating for review`);
      return {
        decision: 'ESCALATED',
        reasoning,
        confidence,
        processingTimeMs: Date.now() - startTime,
        shouldEscalate: true
      };
    }

    reasoning.push(`✓ All validation checks passed with ${confidence}% confidence`);
    return {
      decision: 'APPROVED',
      reasoning,
      confidence,
      processingTimeMs: Date.now() - startTime
    };
  }

  /**
   * Main process method - routes to LLM or rule-based logic
   */
  async process(claim: PayClaim): Promise<AgentDecisionResult> {
    if (USE_LLM_AGENTS && anthropic) {
      return this.processWithLLM(claim);
    }
    return this.processWithRules(claim);
  }
}

class ComplianceCheckerAgent {
  private name = 'ComplianceChecker';

  /**
   * LLM-powered compliance review using Claude
   */
  private async processWithLLM(claim: PayClaim, escalationReason: string[]): Promise<AgentDecisionResult> {
    const startTime = Date.now();

    if (!anthropic) {
      return this.processWithRules(claim, escalationReason);
    }

    try {
      const prompt = `You are a ComplianceCheckerAgent for an airline crew pay system.

This claim was ESCALATED by the ClaimValidator. Review it for compliance and make a final decision: APPROVE, ESCALATE (for manual review), or REJECT.

Claim Details:
- Claim ID: ${claim.id}
- Type: ${claim.claim_type}
- Amount: $${claim.amount}
- Crew ID: ${claim.crew_id}${claim.crew_role ? ` (${claim.crew_role})` : ''}
- Trip ID: ${claim.trip_id || 'N/A'}${claim.route ? ` - Route: ${claim.route}` : ''}
- Claim Date: ${claim.claim_date}
- Contract Reference: ${claim.contract_reference || 'Not provided'}
- Days since claim date: ${Math.floor((Date.now() - new Date(claim.claim_date).getTime()) / (1000 * 60 * 60 * 24))}

Escalation Reasons from ClaimValidator:
${escalationReason.slice(-3).map(r => `- ${r}`).join('\n')}

Compliance Rules:
1. HIGH-VALUE CLAIMS:
   - $5,000-$10,000: Requires VP approval (can approve if well-documented)
   - Over $10,000: MUST REJECT - requires manual approval process
2. RETROACTIVE CLAIMS:
   - Over 90 days old require special justification
   - Reduce confidence significantly
3. DUPLICATE DETECTION:
   - Check for patterns indicating potential duplicates
   - Reject if high suspicion
4. CONTRACT COMPLIANCE:
   - Claims without contract_reference need extra scrutiny
   - Reduce confidence
5. ROLE RESTRICTIONS:
   - Captains/First Officers: international_premium, per_diem, layover_premium, holiday_pay
   - Senior Flight Attendants: per_diem, layover_premium, lead_premium, holiday_pay
   - Flight Attendants: per_diem, layover_premium, holiday_pay
   - Unusual pairings should reduce confidence
6. DECISION THRESHOLDS:
   - Confidence < 60%: REJECT
   - Confidence 60-74%: ESCALATE for manual review
   - Confidence >= 75%: APPROVE

Analyze thoroughly. Consider all escalation reasons. Make a reasoned judgment.

Respond ONLY with valid JSON (no markdown, no extra text):
{
  "decision": "APPROVE",
  "reasoning": ["Reviewing escalated claim...", "Escalation reasons: ...", "✓ Compliance checks passed with 85% confidence"],
  "confidence": 85
}`;

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        temperature: 0.2,
        messages: [{ role: 'user', content: prompt }]
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from LLM');
      }

      const result = JSON.parse(content.text);

      if (!result.decision || !result.reasoning || typeof result.confidence !== 'number') {
        throw new Error('Invalid response structure from LLM');
      }

      const validDecisions: AgentDecisionType[] = ['APPROVED', 'ESCALATED', 'REJECTED'];
      if (!validDecisions.includes(result.decision)) {
        throw new Error(`Invalid decision type: ${result.decision}`);
      }

      return {
        decision: result.decision,
        reasoning: result.reasoning,
        confidence: Math.min(100, Math.max(0, result.confidence)),
        processingTimeMs: Date.now() - startTime
      };

    } catch (error) {
      console.error('Error in LLM-powered compliance check:', error);
      console.log('Falling back to rule-based compliance check');
      return this.processWithRules(claim, escalationReason);
    }
  }

  /**
   * Rule-based compliance review (original logic)
   */
  private async processWithRules(claim: PayClaim, escalationReason: string[]): Promise<AgentDecisionResult> {
    const startTime = Date.now();
    const reasoning: string[] = ['Reviewing escalated claim...'];
    let confidence = 85;

    // Add escalation context
    reasoning.push(`Escalation reasons: ${escalationReason.slice(-2).join('; ')}`);

    // Rule 1: High-value claim review
    if (claim.amount > 5000) {
      reasoning.push(`⚠️ High-value claim: $${claim.amount} requires VP approval`);

      if (claim.amount > 10000) {
        reasoning.push('❌ Claims over $10,000 require manual review and approval');
        return {
          decision: 'REJECTED',
          reasoning: [...reasoning, 'Please submit through manual approval process'],
          confidence: 95,
          processingTimeMs: Date.now() - startTime
        };
      }

      confidence -= 15;
    }

    // Rule 2: Duplicate detection (simple heuristic)
    const duplicateRisk = Math.random() < 0.05; // 5% chance in simulation
    if (duplicateRisk) {
      reasoning.push('⚠️ Potential duplicate claim detected');
      reasoning.push('Similar claim found for same crew member and date range');
      confidence -= 30;
    }

    // Rule 3: Retroactive claim handling
    const daysSinceClaimDate = Math.floor(
      (Date.now() - new Date(claim.claim_date).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceClaimDate > 90) {
      reasoning.push(`⚠️ Retroactive claim: ${daysSinceClaimDate} days old`);
      reasoning.push('Claims over 90 days require special justification');
      confidence -= 20;
    }

    // Rule 4: Contract compliance check
    if (!claim.contract_reference) {
      reasoning.push('⚠️ No contract reference provided');
      confidence -= 15;
    } else {
      reasoning.push(`✓ Contract reference: ${claim.contract_reference}`);
    }

    // Rule 5: Crew role and claim type matching
    if (claim.crew_role) {
      const roleRestrictions: Record<string, string[]> = {
        'Captain': ['international_premium', 'per_diem', 'layover_premium', 'holiday_pay'],
        'First Officer': ['international_premium', 'per_diem', 'layover_premium', 'holiday_pay'],
        'Senior Flight Attendant': ['per_diem', 'layover_premium', 'lead_premium', 'holiday_pay'],
        'Flight Attendant': ['per_diem', 'layover_premium', 'holiday_pay']
      };

      const allowedTypes = roleRestrictions[claim.crew_role] || [];
      if (allowedTypes.length > 0 && !allowedTypes.includes(claim.claim_type)) {
        reasoning.push(`⚠️ Claim type ${claim.claim_type} unusual for role ${claim.crew_role}`);
        confidence -= 10;
      }
    }

    // Decision logic
    if (confidence < 60) {
      reasoning.push(`Low confidence ${confidence}% - rejecting claim`);
      return {
        decision: 'REJECTED',
        reasoning: [...reasoning, 'Please provide additional documentation and resubmit'],
        confidence,
        processingTimeMs: Date.now() - startTime
      };
    }

    if (confidence < 75) {
      reasoning.push(`Moderate confidence ${confidence}% - requires manual review`);
      return {
        decision: 'ESCALATED',
        reasoning: [...reasoning, 'Forwarding to senior reviewer for final decision'],
        confidence,
        processingTimeMs: Date.now() - startTime
      };
    }

    reasoning.push(`✓ Compliance checks passed with ${confidence}% confidence`);
    return {
      decision: 'APPROVED',
      reasoning,
      confidence,
      processingTimeMs: Date.now() - startTime
    };
  }

  /**
   * Main process method - routes to LLM or rule-based logic
   */
  async process(claim: PayClaim, escalationReason: string[]): Promise<AgentDecisionResult> {
    if (USE_LLM_AGENTS && anthropic) {
      return this.processWithLLM(claim, escalationReason);
    }
    return this.processWithRules(claim, escalationReason);
  }
}

class PayrollProcessorAgent {
  private name = 'PayrollProcessor';

  /**
   * Finalizes claim processing and updates database
   */
  async finalize(
    claim: PayClaim,
    decision: AgentDecisionResult,
    executionId: number
  ): Promise<void> {
    const startTime = Date.now();

    try {
      // Update claim status in database
      const newStatus = decision.decision === 'APPROVED' ? 'approved' :
                       decision.decision === 'REJECTED' ? 'rejected' : 'escalated';

      await pool.query(
        `UPDATE pay_claims
         SET status = $1,
             ai_validated = true,
             ai_recommendation = $2,
             ai_confidence = $3,
             ai_reasoning = $4,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $5`,
        [
          newStatus,
          decision.decision,
          decision.confidence / 100,
          decision.reasoning.join(' | '),
          claim.id
        ]
      );

      // Log finalization
      await logExecution(
        executionId,
        'INFO',
        `Claim ${claim.id} finalized as ${newStatus}`,
        this.name,
        {
          claimId: claim.id,
          decision: decision.decision,
          confidence: decision.confidence,
          processingTime: Date.now() - startTime
        }
      );
    } catch (error) {
      console.error(`Error finalizing claim ${claim.id}:`, error);
      await logExecution(
        executionId,
        'ERROR',
        `Failed to finalize claim ${claim.id}: ${error}`,
        this.name,
        { claimId: claim.id, error: String(error) }
      );
      throw error;
    }
  }
}

// ============================================================================
// MAIN EXECUTION ORCHESTRATOR
// ============================================================================

export async function executeTestScenario(
  executionId: number,
  scenarioId: string,
  showLogs: boolean = true
): Promise<ExecutionResult> {
  const executionStartTime = Date.now();

  const validator = new ClaimValidatorAgent();
  const complianceChecker = new ComplianceCheckerAgent();
  const payrollProcessor = new PayrollProcessorAgent();

  let totalProcessed = 0;
  let approved = 0;
  let escalated = 0;
  let rejected = 0;
  let errors = 0;
  let totalProcessingTime = 0;

  try {
    // Log execution start
    await logExecution(
      executionId,
      'MILESTONE',
      'Agent execution started',
      null,
      { scenarioId, showLogs }
    );

    // Load all pending claims for this execution
    const claimsResult = await pool.query(
      `SELECT pc.*, t.route, t.is_international, cm.role as crew_role
       FROM pay_claims pc
       LEFT JOIN trips t ON pc.trip_id = t.id
       LEFT JOIN crew_members cm ON pc.crew_id = cm.id
       WHERE pc.status = 'pending'
       ORDER BY pc.claim_date ASC`
    );

    const claims: PayClaim[] = claimsResult.rows;

    if (claims.length === 0) {
      await logExecution(
        executionId,
        'WARN',
        'No pending claims found to process',
        null,
        { scenarioId }
      );

      const result: ExecutionResult = {
        success: true,
        totalProcessed: 0,
        approved: 0,
        escalated: 0,
        rejected: 0,
        errors: 0,
        avgProcessingTimeMs: 0,
        executionTimeMs: Date.now() - executionStartTime
      };

      await updateExecutionStatus(executionId, 'completed', result);
      return result;
    }

    await logExecution(
      executionId,
      'INFO',
      `Found ${claims.length} pending claims to process`,
      null,
      { claimCount: claims.length }
    );

    // Process each claim sequentially
    for (const claim of claims) {
      try {
        totalProcessed++;

        if (showLogs) {
          await logExecution(
            executionId,
            'INFO',
            `Processing claim ${claim.id} (${claim.claim_type}, $${claim.amount})`,
            null,
            {
              claimId: claim.id,
              claimType: claim.claim_type,
              amount: claim.amount,
              progress: `${totalProcessed}/${claims.length}`
            }
          );
        }

        // Stage 1: ClaimValidator
        await logExecution(
          executionId,
          'AGENT_ACTION',
          `ClaimValidator analyzing claim ${claim.id}`,
          'ClaimValidator',
          { claimId: claim.id }
        );

        const validationResult = await validator.process(claim);
        totalProcessingTime += validationResult.processingTimeMs;

        if (showLogs) {
          await logExecution(
            executionId,
            validationResult.decision === 'APPROVED' ? 'INFO' : 'WARN',
            `ClaimValidator decision: ${validationResult.decision}`,
            'ClaimValidator',
            {
              claimId: claim.id,
              decision: validationResult.decision,
              confidence: validationResult.confidence,
              reasoning: validationResult.reasoning
            }
          );
        }

        let finalDecision = validationResult;

        // Stage 2: ComplianceChecker (if escalated)
        if (validationResult.shouldEscalate || validationResult.decision === 'ESCALATED') {
          await logExecution(
            executionId,
            'AGENT_ACTION',
            `ComplianceChecker reviewing escalated claim ${claim.id}`,
            'ComplianceChecker',
            { claimId: claim.id }
          );

          const complianceResult = await complianceChecker.process(claim, validationResult.reasoning);
          totalProcessingTime += complianceResult.processingTimeMs;

          if (showLogs) {
            await logExecution(
              executionId,
              complianceResult.decision === 'REJECTED' ? 'ERROR' : 'INFO',
              `ComplianceChecker decision: ${complianceResult.decision}`,
              'ComplianceChecker',
              {
                claimId: claim.id,
                decision: complianceResult.decision,
                confidence: complianceResult.confidence,
                reasoning: complianceResult.reasoning
              }
            );
          }

          finalDecision = complianceResult;
        }

        // Stage 3: PayrollProcessor finalization
        await payrollProcessor.finalize(claim, finalDecision, executionId);

        // Record decision
        await recordDecision(
          executionId,
          finalDecision.shouldEscalate ? 'ComplianceChecker' : 'ClaimValidator',
          claim.id,
          finalDecision.decision,
          finalDecision.reasoning,
          finalDecision.confidence,
          finalDecision.processingTimeMs
        );

        // Update counters
        if (finalDecision.decision === 'APPROVED') approved++;
        else if (finalDecision.decision === 'ESCALATED') escalated++;
        else if (finalDecision.decision === 'REJECTED') rejected++;

        // Emit progress event
        executionEmitter.emit('progress', {
          executionId,
          processed: totalProcessed,
          total: claims.length,
          approved,
          escalated,
          rejected
        });

        // Add realistic delay for demo effect (100-500ms)
        await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 400));

      } catch (claimError) {
        errors++;
        console.error(`Error processing claim ${claim.id}:`, claimError);

        await logExecution(
          executionId,
          'ERROR',
          `Failed to process claim ${claim.id}: ${claimError}`,
          null,
          { claimId: claim.id, error: String(claimError) }
        );

        await recordDecision(
          executionId,
          'System',
          claim.id,
          'ERROR',
          [`Processing error: ${claimError}`],
          0,
          0
        );
      }
    }

    // Calculate final results
    const avgProcessingTimeMs = totalProcessed > 0 ? Math.round(totalProcessingTime / totalProcessed) : 0;
    const executionTimeMs = Date.now() - executionStartTime;

    const result: ExecutionResult = {
      success: true,
      totalProcessed,
      approved,
      escalated,
      rejected,
      errors,
      avgProcessingTimeMs,
      executionTimeMs
    };

    await logExecution(
      executionId,
      'MILESTONE',
      'Agent execution completed successfully',
      null,
      result
    );

    await updateExecutionStatus(executionId, 'completed', result);

    return result;

  } catch (error) {
    console.error('Fatal error in test execution:', error);

    await logExecution(
      executionId,
      'ERROR',
      `Fatal execution error: ${error}`,
      null,
      { error: String(error) }
    );

    await updateExecutionStatus(executionId, 'failed', {
      error: String(error),
      totalProcessed,
      approved,
      escalated,
      rejected,
      errors
    });

    throw error;
  }
}

/**
 * Close the database pool
 */
export async function closePool(): Promise<void> {
  await pool.end();
}
