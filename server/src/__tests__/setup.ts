import dotenv from 'dotenv';
import { getDatabaseUrl } from '../config/database';

// Load environment variables
dotenv.config();

// Set DATABASE_URL if not already set
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = getDatabaseUrl();
}

import { PrismaClient, MembershipPlan } from '@prisma/client';

export const prisma = new PrismaClient();

// Ensure membership plans exist
beforeAll(async () => {
  await prisma.$connect();
  
  // Create membership plans if they don't exist
  const plans = [
    { id: MembershipPlan.basic, displayName: 'Basic', priceVnd: 500000, courtDiscountPct: 10, shopDiscountPct: 5, creditPerCycle: 0, guestPasses: 0 },
    { id: MembershipPlan.prime, displayName: 'Prime', priceVnd: 1200000, courtDiscountPct: 20, shopDiscountPct: 10, creditPerCycle: 100000, guestPasses: 2 },
    { id: MembershipPlan.vip, displayName: 'VIP', priceVnd: 2500000, courtDiscountPct: 35, shopDiscountPct: 20, creditPerCycle: 300000, guestPasses: 5 },
  ];
  
  for (const plan of plans) {
    await prisma.membershipPlanConfig.upsert({
      where: { id: plan.id },
      update: {},
      create: plan,
    });
  }
});

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

afterEach(async () => {
  await prisma.$transaction([
    prisma.creditTransaction.deleteMany(),
    prisma.guestPassTransaction.deleteMany(),
    prisma.booking.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.product.deleteMany(),
    prisma.court.deleteMany(),
    prisma.membership.deleteMany(),
    prisma.user.deleteMany(),
  ]);
});
