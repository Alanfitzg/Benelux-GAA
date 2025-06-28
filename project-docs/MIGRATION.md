# Event Type Migration: "Individual Team Trip" → "Friendly"

## Overview
Changed event types from "Tournament" and "Individual Team Trip" to "Tournament" and "Friendly" for better GAA terminology.

## Database Migration Needed
If you have existing events with `eventType = "Individual Team Trip"`, you'll need to update them:

### SQL Migration Command:
```sql
UPDATE "Event" 
SET "eventType" = 'Friendly' 
WHERE "eventType" = 'Individual Team Trip';
```

### Or using Prisma:
```typescript
await prisma.event.updateMany({
  where: {
    eventType: "Individual Team Trip"
  },
  data: {
    eventType: "Friendly"
  }
});
```

## Changes Made:

### 1. Constants Updated:
- `src/lib/constants/events.ts` - Updated EVENT_TYPES array

### 2. Map Icons Updated:
- `src/app/page.tsx` - Event markers now show:
  - Club logo (if event has associated club)
  - "T" for Tournament (fallback)
  - "F" for Friendly (fallback)

### 3. UI Impact:
- Event creation form dropdown now shows "Friendly" instead of "Individual Team Trip"
- Event filters use new terminology
- Map markers differentiate between Tournament (T) and Friendly (F)

## Testing Checklist:
- [ ] Create new Tournament event
- [ ] Create new Friendly event  
- [ ] Check event filters work with both types
- [ ] Verify map markers show correct icons
- [ ] Test event editing preserves type correctly
- [ ] Confirm existing events display properly

## No Breaking Changes:
- All forms and dropdowns automatically use the new constants
- Database schema remains unchanged (just data values)
- API endpoints continue to work as before