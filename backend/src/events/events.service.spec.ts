import { BadRequestException } from '@nestjs/common';
import { EventsService } from './events.service';

describe('EventsService', () => {
  let service: EventsService;

  beforeEach(() => {
    process.env.DATABASE_URL =
      process.env.DATABASE_URL ||
      'postgresql://postgres:postgres@localhost:5432/ladyb_lux_event';
    service = new EventsService();
    (service as any).prisma = {
      event: {
        create: jest.fn(async ({ data }: any) => ({ id: 'evt_1', ...data })),
      },
    };
  });

  it('creates event with parsed date', async () => {
    const result = await service.createEvent('user_1', {
      title: 'Birthday',
      eventDate: '2026-03-15',
      location: 'Lagos',
    });

    expect(result.id).toBe('evt_1');
    expect(result.userId).toBe('user_1');
    expect(result.eventDate).toBeInstanceOf(Date);
  });

  it('rejects invalid event date', async () => {
    await expect(
      service.createEvent('user_1', {
        title: 'Birthday',
        eventDate: 'bad-date',
        location: 'Lagos',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
