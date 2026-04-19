import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const rounds = 10;
async function hash(plain: string) {
  return bcrypt.hash(plain.trim(), rounds);
}

function trialEndsTwoMonthsFromNow() {
  const d = new Date();
  d.setMonth(d.getMonth() + 2);
  return d;
}

/** Seeds the `Subscription` catalog (API + admin UI). IDs 1–3 match migration defaults. */
async function seedSubscriptionCatalog() {
  const free = await prisma.subscription.create({
    data: {
      id: 1,
      slug: 'free-trial',
      name: 'Free trial',
      description: '2 months and 10 guest orders.',
      active: true,
      sortOrder: 0,
      enforcement: 'TRIAL_TIME_AND_ORDERS',
      trialDurationMonths: 2,
      guestOrderTrialCap: 10,
      paidWindowMonths: 2,
      renewalPeriodMonths: null,
      guestOrderPaidBudget: 10,
      priceCents: 0,
    },
  });
  const monthly = await prisma.subscription.create({
    data: {
      id: 2,
      slug: 'pro-monthly',
      name: 'Pro · monthly',
      description: 'Paid tier with monthly renewal (demo).',
      active: true,
      sortOrder: 1,
      enforcement: 'PRO_UNLIMITED',
      trialDurationMonths: 2,
      guestOrderTrialCap: 10,
      paidWindowMonths: 120,
      renewalPeriodMonths: 1,
      guestOrderPaidBudget: 999_999,
      priceCents: 9_900,
    },
  });
  const yearly = await prisma.subscription.create({
    data: {
      id: 3,
      slug: 'pro-yearly',
      name: 'Pro · yearly',
      description: 'Paid tier with yearly renewal (demo).',
      active: true,
      sortOrder: 2,
      enforcement: 'PRO_UNLIMITED',
      trialDurationMonths: 2,
      guestOrderTrialCap: 10,
      paidWindowMonths: 120,
      renewalPeriodMonths: 12,
      guestOrderPaidBudget: 999_999,
      priceCents: 99_900,
    },
  });

  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"Subscription"','id'), (SELECT COALESCE(MAX("id"), 1) FROM "Subscription"))`,
  );

  console.log(
    `Seeded subscriptions: id=${free.id} ${free.slug} (${free.priceCents ?? 0}¢), id=${monthly.id} ${monthly.slug} (${monthly.priceCents ?? 0}¢), id=${yearly.id} ${yearly.slug} (${yearly.priceCents ?? 0}¢).`,
  );

  return { free, monthly, yearly };
}

