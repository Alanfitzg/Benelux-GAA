# GAA Trips Database Scripts

This directory contains utility scripts for managing the GAA Trips database.

## Available Scripts

### 1. `seed-database.js`
Main database seeding script for setting up initial data after a database reset.

**Usage:**
```bash
# Seed with clubs in PENDING status (default)
node scripts/seed-database.js

# Seed with clubs auto-approved
node scripts/seed-database.js --auto-approve
```

**What it does:**
- Seeds clubs from `data/clubs-seed.json` (if available)
- Creates default city images for major European cities
- Creates a default admin account (admin@gaatrips.com / Admin123!)
- Shows database statistics after seeding

### 2. `approve-seeded-clubs.js`
Utility to approve clubs that were imported from old data.

**Usage:**
```bash
node scripts/approve-seeded-clubs.js
```

**What it does:**
- Shows current club status counts
- Approves all PENDING clubs that have required fields (name, location)
- Reports any clubs that couldn't be approved due to missing data
- Includes safety check for production environments

## Typical Workflow After Database Reset

1. **Import old data** (if you have a data dump)
2. **Run seeding script**:
   ```bash
   # If importing from old system where clubs were already vetted:
   node scripts/seed-database.js --auto-approve
   
   # If importing untrusted data:
   node scripts/seed-database.js
   ```
3. **If needed, approve clubs later**:
   ```bash
   node scripts/approve-seeded-clubs.js
   ```

## Setting Up Seed Data

To use the seeding script with your own data:

1. Create a `data` directory in the project root
2. Add `clubs-seed.json` with an array of club objects:
   ```json
   [
     {
       "name": "Barcelona Gaels",
       "location": "Barcelona, Spain",
       "website": "https://example.com",
       "teamTypes": ["Men's Football", "Ladies Football"]
     }
   ]
   ```

## Notes

- The default admin password should be changed immediately after creation
- Clubs are created with `submittedBy: 'system-seed'` to track seeded data
- The scripts use proper error handling and provide detailed feedback
- In production, the approve script includes a 10-second safety delay