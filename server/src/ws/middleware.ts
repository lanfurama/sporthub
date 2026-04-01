import '../types/socket';
import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

interface JwtPayload {
  id: string;
  role: string;
  name: string;
}

export function authenticateSocket(socket: Socket, next: (err?: Error) => void) {
  const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    socket.user = payload;
    next();
  } catch (err) {
    next(new Error('Authentication error: Invalid token'));
  }
}
