import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

type RequestStatus = 'PENDING' | 'APPROVED';

export interface RestaurantRequest {
  id: number;
  ownerName: string;
  ownerEmail: string;
  ownerPassword: string;
  restaurantName: string;
  city: string;
  initialUserName?: string;
  initialUserEmail?: string;
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

type UserRole = 'CUSTOMER' | 'RESTAURANT' | 'ADMIN';

/** Tenant-internal RBAC: maps UI access (Owner / Manager / Kitchen KDS). */
export type RestaurantSubRole = 'OWNER' | 'MANAGER' | 'KITCHEN';

interface LoginPayload {
  role: UserRole;
  email: string;
  password: string;
}

type AppUser =
  | { role: 'CUSTOMER'; email: string; password: string; name: string }
  | { role: 'ADMIN'; email: string; password: string; name: string }
  | {
      role: 'RESTAURANT';
      email: string;
      password: string;
      name: string;
      restaurantId: number;
      approved: boolean;
      restaurantSubRole: RestaurantSubRole;
    };

export interface RestaurantUser {
  id: number;
  restaurantId: number;
  name: string;
  email: string;
  role: 'OWNER' | 'MANAGER' | 'STAFF' | 'CASHIER';
  approved: boolean;
}

@Injectable()
export class StoreService {
  private nextRequestId = 1003;
  private nextMenuId = 3;
  private nextRestaurantUserId = 5001;

  private readonly requests: RestaurantRequest[] = [
    {
      id: 1001,
      ownerName: 'John Carter',
      ownerEmail: 'john@smokeyhouse.com',
      ownerPassword: 'owner123',
      restaurantName: 'Smokey House BBQ',
      city: 'Dallas, TX',
      status: 'PENDING',
    },
    {
      id: 1002,
      ownerName: 'Ava Smith',
      ownerEmail: 'ava@tacorush.com',
      ownerPassword: 'owner123',
      restaurantName: 'Taco Rush Truck',
      city: 'Austin, TX',
      status: 'PENDING',
    },
  ];

  private readonly menuItems: MenuItem[] = [
    {
      id: 1,
      restaurantId: 1001,
      name: 'Ribeye Steak',
      category: 'Steaks',
      price: 29,
      available: true,
    },
    {
      id: 2,
      restaurantId: 1001,
      name: 'House Salad',
      category: 'Appetizers',
      price: 6,
      available: true,
    },
  ];

  private users: AppUser[] = [
    {
      role: 'CUSTOMER',
      email: 'customer@demo.com',
      password: 'customer123',
      name: 'Guest Customer',
    },
    {
      role: 'RESTAURANT',
      email: 'john@smokeyhouse.com',
      password: 'owner123',
      name: 'John Carter',
      restaurantId: 1001,
      approved: false,
      restaurantSubRole: 'OWNER',
    },
    {
      role: 'RESTAURANT',
      email: 'manager@bbq.com',
      password: 'manager123',
      name: 'Kitchen Manager',
      restaurantId: 1001,
      approved: true,
      restaurantSubRole: 'MANAGER',
    },
    {
      role: 'RESTAURANT',
      email: 'kds@bbq.com',
      password: 'kds123',
      name: 'Line Cook (KDS)',
      restaurantId: 1001,
      approved: true,
      restaurantSubRole: 'KITCHEN',
    },
    {
      role: 'ADMIN',
      email: 'admin@mdrifatul.info',
      password: '123456',
      name: 'Rifat Owner',
    },
  ];

  private restaurantUsers: RestaurantUser[] = [
    {
      id: 5000,
      restaurantId: 1001,
      name: 'Kitchen Manager',
      email: 'manager@bbq.com',
      role: 'MANAGER',
      approved: true,
    },
  ];

  getDefaultPlatformOwner() {
    return {
      name: 'Rifat Owner',
      email: 'admin@mdrifatul.info',
      passwordHint: '123456',
    };
  }

  getRequests() {
    return this.requests;
  }

