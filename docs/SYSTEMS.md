# PlayAway System Documentation

## 🎯 User Onboarding System

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

## 📝 Event Report System

### **System Overview**
Comprehensive post-event reporting system allowing club admins to document tournament results, participating teams, player awards, and event amenities. Designed to capture detailed event outcomes for historical records and future planning.

### **Core Features**
#### **1. Report Management**
- **Draft/Published Workflow**: Reports can be saved as drafts and published when ready
- **No Approval Required**: Club admins can publish directly without super admin review
- **Edit Capability**: Published reports can be edited and republished
- **Access Control**: Only club admins and super admins can manage reports for their events

#### **2. Tournament Results Tracking**
- **Participating Teams**: Record all teams that participated with club associations
- **Match Results**: Document bracket results or general tournament outcomes
- **Final Standings**: Track winner, runner-up, and third place teams
- **Player Awards**: Optional awards tracking (MVP, top scorer, etc.)
- **Final Scores**: Optional match score recording

#### **3. Event Experience Documentation**
- **Amenities Provided**: Free-text description of event amenities (dinner, snacks, etc.)
- **Event Highlights**: Key moments and memorable experiences from the event
- **Overall Summary**: General event description and outcomes
- **Media Support**: Image upload capability (to be implemented)

### **Database Schema**
```prisma
model EventReport {
  id                  String       @id @default(cuid())
  eventId             String       @unique
  createdBy           String
  status              ReportStatus @default(DRAFT)
  winnerTeamId        String?
  runnerUpTeamId      String?
  thirdPlaceTeamId    String?
  participatingTeams  Json?        // ParticipatingTeam[]
  matchResults        Json?        // Match[]
  playerAwards        Json?        // PlayerAward[]
  amenitiesProvided   String?
  eventHighlights     String?
  summary             String?
  mediaUrls           String[]     @default([])
  publishedAt         DateTime?
  createdAt           DateTime     @default(now())
  updatedAt           DateTime     @updatedAt
  
  event               Event        @relation(fields: [eventId], references: [id], onDelete: Cascade)
  creator             User         @relation(fields: [createdBy], references: [id])
  winnerTeam          TournamentTeam? @relation("WinnerTeam", fields: [winnerTeamId], references: [id])
  runnerUpTeam        TournamentTeam? @relation("RunnerUpTeam", fields: [runnerUpTeamId], references: [id])
  thirdPlaceTeam      TournamentTeam? @relation("ThirdPlaceTeam", fields: [thirdPlaceTeamId], references: [id])
}

enum ReportStatus {
  DRAFT
  PUBLISHED
}
```

### **API Endpoints**
- **`GET /api/events/[id]/report`**: Fetch existing report for event
- **`POST /api/events/[id]/report`**: Create new report or update existing
- **Authorization**: Club admin or super admin access required
- **Validation**: Comprehensive data validation for all report fields

### **Component Architecture**
#### **Report Management** (`/events/[id]/report`)
- **EventReportForm**: Comprehensive form for creating/editing reports
- **EventReportDisplay**: Public-facing report display with trophy visualization
- **Client Component**: Fully client-side for optimal user experience

#### **Key Components**
- **`/src/components/events/EventReportForm.tsx`**: Main report creation/editing form
- **`/src/components/events/EventReportDisplay.tsx`**: Public report display component
- **`/src/app/events/[id]/report/page.tsx`**: Report management page (Client Component)

### **User Experience Flow**
#### **For Club Admins**
1. Navigate to event detail page
2. Access "Create Report" or "Edit Report" option
3. Complete comprehensive report form with:
   - Participating teams selection
   - Tournament results (text-based)
   - Player awards (optional)
   - Event amenities and highlights
4. Save as draft or publish immediately
5. Edit and republish as needed

#### **For Public Users**
1. View published reports on event detail pages
2. See tournament standings with trophy visualization
3. Read event highlights and amenities provided

---

