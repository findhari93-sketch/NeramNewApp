# Canonical URL Implementation - SEO Duplicate Content Fix

## Problem

Google Search Console reported 30 pages with "Duplicate without user-selected canonical":

- URLs with query parameters (e.g., `?trk=public_post_reshare-text`)
- Old city URLs (e.g., `/pudukkottai-url`, `/salem-url`)
- Legacy HTML files (e.g., `/blog/index.html`, `/contact/index.html`)

## Solution

### 1. **Middleware (`src/middleware.ts`)**

Handles automatic redirects:

- **Query Parameter Removal**: Redirects URLs with query params to clean versions (301 redirect)
  - Example: `https://neramclasses.com/?trk=public_post_reshare-text` → `https://neramclasses.com/`
  - Exceptions: `/pay`, `/auth`, `/api`, `/dashboard` (preserve query params)
- **Old URL Redirects**: Maps legacy URLs to canonical equivalents (301 redirect)
  - `/pudukkottai-url` → `/`
  - `/blog/index.html` → `/blog`
  - `/contact/index.html` → `/contact`
  - See `src/lib/canonical.ts` for full mapping

### 2. **Canonical URL Utilities (`src/lib/canonical.ts`)**

- `getCanonicalUrl(pathname, baseUrl)`: Generates proper canonical URLs
- `shouldRedirect(pathname)`: Maps old URLs to new canonical versions

### 3. **Metadata Helpers (`src/lib/metadataHelpers.ts`)**

- `generateCanonicalMetadata(pathname, additionalMetadata)`: Helper for page-level metadata

### 4. **Robots.txt (`src/app/robots.ts`)**

Updated to disallow old duplicate URLs:

- `/test-page/*`
- `/wp-admin/*`
- `/register/*`
- `/NATA-coaching-centers-nearby/*`
- `/*.html` (all .html files)

### 5. **Root Layout (`src/app/layout.tsx`)**

- Sets `canonical: "/"` for homepage
- Includes inline comments explaining canonical strategy

## Usage

### For Individual Pages

```typescript
import { generateCanonicalMetadata } from "@/lib/metadataHelpers";

export const metadata = generateCanonicalMetadata("/blog/my-post", {
  title: "My Blog Post",
  description: "Description here",
});
```

### For Dynamic Routes

```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pathname = `/blog/${params.slug}`;

  return generateCanonicalMetadata(pathname, {
    title: "Dynamic Page Title",
    description: "Dynamic description",
  });
}
```

## How It Works

1. **User visits**: `https://neramclasses.com/?trk=linkedin`
2. **Middleware intercepts**: Detects query parameter
3. **301 Redirect**: Sends user to `https://neramclasses.com/`
4. **Page loads**: Shows `<link rel="canonical" href="https://neramclasses.com/">`
5. **Google indexes**: Only canonical URL (without query params)

## Old URL Mapping

| Old URL               | Canonical Target | Status       |
| --------------------- | ---------------- | ------------ |
| `/?trk=*`             | `/`              | 301 Redirect |
| `/pudukkottai-url`    | `/`              | 301 Redirect |
| `/tamilnadu-url`      | `/`              | 301 Redirect |
| `/blog/index.html`    | `/blog`          | 301 Redirect |
| `/contact/index.html` | `/contact`       | 301 Redirect |
| `/test-page/*`        | `/`              | 301 Redirect |
| `/wp-admin/*`         | Varies           | 301 Redirect |

See `src/lib/canonical.ts` for complete mapping.

## Testing

### Test Redirects

```bash
# Should redirect to clean URL
curl -I "https://neramclasses.com/?trk=test"
# Expected: HTTP/1.1 301 Moved Permanently
# Location: https://neramclasses.com/

# Old URL redirect
curl -I "https://neramclasses.com/pudukkottai-url"
# Expected: HTTP/1.1 301 Moved Permanently
# Location: https://neramclasses.com/
```

### Verify Canonical Tags

```bash
# Check homepage canonical
curl -s "https://neramclasses.com/" | grep "canonical"
# Expected: <link rel="canonical" href="https://neramclasses.com/"/>
```

## Google Search Console Actions

After deployment:

1. **Request indexing** for clean URLs via GSC
2. **Mark old URLs as redirects** (Google will auto-detect 301s)
3. **Wait 2-4 weeks** for duplicate issues to clear
4. **Monitor Coverage report** for improvements

## Maintenance

When adding new pages:

1. Use `generateCanonicalMetadata()` in page metadata
2. Ensure no query parameters in canonical URLs
3. Add any new duplicate patterns to `src/lib/canonical.ts`
4. Update `robots.ts` if needed

## Notes

- Middleware runs on **every request** (see matcher config)
- 301 redirects are **permanent** and cached by browsers/search engines
- Payment/auth pages **preserve query params** (required for functionality)
- All `.html` files are disallowed in robots.txt
