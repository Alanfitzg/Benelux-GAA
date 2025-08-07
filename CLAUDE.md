# PlayAway - AI Assistant Context

## 🎯 Project Overview
PlayAway is a production-deployed platform for organizing GAA (Gaelic Athletic Association) events and tournaments worldwide. Live at: [your-domain]

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

## 🆕 Latest Changes (August 2025)
- **Complete Rebrand**: Platform renamed from "Gaelic Trips"/"GAA Trips" to "PlayAway" (one word)
- **Global Positioning**: Removed "continental" references to support future UK expansion
- **Geographic Flexibility**: Updated all Europe-specific language to international/global terminology
- **Mobile UX Improvements**: 
  - Hidden "Join Our Network" section on mobile (clubs page)
  - Reduced custom trip text on mobile (tournaments page)
  - Smaller hero image on mobile (landing page)
  - Compact blue header sections on mobile
  - Country cards optimized for mobile (3 per row with smaller text and flags)
  - Improved filter layouts for mobile screens
- **Landing Page Enhancement**: Added "How it works" section header with "in brief" subtitle
- **Database Backup System**: Complete backup/restore solution with safety guarantees and comprehensive documentation
- **Clubs Page Redesign**: Modern country cards view with flags and club counts matching screenshot design
- **Dual View System**: Toggle between country cards grid and expanded club listings with filters
- **Consistent UI Theme**: Updated clubs page header to match site-wide primary color scheme and glass morphism design
- **Enhanced Filtering**: Cross-view filtering system that works in both country cards and expanded list views
- **Google Analytics Error Handling**: Graceful handling of ad-blocker and privacy extension blocking with silent failures
- **Club Verification System**: Comprehensive verification workflow to incentivize club admin participation and improve data quality
- **Error Handling Improvements**: Fixed month filter date calculation bug and added user-friendly "no events found" messages
- **Mobile Typography Optimization**: Site-wide responsive text scaling for optimal mobile readability
- **Pitch Location Management System**: Complete map-based pitch creation with comprehensive optional fields and global search
- **CreateEventButton Fix**: Fixed form submission issue causing redirect to events page with empty parameters

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
- **City Default Images**: CityDefaultImage model for automatic event image assignment based on location
- **Club Verification**: Added verificationStatus, verifiedAt, verifiedBy, verificationDetails, lastVerificationCheck, verificationExpiry fields to Club model with ClubVerificationStatus enum (UNVERIFIED, PENDING_VERIFICATION, VERIFIED, EXPIRED, DISPUTED)
- **Pitch Location Management**: PitchLocation and PitchRequest models for training ground management with coordinates, club associations, and usage tracking

