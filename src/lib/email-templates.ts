// Email templates for admin notifications

export interface NewUserNotificationData {
  userName: string;
  userEmail: string;
  userId: string;
  userClub?: string;
  registrationDate: string;
  adminPanelUrl: string;
}

export function generateNewUserNotificationEmail(data: NewUserNotificationData): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `🆕 New User Registration: ${data.userName}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New User Registration</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #1e40af, #3b82f6);
          color: white;
          padding: 30px 20px;
          border-radius: 12px 12px 0 0;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }
        .content {
          background: #fff;
          padding: 30px;
          border: 1px solid #e5e7eb;
          border-top: none;
        }
        .user-info {
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid #3b82f6;
        }
        .user-info h3 {
          margin: 0 0 15px 0;
          color: #1e40af;
          font-size: 18px;
        }
        .info-row {
          display: flex;
          margin-bottom: 10px;
        }
        .info-label {
          font-weight: 600;
          min-width: 120px;
          color: #6b7280;
        }
        .info-value {
          color: #374151;
        }
        .action-buttons {
          text-align: center;
          margin: 30px 0;
        }
        .btn {
          display: inline-block;
          padding: 12px 24px;
          margin: 0 10px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.3s ease;
        }
        .btn-primary {
          background: #1e40af;
          color: white;
        }
        .btn-primary:hover {
          background: #1e3a8a;
        }
        .btn-secondary {
          background: #6b7280;
          color: white;
        }
        .footer {
          background: #f9fafb;
          padding: 20px;
          border-radius: 0 0 12px 12px;
          border: 1px solid #e5e7eb;
          border-top: none;
          text-align: center;
          font-size: 14px;
          color: #6b7280;
        }
        .logo {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .status-badge {
          display: inline-block;
          background: #fef3c7;
          color: #92400e;
          padding: 4px 12px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">🏐 PlayAway</div>
        <h1>New User Registration</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">A new user has registered and needs approval</p>
      </div>
      
      <div class="content">
        <p>Hello Admin,</p>
        
        <p>A new user has just registered on the PlayAway platform and is awaiting approval.</p>
        
        <div class="user-info">
          <h3>👤 User Details</h3>
          <div class="info-row">
            <div class="info-label">Name:</div>
            <div class="info-value"><strong>${data.userName}</strong></div>
          </div>
          <div class="info-row">
            <div class="info-label">Email:</div>
            <div class="info-value">${data.userEmail}</div>
          </div>
          ${data.userClub ? `
          <div class="info-row">
            <div class="info-label">Club:</div>
            <div class="info-value">${data.userClub}</div>
          </div>
          ` : ''}
          <div class="info-row">
            <div class="info-label">Registered:</div>
            <div class="info-value">${data.registrationDate}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Status:</div>
            <div class="info-value"><span class="status-badge">Pending Approval</span></div>
          </div>
        </div>
        
        <p>Please review this registration and take appropriate action:</p>
        
        <div class="action-buttons">
          <a href="${data.adminPanelUrl}/users" class="btn btn-primary">
            📋 Review in Admin Panel
          </a>
          <a href="${data.adminPanelUrl}/users?userId=${data.userId}" class="btn btn-secondary">
            👁️ View User Details
          </a>
        </div>
        
        <p><strong>What happens next?</strong></p>
        <ul>
          <li>The user will receive an email notification once you approve or reject their account</li>
          <li>Approved users can immediately start using the platform</li>
          <li>You can find all pending registrations in the Admin Panel</li>
        </ul>
      </div>
      
      <div class="footer">
        <div class="logo">PlayAway</div>
        <p>Connecting GAA communities worldwide</p>
        <p style="margin-top: 15px; font-size: 12px;">
          This is an automated notification. Please do not reply to this email.
        </p>
      </div>
    </body>
    </html>
  `;

  const text = `
New User Registration - PlayAway

A new user has registered and needs approval:

Name: ${data.userName}
Email: ${data.userEmail}
${data.userClub ? `Club: ${data.userClub}` : ''}
Registered: ${data.registrationDate}
Status: Pending Approval

Please review this registration in the Admin Panel: ${data.adminPanelUrl}/users

The user will receive an email notification once you approve or reject their account.

---
PlayAway - Connecting GAA communities worldwide
This is an automated notification.
  `;

  return { subject, html, text };
}

