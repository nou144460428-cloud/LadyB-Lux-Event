import { EventsService } from './events.service';
import { CreateEventDto } from './create-event.dto';
export declare class EventsController {
    private eventsService;
    constructor(eventsService: EventsService);
    createEvent(dto: CreateEventDto, req: any): Promise<any>;
    getEvents(req: any): Promise<any>;
    getEvent(id: string): Promise<any>;
}