async function main() {
  await prisma.guestOrder.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.user.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.subscription.deleteMany();

  // Keep demo tenant id stable at `1` after re-seed (PostgreSQL serials otherwise keep incrementing).
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"Restaurant"','id'), 1, false)`,
  );
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"User"','id'), 1, false)`,
  );
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"MenuItem"','id'), 1, false)`,
  );

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

  const subs = await seedSubscriptionCatalog();

  const approved = await prisma.restaurant.create({
    data: {
      name: 'Smokey House BBQ',
      city: 'Dallas, TX',
      status: 'APPROVED',
      subscriptionId: subs.monthly.id,
      trialEndsAt: trialEndsTwoMonthsFromNow(),
      trialOrdersRemaining: 999_999,
      proRenewsAt: (() => {
        const d = new Date();
        d.setMonth(d.getMonth() + 1);
        return d;
      })(),
    },
  });

  const smokeyMenu: Array<{
    name: string;
    category: string;
    price: number;
    available?: boolean;
  }> = [
    // Starters & salads
    { name: 'Texas Caviar Dip', category: 'Starters', price: 9.5 },
    { name: 'Fried Pickle Chips', category: 'Starters', price: 8 },
    { name: 'Smoked Wings (6)', category: 'Starters', price: 14 },
    { name: 'Loaded Nachos', category: 'Starters', price: 13 },
    { name: 'Caesar Salad', category: 'Salads', price: 10 },
    { name: 'Garden Salad', category: 'Salads', price: 8 },
    { name: 'Chopped BBQ Salad', category: 'Salads', price: 14 },

    // Pit BBQ: plates
    { name: 'Brisket Plate (½ lb)', category: 'Pit BBQ', price: 22 },
    { name: 'Pulled Pork Plate', category: 'Pit BBQ', price: 17 },
    { name: 'St. Louis Ribs (half rack)', category: 'Pit BBQ', price: 21 },
    { name: 'St. Louis Ribs (full rack)', category: 'Pit BBQ', price: 38 },
    { name: 'Smoked Turkey Breast', category: 'Pit BBQ', price: 18 },
    { name: 'Jalapeño Cheddar Sausage', category: 'Pit BBQ', price: 15 },
    { name: 'Two-Meat Combo', category: 'Pit BBQ', price: 24 },
    { name: 'Three-Meat Combo', category: 'Pit BBQ', price: 29 },
    { name: 'Burnt Ends (when available)', category: 'Pit BBQ', price: 26, available: false },

    // Steaks & chops
    { name: 'Ribeye Steak (12 oz)', category: 'Steaks', price: 34 },
    { name: 'Sirloin (10 oz)', category: 'Steaks', price: 26 },
    { name: 'Smoked Pork Chop', category: 'Steaks', price: 22 },

    // Sandwiches (served with one side)
    { name: 'Brisket Sandwich', category: 'Sandwiches', price: 16 },
    { name: 'Pulled Pork Sandwich', category: 'Sandwiches', price: 13 },
    { name: 'Smoked Chicken Sandwich', category: 'Sandwiches', price: 14 },
    { name: 'Chopped Brisket Grilled Cheese', category: 'Sandwiches', price: 15 },

    // Sides
    { name: 'Mac & Cheese', category: 'Sides', price: 5 },
    { name: 'Baked Beans', category: 'Sides', price: 4 },
    { name: 'Creamy Slaw', category: 'Sides', price: 4 },
    { name: 'Potato Salad', category: 'Sides', price: 4 },
    { name: 'Fries', category: 'Sides', price: 5 },
    { name: 'Buttered Corn', category: 'Sides', price: 4 },
    { name: 'Texas Toast', category: 'Sides', price: 3 },

    // Kids
    { name: 'Kids Slider & Fries', category: 'Kids', price: 9 },
    { name: 'Kids Chicken Tenders', category: 'Kids', price: 9 },

    // Desserts
    { name: 'Peach Cobbler', category: 'Desserts', price: 7 },
    { name: 'Banana Pudding', category: 'Desserts', price: 6 },

    // Drinks
    { name: 'Sweet Tea', category: 'Drinks', price: 3.5 },
    { name: 'Unsweet Tea', category: 'Drinks', price: 3.5 },
    { name: 'Fresh Lemonade', category: 'Drinks', price: 4 },
    { name: 'Fountain Soda', category: 'Drinks', price: 3 },
    { name: 'Craft Root Beer', category: 'Drinks', price: 4.5 },
  ];

  await prisma.menuItem.createMany({
    data: smokeyMenu.map((row) => ({
      restaurantId: approved.id,
      name: row.name,
      category: row.category,
      price: row.price,
      available: row.available !== false,
    })),
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
      subscriptionId: subs.free.id,
      trialEndsAt: trialEndsTwoMonthsFromNow(),
      trialOrdersRemaining: 10,
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
      subscriptionId: subs.free.id,
      trialEndsAt: trialEndsTwoMonthsFromNow(),
      trialOrdersRemaining: 10,
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

  const extraSeeds: Array<{
    name: string
    city: string
    status: 'PENDING' | 'APPROVED'
    ownerEmail: string
    ownerName: string
  }> = [
    { name: 'Harbor Sushi Co', city: 'Seattle, WA', status: 'APPROVED', ownerEmail: 'mina@harborsushi.demo', ownerName: 'Mina Okada' },
    { name: 'Naples Woodfire', city: 'Portland, OR', status: 'PENDING', ownerEmail: 'marco@napleswood.demo', ownerName: 'Marco Vitale' },
    { name: 'Midtown Deli & Soup', city: 'Chicago, IL', status: 'APPROVED', ownerEmail: 'sam@midtowndeli.demo', ownerName: 'Sam Rivera' },
    { name: 'Stone Creek Café', city: 'Denver, CO', status: 'PENDING', ownerEmail: 'jules@stonecreek.demo', ownerName: 'Jules Park' },
    { name: 'Rangoon Kitchen', city: 'San Jose, CA', status: 'APPROVED', ownerEmail: 'thida@rangoon.demo', ownerName: 'Thida Aung' },
    { name: 'Skyline Diner 24', city: 'Nashville, TN', status: 'PENDING', ownerEmail: 'chris@skyline.demo', ownerName: 'Chris Boyd' },
  ]

  for (const row of extraSeeds) {
    const r = await prisma.restaurant.create({
      data: {
        name: row.name,
        city: row.city,
        status: row.status,
        subscriptionId: row.status === 'APPROVED' ? subs.yearly.id : subs.free.id,
        trialEndsAt: trialEndsTwoMonthsFromNow(),
        trialOrdersRemaining: row.status === 'APPROVED' ? 999_999 : 10,
        proRenewsAt:
          row.status === 'APPROVED'
            ? (() => {
                const d = new Date();
                d.setMonth(d.getMonth() + 12);
                return d;
              })()
            : null,
      },
    })
    await prisma.user.create({
      data: {
        email: row.ownerEmail,
        passwordHash: await hash('owner123'),
        name: row.ownerName,
        role: 'RESTAURANT',
        restaurantId: r.id,
        restaurantSubRole: 'OWNER',
        approved: row.status === 'APPROVED',
      },
    })
    if (row.status === 'APPROVED') {
      await prisma.menuItem.createMany({
        data: [
          { restaurantId: r.id, name: 'House Salad', category: 'Starters', price: 9 },
          { restaurantId: r.id, name: 'Chef Plate', category: 'Mains', price: 18 },
        ],
      })
    }
  }

  console.log(
    `Seed complete. Subscriptions: free-trial id=${subs.free.id}, pro-monthly id=${subs.monthly.id}, pro-yearly id=${subs.yearly.id}. Approved demo tenant id=${approved.id} (owner / manager / kds + menu). Pending onboarding includes ${pending1.id}, ${pending2.id} + 3 more; extra approved tenants for admin pagination demos.`,
  )
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
