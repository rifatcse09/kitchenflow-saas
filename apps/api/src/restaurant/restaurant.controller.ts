import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { StoreService } from '../data/store.service';

interface CreateRestaurantRequestDto {
  ownerName: string;
  ownerEmail: string;
  ownerPassword: string;
  restaurantName: string;
  city: string;
  initialUserName?: string;
  initialUserEmail?: string;
  initialUserRole?: 'MANAGER' | 'STAFF' | 'CASHIER';
}

interface CreateMenuItemDto {
  name: string;
  category: string;
  price: number;
}

interface CreateRestaurantUserDto {
  name: string;
  email: string;
  role: 'MANAGER' | 'STAFF' | 'CASHIER';
  password: string;
}

@Controller('restaurant')
export class RestaurantController {
  constructor(private readonly storeService: StoreService) {}

  @Post('register')
  registerRestaurant(@Body() body: CreateRestaurantRequestDto) {
    return this.storeService.createRequest(body);
  }

  @Get(':restaurantId/menu-items')
  getMenuItems(@Param('restaurantId', ParseIntPipe) restaurantId: number) {
    return this.storeService.getMenuItems(restaurantId);
  }

  @Post(':restaurantId/menu-items')
  addMenuItem(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Body() body: CreateMenuItemDto,
  ) {
    return this.storeService.addMenuItem(restaurantId, body);
  }

  @Get(':restaurantId/users')
  getRestaurantUsers(@Param('restaurantId', ParseIntPipe) restaurantId: number) {
    return this.storeService.getRestaurantUsers(restaurantId);
  }

  @Post(':restaurantId/users')
  addRestaurantUser(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Body() body: CreateRestaurantUserDto,
  ) {
    return this.storeService.addRestaurantUser(restaurantId, body);
  }
}
