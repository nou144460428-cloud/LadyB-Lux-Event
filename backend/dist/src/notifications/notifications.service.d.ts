export declare class NotificationsService {
    private prisma;
    sendNotification(userId: string, type: any, title: string, message: string, data?: any): Promise<any>;
    getNotifications(userId: string, unreadOnly?: boolean): Promise<any>;
    markAsRead(notificationId: string): Promise<any>;
    markAllAsRead(userId: string): Promise<any>;
    deleteNotification(id: string): Promise<any>;
}
