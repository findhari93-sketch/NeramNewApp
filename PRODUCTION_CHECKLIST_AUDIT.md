# Production Checklist Audit - Authentication System

**Audit Date:** November 25, 2025  
**System:** NeramNextApp Authentication  
**Scope:** Login, Signup, Email Verification, Social Auth

---

## Executive Summary

| Category                 | Status      | Score | Priority Actions                    |
| ------------------------ | ----------- | ----- | ----------------------------------- |
| **Security**             | 🟡 Partial  | 6/7   | Add CSRF protection, CSP headers    |
| **Monitoring & Logging** | 🔴 Missing  | 0/4   | Integrate Sentry, implement logging |
| **Testing**              | 🔴 Critical | 1/5   | Add auth tests, E2E, security tests |
| **User Experience**      | 🟡 Partial  | 3/6   | Add Remember Me, account deletion   |
| **Documentation**        | 🟢 Good     | 3/4   | Add troubleshooting guide, runbook  |

**Overall Readiness:** 🟡 **60% Production Ready** - Critical gaps in monitoring and testing

---

## 1. Security Implementation

### ✅ IMPLEMENTED (6/7)

#### ✅ httpOnly Secure Cookies

**Status:** ✅ **IMPLEMENTED**  
**Location:** `src/app/api/auth/set-session/route.ts`

```typescript
cookieStore.set("firebase_session", sessionCookie, {
  maxAge: expiresIn / 1000,
  httpOnly: true, // ✅ Prevents XSS
  secure: process.env.NODE_ENV === "production", // ✅ HTTPS only in prod
  sameSite: "lax", // ✅ CSRF protection
  path: "/",
});
```

**Evidence:**

- Line 98: `httpOnly: true` - tokens not accessible via JavaScript
- Line 99: `secure: true` in production - HTTPS enforcement
- Line 100: `sameSite: "lax"` - prevents cross-site cookie sending

**Security Level:** ⭐⭐⭐⭐⭐ Excellent

---

#### ✅ Client-Side Rate Limiting

**Status:** ✅ **IMPLEMENTED**  
**Location:** `src/hooks/useRateLimiter.ts`

```typescript
RATE_LIMIT_CONFIGS = {
  LOGIN: { maxAttempts: 5, windowMs: 15 * 60 * 1000 }, // 5 per 15min
  SIGNUP: { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour
  EMAIL_RESEND: { maxAttempts: 5, windowMs: 60 * 60 * 1000 }, // 5 per hour
  PASSWORD_RESET: { maxAttempts: 3, windowMs: 24 * 60 * 60 * 1000 }, // 3 per day
};
```

**Implementation Details:**

- Sliding window algorithm (not fixed windows)
- localStorage persistence across page reloads
- Automatic cleanup every 60 seconds
- User-friendly countdown timers

**Limitations:** ⚠️

- Client-side only (can be bypassed by clearing localStorage)
- No IP-based tracking
- No distributed rate limiting

**Security Level:** ⭐⭐⭐ Good (client-side protection only)

---

#### ✅ Input Sanitization

**Status:** ✅ **IMPLEMENTED**  
**Location:** `src/lib/validation/email.ts`, `src/lib/auth/validation.ts`

**Email Validation:**

```typescript
// Blocks disposable emails
const DISPOSABLE_DOMAINS = [
  'tempmail.com', 'guerrillamail.com', '10minutemail.com',
  'mailinator.com', 'trashmail.com', // ... 20+ domains
];

// RFC 5321 compliant validation
- Local part: 1-64 characters, specific allowed chars
- Domain: valid DNS labels, proper TLD
- Blocks dangerous patterns, SQL injection attempts
```

**Password Validation:**

```typescript
passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Must contain uppercase letter")
  .regex(/[a-z]/, "Must contain lowercase letter")
  .regex(/[0-9]/, "Must contain number");
```

**Security Level:** ⭐⭐⭐⭐ Very Good

---

#### ✅ Session Management

**Status:** ✅ **IMPLEMENTED**  
**Location:** `src/middleware.ts`, `src/app/api/auth/set-session/route.ts`

**Features:**

- HMAC-signed session cookies (prevents tampering)
- 5-day expiration (Firebase default)
- Path-based protection (`/dashboard/**`)
- Automatic redirect to login when expired

**Middleware Protection:**

```typescript
function validateSessionCookie(req: NextRequest) {
  const cookie = req.cookies.get("neram_session")?.value;
  const [base, signature] = cookie.split(".");
  const expected = crypto
    .createHmac("sha256", secret)
    .update(base)
    .digest("base64url");
  return signature === expected; // Cryptographic verification
}
```

**Security Level:** ⭐⭐⭐⭐ Very Good

