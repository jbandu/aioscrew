/**
 * AI-Powered Claim Validation Service
 *
 * Uses Claude API to validate calculated claims against CBA rules
 * and provide confidence scoring for auto-approval decisions.
 */

import Anthropic from '@anthropic-ai/sdk';
import { DetectedClaim, Trip } from './claim-calculators.js';

// Re-export types for convenience
export type { DetectedClaim, Trip };

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export interface ValidationResult {
  valid: boolean;
  confidence: number; // 0-100
  recommendation: 'auto-approve' | 'manual-review' | 'reject';
  reasoning: string;
  contract_references: string[];
}

// CBA rules summary for context
const CBA_RULES_CONTEXT = `
# Collective Bargaining Agreement (CBA) - Pay Rules Summary

## Per Diem
- Domestic: $2.25-$2.90/hour based on Time Away From Base (TAFB)
- International: $2.90-$5.00/hour based on TAFB
- Calculated from check-in to check-in (not just flight time)
- Non-taxable, not included in pension calculations

## International Premium
- Additional $3.00-$3.75/hour paid on block time (wheels up to wheels down)
- Minimum payment of $125 per international trip
- Taxable and pensionable
- Applies to all flights crossing international borders

## IROP (Irregular Operations) Premium
- 2x base rate for duty periods exceeding 12:30 hours
- 3x base rate for duty periods exceeding 16:00 hours
- Premium applies only to excess hours beyond threshold
- Duty period = check-in to check-out including delays

## Holiday Premium
- 100% premium (double rate) for flights operated on designated holidays
- Must actually fly - not just be on duty
- Applies to block hours flown on holiday date
- Designated holidays: New Year's Day, Independence Day, Thanksgiving, Christmas

## Calculation Hierarchy
- All applicable rigs calculated, highest value paid
- Trip rig: TAFB ÷ 3.5 = credit hours
- Duty rig: Duty hours ÷ 2 = credit hours
- Block or better: Scheduled vs actual, whichever greater
`;

/**
 * Validate a detected claim using Claude AI
 *
 * This sends the claim details to Claude for validation against CBA rules.
 * Claude will check if the calculation is correct, if the claim type is appropriate,
 * and provide a confidence score and recommendation.
 */
export async function validateClaim(
  claim: DetectedClaim,
  trip: Trip
): Promise<ValidationResult> {
  const prompt = `You are an expert in airline crew pay rules and collective bargaining agreements.
Your task is to validate whether this automatically detected pay claim is valid and correctly calculated.

CLAIM DETAILS:
- Type: ${claim.claim_type}
- Amount: $${claim.amount}
- Crew ID: ${claim.crew_id}
- Trip ID: ${claim.trip_id}
- Description: ${claim.description}
- Detection Method: ${claim.detection_method}
- Supporting Data: ${JSON.stringify(claim.supporting_data, null, 2)}

TRIP DETAILS:
- Route: ${trip.route}
- Date: ${trip.trip_date.toISOString().split('T')[0]}
- Departure: ${trip.departure_time}
- Arrival: ${trip.arrival_time}
- Flight Time: ${trip.flight_time_hours} hours
- Credit Hours: ${trip.credit_hours} hours
- International: ${trip.is_international ? 'Yes' : 'No'}
- Status: ${trip.status}

CBA RULES:
${CBA_RULES_CONTEXT}

Please validate this claim by answering:
1. Is the claim type appropriate for this trip?
2. Is the calculation methodology correct according to CBA rules?
3. Is the calculated amount reasonable and within expected ranges?
4. Are there any potential issues or edge cases?

Respond in JSON format with:
{
  "valid": true/false,
  "confidence": 0-100,
  "recommendation": "auto-approve" | "manual-review" | "reject",
  "reasoning": "Brief explanation of your decision",
  "contract_references": ["Section X.Y.Z", "Article A.B"]
}

Guidelines:
- confidence > 95 = auto-approve (routine, clearly valid claims)
- confidence 80-95 = manual-review (valid but unusual or complex)
- confidence < 80 = manual-review or reject
- Always err on the side of caution for crew benefit`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    // Extract JSON from response
    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response format from Claude');
    }

    // Parse JSON response (handle potential markdown code blocks)
    let jsonText = content.text;
    if (jsonText.includes('```json')) {
      jsonText = jsonText.split('```json')[1].split('```')[0].trim();
    } else if (jsonText.includes('```')) {
      jsonText = jsonText.split('```')[1].split('```')[0].trim();
    }

    const validation = JSON.parse(jsonText);

    return {
      valid: validation.valid ?? true,
      confidence: validation.confidence ?? claim.confidence,
      recommendation: validation.recommendation ?? 'manual-review',
      reasoning: validation.reasoning ?? 'AI validation completed',
      contract_references: validation.contract_references ?? []
    };

  } catch (error: any) {
    console.error('AI validation error:', error);

    // Fallback to rule-based validation if AI fails
    return fallbackValidation(claim);
  }
}

