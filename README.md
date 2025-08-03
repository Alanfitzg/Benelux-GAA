# PlayAway

**Connecting GAA clubs and tournaments worldwide**

PlayAway is a comprehensive platform that makes Gaelic games more accessible and sustainable worldwide by connecting GAA clubs, tournaments, and the global Irish community.

## 🏆 Features

- **Club Discovery**: Browse and search Gaelic clubs worldwide
- **Event Management**: Find and create Gaelic tournaments and events
- **Interactive Maps**: Explore clubs and events with integrated mapping
- **User Authentication**: Secure user registration and management
- **Admin Dashboard**: Comprehensive admin tools for managing clubs, events, and users
- **Responsive Design**: Optimized for desktop and mobile devices
- **Real-time Notifications**: Stay updated with club and event information

## 🚀 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org) with App Router
- **Language**: TypeScript
- **UI/Styling**: Tailwind CSS + Framer Motion
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5
- **Maps**: Mapbox GL JS
- **File Storage**: AWS S3
- **Deployment**: Vercel

## 🛠 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- AWS S3 bucket (for file uploads)
- Mapbox API token

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd play-away
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Configure the following variables in `.env`:

   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/gaa_trips"
   DIRECT_URL="postgresql://username:password@localhost:5432/gaa_trips"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"

   # AWS S3
   AWS_ACCESS_KEY_ID="your-access-key"
   AWS_SECRET_ACCESS_KEY="your-secret-key"
   AWS_REGION="eu-west-1"
   S3_BUCKET_NAME="your-bucket-name"

   # Mapbox
   NEXT_PUBLIC_MAPBOX_TOKEN="your-mapbox-token"
   ```

4. **Set up the database**

   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 🧪 Testing

This project includes comprehensive testing with Jest, React Testing Library, and Playwright.

### Run Tests

```bash
# Unit and component tests
npm test

# Watch mode for development
npm run test:watch

# Coverage report
npm run test:coverage

# End-to-end tests
npm run test:e2e

# E2E tests with UI
npm run test:e2e:ui
```

### Testing Documentation

See [TESTING.md](./TESTING.md) for detailed testing guidelines, patterns, and best practices.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication routes
│   ├── admin/             # Admin dashboard
│   ├── api/               # API routes
│   ├── clubs/             # Club-related pages
│   ├── events/            # Event-related pages
│   └── components/        # Page-specific components
├── components/            # Reusable components
│   ├── ui/               # UI components
│   ├── forms/            # Form components
│   └── providers/        # Context providers
├── lib/                  # Utility functions and configurations
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
└── __tests__/           # Unit and component tests

e2e/                      # End-to-end tests
prisma/                   # Database schema and migrations
public/                   # Static assets
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint

# Database
npm run prisma:seed     # Seed the database
npm run backup:create   # Create database backup
npm run backup:daily    # Run daily backup

# Testing
npm test                # Run unit tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Generate coverage report
npm run test:e2e        # Run E2E tests
```

## 🗄 Database Management

### Prisma Commands

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Reset database
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio

# Seed database
npm run prisma:seed
```

### Backup System

The application includes automated database backup functionality:

```bash
# Create manual backup
npm run backup:create

# Test backup system
npm run backup:test

# Run daily backup (for cron jobs)
npm run backup:daily
```

## 🔐 Authentication & Authorization

The application uses NextAuth.js v5 with role-based access control:

- **Public**: Browse clubs and events
- **User**: Create events, manage profile
- **Admin**: Manage clubs and users
- **Super Admin**: Full system access

## 🌍 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Configure environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and patterns
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 📝 License

This project is private and confidential.

## 🆘 Support

## 📚 Documentation

- [Testing Guide](./TESTING.md)
- [API Documentation](./docs/api.md) _(coming soon)_
- [Deployment Guide](./docs/deployment.md) _(coming soon)_

---

**Gaelic Trips Ltd** - Registered in Ireland  
© 2024 Gaelic Trips Ltd. All rights reserved.