---

#### ✅ Account Lockout (Partial)

**Status:** 🟡 **PARTIAL** - Client-side only  
**Implementation:** Rate limiting provides basic lockout

**Current:**

- 5 failed login attempts → 15 minute lockout
- 3 failed signups → 1 hour lockout
- Stored in localStorage (per device)

**Missing:**

- ❌ Server-side account lockout
- ❌ Database tracking of failed attempts
- ❌ IP-based lockout
- ❌ Progressive delays (exponential backoff)
- ❌ Admin unlock capability

**Security Level:** ⭐⭐ Needs Improvement

---

#### ✅ Social Login (Google)

**Status:** ✅ **IMPLEMENTED**  
**Location:** `src/app/auth/login/page.tsx`, `src/app/components/shared/PhoneAuth.tsx`

**Features:**

- Google OAuth integration with popup flow
- Account linking for existing users (`linkWithCredential`)
- Phone number linking (`linkWithPhoneNumber`)
- Provider detection before signup

**Security Level:** ⭐⭐⭐⭐ Very Good

---

### ❌ NOT IMPLEMENTED (1/7)

#### ❌ CSRF Protection

**Status:** ❌ **MISSING**  
**Priority:** 🔴 **HIGH**

**Current State:**

- No CSRF tokens on forms
- No double-submit cookie pattern
- `sameSite: "lax"` provides basic protection but not complete

**Recommendation:**

```typescript
// Add to all auth endpoints
import { csrf } from "@edge-runtime/cookies";

// Generate token
const token = csrf.generate();
res.setHeader("Set-Cookie", csrf.serialize(token));

// Validate on POST
if (!csrf.verify(req.headers.get("x-csrf-token"), cookieToken)) {
  return new Response("Invalid CSRF token", { status: 403 });
}
```

**Impact:** Medium - `sameSite: lax` mitigates most CSRF risks  
**Effort:** 2-3 hours

---

#### ❌ Content Security Policy (CSP)

**Status:** ❌ **MISSING**  
**Priority:** 🔴 **HIGH**

**Current State:**

- No CSP headers in `next.config.ts`
- Only `Permissions-Policy` for encrypted-media
- Vulnerable to XSS injection attacks

**Recommendation:**

```typescript
// Add to next.config.ts headers()
{
  key: 'Content-Security-Policy',
  value: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://*.googleapis.com https://*.supabase.co",
    "frame-src 'self' https://accounts.google.com",
  ].join('; ')
}
```

**Impact:** High - Prevents XSS, clickjacking, code injection  
**Effort:** 4-6 hours (testing inline scripts compatibility)

---

#### ❌ 2FA Support

**Status:** ❌ **NOT IMPLEMENTED**  
**Priority:** 🟡 **MEDIUM**

**Current State:**

- Only password and social login
- No TOTP, SMS, or authenticator app support
- Firebase supports multi-factor auth but not integrated

**Recommendation:**

```typescript
// Use Firebase multi-factor auth
import {
  multiFactor,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
} from "firebase/auth";

// Enrollment flow
const session = await multiFactor(user).getSession();
const phoneInfoOptions = { phoneNumber: "+1234567890", session };
const verificationId = await phoneAuthProvider.verifyPhoneNumber(
  phoneInfoOptions
);
const credential = PhoneAuthProvider.credential(
  verificationId,
  verificationCode
);
const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(credential);
await multiFactor(user).enroll(multiFactorAssertion, "Personal Phone");
```

**Impact:** Medium - Required for enterprise customers, compliance  
**Effort:** 16-24 hours (UI + testing)

---

## 2. Monitoring & Logging

### ❌ ALL MISSING (0/4)

#### ❌ Error Tracking (Sentry/Rollbar)

**Status:** ❌ **NOT IMPLEMENTED**  
**Priority:** 🔴 **CRITICAL**

**Current State:**

- Placeholder comments in `src/utils/authErrors.ts`:
  ```typescript
  // if (typeof window !== 'undefined' && window.Sentry) {
  //   window.Sentry.captureException(error);
  // }
  ```
- Console.error logging only
- No production error visibility

