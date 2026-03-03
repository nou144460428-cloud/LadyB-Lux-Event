import { ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AccountType, Role } from '@prisma/client';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    process.env.DATABASE_URL =
      process.env.DATABASE_URL ||
      'postgresql://postgres:postgres@localhost:5432/ladyb_lux_event';

    service = new AuthService({ sign: jest.fn(() => 'token') } as unknown as JwtService);
    (service as any).prisma = {
      user: {
        findUnique: jest.fn(async () => null),
        create: jest.fn(async ({ data }: any) => ({ id: 'user_1', ...data })),
      },
    };
  });

  it('requires decorator phone and next-of-kin details', async () => {
    await expect(
      service.register({
        name: 'Deco User',
        email: 'deco@example.com',
        password: 'pass1234',
        role: Role.VENDOR,
        accountType: AccountType.DECORATOR,
      } as any),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows vendor registration without decorator emergency contacts', async () => {
    const result = await service.register({
      name: 'Vendor User',
      email: 'vendor@example.com',
      password: 'pass1234',
      role: Role.VENDOR,
      accountType: AccountType.VENDOR,
    } as any);

    expect(result.access_token).toBe('token');
    expect(result.user.accountType).toBe(AccountType.VENDOR);
  });

  it('blocks public admin registration', async () => {
    await expect(
      service.register({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'pass1234',
        role: Role.ADMIN,
      } as any),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
