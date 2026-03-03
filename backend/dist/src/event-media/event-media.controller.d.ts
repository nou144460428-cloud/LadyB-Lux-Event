import { EventMediaService, EventMediaType } from './event-media.service';
export declare class EventMediaController {
    private readonly eventMediaService;
    constructor(eventMediaService: EventMediaService);
    list(type?: EventMediaType): Promise<import("./event-media.service").EventMediaItem[]>;
    create(body: {
        title: string;
        type: EventMediaType;
        src: string;
        note?: string;
        location?: string;
        poster?: string;
    }): Promise<import("./event-media.service").EventMediaItem>;
    update(id: string, body: {
        title?: string;
        type?: EventMediaType;
        src?: string;
        note?: string;
        location?: string;
        poster?: string;
    }): Promise<import("./event-media.service").EventMediaItem>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
}