**Recommendation:**

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event, hint) {
    // Filter sensitive data
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers?.Authorization;
    }
    return event;
  },
});
```

**Impact:** Critical - No visibility into production errors  
**Effort:** 2-3 hours

---

#### ❌ Authentication Event Logging

**Status:** ❌ **NOT IMPLEMENTED**  
**Priority:** 🔴 **HIGH**

**Current State:**

- No structured logging
- Console logs only (`console.warn`, `console.error`)
- No audit trail for:
  - Login attempts (success/failure)
  - Password changes
  - Account creation
  - Email verification
  - Session creation/destruction

**Recommendation:**

```typescript
// lib/auditLog.ts
export async function logAuthEvent(event: {
  type: "LOGIN" | "SIGNUP" | "PASSWORD_CHANGE" | "EMAIL_VERIFY";
  userId?: string;
  email?: string;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}) {
  const log = {
    timestamp: new Date().toISOString(),
    ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
    userAgent: req.headers.get("user-agent"),
    ...event,
  };

  // Send to logging service (Datadog, CloudWatch, etc.)
  await fetch(process.env.LOG_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(log),
  });
}

// Usage in set-session route
await logAuthEvent({
  type: "LOGIN",
  userId: decodedToken.uid,
  email: decodedToken.email,
  success: true,
});
```

**Impact:** Critical - Compliance requirement, security auditing  
**Effort:** 6-8 hours

---

#### ❌ Alerts for Unusual Activity

**Status:** ❌ **NOT IMPLEMENTED**  
**Priority:** 🟡 **MEDIUM**

**Current State:**

- No monitoring for:
  - Spike in failed login attempts
  - Multiple logins from different locations
  - Account creation surge
  - Unusual password reset volume

**Recommendation:**

```typescript
// Trigger alerts when:
- Failed login rate > 100/min (DDoS/brute force)
- Single IP > 50 requests/min (scraping)
- Account creation > 10/min from same IP (bot)
- Password reset > 20/hr (enumeration attack)

// Implementation with Sentry
Sentry.captureMessage('High failed login rate', {
  level: 'warning',
  tags: { alert_type: 'auth_anomaly' },
  extra: { rate: failedLoginCount, window: '1min' },
});
```

**Impact:** Medium - Early threat detection  
**Effort:** 8-12 hours (requires metrics pipeline)

---

#### ❌ Conversion Funnel Metrics

**Status:** ❌ **NOT IMPLEMENTED**  
**Priority:** 🟢 **LOW**

**Current State:**

- No analytics tracking for:
  - Signup start → email verification → profile completion
  - Login attempts → success rate
  - Social login vs email/password preference
  - Drop-off points

**Recommendation:**

```typescript
// Google Analytics 4 events
gtag("event", "signup_started", { method: "email" });
gtag("event", "email_verification_sent");
gtag("event", "signup_completed", { method: "email" });

// Or Mixpanel
mixpanel.track("Login Attempted", { method: "email" });
mixpanel.track("Login Successful", { method: "email", time_to_login: 3.2 });
```

**Impact:** Low - Product optimization, not security  
**Effort:** 4-6 hours

---

## 3. Testing Coverage

### ✅ PARTIAL (1/5)

#### ✅ Unit Tests (Limited)

**Status:** 🟡 **PARTIAL**  
**Coverage:** ~15% (3 test files only)

**Existing Tests:**

1. `src/lib/__tests__/userFieldMapping.test.ts` (21 tests)

   - Database field mapping
   - JSONB grouping/flattening
   - Merge operations

2. `src/lib/__tests__/user-cache.test.ts` (2 tests)

   - Cache read/write
   - TTL expiration

3. `src/app/components/shared/__tests__/profile-utils.test.tsx`
   - Profile completeness checks

**Missing Auth Tests:**

- ❌ Email validation logic
- ❌ Password strength validation
- ❌ Rate limiter logic
- ❌ Auth state machine transitions
- ❌ Error handling functions
- ❌ Provider detection service

**Recommendation:**

```typescript
// src/lib/validation/__tests__/email.test.ts
describe("validateEmailForAuth", () => {
  it("should reject disposable email domains", () => {
    const result = validateEmailForAuth("test@tempmail.com");
    expect(result.success).toBe(false);
    expect(result.error).toContain("disposable");
  });

  it("should reject invalid email formats", () => {
    expect(validateEmailForAuth("invalid").success).toBe(false);
    expect(validateEmailForAuth("missing@domain").success).toBe(false);
  });

  it("should accept valid emails", () => {
    const result = validateEmailForAuth("user@example.com");
    expect(result.success).toBe(true);
    expect(result.data.email).toBe("user@example.com");
  });
});

