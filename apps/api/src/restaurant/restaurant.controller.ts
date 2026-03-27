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
  initialUserPassword?: string;
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

interface CreateGuestOrderDto {
  tableCode: string;
  customerPhone?: string;
  customerEmail?: string;
  items: { menuItemId: number; qty: number; note?: string }[];
}

@Controller('restaurant')
export class RestaurantController {
  constructor(private readonly storeService: StoreService) {}

  @Post('register')
  registerRestaurant(@Body() body: CreateRestaurantRequestDto) {
    return this.storeService.createRequest(body);
  }

  /** Public: approved restaurant name/city for QR landing */
  @Get(':restaurantId/profile')
  getPublicProfile(@Param('restaurantId', ParseIntPipe) restaurantId: number) {
    return this.storeService.getRestaurantPublicProfile(restaurantId);
  }

  /** Guest checkout — no login (optional phone/email for receipt / marketing) */
  @Post(':restaurantId/orders')
  createGuestOrder(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Body() body: CreateGuestOrderDto,
  ) {
    return this.storeService.createGuestOrder(restaurantId, body);
  }

  /** Staff / kitchen queue — add auth guards later */
  @Get(':restaurantId/orders')
  listGuestOrders(@Param('restaurantId', ParseIntPipe) restaurantId: number) {
    return this.storeService.listGuestOrders(restaurantId);
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
