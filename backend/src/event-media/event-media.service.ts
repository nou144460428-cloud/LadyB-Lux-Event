import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';

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

@Injectable()
export class EventMediaService {
  private readonly dataDir = path.join(process.cwd(), 'data');
  private readonly dataFile = path.join(this.dataDir, 'event-media.json');

  async list(type?: EventMediaType) {
    const media = await this.readAll();
    const filtered = type ? media.filter((item) => item.type === type) : media;
    return filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async create(
    input: Omit<EventMediaItem, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<EventMediaItem> {
    const media = await this.readAll();
    const now = new Date().toISOString();
    const item: EventMediaItem = {
      id: `media_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
      ...input,
      createdAt: now,
      updatedAt: now,
    };
    media.push(item);
    await this.writeAll(media);
    return item;
  }

  async update(id: string, patch: Partial<EventMediaItem>) {
    const media = await this.readAll();
    const index = media.findIndex((item) => item.id === id);
    if (index < 0) {
      return null;
    }

    media[index] = {
      ...media[index],
      ...patch,
      id: media[index].id,
      updatedAt: new Date().toISOString(),
    };
    await this.writeAll(media);
    return media[index];
  }

  async remove(id: string) {
    const media = await this.readAll();
    const filtered = media.filter((item) => item.id !== id);
    const changed = filtered.length !== media.length;
    if (changed) {
      await this.writeAll(filtered);
    }
    return { deleted: changed };
  }

  private async readAll(): Promise<EventMediaItem[]> {
    await fs.mkdir(this.dataDir, { recursive: true });
    try {
      const content = await fs.readFile(this.dataFile, 'utf8');
      return JSON.parse(content) as EventMediaItem[];
    } catch {
      const seed: EventMediaItem[] = [];
      await this.writeAll(seed);
      return seed;
    }
  }

  private async writeAll(items: EventMediaItem[]) {
    await fs.mkdir(this.dataDir, { recursive: true });
    await fs.writeFile(this.dataFile, JSON.stringify(items, null, 2), 'utf8');
  }
}
