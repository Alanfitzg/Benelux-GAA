# Email Notification System - Resend Setup

## Overview

The Gaelic Trips platform uses Resend for reliable email delivery of admin notifications and user status updates.

## Features

✅ **Admin Notifications**: Instant email alerts when new users register  
✅ **User Status Updates**: Email notifications when accounts are approved/rejected  
✅ **Professional Templates**: GAA-branded HTML email templates  
✅ **Graceful Fallback**: Logs emails when Resend isn't configured (development)  
✅ **Bulk Email Support**: Efficient sending to multiple admins  

## Resend Configuration

### 1. Create Resend Account
- Sign up at [https://resend.com](https://resend.com)
- Start with the free plan (3,000 emails/month, 100 emails/day)

### 2. Generate API Key
1. Go to API Keys in your Resend dashboard
2. Click "Create API Key"
3. Give it a descriptive name (e.g., "Gaelic Trips Production")
4. Copy the API key (starts with `re_`)

### 3. Verify Sender Domain
**For Production:**
1. Go to Domains in your Resend dashboard
2. Click "Add Domain"
3. Enter your domain (e.g., `gaelic-trips.com`)
4. Add the provided DNS records to your domain:
   - SPF record
   - DKIM records
   - Return-Path record (optional but recommended)

**For Development:**
- You can use Resend's test email address: `onboarding@resend.dev`
- Or verify a single email address for testing

### 4. Environment Variables

Add to your `.env` file:

```bash
# Resend Configuration
RESEND_API_KEY="re_your-actual-api-key-here"
RESEND_FROM_EMAIL="noreply@gaelic-trips.com"
RESEND_FROM_NAME="Gaelic Trips"
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
✅ Resend API key is configured and valid

2. Testing email template generation...
✅ Email template generated successfully!

3. Sending test email...
✅ Email sent successfully via Resend: email_id_here

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

### Development (No Resend configured)
- Emails are logged to console
- System works normally without sending actual emails
- Perfect for local development

### Production (Resend configured)
- Actual emails are sent via Resend
- Admin notifications ensure timely user approvals
- Professional communication with users

## Troubleshooting

### Common Issues

**1. "Resend API key not configured"**
- Check `.env` file has `RESEND_API_KEY`
- Ensure API key starts with `re_`
- Restart your development server

**2. "Failed to send email via Resend"**
- Check sender domain/email is verified in Resend
- Ensure API key has correct permissions
- Check Resend dashboard for error details

**3. Emails not being received**
- Check spam/junk folders
- Verify sender domain in Resend dashboard
- Ensure recipient email addresses are valid
- Check DNS records are properly configured

### Resend Dashboard
Monitor email delivery in your Resend dashboard:
- Emails → View all sent emails and their status
- Analytics → Track open rates and delivery metrics
- Webhooks → Set up real-time event notifications
- Logs → Debug API requests and responses

## Production Recommendations

1. **Domain Verification**: Always verify your domain for better deliverability
2. **Webhooks**: Set up webhooks for bounce/delivery tracking
3. **React Email**: Consider using React Email templates for easier maintenance
4. **Rate Limiting**: Implement rate limiting to stay within plan limits
5. **Monitoring**: Use Resend's analytics to track engagement

## Cost Structure

- **Free Tier**: 3,000 emails/month, 100/day
- **Pro**: $20/month for 50,000 emails
- **Business**: Custom pricing for higher volumes

The free tier should be sufficient for most GAA club registration volumes.

## Security Notes

- Store API keys securely (never commit to git)
- Use environment variables for all credentials
- Regularly rotate API keys
- Monitor Resend activity for unusual sending patterns
- Use domain verification for SPF/DKIM authentication

## Resend vs SendGrid Benefits

- **Developer Experience**: Cleaner API and better documentation
- **React Integration**: Native React Email support
- **Pricing**: More generous free tier
- **Simplicity**: Easier setup and configuration
- **Modern**: Built for modern web applications