// src/hooks/__tests__/useRateLimiter.test.ts
describe("useRateLimiter", () => {
  it("should allow attempts within limit", () => {
    const { result } = renderHook(() =>
      useRateLimiter({ maxAttempts: 5, windowMs: 60000 })
    );
    expect(result.current.isRateLimited()).toBe(false);
  });

  it("should block after max attempts", () => {
    const { result } = renderHook(() =>
      useRateLimiter({ maxAttempts: 3, windowMs: 60000 })
    );
    act(() => {
      result.current.recordAttempt();
    });
    act(() => {
      result.current.recordAttempt();
    });
    act(() => {
      result.current.recordAttempt();
    });
    expect(result.current.isRateLimited()).toBe(true);
  });
});
```

**Impact:** High - Catch regressions, enable refactoring  
**Effort:** 16-24 hours (50+ tests needed)

---

#### ❌ Integration Tests

**Status:** ❌ **NOT IMPLEMENTED**  
**Priority:** 🔴 **HIGH**

**Missing Coverage:**

- Email/password signup flow end-to-end
- Google OAuth flow
- Email verification flow
- Password reset flow
- Session creation and validation
- Profile completion after signup

**Recommendation:**

```typescript
// __tests__/integration/auth.test.ts
describe("Email Signup Flow", () => {
  it("should complete signup → verification → login", async () => {
    // 1. Signup
    const signupRes = await request(app)
      .post("/api/auth/signup")
      .send({ email: "test@example.com", password: "Test123!" });
    expect(signupRes.status).toBe(200);

    // 2. Check verification email sent
    const emailLog = await getLastEmail("test@example.com");
    expect(emailLog.subject).toContain("Verify");

    // 3. Extract verification link
    const verifyUrl = extractLink(emailLog.html);

    // 4. Click verification link
    const verifyRes = await request(app).get(verifyUrl);
    expect(verifyRes.status).toBe(200);

    // 5. Login with verified account
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "Test123!" });
    expect(loginRes.status).toBe(200);
    expect(loginRes.headers["set-cookie"]).toBeDefined();
  });
});
```

**Tools:** Jest + Supertest + Firebase Test SDK  
**Impact:** Critical - Validates entire auth pipeline  
**Effort:** 24-32 hours

---

#### ❌ E2E Tests

**Status:** ❌ **NOT IMPLEMENTED**  
**Priority:** 🔴 **HIGH**

**Missing:**

- Browser automation for critical paths
- Mobile testing (iOS Safari, Chrome Mobile)
- reCAPTCHA interaction testing
- Social login popups
- Form validation feedback

**Recommendation:**

```typescript
// e2e/auth/login.spec.ts (Playwright)
test("should login with email and password", async ({ page }) => {
  await page.goto("/auth/login");

  await page.fill(
    '[aria-label="Email address or username"]',
    "test@example.com"
  );
  await page.fill('[aria-label="Password"]', "Test123!");
  await page.click('button[type="submit"]');

  // Wait for redirect
  await page.waitForURL("/dashboard");

  // Verify session cookie
  const cookies = await page.context().cookies();
  expect(cookies.find((c) => c.name === "firebase_session")).toBeDefined();
});

test("should show rate limit after 5 failed attempts", async ({ page }) => {
  await page.goto("/auth/login");

  for (let i = 0; i < 6; i++) {
    await page.fill(
      '[aria-label="Email address or username"]',
      "test@example.com"
    );
    await page.fill('[aria-label="Password"]', "WrongPassword123!");
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);
  }

  await expect(page.locator("text=Too many attempts")).toBeVisible();
  await expect(page.locator("text=/Try again in \\d+ minute/")).toBeVisible();
});
```

**Tools:** Playwright or Cypress  
**Impact:** Critical - Catches UI/UX bugs  
**Effort:** 32-40 hours

---

#### ❌ Security Testing

**Status:** ❌ **NOT IMPLEMENTED**  
**Priority:** 🔴 **CRITICAL**

**Missing:**

- SQL injection tests
- XSS vulnerability scans
- CSRF attack simulations
- Session fixation tests
- Rate limit bypass attempts
- Password brute force resistance

**Recommendation:**

```bash
# OWASP ZAP automated scan
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t https://your-app.com/auth/login \
  -r zap-report.html

# Manual penetration testing checklist:
1. SQL Injection in email/username fields
2. XSS in error messages
3. CSRF on password change
4. Session fixation (steal session after logout)
5. Rate limit bypass (multiple IPs, cookies cleared)
6. Password enumeration (timing attacks)
7. Open redirect after login
```

**Tools:** OWASP ZAP, Burp Suite, custom scripts  
**Impact:** Critical - Compliance requirement  
**Effort:** 16-24 hours + ongoing

---

#### ❌ Load Testing

**Status:** ❌ **NOT IMPLEMENTED**  
**Priority:** 🟡 **MEDIUM**

**Missing:**

- Concurrent login performance
- Database connection pooling under load
- Session creation bottlenecks
- API rate limit effectiveness

**Recommendation:**

```javascript
// k6 load test script
import http from "k6/http";

