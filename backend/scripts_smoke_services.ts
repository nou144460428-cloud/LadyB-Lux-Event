import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { AuthService } from './src/auth/auth.service';
import { AdminService } from './src/admin/admin.service';
import { WhatsappService } from './src/whatsapp/whatsapp.service';

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });

  const authService = app.get(AuthService);
  const adminService = app.get(AdminService);
  const whatsappService = app.get(WhatsappService);

  const suffix = Date.now();

  let decoratorValidationBlocked = false;
  try {
    await authService.register({
      name: 'Bad Decorator',
      email: `bad-deco-${suffix}@example.com`,
      password: 'Password123!',
      role: 'VENDOR' as any,
      accountType: 'DECORATOR' as any,
    } as any);
  } catch {
    decoratorValidationBlocked = true;
  }
  assert(decoratorValidationBlocked, 'Decorator missing contacts should be blocked');

  const goodDecorator = await authService.register({
    name: 'Good Decorator',
    email: `good-deco-${suffix}@example.com`,
    password: 'Password123!',
    role: 'VENDOR' as any,
    accountType: 'DECORATOR' as any,
    phone: '+2348011111111',
    nextOfKinName: 'Kin Name',
    nextOfKinPhone: '+2348022222222',
    nextOfKinRelationship: 'Sibling',
  } as any);
  assert(Boolean(goodDecorator?.access_token), 'Decorator registration should return token');

  const staff = await adminService.createStaffAccount({
    name: 'Ops Staff',
    email: `staff-${suffix}@example.com`,
    password: 'Password123!',
    accountType: 'STAFF',
  });
  assert(staff.role === 'STAFF', `Expected STAFF role, got ${staff.role}`);

  const channels = whatsappService.listChannels();
  assert(Array.isArray(channels) && channels.length > 0, 'WhatsApp channels should be available');

  console.log('SERVICE_SMOKE_OK');
  console.log(
    JSON.stringify(
      {
        decoratorValidationBlocked,
        decoratorRegistered: goodDecorator.user?.email,
        staffCreatedRole: staff.role,
        whatsappChannels: channels,
      },
      null,
      2,
    ),
  );

  await app.close();
}

run().catch((err) => {
  console.error('SERVICE_SMOKE_FAILED');
  console.error(err?.stack || err);
  process.exit(1);
});
