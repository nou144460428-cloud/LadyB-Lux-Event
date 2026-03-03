import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EventMediaService, EventMediaType } from './event-media.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { Role } from '@prisma/client';

@Controller('event-media')
export class EventMediaController {
  constructor(private readonly eventMediaService: EventMediaService) {}

  @Get()
  async list(@Query('type') type?: EventMediaType) {
    return this.eventMediaService.list(type);
  }

  @Post('admin')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async create(
    @Body()
    body: {
      title: string;
      type: EventMediaType;
      src: string;
      note?: string;
      location?: string;
      poster?: string;
    },
  ) {
    return this.eventMediaService.create(body);
  }

  @Patch('admin/:id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      title?: string;
      type?: EventMediaType;
      src?: string;
      note?: string;
      location?: string;
      poster?: string;
    },
  ) {
    const updated = await this.eventMediaService.update(id, body);
    if (!updated) {
      throw new NotFoundException('Event media item not found');
    }
    return updated;
  }

  @Delete('admin/:id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string) {
    return this.eventMediaService.remove(id);
  }
}