export let options = {
  stages: [
    { duration: "1m", target: 100 }, // Ramp up to 100 users
    { duration: "5m", target: 100 }, // Stay at 100 for 5 min
    { duration: "1m", target: 500 }, // Spike to 500
    { duration: "1m", target: 0 }, // Ramp down
  ],
};

export default function () {
  const payload = JSON.stringify({
    email: `user${__VU}@example.com`,
    password: "Test123!",
  });

  http.post("https://your-app.com/api/auth/login", payload, {
    headers: { "Content-Type": "application/json" },
  });
}
```

**Targets:**

- 100 concurrent logins: < 500ms p95 response time
- 500 concurrent logins: < 2s p95 response time
- 1000 concurrent: Graceful degradation (not crash)

**Impact:** Medium - Prevents production outages  
**Effort:** 8-12 hours

---

## 4. User Experience

### ✅ IMPLEMENTED (3/6)

#### ✅ Loading Skeletons

**Status:** ✅ **IMPLEMENTED**  
**Location:** `src/app/components/shared/NavbarProfile.tsx`

```typescript
<Skeleton variant="text" width={100} height={24} />
<Skeleton variant="text" width={60} height={16} />
<Skeleton variant="circular" width={36} height={36} />
```

**Coverage:**

- ✅ Profile loading state
- ❌ Login form initial load (not implemented)
- ❌ OAuth popup waiting state (not implemented)

**UX Level:** ⭐⭐⭐ Good (limited coverage)

---

#### ✅ Error Recovery

**Status:** ✅ **IMPLEMENTED**  
**Location:** `src/utils/authErrors.ts`, `src/components/auth/EnhancedEmailPasswordForm.tsx`

**Features:**

- Clear error messages for 20+ Firebase error codes
- Suggested actions (`retry`, `contact_support`, `verify_email`)
- Automatic retry for transient errors
- Screen reader announcements for errors

```typescript
const authError = handleAuthError(error);
// Returns: { code, userMessage, technicalDetails, action }

announceToScreenReader(authError.userMessage, "assertive");
```

**Missing:**

- ❌ Automatic retry with exponential backoff
- ❌ Offline detection and queue
- ❌ Network error differentiation

**UX Level:** ⭐⭐⭐⭐ Very Good

---

#### ✅ Social Login Linking

**Status:** ✅ **IMPLEMENTED**  
**Location:** `src/lib/auth/firebaseAuth.ts`, `src/app/components/shared/PhoneAuth.tsx`

**Features:**

```typescript
// Link email/password to existing Google account
await linkWithCredential(user, EmailAuthProvider.credential(email, password));

// Link phone number to existing account
await linkWithPhoneNumber(user, phoneNumber, recaptchaVerifier);
```

**Coverage:**

- ✅ Google → Email/Password linking
- ✅ Email/Password → Phone linking
- ✅ Phone → Email/Password linking
- ❌ Account unlinking (not implemented)

**UX Level:** ⭐⭐⭐⭐ Very Good

---

### ❌ NOT IMPLEMENTED (3/6)

#### ❌ Remember Me Functionality

**Status:** ❌ **NOT IMPLEMENTED**  
**Priority:** 🟡 **MEDIUM**

**Current State:**

- Fixed 5-day session expiration
- No option for extended sessions
- No "Remember me on this device" checkbox

**Recommendation:**

```typescript
// Login form
<FormControlLabel
  control={
    <Checkbox
      checked={rememberMe}
      onChange={(e) => setRememberMe(e.target.checked)}
    />
  }
  label="Remember me on this device"
/>;

// API route: /api/auth/set-session
const expiresIn = rememberMe
  ? 60 * 60 * 24 * 30 * 1000 // 30 days
  : 60 * 60 * 24 * 1 * 1000; // 1 day

cookieStore.set("firebase_session", sessionCookie, {
  maxAge: expiresIn / 1000,
  httpOnly: true,
  secure: true,
  sameSite: "lax",
});
```

**Impact:** Medium - User convenience vs security tradeoff  
**Effort:** 2-4 hours

---

#### ❌ Email Change Flow

**Status:** ❌ **NOT IMPLEMENTED**  
**Priority:** 🟡 **MEDIUM**

**Current State:**

- No UI to change email address
- No verification of new email before change
- No notification to old email

**Recommendation:**

```typescript
// 1. User requests email change
POST / api / users / change - email;
{
  newEmail: "newemail@example.com";
}

// 2. Send verification to NEW email
// 3. Send notification to OLD email
// 4. Only update after NEW email verified