/**
 * Fallback validation if AI is unavailable
 *
 * Uses simple rule-based checks to validate claims when AI API fails.
 */
function fallbackValidation(claim: DetectedClaim): ValidationResult {
  let valid = true;
  let confidence = claim.confidence;
  let recommendation: 'auto-approve' | 'manual-review' | 'reject' = 'manual-review';
  let reasoning = 'Fallback validation (AI unavailable): ';

  // Basic sanity checks
  if (claim.amount <= 0) {
    valid = false;
    confidence = 0;
    recommendation = 'reject';
    reasoning += 'Invalid amount (zero or negative). ';
  } else if (claim.amount > 5000) {
    confidence = Math.min(confidence, 85);
    recommendation = 'manual-review';
    reasoning += 'Unusually high amount, requires manual review. ';
  } else if (claim.detection_method.startsWith('auto:')) {
    if (confidence >= 95) {
      recommendation = 'auto-approve';
      reasoning += 'Routine claim with high confidence. ';
    } else if (confidence >= 80) {
      recommendation = 'manual-review';
      reasoning += 'Valid but below auto-approval threshold. ';
    } else {
      recommendation = 'manual-review';
      reasoning += 'Low confidence, requires review. ';
    }
  }

  return {
    valid,
    confidence,
    recommendation,
    reasoning: reasoning.trim(),
    contract_references: []
  };
}

/**
 * Batch validate multiple claims for efficiency
 *
 * Validates all claims for a trip in a single AI call for better performance.
 */
export async function validateMultipleClaims(
  claims: DetectedClaim[],
  trip: Trip
): Promise<Map<DetectedClaim, ValidationResult>> {
  const results = new Map<DetectedClaim, ValidationResult>();

  // For now, validate sequentially
  // TODO: Optimize with batch processing
  for (const claim of claims) {
    try {
      const validation = await validateClaim(claim, trip);
      results.set(claim, validation);
    } catch (error) {
      console.error(`Validation failed for claim ${claim.claim_type}:`, error);
      results.set(claim, fallbackValidation(claim));
    }
  }

  return results;
}

/**
 * Get validation statistics for monitoring
 */
export interface ValidationStats {
  total_claims: number;
  auto_approved: number;
  manual_review: number;
  rejected: number;
  avg_confidence: number;
  ai_success_rate: number;
}

export function calculateValidationStats(
  validations: Map<DetectedClaim, ValidationResult>
): ValidationStats {
  let autoApproved = 0;
  let manualReview = 0;
  let rejected = 0;
  let totalConfidence = 0;
  let aiSuccesses = 0;

  for (const [claim, validation] of validations) {
    switch (validation.recommendation) {
      case 'auto-approve':
        autoApproved++;
        break;
      case 'manual-review':
        manualReview++;
        break;
      case 'reject':
        rejected++;
        break;
    }

    totalConfidence += validation.confidence;

    if (!validation.reasoning.includes('Fallback validation')) {
      aiSuccesses++;
    }
  }

  const total = validations.size;

  return {
    total_claims: total,
    auto_approved: autoApproved,
    manual_review: manualReview,
    rejected: rejected,
    avg_confidence: total > 0 ? totalConfidence / total : 0,
    ai_success_rate: total > 0 ? (aiSuccesses / total) * 100 : 0
  };
}
