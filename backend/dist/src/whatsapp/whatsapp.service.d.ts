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
export declare class WhatsappService {
    private readonly apiBase;
    private readonly apiVersion;
    private readonly phoneNumberId;
    private readonly accessToken;
    listChannels(): {
        id: string;
        name: string;
        enabled: boolean;
    }[];
    sendChatMessage(input: SendChatInput): Promise<{
        success: boolean;
        channel: string;
        data: any;
    }>;
    sendBroadcast(input: SendBroadcastInput): Promise<{
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
    private ensureConfigured;
    private messagesUrl;
    private headers;
}
export {};
