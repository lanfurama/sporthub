import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { authenticateSocket } from './middleware';

let io: SocketIOServer | null = null;

export function initializeWebSocket(server: HTTPServer): SocketIOServer {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
    path: '/ws',
  });

  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    const user = socket.user;
    console.log(`[WebSocket] User connected: ${user?.id} (${user?.role})`);

    if (user?.role === 'admin' || user?.role === 'staff' || user?.role === 'super_admin') {
      socket.join('admin-room');
    }

    socket.on('disconnect', () => {
      console.log(`[WebSocket] User disconnected: ${user?.id}`);
    });
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error('WebSocket server not initialized');
  }
  return io;
}

export function emitBookingCreated(booking: {
  id: string;
  ref: string;
  courtName: string;
  customerName: string;
  date: string;
  time: string;
}) {
  const io = getIO();
  io.to('admin-room').emit('booking.created', booking);
}

export function emitBookingConfirmed(bookingId: string, ref: string, customerId?: string) {
  const io = getIO();
  if (customerId) {
    io.to(`user:${customerId}`).emit('booking.confirmed', { bookingId, ref, status: 'confirmed' });
  }
  io.to('admin-room').emit('booking.confirmed', { bookingId, ref, status: 'confirmed' });
}

export function emitSlotLocked(courtId: number, date: string, time: string) {
  const io = getIO();
  io.emit('slot.locked', { courtId, date, time });
}

export function emitSlotReleased(courtId: number, date: string, time: string) {
  const io = getIO();
  io.emit('slot.released', { courtId, date, time });
}