## 🐛 Known Issues
- Rate limiting is in-memory (doesn't scale across instances)
- Connection pooling could be optimized
- Some legacy event types mixed with new system

## ⚠️ Common Development Patterns & Pitfalls
- **Button Forms**: Always add `type="button"` to buttons inside forms to prevent form submission
- **Form Validation**: Use proper TypeScript types and validation patterns as established in pitch validation
- **Map Integration**: Follow Mapbox event handler lifecycle management patterns (useRef + useEffect)

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

## 📋 Recent Features and Components Added (August 2025)
- **`/src/lib/validation/date-validation.ts`** - Comprehensive date validation utilities with specific error messages
- **`/src/lib/city-utils.ts`** - City default image utilities for automatic event image assignment
- **`/src/app/api/admin/city-images/route.ts`** - API endpoints for managing city default images (GET, POST)
- **`/src/app/api/admin/city-images/[city]/route.ts`** - API endpoints for individual city image management (GET, PUT, DELETE)
- **Enhanced `/src/app/clubs/page.tsx`** - Complete redesign with country cards, dual view system, and improved filtering
- **Enhanced `/src/app/events/create/page.tsx`** - Real-time date validation with visual feedback and user-friendly error messages
- **Enhanced `/src/app/admin/images/page.tsx`** - Added "City Defaults" tab for managing city default images
- **Database Models**: CityDefaultImage model for storing city-specific default images with proper indexing
- **Enhanced Pitch Location System**:
  - **`/src/components/pitch/EnhancedMapPitchCreator.tsx`** - Complete 4-step map-based creation workflow
  - **`/src/components/pitch/EnhancedPitchForm.tsx`** - Comprehensive form with collapsible sections for optional pitch details
  - **`/src/components/pitch/PitchDetailsDisplay.tsx`** - Rich display component for viewing pitch information
  - **`/src/lib/constants/pitch.ts`** - Form dropdown options and validation constants
  - **`/src/lib/validation/pitch-validation.ts`** - Complete validation utilities for pitch data
- **Fixed `/src/components/CreateEventButton.tsx`** - Added `type="button"` to prevent form submission conflicts

### 🏆 Club Verification System Components (NEW - August 2025)
- **`/src/lib/club-verification.ts`** - Verification requirements checker and status utilities
- **`/src/components/club/ClubVerificationCard.tsx`** - Main verification UI component with progress tracking and requirements checklist
- **`/src/components/club/VerifiedBadge.tsx`** - Reusable verification status badge with tooltips
- **`/src/components/club/ClubEditForm.tsx`** - Comprehensive club editing form with verification integration
- **`/src/app/api/clubs/[id]/verify/route.ts`** - Verification API endpoints (GET status, POST verify)
- **`/src/app/clubs/[id]/edit/page.tsx`** - Club admin edit page with proper authorization
- **`/src/styles/modal-fix.css`** - CSS fixes for modal text visibility issues
- **Enhanced `/src/app/clubs/[id]/page.tsx`** - Added verification badges and simplified admin verification prompt
- **Enhanced `/src/app/map/page.tsx`** - Visual verification indicators on map markers
- **Enhanced `/src/components/ClubAdminDashboard.tsx`** - Integrated verification card in admin dashboard

### 🏟️ Pitch Location Management Components (NEW - August 2025)
- **`/src/components/pitch/EnhancedMapPitchCreator.tsx`** - Main 3-step City → Pitch → Club workflow with Mapbox integration
- **`/src/components/pitch/PitchManagement.tsx`** - Club dashboard integration with dual creation modes (enhanced + manual)
- **`/src/components/pitch/MapPitchCreator.tsx`** - Legacy direct map-based pitch creation component
- **`/src/components/pitch/PitchSelector.tsx`** - Event creation integration for pitch selection with coordinate population
- **`/src/app/api/pitch-locations/route.ts`** - Main CRUD API with role-based authorization and filtering
- **`/src/app/api/pitch-locations/[id]/route.ts`** - Individual pitch management endpoints (GET, PUT, DELETE)
- **`/src/app/api/pitch-locations/request/route.ts`** - Pitch request system for regular users
- **`/src/app/admin/pitches/page.tsx`** - Comprehensive admin panel with filtering, search, and management tools
- **`/src/app/admin/pitches/create/page.tsx`** - Legacy admin pitch creation page with club selection
- **Enhanced `/src/components/CreateEventButton.tsx`** - Fixed session loading issues for super admin access
- **Enhanced `/src/app/events/create/page.tsx`** - Integrated pitch selection with coordinate auto-population
- **Database Models**: PitchLocation and PitchRequest models with proper relationships and indexing

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

## 🏟️ Pitch Location Management System (NEW - August 2025)

### **System Overview**
Complete map-based training ground management system with Google Maps-like interface for GAA clubs to create, manage, and discover pitch locations worldwide.

### **4-Step Creation Workflow**
1. **City Selection**: Global city search with Mapbox geocoding (no geographic restrictions)
2. **Pitch Discovery**: Sports facility search with click-to-place custom locations
3. **Club Association**: Link pitches to clubs with proper authorization
4. **Details Form**: Comprehensive optional information collection
5. **Confirmation**: Review and finalize before creation

### **Comprehensive Pitch Data Fields**
- **Basic Information**: Original purpose, surface type, number of pitches
- **Amenities & Facilities**: Floodlights (with hours), changing rooms, spectator facilities, parking, other amenities
- **Booking & Availability**: Seasonal availability, booking systems, lead time requirements
- **Capacity & Restrictions**: Player/spectator limits, tournament capacity, age group suitability, equipment provided
- **Contact Information**: Name, phone, email for pitch inquiries
- **Additional Details**: Custom directions, previous events history

### **Technical Implementation**
- **Mapbox GL JS Integration**: Interactive maps with geocoding, reverse geocoding, click handlers
- **Dynamic Event Handler Management**: Proper lifecycle management for map interactions
- **Form Validation**: Comprehensive validation for all pitch data fields
- **Type Safety**: Full TypeScript integration with exported interfaces
- **API Integration**: RESTful endpoints for CRUD operations
- **Authorization**: Club admin and super admin role-based access control

### **Key Components**
- **EnhancedMapPitchCreator**: Main creation interface with map integration
- **EnhancedPitchForm**: Collapsible form sections with optional field handling
- **PitchDetailsDisplay**: Rich display component for viewing pitch information
- **Validation Utilities**: Complete data validation with custom error messages

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

### **Error Handling & Privacy**:
- **Graceful Degradation**: Silent failures when analytics is blocked
- **Ad-Blocker Support**: Handles uBlock Origin, AdBlock Plus, Privacy Badger gracefully
- **Development Mode**: Debug logging only in development environment
- **Network Resilience**: Continues working when analytics requests fail
- **Privacy Compliance**: Respects user privacy settings and network restrictions

### **Environment Variables**: 
```
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-P01Z2DYLMH"
NEXT_PUBLIC_ENABLE_ANALYTICS="true"  # Optional: Enable analytics in development
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

## 🎨 New UI/UX Patterns Added (August 2025)
- **Country Cards**: Flag emojis with hover effects and club counts
- **Dual View Toggle**: Switch between grid cards and expanded list views
- **Glass Morphism**: Frosted glass effects in headers with backdrop blur
- **Primary Color Theme**: Consistent use of `primary` color scheme across all components
- **Visual Filtering**: Filter status indicators with count summaries
- **Responsive Grid**: Adaptive layouts from mobile to desktop (1-5 columns)
- **Smart Navigation**: Context-aware back buttons and breadcrumbs
- **Real-time Validation**: Live feedback for form inputs with color-coded states
- **Mobile-Optimized Cards**: Country cards display 3 per row on mobile with scaled content
- **No Results States**: User-friendly empty states with contextual messaging and clear actions

## 🔧 New Admin Features (August 2025)
- **City Default Images Management**: Admin interface for setting default event images per city
- **Enhanced Image Management**: Tabbed interface with "Event Images" and "City Defaults" sections
- **Automatic Image Assignment**: Events automatically get city default images if no custom image is set
- **Image Fallback System**: Graceful degradation from custom → city default → system default images

## 🛠️ Technical Improvements (August 2025)
- **Enhanced Error Handling**: All analytics functions now include try-catch blocks for graceful failures
- **Client-side Filtering**: Fast filtering without API calls for better performance
- **URL State Management**: Proper synchronization between URL parameters and component state
- **Type Safety**: Enhanced TypeScript definitions for view modes and filter states
- **Build Optimization**: Removed unused imports and fixed linting issues
- **Database Seeding Scripts**: Automated tools for managing club imports and approval after database resets
- **Date Calculation Fixes**: Resolved month filter date range issues with proper year rollover handling
- **Responsive Layout Optimization**: Improved mobile grid systems and filter arrangements

## 📝 Database Management Scripts (August 2025)

### 🗄️ Database Seeding (Original Data)
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

## 🏆 Club Verification System (NEW - August 2025)

### **System Overview**
Comprehensive verification system designed to incentivize club admin participation and improve data quality across the platform. Verified clubs receive premium features and enhanced visibility.

### **Verification Requirements**
Clubs must meet the following criteria for verification (social media is optional):
- **Team Types**: At least one team type must be selected (required)
- **Contact Information**: Complete contact details with first name, last name, and email (required)
- **Location**: Valid address with geocoded coordinates (required)
- **Club Logo**: Uploaded club image/logo (optional but recommended)
- **Profile Completeness**: Minimum 80% completion (calculated from 9 core fields, rounded to 2 decimal places)

### **Verification Status Types**
- **UNVERIFIED**: Default status for new clubs
- **PENDING_VERIFICATION**: Reserved for future manual review workflow
- **VERIFIED**: Meets all requirements and verified by club admin
- **EXPIRED**: For future re-verification requirements
- **DISPUTED**: For future dispute resolution workflow

### **Verification Benefits**
Verified clubs receive:
- ✅ Verified badge on club profile and listings
- 📍 Green border/highlight on map markers
- 🔝 Priority listing in search results (future enhancement)
- 📊 Access to analytics dashboard (future enhancement)
- 💬 Direct messaging capabilities (future enhancement)
- ⭐ Featured events promotion (future enhancement)

### **User Experience Flow**
1. **Club Admin Dashboard**: Primary verification interface with detailed requirements checklist
2. **Club Details Page**: Simplified verification prompt with "Complete Club Verification" button
3. **Club Edit Page**: Integrated verification card at top of editing form
4. **Public Views**: Verification badges displayed on club listings and map

### **Technical Implementation**
- **API Endpoints**: `/api/clubs/[id]/verify` (GET status, POST verify)
- **Verification Logic**: Centralized in `/src/lib/club-verification.ts`
- **Database Schema**: Added 6 verification fields to Club model
- **UI Components**: Reusable verification cards and badges
- **Authorization**: Only club admins can verify their own clubs

### **Data Integrity Features**
- **Real-time Validation**: Requirements checked dynamically as club data changes
- **Progress Tracking**: Visual progress bar showing completion percentage
- **Audit Trail**: Tracks who verified, when, and verification details
- **Self-Service**: Club admins can verify independently without admin approval

## 🏟️ Pitch Location Management System (NEW - August 2025)

### **System Overview**
A comprehensive training pitch management system featuring an intuitive map-based interface similar to Google Maps for discovering, creating, and managing GAA training locations worldwide.

### **Core Features**

#### **1. City → Pitch → Club Workflow**
- **Step 1: City Selection**: Global city search with no geographic restrictions
- **Step 2: Pitch Discovery**: Sports facility search or custom location placement via map clicks
- **Step 3: Club Association**: Link pitch to appropriate club (handles multi-club cities)

#### **2. Interactive Map Interface**
- **Mapbox GL Integration**: Full-featured map with streets-v12 style
- **Sports Facility Categorization**: Targets sports_complex, park, recreation, stadium, school
- **Click-to-Place**: Custom pitch placement with draggable markers for precise positioning
- **Search Functionality**: Real-time facility search within selected city boundaries

#### **3. Permission & Access Control**
- **Club Admins**: Can create pitches for their own clubs via enhanced or manual interface
- **Super Admins**: Full access to create pitches for any club through admin panel
- **Regular Users**: Can only select existing pitches or submit requests for new ones

### **Database Schema**
```prisma
model PitchLocation {
  id        String   @id @default(cuid())
  name      String
  address   String?
  city      String
  latitude  Float
  longitude Float
  clubId    String
  createdBy String
  club      Club     @relation(fields: [clubId], references: [id])
  creator   User     @relation(fields: [createdBy], references: [id])
  events    Event[]  // Usage tracking
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model PitchRequest {
  id        String   @id @default(cuid())
  pitchName String
  address   String?
  city      String
  message   String?
  status    PitchRequestStatus @default(PENDING)
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
}
```

### **API Endpoints**
- **`GET/POST /api/pitch-locations`**: Main CRUD operations with filtering
- **`GET/PUT/DELETE /api/pitch-locations/[id]`**: Individual pitch management
- **`GET/POST /api/pitch-locations/request`**: Pitch request system
- **Authorization**: Role-based access (Club Admin + Super Admin only for creation)

### **Component Architecture**
#### **Enhanced Map Creator** (`EnhancedMapPitchCreator.tsx`)
- 3-step modal workflow with progress tracking
- Dynamic click handler management for map interactions  
- Global city search with Mapbox geocoding
- Club selection with filtering capabilities

#### **Legacy Components**
- **`MapPitchCreator.tsx`**: Direct map-based creation for club admins
- **`PitchManagement.tsx`**: Club dashboard integration with dual creation modes
- **Admin Panel**: Full management interface at `/admin/pitches`

### **Integration Points**
- **Event Creation**: Pitch selection dropdown with coordinate auto-population
- **Club Profiles**: Display associated training pitches with usage statistics
- **Map View**: Visual pitch locations with club markers and verification status
- **Admin Dashboard**: Comprehensive pitch and request management

### **Technical Implementation**
#### **Global Search Capability**
- **Removed Country Restrictions**: Worldwide city and facility search
- **Mapbox Geocoding**: Real-time location search and reverse geocoding
- **Sports Facility Filtering**: Targeted facility categories for relevant results

#### **Error Handling & UX**
- **Session Loading Guards**: Prevents button clicks during authentication loading
- **Defensive API Responses**: Include creator information with fallback handling
- **Click Event Management**: Proper event handler lifecycle management for map interactions

#### **Performance Optimizations**
- **Efficient Filtering**: Client-side filtering for admin interfaces
- **Usage Tracking**: Event count tracking for pitch utilization metrics
- **Caching Strategy**: Leverages existing Next.js caching patterns

### **User Experience Flows**

#### **For Club Admins**
1. Access via Club Admin Dashboard → "Training Pitches" section
2. Choose "Find Pitch" (enhanced workflow) or "Add Manual" (legacy)
3. Enhanced: City search → Facility discovery → Confirmation
4. Integration with existing club pitch management

#### **For Super Admins**
1. Navigate to `/admin/pitches` panel
2. Comprehensive filtering and search capabilities
3. Full CRUD operations on all pitches
4. Manage pitch requests from regular users

#### **For Event Creation**
1. Event creators select from available pitches in dropdown
2. Coordinate auto-population from selected pitch
3. City-based filtering of relevant pitches
4. Direct integration with event location data

### **Benefits & Impact**
- **User-Friendly**: Familiar Google Maps-like discovery experience
- **Global Scale**: No geographic limitations for worldwide GAA expansion  
- **Accurate Data**: Precise coordinates and verified facility information
- **Permission Security**: Role-based access prevents unauthorized modifications
- **Event Integration**: Seamless workflow from pitch creation to event planning

---
*Last Updated: August 2025 - PlayAway Rebrand, Global Positioning, Mobile UX Improvements, Database Backup System, Club Verification System, Enhanced Pitch Location Management System, Mobile Typography Optimization, Error Handling Improvements, CreateEventButton Form Submission Fix*