// Additional template for user approval notification
export interface UserApprovalNotificationData {
  userName: string;
  userEmail: string;
  approved: boolean;
  adminName?: string;
  loginUrl: string;
}

export function generateUserApprovalNotificationEmail(data: UserApprovalNotificationData): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = data.approved 
    ? `✅ Welcome to PlayAway! Your account has been approved`
    : `❌ PlayAway Account Application Update`;
  
  const html = data.approved ? `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Account Approved</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #059669, #10b981);
          color: white;
          padding: 30px 20px;
          border-radius: 12px 12px 0 0;
          text-align: center;
        }
        .content {
          background: #fff;
          padding: 30px;
          border: 1px solid #e5e7eb;
          border-top: none;
        }
        .btn {
          display: inline-block;
          background: #1e40af;
          color: white;
          padding: 14px 28px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          margin: 20px 0;
        }
        .footer {
          background: #f9fafb;
          padding: 20px;
          border-radius: 0 0 12px 12px;
          border: 1px solid #e5e7eb;
          border-top: none;
          text-align: center;
          font-size: 14px;
          color: #6b7280;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🎉 Welcome to PlayAway!</h1>
        <p>Your account has been approved</p>
      </div>
      
      <div class="content">
        <p>Hello ${data.userName},</p>
        
        <p>Great news! Your PlayAway account has been approved and you can now access all platform features.</p>
        
        <p>You can now:</p>
        <ul>
          <li>Browse GAA clubs and tournaments</li>
          <li>Register your team for events</li>
          <li>Connect with the global GAA community</li>
          <li>Book custom GAA trips</li>
        </ul>
        
        <div style="text-align: center;">
          <a href="${data.loginUrl}" class="btn">🚀 Start Exploring</a>
        </div>
        
        <p>Welcome to the PlayAway community!</p>
      </div>
      
      <div class="footer">
        <p>PlayAway - Connecting GAA communities worldwide</p>
      </div>
    </body>
    </html>
  ` : `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; }
        .footer { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Account Application Update</h1>
      </div>
      <div class="content">
        <p>Hello ${data.userName},</p>
        <p>Thank you for your interest in PlayAway. After reviewing your application, we are unable to approve your account at this time.</p>
        <p>If you believe this is an error or have questions, please contact our support team.</p>
      </div>
      <div class="footer">
        <p>PlayAway - Connecting GAA communities worldwide</p>
      </div>
    </body>
    </html>
  `;

  const text = data.approved 
    ? `Welcome to PlayAway!

Hello ${data.userName},

Great news! Your PlayAway account has been approved and you can now access all platform features.

You can now:
- Browse GAA clubs and tournaments
- Register your team for events  
- Connect with the global GAA community
- Book custom GAA trips

Start exploring: ${data.loginUrl}

Welcome to the PlayAway community!`
    : `Account Application Update

Hello ${data.userName},

Thank you for your interest in PlayAway. After reviewing your application, we are unable to approve your account at this time.

If you believe this is an error or have questions, please contact our support team.

PlayAway - Connecting GAA communities worldwide`;

  return { subject, html, text };
}

// Welcome email template for new users
export interface WelcomeEmailData {
  userName: string;
  userEmail: string;
  loginUrl: string;
  isApproved: boolean;
}

