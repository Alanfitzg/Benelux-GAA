import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const boardMembers = [
  {
    position: "Chairperson",
    name: "Rory Conway",
    email: "Chairperson.europe@gaa.ie",
  },
  {
    position: "Vice-chairperson",
    name: "Wenjing Zhuang",
    email: "Vicechairperson.europe@gaa.ie",
  },
  {
    position: "Secretary",
    name: "Dave Reilly",
    email: "Secretary.europe@gaa.ie",
  },
  {
    position: "Treasurer",
    name: "Daire Kivlehan",
    email: "Treasurer.europe@gaa.ie",
  },
  {
    position: "Coaching Officer",
    name: "Anna Marie O'Rourke",
    email: "Coachingofficer.europe@gaa.ie",
  },
  {
    position: "Central Council Delegate",
    name: "John White",
    email: "ccdelegate.europe@gaa.ie",
  },
  {
    position: "Assistant Secretary",
    name: "Dave Lewis",
    email: "assistantsecretary.europe@gaa.ie",
  },
  {
    position: "Assistant Treasurer/Registrar",
    name: "Annika Werner",
    email: "Assistanttreasurer.europe@gaa.ie",
  },
  {
    position: "Youth Officer",
    name: "Pearse Bell",
    email: "Youthofficer.europe@gaa.ie",
  },
  {
    position: "Irish Culture & Language Officer",
    name: "Niamh Ryan",
    email: "Irishculturalofficer.europe@gaa.ie",
  },
  {
    position: "Referee Administrator",
    name: "Ray Coleman",
    email: "Refereesadministrator.europe@gaa.ie",
  },
  {
    position: "Camogie Officer",
    name: "Michelle Cotter",
    email: "Camogieofficer.europe@gaa.ie",
  },
  {
    position: "Hurling Officer",
    name: "Shane Morrisroe",
    email: "Hurlingofficer.europe@gaa.ie",
  },
  {
    position: "Handball Officer",
    name: "Guillaume Kerrian",
    email: "Handballofficer.europe@gaa.ie",
  },
  {
    position: "Mens Football Officer",
    name: "Eoin McCall",
    email: "MensFootballOfficer.europe@gaa.ie",
  },
  {
    position: "Ladies Football Officer",
    name: "Mairead Malone",
    email: "Ladiesfootballofficer.europe@gaa.ie",
  },
  {
    position: "IT Officer",
    name: "Daniel Thiem",
    email: "Itofficer.europe@gaa.ie",
  },
  {
    position: "Health and Wellbeing Officer",
    name: "Marla Candon",
    email: "Chairperson.hwc.europe@gaa.ie",
  },
  {
    position: "Sponsorship Officer",
    name: "John Murphy",
    email: "Sponsorshipofficer.europe@gaa.ie",
  },
  {
    position: "Recreational Games Officer",
    name: "Charlie Jameson",
    email: "recreationalofficer.europe@gaa.ie",
  },
  {
    position: "Higher Education Officer",
    name: "David Grenhab",
    email: "highereducationofficer.europe@gaa.ie",
  },
  {
    position: "Child Protection Officer",
    name: "Kayleigh O'Sullivan",
    email: "Childrensofficer.europe@gaa.ie",
  },
  {
    position: "Benelux Representative",
    name: "Conchúr Caomhánach",
    email: "beneluxrep.europe@gaa.ie",
  },
  {
    position: "Central/East Representative",
    name: "Shane Maloney",
    email: "centralandeastrep.europe@gaa.ie",
  },
  {
    position: "North West Representative",
    name: "Nathan Begoc",
    email: "northwestrep.europe@gaa.ie",
  },
  {
    position: "Nordics Representative",
    name: "Niall Blackwell",
    email: "nordicsrep.europe@gaa.ie",
  },
  {
    position: "Iberia Representative",
    name: "JJ Keaney",
    email: "Chairperson.iberia.europe@gaa.ie",
  },
];

function generatePassword(name: string): string {
  // Use the person's name as password (remove spaces, keep as-is)
  return name.replace(/\s+/g, "");
}

async function updatePasswords() {
  console.log("Updating European County Board passwords to names...\n");
  console.log("=".repeat(80));

  const results: {
    email: string;
    name: string;
    password: string;
    status: string;
  }[] = [];

  for (const member of boardMembers) {
    const password = generatePassword(member.name);

    try {
      const user = await prisma.user.findFirst({
        where: { email: member.email.toLowerCase() },
      });

      if (!user) {
        console.log(`⚠️  User not found: ${member.email}`);
        results.push({
          email: member.email,
          name: member.name,
          password: "",
          status: "NOT_FOUND",
        });
        continue;
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      console.log(`✅ Updated: ${member.name} (${member.position})`);
      results.push({
        email: member.email,
        name: member.name,
        password,
        status: "UPDATED",
      });
    } catch (error) {
      console.error(`❌ Error updating ${member.email}:`, error);
      results.push({
        email: member.email,
        name: member.name,
        password: "",
        status: "ERROR",
      });
    }
  }

  console.log("\n" + "=".repeat(80));
  console.log("\n📋 UPDATED CREDENTIALS:\n");
  console.log("-".repeat(80));

  for (const result of results.filter((r) => r.status === "UPDATED")) {
    console.log(`Name:     ${result.name}`);
    console.log(`Email:    ${result.email}`);
    console.log(`Password: ${result.password}`);
    console.log("-".repeat(80));
  }

  const updated = results.filter((r) => r.status === "UPDATED").length;
  const notFound = results.filter((r) => r.status === "NOT_FOUND").length;
  const errors = results.filter((r) => r.status === "ERROR").length;

  console.log(`\n📊 Summary:`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Not found: ${notFound}`);
  console.log(`   Errors: ${errors}`);
  console.log(`   Total: ${boardMembers.length}`);
}

updatePasswords()
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
