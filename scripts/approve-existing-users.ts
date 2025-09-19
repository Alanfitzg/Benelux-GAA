import { prisma } from "../src/lib/prisma";
import { UserRole } from "@prisma/client";

async function approveExistingUsers() {
  try {
    console.log("🔄 Approving all existing users...");
    
    // Update all users to APPROVED status and set approvedAt timestamp
    const result = await prisma.user.updateMany({
      data: {
        accountStatus: 'APPROVED',
        approvedAt: new Date(),
      },
    });
    
    console.log(`✅ Updated ${result.count} users to APPROVED status`);
    
    // Show current admin users
    const admins = await prisma.user.findMany({
      where: {
        role: {
          in: [UserRole.SUPER_ADMIN, UserRole.CLUB_ADMIN]
        }
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        accountStatus: true,
        approvedAt: true,
      }
    });
    
    console.log("\n📋 Admin accounts:");
    admins.forEach(admin => {
      console.log(`- ${admin.username} (${admin.email}) - ${admin.role} - Status: ${admin.accountStatus}`);
    });
    
  } catch (error) {
    console.error("❌ Failed to approve users:", error);
  } finally {
    await prisma.$disconnect();
  }
}

approveExistingUsers();