# 📐 Coding Standards — SportHub

**Áp dụng cho:** Toàn bộ codebase TypeScript/JavaScript  
**Enforce bằng:** ESLint + Prettier + Husky pre-commit hooks

---

## 1. Quy Tắc Đặt Tên (Naming Conventions)

### Variables & Functions
```typescript
// ✅ camelCase cho variables và functions
const bookingCount = 0;
const memberPlan = 'vip';
function calculateFinalPrice(basePrice: number, discount: number): number { }
async function fetchAvailableSlots(courtId: number, date: string) { }

// ❌ Không dùng
const booking_count = 0;  // snake_case
const BookingCount = 0;   // PascalCase cho variable
```

### Classes & Interfaces
```typescript
// ✅ PascalCase
class BookingService { }
interface CourtAvailability { }
type PaymentMethod = 'cash' | 'card' | 'transfer';

// ✅ Interface prefix với 'I' là tùy chọn (không bắt buộc)
interface IBookingRepository { }  // OK
interface BookingRepository { }   // Also OK
```

### Constants & Enums
```typescript
// ✅ SCREAMING_SNAKE_CASE cho constants
const MAX_BOOKING_DURATION = 3;
const PEAK_HOURS_START = 17;
const PEAK_HOURS_END = 21;

// ✅ PascalCase cho enum, PascalCase cho values
enum BookingStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  Rejected = 'rejected',
  Cancelled = 'cancelled',
}

enum MembershipPlan {
  Basic = 'basic',
  Prime = 'prime',
  Vip = 'vip',
}
```

### Files & Directories
```
# ✅ kebab-case cho tất cả files
booking-service.ts
court-controller.ts
use-booking-form.ts       # React hooks
booking-card.tsx          # React components
auth.middleware.ts

# ✅ Tên file khớp với export default
# File: booking-form.tsx → export default BookingForm
# File: use-auth.ts → export default useAuth

# ❌ Không dùng
BookingService.ts         # PascalCase file
bookingservice.ts         # Lowercase không phân tách
```

---

## 2. TypeScript

```typescript
// ✅ Luôn type rõ ràng cho function parameters và return types
function getCourtPrice(court: Court, hour: number): number {
  return hour >= PEAK_HOURS_START ? court.peakPrice : court.price;
}

// ✅ Dùng interface cho objects, type cho unions/primitives
interface Booking {
  id: string;
  courtId: number;
  customerId: string | null;
  date: string;         // ISO format: YYYY-MM-DD
  time: string;         // HH:MM
  duration: number;     // hours
  status: BookingStatus;
  finalPrice: number;   // VND
  createdAt: Date;
}

// ✅ Tránh 'any', dùng 'unknown' nếu cần
function parseResponse(data: unknown): Booking {
  // validate và cast
}

// ✅ Optional chaining và nullish coalescing
const discount = member?.plan ? planDiscounts[member.plan] : 0;
const name = booking.customer?.name ?? 'Khách';

// ✅ Readonly cho objects không nên thay đổi
const PLAN_CONFIG: Readonly<Record<MembershipPlan, PlanBenefits>> = { ... };
```

---

## 3. React Components

```tsx
// ✅ Functional components với TypeScript
interface BookingCardProps {
  booking: Booking;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  className?: string;
}

export function BookingCard({ booking, onApprove, onReject, className }: BookingCardProps) {
  // State ở trên cùng
  const [isLoading, setIsLoading] = useState(false);
  
  // Derived values
  const isPending = booking.status === BookingStatus.Pending;
  const formattedPrice = formatVND(booking.finalPrice);
  
  // Event handlers — đặt tên rõ ràng với prefix 'handle'
  const handleApprove = async () => {
    setIsLoading(true);
    try {
      await onApprove(booking.id);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn('booking-card', className)}>
      {/* JSX */}
    </div>
  );
}

// ✅ Export named, không dùng default export cho components (trừ pages)
// File: booking-card.tsx
export { BookingCard };

// ✅ Pages dùng default export
// File: pages/bookings.tsx
export default function BookingsPage() { ... }
```

---

## 4. Hooks

```typescript
// ✅ Custom hooks bắt đầu với 'use'
export function useBookingForm(courtId?: number) {
  const [step, setStep] = useState(1);
  
  // Luôn return object, không return array (dễ đặt tên)
  return {
    step,
    goToNextStep: () => setStep(s => s + 1),
    goToPrevStep: () => setStep(s => Math.max(1, s - 1)),
  };
}

// ✅ useEffect — khai báo dependencies đầy đủ
useEffect(() => {
  if (date && courtId) {
    fetchAvailability(courtId, date);
  }
}, [courtId, date, fetchAvailability]);
```

