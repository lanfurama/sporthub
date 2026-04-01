import dotenv from 'dotenv';
dotenv.config();

import { getDatabaseUrl } from '../src/config/database';
import { PrismaClient } from '@prisma/client';

// Set DATABASE_URL if not already set
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = getDatabaseUrl();
}

const prisma = new PrismaClient();

async function createEnums() {
  try {
    console.log('Creating enum types...');

    // Check if enum exists, if not create it
    const enums = [
      `CREATE TYPE "CourtStatus" AS ENUM ('active', 'maintenance', 'inactive');`,
      `CREATE TYPE "SportType" AS ENUM ('Tennis', 'Pickleball', 'Badminton');`,
      `CREATE TYPE "BookingStatus" AS ENUM ('pending', 'confirmed', 'rejected', 'cancelled', 'completed');`,
      `CREATE TYPE "BookingSource" AS ENUM ('online', 'admin');`,
      `CREATE TYPE "UserRole" AS ENUM ('guest', 'member', 'staff', 'admin', 'super_admin');`,
      `CREATE TYPE "MembershipPlan" AS ENUM ('basic', 'prime', 'vip');`,
      `CREATE TYPE "MembershipStatus" AS ENUM ('active', 'expired', 'cancelled');`,
      `CREATE TYPE "CreditTxType" AS ENUM ('credit', 'debit');`,
      `CREATE TYPE "OrderStatus" AS ENUM ('pending', 'paid', 'cancelled', 'refunded');`,
      `CREATE TYPE "ProductStatus" AS ENUM ('active', 'inactive');`,
    ];

    for (const sql of enums) {
      try {
        await prisma.$executeRawUnsafe(sql);
        console.log(`✅ Created enum`);
      } catch (err: any) {
        if (err.message?.includes('already exists')) {
          console.log(`⚠️  Enum already exists, skipping`);
        } else {
          console.error(`❌ Error creating enum:`, err.message);
        }
      }
    }

    console.log('\n✅ All enums created successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createEnums();