  createRequest(payload: Omit<RestaurantRequest, 'id' | 'status'>) {
    const request: RestaurantRequest = {
      id: this.nextRequestId++,
      status: 'PENDING',
      ...payload,
    };
    this.requests.push(request);

    this.users.push({
      role: 'RESTAURANT',
      email: payload.ownerEmail,
      password: payload.ownerPassword,
      name: payload.ownerName,
      restaurantId: request.id,
      approved: false,
      restaurantSubRole: 'OWNER',
    });

    if (payload.initialUserName && payload.initialUserEmail && payload.initialUserRole) {
      this.restaurantUsers.push({
        id: this.nextRestaurantUserId++,
        restaurantId: request.id,
        name: payload.initialUserName,
        email: payload.initialUserEmail,
        role: payload.initialUserRole,
        approved: false,
      });
    }

    return request;
  }

  approveRequest(id: number) {
    const request = this.requests.find((item) => item.id === id);
    if (!request) {
      throw new NotFoundException(`Request ${id} not found`);
    }
    request.status = 'APPROVED';
    this.users = this.users.map((user) => {
      if (user.role !== 'RESTAURANT' || user.restaurantId !== id) {
        return user;
      }
      return { ...user, approved: true };
    }) as AppUser[];
    this.restaurantUsers = this.restaurantUsers.map((user) =>
      user.restaurantId === id ? { ...user, approved: true } : user,
    );
    return request;
  }

  getMenuItems(restaurantId: number) {
    return this.menuItems.filter((item) => item.restaurantId === restaurantId);
  }

  addMenuItem(
    restaurantId: number,
    payload: Omit<MenuItem, 'id' | 'restaurantId' | 'available'>,
  ) {
    const item: MenuItem = {
      id: this.nextMenuId++,
      restaurantId,
      available: true,
      ...payload,
    };
    this.menuItems.push(item);
    return item;
  }

  getRestaurantUsers(restaurantId: number) {
    return this.restaurantUsers.filter((item) => item.restaurantId === restaurantId);
  }

  addRestaurantUser(
    restaurantId: number,
    payload: { name: string; email: string; role: 'MANAGER' | 'STAFF' | 'CASHIER'; password: string },
  ) {
    const request = this.requests.find((item) => item.id === restaurantId);
    if (!request || request.status !== 'APPROVED') {
      throw new BadRequestException('Restaurant is pending approval by admin');
    }

    const user: RestaurantUser = {
      id: this.nextRestaurantUserId++,
      restaurantId,
      name: payload.name,
      email: payload.email,
      role: payload.role,
      approved: true,
    };
    this.restaurantUsers.push(user);
    const subRole: RestaurantSubRole =
      payload.role === 'MANAGER' ? 'MANAGER' : 'KITCHEN';
    this.users.push({
      role: 'RESTAURANT',
      email: payload.email,
      password: payload.password,
      name: payload.name,
      restaurantId,
      approved: true,
      restaurantSubRole: subRole,
    });
    return user;
  }

  login(payload: LoginPayload) {
    const normalizedEmail = payload.email.trim().toLowerCase();
    const normalizedPassword = payload.password.trim();

    const user = this.users.find((item) => {
      if (item.role !== payload.role) return false;
      if (item.email.toLowerCase() !== normalizedEmail) return false;
      if (item.password !== normalizedPassword) return false;
      return true;
    });

    const isAdminFallbackLogin =
      payload.role === 'ADMIN' &&
      (normalizedEmail === 'admin@mdrifatul.info' ||
        normalizedEmail === 'admin@marsjrllc.com') &&
      (normalizedPassword === '123456' || normalizedPassword === 'default-admin-pass');

    if (!user && !isAdminFallbackLogin) {
      throw new UnauthorizedException('Invalid email, password, or role');
    }

    const resolvedUser =
      user ??
      ({
        role: 'ADMIN',
        email: 'admin@mdrifatul.info',
        name: 'Rifat Owner',
      } as const);

    if (resolvedUser.role === 'RESTAURANT' && !resolvedUser.approved) {
      throw new UnauthorizedException('Restaurant account is pending admin approval');
    }

    const fakeToken = `token-${resolvedUser.role.toLowerCase()}-${Date.now()}`;
    const baseUser = {
      role: resolvedUser.role,
      email: resolvedUser.email,
      name: resolvedUser.name,
    };
    if (resolvedUser.role === 'RESTAURANT') {
      return {
        token: fakeToken,
        user: {
          ...baseUser,
          tenantId: resolvedUser.restaurantId,
          restaurantSubRole: resolvedUser.restaurantSubRole,
        },
      };
    }
    return {
      token: fakeToken,
      user: baseUser,
    };
  }
}
