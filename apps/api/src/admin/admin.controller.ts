import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import type { SubscriptionEnforcement } from '@prisma/client';
import { StoreService } from '../data/store.service';

interface CreateSubscriptionDto {
  slug: string;
  name: string;
  description?: string | null;
  active?: boolean;
  sortOrder?: number;
  enforcement: SubscriptionEnforcement;
  trialDurationMonths: number;
  guestOrderTrialCap: number;
  paidWindowMonths: number;
  renewalPeriodMonths?: number | null;
  guestOrderPaidBudget: number;
  priceCents?: number | null;
}

type UpdateSubscriptionDto = Partial<CreateSubscriptionDto>;

@Controller('admin')
export class AdminController {
  constructor(private readonly storeService: StoreService) {}

  @Get('default-owner')
  getDefaultOwner() {
    return this.storeService.getDefaultPlatformOwner();
  }

  @Get('subscription-tenants')
  getSubscriptionTenants() {
    return this.storeService.getAdminSubscriptionTenants();
  }

  @Get('subscriptions')
  listSubscriptions() {
    return this.storeService.listSubscriptionsForAdmin();
  }

  @Post('subscriptions')
  createSubscription(@Body() body: CreateSubscriptionDto) {
    return this.storeService.createSubscriptionRow(body);
  }

  @Patch('subscriptions/:id')
  updateSubscription(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateSubscriptionDto) {
    return this.storeService.updateSubscriptionRow(id, body);
  }

  @Get('restaurant-requests/meta')
  getRestaurantRequestsMeta() {
    return this.storeService.getRestaurantRequestsMeta();
  }

  @Get('restaurant-requests')
  getRestaurantRequests(
    @Query('cursor') cursorStr?: string,
    @Query('limit') limitStr?: string,
  ) {
    let cursor: number | undefined;
    if (cursorStr !== undefined && cursorStr !== '') {
      const n = parseInt(cursorStr, 10);
      if (!Number.isFinite(n)) {
        throw new BadRequestException('cursor must be a valid number');
      }
      cursor = n;
    }
    const parsed = limitStr !== undefined && limitStr !== '' ? parseInt(limitStr, 10) : 5;
    const limit = Number.isFinite(parsed) ? parsed : 5;
    return this.storeService.getRequestsPage(cursor, limit);
  }

  @Patch('restaurant-requests/:id/approve')
  approveRestaurantRequest(@Param('id', ParseIntPipe) id: number) {
    return this.storeService.approveRequest(id);
  }
}
