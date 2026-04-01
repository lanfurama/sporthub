import { Request, Response, NextFunction } from 'express';
import { listCourts, getCourt, createCourt, updateCourt, deleteCourt, getCourtAvailability } from '../../controllers/courts.controller';
import { testHelpers } from '../helpers';
import { CourtStatus, SportType } from '@prisma/client';
import { AppError } from '../../middleware/error.middleware';

describe('Courts Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = testHelpers.mockRequest();
    res = testHelpers.mockResponse();
    next = testHelpers.mockNext();
  });

  describe('listCourts', () => {
    it('should return all active courts', async () => {
      await testHelpers.createCourt({ name: 'Court 1' });
      await testHelpers.createCourt({ name: 'Court 2' });
      await testHelpers.createCourt({ name: 'Court 3', status: CourtStatus.inactive });

      req.query = { status: 'active' };
      await listCourts(req as Request, res as Response, next);

      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.arrayContaining([
            expect.objectContaining({ name: 'Court 1' }),
            expect.objectContaining({ name: 'Court 2' }),
          ]),
        })
      );
    });

    it('should filter by sport', async () => {
      await testHelpers.createCourt({ sport: SportType.Tennis });
      await testHelpers.createCourt({ sport: SportType.Badminton });

      req.query = { sport: 'Tennis' };
      await listCourts(req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.arrayContaining([
            expect.objectContaining({ sport: SportType.Tennis }),
          ]),
        })
      );
    });

    it('should filter by indoor', async () => {
      await testHelpers.createCourt({ isIndoor: true });
      await testHelpers.createCourt({ isIndoor: false });

      req.query = { indoor: 'true' };
      await listCourts(req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.arrayContaining([
            expect.objectContaining({ isIndoor: true }),
          ]),
        })
      );
    });
  });

  describe('getCourt', () => {
    it('should return court by id', async () => {
      const court = await testHelpers.createCourt({ name: 'Test Court' });

      req.params = { id: court.id.toString() };
      await getCourt(req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ id: court.id, name: 'Test Court' }),
        })
      );
    });

    it('should return 404 if court not found', async () => {
      req.params = { id: '99999' };
      await getCourt(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
  });

  describe('createCourt', () => {
    it('should create a new court', async () => {
      req.body = {
        name: 'New Court',
        sport: 'Tennis',
        priceNormal: 100000,
        pricePeak: 150000,
      };

      await createCourt(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ name: 'New Court' }),
        })
      );
    });

    it('should validate required fields', async () => {
      req.body = { name: 'Invalid Court' };
      await createCourt(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('updateCourt', () => {
    it('should update court', async () => {
      const court = await testHelpers.createCourt();
      req.params = { id: court.id.toString() };
      req.body = { name: 'Updated Court' };

      await updateCourt(req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ name: 'Updated Court' }),
        })
      );
    });
  });

  describe('deleteCourt', () => {
    it('should set court status to inactive', async () => {
      const court = await testHelpers.createCourt();
      req.params = { id: court.id.toString() };

      await deleteCourt(req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Sân đã bị xóa',
        })
      );
    });
  });

  describe('getCourtAvailability', () => {
    it('should return available slots', async () => {
      const court = await testHelpers.createCourt();
      req.params = { id: court.id.toString() };
      req.query = { date: new Date().toISOString().split('T')[0] };

      await getCourtAvailability(req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            courtId: court.id,
            slots: expect.any(Array),
          }),
        })
      );
    });

    it('should return 400 if date is missing', async () => {
      const court = await testHelpers.createCourt();
      req.params = { id: court.id.toString() };
      req.query = {};

      await getCourtAvailability(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
  });
});
