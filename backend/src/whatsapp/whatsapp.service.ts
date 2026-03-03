import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';

type SendChatInput = {
  to: string;
  message: string;
  channel?: string;
};

type SendBroadcastInput = {
  recipients: string[];
  message: string;
  channel?: string;
};

@Injectable()
export class WhatsappService {
  private readonly apiBase = process.env.WHATSAPP_API_BASE || 'https://graph.facebook.com';
  private readonly apiVersion = process.env.WHATSAPP_API_VERSION || 'v21.0';
  private readonly phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  private readonly accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  listChannels() {
    return [
      {
        id: 'WHATSAPP_BUSINESS',
        name: 'WhatsApp Business API',
        enabled: Boolean(this.phoneNumberId && this.accessToken),
      },
    ];
  }

  async sendChatMessage(input: SendChatInput) {
    this.ensureConfigured();

    if (!input.to?.trim()) {
      throw new BadRequestException('Recipient phone is required');
    }

    if (!input.message?.trim()) {
      throw new BadRequestException('Message is required');
    }

    const response = await axios.post(
      this.messagesUrl(),
      {
        messaging_product: 'whatsapp',
        to: input.to.trim(),
        type: 'text',
        text: {
          body: input.message.trim(),
        },
      },
      {
        headers: this.headers(),
      },
    );

    return {
      success: true,
      channel: input.channel || 'WHATSAPP_BUSINESS',
      data: response.data,
    };
  }

  async sendBroadcast(input: SendBroadcastInput) {
    this.ensureConfigured();

    if (!Array.isArray(input.recipients) || input.recipients.length === 0) {
      throw new BadRequestException('At least one recipient is required');
    }

    if (!input.message?.trim()) {
      throw new BadRequestException('Broadcast message is required');
    }

    const results = await Promise.all(
      input.recipients.map(async (recipient) => {
        try {
          const res = await this.sendChatMessage({
            to: recipient,
            message: input.message,
            channel: input.channel,
          });
          return {
            recipient,
            success: true,
            data: res.data,
          };
        } catch (error: any) {
          return {
            recipient,
            success: false,
            error: error?.response?.data || error?.message || 'Failed to send',
          };
        }
      }),
    );

    const successCount = results.filter((r) => r.success).length;
    return {
      channel: input.channel || 'WHATSAPP_BUSINESS',
      total: input.recipients.length,
      successCount,
      failedCount: input.recipients.length - successCount,
      results,
    };
  }

  private ensureConfigured() {
    if (!this.phoneNumberId || !this.accessToken) {
      throw new InternalServerErrorException(
        'WhatsApp Business API not configured. Set WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN',
      );
    }
  }

  private messagesUrl() {
    return `${this.apiBase}/${this.apiVersion}/${this.phoneNumberId}/messages`;
  }

  private headers() {
    return {
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };
  }
}
