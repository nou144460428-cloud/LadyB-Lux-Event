import { ConflictException } from '@nestjs/common';
import { AccountType, Role } from '@prisma/client';
import { AdminService } from './admin.service';

describe('AdminService', () => {
  let service: AdminService;

  beforeEach(() => {
    process.env.DATABASE_URL =
      process.env.DATABASE_URL ||
      'postgresql://postgres:postgres@localhost:5432/ladyb_lux_event';

    service = new AdminService({} as any);
    (service as any).prisma = {
      user: {
        findUnique: jest.fn(async () => null),
        create: jest.fn(async ({ data }: any) => ({ id: 'user_1', ...data })),
      },
    };
  });

  it('creates stock keeper admin account as ADMIN role', async () => {
    const result = await service.createStaffAccount({
      name: 'Stock Keeper',
      email: 'stock@example.com',
      password: 'pass1234',
      accountType: 'STOCK_KEEPER_ADMIN',
    });

    expect(result.role).toBe(Role.ADMIN);
    expect(result.accountType).toBe('STOCK_KEEPER_ADMIN');
    expect((service as any).prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          accountType: AccountType.ADMIN,
        }),
      }),
    );
  });

  it('creates staff account as STAFF role', async () => {
    const result = await service.createStaffAccount({
      name: 'Ops Staff',
      email: 'staff@example.com',
      password: 'pass1234',
      accountType: 'STAFF',
    });

    expect(result.role).toBe(Role.STAFF);
    expect((service as any).prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          accountType: AccountType.STAFF,
        }),
      }),
    );
  });

  it('rejects duplicate staff account emails', async () => {
    (service as any).prisma.user.findUnique = jest.fn(async () => ({ id: 'existing' }));

    await expect(
      service.createStaffAccount({
        name: 'Existing',
        email: 'exists@example.com',
        password: 'pass1234',
        accountType: 'STAFF',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