// Firebase method
import { verifyBeforeUpdateEmail } from "firebase/auth";
await verifyBeforeUpdateEmail(user, "newemail@example.com");
```

**Security:** Must verify both emails to prevent account takeover  
**Impact:** Medium - Account management requirement  
**Effort:** 8-12 hours

---

#### ❌ Account Deletion

**Status:** ❌ **NOT IMPLEMENTED**  
**Priority:** 🟢 **LOW** (but required for GDPR)

**Current State:**

- No self-service account deletion
- No data export before deletion
- No grace period for recovery

**Recommendation:**

```typescript
// DELETE /api/users/delete-account
export async function DELETE(req: Request) {
  const user = await verifyAuth(req);

  // 1. Require recent authentication
  if (!user.auth_time || Date.now() - user.auth_time > 300000) {
    return Response.json(
      { error: "Reauthentication required" },
      { status: 403 }
    );
  }

  // 2. Mark for deletion (soft delete with 30-day grace period)
  await supabase
    .from("users_duplicate")
    .update({
      deleted_at: new Date(),
      deletion_scheduled_for: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    })
    .eq("id", user.uid);

  // 3. Send confirmation email
  await sendEmail({
    to: user.email,
    subject: "Account Deletion Scheduled",
    body: "Your account will be deleted in 30 days. To cancel, log in.",
  });

  // 4. Sign out
  await admin.auth().revokeRefreshTokens(user.uid);

  return Response.json({ ok: true, deletionDate: "2025-12-25" });
}

// Cron job: DELETE permanently after 30 days
// 1. Delete from Supabase
// 2. Delete from Firebase Auth
// 3. Delete from storage (avatars, etc.)
```

**GDPR Compliance:** Required for EU users  
**Impact:** High (legal) - Low (usage)  
**Effort:** 12-16 hours

---

## 5. Documentation

### ✅ IMPLEMENTED (3/4)

#### ✅ Auth Flow Diagrams

**Status:** ✅ **IMPLEMENTED**  
**Files:**

- `USER_SIGNUP_DATA_FLOW.md` - Complete signup flow
- `PAYMENT_FLOW_DIAGRAM.md` - Payment integration
- `AUTH_ARCHITECTURE_IMPROVEMENTS.md` - Architecture overview

**Coverage:**

- ✅ Email signup → verification → login
- ✅ Google OAuth flow
- ✅ Phone authentication flow
- ✅ Session management
- ❌ Password reset flow (not documented)

**Quality:** ⭐⭐⭐⭐ Very Good

---

#### ✅ Security Practices

**Status:** ✅ **DOCUMENTED**  
**Files:**

- `SECRETS_SETUP.md` - Environment variables
- `PRODUCTION_ENVIRONMENT_SETUP.md` - Production config
- `RECAPTCHA_FIX.md` - reCAPTCHA implementation
- `AUTH_ARCHITECTURE_IMPROVEMENTS.md` - Security patterns

**Coverage:**

- ✅ httpOnly cookie setup
- ✅ Firebase Admin initialization
- ✅ Environment variable management
- ✅ Rate limiting patterns
- ✅ HMAC session signing

**Quality:** ⭐⭐⭐⭐⭐ Excellent

---

#### ✅ Migration Guides

**Status:** ✅ **IMPLEMENTED**  
**Files:**

- `AUTH_MIGRATION_GUIDE.md` - Step-by-step integration
- `ADVANCED_AUTH_FEATURES.md` - New features overview

**Coverage:**

- ✅ Gradual migration strategy
- ✅ Code examples for each phase
- ✅ Testing instructions
- ✅ Rollback procedures

**Quality:** ⭐⭐⭐⭐⭐ Excellent

---

### ❌ NOT IMPLEMENTED (1/4)

#### ❌ Troubleshooting Guide

**Status:** ❌ **NOT IMPLEMENTED**  
**Priority:** 🟡 **MEDIUM**

**Missing:**

- Common error messages and solutions
- Debugging checklist
- Known issues and workarounds
- Browser-specific problems
- Mobile app issues

**Recommendation:**

```markdown
# AUTH_TROUBLESHOOTING.md

## Common Issues

### "Email already in use" error

**Symptom:** User can't sign up with email
**Cause:** Account exists with Google OAuth
**Solution:** Click "Sign in with Google" instead

### Session expired loops

**Symptom:** Redirects to login after successful login
**Cause:** Middleware cookie validation failing
**Solution:**

1. Check SESSION_SECRET matches between deployments
2. Clear browser cookies
3. Check HTTPS is enabled in production

### reCAPTCHA not showing

**Symptom:** Invisible reCAPTCHA doesn't work
**Cause:** Wrong site key or domain not whitelisted
**Solution:**

1. Verify NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY
2. Add domain to Google reCAPTCHA console

### Rate limit stuck

