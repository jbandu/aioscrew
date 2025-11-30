/**
 * Manual UI Workflow Test
 *
 * This test verifies the complete claim submission workflow:
 * 1. Create a claim via API (simulating crew member submission)
 * 2. Verify it's in the database
 * 3. Verify it can be retrieved via GET endpoint
 * 4. UI should display this claim in both crew member and payroll views
 */

import { chromium } from 'playwright';

async function testWorkflow() {
  const API_URL = 'http://localhost:3001';
  const UI_URL = 'http://localhost:5174';

  console.log('🧪 Starting UI Workflow Test...\n');

  // Step 1: Create a test claim via API
  console.log('1️⃣  Creating test claim via API...');
  const claimPayload = {
    crew_id: 'CM001',
    claim_type: 'International Premium',
    trip_id: 'FLT12345',
    amount: 125.00,
    description: `UI Test Claim - ${new Date().toISOString()}`
  };

  const createResponse = await fetch(`${API_URL}/api/admin/claims`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(claimPayload)
  });

  if (!createResponse.ok) {
    throw new Error(`Failed to create claim: ${createResponse.status}`);
  }

  const createdClaim = await createResponse.json();
  console.log(`✅ Claim created: ${createdClaim.id}\n`);

  // Step 2: Verify via GET endpoint
  console.log('2️⃣  Verifying claim via GET endpoint...');
  const getResponse = await fetch(`${API_URL}/api/admin/claims/crew/CM001`);
  const claims = await getResponse.json();

  const ourClaim = claims.find((c: any) => c.id === createdClaim.id);
  if (!ourClaim) {
    throw new Error('Claim not found in GET response!');
  }
  console.log(`✅ Claim retrieved via API\n`);

  // Step 3: Test UI with Playwright
  console.log('3️⃣  Testing UI display...');
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to app
    await page.goto(UI_URL);
    await page.waitForLoadState('networkidle');

    // Click "Crew Member" role
    console.log('   📱 Selecting Crew Member role...');
    const crewButton = page.getByRole('button', { name: /crew member/i });
    await crewButton.click();
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({ path: 'test-results/manual-01-crew-dashboard.png', fullPage: true });
    console.log('   📸 Screenshot: manual-01-crew-dashboard.png');

    // Click "Pay & Claims" in sidebar
    console.log('   💰 Navigating to Pay & Claims...');
    const payClaimsButton = page.getByRole('button', { name: /pay.*claims/i }).first();
    if (await payClaimsButton.isVisible({ timeout: 2000 })) {
      await payClaimsButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'test-results/manual-02-claims-view.png', fullPage: true });
      console.log('   📸 Screenshot: manual-02-claims-view.png');
    }

    // Check if our claim is visible
    const claimText = await page.getByText(/UI Test Claim/i).count();
    console.log(`   🔍 Found ${claimText} test claim(s) in crew view`);

    // Switch to Payroll Admin view
    console.log('\n4️⃣  Testing Payroll Admin view...');
    const logoutButton = page.getByRole('button', { name: /logout/i });
    await logoutButton.click();
    await page.waitForTimeout(1000);

    // Click "Payroll" role
    console.log('   👔 Selecting Payroll Admin role...');
    const payrollButton = page.getByRole('button', { name: /payroll/i });
    await payrollButton.click();
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'test-results/manual-03-payroll-dashboard.png', fullPage: true });
    console.log('   📸 Screenshot: manual-03-payroll-dashboard.png');

    // Check if claim appears in payroll view
    const payrollClaimText = await page.getByText(/UI Test Claim/i).count();
    console.log(`   🔍 Found ${payrollClaimText} test claim(s) in payroll view`);

    console.log('\n✅ UI Workflow Test Complete!');
    console.log('\n📊 Summary:');
    console.log(`   - Claim ID: ${createdClaim.id}`);
    console.log(`   - Visible in Crew View: ${claimText > 0 ? 'YES ✅' : 'NO ❌'}`);
    console.log(`   - Visible in Payroll View: ${payrollClaimText > 0 ? 'YES ✅' : 'NO ❌'}`);

    // Keep browser open for 5 seconds to see the result
    await page.waitForTimeout(5000);

  } finally {
    await browser.close();
  }

  // Step 4: Cleanup
  console.log('\n🧹 Cleaning up test claim...');
  // Note: We'd need a DELETE endpoint to clean up properly
  console.log(`   ⚠️  Manual cleanup needed: DELETE FROM pay_claims WHERE id='${createdClaim.id}';`);
}

// Run the test
testWorkflow().catch(console.error);
