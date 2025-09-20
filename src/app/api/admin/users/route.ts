import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { UserRole, AccountStatus } from "@prisma/client";

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const usersRaw = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        accountStatus: true,
        createdAt: true,
        clubId: true,
        password: true,
        club: {
          select: {
            id: true,
            name: true,
          },
        },
        accounts: {
          select: {
            provider: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get admin clubs for each user
    const usersWithAdminClubs = await Promise.all(
      usersRaw.map(async (user) => {
        const adminOfClubs = await prisma.club.findMany({
          where: {
            admins: {
              some: { id: user.id }
            }
          },
          select: {
            id: true,
            name: true,
          },
        });

        return {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
          role: user.role,
          accountStatus: user.accountStatus,
          createdAt: user.createdAt,
          clubId: user.clubId,
          hasPassword: !!user.password,
          club: user.club,
          adminOfClubs,
          accounts: user.accounts,
        };
      })
    );

    const users = usersWithAdminClubs;

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { email, username, password, name, role, clubIds } = body;

    if (!email || !username || !password) {
      return NextResponse.json(
        { error: "Email, username, and password are required" },
        { status: 400 }
      );
    }

    // Check if email or username already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: username },
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email or username already exists" },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await hash(password, 12);

    // Create the user
    const newUserRaw = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        name: name || null,
        role: role as UserRole,
        accountStatus: AccountStatus.APPROVED,
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        accountStatus: true,
        createdAt: true,
        clubId: true,
        password: true,
        club: {
          select: {
            id: true,
            name: true,
          },
        },
        accounts: {
          select: {
            provider: true,
          },
        },
      },
    });

    // Get admin clubs for the new user (will be empty for new users)
    const adminOfClubs = await prisma.club.findMany({
      where: {
        admins: {
          some: { id: newUserRaw.id }
        }
      },
      select: {
        id: true,
        name: true,
      },
    });

    const newUser = {
      id: newUserRaw.id,
      email: newUserRaw.email,
      username: newUserRaw.username,
      name: newUserRaw.name,
      role: newUserRaw.role,
      accountStatus: newUserRaw.accountStatus,
      createdAt: newUserRaw.createdAt,
      clubId: newUserRaw.clubId,
      hasPassword: !!newUserRaw.password,
      club: newUserRaw.club,
      adminOfClubs,
      accounts: newUserRaw.accounts,
    };

    // If role is CLUB_ADMIN and clubIds are provided, assign admin roles
    if (role === UserRole.CLUB_ADMIN && Array.isArray(clubIds) && clubIds.length > 0) {
      for (const clubId of clubIds) {
        await prisma.club.update({
          where: { id: clubId },
          data: {
            admins: {
              connect: { id: newUser.id }
            }
          }
        });
      }
    }

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}