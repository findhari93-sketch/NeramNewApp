# Quick Migration Guide: Integrating New Auth Architecture

## Overview

This guide shows how to gradually integrate the new modular auth components into the existing `login/page.tsx` without breaking functionality.

---

## Phase 1: Import New Modules (No Breaking Changes)

**Note:** The older `EmailPasswordForm` and `VerificationPrompt` components have been removed in favor of `EnhancedEmailPasswordForm` which includes all production features (rate limiting, accessibility, state machine).

Add these imports to the top of `src/app/auth/login/page.tsx`:

```typescript
// New modular auth components
import { EnhancedEmailPasswordForm } from "@/components/auth/EnhancedEmailPasswordForm";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { useEmailVerification } from "@/hooks/useEmailVerification";
import { authProviderService } from "@/services/authProvider";
```

---

## Phase 2: Replace Verification UI (Low Risk)

### Before:

```typescript
{isVerificationNotice ? (
  // ==================== EMAIL VERIFICATION FLOW ====================
  <Stack spacing={3} sx={{ py: 2 }}>
    <Alert severity="success">...</Alert>

    <Box sx={{ border: '1px solid', ... }}>
      <Stack spacing={2.5}>
        <Box>
          <Typography>Didn't receive the email?</Typography>
          ...
        </Box>
        {resendAttempts >= MAX_RESEND_ATTEMPTS ? (
          <Alert>Maximum resend attempts reached</Alert>
        ) : (
          <Button onClick={handleResendVerification}>
            {cooldownSeconds > 0 ? `Resend in ${cooldownSeconds}s` : 'Resend'}
          </Button>
        )}
      </Stack>
    </Box>

    <Button onClick={() => router.push('/auth/login')}>
      ← Back to Sign In
    </Button>
  </Stack>
) : (
  // ... Normal sign in flow
)}
```

### After:

```typescript
{isVerificationNotice ? (
  <VerificationPrompt
    email={emailParam}
    onBackToSignIn={() => {
      setEmailFromQuery(null);
      setNotice(null);
      router.push('/auth/login');
    }}
  />
) : (
  // ... Normal sign in flow (unchanged for now)
)}
```

### What to Remove:

- `resendLoading` state
- `resendAttempts` state
- `cooldown` state
- `MAX_RESEND_ATTEMPTS` constant
- `handleResendVerification` function
- All cooldown timer useEffect logic

**Test:** Verify email signup still works, resend logic functions correctly.

---

## Phase 3: Replace EmailPasswordAuth Component (Medium Risk)

### Before:

```typescript
const EmailPasswordAuth = () => {
  const [form, setForm] = useState({ ... });
  const [emailPasswordLoading, setEmailPasswordLoading] = useState(false);
  // ...hundreds of lines

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <TextField label="Email or Username" ... />
      <TextField label="Password" ... />
      <Button type="submit">Sign In</Button>
    </Box>
  );
};

// Later in JSX:
<EmailPasswordAuth />
```

### After:

```typescript
// Remove entire EmailPasswordAuth component definition

// Add redirect hook at top of component:
const { redirectAfterLogin } = useAuthRedirect(nextTarget);

// Replace <EmailPasswordAuth /> with:
<EmailPasswordForm
  onSuccess={async (idToken) => {
    await redirectAfterLogin(idToken);
  }}
  onSignupSuccess={(email) => {
    router.replace(
      `/auth/login?notice=verify_email_sent&email=${encodeURIComponent(email)}`
    );
  }}
  onError={(error) => {
    console.error("[LoginPage] Auth error:", error);
  }}
/>;
```

### What to Remove:

- `EmailPasswordAuth` component definition (entire function)
- `emailPasswordLoading` state (now internal to component)
- `emailPasswordError` state (now internal to component)
- `form` state (now internal to component)
- `showPassword` state (now internal to component)
- `checkingEmail` state (now internal to component)
- `emailExists` state (now internal to component)
- `emailProviders` state (now internal to component)
- `stagedNewEmail` state (now internal to component)
- All provider detection useEffect logic
- All form submission logic

**Test:** Verify both signup and signin flows work end-to-end.

---

## Phase 4: Clean Up Unused State (Low Risk)

After integrating both components, remove these unused state variables:

```typescript
// Can be removed:
const [loading, setLoading] = useState(false); // Replaced by component internal state
const [error, setError] = useState<string | null>(null); // Replaced by component internal state
const [resendLoading, setResendLoading] = useState(false);
const [resendResult, setResendResult] = useState<string | null>(null);
const [resendAttempts, setResendAttempts] = useState(0);
const [cooldown, setCooldown] = useState(0);
const MAX_RESEND_ATTEMPTS = 3;
```

**Keep these:**

```typescript
const [authState, setAuthState] = useState({ ... });     // Still needed for main auth flow
const [phoneVerified, setPhoneVerified] = useState(false);
const [showGoogleModal, setShowGoogleModal] = useState(false);
const [googleProfile, setGoogleProfile] = useState<User | null>(null);
// ... etc (profile completion modal related state)
```

---

## Phase 5: Optimize with Provider Service (Optional Enhancement)

Replace manual provider checks with `authProviderService`:

### Before:

