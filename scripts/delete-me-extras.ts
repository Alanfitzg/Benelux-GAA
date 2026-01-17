import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function deleteExtras() {
  console.log("=== Deleting Extra Middle East Clubs ===\n");

  const me = await prisma.internationalUnit.findFirst({
    where: { name: "Middle East" },
  });
  if (!me) {
    console.log("Middle East unit not found");
    return;
  }

  const toDelete = [
    "Oman GAA",
    "Sharjah Wanderers Ladies Gaelic Football Club",
  ];

  for (const name of toDelete) {
    const club = await prisma.club.findFirst({
      where: { name, internationalUnitId: me.id },
    });

    if (club) {
      try {
        await prisma.club.delete({ where: { id: club.id } });
        console.log(`✓ Deleted: ${name}`);
      } catch (e: unknown) {
        if (e instanceof Error && "code" in e && e.code === "P2003") {
          console.log(`✗ Cannot delete (has references): ${name}`);
        } else {
          throw e;
        }
      }
    } else {
      console.log(`? Not found: ${name}`);
    }
  }

  const total = await prisma.club.count({
    where: { internationalUnitId: me.id },
  });
  console.log(`\nTotal Middle East clubs: ${total}`);
}

deleteExtras()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
