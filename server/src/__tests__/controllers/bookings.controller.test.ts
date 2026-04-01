import { Request, Response, NextFunction } from 'express';
import { createBooking, listBookings, getBooking, updateBookingStatus, cancelBooking } from '../../controllers/bookings.controller';
import { testHelpers } from '../helpers';
import { AppError } from '../../middleware/error.middleware';

describe('Bookings Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = testHelpers.mockRequest();
    res = testHelpers.mockResponse();
    next = testHelpers.mockNext();
  });

  describe('createBooking', () => {
    it('should create a new booking', async () => {
      const court = await testHelpers.createCourt({ status: 'active' });
      req.body = {
        courtId: court.id,
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        duration: 1,
        customer: {
          name: 'Test Customer',
          phone: '0123456789',
        },
      };

      await createBooking(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            status: expect.any(String),
          }),
        })
      );
    });

    it('should return 404 if court not found', async () => {
      req.body = {
        courtId: 99999,
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        duration: 1,
        customer: {
          name: 'Test Customer',
          phone: '0123456789',
        },
      };

      await createBooking(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });

    it('should return 409 if slot is already booked', async () => {
      const court = await testHelpers.createCourt();
      const date = new Date().toISOString().split('T')[0];
      
      await testHelpers.createBooking({
        courtId: court.id,
        bookingDate: new Date(date),
        startTime: '10:00',
        status: 'confirmed' as any,
      });

      req.body = {
        courtId: court.id,
        date,
        time: '10:00',
        duration: 1,
        customer: {
          name: 'Test Customer',
          phone: '0123456789',
        },
      };

      await createBooking(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
  });

  describe('listBookings', () => {
    it('should return all bookings for admin', async () => {
      const { user } = await testHelpers.createMember();
      const booking = await testHelpers.createBooking({ customerId: user.id });

      req.user = { id: user.id, role: 'admin' } as any;
      req.query = {};

      await listBookings(req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.arrayContaining([
            expect.objectContaining({ id: booking.id }),
          ]),
        })
      );
    });

    it('should filter by status', async () => {
      const { user } = await testHelpers.createMember();
      await testHelpers.createBooking({ customerId: user.id, status: 'confirmed' as any });
      await testHelpers.createBooking({ customerId: user.id, status: 'pending' as any });

      req.user = { id: user.id, role: 'admin' } as any;
      req.query = { status: 'confirmed' };

      await listBookings(req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.arrayContaining([
            expect.objectContaining({ status: 'confirmed' }),
          ]),
        })
      );
    });
  });

  describe('getBooking', () => {
    it('should return booking by id', async () => {
      const { user } = await testHelpers.createMember();
      const booking = await testHelpers.createBooking({ customerId: user.id });

      req.user = { id: user.id } as any;
      req.params = { id: booking.id };

      await getBooking(req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ id: booking.id }),
        })
      );
    });

    it('should return 403 if user tries to access other user booking', async () => {
      const booking = await testHelpers.createBooking();
      const { user: otherUser } = await testHelpers.createMember();

      req.user = { id: otherUser.id } as any;
      req.params = { id: booking.id };

      await getBooking(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
  });

  describe('updateBookingStatus', () => {
    it('should update booking status to confirmed', async () => {
      const booking = await testHelpers.createBooking({ status: 'pending' as any });

      req.params = { id: booking.id };
      req.body = { status: 'confirmed' };

      await updateBookingStatus(req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ status: 'confirmed' }),
        })
      );
    });
  });

  describe('cancelBooking', () => {
    it('should cancel a booking', async () => {
      const { user } = await testHelpers.createMember();
      const booking = await testHelpers.createBooking({
        customerId: user.id,
        status: 'confirmed' as any,
      });

      req.user = { id: user.id } as any;
      req.params = { id: booking.id };

      await cancelBooking(req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            refundType: expect.any(String),
          }),
        })
      );
    });

    it('should return 400 if booking is already cancelled', async () => {
      const booking = await testHelpers.createBooking({ status: 'cancelled' as any });

      req.params = { id: booking.id };
      req.user = { id: 'test-user-id', role: 'admin' } as any;

      await cancelBooking(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
  });
});
