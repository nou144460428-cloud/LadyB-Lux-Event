# Quick Start Guide 🚀

Get LadyB Lux Events running locally in 5 minutes.

---

## Step 1: Clone & Install (2 min)

```bash
# Backend
cd backend
npm install

# Frontend (in another terminal)
cd frontend
npm install
```

---

## Step 2: Setup Database (1 min)

### Option A: Local PostgreSQL
```bash
# Create database
createdb ladyb_lux_event

# Update DATABASE_URL in .env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ladyb_lux_event"

# Apply migrations
npx prisma migrate deploy
```

### Option B: Supabase (Cloud)
1. Go to https://supabase.com
2. Create new project
3. Copy connection string → `DATABASE_URL`
4. Run: `npx prisma migrate deploy`

---

## Step 3: Environment Variables (1 min)

### Backend (`backend/.env`)
```env
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret_key_here
PAYSTACK_SECRET=sk_test_xxxx  # Use test key for development
PAYSTACK_PUBLIC_KEY=pk_test_xxxx
MONNIFY_BASE_URL=https://sandbox.monnify.com
MONNIFY_API_KEY=mk_test_xxxx
MONNIFY_SECRET_KEY=msk_test_xxxx
MONNIFY_CONTRACT_CODE=1234567890
MONNIFY_WEBHOOK_SECRET=monnify_webhook_secret
ADMIN_BOOTSTRAP_SECRET=bootstrap_secret_once
FRONTEND_URL=http://localhost:3000
PORT=3001
NODE_ENV=development
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxx
```

---

## Step 4: Run Services (1 min)

### Terminal 1: Backend
```bash
cd backend
npm run start:dev
# Runs on http://localhost:3001
```

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
# Runs on http://localhost:3000
```

---

## Step 5: Test Flow (5 min)

### 1. Go to http://localhost:3000
### 2. Register a customer account
### 3. Create an event
### 4. Browse vendors → Add to cart
### 5. Checkout → Payment
   - Use test card: `4084084084084081`
   - Expiry: `01/45`
   - CVV: `000`
   - OTP: Press continue on next page

---

## 🎯 Key Flows to Test

### Customer Journey
```
Home → Register → Create Event → Browse Vendors 
→ Add Products → Cart → Checkout → Payment → Success
```

### Vendor Dashboard
```
Register as Vendor → Login → /dashboard/vendor 
→ View orders from your products → Update status
```

### Admin Dashboard
```
Go to: http://localhost:3000/dashboard/admin
→ View all orders → View vendor statistics
→ Track platform revenue (15% commission)
```

---

## 📱 Test Accounts

### Customer Account
```
Email: customer@test.com
Password: test123456
```

### Vendor Account  
```
Email: vendor@test.com
Password: test123456
Business Name: Test Catering
Category: SMALL_CHOPS
```

### Admin (TBD)
```
Use one-time bootstrap:
POST /auth/admin/bootstrap
{
  "name": "Owner",
  "email": "admin@yourapp.com",
  "password": "securepass",
  "bootstrapSecret": "ADMIN_BOOTSTRAP_SECRET value"
}
```

---

## 🛠️ Useful Commands

```bash
# View database in GUI
npx prisma studio

# Generate Prisma types
npx prisma generate

# Create new migration
npx prisma migrate dev --name description

# Run backend tests
npm test

# Build frontend
cd frontend && npm run build

# Run frontend in production mode
npm start
```

---

## ❌ Common Issues

### Port 3000/3001 Already in Use
```bash
# Find & kill process
lsof -i :3000
kill -9 <PID>
```

### Database Connection Error
```
Check DATABASE_URL in .env
Ensure PostgreSQL is running
Run: npx prisma db push
```

### CORS Error
```
Backend should accept:
http://localhost:3000 in development
Update FRONTEND_URL in .env
```

### JWT Token Not Sent
```
Check that token is stored in localStorage
Verify JWT_SECRET matches
Check API client interceptor in lib/api.ts
```

---

## 📚 Documentation

- **Detailed Setup**: See [README.md](../README.md)
- **Deployment**: See [DEPLOYMENT.md](../DEPLOYMENT.md)
- **Implementation**: See [IMPLEMENTATION.md](../IMPLEMENTATION.md)

---

## 💳 Paystack Integration Summary

### Keys to obtain
1. Sign up at `https://paystack.com`
2. Go to `Settings -> API Keys`
3. Copy Secret Key (`sk_live_...`)
4. Copy Public Key (`pk_live_...`)

### Webhook URL to set in Paystack Dashboard
```text
POST https://your-backend.com/payments/webhook/paystack
```

### Testing Paystack locally
Use Paystack test keys (`sk_test_...`, `pk_test_...`)

### Monnify setup
1. Create a Monnify merchant account.
2. Copy `API KEY`, `SECRET KEY`, and `CONTRACT CODE`.
3. Use sandbox base URL in development: `https://sandbox.monnify.com`.
4. Configure redirect to:
```text
https://your-frontend.com/checkout/success
```
5. Configure webhook to:
```text
POST https://your-backend.com/payments/webhook/monnify
```

---

## 📈 Monitoring & Analytics

### Option 1: Sentry (Error Tracking)
```typescript
import * as Sentry from '@sentry/node';

Sentry.init({ dsn: process.env.SENTRY_DSN });
```

### Option 2: LogRocket (Session Replay)
Frontend only, great for debugging.

### Option 3: DataDog
Enterprise choice, costs $$$.

---

## ✅ Checklist

- [ ] Node.js v18+ installed
- [ ] PostgreSQL running (local or Supabase)
- [ ] Environment variables set
- [ ] `npm install` completed
- [ ] Database migrations applied
- [ ] Backend running on :3001
- [ ] Frontend running on :3000
- [ ] Can register & login
- [ ] Can create event
- [ ] Can add to cart
- [ ] Payment flow works (test card)

---

## 🎉 You're Ready!

The app is fully functional. Start building! 🚀

Questions? Check the documentation files or the code comments.
