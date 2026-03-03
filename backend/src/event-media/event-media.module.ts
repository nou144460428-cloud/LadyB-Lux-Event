import { Module } from '@nestjs/common';
import { EventMediaController } from './event-media.controller';
import { EventMediaService } from './event-media.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [EventMediaController],
  providers: [EventMediaService],
  exports: [EventMediaService],
})
export class EventMediaModule {}
