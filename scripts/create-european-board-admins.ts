import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const boardMembers = [
  {
    position: "Chairperson",
    name: "Rory Conway",
    club: "Zürich Inneoin",
    email: "Chairperson.europe@gaa.ie",
  },
  {
    position: "Vice-chairperson",
    name: "Wenjing Zhuang",
    club: "Copenhagen",
    email: "Vicechairperson.europe@gaa.ie",
  },
  {
    position: "Secretary",
    name: "Dave Reilly",
    club: "Zürich Inneoin",
    email: "Secretary.europe@gaa.ie",
  },
  {
    position: "Treasurer",
    name: "Daire Kivlehan",
    club: "Munich Colmchilles",
    email: "Treasurer.europe@gaa.ie",
  },
  {
    position: "Coaching Officer",
    name: "Anna Marie O'Rourke",
    club: "Rennes",
    email: "Coachingofficer.europe@gaa.ie",
  },
  {
    position: "Central Council Delegate",
    name: "John White",
    club: "Zurich Inneoin",
    email: "ccdelegate.europe@gaa.ie",
  },
  {
    position: "Assistant Secretary",
    name: "Dave Lewis",
    club: "Lugundum CLG",
    email: "assistantsecretary.europe@gaa.ie",
  },
  {
    position: "Assistant Treasurer/Registrar",
    name: "Annika Werner",
    club: "Berlin GAA",
    email: "Assistanttreasurer.europe@gaa.ie",
  },
  {
    position: "Youth Officer",
    name: "Pearse Bell",
    club: "Vannes",
    email: "Youthofficer.europe@gaa.ie",
  },
  {
    position: "Irish Culture & Language Officer",
    name: "Niamh Ryan",
    club: "Rome Hibernia",
    email: "Irishculturalofficer.europe@gaa.ie",
  },
  {
    position: "Referee Administrator",
    name: "Ray Coleman",
    club: "Eintracht Frankfurt GAA",
    email: "Refereesadministrator.europe@gaa.ie",
  },
  {
    position: "Camogie Officer",
    name: "Michelle Cotter",
    club: "Stockholm Gaels",
    email: "Camogieofficer.europe@gaa.ie",
  },
  {
    position: "Hurling Officer",
    name: "Shane Morrisroe",
    club: "Earls of Leuven",
    email: "Hurlingofficer.europe@gaa.ie",
  },
  {
    position: "Handball Officer",
    name: "Guillaume Kerrian",
    club: "Toulouse",
    email: "Handballofficer.europe@gaa.ie",
  },
  {
    position: "Mens Football Officer",
    name: "Eoin McCall",
    club: "Barcelona Gaels",
    email: "MensFootballOfficer.europe@gaa.ie",
  },
  {
    position: "Ladies Football Officer",
    name: "Mairead Malone",
    club: "Paris Gaels",
    email: "Ladiesfootballofficer.europe@gaa.ie",
  },
  {
    position: "IT Officer",
    name: "Daniel Thiem",
    club: "Darmstadt GAA",
    email: "Itofficer.europe@gaa.ie",
  },
  {
    position: "Health and Wellbeing Officer",
    name: "Marla Candon",
    club: "Brussels Craobh Rua",
    email: "Chairperson.hwc.europe@gaa.ie",
  },
  {
    position: "Sponsorship Officer",
    name: "John Murphy",
    club: "Amsterdam GAA",
    email: "Sponsorshipofficer.europe@gaa.ie",
  },
  {
    position: "Recreational Games Officer",
    name: "Charlie Jameson",
    club: "München Colmcilles",
    email: "recreationalofficer.europe@gaa.ie",
  },
  {
    position: "Higher Education Officer",
    name: "David Grenhab",
    club: "Nijmegen GFC",
    email: "highereducationofficer.europe@gaa.ie",
  },
  {
    position: "Child Protection Officer",
    name: "Kayleigh O'Sullivan",
    club: "Anjou Gaels",
    email: "Childrensofficer.europe@gaa.ie",
  },
  {
    position: "Benelux Representative",
    name: "Conchúr Caomhánach",
    club: "Brussels Craobh Rua",
    email: "beneluxrep.europe@gaa.ie",
  },
  {
    position: "Central/East Representative",
    name: "Shane Maloney",
    club: "Vienna Gaels",
    email: "centralandeastrep.europe@gaa.ie",
  },
  {
    position: "North West Representative",
    name: "Nathan Begoc",
    club: "Brest Bro Leon",
    email: "northwestrep.europe@gaa.ie",
  },
  {
    position: "Nordics Representative",
    name: "Niall Blackwell",
    club: "Stockholm Gaels",
    email: "nordicsrep.europe@gaa.ie",
  },
  {
    position: "Iberia Representative",
    name: "JJ Keaney",
    club: "Madrid Harps Youths",
    email: "Chairperson.iberia.europe@gaa.ie",
  },
];

function generateUsername(email: string): string {
  // Extract the part before @ and convert to lowercase username
  const localPart = email.split("@")[0].toLowerCase();
  // Replace dots with underscores
  return localPart.replace(/\./g, "_");
}

function generatePassword(): string {
  // Generate a secure random password
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

async function createBoardAdmins() {
  console.log("Creating European County Board Super Admin accounts...\n");
  console.log("=".repeat(80));

  const results: {
    email: string;
    username: string;
    password: string;
    status: string;
  }[] = [];

  for (const member of boardMembers) {
    const username = generateUsername(member.email);
    const password = generatePassword();

    try {
      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email: member.email.toLowerCase() }, { username }],
        },
      });

      if (existingUser) {
        console.log(`⚠️  User already exists: ${member.email}`);
        results.push({
          email: member.email,
          username: existingUser.username,
          password: "(existing - not changed)",
          status: "EXISTS",
        });
        continue;
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create the user
      await prisma.user.create({
        data: {
          email: member.email.toLowerCase(),
          username,
          password: hashedPassword,
          name: member.name,
          role: "SUPER_ADMIN",
          accountStatus: "APPROVED",
        },
      });

      console.log(`✅ Created: ${member.name} (${member.position})`);
      results.push({
        email: member.email,
        username,
        password,
        status: "CREATED",
      });
    } catch (error) {
      console.error(`❌ Error creating ${member.email}:`, error);
      results.push({
        email: member.email,
        username,
        password: "",
        status: "ERROR",
      });
    }
  }

  console.log("\n" + "=".repeat(80));
  console.log("\n📋 ACCOUNT CREDENTIALS (Save these securely!):\n");
  console.log("-".repeat(80));

  for (const result of results.filter((r) => r.status === "CREATED")) {
    console.log(`Email:    ${result.email}`);
    console.log(`Username: ${result.username}`);
    console.log(`Password: ${result.password}`);
    console.log("-".repeat(80));
  }

  const created = results.filter((r) => r.status === "CREATED").length;
  const existing = results.filter((r) => r.status === "EXISTS").length;
  const errors = results.filter((r) => r.status === "ERROR").length;

  console.log(`\n📊 Summary:`);
  console.log(`   Created: ${created}`);
  console.log(`   Already existed: ${existing}`);
  console.log(`   Errors: ${errors}`);
  console.log(`   Total: ${boardMembers.length}`);
}

createBoardAdmins()
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
