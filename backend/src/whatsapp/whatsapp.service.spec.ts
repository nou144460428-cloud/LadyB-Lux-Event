import axios from 'axios';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('WhatsappService', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('returns disabled channel when credentials are missing', () => {
    delete process.env.WHATSAPP_PHONE_NUMBER_ID;
    delete process.env.WHATSAPP_ACCESS_TOKEN;
    const service = new WhatsappService();

    const channels = service.listChannels();
    expect(channels[0].enabled).toBe(false);
  });

  it('throws when trying to send chat without API configuration', async () => {
    delete process.env.WHATSAPP_PHONE_NUMBER_ID;
    delete process.env.WHATSAPP_ACCESS_TOKEN;
    const service = new WhatsappService();

    await expect(
      service.sendChatMessage({ to: '2348012345678', message: 'hello' }),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
  });

  it('validates broadcast recipients', async () => {
    process.env.WHATSAPP_PHONE_NUMBER_ID = '12345';
    process.env.WHATSAPP_ACCESS_TOKEN = 'token';
    const service = new WhatsappService();

    await expect(
      service.sendBroadcast({ recipients: [], message: 'Promo' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('sends broadcast and returns success counters', async () => {
    process.env.WHATSAPP_PHONE_NUMBER_ID = '12345';
    process.env.WHATSAPP_ACCESS_TOKEN = 'token';
    mockedAxios.post.mockResolvedValue({
      data: { messages: [{ id: 'wamid.1' }] },
    } as any);

    const service = new WhatsappService();
    const result = await service.sendBroadcast({
      recipients: ['2348012345678', '2348098765432'],
      message: 'Material pickup update',
    });

    expect(result.total).toBe(2);
    expect(result.successCount).toBe(2);
    expect(result.failedCount).toBe(0);
    expect(mockedAxios.post).toHaveBeenCalledTimes(2);
  });
});
