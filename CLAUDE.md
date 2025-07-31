# GAA Trips - AI Assistant Context

## 🎯 Project Overview
GAA Trips is a production-deployed platform for organizing GAA (Gaelic Athletic Association) events and tournaments across Europe. Live at: [your-domain]

## 🏗️ Technical Stack
- **Frontend**: Next.js 15.3.3, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM 6.9.0
- **Database**: PostgreSQL (Supabase)
- **Auth**: NextAuth.js v5 (beta) - credentials only
- **Storage**: AWS S3 for images
- **Maps**: Mapbox for geocoding and location services (streets-v12 style)
- **Analytics**: Google Analytics 4 with custom GAA event tracking
- **UI/UX**: Framer Motion animations, @hello-pangea/dnd for drag-and-drop
- **Notifications**: react-hot-toast for user feedback
- **Deployment**: Vercel

## 📁 Key Project Documentation
When starting a new session, these files provide comprehensive context:

1. **`/project-docs/PROJECT_OVERVIEW.md`** - Complete system overview, architecture, recent work
2. **`/project-docs/TODO.md`** - Social authentication implementation plan
3. **`/project-docs/TODO_REVIEW_AND_RECOMMENDATIONS.md`** - Post-launch roadmap and priorities
4. **`/DEPLOYMENT_CHECKLIST.md`** - Production deployment requirements
5. **`/DATABASE_OPTIMIZATIONS.md`** - Performance optimization details
6. **`/DATABASE_INDEXES_ADDED.md`** - Specific index implementations

## 🚀 Recent Achievements (December 2024)
- **Production deployed** with all core features operational
- **Performance optimized**: 10-50x query improvements via database indexes
- **Caching implemented**: 80-90% Mapbox API cost reduction
- **Image delivery fixed**: Direct S3 serving to bypass Vercel limits

## 🚀 Recent Updates (January 2025)
- **Calendar functionality**: Tournament interest system with flexible date options
- **Password security**: Real-time validation with visual requirements checklist
- **Auto sign-in**: Seamless registration → sign-in flow with smart redirects
- **User onboarding**: Instant approval for non-club users, welcome messaging
- **Authentication UX**: Show/hide password toggles, email/username login flexibility
- **Password reset**: Secure token-based password reset with email notifications
- **Google OAuth**: Sign in/up with Google, automatic username generation
- **OAuth edge cases**: Prevents password reset for OAuth users, blocks conflicting accounts
- **User Onboarding Flow**: Comprehensive preference collection with drag-and-drop ranking
- **Feature Toggles**: Admin dashboard integration for easy feature management
- **Club Admin Requests**: Profile-based system for requesting admin rights to clubs
- **Google Analytics 4**: Comprehensive event tracking for user behavior and GAA-specific actions
- **Map Enhancement**: Updated to colorful streets-v12 style for better visual appeal
- **Onboarding Streamlined**: Removed activities and flight time questions, focused competitive levels

## ⚡ Performance Metrics
- Club filtering: 200ms → 5ms (40x faster)
- Event queries: 150ms → 3ms (50x faster)
- Admin operations: 100ms → 2ms (50x faster)
- Geocoding: 80-90% cache hit rate

## 🎨 Key UI/UX Patterns
- Mobile-first responsive design
- Framer Motion animations throughout
- Gradient designs with glass morphism
- Sticky navigation on detail pages
- Tournament-specific UI sections

## 🔐 Authentication & Security
- **Auth**: Import from `@/lib/auth-helpers`, NOT directly from next-auth
- **Roles**: SUPER_ADMIN, CLUB_ADMIN, USER
- **Account Status**: Auto-approval for all new users (simplified from manual approval)
- **Login Flexibility**: Users can sign in with either email OR username
- **Password Features**: Show/hide toggles, strength meter, real-time validation (8+ chars, uppercase, lowercase, number)
- **Password Reset**: Secure token-based system with 1-hour expiration and email notifications
- **Remember Me**: Extended session duration (30 days) with localStorage preference
- **Auto Sign-in**: Users automatically signed in after successful registration
- **Google OAuth**: Complete Google sign-in/up with automatic username generation from email
- **Account Linking**: Existing users can link Google to their password accounts seamlessly
- **OAuth Security**: Prevents password reset for OAuth users, secure account association
- **OAuth Edge Cases**: Handles email conflicts, prevents account takeover, graceful error handling
- **Rate Limiting**: Currently in-memory (needs Redis for scaling)

## 🗄️ Database Patterns
- **No migrations**: Using `prisma db push` strategy
- **17 performance indexes** added for common queries
- **Caching**: Next.js unstable_cache for club data (6hr TTL)
- **Geocoding cache**: In-memory with 30-day TTL
- **Calendar Models**: AvailabilitySlot, TournamentInterest with flexible date types
- **Password Reset**: PasswordResetToken model with secure token hashing and expiration
- **OAuth Accounts**: Account model tracks Google/Facebook OAuth associations
- **Optional Fields**: Full name field is optional in user registration
- **Club Association**: Moved from registration to post-signup (users request access from club pages)
- **User Preferences**: UserPreferences model stores travel motivations (ranked), competitive level, destinations, activities, and timing preferences

