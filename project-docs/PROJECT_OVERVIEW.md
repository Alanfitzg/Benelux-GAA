# GAA Trips - Project Overview

## 🎯 Project Purpose
A comprehensive platform for organizing and managing GAA (Gaelic Athletic Association) events, tournaments, and trips across Europe. The system connects GAA clubs, facilitates event discovery, and enables tournament management with team registration and results tracking.

## 🏗️ Architecture Overview

### Technology Stack
- **Frontend**: Next.js 15.3.3 with React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes with middleware
- **Database**: PostgreSQL with Prisma ORM (v6.9.0)
- **Authentication**: NextAuth.js v5 (beta) with credentials provider
- **UI/UX**: Framer Motion animations, responsive design
- **External APIs**: Mapbox for geocoding and location services
- **Hosting**: Database on Supabase, file uploads via AWS S3

### Key Dependencies
```json
{
  "next": "15.3.3",
  "react": "19.0.0",
  "prisma": "6.9.0",
  "next-auth": "5.0.0-beta.28",
  "framer-motion": "11.x",
  "tailwindcss": "4.x",
  "mapbox-gl": "3.13.0"
}
```

## 📊 Database Schema

### Core Models

#### **Users & Authentication**
- `User`: Authentication, roles (SUPER_ADMIN, CLUB_ADMIN, USER), account status
- `Account` & `Session`: NextAuth.js authentication tables
- Account approval workflow for new users

#### **Clubs**
- `Club`: GAA clubs across Europe with location data, contact info, team types
- Support for multiple team types per club (Mens/Womens Gaelic Football, Hurling, Camogie, etc.)
- Geographic data with latitude/longitude for mapping
- Admin relationships for club management

#### **Events System**
- `Event`: Core event model supporting both regular events and tournaments
- Location with geocoding integration
- Optional club association (independent events supported)
- Rich metadata (description, images, costs, dates)

#### **Tournament Features** ⭐ *Recently Enhanced*
- `TournamentTeam`: Team registrations for tournaments
- `Match`: Tournament fixtures and results tracking
- Team status management (REGISTERED → CONFIRMED → WITHDRAWN)
- Match status tracking (SCHEDULED → IN_PROGRESS → COMPLETED)

#### **Additional Features**
- `Interest`: Individual interest registration for events
- `SurveyResponse`: Feedback and requirements gathering
- `ClubInterest`: Club-to-club contact system
- `HostingPackage` & `Booking`: Accommodation booking system
- `Payment`: Payment processing integration

### Recent Database Enhancements
- Added tournament-specific fields to Events (minTeams, maxTeams, acceptedTeamTypes)
- Created TournamentTeam and Match models for tournament management
- Implemented team status and match result tracking

## 🎨 Frontend Architecture

### Page Structure
```
/src/app/
├── (auth)/
│   ├── signin/                 # Authentication pages
│   └── register/
├── events/
│   ├── create/                 # Event creation form
│   ├── [id]/                  # Event detail pages
│   └── page.tsx               # Events listing
├── clubs/
│   ├── [id]/                  # Club detail pages
│   └── page.tsx               # Clubs listing with map
├── admin/
│   ├── clubs/                 # Club management
│   ├── events/                # Event management
│   └── users/                 # User approval system
└── dashboard/                 # User dashboards
```

### Key Components

#### **Event Management** ⭐ *Recently Enhanced*
- `EventDetailClient`: Enhanced with tournament sections (teams, matches, results)
- `CreateEvent`: Tournament creation form with team type multiselect
- Dynamic form fields based on event type selection
- Tournament-specific validation and UI

#### **Club Management**
- `ClubSelectorOptional`: Club selection dropdown (recently fixed API integration)
- Club detail pages with contact forms and hosting packages
- Interactive club map with Mapbox integration

#### **UI Components**
- Responsive design with mobile-first approach
- Framer Motion animations throughout
- Professional gradient designs and glass morphism effects
- Reusable form components with validation

## 🔐 Authentication & Authorization

### User Roles
- **SUPER_ADMIN**: Full system access, user management
- **CLUB_ADMIN**: Club management, event creation, team registration
- **USER**: Basic access, event viewing, interest registration

### Account Status Flow
1. **PENDING**: New registrations await approval
2. **APPROVED**: Active users with full access
3. **REJECTED**: Denied access with reason
4. **SUSPENDED**: Temporarily restricted access

### Security Features
- Rate limiting on API endpoints
- Role-based access control
- Account approval workflow
- Secure session management with NextAuth.js v5

## 🚀 API Architecture

### RESTful Endpoints
```
/api/
├── auth/                      # NextAuth.js authentication
├── events/                    # Event CRUD operations
├── clubs/                     # Club management
├── tournaments/[id]/          # Tournament-specific endpoints ⭐ NEW
│   ├── teams/                 # Team registration management
│   └── matches/               # Match and results management
├── admin/                     # Administrative functions
├── interest/                  # Interest registration
└── upload/                    # File upload handling
```

