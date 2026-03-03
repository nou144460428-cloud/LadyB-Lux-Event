import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { AuthModule } from '../auth/auth.module';
import { ProductsModule } from '../products/products.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [AuthModule, ProductsModule, EmailModule],
  providers: [OrdersService],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}
