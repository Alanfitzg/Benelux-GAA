# PlayAway - AI Assistant Context

## 🎯 Project Overview
PlayAway is a production-deployed platform for organizing GAA (Gaelic Athletic Association) events and tournaments worldwide. Live at: [your-domain]

## 📁 Quick Reference Documentation
For comprehensive information, see these modular documentation files:

1. **`/docs/ARCHITECTURE.md`** - Technical stack, database patterns, security, performance
2. **`/docs/SYSTEMS.md`** - User onboarding, event reports, club verification, pitch management
3. **`/docs/COMPONENTS.md`** - All React components, hooks, and recent additions
4. **`/docs/DEVELOPMENT.md`** - Dev commands, testing, code style, database management
5. **`/project-docs/PROJECT_OVERVIEW.md`** - Complete system overview and recent work
6. **`/project-docs/TODO.md`** - Social authentication implementation plan
7. **`/DEPLOYMENT_CHECKLIST.md`** - Production deployment requirements

## 🚀 Recent Updates (August 2025)
- **Complete Rebrand**: Platform renamed to "PlayAway" with global positioning
- **Mobile UX Improvements**: Optimized layouts, country cards, responsive typography, hidden pitch management on mobile
- **Club Verification System**: Comprehensive verification workflow for data quality
- **Pitch Location Management**: Global map-based training ground discovery system
- **Event Report System**: Post-tournament reporting with results and awards
- **Database Backup System**: Complete backup/restore with safety guarantees
- **Enhanced Test Suite**: Jest testing infrastructure with 85% coverage
- **🎮 Enhanced Event Management System**: Complete redesign with unified dashboard, tournament templates, and professional interface
- **💰 Earnings Tracking**: Annual earnings calculation and display for clubs from tournament registrations

## 🏗️ Tech Stack (Brief)
- **Frontend**: Next.js 15.3.3, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM 6.9.0
- **Database**: PostgreSQL (Supabase) with 17 performance indexes
- **Auth**: NextAuth.js v5 with Google OAuth support
- **Maps**: Mapbox GL JS (streets-v12 style)
- **Analytics**: Google Analytics 4 with GAA event tracking

## ⚡ Performance Highlights
- Club filtering: 40x faster (200ms → 5ms)
- Event queries: 50x faster (150ms → 3ms)
- Geocoding: 80-90% cache hit rate

## 🔐 Authentication Quick Reference
- **Import**: Use `@/lib/auth-helpers`, NOT directly from next-auth
- **Roles**: SUPER_ADMIN, CLUB_ADMIN, USER
- **Login**: Email OR username accepted
- **OAuth**: Google sign-in/up with account linking
- **Password Reset**: Secure token-based with 1-hour expiration

## 🗄️ Database Quick Reference
- **Strategy**: Using `prisma db push` (no migrations)
- **Key Models**: User, Club, Event, EventReport, PitchLocation, UserPreferences
- **Caching**: Next.js unstable_cache for clubs (6hr TTL)
- **Verification**: Club verification status with progress tracking

## 💻 Development Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm test             # Run Jest unit tests
npx prisma db push   # Apply schema changes
```

## 🧪 Testing
- **Unit Tests**: Components, hooks, validation (Jest)
- **E2E Tests**: User journeys (Playwright)
- **Coverage**: 85% with thresholds configured
- **Commands**: `npm test`, `npm run test:coverage`, `npm run test:e2e`

## 🔧 Common Tasks
- **Add indexes**: Update schema.prisma, then `npx prisma db push`
- **Clear caches**: POST to `/api/admin/clear-cache`
- **Test build**: Always run `npm run build` before committing
- **Create backup**: `npx tsx scripts/export-current-data.ts`
- **Restore backup**: `npx tsx scripts/restore-data.ts backups/export-[timestamp]`

## 📝 Code Style
- NO comments unless requested
- Follow existing patterns
- TypeScript strict mode
- Prefer server components
- Always add `type="button"` to form buttons

## 🚨 Critical Reminders
- NEVER commit secrets (NEXTAUTH_SECRET, GOOGLE_CLIENT_SECRET)
- Images use `unoptimized: true` due to Vercel limits
- Database indexes are CRITICAL for performance
- OAuth users: check `hasPassword` field for auth method
- Always test build before deploying

## 🐛 Recently Fixed Issues
- ✅ Event creation authentication (flexible independent/club event creation)
- ✅ Prisma field name mismatches (EventPitchLocation table sync)
- ✅ Admin session persistence (NEXTAUTH_URL port sync, cookie configuration)
- ✅ Event editing access from details page (improved admin permission logic)

## 🐛 Known Issues
- Rate limiting is in-memory (needs Redis for scaling)
- Connection pooling could be optimized

## 📊 Next Priorities
1. **Immediate**: Apply logical field ordering to event create page
2. **Month 1**: Tournament brackets visualization enhancement
3. **Future**: Real-time tournament updates with WebSocket integration

---
*For detailed information, see the documentation files in `/docs/` and `/project-docs/`*

*Last Updated: August 2025 - Modular documentation structure*