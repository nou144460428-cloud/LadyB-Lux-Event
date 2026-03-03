import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private notificationsService;
    constructor(notificationsService: NotificationsService);
    getNotifications(req: any, unread?: string): Promise<any>;
    markAsRead(id: string): Promise<any>;
    markAllAsRead(req: any): Promise<any>;
    deleteNotification(id: string): Promise<any>;
}