export function generateWelcomeEmail(data: WelcomeEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Welcome to PlayAway, ${data.userName} - Your Global GAA Adventure Starts Now!`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to PlayAway</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.6;
          color: #1a1a1a;
          background-color: #fafafa;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #264673, #3a5998, #2563eb);
          color: white;
          padding: 40px 20px;
          border-radius: 12px 12px 0 0;
          text-align: center;
          box-shadow: 0 10px 25px -3px rgba(38, 70, 115, 0.15);
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .content {
          background: #ffffff;
          padding: 40px;
          border: 1px solid #e5e7eb;
          border-top: none;
          color: #1a1a1a;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin: 20px 0;
        }
        .stat-card {
          text-align: center;
          padding: 15px;
          background: linear-gradient(135deg, #f0f4ff, #e6ebff);
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }
        .stat-number {
          font-size: 24px;
          font-weight: bold;
          color: #264673;
        }
        .stat-label {
          font-size: 12px;
          color: #6b7280;
          margin-top: 5px;
        }
        .feature-list {
          background: #f3f4f6;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid #264673;
        }
        .feature-list h3 {
          color: #264673;
          margin-top: 0;
        }
        .feature-list ul {
          margin: 10px 0;
          padding-left: 20px;
        }
        .feature-list li {
          margin-bottom: 8px;
          color: #1a1a1a;
        }
        .destination-banner {
          background: linear-gradient(135deg, #f0f4ff, #e6ebff);
          border: 1px solid #264673;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .destination-banner h3 {
          margin: 0 0 10px 0;
          color: #264673;
        }
        .btn {
          display: inline-block;
          background: linear-gradient(135deg, #264673, #3a5998);
          color: white;
          padding: 14px 32px;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 600;
          margin: 20px 10px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px -2px rgba(38, 70, 115, 0.2);
        }
        .btn:hover {
          background: linear-gradient(135deg, #1a3352, #264673);
          transform: scale(1.02);
          box-shadow: 0 10px 25px -3px rgba(38, 70, 115, 0.3);
        }
        .btn-secondary {
          background: linear-gradient(135deg, #2563eb, #3b82f6);
        }
        .btn-secondary:hover {
          background: linear-gradient(135deg, #1d4ed8, #2563eb);
        }
        .status-note {
          background: #f0f4ff;
          border: 1px solid #264673;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .status-note strong {
          color: #264673;
        }
        .footer {
          background: #f3f4f6;
          padding: 20px;
          border-radius: 0 0 12px 12px;
          border: 1px solid #e5e7eb;
          border-top: none;
          text-align: center;
          font-size: 14px;
          color: #6b7280;
        }
        .social-links {
          margin: 15px 0;
        }
        .social-links a {
          text-decoration: none;
          margin: 0 10px;
          color: #6b7280;
          transition: color 0.3s ease;
        }
        .social-links a:hover {
          color: #264673;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">PlayAway</div>
        <h1>Welcome to Your Global GAA Network!</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Join thousands of players across 6 continents</p>
      </div>
      
      <div class="content">
        <p>Dear ${data.userName},</p>
        
        <p><strong>Céad míle fáilte!</strong> A hundred thousand welcomes to PlayAway - your passport to GAA adventures worldwide!</p>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">1,000+</div>
            <div class="stat-label">GAA Clubs</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">50+</div>
            <div class="stat-label">Countries</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">100+</div>
            <div class="stat-label">Tournaments</div>
          </div>
        </div>
        
        ${data.isApproved ? `
        <div class="feature-list">
          <h3>Your PlayAway Journey Includes:</h3>
          <ul>
            <li><strong>Global Club Directory:</strong> Connect with GAA clubs from Dublin to Dubai, New York to New Zealand</li>
            <li><strong>Tournament Calendar:</strong> Discover tournaments worldwide - from local blitzes to international championships</li>
            <li><strong>Trip Planning:</strong> Build custom GAA tours combining matches, training, and cultural experiences</li>
            <li><strong>Community Hub:</strong> Join a network of passionate GAA players, coaches, and supporters globally</li>
            <li><strong>Exclusive Access:</strong> Early bird tournament registrations and special travel packages</li>
          </ul>
        </div>
        
        <div class="destination-banner">
          <h3>Popular Destinations This Season:</h3>
          <p><strong>Ireland:</strong> Experience GAA at its roots with 500+ clubs<br>
          <strong>USA & Canada:</strong> Join the thriving North American GAA scene<br>
          <strong>Australia:</strong> Combine GAA with incredible travel experiences<br>
          <strong>Europe:</strong> Play in tournaments from Barcelona to Berlin<br>
          <strong>Middle East & Asia:</strong> Discover emerging GAA communities</p>
        </div>
        
        <div style="text-align: center;">
          <a href="${data.loginUrl}" class="btn">Explore Clubs & Tournaments</a>
          <a href="${data.loginUrl}/survey" class="btn btn-secondary">Plan Your Trip</a>
        </div>
        ` : `
        <div class="status-note">
          <strong>Your Account is Being Reviewed</strong>
          <p style="margin: 10px 0 0 0;">We're reviewing your profile and will activate your account within 24 hours. Once approved, you'll have full access to our global GAA network!</p>
        </div>
        
        <div class="feature-list">
          <h3>While You Wait, Did You Know?</h3>
          <ul>
            <li>PlayAway connects players with clubs in over 50 countries</li>
            <li>Our platform hosts 100+ tournaments annually</li>
            <li>Members save an average of 30% on GAA travel packages</li>
            <li>You can create custom training camps with international clubs</li>
          </ul>
        </div>
        `}
        
        <h3>Quick Start Guide:</h3>
        <ul>
          <li><strong>Step 1:</strong> Complete your player profile with position, skill level, and travel preferences</li>
          <li><strong>Step 2:</strong> Browse tournaments by date, location, or competition level</li>
          <li><strong>Step 3:</strong> Connect with clubs for training sessions or friendly matches</li>
          <li><strong>Step 4:</strong> Use our trip planner to create your perfect GAA adventure</li>
        </ul>
        
        <p><strong>Need Help?</strong> Our team is here to assist with tournament registrations, travel planning, or connecting with clubs. Just reply to this email!</p>
        
        <p>Looking forward to seeing you on pitches around the world!<br><br>
        <strong>Slán go fóill,</strong><br>
        The PlayAway Team</p>
      </div>
      
      <div class="footer">
        <div class="logo">PlayAway</div>
        <p><strong>Your Gateway to Global Gaelic Games</strong></p>
        
        <div class="social-links">
          <a href="#">Facebook</a>
          <a href="#">Twitter</a>
          <a href="#">Instagram</a>
          <a href="#">LinkedIn</a>
        </div>
        
        <p style="margin-top: 15px; font-size: 12px;">
          PlayAway - Gaelic Trips Ltd | Registered in Ireland<br>
          You're receiving this because you signed up at play-away.com<br>
          © 2025 PlayAway. All rights reserved.
        </p>
      </div>
    </body>
    </html>
  `;

  const text = `
Welcome to PlayAway - Your Global GAA Adventure Starts Now!

Dear ${data.userName},

Céad míle fáilte! A hundred thousand welcomes to PlayAway - your passport to GAA adventures worldwide!

BY THE NUMBERS:
- 1,000+ GAA Clubs worldwide
- 50+ Countries represented
- 100+ Annual Tournaments

${data.isApproved ? `
YOUR PLAYAWAY JOURNEY INCLUDES:

- Global Club Directory: Connect with GAA clubs from Dublin to Dubai, New York to New Zealand
- Tournament Calendar: Discover tournaments worldwide - from local blitzes to international championships
- Trip Planning: Build custom GAA tours combining matches, training, and cultural experiences
- Community Hub: Join a network of passionate GAA players, coaches, and supporters globally
- Exclusive Access: Early bird tournament registrations and special travel packages

POPULAR DESTINATIONS THIS SEASON:
- Ireland: Experience GAA at its roots with 500+ clubs
- USA & Canada: Join the thriving North American GAA scene
- Australia: Combine GAA with incredible travel experiences
- Europe: Play in tournaments from Barcelona to Berlin
- Middle East & Asia: Discover emerging GAA communities

Get Started Now: ${data.loginUrl}
Plan Your Trip: ${data.loginUrl}/survey
` : `
YOUR ACCOUNT IS BEING REVIEWED
We're reviewing your profile and will activate your account within 24 hours. Once approved, you'll have full access to our global GAA network!

WHILE YOU WAIT, DID YOU KNOW?
- PlayAway connects players with clubs in over 50 countries
- Our platform hosts 100+ tournaments annually
- Members save an average of 30% on GAA travel packages
- You can create custom training camps with international clubs
`}

QUICK START GUIDE:
Step 1: Complete your player profile with position, skill level, and travel preferences
Step 2: Browse tournaments by date, location, or competition level
Step 3: Connect with clubs for training sessions or friendly matches
Step 4: Use our trip planner to create your perfect GAA adventure

Need Help? Our team is here to assist with tournament registrations, travel planning, or connecting with clubs. Just reply to this email!

Looking forward to seeing you on pitches around the world!

Slán go fóill,
The PlayAway Team

---
PlayAway - Your Gateway to Global Gaelic Games
Gaelic Trips Ltd | Registered in Ireland
© 2025 PlayAway. All rights reserved.
  `;

  return { subject, html, text };
}