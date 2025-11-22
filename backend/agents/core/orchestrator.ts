/**
 * Orchestrator Agent
 * Coordinates the execution of specialized agents using LangGraph
 */

import { StateGraph, END } from '@langchain/langgraph';
import type { AgentInput, AgentResult, ValidationResult } from '../shared/types.js';
import { runFlightTimeCalculator } from './flight-time-calculator.js';
import { runPremiumPayCalculator } from './premium-pay-calculator.js';
import { runComplianceValidator } from './compliance-validator.js';

/**
 * State that flows through the agent graph
 */
interface OrchestratorState {
  input: AgentInput;
  flightTimeResult?: AgentResult;
  premiumPayResult?: AgentResult;
  complianceResult?: AgentResult;
  allResults: AgentResult[];
  finalDecision?: ValidationResult;
}

/**
 * Flight Time node - validates trip data
 */
async function flightTimeNode(state: OrchestratorState): Promise<Partial<OrchestratorState>> {
  console.log('🔍 Running Flight Time Calculator...');
  const result = await runFlightTimeCalculator(state.input);

  return {
    flightTimeResult: result,
    allResults: [...state.allResults, result]
  };
}

/**
 * Premium Pay node - validates amount calculations
 */
async function premiumPayNode(state: OrchestratorState): Promise<Partial<OrchestratorState>> {
  console.log('💰 Running Premium Pay Calculator...');
  const result = await runPremiumPayCalculator(state.input);

  return {
    premiumPayResult: result,
    allResults: [...state.allResults, result]
  };
}

/**
 * Compliance node - fraud detection and policy validation
 */
async function complianceNode(state: OrchestratorState): Promise<Partial<OrchestratorState>> {
  console.log('🛡️ Running Compliance Validator...');
  const result = await runComplianceValidator(state.input);

  return {
    complianceResult: result,
    allResults: [...state.allResults, result]
  };
}

/**
 * Final decision node - aggregates results and makes decision
 */
async function finalDecisionNode(state: OrchestratorState): Promise<Partial<OrchestratorState>> {
  console.log('⚖️ Making final decision...');

  const allResults = state.allResults;

  // Calculate overall confidence (average of all agent confidences)
  const confidences = allResults
    .filter(r => r.confidence !== undefined)
    .map(r => r.confidence!);
  const overallConfidence = confidences.length > 0
    ? confidences.reduce((a, b) => a + b, 0) / confidences.length
    : 0.5;

  // Determine overall status
  const hasErrors = allResults.some(r => r.status === 'error');
  const hasFlagged = allResults.some(r => r.status === 'flagged');

  let overallStatus: 'approved' | 'flagged' | 'rejected';
  if (hasErrors) {
    overallStatus = 'rejected';
  } else if (hasFlagged || overallConfidence < 0.7) {
    overallStatus = 'flagged';
  } else {
    overallStatus = 'approved';
  }

  // Collect all issues from agents
  const allIssues = allResults
    .filter(r => r.data?.issues)
    .flatMap(r => r.data!.issues);

  // Collect contract references from premium pay calculator
  const contractReferences = state.premiumPayResult?.data?.contractReferences || [];

  // Build recommendation
  let recommendation = '';
  if (overallStatus === 'approved') {
    recommendation = 'APPROVE - All validation checks passed';
  } else if (overallStatus === 'flagged') {
    recommendation = 'RECOMMEND: Request Additional Information';
  } else {
    recommendation = 'REJECT - Validation failed';
  }

  // Calculate total processing time
  const totalProcessingTime = allResults.reduce((sum, r) => sum + r.duration, 0);

  const finalDecision: ValidationResult = {
    claimId: state.input.claim.id,
    overallStatus,
    confidence: overallConfidence,
    processingTime: totalProcessingTime,
    recommendation,
    agentResults: allResults,
    issues: allIssues.length > 0 ? allIssues : undefined,
    contractReferences: contractReferences.length > 0 ? contractReferences : undefined,
    historicalAnalysis: state.input.historicalData
  };

  return {
    finalDecision
  };
}

/**
 * Build the LangGraph workflow
 */
function buildGraph() {
  const workflow = new StateGraph<OrchestratorState>({
    channels: {
      input: null,
      flightTimeResult: null,
      premiumPayResult: null,
      complianceResult: null,
      allResults: null,
      finalDecision: null
    }
  });

  // Add nodes
  workflow.addNode('flightTime', flightTimeNode);
  workflow.addNode('premiumPay', premiumPayNode);
  workflow.addNode('compliance', complianceNode);
  workflow.addNode('finalDecision', finalDecisionNode);

  // Set entry point
  workflow.setEntryPoint('flightTime');

  // Define edges
  workflow.addEdge('flightTime', 'premiumPay');
  workflow.addEdge('premiumPay', 'compliance');
  workflow.addEdge('compliance', 'finalDecision');
  workflow.addEdge('finalDecision', END);

  return workflow.compile();
}

/**
 * Run the orchestrator to validate a claim
 */
export async function orchestrateClaimValidation(
  input: AgentInput
): Promise<ValidationResult> {
  console.log(`\n🚀 Starting claim validation for ${input.claim.claimNumber}...`);
  const startTime = Date.now();

  try {
    const graph = buildGraph();

    const initialState: OrchestratorState = {
      input,
      allResults: []
    };

    const result = await graph.invoke(initialState);

    const totalTime = (Date.now() - startTime) / 1000;
    console.log(`✅ Validation complete in ${totalTime.toFixed(2)}s`);
    console.log(`📊 Decision: ${result.finalDecision!.overallStatus.toUpperCase()}`);
    console.log(`🎯 Confidence: ${(result.finalDecision!.confidence * 100).toFixed(1)}%\n`);

    return result.finalDecision!;
  } catch (error) {
    console.error('❌ Orchestrator error:', error);

    // Return error result
    return {
      claimId: input.claim.id,
      overallStatus: 'rejected',
      confidence: 0,
      processingTime: (Date.now() - startTime) / 1000,
      recommendation: 'ERROR - Failed to process claim',
      agentResults: [{
        agentType: 'orchestrator',
        agentName: 'Orchestrator',
        status: 'error',
        duration: 0,
        summary: 'Orchestration failed',
        details: [error instanceof Error ? error.message : 'Unknown error'],
        confidence: 0
      }]
    };
  }
}
