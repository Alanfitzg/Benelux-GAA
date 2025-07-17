# Vercel Staging Environment Setup

## 🎯 Step-by-Step Vercel Configuration

### Step 1: Create Staging Branch
```bash
# Create and switch to staging branch
git checkout -b staging
git push -u origin staging
```

### Step 2: Configure Vercel Project Settings

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click on your `gaa-trips` project

2. **Navigate to Settings**
   - Click on "Settings" tab
   - Go to "Git" section

3. **Configure Production Branch**
   - Change "Production Branch" from `main` to `production`
   - This makes `main` your staging environment
   - Create the production branch later: `git checkout -b production`

### Step 3: Set Up Environment Variables

1. **In Vercel Dashboard**:
   - Go to Settings → Environment Variables
   - You'll configure different variables for different environments

2. **Production Environment Variables**:
   ```
   Variable Name: DATABASE_URL
   Value: your-production-database-url
   Environment: Production
   ```

3. **Staging Environment Variables**:
   ```
   Variable Name: DATABASE_URL
   Value: your-staging-database-url
   Environment: Preview
   ```

4. **Add All Required Variables**:

   **For Production:**
   ```
   DATABASE_URL=your-production-supabase-url
   NEXTAUTH_SECRET=your-production-secret
   NEXTAUTH_URL=https://your-domain.com
   RESEND_API_KEY=re_your_production_key
   RESEND_FROM_EMAIL=noreply@your-domain.com
   RESEND_FROM_NAME=Gaelic Trips
   S3_BUCKET_NAME=gaa-trips-production
   AWS_ACCESS_KEY_ID=your-production-aws-key
   AWS_SECRET_ACCESS_KEY=your-production-aws-secret
   NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token
   ```

   **For Staging/Preview:**
   ```
   DATABASE_URL=your-staging-supabase-url
   NEXTAUTH_SECRET=your-staging-secret
   NEXTAUTH_URL=https://staging-gaa-trips.vercel.app
   RESEND_API_KEY=re_your_staging_key
   RESEND_FROM_EMAIL=staging@your-domain.com
   RESEND_FROM_NAME=Gaelic Trips (Staging)
   S3_BUCKET_NAME=gaa-trips-staging
   AWS_ACCESS_KEY_ID=your-staging-aws-key
   AWS_SECRET_ACCESS_KEY=your-staging-aws-secret
   NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token
   ```

### Step 4: Configure Staging Database

1. **Create Staging Database on Supabase**:
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Create new project: "gaa-trips-staging"
   - Copy the database URL

2. **Clone Production Schema**:
   ```bash
   # Install Supabase CLI if not already installed
   npm install -g supabase

   # Or use pg_dump if you have postgres tools
   pg_dump "your-production-database-url" --schema-only > schema.sql
   psql "your-staging-database-url" < schema.sql
   ```

3. **Update Schema**:
   ```bash
   # Set staging database URL temporarily
   export DATABASE_URL="your-staging-database-url"
   
   # Push schema changes
   npx prisma db push
   
   # Seed with test data
   npx prisma db seed
   ```

### Step 5: Create Staging-Specific Resources

1. **Create Staging S3 Bucket**:
   - Go to AWS S3 Console
   - Create bucket: `gaa-trips-staging`
   - Copy production bucket policies/settings

2. **Create Staging Resend Configuration**:
   - Go to Resend dashboard
   - Create new API key for staging
   - Use different from email: `staging@your-domain.com`

### Step 6: Set Up Branch Protection

1. **In GitHub Repository**:
   - Go to Settings → Branches
   - Add branch protection rule for `staging`
   - Require pull request reviews
   - Require status checks to pass

2. **Configure Vercel Integration**:
   - Go to Vercel → Integrations → GitHub
   - Ensure it has access to your repository
   - Configure to deploy all branches

### Step 7: Test the Setup

1. **Make a Test Change**:
   ```bash
   # On staging branch
   git checkout staging
   
   # Make a small change (e.g., update a text string)
   echo "// Staging test" >> src/components/Header.tsx
   
   git add .
   git commit -m "Test staging deployment"
   git push origin staging
   ```

2. **Check Vercel Dashboard**:
   - You should see a new deployment
   - It will have a unique URL like: `https://gaa-trips-git-staging-yourteam.vercel.app`

3. **Test Email Functionality**:
   ```bash
   # Test email with staging environment
   # The emails will use staging@your-domain.com
   ```

## 🔧 Vercel CLI Setup (Optional)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login and Link Project**:
   ```bash
   vercel login
   vercel link
   ```

3. **Deploy from Command Line**:
   ```bash
   # Deploy to staging
   vercel --env=preview
   
   # Deploy to production
   vercel --prod
   ```

## 📋 Environment Variables Checklist

### Required for Both Environments:
- [ ] `DATABASE_URL`
- [ ] `NEXTAUTH_SECRET`
- [ ] `NEXTAUTH_URL`
- [ ] `RESEND_API_KEY`
- [ ] `RESEND_FROM_EMAIL`
- [ ] `RESEND_FROM_NAME`
- [ ] `S3_BUCKET_NAME`
- [ ] `AWS_ACCESS_KEY_ID`
- [ ] `AWS_SECRET_ACCESS_KEY`
- [ ] `NEXT_PUBLIC_MAPBOX_TOKEN`

### Staging-Specific Values:
- [ ] Different database URL
- [ ] Different NEXTAUTH_SECRET
- [ ] Staging domain in NEXTAUTH_URL
- [ ] Staging Resend API key
- [ ] Staging email address
- [ ] Staging S3 bucket
- [ ] Staging AWS credentials

## 🚀 Workflow After Setup

1. **Development**:
   ```bash
   # Work on feature branch
   git checkout -b feature/new-feature
   # Make changes
   git commit -m "Add new feature"
   git push origin feature/new-feature
   ```

2. **Staging**:
   ```bash
   # Merge to staging for testing
   git checkout staging
   git merge feature/new-feature
   git push origin staging
   # Test on staging URL
   ```

3. **Production**:
   ```bash
   # After staging approval
   git checkout production
   git merge staging
   git push origin production
   # Deploys to production
   ```

## 🔍 Monitoring and Debugging

1. **Check Deployment Status**:
   - Vercel Dashboard → Deployments
   - View build logs
   - Check function logs

2. **Environment Variables**:
   - Settings → Environment Variables
   - Verify all variables are set correctly
   - Check scoping (Production vs Preview)

3. **Domain Configuration**:
   - Settings → Domains
   - Add custom domains for staging if needed

## 🛠️ Troubleshooting

### Common Issues:

1. **Environment Variables Not Loading**:
   - Check variable scoping (Production vs Preview)
   - Redeploy after adding variables
   - Verify variable names match exactly

2. **Database Connection Issues**:
   - Verify DATABASE_URL format
   - Check Supabase project is active
   - Ensure database allows connections

3. **Email Not Sending**:
   - Verify RESEND_API_KEY is correct
   - Check from email is verified in Resend
   - Test with different email addresses

## 📝 Quick Commands Reference

```bash
# Create staging setup
git checkout -b staging
git push -u origin staging

# Create production branch
git checkout -b production
git push -u origin production

# Deploy specific branch
vercel --env=preview  # staging
vercel --prod         # production

# Check deployment status
vercel ls
```

## 🎯 Next Steps

1. **Set up the staging database** (Supabase)
2. **Configure environment variables** in Vercel
3. **Test email functionality** with staging Resend key
4. **Create your first staging deployment**
5. **Document the workflow** for your team

---
*This setup gives you a robust staging environment for testing changes before production deployment.*