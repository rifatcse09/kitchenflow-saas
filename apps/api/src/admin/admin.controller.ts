import { Controller, Get, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { StoreService } from '../data/store.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly storeService: StoreService) {}

  @Get('default-owner')
  getDefaultOwner() {
    return this.storeService.getDefaultPlatformOwner();
  }

  @Get('restaurant-requests')
  getRestaurantRequests() {
    return this.storeService.getRequests();
  }

  @Patch('restaurant-requests/:id/approve')
  approveRestaurantRequest(@Param('id', ParseIntPipe) id: number) {
    return this.storeService.approveRequest(id);
  }
}
