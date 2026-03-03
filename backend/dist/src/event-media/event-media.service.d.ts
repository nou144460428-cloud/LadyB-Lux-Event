export type EventMediaType = 'PHOTO' | 'VIDEO';
export interface EventMediaItem {
    id: string;
    title: string;
    type: EventMediaType;
    src: string;
    note?: string;
    location?: string;
    poster?: string;
    createdAt: string;
    updatedAt: string;
}
export declare class EventMediaService {
    private readonly dataDir;
    private readonly dataFile;
    list(type?: EventMediaType): Promise<EventMediaItem[]>;
    create(input: Omit<EventMediaItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<EventMediaItem>;
    update(id: string, patch: Partial<EventMediaItem>): Promise<EventMediaItem | null>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
    private readAll;
    private writeAll;
}
