# Database Operations Documentation

## 🌍 Global Club Import System

### **Import Process Overview**
The global club import system allows bulk importing of GAA clubs from CSV files while maintaining data integrity and preventing duplicates.

### **Import Script: `scripts/import-all-gaa-clubs.ts`**

#### **Features**
- **Multi-level Duplicate Detection**: Prevents duplicate clubs using 4 matching strategies
- **Batch Processing**: Handles large datasets efficiently with transaction safety
- **Data Enrichment**: Adds coordinates, club crests, social media, and weather data
- **Dry Run Mode**: Default safe mode shows what would be imported without changes

#### **Usage**
```bash
# Dry run (default) - shows what would be imported
npx tsx scripts/import-all-gaa-clubs.ts

# Actual import - imports clubs to database
npx tsx scripts/import-all-gaa-clubs.ts --import
```

#### **Duplicate Detection Logic**
1. **Exact Name + Coordinates**: Clubs with identical names and GPS coordinates (within 0.5km)
2. **Exact Name + Location**: Same name in same county/division
3. **Normalized Name**: Removes GAA/GFC/HC suffixes and matches by location
4. **Fuzzy Matching**: 80%+ similarity in same country with coordinate proximity

#### **CSV Format Expected**
```csv
File,Club,Pitch,Code,Latitude,Longitude,Province,Country,Division,County,Directions,Twitter,Elevation,annual_rainfall,rain_days,crest_url
```

#### **Data Mapping**
- `File` → `InternationalUnit` (Ireland, Europe, USA, etc.)
- `Country` → `Country` record (creates if missing)
- `Province/County` → `region/subRegion` fields
- `Club` → Main club name
- `Latitude/Longitude` → GPS coordinates for mapping
- `crest_url` → Club logo/crest image

## 🧹 Database Cleanup Operations

### **Duplicate International Units Cleanup**

#### **Script: `scripts/clean-duplicate-international-units.ts`**
Removes duplicate international units created during imports.

**Problem Solved**: Import script created units with different naming conventions (IRE vs IRELAND, GB vs BRITAIN)

**Process**:
1. Identifies duplicate units by name similarity
2. Migrates all related countries and clubs to preferred unit
3. Deletes empty duplicate units
4. Updates display order sequence

**Results**: Reduced from 18 units to 8 clean units

### **Duplicate Countries Cleanup**

#### **Script: `scripts/clean-duplicate-countries.ts`**
Removes duplicate country records within same international units.

**Problem Solved**: Multiple country records with different codes (FR vs FRANCE, DE vs GERMAN)

**Process**:
1. Groups countries by name and international unit
2. Selects preferred country (shortest/cleanest code)
3. Migrates clubs and regions to preferred country
4. Handles region conflicts automatically
5. Deletes duplicate countries

**Results**:
- Reduced from 118 to 69 unique countries
- Migrated 175 clubs to consolidated countries
- Removed 48 duplicate country records

### **Cleanup Scripts Location**
```
/scripts/
├── import-all-gaa-clubs.ts           # Main bulk import
├── clean-duplicate-international-units.ts  # Clean duplicate units
├── clean-duplicate-countries.ts      # Clean duplicate countries
└── delete-empty-units.ts            # Remove orphaned units
```

## 🇮🇪 Ireland Special Handling

### **Unified Ireland Experience**
Ireland is treated as a special case combining Republic of Ireland and Northern Ireland into a single GAA community.

### **Technical Implementation**
- **International Unit**: Single "IRE" unit covers entire island
- **API Modification**: `/api/clubs/ireland-clubs` queries by `internationalUnitId` instead of `countryId`
- **UI Flow**: Ireland → Province → County → Club (skips country selection)
- **Data Structure**: Both RoI and NI clubs stored under IRE unit

### **Province Structure**
```
Ulster (includes Northern Ireland counties)
├── Antrim, Armagh, Down, Fermanagh, Tyrone, Derry (NI)
└── Cavan, Donegal, Monaghan (RoI)

Leinster (Republic of Ireland)
├── Dublin, Wicklow, Wexford, Carlow, etc.

Munster (Republic of Ireland)
├── Cork, Kerry, Limerick, Tipperary, etc.

Connacht (Republic of Ireland)
├── Galway, Mayo, Sligo, etc.
```

## 📊 Data Quality Metrics

### **Before Cleanup**
- International Units: 18 (with duplicates)
- Countries: 118 (with duplicates)
- Clubs: ~1,400 (before import)

### **After Cleanup**
- International Units: 8 (clean, no duplicates)
- Countries: 69 (unique, no duplicates)
- Clubs: 2,400+ (including 1,030 new imports)

### **Import Results**
- **Total Processed**: 1,982 clubs from CSV
- **New Imports**: 1,030 clubs
- **Duplicates Detected**: 953 clubs (prevented)
- **Error Rate**: 0% (no import errors)

## 🔧 Maintenance Commands

### **Regular Maintenance**
```bash
# Check for new duplicates
npx tsx -e "import { prisma } from './src/lib/prisma'; /* check duplicates */"

# Clear application caches
curl -X POST http://localhost:3000/api/admin/clear-cache

# Database integrity check
npx prisma db push --dry-run
```

### **Backup Before Operations**
```bash
# Export current data before major operations
npx tsx scripts/export-current-data.ts

# Restore if needed
npx tsx scripts/restore-data.ts backups/export-[timestamp]
```

## 🚨 Safety Protocols

### **Data Migration Safety**
1. **Always run dry-run first** before actual operations
2. **Transaction-based operations** with automatic rollback on error
3. **Foreign key handling** prevents orphaned records
4. **Conflict resolution** for constraint violations
5. **Audit logging** tracks all changes made

### **Rollback Procedures**
If issues occur during cleanup:
1. Stop the script immediately
2. Check the console output for last successful operation
3. Use database backup to restore previous state
4. Investigate root cause before retrying

---

*Last Updated: January 2025 - Global club import and cleanup operations*