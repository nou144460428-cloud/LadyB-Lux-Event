import { CreateEventDto } from './create-event.dto';
export declare class EventsService {
    private prisma;
    createEvent(userId: string, dto: CreateEventDto): Promise<any>;
    getEvents(userId: string): Promise<any>;
    getEvent(id: string): Promise<any>;
}
