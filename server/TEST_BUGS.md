# Test Bugs Found và Fixed

## Bugs đã phát hiện và fix:

### 1. ✅ DATABASE_URL không được load trong test environment
**Fix:** Thêm import database config trong setup.ts

### 2. ✅ Enum type mismatch giữa Prisma và Database
**Vấn đề:** Database dùng snake_case (`product_status`) nhưng Prisma enum là PascalCase (`ProductStatus`)
**Fix:** Thêm `@@map` trong Prisma schema để map enum type names:
- `SportType` → `sport_type`
- `CourtStatus` → `court_status`
- `BookingStatus` → `booking_status`
- `ProductStatus` → `product_status`
- `OrderStatus` → `order_status`
- `UserRole` → `user_role`
- `MembershipPlan` → `membership_plan`
- `MembershipStatus` → `membership_status`
- `BookingSource` → `booking_source`
- `CreditTxType` → `credit_tx_type`

### 3. ✅ Test helpers dùng PrismaClient mới thay vì shared instance
**Fix:** Export prisma từ setup.ts và import trong helpers.ts

### 4. ✅ TypeScript type errors với enum values trong tests
**Fix:** Dùng enum values từ Prisma client thay vì string literals

### 5. ✅ Foreign key constraint violations trong cleanup
**Fix:** Thêm deleteMany cho creditTransaction và guestPassTransaction trước khi delete membership

### 6. ✅ Missing membershipPlanConfig trong test database
**Fix:** Thêm setup để create/upsert membership plans trong beforeAll

## Test Results:
- **Before:** 4 passed, 50 failed
- **After:** Đang fix...

## Remaining Issues:
- Cần verify tất cả tests pass sau khi fix các issues trên
