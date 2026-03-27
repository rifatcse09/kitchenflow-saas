import { Module } from '@nestjs/common';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { DataModule } from './data/data.module';
import { PrismaModule } from './prisma/prisma.module';
import { RestaurantModule } from './restaurant/restaurant.module';

@Module({
  imports: [PrismaModule, DataModule, AuthModule, AdminModule, RestaurantModule],
})
export class AppModule {}