## 🐛 Known Issues
- Rate limiting is in-memory (doesn't scale across instances)
- Connection pooling could be optimized
- Some legacy event types mixed with new system

## 🎯 User Onboarding System (NEW - January 2025)

### **Feature Toggle Control**
- **Admin Access**: `/admin/features` - toggleable "User Onboarding Flow" feature
- **Default State**: Disabled (experimental feature)
- **Location**: Integrated into main admin dashboard

### **Onboarding Flow Components**
1. **Travel Motivations** (Step 1)
   - 9 simplified options: Sun, Budget, Specific Place, Activities, Social, Tournaments, Quick Trips, Culture, Friends
   - **Drag-and-drop ranking**: Users select and rank by priority
   - **Smart UI**: Selection grid + ranked list with visual feedback

2. **Competitive Level** (Step 2)
   - 5 levels: Casual/Social, Mixed Ability, Competitive Irish, International Challenge, Elite
   - Single selection with detailed descriptions

3. **Optional Details** (Step 3)
   - **Cities/Countries**: Manual input with tags
   - **Budget Range**: Budget, Mid-range, Premium options
   - **Activities**: 8 activity types (surfing, hiking, etc.)
   - **Travel Timing**: Seasonal quick-select + individual months

4. **Completion Summary** (Step 4)
   - Shows ranked preferences and selections
   - Saves to database with completion flag

### **Database Schema**
```prisma
model UserPreferences {
  motivations      String[]  // Ranked array of motivation IDs
  competitiveLevel String?   // Single competitive level
  preferredCities  String[]  // User-input cities
  preferredCountries String[] // User-input countries  
  activities       String[]  // Selected activity types
  budgetRange      String?   // Budget preference
  preferredMonths  String[]  // Travel month preferences
  onboardingCompleted Boolean
  onboardingSkipped   Boolean
}
```

### **Integration Points**
- **Automatic Trigger**: Shows for new users after feature enabled
- **Profile Management**: Edit preferences from `/profile` page
- **Skip Option**: Users can skip and set preferences later
- **API Endpoints**: `/api/user/preferences` (GET, POST, PATCH)

### **Technical Implementation**
- **Components**: `/src/components/onboarding/` directory
- **Drag & Drop**: @hello-pangea/dnd library for ranking
- **State Management**: React hooks with real-time updates
- **Responsive Design**: Mobile-first with compact modal layout
- **Animations**: Framer Motion for smooth transitions

## 📊 Next Priorities (Post-Launch)
1. **Week 1**: Google Analytics 4 setup
2. **Week 2**: Email automation (Resend already integrated)
3. **Week 3-4**: ✅ Google OAuth COMPLETED - Facebook OAuth next
4. **Month 2**: ✅ User Onboarding COMPLETED - Tournament brackets visualization
5. **Future**: Preference-based recommendation engine using collected data

## 💻 Development Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npx prisma generate  # Generate Prisma client
npx prisma db push   # Apply schema changes
```

## 🔧 Common Tasks
- **Add database indexes**: Update schema.prisma, then `npx prisma db push`
- **Clear caches**: POST to `/api/admin/clear-cache` (super admin only)
- **Monitor geocoding cache**: GET `/api/admin/geocode-cache`
- **Test build**: Always run `npm run build` before committing

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

## 📋 New Components Added
- **`/src/components/auth/PasswordRequirements.tsx`** - Real-time password validation checklist
- **`/src/components/auth/PasswordStrengthMeter.tsx`** - Visual password strength indicator
- **Calendar Components**: ClubCalendar, InterestSubmissionForm, ClubCalendarManagement
- **SignInPromptModal**: For anonymous users to sign up/in for calendar features
- **`/src/components/onboarding/OnboardingModal.tsx`** - Main 4-step onboarding modal with progress tracking
- **`/src/components/onboarding/MotivationSelector.tsx`** - Drag-and-drop travel motivation ranking
- **`/src/components/onboarding/CompetitiveSelector.tsx`** - Competitive level selection with descriptions
- **`/src/components/onboarding/DetailPreferences.tsx`** - Optional preference details with seasonal month selection
- **`/src/components/onboarding/OnboardingComplete.tsx`** - Summary and completion confirmation
- **`/src/components/onboarding/OnboardingProvider.tsx`** - Global provider for triggering onboarding
- **`/src/components/profile/PreferencesSection.tsx`** - Profile integration for editing preferences
- **`/src/components/profile/ClubSelectionModal.tsx`** - Modal for selecting clubs and requesting admin access
- **`/src/components/GoogleAnalytics.tsx`** - Google Analytics 4 integration component
- **`/src/hooks/useOnboarding.ts`** - Hook for onboarding state management
- **`/src/hooks/useAnalytics.ts`** - Hook for Google Analytics event tracking
- **`/src/lib/constants/onboarding.ts`** - Centralized onboarding options and configurations
- **`/src/lib/analytics.ts`** - Google Analytics utilities and event definitions

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

## 📊 Google Analytics 4 Implementation

### **Measurement ID**: `G-P01Z2DYLMH`

### **Tracked Events**:
- **Authentication**: sign_up, login, logout (with method: credentials/google)
- **Onboarding**: onboarding_complete, onboarding_skip
- **Club Actions**: club_admin_request, club_view, club_contact
- **User Journey**: tournament_interest, event_registration, search actions
- **Form Submissions**: contact_form_submit, survey_submit

### **Custom Properties**:
- User role (super_admin, club_admin, user)
- Club information (ID, name, location)
- Competitive level preferences
- Event types and engagement metrics

### **Environment Variable**: 
```
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-P01Z2DYLMH"
```

## 🗺️ Map Enhancements
- **Updated Style**: Changed from `light-v11` to `streets-v12` for more colorful, engaging map experience
- **Better Contrast**: Improved visibility of clubs and events on the map
- **Enhanced UX**: More vibrant water bodies, parks, and urban areas

## 🎯 Competitive Level Updates
Updated from 5 complex options to 3 focused categories:
1. **Social Tournament**: More interested in trip than competition - focus on fun, culture, craic
2. **Competitive Friendly**: High-level teams (usually Irish) wanting strong competition  
3. **Training Camp Abroad**: Team preparation focused with training facilities

---
*Last Updated: January 2025 - Google Analytics 4, Club Admin Requests, Map & Onboarding Updates*