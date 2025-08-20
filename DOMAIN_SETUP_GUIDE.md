# Domain Setup Guide for PlayAway

## Domains to Configure
1. **playawaygaa.com**
2. **playgaaaway.com**

## Step 1: Vercel Domain Configuration

### In Vercel Dashboard:
1. Go to your project in Vercel Dashboard
2. Navigate to **Settings** → **Domains**
3. Click **Add Domain**
4. Add each domain one by one:
   - `playawaygaa.com`
   - `playgaaaway.com`

## Step 2: DNS Configuration

### For Each Domain (at your domain registrar):

#### Option A: Using Vercel Nameservers (Recommended)
Point your domain's nameservers to Vercel:
- `ns1.vercel-dns.com`
- `ns2.vercel-dns.com`

#### Option B: Using A and CNAME Records
If you prefer to keep your current DNS provider:

**For root domain (e.g., playawaygaa.com):**
- Add an A record pointing to: `76.76.21.21`

**For www subdomain (e.g., www.playawaygaa.com):**
- Add a CNAME record pointing to: `cname.vercel-dns.com`

## Step 3: SSL Certificates
- Vercel automatically provisions SSL certificates once DNS is configured
- This usually takes 10-30 minutes after DNS propagation

## Step 4: Environment Variables Update

### Update NEXTAUTH_URL for production:
In Vercel Dashboard → Settings → Environment Variables:

Add/Update these variables:
```
NEXTAUTH_URL=https://playawaygaa.com
```

Or if you want to support multiple domains dynamically, keep it as your primary domain.

## Step 5: NextAuth Configuration for Multiple Domains

The app needs to handle authentication across multiple domains. Update the following:

### In `/src/lib/auth.ts`:
- Add authorized callback URLs for OAuth providers
- Google OAuth: Add redirect URIs in Google Cloud Console
- Facebook OAuth: Add redirect URIs in Facebook Developer Console

### Redirect URIs to add for each provider:
```
https://playawaygaa.com/api/auth/callback/google
https://www.playawaygaa.com/api/auth/callback/google
https://playgaaaway.com/api/auth/callback/google
https://www.playgaaaway.com/api/auth/callback/google

https://playawaygaa.com/api/auth/callback/facebook
https://www.playawaygaa.com/api/auth/callback/facebook
https://playgaaaway.com/api/auth/callback/facebook
https://www.playgaaaway.com/api/auth/callback/facebook
```

## Step 6: Update OAuth Provider Settings

### Google Cloud Console:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID
5. Add the new authorized redirect URIs (listed above)
6. Add authorized JavaScript origins:
   - `https://playawaygaa.com`
   - `https://www.playawaygaa.com`
   - `https://playgaaaway.com`
   - `https://www.playgaaaway.com`

### Facebook Developer Console (if using Facebook OAuth):
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Select your app
3. Go to **Facebook Login** → **Settings**
4. Add Valid OAuth Redirect URIs (listed above)
5. Add to App Domains:
   - `playawaygaa.com`
   - `playgaaaway.com`

## Step 7: Testing

### DNS Propagation Check:
Use tools like https://dnschecker.org to verify DNS propagation

### Test each domain:
1. Visit https://playawaygaa.com
2. Visit https://playgaaaway.com
3. Test authentication on each domain
4. Verify SSL certificates are working (green padlock)

## Step 8: SEO Considerations

### Choose a Primary Domain:
Decide which domain should be your primary (canonical) domain for SEO purposes.

### Add Redirects (Optional):
If you want one domain to be primary, you can set up redirects in `next.config.js`:

```javascript
async redirects() {
  return [
    {
      source: '/:path*',
      has: [
        {
          type: 'host',
          value: 'playgaaaway.com',
        },
      ],
      destination: 'https://playawaygaa.com/:path*',
      permanent: true,
    },
  ]
}
```

## Verification Checklist

- [ ] Both domains added to Vercel
- [ ] DNS records configured for both domains
- [ ] SSL certificates active for both domains
- [ ] OAuth redirect URIs updated in Google Console
- [ ] OAuth redirect URIs updated in Facebook Console (if applicable)
- [ ] Test sign-in works on both domains
- [ ] Test sign-up works on both domains
- [ ] Verify mobile responsiveness on both domains

## Troubleshooting

### Domain not working after 24 hours:
- Check DNS propagation status
- Verify nameservers or A/CNAME records are correct
- Check Vercel dashboard for any configuration errors

### Authentication issues:
- Ensure all redirect URIs are added to OAuth providers
- Check browser console for specific error messages
- Verify NEXTAUTH_URL is set correctly

### SSL Certificate issues:
- Wait for automatic provisioning (can take up to 30 minutes)
- If still not working, remove and re-add domain in Vercel

## Support Resources
- [Vercel Domains Documentation](https://vercel.com/docs/concepts/projects/domains)
- [NextAuth.js Multiple Domains](https://next-auth.js.org/configuration/options#nextauth_url)
- [DNS Propagation Checker](https://dnschecker.org)