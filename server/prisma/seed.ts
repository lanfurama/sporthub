import dotenv from 'dotenv';
import { getDatabaseUrl } from '../src/config/database';

// Load environment variables
dotenv.config();

// Set DATABASE_URL if not already set
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = getDatabaseUrl();
}

import { PrismaClient, UserRole, MembershipPlan, MembershipStatus, SportType, CourtStatus, ProductStatus, BookingStatus, BookingSource, OrderStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Membership Plans
  console.log('📦 Creating membership plans...');
  await prisma.membershipPlanConfig.upsert({
    where: { id: MembershipPlan.basic },
    update: {},
    create: {
      id: MembershipPlan.basic,
      displayName: 'Basic',
      priceVnd: 500000,
      durationDays: 30,
      courtDiscountPct: 10,
      shopDiscountPct: 5,
      creditPerCycle: 0,
      guestPasses: 0,
      priorityBooking: false,
    },
  });

  await prisma.membershipPlanConfig.upsert({
    where: { id: MembershipPlan.prime },
    update: {},
    create: {
      id: MembershipPlan.prime,
      displayName: 'Prime',
      priceVnd: 1200000,
      durationDays: 30,
      courtDiscountPct: 20,
      shopDiscountPct: 10,
      creditPerCycle: 100000,
      guestPasses: 2,
      priorityBooking: false,
    },
  });

  await prisma.membershipPlanConfig.upsert({
    where: { id: MembershipPlan.vip },
    update: {},
    create: {
      id: MembershipPlan.vip,
      displayName: 'VIP',
      priceVnd: 2500000,
      durationDays: 30,
      courtDiscountPct: 35,
      shopDiscountPct: 20,
      creditPerCycle: 300000,
      guestPasses: 5,
      priorityBooking: true,
    },
  });

  // 2. Users
  console.log('👥 Creating users...');
  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@sporthub.vn' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@sporthub.vn',
      phone: '0901234567',
      passwordHash,
      role: UserRole.admin,
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: 'staff@sporthub.vn' },
    update: {},
    create: {
      name: 'Staff User',
      email: 'staff@sporthub.vn',
      phone: '0901234568',
      passwordHash,
      role: UserRole.staff,
    },
  });

  const member1 = await prisma.user.upsert({
    where: { email: 'member1@example.com' },
    update: {},
    create: {
      name: 'Nguyễn Văn A',
      email: 'member1@example.com',
      phone: '0901234569',
      passwordHash,
      role: UserRole.member,
    },
  });

  const member2 = await prisma.user.upsert({
    where: { email: 'member2@example.com' },
    update: {},
    create: {
      name: 'Trần Thị B',
      email: 'member2@example.com',
      phone: '0901234570',
      passwordHash,
      role: UserRole.member,
    },
  });

  const guest = await prisma.user.upsert({
    where: { email: 'guest@example.com' },
    update: {},
    create: {
      name: 'Khách Vãng Lai',
      email: 'guest@example.com',
      phone: '0901234571',
      role: UserRole.guest,
    },
  });

  // 3. Memberships
  console.log('💳 Creating memberships...');
  const planPrime = await prisma.membershipPlanConfig.findUnique({ where: { id: MembershipPlan.prime } });
  const planVip = await prisma.membershipPlanConfig.findUnique({ where: { id: MembershipPlan.vip } });

  const existingMembership1 = await prisma.membership.findFirst({ where: { userId: member1.id } });
  if (!existingMembership1) {
    await prisma.membership.create({
      data: {
        userId: member1.id,
        plan: MembershipPlan.prime,
        status: MembershipStatus.active,
        startedAt: new Date(),
        expiresAt: new Date(Date.now() + (planPrime?.durationDays || 30) * 24 * 60 * 60 * 1000),
        creditBalance: planPrime?.creditPerCycle || 0,
        guestPasses: planPrime?.guestPasses || 0,
      },
    });
  }

  const existingMembership2 = await prisma.membership.findFirst({ where: { userId: member2.id } });
  if (!existingMembership2) {
    await prisma.membership.create({
      data: {
        userId: member2.id,
        plan: MembershipPlan.vip,
        status: MembershipStatus.active,
        startedAt: new Date(),
        expiresAt: new Date(Date.now() + (planVip?.durationDays || 30) * 24 * 60 * 60 * 1000),
        creditBalance: planVip?.creditPerCycle || 0,
        guestPasses: planVip?.guestPasses || 0,
      },
    });
  }

  // 4. Courts
  console.log('🏸 Creating courts...');
  const courts = [
    { name: 'Sân Tennis 1', sport: SportType.Tennis, surface: 'Cứng', isIndoor: false, priceNormal: 200000, pricePeak: 300000, status: CourtStatus.active },
    { name: 'Sân Tennis 2', sport: SportType.Tennis, surface: 'Cỏ', isIndoor: false, priceNormal: 250000, pricePeak: 350000, status: CourtStatus.active },
    { name: 'Sân Pickleball 1', sport: SportType.Pickleball, surface: 'Cứng', isIndoor: true, priceNormal: 150000, pricePeak: 200000, status: CourtStatus.active },
    { name: 'Sân Badminton 1', sport: SportType.Badminton, surface: 'Synthetic', isIndoor: true, priceNormal: 100000, pricePeak: 150000, status: CourtStatus.active },
    { name: 'Sân Tennis 3 (Bảo trì)', sport: SportType.Tennis, surface: 'Cứng', isIndoor: false, priceNormal: 200000, pricePeak: 300000, status: CourtStatus.maintenance },
  ];

  for (const courtData of courts) {
    const existing = await prisma.court.findFirst({ where: { name: courtData.name } });
    if (!existing) {
      await prisma.court.create({
        data: {
          ...courtData,
          peakStart: '17:00',
          peakEnd: '21:00',
        },
      });
    }
  }

  const court1 = await prisma.court.findFirst({ where: { name: 'Sân Tennis 1' } });
  const court2 = await prisma.court.findFirst({ where: { name: 'Sân Tennis 2' } });
  const court3 = await prisma.court.findFirst({ where: { name: 'Sân Pickleball 1' } });

  // 5. Products
  console.log('🛍️ Creating products...');
  const products = [
    { name: 'Vợt Tennis Wilson Pro Staff', category: 'Vợt', price: 2500000, stock: 10, isService: false },
    { name: 'Vợt Pickleball Paddletek', category: 'Vợt', price: 1500000, stock: 5, isService: false },
    { name: 'Thuê Vợt Tennis', category: 'Dịch vụ', price: 50000, stock: 0, isService: true },
    { name: 'Bóng Tennis Wilson (Hộp 3 quả)', category: 'Bóng', price: 150000, stock: 20, isService: false },
    { name: 'Túi Đựng Vợt', category: 'Phụ kiện', price: 300000, stock: 15, isService: false },
  ];

  for (const productData of products) {
    const existing = await prisma.product.findFirst({ where: { name: productData.name } });
    if (!existing) {
      await prisma.product.create({
        data: {
          ...productData,
          status: ProductStatus.active,
        },
      });
    }
  }

  const product1 = await prisma.product.findFirst({ where: { name: 'Vợt Tennis Wilson Pro Staff' } });
  const product2 = await prisma.product.findFirst({ where: { name: 'Vợt Pickleball Paddletek' } });
  const product4 = await prisma.product.findFirst({ where: { name: 'Bóng Tennis Wilson (Hộp 3 quả)' } });

  // 6. Bookings
  console.log('📅 Creating bookings...');
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const membership1 = await prisma.membership.findFirst({ where: { userId: member1.id } });
  const membership2 = await prisma.membership.findFirst({ where: { userId: member2.id } });

  await prisma.booking.createMany({
    data: [
      {
        ref: 'SH' + Math.floor(100000 + Math.random() * 900000).toString(),
        courtId: court1!.id,
        customerId: member1.id,
        membershipId: membership1?.id,
        customerName: member1.name,
        customerPhone: member1.phone || '0901234569',
        bookingDate: today,
        startTime: '10:00',
        durationHours: 1,
        basePrice: 200000,
        discountAmount: 40000, // 20% discount for Prime member
        creditUsed: 0,
        finalPrice: 160000,
        status: BookingStatus.confirmed,
        source: BookingSource.online,
      },
      {
        ref: 'SH' + Math.floor(100000 + Math.random() * 900000).toString(),
        courtId: court2!.id,
        customerId: member2.id,
        membershipId: membership2?.id,
        customerName: member2.name,
        customerPhone: member2.phone || '0901234570',
        bookingDate: today,
        startTime: '14:00',
        durationHours: 2,
        basePrice: 500000,
        discountAmount: 175000, // 35% discount for VIP member
        creditUsed: 0,
        finalPrice: 325000,
        status: BookingStatus.confirmed,
        source: BookingSource.online,
      },
      {
        ref: 'SH' + Math.floor(100000 + Math.random() * 900000).toString(),
        courtId: court3!.id,
        customerId: guest.id,
        customerName: guest.name,
        customerPhone: guest.phone || '0901234571',
        bookingDate: tomorrow,
        startTime: '18:00',
        durationHours: 1,
        basePrice: 200000,
        discountAmount: 0,
        creditUsed: 0,
        finalPrice: 200000,
        status: BookingStatus.pending,
        source: BookingSource.online,
      },
    ],
    skipDuplicates: true,
  });

  // 7. Orders
  console.log('🧾 Creating orders...');
  const order1Data = {
    customerId: member1.id,
    membershipId: membership1?.id,
    subtotal: 2650000,
    discountAmount: 132500, // 5% shop discount for Prime
    creditUsed: 0,
    total: 2517500,
    payMethod: 'vnpay',
    status: OrderStatus.paid,
  };

  const existingOrder1 = await prisma.order.findFirst({ where: { customerId: member1.id } });
  if (!existingOrder1) {
    await prisma.order.create({
      data: {
        ...order1Data,
        items: {
          create: [
            {
              productId: product1!.id,
              quantity: 1,
              unitPrice: 2500000,
              subtotal: 2500000,
            },
            {
              productId: product4!.id,
              quantity: 1,
              unitPrice: 150000,
              subtotal: 150000,
            },
          ],
        },
      },
    });
  }

  const existingOrder2 = await prisma.order.findFirst({ where: { customerId: member2.id } });
  if (!existingOrder2) {
    await prisma.order.create({
      data: {
        customerId: member2.id,
        membershipId: membership2?.id,
        subtotal: 1500000,
        discountAmount: 300000, // 20% shop discount for VIP
        creditUsed: 0,
        total: 1200000,
        payMethod: 'momo',
        status: OrderStatus.paid,
        items: {
          create: [
            {
              productId: product2!.id,
              quantity: 1,
              unitPrice: 1500000,
              subtotal: 1500000,
            },
          ],
        },
      },
    });
  }

  console.log('✅ Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Membership Plans: 3`);
  console.log(`   - Users: 5 (1 admin, 1 staff, 2 members, 1 guest)`);
  console.log(`   - Memberships: 2`);
  console.log(`   - Courts: 5`);
  console.log(`   - Products: 5`);
  console.log(`   - Bookings: 3`);
  console.log(`   - Orders: 2`);
  console.log('\n🔑 Test Credentials:');
  console.log('   Admin: admin@sporthub.vn / password123');
  console.log('   Staff: staff@sporthub.vn / password123');
  console.log('   Member 1: member1@example.com / password123');
  console.log('   Member 2: member2@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
