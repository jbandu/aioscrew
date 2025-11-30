#!/bin/bash

echo "Creating test claim..."
curl -X POST http://localhost:3001/api/admin/claims \
  -H "Content-Type: application/json" \
  -d '{
    "crew_id": "CM001",
    "claim_type": "Test Claim",
    "trip_id": "TEST001",
    "amount": 999.99,
    "description": "Testing local database"
  }'

echo -e "\n\nChecking database..."
psql -U srihaanbandu -d aioscrew -c "SELECT id, crew_id, claim_type, amount FROM pay_claims ORDER BY created_at DESC LIMIT 3;"
