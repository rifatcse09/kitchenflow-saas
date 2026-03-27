import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
  RestaurantStatus,
  RestaurantSubRole,
  TeamRole,
  UserRole,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type RequestStatus = 'PENDING' | 'APPROVED';

export interface RestaurantRequest {
  id: number;
  ownerName: string;
  ownerEmail: string;
  ownerPassword: string;
  restaurantName: string;
  city: string;
  initialUserName?: string;
  initialUserEmail?: string;
  initialUserPassword?: string;
  initialUserRole?: 'MANAGER' | 'STAFF' | 'CASHIER';
  status: RequestStatus;
}

export interface MenuItem {
  id: number;
  restaurantId: number;
  name: string;
  category: string;
  price: number;
  available: boolean;
}

/** Tenant-internal RBAC: maps UI access (Owner / Manager / Kitchen KDS). */
export type RestaurantSubRoleDto = 'OWNER' | 'MANAGER' | 'KITCHEN';

export interface RestaurantUser {
  id: number;
  restaurantId: number;
  name: string;
  email: string;
  role: 'MANAGER' | 'STAFF' | 'CASHIER';
  approved: boolean;
}

interface LoginPayload {
  role: 'CUSTOMER' | 'RESTAURANT' | 'ADMIN';
  email: string;
  password: string;
}

const BCRYPT_ROUNDS = 10;

function toRequestStatus(s: RestaurantStatus): RequestStatus {
  return s === 'APPROVED' ? 'APPROVED' : 'PENDING';
}

function teamRoleToSubRole(
  role: 'MANAGER' | 'STAFF' | 'CASHIER',
): { sub: RestaurantSubRole; team: TeamRole } {
  if (role === 'MANAGER') return { sub: 'MANAGER', team: 'MANAGER' };
  return { sub: 'KITCHEN', team: role };
}

@Injectable()
export class StoreService {
  constructor(private readonly prisma: PrismaService) {}