### Recent API Additions ⭐
- **Tournament Teams API**: Register, update, and withdraw teams
- **Tournament Matches API**: Create fixtures, update results
- **Authorization**: Club admins can manage their teams, organizers control tournaments
- **Validation**: Team limits, team type restrictions, status workflows

## 🌟 Key Features

### Event Discovery & Management
- **Event Listing**: Filterable events with search and location-based discovery
- **Event Creation**: Rich form with image upload, location autocomplete
- **Event Details**: Professional event pages with registration capabilities

### Tournament System ⭐ *Recently Implemented*
- **Tournament Creation**: Optional team limits, accepted team categories
- **Team Registration**: Clubs can register multiple teams per tournament
- **Match Management**: Fixture creation and live results tracking
- **Tournament Display**: Dedicated sections for teams and matches on event pages

### Club Network
- **Club Directory**: 70+ European GAA clubs with detailed profiles
- **Interactive Map**: Geographic visualization of club locations
- **Club Admin System**: Self-service club profile management
- **Hosting Packages**: Accommodation offerings from clubs

### Additional Systems
- **Survey System**: Gathering requirements for trip planning
- **Interest Registration**: Individual interest tracking for events
- **File Management**: Image uploads with S3 integration
- **Admin Dashboard**: User approval, content management

## 🛠️ Development Workflow

### Environment Setup
```bash
npm install                    # Install dependencies
npx prisma generate           # Generate Prisma client
npx prisma db push           # Sync database schema
npm run dev                  # Start development server
```

### Database Management
- **Prisma Studio**: Visual database browser
- **Migration Strategy**: Using `prisma db push` for schema updates
- **Backup System**: Automated daily backups to S3

### Code Organization
- **Constants**: Centralized in `/src/lib/constants/`
- **Types**: TypeScript definitions in `/src/types/`
- **Utilities**: Helper functions in `/src/lib/utils/`
- **Components**: Reusable UI components in `/src/components/`

## 📍 Current Status & Recent Work

### Recently Completed ✅
1. **Tournament System Implementation**
   - Enhanced event creation form with tournament fields
   - Built tournament team registration system
   - Implemented match results tracking
   - Created tournament-specific UI sections

2. **Event Details Page Redesign**
   - Modern card-based layout with sticky navigation
   - Tournament sections (teams, matches, results)
   - Enhanced sidebar with tournament information
   - Responsive design improvements

3. **API Infrastructure**
   - Tournament teams and matches endpoints
   - Proper authentication and authorization
   - Database schema updates for tournament features

4. **Bug Fixes**
   - Fixed ClubSelectorOptional API integration
   - Resolved authentication import issues (NextAuth v5)
   - Database schema synchronization

### Known Issues & Technical Debt
- Database migration drift (using `db push` instead of formal migrations)
- Some legacy event types ("Individual Team Trip") mixed with new system
- Rate limiting and error handling could be enhanced
- Image upload could benefit from optimization

### Immediate Next Steps
- Test tournament workflows end-to-end
- Add tournament administration features
- Implement tournament bracket generation
- Enhanced mobile responsiveness

## 🌍 Data Overview

### Current Content
- **Clubs**: 70+ GAA clubs across Europe (Netherlands, Germany, France, Spain, Belgium, etc.)
- **Events**: Mix of tournaments and friendly events
- **Users**: Multi-role user base with approval workflow
- **Geographic Coverage**: Major European cities with GAA presence

### Team Types Supported
- Mens Gaelic Football, LGFA (Ladies Gaelic Football)
- Hurling, Camogie, Rounders
- G4MO (Gaelic for Mothers & Others)
- Dads & Lads, Youth teams
- Higher Education, Elite training camps

## 🔮 Future Roadmap

### Short Term
- Tournament bracket/draw generation
- Enhanced tournament administration
- Mobile app considerations
- Performance optimizations

### Medium Term
- Live scoring integration
- Tournament streaming/media
- Advanced analytics and reporting
- Integration with GAA official systems

### Long Term
- Multi-language support for European clubs
- Advanced tournament formats
- Sponsorship and commercial features
- Federation-level integration

---

## 🚨 Important Notes for Future Development

### Authentication
- Using NextAuth.js v5 (beta) - import from `@/lib/auth-helpers`, not directly from next-auth
- Session handling: `getServerSession()` from auth-helpers

### Database
- Prisma client: Import `{ prisma }` from `@/lib/prisma`
- Schema changes: Use `npx prisma db push` followed by `npx prisma generate`
- Always restart dev server after schema changes

### API Patterns
- Rate limiting: Use `withRateLimit` wrapper
- Auth: Use `requireClubAdmin`, `requireSuperAdmin` etc. from auth-helpers
- Error handling: Use `withErrorHandling` wrapper

### UI Development
- Tournament fields appear conditionally when eventType === "Tournament"
- Use existing constants from `/src/lib/constants/` for team types, etc.
- Follow existing animation patterns with Framer Motion

This system represents a sophisticated platform for GAA community management with recent significant enhancements to support tournament operations at a European scale.