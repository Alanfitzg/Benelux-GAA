import { prisma } from '@/lib/prisma';

export function extractCityFromLocation(location: string): string {
  const parts = location.split(',').map(part => part.trim());
  
  if (parts.length >= 2) {
    return parts[0].toLowerCase();
  }
  
  return location.toLowerCase();
}

export async function getCityDefaultImage(location: string): Promise<string | null> {
  try {
    const city = extractCityFromLocation(location);
    
    const cityImage = await prisma.cityDefaultImage.findUnique({
      where: { city }
    });
    
    return cityImage?.imageUrl || null;
  } catch (error) {
    console.error('Error fetching city default image:', error);
    return null;
  }
}