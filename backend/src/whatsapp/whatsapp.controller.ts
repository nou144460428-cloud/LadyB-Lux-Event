import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { Role } from '@prisma/client';
import { WhatsappService } from './whatsapp.service';

@Controller('whatsapp')
@UseGuards(JwtGuard, RolesGuard)
@Roles(Role.ADMIN, Role.STAFF)
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Get('channels')
  listChannels() {
    return this.whatsappService.listChannels();
  }

  @Post('chat')
  sendChatMessage(
    @Body()
    body: {
      to: string;
      message: string;
      channel?: string;
    },
  ) {
    return this.whatsappService.sendChatMessage(body);
  }

  @Post('broadcast')
  sendBroadcast(
    @Body()
    body: {
      recipients: string[];
      message: string;
      channel?: string;
    },
  ) {
    return this.whatsappService.sendBroadcast(body);
  }
}
