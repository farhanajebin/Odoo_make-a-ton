import http from 'http';
import { createApp } from '../app.js';
import { store } from '../services/store.service.js';
import { hashToken } from '../utils/security.js';
import bcrypt from 'bcryptjs';

const app = createApp();

interface TestResult {
  num: number;
  name: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

async function runTest(num: number, name: string, fn: (serverUrl: string) => Promise<void>) {
  return new Promise<void>((resolve) => {
    // Start temporary test server on dynamic port
    const server = http.createServer(app);
    server.listen(0, '127.0.0.1', async () => {
      const address = server.address() as any;
      const serverUrl = `http://127.0.0.1:${address.port}`;
      try {
        await fn(serverUrl);
        results.push({ num, name, passed: true });
        console.log(`  ✓ Test ${num}: ${name} [PASSED]`);
      } catch (err: any) {
        results.push({ num, name, passed: false, details: err.message || String(err) });
        console.error(`  ✗ Test ${num}: ${name} [FAILED]:`, err.message || err);
      } finally {
        server.close(() => resolve());
      }
    });
  });
}

async function request(url: string, options: { method: string; path: string; body?: any; headers?: any }) {
  const fullUrl = `${url}${options.path}`;
  const res = await fetch(fullUrl, {
    method: options.method,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await res.text();
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }

  return { status: res.status, data: json, headers: res.headers };
}

async function main() {
  console.log('\n======================================================');
  console.log('  LOOPNEX COMMIT 02 — IDENTITY & ACCESS ENGINE SUITE  ');
  console.log('======================================================\n');

  // 1. Customer registration
  let registeredCustomerToken = '';
  const testCustomerEmail = `test.customer.${Date.now()}@example.com`;
  const testPassword = 'StrongPassword2026!#';

  await runTest(1, 'Customer registration', async (url) => {
    const res = await request(url, {
      method: 'POST',
      path: '/api/auth/register',
      body: {
        fullName: 'Jane Doe',
        email: testCustomerEmail,
        password: testPassword,
        confirmPassword: testPassword,
        termsAccepted: true,
      },
    });

    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}: ${JSON.stringify(res.data)}`);
    if (!res.data.data?.accessToken) throw new Error('Missing accessToken in registration response');
    if (res.data.data?.user?.role !== 'CUSTOMER') throw new Error(`Expected role CUSTOMER, got ${res.data.data?.user?.role}`);
    registeredCustomerToken = res.data.data.accessToken;
  });

  // 2. Duplicate email rejection
  await runTest(2, 'Duplicate email rejection', async (url) => {
    const res = await request(url, {
      method: 'POST',
      path: '/api/auth/register',
      body: {
        fullName: 'Jane Doe Copy',
        email: testCustomerEmail,
        password: testPassword,
        confirmPassword: testPassword,
        termsAccepted: true,
      },
    });

    if (res.status !== 409) throw new Error(`Expected 409 Conflict, got ${res.status}`);
    if (res.data.error?.code !== 'EMAIL_ALREADY_EXISTS') throw new Error(`Expected EMAIL_ALREADY_EXISTS code, got ${res.data.error?.code}`);
  });

  // 3. Invalid email rejection
  await runTest(3, 'Invalid email rejection', async (url) => {
    const res = await request(url, {
      method: 'POST',
      path: '/api/auth/register',
      body: {
        fullName: 'Bad Email User',
        email: 'invalid-email-string',
        password: testPassword,
        confirmPassword: testPassword,
        termsAccepted: true,
      },
    });

    if (res.status !== 400) throw new Error(`Expected 400 Bad Request, got ${res.status}`);
  });

  // 4. Weak password rejection
  await runTest(4, 'Weak password rejection', async (url) => {
    // Too short (<= 8)
    const resShort = await request(url, {
      method: 'POST',
      path: '/api/auth/register',
      body: {
        fullName: 'User Short',
        email: 'short@example.com',
        password: 'Pass1!',
        confirmPassword: 'Pass1!',
        termsAccepted: true,
      },
    });
    if (resShort.status !== 400 || resShort.data.error?.code !== 'WEAK_PASSWORD') {
      throw new Error(`Expected 400 WEAK_PASSWORD for short password, got ${resShort.status}`);
    }

    // Missing special character
    const resNoSpec = await request(url, {
      method: 'POST',
      path: '/api/auth/register',
      body: {
        fullName: 'User No Special',
        email: 'nospecial@example.com',
        password: 'PasswordWithoutSpecial123',
        confirmPassword: 'PasswordWithoutSpecial123',
        termsAccepted: true,
      },
    });
    if (resNoSpec.status !== 400 || resNoSpec.data.error?.code !== 'WEAK_PASSWORD') {
      throw new Error(`Expected 400 WEAK_PASSWORD for missing special char, got ${resNoSpec.status}`);
    }
  });

  // 5. Password hashing verification
  await runTest(5, 'Password hashing verification', async () => {
    const userInDb = await store.findUserByEmail(testCustomerEmail);
    if (!userInDb) throw new Error('Customer user not found in store');
    if (userInDb.passwordHash === testPassword) throw new Error('Password stored as plain text! CRITICAL SECURITY FAILURE');
    if (!userInDb.passwordHash.startsWith('$2')) throw new Error('Password hash does not match bcrypt format');
    const matches = await bcrypt.compare(testPassword, userInDb.passwordHash);
    if (!matches) throw new Error('Bcrypt hash verification failed against original password');
  });

  // 6. Successful login
  await runTest(6, 'Successful login', async (url) => {
    const res = await request(url, {
      method: 'POST',
      path: '/api/auth/login',
      body: {
        email: testCustomerEmail,
        password: testPassword,
      },
    });

    if (res.status !== 200) throw new Error(`Expected 200 OK, got ${res.status}: ${JSON.stringify(res.data)}`);
    if (!res.data.data?.accessToken) throw new Error('Missing accessToken in login response');
    if (!res.data.data?.refreshToken) throw new Error('Missing refreshToken in login response');
    if (res.data.data?.user?.email !== testCustomerEmail) throw new Error('Email mismatch in login response');
  });

  // 7. Incorrect password rejection
  await runTest(7, 'Incorrect password rejection', async (url) => {
    const res = await request(url, {
      method: 'POST',
      path: '/api/auth/login',
      body: {
        email: testCustomerEmail,
        password: 'WrongPassword123!',
      },
    });

    if (res.status !== 401) throw new Error(`Expected 401 Unauthorized, got ${res.status}`);
    if (res.data.error?.code !== 'INVALID_CREDENTIALS') throw new Error(`Expected INVALID_CREDENTIALS, got ${res.data.error?.code}`);
  });

  // 8. Inactive account login rejection
  await runTest(8, 'Inactive account login rejection', async (url) => {
    const tempUser = await store.createUser({
      email: 'inactive.user@example.com',
      fullName: 'Inactive User',
      passwordHash: await bcrypt.hash(testPassword, 10),
      roleId: 'role_customer_01',
      isActive: false,
    });

    const res = await request(url, {
      method: 'POST',
      path: '/api/auth/login',
      body: {
        email: tempUser.email,
        password: testPassword,
      },
    });

    if (res.status !== 403) throw new Error(`Expected 403 Forbidden for deactivated account, got ${res.status}`);
    if (res.data.error?.code !== 'ACCOUNT_DISABLED') throw new Error(`Expected ACCOUNT_DISABLED, got ${res.data.error?.code}`);
  });

  // 9. Customer role assignment & prevention of role injection
  await runTest(9, 'Customer role assignment & injection prevention', async (url) => {
    const res = await request(url, {
      method: 'POST',
      path: '/api/auth/register',
      body: {
        fullName: 'Sneaky Attacker',
        email: `sneaky.${Date.now()}@example.com`,
        password: testPassword,
        confirmPassword: testPassword,
        termsAccepted: true,
        role: 'ADMIN', // Attacker trying to inject admin role
      },
    });

    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
    if (res.data.data?.user?.role !== 'CUSTOMER') {
      throw new Error(`CRITICAL: Public user was able to register with role ${res.data.data?.user?.role}`);
    }
  });

  // 10. Admin-only staff creation
  let adminToken = '';
  let createdStaffEmail = `staff.member.${Date.now()}@loopnex.io`;
  let createdStaffId = '';

  await runTest(10, 'Admin-only staff creation', async (url) => {
    // Log in as pre-seeded Admin
    const loginRes = await request(url, {
      method: 'POST',
      path: '/api/auth/login',
      body: {
        email: 'admin@loopnex.io',
        password: 'Loopnex@Admin2026!',
      },
    });

    if (loginRes.status !== 200) throw new Error(`Admin login failed: ${JSON.stringify(loginRes.data)}`);
    adminToken = loginRes.data.data.accessToken;

    // Create staff member
    const createRes = await request(url, {
      method: 'POST',
      path: '/api/admin/staff',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        fullName: 'Marcus Vance',
        email: createdStaffEmail,
        department: 'FINANCE',
        phone: '+1 (555) 234-8899',
        password: 'StaffPassword2026!#',
      },
    });

    if (createRes.status !== 201) throw new Error(`Expected 201 Created, got ${createRes.status}: ${JSON.stringify(createRes.data)}`);
    if (createRes.data.data?.staff?.role !== 'STAFF') throw new Error(`Expected role STAFF, got ${createRes.data.data?.staff?.role}`);
    createdStaffId = createRes.data.data.staff.id;
  });

  // 11. Staff permission restrictions
  await runTest(11, 'Staff permission restrictions', async (url) => {
    // Login as the created staff member
    const staffLoginRes = await request(url, {
      method: 'POST',
      path: '/api/auth/login',
      body: {
        email: createdStaffEmail,
        password: 'StaffPassword2026!#',
      },
    });

    if (staffLoginRes.status !== 200) throw new Error(`Staff login failed: ${JSON.stringify(staffLoginRes.data)}`);
    const staffToken = staffLoginRes.data.data.accessToken;

    // Attempt admin-only staff creation as STAFF
    const forbiddenCreateRes = await request(url, {
      method: 'POST',
      path: '/api/admin/staff',
      headers: { Authorization: `Bearer ${staffToken}` },
      body: {
        fullName: 'Unauthorized Staff',
        email: 'unauth@loopnex.io',
      },
    });

    if (forbiddenCreateRes.status !== 403) throw new Error(`Expected 403 Forbidden for staff creating staff, got ${forbiddenCreateRes.status}`);

    // Attempt to access admin audit logs as STAFF
    const forbiddenAuditRes = await request(url, {
      method: 'GET',
      path: '/api/admin/audit-logs',
      headers: { Authorization: `Bearer ${staffToken}` },
    });

    if (forbiddenAuditRes.status !== 403) throw new Error(`Expected 403 Forbidden for staff accessing audit logs, got ${forbiddenAuditRes.status}`);
  });

  // 12. Customer resource ownership restrictions
  await runTest(12, 'Customer resource ownership restrictions', async (url) => {
    // Customer cannot access staff directory
    const res = await request(url, {
      method: 'GET',
      path: '/api/admin/staff',
      headers: { Authorization: `Bearer ${registeredCustomerToken}` },
    });

    if (res.status !== 403) throw new Error(`Expected 403 Forbidden for customer accessing admin staff, got ${res.status}`);

    // Customer CAN access their own profile
    const profileRes = await request(url, {
      method: 'GET',
      path: '/api/users/me',
      headers: { Authorization: `Bearer ${registeredCustomerToken}` },
    });

    if (profileRes.status !== 200) throw new Error(`Expected 200 for customer profile, got ${profileRes.status}`);
    if (profileRes.data.data?.profile?.email !== testCustomerEmail) throw new Error('Customer received wrong profile data');
  });

  // 13. Password reset token expiration
  await runTest(13, 'Password reset token expiration', async (url) => {
    const expiredRawToken = 'expiredtoken0123456789abcdef0123456789abcdef0123456789abcdef01234567';
    const expiredHash = hashToken(expiredRawToken);
    const user = await store.findUserByEmail(testCustomerEmail);

    // Create an expired token record
    await store.createPasswordResetToken(user!.id, expiredHash, new Date(Date.now() - 60000));

    const resetRes = await request(url, {
      method: 'POST',
      path: '/api/auth/reset-password',
      body: {
        token: expiredRawToken,
        password: 'NewStrongPassword2026!#',
        confirmPassword: 'NewStrongPassword2026!#',
      },
    });

    if (resetRes.status !== 400 || resetRes.data.error?.code !== 'TOKEN_EXPIRED') {
      throw new Error(`Expected 400 TOKEN_EXPIRED, got ${resetRes.status}: ${JSON.stringify(resetRes.data)}`);
    }
  });

  // 14. Password reset token single-use behaviour
  await runTest(14, 'Password reset token single-use behaviour', async (url) => {
    const validRawToken = 'validtoken0123456789abcdef0123456789abcdef0123456789abcdef012345678';
    const validHash = hashToken(validRawToken);
    const user = await store.findUserByEmail(testCustomerEmail);

    await store.createPasswordResetToken(user!.id, validHash, new Date(Date.now() + 1800000));

    // First use: should succeed
    const firstRes = await request(url, {
      method: 'POST',
      path: '/api/auth/reset-password',
      body: {
        token: validRawToken,
        password: 'BrandNewPassword2026!#',
        confirmPassword: 'BrandNewPassword2026!#',
      },
    });

    if (firstRes.status !== 200) throw new Error(`Expected 200 on first reset, got ${firstRes.status}: ${JSON.stringify(firstRes.data)}`);

    // Second use: must be rejected
    const secondRes = await request(url, {
      method: 'POST',
      path: '/api/auth/reset-password',
      body: {
        token: validRawToken,
        password: 'AnotherPassword2026!#',
        confirmPassword: 'AnotherPassword2026!#',
      },
    });

    if (secondRes.status !== 400 || secondRes.data.error?.code !== 'TOKEN_ALREADY_USED') {
      throw new Error(`Expected 400 TOKEN_ALREADY_USED, got ${secondRes.status}: ${JSON.stringify(secondRes.data)}`);
    }
  });

  // 15. Logout and refresh-token invalidation
  await runTest(15, 'Logout and refresh-token invalidation', async (url) => {
    // Log in
    const loginRes = await request(url, {
      method: 'POST',
      path: '/api/auth/login',
      body: {
        email: testCustomerEmail,
        password: 'BrandNewPassword2026!#', // Updated in test 14
      },
    });

    const refreshToken = loginRes.data.data.refreshToken;
    if (!refreshToken) throw new Error('Missing refreshToken');

    // Logout
    const logoutRes = await request(url, {
      method: 'POST',
      path: '/api/auth/logout',
      body: { refreshToken },
    });

    if (logoutRes.status !== 200) throw new Error(`Logout failed with ${logoutRes.status}`);

    // Attempt refresh with revoked token
    const refreshRes = await request(url, {
      method: 'POST',
      path: '/api/auth/refresh',
      body: { refreshToken },
    });

    if (refreshRes.status !== 401 || refreshRes.data.error?.code !== 'TOKEN_REVOKED') {
      throw new Error(`Expected 401 TOKEN_REVOKED, got ${refreshRes.status}: ${JSON.stringify(refreshRes.data)}`);
    }
  });

  // 16. Protected route behaviour
  await runTest(16, 'Protected route behaviour', async (url) => {
    // Missing token
    const noTokenRes = await request(url, {
      method: 'GET',
      path: '/api/auth/me',
    });
    if (noTokenRes.status !== 401 || noTokenRes.data.error?.code !== 'UNAUTHORIZED') {
      throw new Error(`Expected 401 UNAUTHORIZED for missing token, got ${noTokenRes.status}`);
    }

    // Malformed token
    const malformedRes = await request(url, {
      method: 'GET',
      path: '/api/auth/me',
      headers: { Authorization: 'Bearer not-a-valid-jwt-token' },
    });
    if (malformedRes.status !== 401 || malformedRes.data.error?.code !== 'INVALID_TOKEN') {
      throw new Error(`Expected 401 INVALID_TOKEN for malformed token, got ${malformedRes.status}`);
    }
  });

  // 17. Direct API authorization
  await runTest(17, 'Direct API authorization', async (url) => {
    // Deactivate last admin protection check
    const deactRes = await request(url, {
      method: 'PATCH',
      path: `/api/admin/staff/usr_admin_01/status`,
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { isActive: false },
    });

    if (deactRes.status !== 400 || deactRes.data.error?.code !== 'CANNOT_DEACTIVATE_LAST_ADMIN') {
      throw new Error(`Expected 400 CANNOT_DEACTIVATE_LAST_ADMIN when deactivating solitary admin, got ${deactRes.status}: ${JSON.stringify(deactRes.data)}`);
    }

    // Successfully deactivate staff
    const staffDeactRes = await request(url, {
      method: 'PATCH',
      path: `/api/admin/staff/${createdStaffId}/status`,
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { isActive: false },
    });

    if (staffDeactRes.status !== 200) throw new Error(`Expected 200 deactivating staff member, got ${staffDeactRes.status}`);
  });

  // 18. Rate limiting
  await runTest(18, 'Rate limiting', async (url) => {
    let hitRateLimit = false;
    // Fire rapid login attempts to trigger loginLimiter (max 15 attempts)
    for (let i = 0; i < 20; i++) {
      const res = await request(url, {
        method: 'POST',
        path: '/api/auth/login',
        body: {
          email: 'ratelimit.probe@loopnex.io',
          password: 'WrongPassword123!',
        },
      });

      if (res.status === 429) {
        hitRateLimit = true;
        break;
      }
    }

    if (!hitRateLimit) throw new Error('Expected 429 RATE_LIMIT_EXCEEDED after exceeding rate limit quota');
  });

  console.log('\n======================================================');
  const allPassed = results.every((r) => r.passed);
  console.log(`TEST SUMMARY: ${results.filter((r) => r.passed).length}/${results.length} PASSED`);
  console.log('======================================================\n');

  if (!allPassed) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
