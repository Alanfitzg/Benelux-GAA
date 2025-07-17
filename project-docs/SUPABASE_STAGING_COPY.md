# Copying Supabase Project for Staging

## 🎯 Overview
You can copy your existing Supabase project to create a staging environment with the same schema and optionally some data.

## 🚀 Method 1: Database Schema Copy (Recommended)

### Step 1: Create New Supabase Project
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Name it: "gaa-trips-staging"
4. Choose same region as production
5. Set password and create project

### Step 2: Export Production Schema
```bash
# Install pg_dump if not already available
# On macOS: brew install postgresql

# Export schema only (no data)
pg_dump "your-production-database-url" \
  --schema-only \
  --no-owner \
  --no-privileges \
  --file=staging-schema.sql
```

### Step 3: Import Schema to Staging
```bash
# Import schema to staging database
psql "your-staging-database-url" \
  --file=staging-schema.sql
```

### Step 4: Update Prisma and Seed Data
```bash
# Temporarily use staging database
export DATABASE_URL="your-staging-database-url"

# Generate Prisma client for staging
npx prisma generate

# Push any additional schema changes
npx prisma db push

# Seed with test data
npx prisma db seed
```

## 🔄 Method 2: Schema + Sample Data Copy

### Step 1: Export Schema + Data
```bash
# Export schema and data (be careful with sensitive data)
pg_dump "your-production-database-url" \
  --no-owner \
  --no-privileges \
  --file=staging-full.sql
```

### Step 2: Import to Staging
```bash
# Import everything to staging
psql "your-staging-database-url" \
  --file=staging-full.sql
```

### Step 3: Sanitize Staging Data
Create a script to clean sensitive data:

```bash
# Create sanitization script
cat > sanitize-staging.sql << 'EOF'
-- Sanitize user emails
UPDATE users SET 
  email = CONCAT('test', id, '@example.com'),
  name = CONCAT('Test User ', id)
WHERE role != 'SUPER_ADMIN';

-- Keep admin users but change emails
UPDATE users SET 
  email = CONCAT('admin', id, '@staging.com')
WHERE role = 'SUPER_ADMIN';

-- Remove sensitive contact messages
DELETE FROM contact_messages WHERE created_at < NOW() - INTERVAL '30 days';

-- Clear any API keys or secrets
UPDATE settings SET value = 'staging-placeholder' WHERE key LIKE '%_key%';
EOF

# Run sanitization
psql "your-staging-database-url" --file=sanitize-staging.sql
```

## 🛠️ Method 3: Using Supabase CLI

### Step 1: Install Supabase CLI
```bash
npm install -g supabase
```

### Step 2: Login and Link Production
```bash
supabase login
supabase link --project-ref your-production-project-id
```

### Step 3: Generate Types and Schema
```bash
# Generate schema file
supabase db dump --schema-only > staging-schema.sql

# Generate types
supabase gen types typescript --local > types/supabase.ts
```

### Step 4: Apply to Staging
```bash
# Link to staging project
supabase link --project-ref your-staging-project-id

# Apply schema
supabase db reset --linked
```

## 📋 Method 4: Manual Migration (For Complex Cases)

### Step 1: Document Current Schema
```bash
# Generate current schema documentation
npx prisma db pull
npx prisma generate
```

### Step 2: Create Staging Project
1. Create new Supabase project
2. Run your existing migrations:

```bash
# Set staging database URL
export DATABASE_URL="your-staging-database-url"

# Apply schema
npx prisma db push

# Run seeds
npx prisma db seed
```

## 🔧 Automated Script Approach

Create a script to automate the process:

```bash
#!/bin/bash
# copy-to-staging.sh

echo "🚀 Copying production to staging..."

# Set variables
PROD_DB_URL="your-production-database-url"
STAGING_DB_URL="your-staging-database-url"

# Export schema
echo "📤 Exporting production schema..."
pg_dump "$PROD_DB_URL" \
  --schema-only \
  --no-owner \
  --no-privileges \
  --file=temp-schema.sql

# Import to staging
echo "📥 Importing to staging..."
psql "$STAGING_DB_URL" --file=temp-schema.sql

# Clean up
rm temp-schema.sql

# Seed staging data
echo "🌱 Seeding staging data..."
export DATABASE_URL="$STAGING_DB_URL"
npx prisma db seed

echo "✅ Staging database ready!"
```

## 🎯 Recommended Approach for Your Setup

For your GAA Trips project, I recommend **Method 1** (Schema Copy):

```bash
# 1. Create staging project in Supabase
# 2. Export schema
pg_dump "your-production-db-url" --schema-only --no-owner --no-privileges --file=schema.sql

# 3. Import to staging
psql "your-staging-db-url" --file=schema.sql

# 4. Seed with test data
export DATABASE_URL="your-staging-db-url"
npx prisma db seed
```

## 🔍 Finding Your Database URLs

### Production Database URL:
Check your current `.env` file or Vercel environment variables

### Staging Database URL:
1. Go to Supabase staging project
2. Settings → Database
3. Copy connection string
4. Format: `postgresql://postgres:[password]@[host]:5432/postgres`

## 📝 After Copying

1. **Update Vercel environment variables**:
   ```
   DATABASE_URL = your-staging-database-url (Preview environment)
   ```

2. **Test the connection**:
   ```bash
   export DATABASE_URL="your-staging-database-url"
   npx prisma db pull
   ```

3. **Verify in Supabase dashboard**:
   - Check that tables exist
   - Verify data is there (if you copied data)

## 🚨 Important Notes

- **Don't copy sensitive production data** to staging
- **Use different passwords** for staging
- **Sanitize any copied data** (emails, names, etc.)
- **Keep staging database smaller** than production
- **Set up automated backups** for staging too

Would you like me to help you with any specific step, like finding your database URLs or creating the copy script?