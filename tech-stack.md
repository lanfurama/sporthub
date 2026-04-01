# 🛠️ Tech Stack — SportHub Platform

**Phiên bản:** 1.0 | **Ngày:** 11/03/2026

---

## 1. Tổng Quan Kiến Trúc

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                          │
│  Customer Website (React)  │  Admin Portal (React)       │
│  Mobile Web (Responsive)   │  PWA Support                │
└──────────────┬─────────────────────────────┬─────────────┘
               │ HTTPS / WSS                  │
┌──────────────▼─────────────────────────────▼─────────────┐
│                    API GATEWAY (AWS API GW)               │
│         Rate Limiting │ Auth │ Load Balancing             │
└──────────────┬──────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────┐
│                   BACKEND SERVICES                        │
│  Node.js/Express API  │  WebSocket Server                │
│  REST API v1          │  Real-time Events                │
└──────────────┬──────────────────────────────────────────┘
       ┌───────┼───────────────┐
       ▼       ▼               ▼
   PostgreSQL  Redis         S3/CloudFront
   (Primary)   (Cache/Queue) (Static Assets)
```

---

## 2. Frontend

| Công nghệ | Phiên bản | Lý do chọn |
|-----------|-----------|-----------|
| **React** | 18.x | Component model mạnh, ecosystem lớn, team quen thuộc |
| **TypeScript** | 5.x | Type safety, IDE support tốt, giảm bugs runtime |
| **Vite** | 5.x | Build tool nhanh, HMR tức thì |
| **React Router** | 6.x | Routing declarative, code splitting dễ |
| **Zustand** | 4.x | State management nhẹ, không boilerplate |
| **TanStack Query** | 5.x | Server state, caching, refetch tự động |
| **Tailwind CSS** | 3.x | Utility-first, không viết CSS riêng |
| **Radix UI** | latest | Accessible headless components |
| **Recharts** | 2.x | Biểu đồ dashboard |
| **React Hook Form** | 7.x | Form validation hiệu suất cao |
| **Zod** | 3.x | Schema validation tái sử dụng |
| **Axios** | 1.x | HTTP client, interceptors |
| **Socket.io-client** | 4.x | WebSocket real-time |
| **date-fns** | 3.x | Xử lý ngày tháng |

---

## 3. Backend

| Công nghệ | Phiên bản | Lý do chọn |
|-----------|-----------|-----------|
| **Node.js** | 20 LTS | JavaScript full-stack, event-driven tốt cho I/O |
| **TypeScript** | 5.x | Consistency với frontend |
| **Express.js** | 4.x | Lightweight, middleware ecosystem đầy đủ |
| **Prisma ORM** | 5.x | Type-safe DB client, migration tự động, DX tuyệt vời |
| **JWT** | jsonwebtoken | Stateless auth, refresh token rotation |
| **bcrypt** | 5.x | Password hashing |
| **Socket.io** | 4.x | Real-time booking notifications |
| **Bull** | 4.x | Job queue: email, SMS, credit renewal |
| **Nodemailer** | 6.x | Gửi email xác nhận |
| **Zod** | 3.x | Request validation |
| **Winston** | 3.x | Structured logging |
| **Helmet** | 7.x | Security headers |
| **cors** | 2.x | CORS configuration |
| **express-rate-limit** | 7.x | Rate limiting |

---

## 4. Database

| Công nghệ | Phiên bản | Lý do chọn |
|-----------|-----------|-----------|
| **PostgreSQL** | 15.x | ACID, relational cho booking/payment, mạnh về concurrent writes |
| **Redis** | 7.x | Session cache, rate limiting, pub/sub cho websocket, job queue |

---

## 5. AI & Integrations

| Dịch vụ | Mục đích |
|---------|---------|
| **Anthropic Claude API** (claude-sonnet-4) | AI Chat Assistant tư vấn khách hàng |
| **VNPay Gateway** | Thanh toán thẻ nội địa |
| **MoMo** | Ví điện tử |
| **Twilio / ESMS** | OTP SMS, thông báo booking |
| **SendGrid** | Email transactional |

---

## 6. Infrastructure & DevOps

| Công nghệ | Mục đích |
|-----------|---------|
| **AWS EC2** (t3.medium) | Application servers |
| **AWS RDS PostgreSQL** | Managed database, multi-AZ |
| **AWS ElastiCache Redis** | Managed Redis |
| **AWS S3 + CloudFront** | Static assets CDN |
| **AWS Route 53** | DNS management |
| **AWS Certificate Manager** | SSL/TLS |
| **Docker** + **Docker Compose** | Containerization |
| **GitHub Actions** | CI/CD pipeline |
| **Nginx** | Reverse proxy, load balancer |
| **PM2** | Node.js process manager |
| **Datadog** | Monitoring, APM, alerts |
| **Sentry** | Error tracking |

---

## 7. Development Tools

| Công nghệ | Mục đích |
|-----------|---------|
| **Git** + **GitHub** | Version control |
| **ESLint** + **Prettier** | Code quality & formatting |
| **Husky** | Pre-commit hooks |
| **Jest** + **Supertest** | Unit & integration testing |
| **Playwright** | E2E testing |
| **Postman** | API testing & documentation |
| **pgAdmin** | Database GUI |
| **Linear** | Project management |

---

## 8. Quyết Định Kiến Trúc (ADR)

### ADR-001: Monorepo vs Đa Repo
**Quyết định:** Monorepo với npm workspaces  
**Lý do:** Chia sẻ types, dễ atomic commits, CI/CD đơn giản hơn

### ADR-002: REST vs GraphQL
**Quyết định:** REST API  
**Lý do:** Team quen thuộc, không cần flexibility của GraphQL, dễ cache

### ADR-003: PostgreSQL vs MongoDB
**Quyết định:** PostgreSQL  
**Lý do:** Dữ liệu booking/payment cần ACID, relational rõ ràng, JOIN hiệu quả

### ADR-004: Server-Side vs Client-Side Rendering
**Quyết định:** CSR (Vite + React) với meta tags cơ bản  
**Lý do:** Không cần SEO cao, team React sẵn có, đơn giản hơn SSR