## 🎮 Enhanced Event Management System (August 2025)

### **System Overview**
Complete redesign of the event management interface providing a unified, professional dashboard for administrators to manage the entire event lifecycle from creation to completion.

### **Core Architecture**

#### **Unified Event Dashboard**
**Location**: `/src/components/events/UnifiedEventDashboard.tsx`
- **Purpose**: Single control center for all event management operations
- **Access**: Displayed on event detail pages for authorized admins
- **Features**:
  - Event lifecycle status tracking (UPCOMING → ACTIVE → CLOSED)
  - Quick action buttons with professional geometric indicators
  - Real-time event statistics and team counts
  - Integrated tournament management
  - Direct edit access via "Edit Details" button

#### **Professional Event Edit Interface** 
**Location**: `/src/app/admin/events/[id]/edit/page.tsx`
- **Design Philosophy**: Clean, business-focused interface without emojis
- **Field Organization**: Logical sectioning with title prominently at top
- **Features**:
  - **Basic Information**: Title, type, dates, cost, description
  - **Location & Venue**: Address with integrated pitch management
  - **Tournament Settings**: Team limits, accepted types, visibility
  - **Advanced Options**: Recurring events, custom settings

#### **Enhanced Pitch Management**
**Location**: `/src/components/events/EnhancedPitchSelector.tsx`
- **Capabilities**: 
  - Select existing pitch locations from searchable list
  - Create new pitches inline without leaving the form
  - Professional styling with clear visual hierarchy
  - Multiple pitch association support (via EventPitchLocation table)

