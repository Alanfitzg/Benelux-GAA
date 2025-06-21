import { createUser } from "../src/lib/user"
import { UserRole } from "@prisma/client"

async function createAdmin() {
  try {
    // Change these values to your desired credentials
    const email = "admin@gaelictrips.com"
    const username = "admin"
    const password = "changeme123!" // IMPORTANT: Change this password!
    const name = "Site Administrator"
    
    const user = await createUser(email, username, password, name, UserRole.SUPER_ADMIN)
    
    console.log("✅ Admin user created successfully!")
    console.log("Username:", user.username)
    console.log("Email:", user.email)
    console.log("Role:", user.role)
    console.log("\n⚠️  IMPORTANT: Please change the password after your first login!")
  } catch (error) {
    console.error("Failed to create admin user:", error)
  }
  process.exit(0)
}

createAdmin()