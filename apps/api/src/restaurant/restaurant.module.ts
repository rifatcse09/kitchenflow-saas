import { Module } from '@nestjs/common';
import { RestaurantController } from './restaurant.controller';

@Module({
  controllers: [RestaurantController],
})
export class RestaurantModule {}
