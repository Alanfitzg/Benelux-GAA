# Simple Staging Setup (Keep Main as Production)

## 🎯 Overview
This approach keeps your existing workflow intact while adding a staging environment for testing.

## 📋 Current Setup
- `main` branch → **Production** (live site)
- Feature branches → Preview deployments

## 🚀 New Setup
- `main` branch → **Production** (live site) ✅ *unchanged*
- `staging` branch → **Staging** (persistent staging URL)
- Feature branches → Preview deployments ✅ *unchanged*

## 🔧 Step-by-Step Setup

### Step 1: Create Staging Branch
```bash
# Create staging branch from main
git checkout main
git pull origin main
git checkout -b staging
git push -u origin staging
```

### Step 2: Configure Vercel Environment Variables

1. **Go to Vercel Dashboard**:
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click on your GAA Trips project
   - Go to **Settings** → **Environment Variables**

2. **Add Staging-Specific Variables**:
   Click "Add New" and set these for **Preview** environment:

   ```
   Variable Name: DATABASE_URL
   Value: your-staging-database-url
   Environment: Preview
   ```

   ```
   Variable Name: NEXTAUTH_URL
   Value: https://gaa-trips-git-staging-yourteam.vercel.app
   Environment: Preview
   ```

   ```
   Variable Name: RESEND_FROM_EMAIL
   Value: staging@your-domain.com
   Environment: Preview
   ```

   ```
   Variable Name: RESEND_FROM_NAME
   Value: Gaelic Trips (Staging)
   Environment: Preview
   ```

### Step 3: Create Staging Database

1. **Create Supabase Staging Project**:
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Create new project: "gaa-trips-staging"
   - Copy the database URL

2. **Clone Production Schema**:
   ```bash
   # Temporarily set staging database URL
   export DATABASE_URL="your-staging-database-url"
   
   # Push schema to staging
   npx prisma db push
   
   # Seed with test data
   npx prisma db seed
   ```

### Step 4: Test Your Setup

1. **Make a test change on staging**:
   ```bash
   git checkout staging
   
   # Make a small change to test
   echo "console.log('Staging environment');" >> src/app/page.tsx
   
   git add .
   git commit -m "Test staging deployment"
   git push origin staging
   ```

2. **Check Vercel Dashboard**:
   - You'll see a new deployment
   - URL will be: `https://gaa-trips-git-staging-yourteam.vercel.app`

3. **Test Email Functionality**:
   - Visit your staging URL
   - Test user registration
   - Emails will use `staging@your-domain.com`

## 🔄 Workflow

### Development Process:
```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Make changes and test locally
# ... make changes ...

# 3. Push for preview deployment
git push origin feature/new-feature
# Gets preview URL: https://gaa-trips-git-feature-new-feature-team.vercel.app

# 4. Merge to staging for integration testing
git checkout staging
git merge feature/new-feature
git push origin staging
# Test on: https://gaa-trips-git-staging-team.vercel.app

# 5. After staging approval, merge to production
git checkout main
git merge staging
git push origin main
# Deploys to: https://your-production-domain.com
```

## 📊 What You Get

### Staging Branch Benefits:
- ✅ Persistent staging URL
- ✅ Staging-specific database
- ✅ Staging-specific email configuration
- ✅ Safe testing environment
- ✅ No disruption to current workflow

### Environment Separation:
- **Production**: Real users, real data, production email
- **Staging**: Test users, test data, staging email
- **Feature Previews**: Isolated testing of individual features

## 🛠️ Quick Commands

```bash
# Work on staging
git checkout staging
git pull origin staging
# ... make changes ...
git push origin staging

# Promote staging to production
git checkout main
git merge staging
git push origin main

# Create feature branch
git checkout -b feature/email-improvements
git push origin feature/email-improvements
```

## 🎯 For Your Email Testing

Now you can safely test your Resend changes:

1. **Push changes to staging branch**
2. **Test emails on staging URL**
3. **Verify emails use staging@your-domain.com**
4. **Only merge to main after testing**

## 📝 Environment Variables Summary

You'll have:
- **Production** (main branch): Uses production database, production email
- **Preview** (staging + feature branches): Uses staging database, staging email

## 🚀 Next Steps

1. **Create the staging branch** (Step 1)
2. **Set up Supabase staging database**
3. **Configure Vercel environment variables**
4. **Test with a small change**
5. **Start using for your email testing**

This gives you a safe staging environment without changing your existing production setup!