import { UserRole, MembershipPlan, MembershipStatus, CourtStatus, SportType } from '@prisma/client';
import { Request } from 'express';
import { prisma } from './setup';

export const testHelpers = {
  async createUser(overrides?: Partial<any>) {
    const role = overrides?.role || UserRole.guest;
    return prisma.user.create({
      data: {
        name: 'Test User',
        phone: '0123456789',
        email: 'test@example.com',
        role: typeof role === 'string' ? (role as any) : role,
        ...overrides,
      },
    });
  },

  async createMember(overrides?: Partial<any>) {
    const user = await this.createUser({ role: UserRole.member });
    const planConfig = await prisma.membershipPlanConfig.findUnique({
      where: { id: MembershipPlan.basic },
    });
    
    const membership = await prisma.membership.create({
      data: {
        userId: user.id,
        plan: (overrides?.plan as MembershipPlan) || MembershipPlan.basic,
        startedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        creditBalance: planConfig?.creditPerCycle || 0,
        guestPasses: planConfig?.guestPasses || 0,
        status: MembershipStatus.active,
        ...overrides,
      },
    });
    
    return { user, membership };
  },

  async createCourt(overrides?: Partial<any>) {
    return prisma.court.create({
      data: {
        name: 'Test Court',
        sport: (overrides?.sport as SportType) || SportType.Tennis,
        priceNormal: 100000,
        pricePeak: 150000,
        status: (overrides?.status as CourtStatus) || CourtStatus.active,
        ...overrides,
      },
    });
  },

  async createBooking(overrides?: Partial<any>) {
    const court = overrides?.courtId 
      ? await prisma.court.findUnique({ where: { id: overrides.courtId } })
      : await this.createCourt();
    
    if (!court) throw new Error('Court not found');
    
    const user = overrides?.customerId
      ? await prisma.user.findUnique({ where: { id: overrides.customerId } })
      : (await this.createMember()).user;
    
    if (!user) throw new Error('User not found');
    
    return prisma.booking.create({
      data: {
        ref: 'SH' + Math.floor(100000 + Math.random() * 900000).toString(),
        courtId: court.id,
        customerId: user.id,
        customerName: user.name,
        customerPhone: user.phone || '0123456789',
        bookingDate: new Date(),
        startTime: '10:00',
        durationHours: 1,
        basePrice: 100000,
        discountAmount: 0,
        creditUsed: 0,
        finalPrice: 100000,
        ...overrides,
      },
    });
  },

  mockRequest(overrides?: Partial<Request>): Partial<Request> {
    return {
      query: {},
      params: {},
      body: {},
      user: undefined,
      ...overrides,
    } as Partial<Request>;
  },

  mockResponse() {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
  },

  mockNext(): jest.Mock {
    return jest.fn();
  },
};
