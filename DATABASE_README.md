# Crew Operating System - Database Integration

## Overview

The Crew Operating System has been enhanced with full database integration using Neon PostgreSQL. This provides real CRUD operations and persistent data storage for all crew operations.

## Database Architecture

### Connection
- **Database**: Neon PostgreSQL (Serverless)
- **Package**: `@neondatabase/serverless`
- **Connection**: Configured in `.env` file

### Schema

The database includes the following tables:

1. **crew_members** - Stores all crew member information
2. **trips** - Flight assignments and pairings
3. **pay_claims** - Crew pay claims with AI validation
4. **training_records** - Certification and training tracking
5. **disruptions** - Real-time operational disruptions
6. **compliance_violations** - Contract violation tracking

## Key Features Implemented

### 1. Database Initialization
- **File**: `src/lib/db.ts`
- Automatic schema creation on first launch
- Seed data with realistic crew, trips, and claims
- Connection pooling and error handling

### 2. Service Layer
- **File**: `src/services/crewService.ts`
- Abstracted database operations
- Type-safe queries
- Error handling and logging

### 3. Enhanced Views

#### Crew Member View (Database-Connected)
- **File**: `src/views/CrewMemberViewEnhanced.tsx`
- Real-time data fetching from database
- Submit claims with instant database persistence
- View personal trips and claim history
- Loading states and error handling

**Features**:
- Dashboard with live pay, training, and schedule data
- Claims submission form
- Trip calendar with status indicators
- YTD earnings tracking

#### Payroll Admin View (Database-Connected)
- **File**: `src/views/PayrollViewEnhanced.tsx`
- Fetch all claims from database
- Approve/reject claims with database updates
- Real-time statistics and filtering
- AI validation indicators

**Features**:
- Pending claims review queue
- One-click approve/reject
- Detailed claim modal
- Approved claims history
- Real-time totals and statistics

### 4. Data Flow

```
User Action → React Component → Service Layer → Database → Response
```

**Example: Submit Claim**
1. User fills out claim form in CrewMemberViewEnhanced
2. Form data sent to `crewService.submitClaim()`
3. Service inserts record into `pay_claims` table
4. Database returns created claim
5. UI updates to show new claim in list

**Example: Approve Claim**
1. Payroll admin clicks "Approve" in PayrollViewEnhanced
2. Component calls `crewService.updateClaimStatus()`
3. Service updates claim status in database
4. UI refreshes to show updated claims
5. Claim moves from pending to approved list

## API Functions

### Crew Service (`src/services/crewService.ts`)

```typescript
// Get current logged-in user
getCurrentUser(): Promise<CrewMember | null>

// Get all trips for a specific crew member
getUserTrips(crewId: string): Promise<Trip[]>

// Get all claims for a specific crew member
getUserClaims(crewId: string): Promise<Claim[]>

// Submit a new pay claim
submitClaim(claim: Omit<Claim, 'id'>): Promise<Claim | null>

// Get all crew members
getAllCrew(): Promise<CrewMember[]>

// Get all trips
getAllTrips(): Promise<Trip[]>

// Get all claims (with crew names joined)
getAllClaims(): Promise<Claim[]>

// Update claim status (approve/reject)
updateClaimStatus(claimId: string, status: string, reviewedBy?: string): Promise<boolean>

// Get active disruptions
getDisruptions(): Promise<any[]>

// Get compliance violations
getViolations(): Promise<any[]>
```

## Testing the Integration

### 1. Database Initialization
On first launch, you'll see a database initialization screen that:
- Creates all tables
- Seeds with sample data
- Shows progress indicators

### 2. Test Crew Member Flow
1. Login as "Crew Member" (Sarah Martinez)
2. View your dashboard with real database data
3. Click "New Claim" to submit a claim
4. Fill out the form and submit
5. Claim is instantly saved to database
6. See it appear in your claims list

### 3. Test Payroll Flow
1. Logout and login as "Payroll Admin"
2. See the claim you just submitted in pending queue
3. Click "Approve" or "Reject"
4. Database updates immediately
5. Claim moves to approved/rejected list

### 4. Cross-Role Data Sync
- Claims submitted by crew members appear in payroll queue
- Status changes in payroll view update crew member view
- All data persists across sessions
- Real-time synchronization

## Sample Data

The seed data includes:
- **9 crew members** across different roles and bases
- **6 trips** with various statuses (scheduled, cancelled, delayed)
- **5 pay claims** in different states
- **Training records** with expiration tracking
- **2 disruptions** requiring resolution
- **2 compliance violations** for monitoring

## Database Schema Details

### crew_members
- Primary key: `id` (VARCHAR)
- Tracks: name, role, base, seniority, qualifications, earnings
- Status field for active/inactive crew

### trips
- Primary key: `id` (VARCHAR)
- Foreign keys: captain_id, first_officer_id, senior_fa_id, junior_fa_id
- Tracks: date, route, times, credit hours, status
- Boolean flag for international trips

### pay_claims
- Primary key: `id` (VARCHAR)
- Foreign keys: crew_id, trip_id
- Tracks: amount, status, AI validation
- Audit fields: reviewed_by, reviewed_at

## Error Handling

All database operations include:
- Try-catch blocks
- Console error logging
- Graceful fallbacks (return null/empty array)
- Loading states in UI
- User-friendly error messages

## Security Notes

**IMPORTANT**: In this demo, database credentials are in `.env` and accessed from the frontend. In production:
- Move all database operations to a backend API
- Never expose credentials in frontend code
- Use proper authentication and authorization
- Implement row-level security (RLS)
- Add input validation and sanitization

## Future Enhancements

Additional features that could be added:
1. Real-time updates with WebSockets
2. Batch operations for bulk approvals
3. Advanced filtering and search
4. Export to CSV/PDF
5. Email notifications
6. Audit trail logging
7. Data analytics and reporting
8. Mobile-responsive layouts
9. Offline mode with sync
10. Role-based access control

## Architecture Benefits

This implementation demonstrates:
- ✅ Separation of concerns (UI, Service, Database layers)
- ✅ Type safety with TypeScript
- ✅ Reusable service functions
- ✅ Scalable database schema
- ✅ Real CRUD operations
- ✅ Production-ready patterns
- ✅ Error handling throughout
- ✅ User experience polish

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Type check
npm run typecheck
```

## Files Created/Modified

### New Files
- `src/lib/db.ts` - Database connection and initialization
- `src/services/crewService.ts` - Data access layer
- `src/components/DatabaseInit.tsx` - DB setup UI
- `src/views/CrewMemberViewEnhanced.tsx` - Connected crew view
- `src/views/PayrollViewEnhanced.tsx` - Connected payroll view

### Modified Files
- `src/App.tsx` - Added database initialization flow
- `src/types.ts` - Updated to match database schema
- `.env` - Added Neon database credentials
- `package.json` - Added @neondatabase/serverless

## Summary

This integration transforms the Crew Operating System from a static mockup to a fully functional application with:
- Real database persistence
- Cross-role data synchronization
- Production-ready architecture
- Scalable service patterns
- Complete CRUD operations

The system now demonstrates how an AI-powered crew management platform would work in production, with real data flow between different personas and persistent storage of all operations.
