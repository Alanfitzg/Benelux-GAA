import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleTestimonials = [
  {
    content: "Amazing club with fantastic facilities! The pitches are well-maintained and the atmosphere during matches is electric. Perfect for visiting teams looking for a competitive game.",
    userName: "Liam Murphy",
    userEmail: "liam.murphy@email.com"
  },
  {
    content: "Had an incredible tournament experience here. The organization was top-notch and the hospitality from the local club members was outstanding. Will definitely be back!",
    userName: "Sarah O'Brien",
    userEmail: "sarah.obrien@email.com"
  },
  {
    content: "Great location in Amsterdam with excellent transport links. The club facilities exceeded our expectations and the post-match social was brilliant. Highly recommended!",
    userName: "David Kelly",
    userEmail: "david.kelly@email.com"
  },
  {
    content: "Professional setup with quality changing rooms and well-marked pitches. The club made us feel very welcome and the competition level was exactly what we were looking for.",
    userName: "Emma Walsh",
    userEmail: "emma.walsh@email.com"
  },
  {
    content: "Fantastic experience playing here! The pitches are in excellent condition and the club has a real community feel. Perfect for teams visiting Amsterdam.",
    userName: "Conor Ryan",
    userEmail: "conor.ryan@email.com"
  }
];

async function addSampleTestimonials() {
  try {
    // Find Amsterdam clubs
    const amsterdamClubs = await prisma.club.findMany({
      where: {
        OR: [
          { location: { contains: 'Amsterdam', mode: 'insensitive' } },
          { region: { contains: 'Amsterdam', mode: 'insensitive' } },
          { name: { contains: 'Amsterdam', mode: 'insensitive' } }
        ]
      }
    });

    if (amsterdamClubs.length === 0) {
      console.log('No Amsterdam clubs found. Let me check all clubs with Netherlands or Holland...');
      
      const dutchClubs = await prisma.club.findMany({
        where: {
          OR: [
            { location: { contains: 'Netherlands', mode: 'insensitive' } },
            { location: { contains: 'Holland', mode: 'insensitive' } },
            { region: { contains: 'Netherlands', mode: 'insensitive' } },
            { region: { contains: 'Holland', mode: 'insensitive' } }
          ]
        },
        take: 5
      });
      
      console.log('Found Dutch clubs:', dutchClubs.map(c => ({ name: c.name, location: c.location })));
      
      if (dutchClubs.length > 0) {
        await createTestimonialsForClubs(dutchClubs);
      } else {
        console.log('No Dutch clubs found. Let me show all clubs...');
        const allClubs = await prisma.club.findMany({ take: 10 });
        console.log('Available clubs:', allClubs.map(c => ({ name: c.name, location: c.location })));
      }
      
      return;
    }

    console.log('Found Amsterdam clubs:', amsterdamClubs.map(c => ({ name: c.name, location: c.location })));
    await createTestimonialsForClubs(amsterdamClubs);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function createTestimonialsForClubs(clubs: any[]) {
  for (const club of clubs.slice(0, 3)) { // Limit to first 3 clubs
    console.log(`\nAdding testimonials for ${club.name}...`);
    
    for (let i = 0; i < Math.min(3, sampleTestimonials.length); i++) {
      const testimonialData = sampleTestimonials[i];
      
      // Create or find user
      const user = await prisma.user.upsert({
        where: { email: testimonialData.userEmail },
        update: {},
        create: {
          email: testimonialData.userEmail,
          username: testimonialData.userName.toLowerCase().replace(/\s+/g, '.'),
          name: testimonialData.userName,
          password: 'hashedpassword', // In real app, this would be properly hashed
          accountStatus: 'APPROVED',
          role: 'USER'
        }
      });

      // Create testimonial with APPROVED status (skipping the normal approval flow for samples)
      const testimonial = await prisma.testimonial.create({
        data: {
          clubId: club.id,
          userId: user.id,
          content: testimonialData.content,
          status: 'APPROVED', // Directly approved for demo purposes
          displayOrder: i,
          superAdminApprovedAt: new Date(),
          superAdminApprovedBy: user.id, // Using same user for simplicity
          clubAdminApprovedAt: new Date(),
          clubAdminApprovedBy: user.id, // Using same user for simplicity
        }
      });

      console.log(`  ✅ Added testimonial from ${testimonialData.userName}`);
    }
  }
}

addSampleTestimonials();