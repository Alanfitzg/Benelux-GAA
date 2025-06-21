import { prisma } from "../src/lib/prisma"
import { geocodeLocation } from "../src/lib/utils/geocoding"

async function geocodeClubs() {
  console.log("🔍 Finding clubs without coordinates...")
  
  const clubsWithoutCoordinates = await prisma.club.findMany({
    where: {
      OR: [
        { latitude: null },
        { longitude: null },
        { latitude: 0 },
        { longitude: 0 }
      ]
    },
    select: {
      id: true,
      name: true,
      location: true,
      latitude: true,
      longitude: true,
    }
  })

  console.log(`📍 Found ${clubsWithoutCoordinates.length} clubs needing geocoding`)

  if (clubsWithoutCoordinates.length === 0) {
    console.log("✅ All clubs already have coordinates!")
    return
  }

  let successCount = 0
  let errorCount = 0

  for (let i = 0; i < clubsWithoutCoordinates.length; i++) {
    const club = clubsWithoutCoordinates[i]
    console.log(`\n[${i + 1}/${clubsWithoutCoordinates.length}] Processing: ${club.name}`)
    console.log(`Location: ${club.location || 'No location provided'}`)

    if (!club.location) {
      console.log("⚠️  Skipping - no location provided")
      errorCount++
      continue
    }

    try {
      const result = await geocodeLocation(club.location)
      
      if (result.latitude && result.longitude) {
        await prisma.club.update({
          where: { id: club.id },
          data: {
            latitude: result.latitude,
            longitude: result.longitude,
          }
        })
        
        console.log(`✅ Success: ${result.latitude}, ${result.longitude}`)
        successCount++
      } else {
        console.log("❌ Failed to get coordinates")
        errorCount++
      }
    } catch (error) {
      console.log(`❌ Error: ${error}`)
      errorCount++
    }

    // Add delay to avoid hitting rate limits
    if (i < clubsWithoutCoordinates.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 200))
    }
  }

  console.log("\n🎉 Geocoding complete!")
  console.log(`✅ Successfully geocoded: ${successCount} clubs`)
  console.log(`❌ Failed to geocode: ${errorCount} clubs`)
  
  if (successCount > 0) {
    console.log("\n🗺️  Your clubs should now appear on the map!")
  }
}

geocodeClubs()
  .catch(console.error)
  .finally(() => process.exit(0))