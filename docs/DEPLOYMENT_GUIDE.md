# Deployment Guide - Preventing Data Loss

## ⚠️ Critical Understanding

**Git tracks CODE, not DATABASE data**

When you commit and push:

- ✅ Code changes (TypeScript, React, etc.) → Saved in git
- ✅ Images and assets → Saved in git
- ✅ Configuration files → Saved in git
- ❌ **Database records** → **NOT saved in git**

**This means:** Running database scripts locally does NOT automatically update production!

---

## 🔄 The Complete Workflow

### **Before Making Database Changes**

```bash
# 1. Create a backup BEFORE making changes
npx tsx scripts/export-current-data.ts

# 2. Commit the backup (optional but recommended)
git add backups/
git commit -m "Backup before [describe changes]"
git push
```

### **Making Database Changes**

```bash
# 3a. Run your database scripts
npx tsx scripts/fix-continental-european-clubs.ts

# OR 3b. Make manual database updates
# (via admin UI, SQL, etc.)

# 4. Test that changes worked
npm run dev
# Visit http://localhost:3000/clubs and verify
```

### **After Making Database Changes**

```bash
# 5. Create a NEW backup with your changes
npx tsx scripts/export-current-data.ts

# 6. Commit BOTH your code AND the backup
git add scripts/ backups/ src/ public/
git commit -m "Update European clubs

DATABASE CHANGES:
- Added 50 continental European clubs
- Fixed club crest URLs
- Updated club information

BACKUP INCLUDED:
backups/export-2025-10-22*/

To apply to production:
npx tsx scripts/restore-data.ts backups/export-2025-10-22*
"

# 7. Push everything
git push
```

### **Deploying to Production**

```bash
# 8a. If using Vercel/Netlify (code auto-deploys)
# Code will deploy automatically, but DATABASE won't update

# 8b. Manually update production database
# Option A: Restore from backup
DATABASE_URL="your-production-url" npx tsx scripts/restore-data.ts backups/export-2025-10-22*/

# Option B: Re-run the scripts against production
DATABASE_URL="your-production-url" npx tsx scripts/fix-continental-european-clubs.ts

# 9. Verify on production site
# Visit https://your-site.com/clubs and check
```

---

## 🎯 Quick Reference Checklist

### **When Updating Club Data:**

- [ ] **Step 1:** Create backup → `npx tsx scripts/export-current-data.ts`
- [ ] **Step 2:** Make database changes (run scripts)
- [ ] **Step 3:** Test locally → `npm run dev` and check `/clubs`
- [ ] **Step 4:** Create NEW backup → `npx tsx scripts/export-current-data.ts`
- [ ] **Step 5:** Commit code + backup with clear message
- [ ] **Step 6:** Push to git
- [ ] **Step 7:** Deploy code (automatic)
- [ ] **Step 8:** Update production database (manual)
- [ ] **Step 9:** Verify on live site

### **When Updating Code Only (No Data):**

- [ ] Make code changes
- [ ] Test locally
- [ ] Commit and push
- [ ] Deploy (automatic)
- [ ] No database update needed ✅

---

## 🔧 Common Scripts

### **Database Management:**

```bash
# Export (backup) current database
npx tsx scripts/export-current-data.ts

# Restore from backup
npx tsx scripts/restore-data.ts backups/export-[timestamp]/

# Fix Continental European clubs
npx tsx scripts/fix-continental-european-clubs.ts

# Sync schema to database (use carefully!)
npx prisma db push
```

### **Backup Management:**

```bash
# List all backups
ls -lh backups/

# Find latest backup
ls -lht backups/ | head -2

# Check backup contents
cat backups/export-[timestamp]/export-summary.json
```

---

## 🚨 Troubleshooting

### **"My changes disappeared!"**

**Diagnosis:**

```bash
# Check if scripts exist
ls scripts/*.ts

# Check if backup exists
ls backups/export-2025-10-*/

# Check current database state
npx tsx -e "import {prisma} from './src/lib/prisma'; prisma.club.count().then(c => console.log('Clubs:', c))"
```

**Solution:**

```bash
# If you have a backup, restore it
npx tsx scripts/restore-data.ts backups/export-[timestamp]/

# If no backup, re-run your scripts
npx tsx scripts/fix-continental-european-clubs.ts
```

### **"Local works but production doesn't"**

**Cause:** Database changes were made locally but not applied to production

**Solution:**

```bash
# Apply changes to production
DATABASE_URL="production-url" npx tsx scripts/restore-data.ts backups/latest/
```

### **"Schema mismatch error"**

**Cause:** Prisma schema doesn't match database

**Solution:**

```bash
# Sync schema (will accept data loss if needed)
npx prisma db push --accept-data-loss

# Re-run your scripts
npx tsx scripts/fix-continental-european-clubs.ts
```

---

## 🎓 Best Practices

### **1. Always Backup Before Changes**

```bash
# Good habit: Start every work session with
npx tsx scripts/export-current-data.ts
```

### **2. Use Clear Commit Messages**

❌ **Bad:**

```
git commit -m "update clubs"
```

✅ **Good:**

```
git commit -m "Add 50 European clubs with crests

DATABASE CHANGES INCLUDED IN: backups/export-2025-10-22*/
Run: npx tsx scripts/restore-data.ts [backup-dir]"
```

### **3. Test Locally First**

Always test on local database before touching production:

```bash
# Local testing
npm run dev
# Check http://localhost:3000/clubs

# If good, then apply to production
```

### **4. Keep Backups in Git**

Don't add backups to `.gitignore`. They're your safety net!

### **5. Document Database Scripts**

Every database script should have a clear purpose:

```typescript
// scripts/fix-european-clubs.ts
// PURPOSE: Import continental European clubs from CSV and link crests
// WHEN TO RUN: After adding new European clubs to docs/Allgaaclubs.csv
// SAFETY: Safe to run multiple times (uses upsert logic)
```

---

## 📦 Automated Backups

We've set up a git hook that automatically creates backups after commits that mention:

- "club", "data", "import", "database", "restore", "backup"

**Location:** `.husky/post-commit`

This runs in the background and doesn't slow down your workflow.

---

## 🆘 Emergency Recovery

If you lose data and have NO backup:

1. **Check production database** (might still have it)
2. **Check git reflog** for deleted commits: `git reflog`
3. **Check stashed changes**: `git stash list`
4. **Re-run import scripts** from source data (CSV files)
5. **Ask team members** for their latest backup

---

## 📞 Getting Help

- Issue: Data disappeared → Check this guide's "Troubleshooting" section
- Issue: Schema errors → Run `npx prisma db push`
- Issue: Script failing → Check script comments for usage
- Issue: Production sync → Follow "Deploying to Production" section

---

**Last Updated:** October 22, 2025
**Maintained by:** PlayAway Development Team
