import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import NeutralVenuesClient from "@/components/admin/NeutralVenuesClient";

async function getVenues() {
  return prisma.neutralVenue.findMany({
    orderBy: [{ country: "asc" }, { city: "asc" }],
  });
}

async function createVenue(formData: FormData) {
  "use server";

  const data = {
    name: formData.get("name") as string,
    city: formData.get("city") as string,
    country: formData.get("country") as string,
    address: (formData.get("address") as string) || null,
    latitude: formData.get("latitude")
      ? parseFloat(formData.get("latitude") as string)
      : null,
    longitude: formData.get("longitude")
      ? parseFloat(formData.get("longitude") as string)
      : null,
    numberOfPitches: formData.get("numberOfPitches")
      ? parseInt(formData.get("numberOfPitches") as string)
      : null,
    surfaceType: (formData.get("surfaceType") as string) || null,
    pitchSize: (formData.get("pitchSize") as string) || null,
    hasFloodlights: formData.get("hasFloodlights") === "true",
    changingRooms: (formData.get("changingRooms") as string) || null,
    parking: (formData.get("parking") as string) || null,
    spectatorCapacity: formData.get("spectatorCapacity")
      ? parseInt(formData.get("spectatorCapacity") as string)
      : null,
    cateringOnSite: formData.get("cateringOnSite") === "true",
    accommodationNearby:
      (formData.get("accommodationNearby") as string) || null,
    contactName: (formData.get("contactName") as string) || null,
    contactEmail: (formData.get("contactEmail") as string) || null,
    contactPhone: (formData.get("contactPhone") as string) || null,
    contactRole: (formData.get("contactRole") as string) || null,
    typicalCost: (formData.get("typicalCost") as string) || null,
    bookingNotes: (formData.get("bookingNotes") as string) || null,
    bestTimeToContact: (formData.get("bestTimeToContact") as string) || null,
    notes: (formData.get("notes") as string) || null,
    relationshipStatus: (formData.get("relationshipStatus") as string) || null,
  };

  await prisma.neutralVenue.create({ data });
  revalidatePath("/admin/venues");
}

async function updateVenue(formData: FormData) {
  "use server";

  const id = formData.get("id") as string;

  const data = {
    name: formData.get("name") as string,
    city: formData.get("city") as string,
    country: formData.get("country") as string,
    address: (formData.get("address") as string) || null,
    latitude: formData.get("latitude")
      ? parseFloat(formData.get("latitude") as string)
      : null,
    longitude: formData.get("longitude")
      ? parseFloat(formData.get("longitude") as string)
      : null,
    numberOfPitches: formData.get("numberOfPitches")
      ? parseInt(formData.get("numberOfPitches") as string)
      : null,
    surfaceType: (formData.get("surfaceType") as string) || null,
    pitchSize: (formData.get("pitchSize") as string) || null,
    hasFloodlights: formData.get("hasFloodlights") === "true",
    changingRooms: (formData.get("changingRooms") as string) || null,
    parking: (formData.get("parking") as string) || null,
    spectatorCapacity: formData.get("spectatorCapacity")
      ? parseInt(formData.get("spectatorCapacity") as string)
      : null,
    cateringOnSite: formData.get("cateringOnSite") === "true",
    accommodationNearby:
      (formData.get("accommodationNearby") as string) || null,
    contactName: (formData.get("contactName") as string) || null,
    contactEmail: (formData.get("contactEmail") as string) || null,
    contactPhone: (formData.get("contactPhone") as string) || null,
    contactRole: (formData.get("contactRole") as string) || null,
    typicalCost: (formData.get("typicalCost") as string) || null,
    bookingNotes: (formData.get("bookingNotes") as string) || null,
    bestTimeToContact: (formData.get("bestTimeToContact") as string) || null,
    notes: (formData.get("notes") as string) || null,
    relationshipStatus: (formData.get("relationshipStatus") as string) || null,
    lastContacted: formData.get("lastContacted")
      ? new Date(formData.get("lastContacted") as string)
      : null,
  };

  await prisma.neutralVenue.update({ where: { id }, data });
  revalidatePath("/admin/venues");
}

async function deleteVenue(formData: FormData) {
  "use server";

  const id = formData.get("id") as string;
  await prisma.neutralVenue.delete({ where: { id } });
  revalidatePath("/admin/venues");
}

export default async function NeutralVenuesPage() {
  const venues = await getVenues();

  return (
    <NeutralVenuesClient
      initialVenues={venues}
      createVenue={createVenue}
      updateVenue={updateVenue}
      deleteVenue={deleteVenue}
    />
  );
}
