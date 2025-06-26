# GAA Trips - TODO List

## 🔐 Social Authentication Implementation

### **Effort Level: MODERATE** ⭐⭐⭐ (Estimated: 2-3 hours total)

**Current Status:** App uses NextAuth.js v5 with credentials-only authentication
**Goal:** Add Google, Facebook, and Apple Sign-In options

---

### **Step 1: Provider Registration** (45-90 minutes)

#### Google OAuth Setup (15-30 min)
- [ ] Go to [Google Cloud Console](https://console.cloud.google.com/)
- [ ] Create new project or select existing one
- [ ] Enable Google+ API
- [ ] Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
- [ ] Set application type to "Web application"
- [ ] Add authorized redirect URIs:
  - `http://localhost:3000/api/auth/callback/google` (development)
  - `https://your-domain.com/api/auth/callback/google` (production)
- [ ] Save Client ID and Client Secret

#### Facebook OAuth Setup (15-30 min)
- [ ] Go to [Facebook Developers](https://developers.facebook.com/)
- [ ] Create new app → "Consumer" type
- [ ] Add "Facebook Login" product
- [ ] Configure Facebook Login settings:
  - Valid OAuth Redirect URIs: `https://your-domain.com/api/auth/callback/facebook`
- [ ] Get App ID and App Secret from Settings → Basic

#### Apple Sign-In Setup (30-45 min) - Most Complex
- [ ] Go to [Apple Developer Portal](https://developer.apple.com/)
- [ ] Create new App ID with "Sign In with Apple" capability
- [ ] Create Services ID for web authentication
- [ ] Generate private key for Sign in with Apple
- [ ] Configure domain verification
- [ ] Set redirect URLs

---

### **Step 2: Environment Variables** (5 minutes)

Add to `.env.local`:
```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Facebook OAuth  
FACEBOOK_CLIENT_ID=your_facebook_app_id_here
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret_here

# Apple Sign-In (when ready)
APPLE_ID=your_apple_services_id_here
APPLE_TEAM_ID=your_apple_team_id_here
APPLE_PRIVATE_KEY=your_apple_private_key_here
APPLE_KEY_ID=your_apple_key_id_here
```

---

### **Step 3: NextAuth Configuration** (20-30 minutes)

#### Update `/src/lib/auth.ts`:
- [ ] Import Google and Facebook providers
- [ ] Add providers to configuration
- [ ] Handle account linking logic
- [ ] Set up proper session handling for OAuth users

#### Sample Implementation:
```typescript
import Google from "next-auth/providers/google"
import Facebook from "next-auth/providers/facebook"

providers: [
  // Existing credentials provider...
  Google({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  }),
  Facebook({
    clientId: process.env.FACEBOOK_CLIENT_ID!,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
  }),
]
```

---

### **Step 4: UI Updates** (30-45 minutes)

#### Update Sign-In Page (`/src/app/signin/page.tsx`):
- [ ] Add social login buttons
- [ ] Style buttons to match brand
- [ ] Add loading states
- [ ] Handle error messages

#### Update Sign-Up Page (`/src/app/signup/page.tsx`):
- [ ] Add social registration options
- [ ] Maintain role selection for social users
- [ ] Handle terms acceptance

#### Create Social Button Components:
- [ ] `SocialLoginButton.tsx` - Reusable component
- [ ] Google, Facebook, Apple button variants
- [ ] Proper icons and branding

---

### **Step 5: Database Considerations** (15-30 minutes)

#### Account Linking:
- [ ] Handle users who sign up with email then use social login
- [ ] Prevent duplicate accounts
- [ ] Merge account data when appropriate

#### Role Assignment:
- [ ] Default role for social login users
- [ ] Club affiliation workflow for OAuth users
- [ ] Admin approval process (if needed)

---

### **Step 6: Testing & Edge Cases** (30-45 minutes)

#### Test Scenarios:
- [ ] New user registration via each provider
- [ ] Existing user login via each provider
- [ ] Account linking (email → social)
- [ ] Error handling (cancelled auth, network issues)
- [ ] Mobile testing (especially Apple)

#### Edge Cases:
- [ ] Email not provided by provider
- [ ] User denies permission
- [ ] Account already exists with different provider
- [ ] Network timeouts during auth

---

## 🎯 **Success Criteria:**

### **Phase 1: Google + Facebook** (Recommended MVP)
- [ ] Users can sign in with Google
- [ ] Users can sign in with Facebook  
- [ ] New social users get appropriate default roles
- [ ] Existing users can link social accounts
- [ ] UI matches brand design

### **Phase 2: Apple Sign-In** (Future Enhancement)
- [ ] Apple Sign-In integration
- [ ] iOS Safari testing
- [ ] Hide email option handling

---

## 🚨 **Important Considerations:**

### **Security:**
- [ ] Validate redirect URIs in production
- [ ] Store client secrets securely
- [ ] Implement proper CSRF protection
- [ ] Rate limit authentication attempts

### **UX Decisions:**
- [ ] What happens when social user needs club role?
- [ ] Account linking vs separate accounts?
- [ ] Username generation for social users
- [ ] Email verification requirements

### **Data Privacy:**
- [ ] Update privacy policy for social data
- [ ] Handle data deletion requests
- [ ] GDPR compliance for EU users
- [ ] User consent for data collection

---

## 📊 **Benefits Expected:**

### **User Experience:**
- ✅ Faster registration/login process
- ✅ No password fatigue
- ✅ Higher conversion rates
- ✅ Reduced support requests (password resets)

### **Business Benefits:**
- ✅ More user registrations
- ✅ Better user data (verified emails)
- ✅ Reduced authentication overhead
- ✅ Professional appearance

---

## 🔄 **Post-Implementation:**

### **Monitoring:**
- [ ] Track authentication method usage
- [ ] Monitor error rates by provider
- [ ] User conversion funnel analysis
- [ ] Performance impact assessment

### **Maintenance:**
- [ ] Keep provider dependencies updated
- [ ] Monitor for API changes
- [ ] Refresh OAuth credentials before expiry
- [ ] Regular security audits

---

**Priority:** Medium-High  
**Estimated Completion:** 1-2 weeks (depending on Apple complexity)  
**Dependencies:** None (can be done incrementally)  
**Risk Level:** Low-Medium (well-documented process)