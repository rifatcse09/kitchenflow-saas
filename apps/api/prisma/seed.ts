import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const rounds = 10;
async function hash(plain: string) {
  return bcrypt.hash(plain.trim(), rounds);
}

async function main() {
  await prisma.menuItem.deleteMany();
  await prisma.user.deleteMany();
  await prisma.restaurant.deleteMany();

  await prisma.user.create({
    data: {
      email: 'admin@mdrifatul.info',
      passwordHash: await hash('123456'),
      name: 'Rifat Owner',
      role: 'ADMIN',
      approved: true,
    },
  });

  await prisma.user.create({
    data: {
      email: 'customer@demo.com',
      passwordHash: await hash('customer123'),
      name: 'Guest Customer',
      role: 'CUSTOMER',
      approved: true,
    },
  });

  const approved = await prisma.restaurant.create({
    data: {
      name: 'Smokey House BBQ',
      city: 'Dallas, TX',
      status: 'APPROVED',
    },
  });

  await prisma.menuItem.createMany({
    data: [
      {
        restaurantId: approved.id,
        name: 'Ribeye Steak',
        category: 'Steaks',
        price: 29,
        available: true,
      },
      {
        restaurantId: approved.id,
        name: 'House Salad',
        category: 'Appetizers',
        price: 6,
        available: true,
      },
    ],
  });

  await prisma.user.create({
    data: {
      email: 'john@smokeyhouse.com',
      passwordHash: await hash('owner123'),
      name: 'John Carter',
      role: 'RESTAURANT',
      restaurantId: approved.id,
      restaurantSubRole: 'OWNER',
      approved: true,
    },
  });

  await prisma.user.create({
    data: {
      email: 'manager@bbq.com',
      passwordHash: await hash('manager123'),
      name: 'Kitchen Manager',
      role: 'RESTAURANT',
      restaurantId: approved.id,
      restaurantSubRole: 'MANAGER',
      teamRole: 'MANAGER',
      approved: true,
    },
  });

  await prisma.user.create({
    data: {
      email: 'kds@bbq.com',
      passwordHash: await hash('kds123'),
      name: 'Line Cook (KDS)',
      role: 'RESTAURANT',
      restaurantId: approved.id,
      restaurantSubRole: 'KITCHEN',
      teamRole: 'STAFF',
      approved: true,
    },
  });

  const pending1 = await prisma.restaurant.create({
    data: {
      name: 'Taco Rush Truck',
      city: 'Austin, TX',
      status: 'PENDING',
    },
  });

  await prisma.user.create({
    data: {
      email: 'ava@tacorush.com',
      passwordHash: await hash('owner123'),
      name: 'Ava Smith',
      role: 'RESTAURANT',
      restaurantId: pending1.id,
      restaurantSubRole: 'OWNER',
      approved: false,
    },
  });

  const pending2 = await prisma.restaurant.create({
    data: {
      name: 'Grill & Co Pop-up',
      city: 'Houston, TX',
      status: 'PENDING',
    },
  });

  await prisma.user.create({
    data: {
      email: 'pending@grillco.com',
      passwordHash: await hash('owner123'),
      name: 'Jordan Lee',
      role: 'RESTAURANT',
      restaurantId: pending2.id,
      restaurantSubRole: 'OWNER',
      approved: false,
    },
  });

  console.log(
    `Seed complete. Approved demo tenant id=${approved.id} (owner / manager / kds + menu). Pending onboarding: ${pending1.id}, ${pending2.id}.`,
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
