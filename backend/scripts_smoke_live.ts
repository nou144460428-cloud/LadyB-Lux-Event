import 'dotenv/config';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './src/app.module';

const request = require('supertest');

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

async function run() {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app: INestApplication = moduleRef.createNestApplication();
  await app.init();
  const server = app.getHttpServer();

  const suffix = Date.now();
  const adminSecret = process.env.ADMIN_REGISTRATION_SECRET || 'change-this-admin-secret';

  const adminEmail = `admin-smoke-${suffix}@example.com`;
  const staffEmail = `staff-smoke-${suffix}@example.com`;
  const decoBadEmail = `deco-bad-${suffix}@example.com`;
  const decoGoodEmail = `deco-good-${suffix}@example.com`;

  const adminRegister = await request(server).post('/auth/admin/register').send({
    name: 'Smoke Admin',
    email: adminEmail,
    password: 'Password123!',
    adminSecret,
  });
  assert([200, 201].includes(adminRegister.status), `Admin register failed: ${adminRegister.status}`);

  const adminToken = adminRegister.body?.access_token;
  assert(adminToken, 'Admin token missing');

  const createStaff = await request(server)
    .post('/admin/staff-accounts')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      name: 'Ops Staff',
      email: staffEmail,
      password: 'Password123!',
      accountType: 'STAFF',
    });
  assert([200, 201].includes(createStaff.status), `Create staff failed: ${createStaff.status}`);

  const staffLogin = await request(server)
    .post('/auth/login')
    .send({ email: staffEmail, password: 'Password123!' });
  assert([200, 201].includes(staffLogin.status), `Staff login failed: ${staffLogin.status}`);

  const staffToken = staffLogin.body?.access_token;
  assert(staffToken, 'Staff token missing');

  const staffOrders = await request(server)
    .get('/admin/orders?limit=5')
    .set('Authorization', `Bearer ${staffToken}`);
  assert(staffOrders.status === 200, `Staff /admin/orders expected 200, got ${staffOrders.status}`);

  const staffStats = await request(server)
    .get('/admin/stats')
    .set('Authorization', `Bearer ${staffToken}`);
  assert(staffStats.status === 403, `Staff /admin/stats expected 403, got ${staffStats.status}`);

  const waChannels = await request(server)
    .get('/whatsapp/channels')
    .set('Authorization', `Bearer ${staffToken}`);
  assert(waChannels.status === 200, `Staff /whatsapp/channels expected 200, got ${waChannels.status}`);

  const decoBad = await request(server).post('/auth/register').send({
    name: 'Bad Decorator',
    email: decoBadEmail,
    password: 'Password123!',
    role: 'VENDOR',
    accountType: 'DECORATOR',
  });
  assert(decoBad.status === 403, `Decorator missing contacts expected 403, got ${decoBad.status}`);

  const decoGood = await request(server).post('/auth/register').send({
    name: 'Good Decorator',
    email: decoGoodEmail,
    password: 'Password123!',
    role: 'VENDOR',
    accountType: 'DECORATOR',
    phone: '+2348011111111',
    nextOfKinName: 'Kin Name',
    nextOfKinPhone: '+2348022222222',
    nextOfKinRelationship: 'Sibling',
  });
  assert([200, 201].includes(decoGood.status), `Decorator with contacts failed: ${decoGood.status}`);

  console.log('SMOKE_OK');
  console.log(
    JSON.stringify(
      {
        adminEmail,
        staffEmail,
        decoratorEmail: decoGoodEmail,
        staffOrdersStatus: staffOrders.status,
        staffStatsStatus: staffStats.status,
        whatsappChannelsStatus: waChannels.status,
        decoratorMissingContactsStatus: decoBad.status,
      },
      null,
      2,
    ),
  );

  await app.close();
}

run().catch((err: any) => {
  console.error('SMOKE_FAILED');
  console.error(err?.stack || err);
  process.exit(1);
});
