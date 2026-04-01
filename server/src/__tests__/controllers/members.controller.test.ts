import { Request, Response, NextFunction } from 'express';
import { listMembers, getMember, createMember, addCredit } from '../../controllers/members.controller';
import { testHelpers } from '../helpers';
import { MembershipStatus, MembershipPlan, UserRole } from '@prisma/client';
import { AppError } from '../../middleware/error.middleware';

describe('Members Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = testHelpers.mockRequest();
    res = testHelpers.mockResponse();
    next = testHelpers.mockNext();
  });

  describe('listMembers', () => {
    it('should return all members', async () => {
      await testHelpers.createMember();
      await testHelpers.createMember();

      req.query = {};
      await listMembers(req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.any(Array),
        })
      );
    });

    it('should filter by plan', async () => {
      await testHelpers.createMember();
      const { membership } = await testHelpers.createMember();
      await testHelpers.createMember();

      req.query = { plan: membership.plan };
      await listMembers(req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.any(Array),
        })
      );
    });
  });

  describe('getMember', () => {
    it('should return member by id', async () => {
      const { user, membership } = await testHelpers.createMember();

      req.user = { id: user.id } as any;
      req.params = { id: user.id };

      await getMember(req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            id: user.id,
            plan: membership.plan,
          }),
        })
      );
    });

    it('should return 403 if user tries to access other member', async () => {
      const { user: member1 } = await testHelpers.createMember();
      const { user: member2 } = await testHelpers.createMember();

      req.user = { id: member1.id } as any;
      req.params = { id: member2.id };

      await getMember(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
  });

  describe('createMember', () => {
    it('should create a new member', async () => {
      req.body = {
        name: 'New Member',
        phone: '0987654321',
        email: 'newmember@example.com',
        plan: 'basic',
      };

      await createMember(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            name: 'New Member',
            role: UserRole.member,
          }),
        })
      );
    });
  });

  describe('addCredit', () => {
    it('should add credit to member', async () => {
      const { user, membership } = await testHelpers.createMember();

      req.params = { id: user.id };
      req.body = { amount: 10000, reason: 'Test credit' };

      await addCredit(req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            newBalance: membership.creditBalance + 10000,
          }),
        })
      );
    });

    it('should return 404 if membership not found', async () => {
      const user = await testHelpers.createUser();

      req.params = { id: user.id };
      req.body = { amount: 10000 };

      await addCredit(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
  });
});