#### **Tournament Template System**
**Location**: `/src/lib/tournament-templates.ts`
- **Pre-configured Templates**:
  - Standard GAA Tournament (Men's/Ladies Football, 2 divisions each)
  - Hurling Championship, Mixed Sports Festival, Youth Tournament
- **Automated Team Matrix Generation**: Calculates total teams and creates registration grid
- **Smart Registration**: Matrix-based team selection for bulk operations

### **Authentication & Permissions**

#### **Flexible Admin Access** 
**Location**: `/src/app/events/[id]/EventDetailClient.tsx` (lines 46-62)
```typescript
// Enhanced permission logic
const isAdmin = userData.role === 'SUPER_ADMIN' ||
              userData.role === 'CLUB_ADMIN' ||
              (eventData.clubId && userData.adminOfClubs?.some(...));
```

#### **Permission Matrix**
| User Type | Independent Events | Club Events | Admin Dashboard Access |
|-----------|-------------------|-------------|----------------------|
| SUPER_ADMIN | ✅ Full Access | ✅ Full Access | ✅ Yes |
| CLUB_ADMIN | ✅ Full Access | ✅ If Club Admin | ✅ Yes |
| USER | ❌ View Only | ❌ View Only | ❌ No |

#### **Event Creation Authentication**
**Location**: `/src/app/api/events/route.ts` (lines 86-106)
- **Independent Events**: Requires basic authentication only
- **Club Events**: Requires club admin privileges for specific club
- **Flexible Logic**: Supports both club-managed and independent events

### **Database Schema Enhancements**

#### **EventPitchLocation Table**
```sql
model EventPitchLocation {
  id              String        @id @default(cuid())
  eventId         String
  pitchLocationId String
  isPrimary       Boolean       @default(false)
  notes           String?
  
  event           Event         @relation(fields: [eventId], references: [id], onDelete: Cascade)
  pitchLocation   PitchLocation @relation(fields: [pitchLocationId], references: [id], onDelete: Cascade)
  
  @@unique([eventId, pitchLocationId])
  @@index([eventId])
  @@index([pitchLocationId])
}
```

#### **Enhanced Event Model**
- **Tournament Fields**: `minTeams`, `maxTeams`, `acceptedTeamTypes[]`, `bracketType`
- **Status Workflow**: `status` enum (UPCOMING, ACTIVE, CLOSED)
- **Multiple Pitches**: Relationship to `EventPitchLocation[]`
- **Flexible Club Association**: Optional `clubId` for independent events

### **User Experience Workflows**

#### **Event Creation Flow**
1. **Form Access**: Navigate to `/events/create`
2. **Field Completion**: Logical top-to-bottom flow starting with event title
3. **Pitch Selection**: Choose existing venues or create new ones inline
4. **Tournament Setup**: Use templates for quick configuration (if tournament)
5. **Authentication Check**: System validates permissions before creation
6. **Success**: Redirects to events list with confirmation

#### **Event Management Flow**
1. **Dashboard Access**: Navigate to any event detail page as admin
2. **Control Center**: View `UnifiedEventDashboard` with lifecycle status
3. **Quick Actions**: 
   - Click "Edit Details" to access professional edit form
   - Manage tournament teams and brackets (if applicable)
   - Update event status through lifecycle buttons
4. **Advanced Management**: Access reporting, team registration, and match management

#### **Tournament Management Flow**
1. **Template Selection**: Choose pre-configured tournament format
2. **Team Matrix Setup**: System generates registration grid based on template
3. **Bulk Registration**: Use matrix interface for multiple team/division selection
4. **Team Management**: Add, edit, remove teams through unified interface
5. **Bracket Generation**: Automatic bracket creation based on registered teams

### **Error Handling & Resilience**

#### **API Transaction Management**
- **Database Transactions**: All event updates wrapped in Prisma transactions
- **Partial Failure Handling**: Pitch associations can fail without affecting core event data
- **Comprehensive Logging**: Detailed console logging for debugging
- **Type Safety**: Strict TypeScript types prevent field name mismatches

#### **Authentication Session Fixes**
- **NEXTAUTH_URL Sync**: Ensures authentication works on all ports (3000, 3002)
- **Cookie Configuration**: Proper localhost settings for session persistence
- **Middleware Compatibility**: Updated domain allowlist for development environments

### **Performance & Scalability**
- **Lazy Loading**: Components load only when admin permissions are verified
- **Efficient Queries**: Optimized database queries with proper indexing
- **Caching Strategy**: Leverages Next.js caching for static event data
- **Error Boundaries**: Graceful degradation if components fail to load

### **Future Enhancements**
- **Real-time Updates**: WebSocket integration for live tournament updates
- **Advanced Templates**: More sophisticated tournament bracket configurations
- **Mobile Optimization**: Touch-friendly interfaces for tablet-based event management
- **Integration**: Third-party tournament management system connections
4. Access historical tournament data

### **Technical Implementation**
#### **Past Date Support**
- **Testing Feature**: Events can be created with past dates for testing reports
- **Warning System**: Past dates show warnings but don't prevent creation
- **Validation Updated**: Both frontend and API allow past dates with warnings

#### **Next.js 15 Compatibility**
- **Client Components**: Full client-side rendering for optimal performance
- **Async Params**: Updated for Next.js 15 async params pattern
- **Error Handling**: Comprehensive error states and loading management

#### **Data Storage**
- **JSON Fields**: Flexible storage for complex tournament data structures
- **Type Safety**: Full TypeScript interfaces for all report data
- **Relationship Integrity**: Proper foreign key relationships with events and teams

### **Benefits & Impact**
- **Historical Records**: Complete tournament history for future reference
- **Event Quality**: Encourages detailed event documentation
- **User Engagement**: Provides closure and recognition for tournament participants
- **Data Collection**: Valuable insights for improving future events
- **Club Visibility**: Showcases successful tournaments and club capabilities

### **Future Enhancements**
- **Image Uploads**: Media gallery for event photos
- **Bracket Visualization**: Visual tournament bracket display
- **Statistics Integration**: Automated statistics from match results
- **Export Capabilities**: PDF report generation for archival
- **Social Sharing**: Share tournament results on social media

## 🏆 Club Verification System

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

## 🏟️ Pitch Location Management System

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