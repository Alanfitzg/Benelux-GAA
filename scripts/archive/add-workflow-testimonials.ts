import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const workflowTestimonials = [
  {
    content: "Just submitted this testimonial - it should show as PENDING and need super admin approval first.",
    userName: "John Smith",
    userEmail: "john.smith@email.com",
    status: 'PENDING'
  },
  {
    content: "This testimonial has been approved by super admin and is now awaiting club admin approval. This demonstrates the two-step approval process.",
    userName: "Mary Johnson",
    userEmail: "mary.johnson@email.com", 
    status: 'SUPER_ADMIN_APPROVED'
  }
];

async function addWorkflowTestimonials() {
  try {
    // Find Amsterdam GAA club
    const amsterdamClub = await prisma.club.findFirst({
      where: {
        name: { contains: 'Amsterdam GAA', mode: 'insensitive' }
      }
    });

    if (!amsterdamClub) {
      console.log('Amsterdam GAA club not found');
      return;
    }

    console.log(`Adding workflow testimonials for ${amsterdamClub.name}...`);
    
    for (const testimonialData of workflowTestimonials) {
      // Create or find user
      const user = await prisma.user.upsert({
        where: { email: testimonialData.userEmail },
        update: {},
        create: {
          email: testimonialData.userEmail,
          username: testimonialData.userName.toLowerCase().replace(/\s+/g, '.'),
          name: testimonialData.userName,
          password: 'hashedpassword',
          accountStatus: 'APPROVED',
          role: 'USER'
        }
      });

      // Create testimonial with specified status
      const testimonialCreateData: any = {
        clubId: amsterdamClub.id,
        userId: user.id,
        content: testimonialData.content,
        status: testimonialData.status,
        displayOrder: 0,
      };

      // Add approval data based on status
      if (testimonialData.status === 'SUPER_ADMIN_APPROVED') {
        testimonialCreateData.superAdminApprovedAt = new Date();
        testimonialCreateData.superAdminApprovedBy = user.id;
      }

      const testimonial = await prisma.testimonial.create({
        data: testimonialCreateData
      });

      console.log(`  ✅ Added ${testimonialData.status} testimonial from ${testimonialData.userName}`);
    }

    console.log('\n🎉 Sample testimonials added successfully!');
    console.log('\nYou now have:');
    console.log('- 3 APPROVED testimonials (visible on club page)');
    console.log('- 1 PENDING testimonial (needs super admin approval)'); 
    console.log('- 1 SUPER_ADMIN_APPROVED testimonial (needs club admin approval)');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addWorkflowTestimonials();