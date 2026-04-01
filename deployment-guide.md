# 🚢 Deployment Guide — SportHub Production

**Target:** AWS (ap-southeast-1 Singapore)  
**Strategy:** Blue-Green Deployment  
**CI/CD:** GitHub Actions

---

## 1. Kiến Trúc Hạ Tầng Production

```
Internet
   │
   ▼
Route 53 (DNS)
   │
   ▼
CloudFront CDN
   ├── /static/* → S3 (React builds)
   └── /api/*    → ALB
                      │
              Application Load Balancer
                 ├── EC2 (AZ-a) t3.medium
                 └── EC2 (AZ-b) t3.medium
                        │
              ┌──────────┴──────────┐
              ▼                    ▼
        RDS PostgreSQL 15    ElastiCache Redis 7
        (Multi-AZ, r6g.large) (cache.r6g.large)
              │
              ▼
           S3 Bucket
        (Backups, Assets)
```

---

## 2. Environment Variables Production

Lưu trong **AWS Secrets Manager** hoặc **Parameter Store**, không bao giờ hardcode:

```bash
# Lấy từ AWS Secrets Manager
aws secretsmanager get-secret-value \
  --secret-id sporthub/production/api \
  --query SecretString --output text
```

**Checklist trước deploy:**
- [ ] `NODE_ENV=production`
- [ ] JWT secrets đủ mạnh (≥ 64 chars, random)
- [ ] Database URL trỏ đúng RDS endpoint
- [ ] Redis URL trỏ đúng ElastiCache endpoint
- [ ] VNPay credentials production (không phải sandbox)
- [ ] `CORS_ORIGINS` chỉ cho phép domain production

---

## 3. Docker

### Dockerfile (Backend)
```dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM base AS builder
RUN npm ci
COPY . .
RUN npm run build

FROM base AS runner
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3001
USER node
CMD ["node", "dist/server.js"]
```

### docker-compose.yml (Production-like local)
```yaml
version: '3.9'
services:
  api:
    build: ./apps/api
    ports: ["3001:3001"]
    environment:
      - NODE_ENV=production
    env_file: .env.production
    depends_on: [postgres, redis]
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: sporthub
      POSTGRES_USER: sporthub
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    restart: unless-stopped

volumes:
  postgres_data:
```

---

## 4. CI/CD Pipeline (GitHub Actions)

### `.github/workflows/deploy.yml`
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:ci
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test_db
      - name: Upload coverage
        uses: codecov/codecov-action@v4

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-southeast-1
      - name: Login to ECR
        uses: aws-actions/amazon-ecr-login@v2
      - name: Build & push Docker image
        run: |
          IMAGE_TAG=${{ github.sha }}
          docker build -t sporthub-api:$IMAGE_TAG ./apps/api
          docker tag sporthub-api:$IMAGE_TAG $ECR_REGISTRY/sporthub-api:$IMAGE_TAG
          docker push $ECR_REGISTRY/sporthub-api:$IMAGE_TAG

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Deploy to EC2
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ec2-user
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd /opt/sporthub
            export IMAGE_TAG=${{ github.sha }}
            docker-compose pull api
            docker-compose up -d --no-deps api
            docker-compose exec api npx prisma migrate deploy
            echo "Deploy $IMAGE_TAG completed at $(date)"

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run build
        working-directory: apps/web
        env:
          VITE_API_URL: ${{ secrets.PROD_API_URL }}
      - name: Upload to S3
        run: |
          aws s3 sync apps/web/dist s3://sporthub-web --delete
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CF_DIST_ID }} \
            --paths "/*"
```

---

## 5. Database Migration (Production)

```bash
# KHÔNG BAO GIỜ chạy migrate reset trên production!

# Chạy migrations production
NODE_ENV=production npx prisma migrate deploy

# Kiểm tra migration status
npx prisma migrate status

# Rollback nếu cần (phải có migration rollback viết sẵn)
# Prisma không hỗ trợ rollback tự động — phải tạo migration mới
```

---

## 6. Zero-Downtime Deploy Checklist

```
Before Deploy:
□ Backup database (AWS automated snapshot)
□ Notify team via Slack #deployments
□ Review CHANGELOG và commit messages
□ Check monitoring dashboards bình thường

Deploy Steps:
□ Run: npm run deploy:staging (test staging trước)
□ Smoke test staging (5 phút)
□ Run: npm run deploy:production
□ Monitor error rate trong 15 phút đầu
□ Kiểm tra health check endpoints

After Deploy:
□ Update deployment log
□ Close related tickets/issues
□ Update CHANGELOG.md
```

---

## 7. Monitoring & Alerting

### Health Check Endpoints
```bash
# API health
GET /health
# Response: { "status": "ok", "db": "connected", "redis": "connected", "version": "1.2.3" }

# Readiness probe (k8s style)
GET /ready
# Response 200 khi sẵn sàng nhận traffic, 503 khi chưa
```

### Datadog Alerts

| Alert | Threshold | Hành động |
|-------|-----------|-----------|
| API Error Rate | > 1% trong 5 phút | Notify #on-call Slack |
| P95 Latency | > 1 giây | Notify Tech Lead |
| DB Connections | > 80% pool | Scale hoặc investigate |
| Disk Usage | > 80% | Expand hoặc cleanup |
| Uptime | < 99.5% / tháng | SLA breach alert |

---

## 8. Rollback Procedure

```bash
# 1. Xác định version cần rollback về
git log --oneline -10

# 2. Deploy version cũ
SSH vào EC2:
docker pull $ECR_REGISTRY/sporthub-api:PREVIOUS_SHA
IMAGE_TAG=PREVIOUS_SHA docker-compose up -d --no-deps api

# 3. Nếu có migration cần rollback
# Phải tạo migration reverse thủ công và deploy

# 4. Verify
curl https://api.sporthub.vn/health
```

---

## 9. Backup & Recovery

```bash
# Automated: AWS RDS snapshot hàng ngày (giữ 7 ngày)

# Manual backup khi cần
pg_dump $DATABASE_URL | gzip > backup_$(date +%Y%m%d).sql.gz
aws s3 cp backup_$(date +%Y%m%d).sql.gz s3://sporthub-backups/

# Restore từ backup
gunzip -c backup_20260311.sql.gz | psql $DATABASE_URL
```

---

## 10. Domain & SSL

```bash
# Domain: sporthub.vn (Route 53)
# API:    api.sporthub.vn
# Admin:  admin.sporthub.vn
# App:    app.sporthub.vn

# SSL: AWS Certificate Manager (auto-renew)
# SSL redirect: HTTP → HTTPS enforce ở ALB level

# Verify SSL
openssl s_client -connect api.sporthub.vn:443 -servername api.sporthub.vn
```
