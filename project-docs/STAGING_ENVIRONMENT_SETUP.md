# Staging Environment Setup Guide

## 🎯 Overview
This guide will help you set up a staging environment to test changes before deploying to production.

## 🚀 Option 1: Vercel Preview Deployments (Recommended)

### Automatic Preview Deployments
Vercel automatically creates preview deployments for every push to non-production branches.

1. **Create a staging branch**:
   ```bash
   git checkout -b staging
   git push -u origin staging
   ```

2. **Push changes to staging**:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin staging
   ```

3. **Access preview URL**:
   - Vercel will comment on your PR with a preview URL
   - Format: `https://gaa-trips-[hash]-[team].vercel.app`

### Persistent Staging Environment
Set up a dedicated staging environment on Vercel:

1. **In Vercel Dashboard**:
   - Go to your project settings
   - Navigate to "Git" → "Production Branch"
   - Change from `main` to `production`
   - Now `main` becomes your staging, `production` is prod

2. **Create production branch**:
   ```bash
   git checkout -b production
   git push -u origin production
   ```

3. **Environment Variables**:
   - In Vercel, go to Settings → Environment Variables
   - Add staging-specific variables:
     ```
     NEXTAUTH_URL=https://staging-gaa-trips.vercel.app
     DATABASE_URL=your-staging-database-url
     RESEND_FROM_EMAIL=staging@your-domain.com
     ```
   - Scope them to "Preview" or specific branch

## 🗄️ Option 2: Separate Database Setup

### Supabase Staging Database

1. **Create new Supabase project** for staging:
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Create new project: "gaa-trips-staging"
   - Copy the database URL

2. **Clone production schema**:
   ```bash
   # Export production schema
   pg_dump $PRODUCTION_DATABASE_URL --schema-only > schema.sql
   
   # Import to staging
   psql $STAGING_DATABASE_URL < schema.sql
   ```

3. **Seed staging data**:
   ```bash
   # Update .env with staging database
   DATABASE_URL="your-staging-database-url"
   
   # Run seed script
   npx prisma db push
   npx prisma db seed
   ```

### Database Branching (Supabase)
Supabase now supports database branching:

1. **Enable branching** in Supabase dashboard
2. **Create branch**:
   ```bash
   supabase db branch create staging
   ```
3. **Use branch URL** in your staging environment

## 🔧 Option 3: Local Staging Setup

### Docker Compose Setup
Create `docker-compose.staging.yml`:

```yaml
version: '3.8'
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: gaa_trips_staging
    ports:
      - "5433:5432"
    volumes:
      - staging_db_data:/var/lib/postgresql/data

  app:
    build: .
    ports:
      - "3001:3000"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/gaa_trips_staging
      NEXTAUTH_URL: http://localhost:3001
      NODE_ENV: staging
    depends_on:
      - db

volumes:
  staging_db_data:
```

Run with:
```bash
docker-compose -f docker-compose.staging.yml up
```

## 📋 Environment Configuration

### 1. Create `.env.staging`:
```bash
# Database
DATABASE_URL="your-staging-database-url"

# NextAuth
NEXTAUTH_URL="https://staging.your-domain.com"
NEXTAUTH_SECRET="different-secret-for-staging"

# Email (Resend)
RESEND_API_KEY="re_staging_key"
RESEND_FROM_EMAIL="staging@your-domain.com"
RESEND_FROM_NAME="Gaelic Trips (Staging)"

# AWS S3 (separate bucket)
S3_BUCKET_NAME="gaa-trips-staging"
S3_REGION="eu-west-1"
AWS_ACCESS_KEY_ID="your-staging-key"
AWS_SECRET_ACCESS_KEY="your-staging-secret"

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN="your-mapbox-token"
```

### 2. Update `package.json`:
```json
{
  "scripts": {
    "dev:staging": "dotenv -e .env.staging -- next dev -p 3001",
    "build:staging": "dotenv -e .env.staging -- next build",
    "start:staging": "dotenv -e .env.staging -- next start -p 3001"
  }
}
```

### 3. Install dotenv-cli:
```bash
npm install --save-dev dotenv-cli
```

## 🚦 Deployment Workflow

### GitHub Actions Setup
Create `.github/workflows/staging.yml`:

```yaml
name: Deploy to Staging

on:
  push:
    branches: [staging]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build
        run: npm run build
        env:
          DATABASE_URL: ${{ secrets.STAGING_DATABASE_URL }}
          
      - name: Deploy to Vercel
        run: vercel --prod --env=preview
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

### Deployment Process
1. **Development** → `feature-branch`
2. **Staging** → `staging` branch (auto-deploys)
3. **Production** → `main` or `production` branch

## 🧪 Testing Checklist

### Before Promoting to Production:
- [ ] All tests pass
- [ ] Email notifications work (use Resend test mode)
- [ ] Image uploads work (test S3 bucket)
- [ ] Authentication flows work
- [ ] Database migrations applied successfully
- [ ] Performance is acceptable
- [ ] No console errors
- [ ] Mobile responsive
- [ ] SEO meta tags correct

### Staging-Specific Tests:
- [ ] Test with production-like data volume
- [ ] Test email delivery (different from address)
- [ ] Test payment flows (if applicable)
- [ ] Load testing
- [ ] Security scanning

## 🔄 Data Sync Strategies

### Option 1: Manual Sync
```bash
# Backup production
pg_dump $PROD_DB_URL > prod_backup.sql

# Restore to staging (sanitized)
psql $STAGING_DB_URL < prod_backup.sql

# Sanitize sensitive data
npx ts-node scripts/sanitize-staging-data.ts
```

### Option 2: Automated Sync
Create `scripts/sync-staging.ts`:
```typescript
// Sync production to staging with data sanitization
// Run weekly via cron job
```

## 🛡️ Security Considerations

1. **Different secrets** for staging vs production
2. **Restrict access** to staging environment
3. **Sanitize PII** when copying production data
4. **Use different email domains** to prevent confusion
5. **Separate S3 buckets** for uploads
6. **Different API keys** for third-party services

## 📝 Best Practices

1. **Branch Protection**:
   - Require PR reviews before merging to staging
   - Run automated tests on staging deploys
   - Require staging approval before production

2. **Environment Parity**:
   - Keep staging as close to production as possible
   - Same Node.js version
   - Same database version
   - Similar data volume

3. **Monitoring**:
   - Set up basic monitoring for staging
   - Track deployment success/failure
   - Monitor for errors

4. **Communication**:
   - Notify team of staging deployments
   - Document what's currently in staging
   - Clear process for promoting to production

## 🚀 Quick Start

1. **Vercel Approach** (Easiest):
   ```bash
   git checkout -b staging
   git push -u origin staging
   # Vercel auto-creates preview at unique URL
   ```

2. **Full Staging** (Most Robust):
   - Create Supabase staging project
   - Set up Vercel environment variables
   - Configure branch deployments
   - Test thoroughly

## 📚 Additional Resources

- [Vercel Preview Deployments](https://vercel.com/docs/concepts/deployments/preview-deployments)
- [Supabase Branching](https://supabase.com/docs/guides/platform/branching)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

---
*Last Updated: January 2025*