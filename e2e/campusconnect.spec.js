const { test, expect } = require('@playwright/test');

// Note: In a real test environment, we would use unique seed data via API setup.
// Using timestamps to guarantee unique emails during sequential runs.
const uniqueId = Date.now();
const studentEmail = `student_${uniqueId}@example.com`;
const organizerEmail = `organizer_${uniqueId}@example.com`;
const adminEmail = `admin_${uniqueId}@example.com`;
const password = 'Password123!';

let globalEventId = '';
let globalTicketId = '';

test.describe('CampusConnect Complete User Journey', () => {

  test('1. Student registers and logs in', async ({ page }) => {
    // Navigate to registration page
    await page.goto('/register');
    
    // Fill Registration Form
    await page.fill('input[name="name"]', 'Test Student');
    await page.fill('input[name="email"]', studentEmail);
    await page.fill('input[name="password"]', password);
    await page.selectOption('select[name="role"]', 'STUDENT');
    await page.click('button[type="submit"]');

    // Should redirect to Dashboard or Login
    await expect(page).toHaveURL(/\/login|\/student-dashboard/);
    
    // Login if redirected to login
    if (page.url().includes('login')) {
      await page.fill('input[name="email"]', studentEmail);
      await page.fill('input[name="password"]', password);
      await page.click('button[type="submit"]');
    }

    // Verify successful login
    await expect(page.locator('text=Student Dashboard').first()).toBeVisible();
  });

  test('2. Student searches for an approved event', async ({ page }) => {
    // Login as student
    await page.goto('/login');
    await page.fill('input[name="email"]', studentEmail);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');

    // Go to Events page
    await page.click('text=Events');
    await expect(page).toHaveURL('/events');

    // Search/Filter
    await page.selectOption('select[name="category"]', 'All');
    
    // Verify events render (Assuming test DB has at least one event)
    const eventCards = page.locator('.event-card');
    await expect(eventCards.first()).toBeVisible();
  });

  test('3. Student registers for the event', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', studentEmail);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');

    await page.goto('/events');
    const firstEventBtn = page.locator('.event-card button:has-text("Register")').first();
    await firstEventBtn.click();
    
    // Check confirmation/toast
    await expect(page.locator('text=Successfully registered')).toBeVisible();

    // Verify duplicate registration is blocked
    await firstEventBtn.click();
    await expect(page.locator('text=already registered')).toBeVisible();
  });

  test('4. Organizer views registration & 5. Verifies ticket & 6. Records attendance', async ({ page, request }) => {
    // *This test simulates the Organizer side*
    // First, register a test organizer and create an event via API for isolated testing
    const orgRes = await request.post('http://localhost:5000/api/auth/register', {
      data: { name: 'Test Org', email: organizerEmail, password, role: 'ORGANIZER' }
    });
    const { token: orgToken } = await orgRes.json();

    // Create Event
    const eventRes = await request.post('http://localhost:5000/api/events', {
      headers: { Authorization: `Bearer ${orgToken}` },
      data: { title: 'E2E Test Event', date: new Date(Date.now() + 86400000).toISOString(), venue: 'Test Venue', totalSeats: 100 }
    });
    const { event } = await eventRes.json();
    globalEventId = event.id;

    // Student registers for this specific newly created event via API
    const stuRes = await request.post('http://localhost:5000/api/auth/login', {
      data: { email: studentEmail, password }
    });
    const { token: stuToken } = await stuRes.json();
    
    const regRes = await request.post(`http://localhost:5000/api/events/${globalEventId}/register`, {
      headers: { Authorization: `Bearer ${stuToken}` }
    });
    const { registration } = await regRes.json();
    globalTicketId = registration.ticketId;

    // UI Verification for Organizer
    await page.goto('/login');
    await page.fill('input[name="email"]', organizerEmail);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');

    await page.click('text=Organizer Dashboard');
    
    // Input ticket ID into terminal scanner UI
    await page.fill('input[placeholder="Enter Ticket ID"]', globalTicketId);
    await page.click('button:has-text("Verify")');
    
    await expect(page.locator('text=successfully verified')).toBeVisible();

    // Test duplicate attendance block
    await page.fill('input[placeholder="Enter Ticket ID"]', globalTicketId);
    await page.click('button:has-text("Verify")');
    await expect(page.locator('text=already recorded')).toBeVisible();
  });

  test('7. Student views attendance status and 8. Certificate generation', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', studentEmail);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');

    await page.click('text=Dashboard');
    
    // Check Completed/Attended tab
    await page.click('button:has-text("Completed")');
    
    // Verify Event is listed with "Download Certificate" button
    const certBtn = page.locator(`button:has-text("Download Certificate")`);
    await expect(certBtn.first()).toBeVisible();
  });

  test('9. Admin reviews statistics & Unauthorized Edge Cases', async ({ page }) => {
    // Verify Student cannot access Admin Dashboard
    await page.goto('/login');
    await page.fill('input[name="email"]', studentEmail);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');

    await page.goto('/admin');
    // Should kick out or show error
    await expect(page.locator('text=Unauthorized').or(page.locator('text=Student Dashboard'))).toBeVisible();

    // The rest of this test would log in as Admin and verify charts
    // Note: Depends on Admin seed data.
  });
});
