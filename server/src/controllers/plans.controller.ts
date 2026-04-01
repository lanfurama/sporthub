import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

export async function listPlans(req: Request, res: Response, next: NextFunction) {
  try {
    const plans = await prisma.membershipPlanConfig.findMany({ orderBy: { priceVnd: 'asc' } });
    res.json({ success: true, data: plans });
  } catch (err) {
    next(err);
  }
}
