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
  baseUrl?: string;
}

export function generateWelcomeEmail(data: WelcomeEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Welcome to PlayAway, ${data.userName}!`;
  const baseUrl = data.baseUrl || data.loginUrl.replace(/\/signin$/, "");

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to PlayAway</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #1a3352; font-family: Arial, sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #1a3352;">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px;">

              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #264673 0%, #1a3352 100%); padding: 40px 30px 30px 30px; text-align: center; border-radius: 12px 12px 0 0;">
                  <h1 style="margin: 0 0 8px 0; font-size: 32px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">PlayAway</h1>
                  <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.8); letter-spacing: 1px;">Your passport to Gaelic Games worldwide</p>
                </td>
              </tr>

              <!-- Main Content -->
              <tr>
                <td style="background-color: #264673; padding: 40px 30px;">

                  <!-- User & Club Identification -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td align="center" style="padding-bottom: 32px;">
                        <h2 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 600; color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">Welcome, ${data.userName}</h2>
                        ${data.clubName ? `<p style="margin: 0; font-size: 16px; color: rgba(255,255,255,0.9); font-weight: 500;">${data.clubName}</p>` : ""}
                      </td>
                    </tr>
                  </table>

                  <!-- Welcome Message -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td align="center" style="padding: 0 10px 32px 10px;">
                        <p style="margin: 0 0 16px 0; font-size: 22px; line-height: 1.6; color: #ffffff; font-weight: 600; font-style: italic; text-shadow: 0 1px 3px rgba(0,0,0,0.2);">Céad Míle Fáilte</p>
                        <p style="margin: 0; font-size: 15px; line-height: 1.8; color: rgba(255,255,255,0.85);">You're now part of the global Gaelic Games travel community. Discover tournaments, connect with clubs worldwide, and plan your next adventure.</p>
                      </td>
                    </tr>
                  </table>

                  <!-- Primary CTA Button -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td align="center" style="padding-bottom: 24px;">
                        <a href="${baseUrl}/events" style="display: inline-block; background-color: #ffffff; color: #264673; padding: 16px 40px; font-size: 16px; font-weight: 700; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">Browse European Tournaments</a>
                      </td>
                    </tr>
                  </table>

                  <!-- Divider -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td style="border-top: 1px solid rgba(255,255,255,0.2); padding-top: 24px;"></td>
                    </tr>
                  </table>

                  <!-- Complete Your Profile CTA -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td align="center" style="padding-bottom: 24px;">
                        <p style="margin: 0 0 16px 0; font-size: 15px; color: rgba(255,255,255,0.9); font-weight: 500;">Complete your profile</p>
                        <p style="margin: 0 0 16px 0; font-size: 13px; color: rgba(255,255,255,0.7); line-height: 1.6;">Add your trip preferences so we can recommend the perfect tournaments and destinations for you.</p>
                        <a href="${baseUrl}/profile" style="display: inline-block; background-color: transparent; color: #ffffff; padding: 14px 32px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 6px; border: 2px solid rgba(255,255,255,0.5);">Add Trip Preferences</a>
                      </td>
                    </tr>
                  </table>

                  <!-- Divider -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td style="border-top: 1px solid rgba(255,255,255,0.2); padding-top: 24px;"></td>
                    </tr>
                  </table>

                  <!-- Secondary CTA - Club Admin -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td align="center" style="padding-bottom: 24px;">
                        <p style="margin: 0 0 16px 0; font-size: 15px; color: rgba(255,255,255,0.9); font-weight: 500;">Are you a coach, committee member, or trip organiser?</p>
                        <p style="margin: 0 0 16px 0; font-size: 13px; color: rgba(255,255,255,0.7); line-height: 1.6;">Discover how PlayAway can help you plan tournaments, find host clubs, and organise unforgettable GAA trips abroad.</p>
                        <a href="${baseUrl}/how-it-works" style="display: inline-block; background-color: transparent; color: #ffffff; padding: 14px 32px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 6px; border: 2px solid rgba(255,255,255,0.5);">See How It Works</a>
                      </td>
                    </tr>
                  </table>

                  <!-- Help Text -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td align="center">
                        <p style="margin: 0; font-size: 13px; line-height: 1.6; color: rgba(255,255,255,0.6);">Questions? Just reply to this email — we're here to help.</p>
                      </td>
                    </tr>
                  </table>

                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #1a3352; padding: 30px; text-align: center; border-radius: 0 0 12px 12px;">

                  <!-- Social Icons -->
                  <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto 20px auto;">
                    <tr>
                      <td style="padding: 0 8px;">
                        <a href="https://instagram.com/playaway.ie" style="display: inline-block; width: 36px; height: 36px; background-color: rgba(255,255,255,0.1); border-radius: 50%; text-align: center; line-height: 36px; text-decoration: none;">
                          <img src="https://cdn-icons-png.flaticon.com/512/174/174855.png" alt="Instagram" width="18" height="18" style="vertical-align: middle;" />
                        </a>
                      </td>
                      <td style="padding: 0 8px;">
                        <a href="https://facebook.com/playaway.ie" style="display: inline-block; width: 36px; height: 36px; background-color: rgba(255,255,255,0.1); border-radius: 50%; text-align: center; line-height: 36px; text-decoration: none;">
                          <img src="https://cdn-icons-png.flaticon.com/512/174/174848.png" alt="Facebook" width="18" height="18" style="vertical-align: middle;" />
                        </a>
                      </td>
                      <td style="padding: 0 8px;">
                        <a href="https://twitter.com/playaway_ie" style="display: inline-block; width: 36px; height: 36px; background-color: rgba(255,255,255,0.1); border-radius: 50%; text-align: center; line-height: 36px; text-decoration: none;">
                          <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" alt="Twitter" width="18" height="18" style="vertical-align: middle;" />
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="margin: 0 0 8px 0; font-size: 14px; color: rgba(255,255,255,0.9); font-weight: 500;">Slán go fóill,</p>
                  <p style="margin: 0 0 16px 0; font-size: 14px; color: rgba(255,255,255,0.9); font-weight: 500;">The PlayAway Team</p>
                  <p style="margin: 0; font-size: 11px; color: rgba(255,255,255,0.5);">© 2025 PlayAway · Connecting GAA Communities Worldwide</p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const text = `Welcome to PlayAway, ${data.userName}!

Céad Míle Fáilte

${data.clubName ? `Club: ${data.clubName}\n` : ""}
You're now part of the global Gaelic Games travel community. Discover tournaments, connect with clubs worldwide, and plan your next adventure.

Browse European tournaments: ${baseUrl}/events

Complete your profile:
Add your trip preferences so we can recommend the perfect tournaments and destinations for you.
Add trip preferences: ${baseUrl}/profile

Are you a coach, committee member, or trip organiser?
Discover how PlayAway can help you plan tournaments, find host clubs, and organise unforgettable GAA trips abroad.
See how it works: ${baseUrl}/how-it-works

Questions? Just reply to this email — we're here to help.

Follow us:
Instagram: https://instagram.com/playaway.ie
Facebook: https://facebook.com/playaway.ie
Twitter: https://twitter.com/playaway_ie

Slán go fóill,
The PlayAway Team

© 2025 PlayAway · Connecting GAA Communities Worldwide
  `;

  return { subject, html, text };
}

// Friend club invitation email template
export interface FriendInvitationEmailData {
  senderClubName: string;
  senderClubLocation: string | null;
  senderClubImageUrl: string | null;
  senderName: string;
  message: string;
  event: {
    title: string;
    startDate: string;
    endDate: string | null;
    location: string;
    eventType: string;
    eventUrl: string;
  } | null;
  baseUrl: string;
}

export function generateFriendInvitationEmail(
  data: FriendInvitationEmailData
): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = data.event
    ? `${data.senderClubName} invites you to ${data.event.title}`
    : `Message from ${data.senderClubName}`;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const eventSection = data.event
    ? `
      <!-- Event Card -->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
        <tr>
          <td style="background-color: rgba(255,255,255,0.1); border-radius: 12px; padding: 24px; border: 1px solid rgba(255,255,255,0.2);">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
              <tr>
                <td>
                  <p style="margin: 0 0 4px 0; font-size: 12px; color: rgba(255,255,255,0.7); text-transform: uppercase; letter-spacing: 1px;">${data.event.eventType}</p>
                  <h3 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 600; color: #ffffff;">${data.event.title}</h3>
                  <p style="margin: 0 0 8px 0; font-size: 14px; color: rgba(255,255,255,0.9);">
                    <strong>When:</strong> ${formatDate(data.event.startDate)}${data.event.endDate ? ` - ${formatDate(data.event.endDate)}` : ""}
                  </p>
                  <p style="margin: 0 0 16px 0; font-size: 14px; color: rgba(255,255,255,0.9);">
                    <strong>Where:</strong> ${data.event.location}
                  </p>
                  <a href="${data.event.eventUrl}" style="display: inline-block; background-color: #ffffff; color: #264673; padding: 12px 24px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 6px;">View Event Details</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `
    : "";

  const eventTextSection = data.event
    ? `
EVENT DETAILS
-------------
${data.event.eventType}: ${data.event.title}
When: ${formatDate(data.event.startDate)}${data.event.endDate ? ` - ${formatDate(data.event.endDate)}` : ""}
Where: ${data.event.location}
View event: ${data.event.eventUrl}
`
    : "";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #1a3352; font-family: Arial, sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #1a3352;">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px;">

              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #264673 0%, #1a3352 100%); padding: 40px 30px 30px 30px; text-align: center; border-radius: 12px 12px 0 0;">
                  <h1 style="margin: 0 0 8px 0; font-size: 32px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">PlayAway</h1>
                  <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.8); letter-spacing: 1px;">Club Network Invitation</p>
                </td>
              </tr>

              <!-- Main Content -->
              <tr>
                <td style="background-color: #264673; padding: 40px 30px;">

                  <!-- From Club -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td align="center" style="padding-bottom: 24px;">
                        <p style="margin: 0 0 8px 0; font-size: 12px; color: rgba(255,255,255,0.7); text-transform: uppercase; letter-spacing: 1px;">Message from</p>
                        <h2 style="margin: 0 0 4px 0; font-size: 24px; font-weight: 600; color: #ffffff;">${data.senderClubName}</h2>
                        ${data.senderClubLocation ? `<p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.8);">${data.senderClubLocation}</p>` : ""}
                      </td>
                    </tr>
                  </table>

                  <!-- Message -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td style="background-color: rgba(255,255,255,0.95); border-radius: 8px; padding: 24px;">
                        <p style="margin: 0 0 16px 0; font-size: 14px; color: #666;">Hello {{recipientName}},</p>
                        <div style="font-size: 15px; line-height: 1.7; color: #333; white-space: pre-wrap;">${data.message.replace(/\n/g, "<br>")}</div>
                        <p style="margin: 16px 0 0 0; font-size: 14px; color: #666;">Best regards,<br><strong>${data.senderName}</strong><br>${data.senderClubName}</p>
                      </td>
                    </tr>
                  </table>

                  ${eventSection}

                  <!-- CTA -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td align="center" style="padding-top: 16px;">
                        <a href="${data.baseUrl}/events" style="display: inline-block; background-color: transparent; color: #ffffff; padding: 14px 32px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 6px; border: 2px solid rgba(255,255,255,0.5);">Browse All Events</a>
                      </td>
                    </tr>
                  </table>

                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #1a3352; padding: 30px; text-align: center; border-radius: 0 0 12px 12px;">
                  <p style="margin: 0 0 8px 0; font-size: 14px; color: rgba(255,255,255,0.9); font-weight: 500;">PlayAway</p>
                  <p style="margin: 0 0 16px 0; font-size: 12px; color: rgba(255,255,255,0.6);">Connecting GAA Communities Worldwide</p>
                  <p style="margin: 0; font-size: 11px; color: rgba(255,255,255,0.4);">
                    This invitation was sent via PlayAway from ${data.senderClubName}.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const text = `
${subject}

Message from ${data.senderClubName}${data.senderClubLocation ? ` (${data.senderClubLocation})` : ""}

Hello {{recipientName}},

${data.message}

Best regards,
${data.senderName}
${data.senderClubName}

${eventTextSection}

Browse all events: ${data.baseUrl}/events

---
PlayAway - Connecting GAA Communities Worldwide
This invitation was sent via PlayAway from ${data.senderClubName}.
  `;

  return { subject, html, text };
}

