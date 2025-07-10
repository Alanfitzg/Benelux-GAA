# Deployment Checklist for GAA Trips

## Pre-Launch Critical Checks

### ✅ Build & Code Quality
- [x] Production build successful (`npm run build`)
- [x] No ESLint errors (`npm run lint`)
- [x] TypeScript type checking passes (test files have errors but won't affect production)

### 🔧 Environment Variables
Ensure all of these are configured in your production environment:

#### Required for Core Functionality
- [ ] `DATABASE_URL` - PostgreSQL connection string (e.g., from Supabase)
- [ ] `DIRECT_URL` - Direct PostgreSQL connection URL (for migrations)
- [ ] `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
- [ ] `NEXTAUTH_URL` - Your production URL (e.g., https://yourdomain.com)

#### Required for Features
- [ ] `NEXT_PUBLIC_MAPBOX_TOKEN` - For map functionality
- [ ] `AWS_ACCESS_KEY_ID` - For image uploads
- [ ] `AWS_SECRET_ACCESS_KEY` - For image uploads
- [ ] `AWS_REGION` - AWS region (e.g., eu-west-1)
- [ ] `S3_BUCKET_NAME` - S3 bucket for uploads

#### Email (if using email features)
- [ ] `SENDGRID_API_KEY` - For sending emails
- [ ] `SENDGRID_FROM_EMAIL` - Verified sender email
- [ ] `SENDGRID_FROM_NAME` - Display name for emails

#### Optional
- [ ] `NEXT_PUBLIC_ENABLE_ERROR_REPORTING` - Set to "true" for client error logging

### 📊 Database
- [ ] Run `npx prisma generate` to ensure client is up to date
- [ ] Run `npx prisma db push` to sync schema with production database
- [ ] Verify database connection works
- [ ] Check if any seed data needs to be loaded

### 🔐 Security
- [ ] NEXTAUTH_SECRET is strong and unique
- [ ] All API keys are production keys (not development)
- [ ] CORS settings are appropriate for your domain
- [ ] Rate limiting is configured properly

### 🌐 Domain & Hosting
- [ ] Domain is configured and pointing to your hosting
- [ ] SSL certificate is active
- [ ] Environment variables are set in hosting platform
- [ ] Build command is set to `npm run build`
- [ ] Start command is set to `npm start`

### 🧪 Final Testing
- [ ] Test user registration flow
- [ ] Test user login flow
- [ ] Test event creation (requires auth)
- [ ] Test club listing and map
- [ ] Test image upload functionality
- [ ] Check mobile responsiveness

### 📱 Post-Launch
- [ ] Monitor error logs
- [ ] Check database performance
- [ ] Verify email delivery (if applicable)
- [ ] Test all critical user journeys
- [ ] Set up monitoring/analytics

## Quick Start Commands

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Build for production
npm run build

# Start production server
npm start
```

## Common Issues & Solutions

1. **Map not showing**: Check NEXT_PUBLIC_MAPBOX_TOKEN is set
2. **Auth not working**: Verify NEXTAUTH_URL matches your domain exactly
3. **Image upload fails**: Check AWS credentials and S3 bucket permissions
4. **Database errors**: Ensure DATABASE_URL is correct and accessible

## Notes
- TypeScript errors in test files can be ignored for production deployment
- The site uses Prisma with `db push` strategy instead of migrations
- Authentication uses NextAuth v5 (beta)