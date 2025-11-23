# Aioscrew Backend API Documentation

## Base URL

**Production:** `https://aioscrew-backend-production.up.railway.app`
**Local:** `http://localhost:3001`

---

## Table of Contents

1. [Authentication](#authentication)
2. [Health Checks](#health-checks)
3. [AI Agent Endpoints](#ai-agent-endpoints)
4. [Error Handling](#error-handling)
5. [Rate Limits](#rate-limits)
6. [Examples](#examples)

---

## Authentication

Currently no authentication required. Future versions will implement:
- JWT tokens for API access
- Role-based access control (RBAC)
- API key management

---

## Health Checks

### Server Health

**Endpoint:** `GET /health`

**Description:** Check if server is running

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-23T03:21:03.078Z"
}
```

**Status Codes:**
- `200 OK` - Server healthy
- `503 Service Unavailable` - Server down

---

### AI Agents Health

**Endpoint:** `GET /api/agents/health`

**Description:** Check AI agent system status

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-23T03:21:21.629Z",
  "agents": [
    "orchestrator",
    "flight-time-calculator",
    "premium-pay-calculator",
    "compliance-validator"
  ]
}
```

**Status Codes:**
- `200 OK` - All agents operational
- `503 Service Unavailable` - Agent system unavailable

---

## AI Agent Endpoints

### Validate Claim (By ID)

**Endpoint:** `POST /api/agents/validate`

**Description:** Validate a claim by fetching from database

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "claimId": "CLM-2024-1156"
}
```

**Response:** (Success)
```json
{
  "claimId": "CLM-2024-1156",
  "overallStatus": "approved",
  "confidence": 0.92,
  "processingTime": 18.5,
  "recommendation": "APPROVE - All validation checks passed",
  "agentResults": [
    {
      "agentType": "flight-time",
      "agentName": "Flight Time Calculator",
      "status": "completed",
      "duration": 2.3,
      "summary": "Flight time validated: 8.4 hours",
      "details": [
        "Calculated flight time: 8.4 hours",
        "Within regulatory limits",
        "Duty time compliant"
      ],
      "confidence": 0.98,
      "data": {
        "flightTime": 8.4,
        "dutyTime": 12.3
      }
    },
    {
      "agentType": "premium-pay",
      "agentName": "Premium Pay Calculator",
      "status": "completed",
      "duration": 5.2,
      "summary": "Premium pay approved: $125",
      "details": [
        "International flight to GUA",
        "Qualifies for international premium",
        "Amount: $125 per CBA Section 12.4"
      ],
      "confidence": 0.95,
      "data": {
        "eligibility": true,
        "amount": 125.00,
        "contractReferences": [
          {
            "section": "CBA Section 12.4",
            "clause": "International Premium Pay",
            "requirement": "Flights to international destinations"
          }
        ]
      }
    },
    {
      "agentType": "compliance",
      "agentName": "Compliance Validator",
      "status": "completed",
      "duration": 11.0,
      "summary": "No compliance violations found",
      "details": [
        "✓ CBA compliance verified",
        "✓ Union rules satisfied",
        "✓ Regulatory requirements met"
      ],
      "confidence": 0.84,
      "data": {
        "violations": [],
        "subAgentResults": [
          {
            "agent": "contract-interpreter",
            "status": "pass",
            "duration": 4.2
          },
          {
            "agent": "historical-precedent",
            "status": "pass",
            "duration": 2.1,
            "similarCases": 3
          },
          {
            "agent": "union-rules",
            "status": "pass",
            "duration": 0.3
          }
        ]
      }
    }
  ],
  "issues": [],
  "contractReferences": [
    {
      "section": "CBA Section 12.4",
      "clause": "International Premium Pay",
      "requirement": "Flights to international destinations"
    }
  ],
  "historicalAnalysis": {
    "similarClaims": 12,
    "approvalRate": 0.92,
    "averageAmount": 127.50
  }
}
```

**Response:** (Flagged for Review)
```json
{
  "claimId": "CLM-2024-1157",
  "overallStatus": "flagged",
  "confidence": 0.65,
  "processingTime": 22.3,
  "recommendation": "RECOMMEND: Request Additional Information",
  "agentResults": [...],
  "issues": [
    {
      "severity": "medium",
      "description": "Ambiguous layover city classification",
      "agent": "compliance-validator",
      "recommendation": "Verify if PDX qualifies as international layover"
    }
  ],
  "contractReferences": [...],
  "historicalAnalysis": null
}
```

**Response:** (Rejected)
```json
{
  "claimId": "CLM-2024-1158",
  "overallStatus": "rejected",
  "confidence": 0.88,
  "processingTime": 15.7,
  "recommendation": "REJECT - Claim does not meet CBA requirements",
  "agentResults": [...],
  "issues": [
    {
      "severity": "high",
      "description": "Flight does not qualify for international premium",
      "agent": "premium-pay-calculator",
      "recommendation": "Deny claim - domestic flight"
    }
  ],
  "contractReferences": [...],
  "historicalAnalysis": null
}
```

**Status Codes:**
- `200 OK` - Validation completed
- `400 Bad Request` - Missing or invalid claimId
- `404 Not Found` - Claim not found in database
- `500 Internal Server Error` - Agent system error
- `504 Gateway Timeout` - Validation exceeded timeout (120s)

**Errors:**
```json
{
  "error": "Missing claimId in request body"
}
```

```json
{
  "error": "Claim CLM-2024-9999 not found"
}
```

```json
{
  "error": "Internal server error during claim validation",
  "message": "Claude API rate limit exceeded"
}
```

---

### Validate Claim (Full Data)

**Endpoint:** `POST /api/agents/validate-claim`

**Description:** Validate claim with provided data (no database lookup)

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "claim": {
    "id": "CLM-2024-1156",
    "claimNumber": "CLM-2024-1156",
    "crewMemberId": "CM001",
    "crewMemberName": "Sarah Martinez",
    "type": "International Premium",
    "tripId": "CM450",
    "flightNumber": "CM450",
    "amount": 125.00,
    "submittedDate": "2024-11-18",
    "description": "International premium for GUA flight"
  },
  "trip": {
    "id": "CM450",
    "tripDate": "2024-11-22",
    "route": "PTY → LAX → PTY",
    "flightNumbers": "CM450, CM451",
    "flightTimeHours": 8.4,
    "creditHours": 10.2,
    "layoverCity": "LAX",
    "isInternational": true,
    "aircraftType": "737-MAX"
  },
  "crew": {
    "id": "CM001",
    "name": "Sarah Martinez",
    "role": "Captain",
    "base": "BUR",
    "seniority": 8,
    "qualification": "737-800"
  }
}
```

**Response:** Same format as `/api/agents/validate` above

**Status Codes:**
- `200 OK` - Validation completed
- `400 Bad Request` - Missing or invalid claim data
- `500 Internal Server Error` - Agent system error

---

## Error Handling

### Error Response Format

All errors follow this format:

```json
{
  "error": "Error type or message",
  "message": "Detailed error description (optional)",
  "timestamp": "2025-11-23T03:21:22.045Z",
  "path": "/api/agents/validate"
}
```

### Common Errors

| Status Code | Error | Cause | Solution |
|-------------|-------|-------|----------|
| `400` | Bad Request | Invalid input | Check request format |
| `404` | Not Found | Claim doesn't exist | Verify claimId |
| `408` | Request Timeout | Agents too slow | Retry or check backend logs |
| `429` | Too Many Requests | Rate limit exceeded | Wait and retry |
| `500` | Internal Server Error | Backend error | Check logs, contact support |
| `503` | Service Unavailable | System down | Wait for recovery |
| `504` | Gateway Timeout | Request exceeded 120s | Check agent performance |

---

## Rate Limits

### Current Limits

**Per IP:**
- **100 requests/minute** - General endpoints
- **20 requests/minute** - AI validation endpoints

**Per API Key (future):**
- **1000 requests/hour** - Standard tier
- **10000 requests/hour** - Premium tier

### Rate Limit Headers

```
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 15
X-RateLimit-Reset: 1700750460
```

### Rate Limit Exceeded

**Status Code:** `429 Too Many Requests`

**Response:**
```json
{
  "error": "Rate limit exceeded",
  "message": "Maximum 20 requests per minute",
  "retryAfter": 45
}
```

---

## Examples

### Using cURL

#### Health Check
```bash
curl https://aioscrew-backend-production.up.railway.app/health
```

#### Validate Claim
```bash
curl -X POST https://aioscrew-backend-production.up.railway.app/api/agents/validate \
  -H "Content-Type: application/json" \
  -d '{
    "claimId": "CLM-2024-1156"
  }'
```

#### Validate with Full Data
```bash
curl -X POST https://aioscrew-backend-production.up.railway.app/api/agents/validate-claim \
  -H "Content-Type: application/json" \
  -d '{
    "claim": {
      "id": "CLM-2024-1156",
      "type": "International Premium",
      "amount": 125.00
    }
  }'
```

---

### Using JavaScript/TypeScript

```typescript
// Health check
const health = await fetch(
  'https://aioscrew-backend-production.up.railway.app/health'
);
const data = await health.json();
console.log(data.status); // "healthy"

// Validate claim
const response = await fetch(
  'https://aioscrew-backend-production.up.railway.app/api/agents/validate',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      claimId: 'CLM-2024-1156'
    })
  }
);

const result = await response.json();
console.log(result.overallStatus); // "approved"
console.log(result.confidence); // 0.92
console.log(result.recommendation); // "APPROVE - All validation checks passed"
```

---

### Using Python

```python
import requests

# Health check
response = requests.get('https://aioscrew-backend-production.up.railway.app/health')
print(response.json()['status'])  # "healthy"

# Validate claim
response = requests.post(
    'https://aioscrew-backend-production.up.railway.app/api/agents/validate',
    json={'claimId': 'CLM-2024-1156'}
)

result = response.json()
print(result['overallStatus'])  # "approved"
print(result['confidence'])  # 0.92
print(result['processingTime'])  # 18.5
```

---

## WebSocket Support (Future)

**Coming Soon:** Real-time agent progress updates

```typescript
// Future API
const ws = new WebSocket('wss://aioscrew-backend-production.up.railway.app/api/agents/stream');

ws.on('message', (event) => {
  const update = JSON.parse(event.data);
  console.log(`Agent ${update.agentType}: ${update.status}`);
  // Shows real-time progress as agents complete
});

ws.send(JSON.stringify({ claimId: 'CLM-2024-1156' }));
```

---

## Batch Processing (Future)

**Coming Soon:** Validate multiple claims in one request

```typescript
// Future API
POST /api/agents/validate-batch

{
  "claims": ["CLM-2024-1156", "CLM-2024-1157", "CLM-2024-1158"]
}

// Response includes array of all validations
{
  "results": [...],
  "totalProcessingTime": 65.2,
  "successCount": 2,
  "failureCount": 1
}
```

---

## Agent Performance Metrics

**Endpoint:** `GET /api/agents/metrics` (Future)

Will return:
```json
{
  "avgProcessingTime": 18.5,
  "totalValidations": 1523,
  "successRate": 0.96,
  "agentPerformance": {
    "flight-time": { "avgDuration": 2.3, "successRate": 0.99 },
    "premium-pay": { "avgDuration": 5.2, "successRate": 0.95 },
    "compliance": { "avgDuration": 11.0, "successRate": 0.92 }
  },
  "costAnalytics": {
    "totalCost": 18.45,
    "avgCostPerClaim": 0.012,
    "breakdown": {
      "gpt4o": 0.003,
      "claudeSonnet": 0.005,
      "claudeOpus": 0.004
    }
  }
}
```

---

## Related Documentation

- [AI Architecture](./AI_ARCHITECTURE.md)
- [Deployment Guide](./RAILWAY_DEPLOYMENT.md)
- [Development Setup](./DEVELOPMENT.md)

---

**Last Updated:** 2025-11-23
**API Version:** 1.0