**Symptom:** "Too many attempts" persists after waiting
**Cause:** localStorage not clearing
**Solution:** Open DevTools → Application → Local Storage → Delete auth\_\*\_attempts
```

**Impact:** Medium - Reduces support burden  
**Effort:** 4-6 hours

---

#### ❌ Operational Runbook

**Status:** ❌ **NOT IMPLEMENTED**  
**Priority:** 🟡 **MEDIUM**

**Missing:**

- Incident response procedures
- Performance degradation steps
- Database migration rollback
- Emergency account unlock
- Monitoring dashboard setup

**Recommendation:**

````markdown
# AUTH_RUNBOOK.md

## Incident Response

### P1: Complete auth outage

**Symptoms:** Login page returns 500 errors
**Steps:**

1. Check Vercel deployment status
2. Check Supabase database health
3. Verify Firebase Admin credentials
4. Roll back to last known good deployment
5. Enable maintenance mode

### P2: High error rate (>5%)

**Symptoms:** Sentry alerts for auth errors
**Steps:**

1. Check error distribution by type
2. If rate-limit errors → increase limits temporarily
3. If firebase/\* errors → check Firebase quota
4. If supabase errors → check connection pool

### Account Unlock (Manual)

```sql
-- Clear rate limit in Redis/database
DELETE FROM rate_limits WHERE user_id = 'USER_ID';
```
````

```typescript
// Clear client localStorage (tell user)
localStorage.removeItem("auth_login_attempts");
```

**Impact:** High - Faster incident resolution  
**Effort:** 6-8 hours

---

## 6. Prioritized Recommendations

### 🔴 CRITICAL (Do Immediately)

1. **Implement Error Tracking (Sentry)** - 2-3 hours

   - Zero visibility into production errors
   - Install `@sentry/nextjs`
   - Configure `sentry.client.config.ts`
   - Set up alerts for auth errors

2. **Add Authentication Logging** - 6-8 hours

   - No audit trail for security events
   - Create `lib/auditLog.ts`
   - Log all login/signup/password change events
   - Include IP, user-agent, timestamp

3. **Write Integration Tests** - 24-32 hours

   - No confidence in deployment
   - Test email signup flow end-to-end
   - Test Google OAuth flow
   - Test password reset flow
   - Test session creation

4. **Security Testing** - 16-24 hours
   - Unknown vulnerabilities
   - Run OWASP ZAP scan
   - Test for SQL injection, XSS, CSRF
   - Document findings and fixes

---

### 🟡 HIGH (Do Before Production)

5. **Add CSP Headers** - 4-6 hours

   - Prevents XSS attacks
   - Configure in `next.config.ts`
   - Test inline scripts compatibility

6. **Implement CSRF Protection** - 2-3 hours

   - Vulnerable to cross-site attacks
   - Add CSRF tokens to all POST endpoints
   - Validate on server side

7. **Write E2E Tests** - 32-40 hours

   - Catch UI/UX regressions
   - Use Playwright or Cypress
   - Test critical paths in real browsers

8. **Add Server-Side Rate Limiting** - 8-12 hours
   - Client-side easily bypassed
   - Use Redis or database tracking
   - IP-based + user-based limits
   - Progressive delays

---

### 🟢 MEDIUM (Nice to Have)

9. **Implement 2FA** - 16-24 hours

   - Enterprise requirement
   - Use Firebase multi-factor auth
   - TOTP (authenticator app) support

10. **Write Unit Tests** - 16-24 hours

    - Increase code confidence
    - Test validation logic
    - Test rate limiter
    - Test error handling

11. **Add Troubleshooting Guide** - 4-6 hours

    - Reduce support tickets
    - Document common issues
    - Browser-specific fixes

12. **Add Remember Me** - 2-4 hours
    - User convenience
    - Extended session option
    - Clear security implications

---

### 🔵 LOW (Future Enhancements)

13. **Conversion Metrics** - 4-6 hours

    - Product optimization
    - Google Analytics events
    - Funnel analysis

14. **Account Deletion** - 12-16 hours

    - GDPR compliance
    - Self-service deletion
    - 30-day grace period

15. **Email Change Flow** - 8-12 hours

    - Account management
    - Verify new email
    - Notify old email

16. **Load Testing** - 8-12 hours
    - Capacity planning
    - k6 or Artillery
    - Target: 500 concurrent logins

---

## 7. Estimated Timeline

### Minimal Production Readiness (80%)

**Time:** 2-3 weeks  
**Includes:**

- Sentry integration (3 hours)
- Auth logging (8 hours)
- Integration tests (32 hours)
- CSP headers (6 hours)
- CSRF protection (3 hours)
- Security testing (24 hours)
- **Total: ~76 hours**

### Full Production Grade (95%)

**Time:** 6-8 weeks  
**Adds:**

- E2E tests (40 hours)
- Server-side rate limiting (12 hours)
- 2FA support (24 hours)
- Unit tests (24 hours)
- Troubleshooting docs (6 hours)
- Runbook (8 hours)
- **Total: ~190 hours**

### Enterprise Ready (100%)

**Time:** 10-12 weeks  
**Adds:**

- Conversion metrics (6 hours)
- Account deletion (16 hours)
- Email change (12 hours)
- Load testing (12 hours)
- Advanced monitoring (16 hours)
- **Total: ~252 hours**

---

## 8. Current Score Summary

| Category      | Implemented | Missing            | Score   |
| ------------- | ----------- | ------------------ | ------- |
| Security      | 6 items     | 1 item (CSRF, CSP) | 86%     |
| Monitoring    | 0 items     | 4 items            | 0%      |
| Testing       | 1 item      | 4 items            | 20%     |
| UX            | 3 items     | 3 items            | 50%     |
| Documentation | 3 items     | 1 item             | 75%     |
| **Overall**   | **13/21**   | **13/21**          | **62%** |

---

## 9. Risk Assessment

### Critical Risks (Production Blockers)

1. **No Error Monitoring** 🔴

   - **Risk:** Undetected auth failures causing silent user churn
   - **Impact:** High - Revenue loss, reputation damage
   - **Mitigation:** Implement Sentry immediately

2. **No Auth Event Logging** 🔴

   - **Risk:** Security breaches undetectable, compliance violation
   - **Impact:** Critical - Legal liability, cannot investigate incidents
   - **Mitigation:** Implement structured logging to Datadog/CloudWatch

3. **No Integration Tests** 🔴

   - **Risk:** Deployment breaks auth flow, all users locked out
   - **Impact:** Critical - Complete service outage
   - **Mitigation:** Write tests for email signup, Google OAuth, password reset

4. **Client-Side Rate Limiting Only** 🟡
   - **Risk:** Brute force attacks bypass by clearing localStorage
   - **Impact:** High - Account compromise, credential stuffing
   - **Mitigation:** Add server-side rate limiting with Redis

### Medium Risks (Should Fix Soon)

5. **No CSP Headers** 🟡

   - **Risk:** XSS attacks possible via injected scripts
   - **Impact:** Medium - Session hijacking, data theft
   - **Mitigation:** Add CSP to next.config.ts

6. **No CSRF Tokens** 🟡

   - **Risk:** Cross-site request forgery attacks
   - **Impact:** Medium - Unwanted actions on behalf of users
   - **Mitigation:** Add CSRF middleware (partially mitigated by sameSite cookies)

7. **No E2E Tests** 🟡
   - **Risk:** UI regressions break auth in production
   - **Impact:** Medium - User friction, support burden
   - **Mitigation:** Add Playwright tests for critical flows

### Low Risks (Monitor)

8. **No 2FA** 🟢

   - **Risk:** Account takeover if password compromised
   - **Impact:** Low - Affects individual users, not system-wide
   - **Mitigation:** Add TOTP support for high-value accounts

9. **No Account Deletion** 🟢
   - **Risk:** GDPR violations (EU users can request deletion)
   - **Impact:** Low - Legal risk if reported
   - **Mitigation:** Implement self-service deletion with 30-day grace

---

## 10. Conclusion

### Summary

The authentication system has a **solid foundation** with good security practices (httpOnly cookies, rate limiting, input validation) but **critical gaps** in monitoring, testing, and server-side protections.

### Production Readiness: 62% ➡️ Needs 2-3 weeks of work

**Strengths:**

- ✅ Excellent client-side security (httpOnly cookies, rate limiting)
- ✅ Comprehensive documentation
- ✅ Good error handling with screen reader support
- ✅ Social login integration
- ✅ Email validation and password strength enforcement

**Critical Gaps:**

- ❌ Zero production error visibility (no Sentry)
- ❌ No audit logging for security events
- ❌ Insufficient test coverage (20% unit, 0% integration/E2E)
- ❌ Missing CSP headers and CSRF protection
- ❌ Client-side rate limiting easily bypassed

### Recommended Path Forward

**Week 1-2: Production Blockers**

1. Set up Sentry error tracking
2. Implement auth event logging
3. Add CSP and CSRF protection
4. Write integration tests for critical flows

**Week 3-4: Harden Security** 5. Add server-side rate limiting 6. Run security testing (OWASP ZAP) 7. Write E2E tests 8. Set up monitoring alerts

**Week 5-6: Polish** 9. Implement 2FA (if needed) 10. Add Remember Me functionality 11. Write comprehensive troubleshooting guide 12. Load testing and performance tuning

**After these fixes: 95% production-ready** ✅
