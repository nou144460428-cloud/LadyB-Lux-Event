import { WhatsappService } from './whatsapp.service';
export declare class WhatsappController {
    private readonly whatsappService;
    constructor(whatsappService: WhatsappService);
    listChannels(): {
        id: string;
        name: string;
        enabled: boolean;
    }[];
    sendChatMessage(body: {
        to: string;
        message: string;
        channel?: string;
    }): Promise<{
        success: boolean;
        channel: string;
        data: any;
    }>;
    sendBroadcast(body: {
        recipients: string[];
        message: string;
        channel?: string;
    }): Promise<{
        channel: string;
        total: number;
        successCount: number;
        failedCount: number;
        results: ({
            recipient: string;
            success: boolean;
            data: any;
            error?: undefined;
        } | {
            recipient: string;
            success: boolean;
            error: any;
            data?: undefined;
        })[];
    }>;
}
