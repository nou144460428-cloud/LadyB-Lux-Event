import { BadRequestException, Injectable } from '@nestjs/common';
import { createPrismaClient } from '../prisma/prisma-client-options';
import { CreateEventDto } from './create-event.dto';

@Injectable()
export class EventsService {
  private prisma: any = createPrismaClient() as any;

  async createEvent(userId: string, dto: CreateEventDto) {
    const parsedEventDate = new Date(dto.eventDate);
    if (Number.isNaN(parsedEventDate.getTime())) {
      throw new BadRequestException(
        'Invalid eventDate format. Use ISO date format, e.g. 2026-03-15',
      );
    }

    return this.prisma.event.create({
      data: {
        userId,
        title: dto.title,
        eventDate: parsedEventDate,
        location: dto.location,
      },
    });
  }

  async getEvents(userId: string) {
    return this.prisma.event.findMany({
      where: { userId },
    });
  }

  async getEvent(id: string) {
    return this.prisma.event.findUnique({
      where: { id },
      include: { orders: true },
    });
  }
}