  private async hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain.trim(), BCRYPT_ROUNDS);
  }

  async getDefaultPlatformOwner() {
    const admin = await this.prisma.user.findFirst({
      where: { role: 'ADMIN' },
      orderBy: { id: 'asc' },
    });
    return {
      name: admin?.name ?? 'Platform Admin',
      email: admin?.email ?? 'admin@mdrifatul.info',
      passwordHint: '123456',
    };
  }

  async getRequests(): Promise<RestaurantRequest[]> {
    const restaurants = await this.prisma.restaurant.findMany({
      orderBy: { id: 'asc' },
    });
    const out: RestaurantRequest[] = [];
    for (const r of restaurants) {
      const owner = await this.prisma.user.findFirst({
        where: { restaurantId: r.id, restaurantSubRole: 'OWNER' },
      });
      const extra = await this.prisma.user.findFirst({
        where: {
          restaurantId: r.id,
          restaurantSubRole: { not: 'OWNER' },
          teamRole: { not: null },
        },
        orderBy: { id: 'asc' },
      });
      out.push({
        id: r.id,
        ownerName: owner?.name ?? '',
        ownerEmail: owner?.email ?? '',
        ownerPassword: '',
        restaurantName: r.name,
        city: r.city,
        status: toRequestStatus(r.status),
        initialUserName: extra?.name,
        initialUserEmail: extra?.email,
        initialUserRole: extra?.teamRole ?? undefined,
      });
    }
    return out;
  }

  async createRequest(
    payload: Omit<RestaurantRequest, 'id' | 'status'>,
  ): Promise<RestaurantRequest> {
    const passwordHash = await this.hashPassword(payload.ownerPassword);

    const restaurant = await this.prisma.restaurant.create({
      data: {
        name: payload.restaurantName,
        city: payload.city,
        status: 'PENDING',
        users: {
          create: {
            email: payload.ownerEmail.trim().toLowerCase(),
            passwordHash,
            name: payload.ownerName,
            role: 'RESTAURANT',
            restaurantSubRole: 'OWNER',
            approved: false,
          },
        },
      },
    });

    if (
      payload.initialUserName?.trim() &&
      payload.initialUserEmail?.trim() &&
      payload.initialUserRole
    ) {
      const { sub, team } = teamRoleToSubRole(payload.initialUserRole);
      const initialPw = payload.initialUserPassword?.trim() || 'changeme123';
      await this.prisma.user.create({
        data: {
          email: payload.initialUserEmail.trim().toLowerCase(),
          passwordHash: await this.hashPassword(initialPw),
          name: payload.initialUserName.trim(),
          role: 'RESTAURANT',
          restaurantId: restaurant.id,
          restaurantSubRole: sub,
          teamRole: team,
          approved: false,
        },
      });
    }

    return {
      id: restaurant.id,
      ownerName: payload.ownerName,
      ownerEmail: payload.ownerEmail,
      ownerPassword: '',
      restaurantName: payload.restaurantName,
      city: payload.city,
      status: 'PENDING',
      initialUserName: payload.initialUserName,
      initialUserEmail: payload.initialUserEmail,
      initialUserRole: payload.initialUserRole,
    };
  }

  async approveRequest(id: number) {
    const restaurant = await this.prisma.restaurant.findUnique({ where: { id } });
    if (!restaurant) {
      throw new NotFoundException(`Request ${id} not found`);
    }
    await this.prisma.restaurant.update({
      where: { id },
      data: { status: 'APPROVED' },
    });
    await this.prisma.user.updateMany({
      where: { restaurantId: id },
      data: { approved: true },
    });
    const list = await this.getRequests();
    const row = list.find((r) => r.id === id);
    if (!row) {
      throw new NotFoundException(`Request ${id} not found after approve`);
    }
    return row;
  }

  async getMenuItems(restaurantId: number): Promise<MenuItem[]> {
    const items = await this.prisma.menuItem.findMany({
      where: { restaurantId },
      orderBy: { id: 'asc' },
    });
    return items.map((item) => ({
      id: item.id,
      restaurantId: item.restaurantId,
      name: item.name,
      category: item.category,
      price: item.price,
      available: item.available,
    }));
  }

  async addMenuItem(
    restaurantId: number,
    payload: Omit<MenuItem, 'id' | 'restaurantId' | 'available'>,
  ) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });
    if (!restaurant || restaurant.status !== 'APPROVED') {
      throw new BadRequestException('Restaurant is pending approval by admin');
    }
    const item = await this.prisma.menuItem.create({
      data: {
        restaurantId,
        name: payload.name,
        category: payload.category,
        price: payload.price,
        available: true,
      },
    });
    return {
      id: item.id,
      restaurantId: item.restaurantId,
      name: item.name,
      category: item.category,
      price: item.price,
      available: item.available,
    };
  }

  async getRestaurantUsers(restaurantId: number): Promise<RestaurantUser[]> {
    const users = await this.prisma.user.findMany({
      where: {
        restaurantId,
        role: 'RESTAURANT',
        restaurantSubRole: { not: 'OWNER' },
      },
      orderBy: { id: 'asc' },
    });
    return users.map((u) => ({
      id: u.id,
      restaurantId: u.restaurantId!,
      name: u.name,
      email: u.email,
      role: (u.teamRole ?? 'MANAGER') as 'MANAGER' | 'STAFF' | 'CASHIER',
      approved: u.approved,
    }));
  }

  async addRestaurantUser(
    restaurantId: number,
    payload: {
      name: string;
      email: string;
      role: 'MANAGER' | 'STAFF' | 'CASHIER';
      password: string;
    },
  ) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });
    if (!restaurant || restaurant.status !== 'APPROVED') {
      throw new BadRequestException('Restaurant is pending approval by admin');
    }
    const { sub, team } = teamRoleToSubRole(payload.role);
    const created = await this.prisma.user.create({
      data: {
        email: payload.email.trim().toLowerCase(),
        passwordHash: await this.hashPassword(payload.password),
        name: payload.name,
        role: 'RESTAURANT',
        restaurantId,
        restaurantSubRole: sub,
        teamRole: team,
        approved: true,
      },
    });
    return {
      id: created.id,
      restaurantId: created.restaurantId!,
      name: created.name,
      email: created.email,
      role: payload.role,
      approved: created.approved,
    };
  }

  async login(payload: LoginPayload) {
    const normalizedEmail = payload.email.trim().toLowerCase();
    const normalizedPassword = payload.password.trim();

    const roleFilter: UserRole =
      payload.role === 'CUSTOMER'
        ? 'CUSTOMER'
        : payload.role === 'ADMIN'
          ? 'ADMIN'
          : 'RESTAURANT';

    const user = await this.prisma.user.findFirst({
      where: { email: normalizedEmail, role: roleFilter },
    });

    const passwordOk =
      Boolean(user) && (await bcrypt.compare(normalizedPassword, user!.passwordHash));

    const isAdminFallbackLogin =
      payload.role === 'ADMIN' &&
      (normalizedEmail === 'admin@mdrifatul.info' ||
        normalizedEmail === 'admin@marsjrllc.com') &&
      (normalizedPassword === '123456' || normalizedPassword === 'default-admin-pass');

    if (!passwordOk && !isAdminFallbackLogin) {
      throw new UnauthorizedException('Invalid email, password, or role');
    }

    if (passwordOk && user) {
      if (user.role === 'RESTAURANT' && !user.approved) {
        throw new UnauthorizedException('Restaurant account is pending admin approval');
      }
      const fakeToken = `token-${user.role.toLowerCase()}-${Date.now()}`;
      const baseUser = {
        role: user.role as 'CUSTOMER' | 'ADMIN' | 'RESTAURANT',
        email: user.email,
        name: user.name,
      };
      if (user.role === 'RESTAURANT') {
        const sub = user.restaurantSubRole ?? 'MANAGER';
        return {
          token: fakeToken,
          user: {
            ...baseUser,
            tenantId: user.restaurantId!,
            restaurantSubRole: sub as RestaurantSubRoleDto,
          },
        };
      }
      return { token: fakeToken, user: baseUser };
    }

    const admin = await this.prisma.user.findFirst({
      where: { role: 'ADMIN' },
      orderBy: { id: 'asc' },
    });
    const fakeToken = `token-admin-${Date.now()}`;
    return {
      token: fakeToken,
      user: {
        role: 'ADMIN' as const,
        email: admin?.email ?? 'admin@mdrifatul.info',
        name: admin?.name ?? 'Platform Admin',
      },
    };
  }

  async getRestaurantPublicProfile(restaurantId: number) {
    const r = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });
    if (!r || r.status !== 'APPROVED') {
      throw new NotFoundException('Restaurant not available');
    }
    return { id: r.id, name: r.name, city: r.city };
  }

  async createGuestOrder(
    restaurantId: number,
    dto: {
      tableCode: string;
      customerPhone?: string;
      customerEmail?: string;
      items: { menuItemId: number; qty: number; note?: string }[];
    },
  ) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });
    if (!restaurant || restaurant.status !== 'APPROVED') {
      throw new BadRequestException('Restaurant is not accepting orders');
    }
    if (!dto.items.length) {
      throw new BadRequestException('Order must include at least one item');
    }
    const tableCode = dto.tableCode.trim();
    if (!tableCode) {
      throw new BadRequestException('Table code is required (from QR)');
    }

    const menuIds = [...new Set(dto.items.map((i) => i.menuItemId))];
    const menuItems = await this.prisma.menuItem.findMany({
      where: { restaurantId, id: { in: menuIds }, available: true },
    });
    if (menuItems.length !== menuIds.length) {
      throw new BadRequestException('One or more menu items are invalid or unavailable');
    }

    const phone = dto.customerPhone?.trim() || null;
    const email = dto.customerEmail?.trim().toLowerCase() || null;

    const order = await this.prisma.$transaction(async (tx) => {
      const o = await tx.guestOrder.create({
        data: {
          restaurantId,
          tableCode,
          customerPhone: phone,
          customerEmail: email,
          status: 'PENDING',
          lines: {
            create: dto.items.map((line) => {
              const mi = menuItems.find((m) => m.id === line.menuItemId)!;
              const qty = Math.max(1, Math.floor(line.qty));
              return {
                menuItemId: line.menuItemId,
                qty,
                unitPrice: mi.price,
                note: line.note?.trim() || null,
              };
            }),
          },
        },
        include: {
          lines: { include: { menuItem: true } },
        },
      });
      return o;
    });

    return this.formatGuestOrder(order);
  }

  async listGuestOrders(restaurantId: number) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });
    if (!restaurant) {
      throw new NotFoundException(`Restaurant ${restaurantId} not found`);
    }

    const orders = await this.prisma.guestOrder.findMany({
      where: { restaurantId },
      orderBy: { createdAt: 'desc' },
      include: {
        lines: { include: { menuItem: true } },
      },
      take: 100,
    });

    return orders.map((o) => this.formatGuestOrder(o));
  }

  private formatGuestOrder(order: {
    id: number;
    restaurantId: number;
    tableCode: string;
    customerPhone: string | null;
    customerEmail: string | null;
    status: string;
    createdAt: Date;
    lines: Array<{
      id: number;
      qty: number;
      unitPrice: number;
      note: string | null;
      menuItem: { name: string; category: string };
    }>;
  }) {
    const subtotal = order.lines.reduce((s, l) => s + l.unitPrice * l.qty, 0);
    return {
      id: order.id,
      restaurantId: order.restaurantId,
      tableCode: order.tableCode,
      customerPhone: order.customerPhone,
      customerEmail: order.customerEmail,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
      total: Math.round(subtotal * 100) / 100,
      lines: order.lines.map((l) => ({
        id: l.id,
        name: l.menuItem.name,
        category: l.menuItem.category,
        qty: l.qty,
        unitPrice: l.unitPrice,
        note: l.note,
      })),
    };
  }
}
