import { PaymentsService } from './payments.service';
import { BadRequestException } from '@nestjs/common';

describe('PaymentsService', () => {
  let service: PaymentsService;

  beforeEach(() => {
    process.env.DATABASE_URL =
      process.env.DATABASE_URL ||
      'postgresql://postgres:postgres@localhost:5432/ladyb_lux_event';
    service = new PaymentsService({} as any);
  });

  it('routes initiatePayment to monnify', async () => {
    const spy = jest
      .spyOn(service, 'initiateMonnifyPayment')
      .mockResolvedValue({ ok: true } as any);

    await service.initiatePayment('order_1', 'user_1', 'monnify');

    expect(spy).toHaveBeenCalledWith('order_1', 'user_1');
  });

  it('routes initiatePayment to paystack by default', async () => {
    const spy = jest
      .spyOn(service, 'initiatePaystackPayment')
      .mockResolvedValue({ ok: true } as any);

    await service.initiatePayment('order_1', 'user_1');

    expect(spy).toHaveBeenCalledWith('order_1', 'user_1');
  });

  it('routes initiatePayment to cash pickup when requested', async () => {
    const spy = jest
      .spyOn(service as any, 'initiateCashPickupPayment')
      .mockResolvedValue({ ok: true } as any);

    await service.initiatePayment('order_1', 'user_1', 'cash_pickup');

    expect(spy).toHaveBeenCalledWith('order_1', 'user_1');
  });

  it('rejects unsupported providers', async () => {
    await expect(
      service.initiatePayment('order_1', 'user_1', 'flutterwave'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('uses stored provider when verify provider is omitted', async () => {
    (service as any).prisma = {
      payment: {
        findFirst: jest.fn(async () => ({ provider: 'monnify' })),
      },
    };

    const monnifySpy = jest
      .spyOn(service, 'verifyMonnifyPayment')
      .mockResolvedValue({ success: true } as any);

    await service.verifyPayment('ref_1', 'user_1');

    expect(monnifySpy).toHaveBeenCalledWith('ref_1', 'user_1');
  });
});
