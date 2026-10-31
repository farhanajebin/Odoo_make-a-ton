import http from 'http';
import { createApp } from '../app.js';

const app = createApp();

async function request(url: string, options: { method: string; path: string; body?: any; headers?: Record<string, string> }) {
  const res = await fetch(`${url}${options.path}`, {
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
  const server = http.createServer(app);
  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });

  const address = server.address() as any;
  const url = `http://127.0.0.1:${address.port}`;

  try {
    const loginResponse = await request(url, {
      method: 'POST',
      path: '/api/auth/login',
      body: {
        email: 'admin@loopnex.io',
        password: 'Loopnex@Admin2026!',
      },
    });

    if (loginResponse.status !== 200) {
      throw new Error(`Login failed: ${loginResponse.status} ${JSON.stringify(loginResponse.data)}`);
    }

    const token = loginResponse.data.data.accessToken;
    if (!token) {
      throw new Error('Missing access token after login');
    }

    const createPlanResponse = await request(url, {
      method: 'POST',
      path: '/api/plans',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        name: 'Starter Daily',
        description: 'Starter pricing plan',
        productId: 'prod-1',
        billingFrequency: 'DAILY',
        pricingMode: 'PRODUCT_BASED',
        unitPrice: '1500',
        minimumQuantity: 2,
        availabilityStart: '2026-10-01',
        availabilityEnd: '2027-10-01',
      },
    });

    if (createPlanResponse.status !== 201) {
      throw new Error(`Create plan failed: ${createPlanResponse.status} ${JSON.stringify(createPlanResponse.data)}`);
    }

    const planId = createPlanResponse.data.data.plan.id;

    const previewResponse = await request(url, {
      method: 'POST',
      path: '/api/plans/price-preview',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        productPrice: '1500',
        variantPrice: '250',
        pricingMode: 'VARIANT_BASED',
        quantity: 3,
        minimumQuantity: 2,
        billingFrequency: 'MONTHLY',
      },
    });

    if (previewResponse.status !== 200) {
      throw new Error(`Price preview failed: ${previewResponse.status} ${JSON.stringify(previewResponse.data)}`);
    }

    if (previewResponse.data.data.finalBillingAmount !== '5250.00') {
      throw new Error(`Unexpected preview total: ${previewResponse.data.data.finalBillingAmount}`);
    }

    const activeResponse = await request(url, {
      method: 'PATCH',
      path: `/api/plans/${planId}/activate`,
      headers: { Authorization: `Bearer ${token}` },
    });

    if (activeResponse.status !== 200) {
      throw new Error(`Activate plan failed: ${activeResponse.status} ${JSON.stringify(activeResponse.data)}`);
    }

    const historyResponse = await request(url, {
      method: 'GET',
      path: `/api/plans/${planId}/history`,
      headers: { Authorization: `Bearer ${token}` },
    });

    if (historyResponse.status !== 200) {
      throw new Error(`History fetch failed: ${historyResponse.status} ${JSON.stringify(historyResponse.data)}`);
    }

    const archiveResponse = await request(url, {
      method: 'PATCH',
      path: `/api/plans/${planId}/archive`,
      headers: { Authorization: `Bearer ${token}` },
    });

    if (archiveResponse.status !== 200) {
      throw new Error(`Archive plan failed: ${archiveResponse.status} ${JSON.stringify(archiveResponse.data)}`);
    }

    console.log('Plan management validation passed.');
  } finally {
    server.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