// Broadcast email template for super admin
export interface BroadcastEmailData {
  subject: string;
  message: string;
  senderName: string;
  baseUrl: string;
}

export function generateBroadcastEmail(data: BroadcastEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${data.subject}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #1a3352; font-family: Arial, sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #1a3352;">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px;">

              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #264673 0%, #1a3352 100%); padding: 40px 30px 30px 30px; text-align: center; border-radius: 12px 12px 0 0;">
                  <h1 style="margin: 0 0 8px 0; font-size: 32px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">PlayAway</h1>
                  <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.8); letter-spacing: 1px;">Platform Announcement</p>
                </td>
              </tr>

              <!-- Main Content -->
              <tr>
                <td style="background-color: #264673; padding: 40px 30px;">

                  <!-- Subject Line -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td align="center" style="padding-bottom: 24px;">
                        <h2 style="margin: 0; font-size: 22px; font-weight: 600; color: #ffffff;">${data.subject}</h2>
                      </td>
                    </tr>
                  </table>

                  <!-- Message -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td style="background-color: rgba(255,255,255,0.95); border-radius: 8px; padding: 24px;">
                        <p style="margin: 0 0 16px 0; font-size: 14px; color: #666;">Hello {{recipientName}},</p>
                        <div style="font-size: 15px; line-height: 1.7; color: #333; white-space: pre-wrap;">${data.message.replace(/\n/g, "<br>")}</div>
                        <p style="margin: 24px 0 0 0; font-size: 14px; color: #666;">Best regards,<br><strong>${data.senderName}</strong><br>The PlayAway Team</p>
                      </td>
                    </tr>
                  </table>

                  <!-- CTA -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td align="center" style="padding-top: 24px;">
                        <a href="${data.baseUrl}/events" style="display: inline-block; background-color: #ffffff; color: #264673; padding: 14px 32px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 6px;">Explore Events</a>
                      </td>
                    </tr>
                  </table>

                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #1a3352; padding: 30px; text-align: center; border-radius: 0 0 12px 12px;">
                  <p style="margin: 0 0 8px 0; font-size: 14px; color: rgba(255,255,255,0.9); font-weight: 500;">PlayAway</p>
                  <p style="margin: 0 0 16px 0; font-size: 12px; color: rgba(255,255,255,0.6);">Connecting GAA Communities Worldwide</p>
                  <p style="margin: 0; font-size: 11px; color: rgba(255,255,255,0.4);">
                    You received this message because you are a club administrator on PlayAway.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const text = `
${data.subject}

Hello {{recipientName}},

${data.message}

Best regards,
${data.senderName}
The PlayAway Team

Explore events: ${data.baseUrl}/events

---
PlayAway - Connecting GAA Communities Worldwide
You received this message because you are a club administrator on PlayAway.
  `;

  return { subject: data.subject, html, text };
}
