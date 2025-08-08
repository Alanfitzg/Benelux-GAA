# PlayAway Development Guide

## 💻 Development Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm test             # Run Jest unit tests
npm run test:watch   # Run Jest tests in watch mode
npm run test:coverage # Run tests with coverage report
npm run test:e2e     # Run Playwright end-to-end tests
npx prisma generate  # Generate Prisma client
npx prisma db push   # Apply schema changes
```

## 🧪 Testing Infrastructure (Updated August 2025)

### **Test Coverage**
- **Unit Tests**: Components, hooks, and utility functions
- **Integration Tests**: API routes and database interactions
- **Validation Tests**: Form validation and data integrity
- **End-to-End Tests**: Playwright for user journey testing

### **Jest Configuration**
- **Environment**: jsdom for React component testing
- **Setup**: Enhanced mocks for Next.js, NextAuth, and Framer Motion
- **Coverage**: Configurable thresholds with exclusions for generated files
- **Path Mapping**: Supports `@/` alias for clean imports

### **Recently Added Test Suites**
1. **`CreateEventButton.test.tsx`** - Form submission prevention and auth flow testing
2. **`useAuthCheck.test.tsx`** - Authentication hook testing with session states
3. **`pitch-validation.test.ts`** - Comprehensive pitch data validation testing
4. **`date-validation.test.ts`** - Event date validation with edge cases
5. **`club-verification.test.ts`** - Club verification requirements and completeness
6. **`useAnalytics.test.ts`** - Google Analytics tracking hook testing

### **Test Mocking Strategy**
- **Next.js**: Router, Image, Link components fully mocked
- **NextAuth**: Session management and authentication flows
- **Framer Motion**: Animation components simplified for testing
- **Analytics**: Google Analytics gtag function with error handling
- **APIs**: HTTP requests and database operations mocked appropriately

### **Testing Best Practices**
- **Component Testing**: Focus on user interactions and accessibility
- **Hook Testing**: Test state changes and side effects
- **Validation Testing**: Cover edge cases and error conditions
- **Integration Testing**: Test API endpoints with mocked dependencies
- **Error Handling**: Test graceful failures and fallback behaviors

### **Test Commands**
```bash
npm test                    # Run all tests
npm run test:watch          # Watch mode for development
npm run test:coverage       # Generate coverage reports
npm run test:e2e           # Run Playwright tests
npm run test:e2e:ui        # Run Playwright with UI
npm run test:e2e:debug     # Debug Playwright tests
```

## 🔧 Common Tasks
- **Add database indexes**: Update schema.prisma, then `npx prisma db push`
- **Clear caches**: POST to `/api/admin/clear-cache` (super admin only)
- **Monitor geocoding cache**: GET `/api/admin/geocode-cache`
- **Test build**: Always run `npm run build` before committing
- **Run tests**: Always run `npm test` before committing changes
- **Create database backup**: `npx tsx scripts/export-current-data.ts`
- **Restore from backup**: `npx tsx scripts/restore-data.ts backups/export-[timestamp]`

## 📝 Code Style
- NO comments unless specifically requested
- Follow existing patterns in codebase
- Use TypeScript strict mode
- Prefer server components where possible

## 🚨 Critical Reminders
- NEVER commit NEXTAUTH_SECRET to git
- NEVER commit OAuth secrets (GOOGLE_CLIENT_SECRET) to git
- Images use `unoptimized: true` due to Vercel limits
- Always test with `npm run build` before deploying
- Database indexes are CRITICAL for performance
- OAuth users have empty password field - use `hasPassword` field to check auth method

## 📝 Database Management Scripts (August 2025)

### 🗺️ Database Seeding (Original Data)
After database resets or when importing old data:

```bash
# Seed database with clubs in PENDING status
npm run db:seed

# Seed database with auto-approved clubs (for trusted data)
npm run db:seed:approve

# Approve all pending clubs after import
npm run db:approve-clubs
```

**Key Scripts:**
- **`scripts/seed-database.js`**: Comprehensive seeding with clubs, city images, and default admin
- **`scripts/approve-seeded-clubs.js`**: Bulk approve pending clubs with safety checks
- **Club Status Management**: Imported clubs default to PENDING unless --auto-approve flag is used
- **Cache Invalidation**: API now detects and rebuilds stale caches automatically

### 💾 Database Backup & Restore System (NEW)
Complete backup/restore system for production data protection:

```bash
# Create full database backup (timestamped)
npx tsx scripts/export-current-data.ts

# Safely restore from backup (never overwrites existing data)
npx tsx scripts/restore-data.ts backups/export-[timestamp]
```

**Backup System Features:**
- **`scripts/export-current-data.ts`**: Complete database export to JSON files
- **`scripts/restore-data.ts`**: Safe restore that never overwrites existing data
- **`scripts/backup-restore-guide.md`**: Comprehensive documentation
- **Safety Guarantees**: Restore only adds missing records, preserves all existing data
- **Relationship Preservation**: Maintains all foreign key relationships and data integrity
- **Progress Monitoring**: Detailed output showing what was restored vs. skipped
- **Backup Structure**: Timestamped folders with all tables exported to individual JSON files

**What Gets Backed Up:**
- Users (with preferences, OAuth accounts, admin requests)
- Clubs (with events, availability data, tournament interests)
- Events (with club references and relationships)
- Feature flags and system configuration
- Surveys and user feedback
- All relationship and metadata tables

## 🎯 User Experience Improvements
- **Seamless Registration**: Auto sign-in after account creation, instant approval for all users
- **Smart Redirects**: Welcome banner for new users, intelligent post-login routing
- **Enhanced Password UX**: Show/hide toggles, visual feedback, strength meter, requirements checklist
- **Flexible Login**: Users can sign in with either email or username
- **Password Recovery**: Self-service password reset with secure email links
- **Remember Me**: Optional extended session duration
- **Optional Fields**: Full name no longer mandatory
- **Simplified Onboarding**: Removed club association from signup (moved to post-registration)
- **Google OAuth**: One-click sign-in/up with Google accounts
- **Account Linking**: Existing users can seamlessly link Google to their accounts
- **Admin Visibility**: OAuth provider indicators in admin panel for better user support
- **Club Admin Requests**: Users can request admin access from their profile via searchable club selection
- **Streamlined Onboarding**: Simplified competitive levels (3 focused options) and removed unnecessary questions

## 🎯 Competitive Level Updates
Updated from 5 complex options to 3 focused categories:
1. **Social Tournament**: More interested in trip than competition - focus on fun, culture, craic
2. **Competitive Friendly**: High-level teams (usually Irish) wanting strong competition  
3. **Training Camp Abroad**: Team preparation focused with training facilities