---

## 5. API / Backend

```typescript
// ✅ Controller — chỉ xử lý HTTP, delegate logic cho Service
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  async createBooking(req: Request, res: Response) {
    try {
      const dto = CreateBookingSchema.parse(req.body);
      const booking = await this.bookingService.create(dto, req.user?.id);
      return res.status(201).json({ success: true, data: booking });
    } catch (error) {
      return handleError(error, res);
    }
  }
}

// ✅ Service — chứa business logic
export class BookingService {
  async create(dto: CreateBookingDto, userId?: string): Promise<Booking> {
    // 1. Validate slot còn trống
    const isAvailable = await this.checkAvailability(dto.courtId, dto.date, dto.time);
    if (!isAvailable) throw new ConflictError('SLOT_NOT_AVAILABLE', 'Khung giờ đã được đặt');

    // 2. Tính giá
    const pricing = await this.calculatePricing(dto);

    // 3. Tạo booking
    return this.bookingRepo.create({ ...dto, ...pricing });
  }
}

// ✅ Errors có code rõ ràng
throw new ConflictError('SLOT_NOT_AVAILABLE', 'Khung giờ đã được đặt');
throw new NotFoundError('COURT_NOT_FOUND', 'Không tìm thấy sân');
throw new ValidationError('INVALID_DATE', 'Ngày phải trong tương lai');
```

---

## 6. Comment & Documentation

```typescript
// ✅ JSDoc cho public functions/methods
/**
 * Tính giá cuối cùng sau khi áp dụng discount và credit.
 * 
 * @param basePrice - Giá gốc (VND)
 * @param discountPercent - % giảm giá (0–100)
 * @param creditAmount - Số credit sử dụng (VND)
 * @returns Giá cuối sau khi trừ discount và credit
 */
function calculateFinalPrice(
  basePrice: number,
  discountPercent: number,
  creditAmount: number
): number {
  const afterDiscount = Math.round(basePrice * (1 - discountPercent / 100));
  return Math.max(0, afterDiscount - creditAmount);
}

// ✅ Comment giải thích "tại sao", không phải "cái gì"
// Giá peak áp dụng từ 17h để khuyến khích khách chơi giờ thấp điểm
const price = hour >= PEAK_HOURS_START ? court.peakPrice : court.price;

// ❌ Comment vô nghĩa
// Tăng biến lên 1
count++;
```

---

## 7. Git Conventions

### Branch Naming
```
feature/booking-cancellation
bugfix/slot-double-booking
hotfix/payment-timeout
chore/update-dependencies
docs/api-endpoints
```

### Commit Messages (Conventional Commits)
```
feat(booking): thêm tính năng hủy đặt sân với hoàn credit
fix(auth): sửa lỗi JWT refresh token hết hạn sớm
docs(api): cập nhật endpoint /bookings/admin
test(membership): thêm unit test tính credit tự động
chore(deps): cập nhật prisma lên 5.10
refactor(pricing): tách logic tính giá thành PricingService
perf(courts): thêm index cho trường date trong bảng bookings
```

### Pull Request Process
1. Tạo branch từ `develop` (không phải `main`)
2. PR phải có: mô tả rõ ràng, test coverage, screenshots (UI changes)
3. Cần ít nhất 1 reviewer approve
4. Squash commits khi merge vào `develop`
5. Chỉ Tech Lead merge `develop` → `main`

---

## 8. Folder Structure (Backend)

```
apps/api/src/
├── config/           # App config, env validation
├── controllers/      # HTTP handlers (thin layer)
├── services/         # Business logic
├── repositories/     # Database access (Prisma)
├── middleware/        # Auth, rate limit, error handler
├── validators/       # Zod schemas
├── types/            # TypeScript types/interfaces
├── utils/            # Pure utility functions
├── jobs/             # Background jobs (Bull)
├── events/           # WebSocket event handlers
└── __tests__/        # Tests mirror src structure
```

---

## 9. Linting Config (ESLint)

`.eslintrc.json` áp dụng các rules:
- `@typescript-eslint/no-explicit-any` — error
- `@typescript-eslint/explicit-function-return-type` — warn
- `no-console` — warn (dùng logger thay thế)
- `react-hooks/exhaustive-deps` — error
- `prefer-const` — error

```bash
# Kiểm tra linting
npm run lint

# Auto-fix
npm run lint:fix
```
