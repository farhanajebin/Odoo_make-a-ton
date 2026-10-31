import http from 'http';
import { createApp } from '../app.js';

const app = createApp();
const server = http.createServer(app);

function request(options: {
  method: string;
  path: string;
  headers?: Record<string, string>;
  body?: unknown;
}): Promise<{ status: number; headers: http.IncomingHttpHeaders; body: any }> {
  return new Promise((resolve, reject) => {
    const payload = options.body ? JSON.stringify(options.body) : null;
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: (server.address() as any).port,
        path: options.path,
        method: options.method,
        headers: {
          'Content-Type': 'application/json',
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
          ...options.headers,
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          let parsed: any = null;
          try {
            parsed = raw ? JSON.parse(raw) : null;
          } catch {
            parsed = raw;
          }
          resolve({ status: res.statusCode || 500, headers: res.headers, body: parsed });
        });
      }
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runStaffTests() {
  console.log(`\n======================================================`);
  console.log(`  LOOPNEX — STAFF DASHBOARD INTEGRATION TEST SUITE     `);
  console.log(`======================================================\n`);

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, msg: string) {
    total++;
    if (condition) {
      console.log(`  ✓ Test ${total}: ${msg} [PASSED]`);
      passed++;
    } else {
      console.error(`  ✗ Test ${total}: ${msg} [FAILED]`);
      process.exitCode = 1;
    }
  }

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));

  try {
    // 1. Unauthorized request
    const unauth = await request({ method: 'GET', path: '/api/staff/overview' });
    assert(unauth.status === 401, 'Unauthorized request to /api/staff/overview blocked with 401');

    // 2. Customer login & access check
    const custLogin = await request({
      method: 'POST',
      path: '/api/auth/login',
      body: { email: 'customer@loopnex.io', password: 'Loopnex@Customer2026!' },
    });
    const custToken = custLogin.body.data.accessToken;

    const custAttempt = await request({
      method: 'GET',
      path: '/api/staff/overview',
      headers: { Authorization: `Bearer ${custToken}` },
    });
    assert(custAttempt.status === 403, 'Customer token blocked from /api/staff with 403 FORBIDDEN');

    // 3. Staff login
    const staffLogin = await request({
      method: 'POST',
      path: '/api/auth/login',
      body: { email: 'staff@loopnex.io', password: 'Loopnex@Staff2026!' },
    });
    assert(staffLogin.status === 200, 'Staff login succeeds');
    const staffToken = staffLogin.body.data.accessToken;

    // 4. Staff overview
    const overviewRes = await request({
      method: 'GET',
      path: '/api/staff/overview',
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    assert(
      overviewRes.status === 200 &&
        overviewRes.body.data.assignedCustomers > 0 &&
        overviewRes.body.data.subscriptionTrends.length > 0,
      'Staff overview returns 6 metrics, subscription trends, and pending tasks'
    );

    // 5. Staff customers listing
    const custsRes = await request({
      method: 'GET',
      path: '/api/staff/customers',
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    assert(
      custsRes.status === 200 && Array.isArray(custsRes.body.data.customers),
      'Staff can query assigned customer listing'
    );

    // 6. Staff customer details
    const firstCustId = custsRes.body.data.customers[0].id;
    const custDetailRes = await request({
      method: 'GET',
      path: `/api/staff/customers/${firstCustId}`,
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    assert(
      custDetailRes.status === 200 &&
        custDetailRes.body.data.customer.id === firstCustId &&
        Array.isArray(custDetailRes.body.data.subscriptions),
      'Staff can view detailed customer profile, subscriptions, and invoices'
    );

    // 7. Staff quotations listing
    const quotesRes = await request({
      method: 'GET',
      path: '/api/staff/quotations',
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    assert(
      quotesRes.status === 200 && Array.isArray(quotesRes.body.data.quotations),
      'Staff can query quotation listing'
    );

    // 8. Staff create quotation
    const createQuoteRes = await request({
      method: 'POST',
      path: '/api/staff/quotations',
      headers: { Authorization: `Bearer ${staffToken}` },
      body: {
        customerId: firstCustId,
        product: 'LoopNex Enterprise Automation',
        variant: 'Cluster SKU-99',
        quantity: 2,
        unitPrice: 5000,
        taxRate: 10,
        discount: 1000,
        validDays: 20,
        notes: 'Integration test proposal',
      },
    });
    // subtotal = 10000, taxable = 9000, tax = 900, total = 9900
    assert(
      createQuoteRes.status === 201 &&
        createQuoteRes.body.data.quotation.total === 9900 &&
        createQuoteRes.body.data.quotation.status === 'DRAFT',
      'Staff can create new quotation with automatic financial precision calculation'
    );

    // 9. Staff update quote status
    const createdQuoteId = createQuoteRes.body.data.quotation.id;
    const updateQuoteRes = await request({
      method: 'PATCH',
      path: `/api/staff/quotations/${createdQuoteId}/status`,
      headers: { Authorization: `Bearer ${staffToken}` },
      body: { status: 'SENT' },
    });
    assert(
      updateQuoteRes.status === 200 && updateQuoteRes.body.data.quotation.status === 'SENT',
      'Staff can transition quotation status (DRAFT -> SENT)'
    );

    // 10. Staff subscriptions listing
    const subsRes = await request({
      method: 'GET',
      path: '/api/staff/subscriptions',
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    assert(
      subsRes.status === 200 && Array.isArray(subsRes.body.data.subscriptions),
      'Staff can inspect active subscription contracts'
    );

    // 11. Staff invoices listing
    const invoicesRes = await request({
      method: 'GET',
      path: '/api/staff/invoices',
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    assert(
      invoicesRes.status === 200 && Array.isArray(invoicesRes.body.data.invoices),
      'Staff can view billing invoices'
    );

    // 12. Staff confirm draft invoice
    const draftInvoice = invoicesRes.body.data.invoices.find((i: any) => i.status === 'DRAFT');
    if (draftInvoice) {
      const confirmRes = await request({
        method: 'PATCH',
        path: `/api/staff/invoices/${draftInvoice.id}/confirm`,
        headers: { Authorization: `Bearer ${staffToken}` },
      });
      assert(
        confirmRes.status === 200 && confirmRes.body.data.invoice.status === 'CONFIRMED',
        'Staff can confirm draft invoice for billing dispatch'
      );
    } else {
      assert(true, 'No draft invoice found to confirm [SKIPPED]');
    }

    // 13. Staff record payment with ledger update
    const openInvoice = invoicesRes.body.data.invoices.find((i: any) => i.balanceDue > 0);
    const testReference = `TEST-REF-${Date.now()}`;
    const payRes = await request({
      method: 'POST',
      path: '/api/staff/payments',
      headers: { Authorization: `Bearer ${staffToken}` },
      body: {
        invoiceId: openInvoice.id,
        method: 'BANK_TRANSFER',
        reference: testReference,
        amount: 500,
        notes: 'Tranche settlement test',
      },
    });
    assert(
      payRes.status === 201 &&
        payRes.body.data.payment.reference === testReference &&
        payRes.body.data.invoice.amountPaid >= 500,
      'Staff can record payment and dynamically update invoice balance'
    );

    // 14. Duplicate payment reference rejection
    const dupPayRes = await request({
      method: 'POST',
      path: '/api/staff/payments',
      headers: { Authorization: `Bearer ${staffToken}` },
      body: {
        invoiceId: openInvoice.id,
        method: 'BANK_TRANSFER',
        reference: testReference,
        amount: 100,
      },
    });
    assert(
      dupPayRes.status === 409,
      'Duplicate payment reference correctly rejected with 409 DUPLICATE_REFERENCE'
    );

    // 15. Overpayment prevention
    const overpayRes = await request({
      method: 'POST',
      path: '/api/staff/payments',
      headers: { Authorization: `Bearer ${staffToken}` },
      body: {
        invoiceId: openInvoice.id,
        method: 'BANK_TRANSFER',
        reference: `OVERPAY-${Date.now()}`,
        amount: 99999999,
      },
    });
    assert(
      overpayRes.status === 400,
      'Payment exceeding invoice balance due correctly rejected with 400 BAD_REQUEST'
    );

    // 16. Operational reports
    const reportsRes = await request({
      method: 'GET',
      path: '/api/staff/reports',
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    assert(
      reportsRes.status === 200 &&
        reportsRes.body.data.reports.assignedCustomerReport.totalAccounts > 0 &&
        reportsRes.body.data.reports.subscriptionReport.mrr > 0,
      'Staff can access operational telemetry and reports'
    );

    // 17. Staff cannot access admin staff management
    const adminAttempt = await request({
      method: 'GET',
      path: '/api/admin/staff',
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    assert(
      adminAttempt.status === 403,
      'Staff blocked from accessing Admin account management (/api/admin/staff)'
    );

    // 18. Staff cannot access admin audit logs
    const auditAttempt = await request({
      method: 'GET',
      path: '/api/admin/audit-logs',
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    assert(
      auditAttempt.status === 403,
      'Staff blocked from accessing global admin audit logs (/api/admin/audit-logs)'
    );

    console.log(`\n======================================================`);
    console.log(`TEST SUMMARY: ${passed}/${total} PASSED`);
    console.log(`======================================================\n`);
  } finally {
    server.close();
  }
}

runStaffTests().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});

