# PlayAway Architecture Documentation

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

## 🗺️ Database Patterns
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
- **Event Reports**: EventReport model with JSON fields for flexible tournament data storage, draft/published status, and relationships to events, users, and teams

## 🎨 Key UI/UX Patterns
- Mobile-first responsive design
- Framer Motion animations throughout
- Gradient designs with glass morphism
- Sticky navigation on detail pages
- Tournament-specific UI sections

## ⚡ Performance Metrics
- Club filtering: 200ms → 5ms (40x faster)
- Event queries: 150ms → 3ms (50x faster)
- Admin operations: 100ms → 2ms (50x faster)
- Geocoding: 80-90% cache hit rate

## 🐛 Known Issues
- Rate limiting is in-memory (doesn't scale across instances)
- Connection pooling could be optimized
- Some legacy event types mixed with new system

## ⚠️ Common Development Patterns & Pitfalls
- **Button Forms**: Always add `type="button"` to buttons inside forms to prevent form submission
- **Form Validation**: Use proper TypeScript types and validation patterns as established in pitch validation
- **Map Integration**: Follow Mapbox event handler lifecycle management patterns (useRef + useEffect)

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