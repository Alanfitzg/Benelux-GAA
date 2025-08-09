# Database Seed Files

This directory contains exported data from the production database that can be used to seed other environments.

## Files Structure

- `01-users.json` - User accounts
- `05-clubs.json` - GAA clubs (94 clubs)
- `09-events.json` - Events/tournaments (35 events)
- `07-pitch-locations.json` - Training ground locations (3 locations)
- Other numbered JSON files for related data
- `metadata.json` - Export metadata including counts and timestamp

## Usage

### To Export Current Data (Already Done)
```bash
npx tsx scripts/export-to-seeds.ts
```

### To Import Seeds to Another Environment

1. **Set up the new environment's database connection**:
   ```bash
   # Update .env with the new database URL
   DATABASE_URL="postgresql://..."
   ```

2. **Apply the database schema**:
   ```bash
   npx prisma db push
   ```

3. **Import the seed data**:
   ```bash
   npx tsx scripts/import-seeds.ts
   ```

   ⚠️ **WARNING**: The import script will DELETE all existing data before importing!

### To Use Seeds in a Different Project

1. Copy this entire `prisma/seeds` directory to the new project
2. Copy the import script: `scripts/import-seeds.ts`
3. Ensure the new project has the same Prisma schema
4. Run the import script as shown above

## Data Summary

- **Users**: 3
- **Clubs**: 94
- **Events**: 35
- **Pitch Locations**: 3
- **Event Reports**: 1
- **User Preferences**: 1
- **Club Admin Requests**: 1

## Notes

- Passwords are hashed and safe to export
- No API keys or secrets are included in the export
- Session data is excluded for security
- The import script preserves all relationships and IDs