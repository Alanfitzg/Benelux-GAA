# Email Notification System - SendGrid Setup

## Overview

The Gaelic Trips platform uses SendGrid for reliable email delivery of admin notifications and user status updates.

## Features

✅ **Admin Notifications**: Instant email alerts when new users register  
✅ **User Status Updates**: Email notifications when accounts are approved/rejected  
✅ **Professional Templates**: GAA-branded HTML email templates  
✅ **Graceful Fallback**: Logs emails when SendGrid isn't configured (development)  
✅ **Bulk Email Support**: Efficient sending to multiple admins  

## SendGrid Configuration

### 1. Create SendGrid Account
- Sign up at [https://sendgrid.com](https://sendgrid.com)
- Choose the free plan (40,000 emails/month for 30 days, then 100 emails/day)

### 2. Generate API Key
1. Go to Settings → API Keys in SendGrid dashboard
2. Click "Create API Key"
3. Choose "Full Access" or create restricted key with Mail Send permissions
4. Copy the API key (starts with `SG.`)

### 3. Verify Sender Identity
**Option A: Single Sender Verification (Easiest)**
1. Go to Settings → Sender Authentication → Single Sender Verification
2. Add `noreply@yourdomain.com` (or your chosen email)
3. Verify via email confirmation

**Option B: Domain Authentication (Production)**
1. Go to Settings → Sender Authentication → Domain Authentication
2. Add your domain (e.g., `gaelic-trips.com`)
3. Add the provided DNS records to your domain

### 4. Environment Variables

Add to your `.env` file:

```bash
# SendGrid Configuration
SENDGRID_API_KEY="SG.your-actual-api-key-here"
SENDGRID_FROM_EMAIL="noreply@gaelic-trips.com"
SENDGRID_FROM_NAME="Gaelic Trips"
```

## Testing

### Quick Test
```bash
npx ts-node --project scripts/tsconfig.json scripts/test-email.ts
```

### Expected Output
```
🧪 Testing Email System...

1. Testing email server connection...
✅ SendGrid API key is configured

2. Testing email template generation...
✅ Email template generated successfully!

3. Sending test email...
✅ Test email sent successfully via SendGrid: 202

🎉 Email system test completed!
```

## Email Templates

### Admin Notification (New User Registration)
- **Trigger**: When a user registers
- **Recipients**: All users with `SUPER_ADMIN` role
- **Content**: User details, registration time, admin panel links

### User Approval Notification
- **Trigger**: When admin approves a user account
- **Recipients**: The approved user
- **Content**: Welcome message, login instructions

### User Rejection Notification
- **Trigger**: When admin rejects a user account
- **Recipients**: The rejected user
- **Content**: Polite rejection message, contact information

## API Integration

### Registration Flow
```
User registers → Email sent to all admins → Admin reviews → User gets approval/rejection email
```

### Relevant API Endpoints
- `POST /api/auth/register` - Triggers admin notification
- `POST /api/admin/users/[id]/approve` - Triggers user approval email
- `POST /api/admin/users/[id]/reject` - Triggers user rejection email

## Development vs Production

### Development (No SendGrid configured)
- Emails are logged to console
- System works normally without sending actual emails
- Perfect for local development

### Production (SendGrid configured)
- Actual emails are sent via SendGrid
- Admin notifications ensure timely user approvals
- Professional communication with users

## Troubleshooting

### Common Issues

**1. "SendGrid API key not configured"**
- Check `.env` file has `SENDGRID_API_KEY`
- Ensure API key starts with `SG.`
- Restart your development server

**2. "Failed to send email via SendGrid"**
- Check sender email is verified in SendGrid
- Ensure API key has correct permissions
- Check SendGrid dashboard for error details

**3. Emails not being received**
- Check spam/junk folders
- Verify sender email in SendGrid dashboard
- Ensure recipient email addresses are valid

### SendGrid Dashboard
Monitor email delivery in your SendGrid dashboard:
- Activity → All Activity (real-time email logs)
- Stats → Overview (delivery statistics)
- Suppression Management (bounced/blocked emails)

## Production Recommendations

1. **Domain Authentication**: Set up domain authentication for better deliverability
2. **Dedicated IP**: Consider for high-volume sending
3. **Templates**: Use SendGrid dynamic templates for easier management
4. **Webhooks**: Set up webhooks for bounce/spam reporting
5. **Monitoring**: Monitor delivery rates and engagement metrics

## Cost Structure

- **Free Tier**: 100 emails/day permanently
- **Essentials**: $14.95/month for 50,000 emails
- **Pro**: $89.95/month for 100,000 emails

The free tier should be sufficient for most GAA club registration volumes.

## Security Notes

- Store API keys securely (never commit to git)
- Use environment variables for all credentials
- Regularly rotate API keys
- Monitor SendGrid activity for unusual sending patterns