// Email templates for admin notifications

export interface NewUserNotificationData {
  userName: string;
  userEmail: string;
  userId: string;
  userClub?: string;
  registrationDate: string;
  adminPanelUrl: string;
}

export function generateNewUserNotificationEmail(
  data: NewUserNotificationData
): {
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
          ${
            data.userClub
              ? `
          <div class="info-row">
            <div class="info-label">Club:</div>
            <div class="info-value">${data.userClub}</div>
          </div>
          `
              : ""
          }
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
${data.userClub ? `Club: ${data.userClub}` : ""}
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

export function generateUserApprovalNotificationEmail(
  data: UserApprovalNotificationData
): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = data.approved
    ? `✅ Welcome to PlayAway! Your account has been approved`
    : `❌ PlayAway Account Application Update`;

  const html = data.approved
    ? `
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
  `
    : `
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
  clubName?: string | null;
  clubImageUrl?: string | null;
}

export function generateWelcomeEmail(data: WelcomeEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Cead mile Failte ${data.userName} - Welcome to PlayAway! 🇮🇪`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to PlayAway</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }
        .email-wrapper {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
        }
        .header {
          background-color: #4472C4;
          color: white;
          padding: 30px 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .header h1 {
          font-size: 36px;
          font-weight: bold;
          margin: 0;
          font-style: italic;
        }
        .content {
          padding: 30px 20px;
          background-color: #ffffff;
        }
        .greeting {
          text-align: center;
          margin-bottom: 30px;
        }
        .greeting h2 {
          font-size: 26px;
          font-weight: normal;
          margin: 0 0 10px 0;
          color: #333333;
        }
        .greeting h3 {
          font-size: 22px;
          font-weight: bold;
          margin: 0 0 20px 0;
          color: #4472C4;
        }
        .club-profile {
          display: inline-flex;
          align-items: center;
          justify-content: flex-start;
          margin: 15px auto;
          padding: 10px 15px;
          background-color: #f8f9fa;
          border-radius: 8px;
          border: 2px solid #4472C4;
          max-width: 400px;
        }
        .club-crest {
          width: 50px;
          height: 50px;
          object-fit: contain;
          border-radius: 6px;
          margin-right: 12px;
          background-color: white;
          padding: 4px;
          border: 1px solid #e9ecef;
          flex-shrink: 0;
        }
        .club-info {
          text-align: left;
          flex: 1;
        }
        .club-info h4 {
          font-size: 16px;
          font-weight: bold;
          margin: 0 0 3px 0;
          color: #4472C4;
        }
        .club-info p {
          font-size: 13px;
          margin: 0;
          color: #6c757d;
        }
        .welcome-section {
          text-align: center;
          margin-bottom: 30px;
        }
        .welcome-section h2 {
          font-size: 32px;
          font-weight: bold;
          margin: 0 0 15px 0;
          color: #333333;
        }
        .welcome-section em {
          color: #4472C4;
          font-style: italic;
        }
        .welcome-section p {
          font-size: 17px;
          line-height: 1.7;
          margin: 0 0 10px 0;
          color: #555555;
        }
        .info-box {
          background-color: #e8f1ff;
          border-radius: 12px;
          padding: 25px;
          margin-bottom: 20px;
          border: 2px solid #4472C4;
        }
        .info-box h3 {
          background-color: #4472C4;
          color: white;
          padding: 10px 20px;
          border-radius: 20px;
          font-size: 19px;
          font-weight: bold;
          margin: 0 0 15px 0;
          display: inline-block;
        }
        .info-box p, .info-box ul, .info-box li {
          color: #333333;
          font-size: 16px;
        }
        .info-box p {
          font-size: 15px;
          line-height: 1.6;
          margin: 0;
        }
        .info-box ul {
          font-size: 15px;
          line-height: 1.6;
          margin: 0;
          padding-left: 20px;
        }
        .info-box strong {
          font-weight: bold;
        }
        .quick-start {
          margin-bottom: 30px;
        }
        .quick-start h3 {
          font-size: 20px;
          font-weight: bold;
          color: #d32f2f;
          margin: 0 0 15px 0;
        }
        .step {
          background-color: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #4472C4;
          margin-bottom: 10px;
        }
        .destinations-box {
          background-color: #f0f4f8;
          border: 2px solid #4472C4;
          border-radius: 8px;
          padding: 15px;
          margin-top: 20px;
        }
        .destinations-box h4 {
          font-size: 16px;
          font-weight: bold;
          color: #4472C4;
          margin: 0 0 10px 0;
        }
        .destinations-box p {
          font-size: 14px;
          line-height: 1.5;
          margin: 0 0 5px 0;
        }
        .help-section {
          background-color: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 30px;
        }
        .help-section p {
          font-size: 16px;
          margin: 0;
          line-height: 1.6;
          color: #333333;
        }
        .footer-section {
          text-align: center;
          margin-top: 40px;
        }
        .footer-section p {
          font-size: 17px;
          margin: 0 0 8px 0;
          color: #333333;
        }
        .footer-section .signature {
          font-weight: bold;
          color: #4472C4;
        }
        .footer-branding {
          background-color: #f8f9fa;
          padding: 25px 20px;
          text-align: center;
          border-top: 1px solid #e9ecef;
          border-radius: 0 0 8px 8px;
        }
        .footer-branding p {
          font-size: 13px;
          color: #6c757d;
          margin: 0;
        }
      </style>
    </head>
    <body>
      <!-- Wrapper -->
      <div class="email-wrapper" style="background-color: #ffffff; max-width: 600px; margin: 0 auto;">
        <div class="header">
          <h1>PlayAway</h1>
        </div>

        <div class="content">
        <div class="welcome-section">
          <h2>Welcome to <em>PlayAway</em></h2>
          <p>The travel platform built by and for the global Gaelic Games community.</p>
          <p>Whether you're a player, coach, volunteer, or just love being part of GAA life abroad, PlayAway makes it easier to travel, connect, and compete — while supporting the clubs that keep our community alive.</p>
        </div>

        <div class="greeting">
          <h2>Dear ${data.userName}</h2>
          <h3>Cead mile Failte</h3>

          <!-- Account Details Box -->
          <div style="background-color: #f0f4f8; border-left: 4px solid #4472C4; border-radius: 8px; padding: 20px; margin: 20px auto; max-width: 500px; text-align: left;">
            <p style="margin: 0 0 12px 0; font-size: 15px; color: #6c757d; font-weight: 600;">Your Account Details:</p>
            <p style="margin: 0 0 8px 0; font-size: 15px; color: #374151;"><strong>Email:</strong> ${data.userEmail}</p>
            ${data.clubName ? `<p style="margin: 0 0 8px 0; font-size: 15px; color: #374151;"><strong>Club:</strong> ${data.clubName}</p>` : ""}
            <p style="margin: 0; font-size: 14px; color: #6c757d; font-style: italic;">You can use your email to log in at any time</p>
          </div>
        </div>

        <div class="info-box">
          <h3>What is the PlayAway platform?</h3>
          <p>PlayAway is the first platform designed to simplify GAA travel across Europe and beyond. From tournaments to training camps, we help clubs list their events, take bookings in advance, and welcome teams from around the world — reducing risk, and costs</p>
        </div>

        <div class="info-box">
          <h3>Why does it matter?</h3>
          <p style="margin-bottom: 15px;">Tourism around Gaelic Games is already happening - but without structure, opportunities are lost.</p>
          <p style="font-weight: bold; margin-bottom: 10px;">PlayAway changes that by:</p>
          <ul>
            <li>Investigating events and promoting opportunities to travel</li>
            <li>Creating new revenue streams for local clubs and communities</li>
            <li>Strengthening club links worldwide</li>
            <li><strong>Protecting both the clubs and the hosts by offering rules and guidelines for both traveling teams and hosts, while ensuring the best bang for buck for the customers!</strong></li>
          </ul>
        </div>

        <!-- First Steps Checklist -->
        <div style="background-color: #f0f4f8; border: 2px solid #4472C4; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
          <h3 style="font-size: 24px; font-weight: bold; color: #4472C4; margin: 0 0 20px 0;">Your First Steps:</h3>

          <div style="display: table; width: 100%; margin-bottom: 18px;">
            <div style="display: table-cell; width: 30px; vertical-align: top; padding-top: 2px;">
              <div style="width: 22px; height: 22px; border: 3px solid #4472C4; border-radius: 4px; background-color: white;"></div>
            </div>
            <div style="display: table-cell; vertical-align: top; padding-left: 12px;">
              <p style="margin: 0; font-size: 17px; line-height: 1.6; color: #333333;">
                <a href="${data.loginUrl}/profile-builder" style="color: #4472C4; text-decoration: underline; font-weight: 600;">Complete Profile Builder</a>
                <br><span style="font-size: 15px; color: #6c757d;">Tell us your interests to get personalized event recommendations</span>
              </p>
            </div>
          </div>

          <div style="display: table; width: 100%; margin-bottom: 18px;">
            <div style="display: table-cell; width: 30px; vertical-align: top; padding-top: 2px;">
              <div style="width: 22px; height: 22px; border: 3px solid #4472C4; border-radius: 4px; background-color: white;"></div>
            </div>
            <div style="display: table-cell; vertical-align: top; padding-left: 12px;">
              <p style="margin: 0; font-size: 17px; line-height: 1.6; color: #333333;">
                <a href="${data.loginUrl}/events" style="color: #4472C4; text-decoration: underline; font-weight: 600;">Browse events in your region</a>
                <br><span style="font-size: 15px; color: #6c757d;">Discover tournaments and GAA activities near you</span>
              </p>
            </div>
          </div>

          <div style="display: table; width: 100%;">
            <div style="display: table-cell; width: 30px; vertical-align: top; padding-top: 2px;">
              <div style="width: 22px; height: 22px; border: 3px solid #4472C4; border-radius: 4px; background-color: white;"></div>
            </div>
            <div style="display: table-cell; vertical-align: top; padding-left: 12px;">
              <p style="margin: 0; font-size: 17px; line-height: 1.6; color: #333333;">
                <strong style="color: #4472C4; font-weight: 600;">Follow us on social media</strong>
                <br><span style="font-size: 15px; color: #6c757d;">Stay updated with the latest GAA travel opportunities</span>
              </p>
            </div>
          </div>
        </div>

        <div class="help-section">
          <p><strong>Need Help?</strong> Our team is here to assist with tournament registrations, travel planning, or connecting with clubs.</p>
          <p style="margin: 10px 0 0 0;">Contact us at: <a href="mailto:alan@gaelictrips.com" style="color: #4472C4; text-decoration: none; font-weight: 600;">alan@gaelictrips.com</a></p>
        </div>

        <!-- Social Media Links -->
        <div style="background-color: #f0f4f8; border: 2px solid #4472C4; border-radius: 12px; padding: 25px; text-align: center; margin: 30px 0;">
          <p style="margin: 0 0 20px 0; font-weight: 600; color: #4472C4; font-size: 20px;">Follow us on social media</p>
          <div style="margin-bottom: 0;">
            <a href="https://www.facebook.com/playaway.ie" style="display: inline-block; margin: 0 10px; text-decoration: none;" title="Follow us on Facebook">
              <span style="display: inline-block; background: #3b5998; color: white; border-radius: 50%; width: 44px; height: 44px; line-height: 44px; text-align: center; font-size: 24px; font-weight: bold;">f</span>
            </a>
            <a href="https://www.instagram.com/playaway.ie" style="display: inline-block; margin: 0 10px; text-decoration: none;" title="Follow us on Instagram">
              <span style="display: inline-block; background: #E4405F; color: white; border-radius: 50%; width: 44px; height: 44px; line-height: 44px; text-align: center; font-size: 24px; font-weight: bold;">📷</span>
            </a>
            <a href="https://www.tiktok.com/@playaway.ie" style="display: inline-block; margin: 0 10px; text-decoration: none;" title="Follow us on TikTok">
              <span style="display: inline-block; background: #000000; color: white; border-radius: 50%; width: 44px; height: 44px; line-height: 44px; text-align: center; font-size: 20px; font-weight: bold;">TT</span>
            </a>
            <a href="https://www.linkedin.com/company/playaway" style="display: inline-block; margin: 0 10px; text-decoration: none;" title="Follow us on LinkedIn">
              <span style="display: inline-block; background: #0077B5; color: white; border-radius: 50%; width: 44px; height: 44px; line-height: 44px; text-align: center; font-size: 24px; font-weight: bold;">in</span>
            </a>
          </div>
        </div>

        <div class="footer-section">
          <p>Looking forward to seeing you on pitches around the world!</p>
          <p class="signature">Slán go fóill,</p>
          <p class="signature">The PlayAway Team</p>
        </div>
      </div>

        <div class="footer-branding">
          <p style="margin: 0;">© 2025 PlayAway - Connecting GAA Communities Worldwide</p>
        </div>
      </div>
      <!-- End wrapper -->
    </body>
    </html>
  `;

  const text = `
Cead mile Failte ${data.userName} - Welcome to PlayAway!

Dear ${data.userName},

Cead mile Failte

Welcome to PlayAway

The travel platform built by and for the global Gaelic Games community.

Whether you're a player, coach, volunteer, or just love being part of GAA life abroad, PlayAway makes it easier to travel, connect, and compete — while supporting the clubs that keep our community alive.

What is PlayAway?

PlayAway is the first platform designed to simplify GAA travel across Europe and beyond. From tournaments to training camps, we help clubs list their events, take bookings in advance, and welcome teams from around the world — reducing risk, and costs

Why does it matter?

Tourism around Gaelic Games is already happening - but without structure, opportunities are lost.

PlayAway changes that by:
• Investigating events and promoting opportunities to travel
• Creating new revenue streams for local clubs and communities
• Strengthening club links worldwide
• Protecting both the clubs and the hosts by offering rules and guidelines for both traveling teams and hosts, while ensuring the best bang for buck for the customers!

Quick Start Guide:

Step 1: Complete your player profile with position, skill level, and travel preferences
Step 2: Browse tournaments by date, location, or competition level
Step 3: Connect with clubs for training sessions or friendly matches
Step 4: Use our trip planner to create your perfect GAA adventure

Popular Destinations This Season:
Ireland: Experience GAA at its source with 500+ clubs
USA & Canada: Join the thriving North American GAA scene
Australia: Combine GAA with incredible travel experiences
Europe: Play in tournaments from Barcelona to Berlin
Middle East & Asia: Discover emerging GAA communities

Need Help? Our team is here to assist with tournament registrations, travel planning, or connecting with clubs. Just reply to this email!

Looking forward to seeing you on pitches around the world!

Slán go fóill,
The PlayAway Team

---
© 2024 PlayAway - Connecting GAA Communities Worldwide
  `;

  return { subject, html, text };
}