```typescript
try {
  const methods = await fetchSignInMethodsForEmail(auth, identifier);
  if (methods.length === 0) {
    // Fallback to backend
    const res = await fetch(`/api/auth/check-email?email=${...}`);
    // ...
  }
} catch (err) {
  // ...
}
```

### After:

```typescript
const providers = await authProviderService.getProviders(identifier);
const hasGoogle = providers.includes("google.com");

if (hasGoogle) {
  setError(AUTH_ERROR_MESSAGES.GOOGLE_ALREADY_LINKED);
}
```

**Benefits:** Automatic caching, consistent fallback logic, cleaner code.

---

## Testing Checklist

After each phase, test these flows:

### Phase 1 (Imports Only)

- [ ] Page loads without errors
- [ ] No TypeScript compilation errors
- [ ] All existing functionality unchanged

### Phase 2 (Verification UI)

- [ ] Sign up new user triggers verification email
- [ ] Verification screen shows email address correctly
- [ ] Resend button works with proper cooldown
- [ ] Attempts counter decrements correctly
- [ ] Max attempts warning appears
- [ ] Back button returns to sign-in screen
- [ ] Notice query params work correctly

### Phase 3 (EmailPasswordForm)

- [ ] Email input triggers provider detection
- [ ] "Checking account..." appears during lookup
- [ ] New email shows "Sign Up" button
- [ ] Existing email shows "Sign In" button
- [ ] Password confirmation only for new accounts
- [ ] "Forgot password" only for existing users
- [ ] Google-linked email shows helpful error
- [ ] Sign up creates account and sends verification
- [ ] Sign in authenticates and redirects correctly
- [ ] Profile completeness routing works (<70% → /profile, ≥70% → home)

### Phase 4 (Cleanup)

- [ ] No console warnings about unused variables
- [ ] Linter passes with no auth-related issues
- [ ] Bundle size reduced (check with `npm run build`)

### Phase 5 (Provider Service)

- [ ] Provider lookups cached (check network tab - should see fewer requests)
- [ ] Cache stats available in console: `authProviderService.getCacheStats()`
- [ ] Clear cache works: `authProviderService.clearCache('email@example.com')`

---

## Rollback Plan

If issues arise, you can rollback incrementally:

### Rollback Phase 2 (Verification UI)

1. Comment out `<VerificationPrompt />` component
2. Uncomment original verification JSX
3. Re-add removed state variables and functions

### Rollback Phase 3 (EmailPasswordForm)

1. Comment out `<EmailPasswordForm />` component
2. Uncomment `EmailPasswordAuth` component definition
3. Re-add removed state variables

### Full Rollback

```bash
git diff src/app/auth/login/page.tsx
git checkout src/app/auth/login/page.tsx
```

---

## Expected Outcome

### Before Migration

- **Lines of Code:** ~1800 in single file
- **State Variables:** 30+ in main component
- **Nested Components:** 1 massive inline component
- **Reusability:** None (tightly coupled)

### After Migration

- **Lines of Code:** ~600 in main file (orchestration only)
- **State Variables:** ~12 in main component (modal/profile related)
- **Modular Components:** 2 reusable components + 2 hooks + 2 services
- **Reusability:** Can use in other pages (e.g., modal login, profile page)

### Code Reduction

- **Main Component:** 1200 lines removed (67% reduction)
- **Responsibility:** Single clear purpose (orchestrate auth flows)
- **Maintainability:** Changes localized to specific modules

---

## Common Issues & Solutions

### Issue: "Cannot find module '@/components/auth/VerificationPrompt'"

**Solution:** Ensure `tsconfig.json` has path alias:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Issue: Verification state not persisting across redirects

**Solution:** Pass `initialState` to `VerificationPrompt` from URL params:

```typescript
const initialState: VerificationState = {
  type: 'pending',
  email: emailParam,
  sentAt: Date.now(),
};

<VerificationPrompt email={emailParam} initialState={initialState} ... />
```

### Issue: Provider cache showing stale data

**Solution:** Clear cache on critical actions:

```typescript
authProviderService.clearCache(email); // Before signup
authProviderService.clearCache(); // On logout
```

### Issue: Error messages not showing

**Solution:** Ensure error callback connected:

```typescript
<EmailPasswordForm
  onError={(error) => {
    setError(error); // Update parent state
    setSnackOpen(true); // Show snackbar
  }}
/>
```

---

## Next Steps

1. **Review** this guide thoroughly
2. **Backup** current `login/page.tsx` (copy to `login/page.tsx.backup`)
3. **Start with Phase 1** (imports only, verify no breaks)
4. **Progress through phases** one at a time
5. **Test thoroughly** after each phase
6. **Monitor production** after deployment
7. **Gather feedback** from users
8. **Iterate** based on real-world usage

---

## Support

If you encounter issues during migration:

1. Check `AUTH_ARCHITECTURE_IMPROVEMENTS.md` for detailed component documentation
2. Review individual component files for inline documentation
3. Check console for detailed error logs (all errors prefixed with component name)
4. Use `authProviderService.getCacheStats()` to debug provider detection
5. Enable verbose logging: `localStorage.setItem('DEBUG_AUTH', 'true')`

Good luck with the migration! 🚀
