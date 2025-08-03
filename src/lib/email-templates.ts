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
  const subject = `🎉 Welcome to PlayAway, ${data.userName}!`;
  
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
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #1e40af, #3b82f6);
          color: white;
          padding: 40px 20px;
          border-radius: 12px 12px 0 0;
          text-align: center;
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
          background: #fff;
          padding: 40px;
          border: 1px solid #e5e7eb;
          border-top: none;
        }
        .feature-list {
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .feature-list ul {
          margin: 10px 0;
          padding-left: 20px;
        }
        .feature-list li {
          margin-bottom: 8px;
        }
        .btn {
          display: inline-block;
          background: #1e40af;
          color: white;
          padding: 14px 32px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          margin: 20px 0;
          transition: all 0.3s ease;
        }
        .btn:hover {
          background: #1e3a8a;
        }
        .status-note {
          background: #fef3c7;
          border: 1px solid #fbbf24;
          padding: 15px;
          border-radius: 8px;
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
        .social-links {
          margin: 15px 0;
        }
        .social-links a {
          text-decoration: none;
          margin: 0 10px;
          color: #6b7280;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">🏐 PlayAway</div>
        <h1>Welcome to PlayAway!</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Your journey with the global GAA community starts here</p>
      </div>
      
      <div class="content">
        <p>Dear ${data.userName},</p>
        
        <p>Thank you for joining PlayAway! We're thrilled to have you as part of our growing community of GAA enthusiasts from around the world.</p>
        
        ${data.isApproved ? `
        <div class="feature-list">
          <h3>🚀 What you can do now:</h3>
          <ul>
            <li>Browse and discover GAA clubs worldwide</li>
            <li>Explore upcoming tournaments and events</li>
            <li>Connect with teams and organizers</li>
            <li>Plan your GAA trips and adventures</li>
            <li>Join the global GAA community</li>
          </ul>
        </div>
        
        <div style="text-align: center;">
          <a href="${data.loginUrl}" class="btn">Get Started</a>
        </div>
        ` : `
        <div class="status-note">
          <strong>⏳ Account Pending Approval</strong>
          <p style="margin: 10px 0 0 0;">Your account is currently pending approval. This usually takes 24-48 hours. We'll send you an email as soon as your account is approved and you can start exploring!</p>
        </div>
        `}
        
        <h3>📚 Getting Started Tips:</h3>
        <ul>
          <li><strong>Complete your profile:</strong> Add information about your club and interests</li>
          <li><strong>Explore tournaments:</strong> Check out upcoming events in your area</li>
          <li><strong>Connect:</strong> Find and follow clubs you're interested in</li>
        </ul>
        
        <p>If you have any questions or need assistance, our support team is here to help!</p>
        
        <p>Welcome aboard,<br>
        The PlayAway Team</p>
      </div>
      
      <div class="footer">
        <div class="logo">PlayAway</div>
        <p>Connecting GAA communities worldwide</p>
        
        <div class="social-links">
          <a href="#">Facebook</a>
          <a href="#">Twitter</a>
          <a href="#">Instagram</a>
        </div>
        
        <p style="margin-top: 15px; font-size: 12px;">
          You received this email because you signed up for PlayAway.<br>
          © 2024 PlayAway. All rights reserved.
        </p>
      </div>
    </body>
    </html>
  `;

  const text = `
Welcome to PlayAway!

Dear ${data.userName},

Thank you for joining PlayAway! We're thrilled to have you as part of our growing community of GAA enthusiasts from around the world.

${data.isApproved ? `
What you can do now:
- Browse and discover GAA clubs worldwide
- Explore upcoming tournaments and events
- Connect with teams and organizers
- Plan your GAA trips and adventures
- Join the global GAA community

Get started: ${data.loginUrl}
` : `
⏳ Account Pending Approval
Your account is currently pending approval. This usually takes 24-48 hours. We'll send you an email as soon as your account is approved and you can start exploring!
`}

Getting Started Tips:
- Complete your profile: Add information about your club and interests
- Explore tournaments: Check out upcoming events in your area
- Connect: Find and follow clubs you're interested in

If you have any questions or need assistance, our support team is here to help!

Welcome aboard,
The PlayAway Team

---
PlayAway - Connecting GAA communities worldwide
© 2024 PlayAway. All rights reserved.
  `;

  return { subject, html, text };
}