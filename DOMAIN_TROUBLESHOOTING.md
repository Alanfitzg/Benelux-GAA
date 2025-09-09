# Domain Setup Troubleshooting Guide

## Current Issue
Both domains (`playawaygaa.com` and `playgaaaway.com`) are returning SERVFAIL errors, indicating DNS configuration issues.

## Step-by-Step Resolution

### 1. Verify Vercel Configuration ✅

In your Vercel dashboard:
1. Go to your project → **Settings** → **Domains**
2. Verify both domains appear in the list
3. Check the status for each domain:
   - **🔴 Red indicator**: Configuration issue
   - **🟡 Yellow indicator**: Pending verification
   - **🟢 Green indicator**: Active and working

### 2. Check Domain Registrar Settings

Log into your domain registrar (where you purchased the domains) and verify:

#### For BOTH domains:

**Option A: Nameserver Configuration (Recommended)**
```
Nameserver 1: ns1.vercel-dns.com
Nameserver 2: ns2.vercel-dns.com
```

**Important**: 
- Remove ALL other nameservers
- These should be the ONLY two nameservers listed
- Some registrars may require a third nameserver - contact support if needed

**Option B: A/CNAME Records (If keeping current DNS provider)**
```
Type: A
Name: @ (or blank for root domain)
Value: 76.76.21.21
TTL: 3600 (or Auto)

Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600 (or Auto)
```

### 3. Common Issues & Solutions

#### Issue: "Invalid Configuration" in Vercel
**Solution**: 
- Remove the domain from Vercel
- Re-add it
- Follow the configuration instructions exactly

#### Issue: Nameservers not updating
**Solution**:
- Some registrars have a 24-48 hour lock after domain purchase
- Check if domain is locked or has transfer protection enabled
- Contact registrar support if nameservers won't save

#### Issue: "SERVFAIL" errors (current issue)
**Causes**:
1. Nameservers haven't propagated yet (can take 24-48 hours)
2. Incorrect nameserver configuration at registrar
3. Domain is new and DNS hasn't fully initialized

### 4. Verification Commands

Run these commands to check progress:

```bash
# Check nameservers
nslookup -type=NS playawaygaa.com

# Check A records
nslookup playawaygaa.com

# Use Google's DNS
nslookup playawaygaa.com 8.8.8.8

# Check with dig (more detailed)
dig playawaygaa.com NS
dig playawaygaa.com A
```

### 5. Timeline Expectations

| Action | Expected Time |
|--------|--------------|
| Nameserver change at registrar | Immediate |
| DNS propagation start | 15-30 minutes |
| Partial propagation | 2-6 hours |
| Full global propagation | 24-48 hours |
| SSL certificate generation | 10-30 minutes after DNS works |

### 6. While Waiting for DNS

You can continue development using:
1. Your existing domain (if you have one)
2. Vercel preview URLs
3. Local development (localhost:3000)

### 7. Next Steps After DNS Propagates

Once domains are resolving:

1. **Test each domain**:
   - https://playawaygaa.com
   - https://www.playawaygaa.com
   - https://playgaaaway.com
   - https://www.playgaaaway.com

2. **Update OAuth providers** (Google):
   - Add redirect URIs for new domains
   - Add authorized JavaScript origins

3. **Test authentication**:
   - Sign in with email/password
   - Sign in with Google OAuth

### 8. Quick Check List

- [ ] Domains added to Vercel project
- [ ] Nameservers updated at registrar
- [ ] Waited at least 2-6 hours for initial propagation
- [ ] Verified with nslookup/dig commands
- [ ] SSL certificates showing in Vercel
- [ ] OAuth redirect URIs updated
- [ ] Site accessible via new domains

### 9. Support Contacts

**Vercel Support**: 
- Dashboard → Support
- https://vercel.com/support

**Common Registrars Support**:
- GoDaddy: 24/7 phone support
- Namecheap: Live chat
- Google Domains: Support center
- Your specific registrar's support

### 10. Alternative Temporary Solution

If you need the domains working immediately for testing:
1. Use Vercel's preview URLs temporarily
2. Update your local `/etc/hosts` file (development only):
   ```
   76.76.21.21 playawaygaa.com
   76.76.21.21 www.playawaygaa.com
   76.76.21.21 playgaaaway.com
   76.76.21.21 www.playgaaaway.com
   ```

## Current Status Check

Run this to see current status:
```bash
echo "Checking playawaygaa.com..."
nslookup playawaygaa.com 8.8.8.8
echo ""
echo "Checking playgaaaway.com..."
nslookup playgaaaway.com 8.8.8.8
echo ""
echo "Checking nameservers for playawaygaa.com..."
nslookup -type=NS playawaygaa.com 8.8.8.8
```

## Expected Successful Output

When properly configured, you should see:
```
Server:     8.8.8.8
Address:    8.8.8.8#53

Name:   playawaygaa.com
Address: 76.76.21.21
```

---

**Note**: DNS changes can take time. If you've just made changes, wait at least 2-6 hours before troubleshooting further. Most issues resolve themselves with time.