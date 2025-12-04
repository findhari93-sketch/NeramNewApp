# Admin Panel Implementation Prompt for admin.neramclasses.com

**Project:** admin.neramclasses.com (Separate admin project)
**Purpose:** Complete exam center management system
**Database:** Shared Supabase (same as neramclasses.com)
**Status:** Ready for implementation

---

## 📋 Implementation Overview

This prompt provides complete specifications for building the admin panel for exam center management. You have a **separate project folder** for admin.neramclasses.com, so implement these independently.

---

## 🔄 Before You Start

### ✅ Prerequisites

1. Copy these shared data files to your admin project:

   ```bash
   # From neramclasses.com project
   cp ../neram-nextjs-app/src/data/indian-states-cities.ts ./src/data/
   cp ../neram-nextjs-app/src/types/exam-center.ts ./src/types/
   ```

2. Ensure Supabase migration is already run in shared database:

   - Migration: `supabase_migrations/009_create_exam_centers_table.sql`
   - Should already exist from public site implementation

3. Dependencies needed:
   ```bash
   npm install lucide-react lucide-react-icons
   npm install lodash.debounce
   ```

---

## 📂 Directory Structure

```
admin.neramclasses.com/
├── src/
│   ├── data/
│   │   ├── indian-states-cities.ts      # COPY from public site
│   │   └── types/exam-center.ts         # COPY from public site
│   ├── lib/
│   │   ├── supabase/client.ts           # Supabase client (reuse)
│   │   ├── utils/
│   │   │   ├── csv-parser.ts            # CSV parsing utility
│   │   │   ├── csv-validator.ts         # CSV validation
│   │   │   └── csv-download.ts          # CSV export utility
│   │   └── api-helpers/
│   │       └── exam-centers.ts          # Shared API helpers
│   ├── components/
│   │   └── exam-centers/
│   │       ├── exam-centers-list.tsx    # List page with filters
│   │       ├── exam-center-form.tsx     # Add/Edit form
│   │       ├── csv-import-modal.tsx     # CSV import modal
│   │       ├── year-quick-add.tsx       # Quick year addition
│   │       ├── filters-sidebar.tsx      # Filter panel
│   │       └── stats-dashboard.tsx      # Statistics dashboard
│   ├── app/
│   │   ├── exam-centers/
│   │   │   ├── page.tsx                 # List page wrapper
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx             # Detail page
│   │   │   │   └── edit/
│   │   │   │       └── page.tsx         # Edit page wrapper
│   │   │   └── add/
│   │   │       └── page.tsx             # Add page wrapper
│   │   └── api/
│   │       └── exam-centers/
│   │           ├── route.ts             # GET/POST exam centers
│   │           └── [id]/
│   │               └── route.ts         # GET/PUT/DELETE single center
│   └── hooks/
│       └── useExamCenterForm.ts         # Form state management hook
```

---

## 🛠️ Implementation Tasks

### TASK 1: CSV Utilities (Server-side helpers)

#### File: `src/lib/utils/csv-parser.ts`

```typescript
// Parse CSV file to JSON array
// Handle different delimiters (comma, semicolon)
// Return parsed rows with proper types
// Handle errors gracefully
```

**Requirements:**

- Parse CSV with proper encoding (UTF-8)
- Handle quoted fields with commas
- Support both comma and semicolon delimiters
- Return array of ExamCenterCSVRow objects
- Handle multiline fields
- Track row numbers for error reporting
- Type-safe output using ExamCenterCSVRow interface

---

#### File: `src/lib/utils/csv-validator.ts`

```typescript
// Validate CSV rows before import
// Check required fields (exam_type, state, city, center_name, address)
// Validate field formats
// Validate against Indian states list
// Return validation results with row-by-row errors
```

**Requirements:**

- Validate required fields presence
- Validate exam_type (must be NATA or JEE Paper 2)
- Validate state (must match INDIAN_STATES)
- Validate city (must match CITIES_BY_STATE for state)
- Validate pincode format (10 digits if provided)
- Validate phone format (10-12 digits)
- Validate email format (valid email if provided)
- Validate latitude/longitude range
- Validate active_years (must be valid years, 4 digits)
- Validate is_confirmed_current_year (must be true/false)
- Validate status (must be active/inactive/discontinued)
- Return array of validation errors with row numbers
- Allow partial validation (skip optional fields if empty)

---

#### File: `src/lib/utils/csv-download.ts`

```typescript
// Generate CSV template for download
// Generate CSV export of existing centers
// Download functionality
```

**Requirements:**

- Generate empty CSV template with all columns
- Pre-fill exam_type dropdown help in comments
- Include example rows for reference
- Generate CSV from array of ExamCenter objects
- Format arrays properly (semicolon-separated for active_years)
- Format booleans as "true"/"false" strings
- Include proper CSV header row
- Use proper escaping for special characters
- Add download filename with date

---

### TASK 2: API Routes (Backend endpoints)

#### File: `src/app/api/exam-centers/route.ts`

```typescript
// GET - List all exam centers with filtering
// POST - Create new exam center (admin only)
```

**GET Parameters:**

- `exam_type` (optional): Filter by NATA or JEE Paper 2
- `state` (optional): Filter by state
- `city` (optional): Filter by city
- `status` (optional): Filter by status
- `search` (optional): Search center_name or address
- `page` (optional): Pagination (default: 1)
- `limit` (optional): Results per page (default: 20, max: 100)
- `sort_by` (optional): Sort field (center_name, created_at, updated_at)
- `sort_order` (optional): asc or desc (default: asc)
- `confirmed_only` (optional): Only confirmed for current year

**GET Response:**

```json
{
  "data": [ExamCenter[], ...],
  "total": number,
  "page": number,
  "limit": number,
  "error": null
}
```

**POST Body:**

```json
{
  "exam_type": "NATA",
  "state": "Tamil Nadu",
  "city": "Chennai",
  "center_name": "Center Name",
  "address": "Full Address",
  ... (other ExamCenterInput fields)
}
```

**POST Requirements:**

- Validate input against ExamCenterInput schema
- Check admin authentication
- Set created_by to current user ID
- Set created_at to current timestamp
- Return created ExamCenter object with ID

---

#### File: `src/app/api/exam-centers/[id]/route.ts`

```typescript
// GET - Get single exam center
// PUT - Update exam center (admin only)
// DELETE - Delete exam center (admin only)
```

**GET Requirements:**

- Return single ExamCenter by ID
- Include all details

**PUT Requirements:**

- Validate input (partial update allowed)
- Check admin authentication
- Set updated_by to current user ID
- Auto-update updated_at timestamp
- Return updated ExamCenter object

**DELETE Requirements:**

- Check admin authentication
- Soft delete or hard delete (specify approach)
- Return success message

---

#### File: `src/app/api/exam-centers/bulk-import/route.ts` (Optional but recommended)

```typescript
// POST - Import CSV file with validation
// Returns validation results and import status
```

**POST Body:** FormData with file field

**Response:**

```json
{
  "success": boolean,
  "imported": number,
  "failed": number,
  "errors": [
    { "row": 2, "error": "Invalid state name", "data": {...} },
    ...
  ],
  "warnings": [...]
}
```

---

#### File: `src/app/api/exam-centers/stats/route.ts`

```typescript
// GET - Get statistics for dashboard
```

**Response:**

```json
{
  "totalCenters": number,
  "confirmedCurrentYear": number,
  "byExamType": {
    "NATA": number,
    "JEE Paper 2": number
  },
  "byStatus": {
    "active": number,
    "inactive": number,
    "discontinued": number
  },
  "topStates": [
    { "state": "Tamil Nadu", "count": 10 },
    ...
  ]
}
```

---

#### File: `src/app/api/exam-centers/export/route.ts`

```typescript
// GET - Export exam centers to CSV
// Support filters (exam_type, state, status)
// Download as attachment
```

**Query Parameters:**

- Same as list endpoint

**Response:**

- CSV file with proper Content-Disposition header
- Filename format: `exam-centers-YYYY-MM-DD.csv`

---

### TASK 3: Components

#### File: `src/components/exam-centers/exam-centers-list.tsx`

```typescript
// Main admin list page component
// Display centers in table or card grid
// Support filtering, searching, sorting
// Pagination
// Bulk actions (delete, export, change status)
// Quick links to add/edit/detail pages
```

**Features Required:**

- **Table View** with columns:

  - Center Name
  - Exam Type
  - State/City
  - Status (with color badges)
  - Confirmed Year Indicator
  - Years Active
  - Actions (Edit, Delete, View)

- **Filtering Sidebar:**

  - Exam Type (checkbox)
  - State (select dropdown)
  - Status (checkbox)
  - Search box (debounced)

- **Sorting:**

  - By center name
  - By created date
  - By updated date
  - By exam type
  - Ascending/Descending toggle

- **Pagination:**

  - Page navigation
  - Results per page selector (20, 50, 100)
  - Total results count
  - Current page indicator

- **Bulk Actions:**

  - Select multiple centers (checkbox)
  - Delete selected button
  - Change status for selected
  - Export selected to CSV

- **Quick Actions:**

  - Add New Center button (top right)
  - Edit button (row action)
  - Delete button with confirmation
  - View details button

- **Statistics:**

  - Total centers
  - Confirmed for current year
  - By exam type breakdown
  - By status breakdown

- **Import/Export:**

  - Import CSV button (opens modal)
  - Download template button
  - Export all button
  - Export filtered results

- **Responsive:**
  - Table on desktop
  - Card grid on mobile
  - Collapsible filters on mobile

---

#### File: `src/components/exam-centers/exam-center-form.tsx`

```typescript
// Add/Edit form component
// Support both create and edit modes
// Form validation
// Loading/success/error states
// Auto-save drafts (optional)
```

**Form Fields (organized in sections):**

**Basic Info:**

- Exam Type (select, required)
- Center Name (text, required)
- Center Code (text, optional)
- Description (textarea, optional)

**Location:**

- State (select, required)
- City (select, required, depends on state)
- Address (textarea, required)
- Pincode (text, optional, format: 6 digits)
- Google Maps Link (URL, optional)
- Latitude (number, optional, range: -90 to 90)
- Longitude (number, optional, range: -180 to 180)

**Contact Information:**

- Contact Person (text, optional)
- Contact Designation (text, optional)
- Phone Number (text, optional, format: 10-12 digits)
- Alternate Phone (text, optional)
- Email (email, optional)

**Transportation:**

- Nearest Railway Station (text, optional)
- Nearest Bus Stand (text, optional)
- Landmarks (textarea, optional)

**Facilities & Instructions:**

- Facilities (textarea, optional)
- Instructions (textarea, optional)
- Seating Capacity (number, optional)

**Year & Status:**

- Active Years (multi-select, required)
- Confirmed for Current Year (checkbox)
- Status (select: active/inactive/discontinued, required)

**Form Features:**

- Field validation with error messages
- Required field indicators
- Help text for complex fields
- Auto-populate city selector based on state
- Disabled city selector until state selected
- Loading spinner during submit
- Success message after submit
- Error handling with specific error messages
- Unsaved changes warning on page leave
- Draft auto-save (optional, localStorage)
- Cancel button to discard changes
- Edit mode: pre-fill form from database
- Create mode: empty form with defaults

---

#### File: `src/components/exam-centers/csv-import-modal.tsx`

```typescript
// Modal for CSV file import
// File upload with drag-drop
// Preview CSV before import
// Validation feedback
// Import confirmation
```

**Modal Features:**

- Title: "Import Exam Centers from CSV"
- File upload input with drag-drop area
- Show file name when selected
- Preview first 5 rows of CSV
- Show column mapping (actual vs expected)
- Validation errors highlighted:
  - Red for failed rows
  - Yellow for warnings
  - Green for valid rows
- Error summary:
  - Total rows
  - Valid rows
  - Invalid rows
  - Specific errors per row
- Option to:
  - Fix errors and re-upload
  - Proceed with valid rows only (skip invalid)
  - Cancel import
- Import button (disabled until valid)
- Progress bar during import
- Success summary after import:
  - X centers imported
  - Y failed
  - Z warnings
- Option to:
  - Download error report
  - View imported centers
  - Import more files
  - Close modal

---

#### File: `src/components/exam-centers/year-quick-add.tsx`

```typescript
// Quick add/remove years for a center
// Display current years
// Checkbox for each year (previous 3 + next 2 years)
// Confirm for current year checkbox
```

**Features:**

- Show selected years as badges
- Checkboxes for years range (e.g., 2022-2026)
- Confirm checkbox "Confirmed for {currentYear}"
- Save button
- Cancel button
- Loading state during save

---

#### File: `src/components/exam-centers/filters-sidebar.tsx`

```typescript
// Reusable filters component
// Exam type, state, status filters
// Search input
// Apply/Clear buttons
```

**Features:**

- Collapsible on mobile
- Clear filters button
- Apply filters button
- Show active filter count
- Filters for: exam_type, state, status, search

---

#### File: `src/components/exam-centers/stats-dashboard.tsx`

```typescript
// Dashboard with key statistics
// Cards for: total, confirmed, by exam type, by status
// Top states list
```

**Features:**

- Total centers card
- Confirmed current year card
- NATA count card
- JEE Paper 2 count card
- Active/Inactive/Discontinued count cards
- Top 5 states by center count
- Percentages and trends (optional)

---

### TASK 4: Pages (Wrapper components)

#### File: `src/app/exam-centers/page.tsx`

```typescript
export const metadata = {
  title: "Exam Centers Management | Admin",
  description: "Manage NATA and JEE Paper 2 exam centers",
};

export default function ExamCentersPage() {
  return <ExamCentersListPage />;
}
```

---

#### File: `src/app/exam-centers/add/page.tsx`

```typescript
export const metadata = {
  title: "Add Exam Center | Admin",
};

export default function AddExamCenterPage() {
  return <ExamCenterForm mode="create" />;
}
```

---

#### File: `src/app/exam-centers/[id]/edit/page.tsx`

```typescript
export const metadata = {
  title: "Edit Exam Center | Admin",
};

export default function EditExamCenterPage({
  params,
}: {
  params: { id: string };
}) {
  return <ExamCenterForm mode="edit" centerId={params.id} />;
}
```

---

#### File: `src/app/exam-centers/[id]/page.tsx` (Optional: Detail page)

```typescript
// Show detailed view of a single center
// Read-only or with edit button
// Show full information
// Edit and delete buttons
```

---

### TASK 5: Hooks & State Management

#### File: `src/hooks/useExamCenterForm.ts`

```typescript
// Form state management hook
// Handle form values, validation, submission
// Support both create and edit modes
// Handle field changes and errors
```

**Hook should provide:**

- Form state (values, errors, touched, loading)
- Handlers: handleChange, handleBlur, handleSubmit
- Validation function
- Reset form function
- Populate form from existing data (edit mode)
- Success/error callbacks

---

#### File: `src/hooks/useExamCenters.ts`

```typescript
// Data fetching hook for exam centers
// Support pagination, filtering, sorting
// Handle loading and error states
// Provide CRUD operations
```

**Hook should provide:**

- Centers list with pagination
- Loading/error states
- Filters state
- Fetch function with filters
- Add/edit/delete functions
- Refetch trigger

---

### TASK 6: Type Safety & Config

#### File: `src/config/exam-centers.config.ts`

```typescript
// Configuration constants for exam centers
// Pagination defaults
// Filter defaults
// Form defaults
```

**Should include:**

```ts
export const EXAM_CENTERS_CONFIG = {
  PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  YEAR_RANGE: [2020, 2030],
  CURRENT_YEAR: new Date().getFullYear(),
  STATUS_OPTIONS: ['active', 'inactive', 'discontinued'],
  REQUIRED_CSV_COLUMNS: [...],
  CSV_COLUMN_MAPPING: {...}
};
```

---

## 🔐 Security & Permissions

### Authentication

- All routes require admin authentication
- Use Firebase Auth or your existing auth
- Check admin role on backend
- Implement auth middleware

### Authorization

- Only authenticated admins can:
  - View exam center list
  - Create exam centers
  - Edit exam centers
  - Delete exam centers
  - Import CSV
  - Export data
- Public site can only read non-discontinued centers

### Data Privacy

- No PII exposed in API responses (except admin)
- Audit trail: track created_by and updated_by
- Soft delete recommended (don't hard delete data)

---

## 🧪 Testing Checklist

### Component Testing

- [ ] Form validates required fields
- [ ] CSV upload works with valid file
- [ ] CSV validation catches errors
- [ ] List filters work correctly
- [ ] Pagination works
- [ ] Sort works
- [ ] Bulk delete works with confirmation
- [ ] Edit form pre-fills data
- [ ] Create form submits new center
- [ ] Year quick-add saves correctly
- [ ] Mobile responsive design
- [ ] Loading states show
- [ ] Error messages display
- [ ] Success messages display

### API Testing

- [ ] GET /api/exam-centers returns list
- [ ] GET /api/exam-centers?state=X filters correctly
- [ ] GET /api/exam-centers?search=X searches
- [ ] GET /api/exam-centers/[id] returns single
- [ ] POST /api/exam-centers creates new
- [ ] PUT /api/exam-centers/[id] updates
- [ ] DELETE /api/exam-centers/[id] deletes
- [ ] Unauthorized requests are rejected
- [ ] Validation errors return 400
- [ ] Not found returns 404

### Database Testing

- [ ] Data persists to Supabase
- [ ] RLS policies work correctly
- [ ] Indexes work for filtering
- [ ] Timestamps auto-update
- [ ] Concurrent edits handled
- [ ] Cascading deletes work (if applicable)

### Integration Testing

- [ ] Public site can read centers
- [ ] Admin can create and public sees it
- [ ] CSV import creates centers
- [ ] Deleted centers don't show on public
- [ ] Updated centers sync to public

---

## 📊 Database Considerations

### RLS Policies

The migration already includes policies:

- Public: SELECT non-discontinued only
- Authenticated: SELECT all
- Admin: INSERT, UPDATE, DELETE

**If using admin role check:**

```sql
-- Check in your user_roles table
SELECT 1 FROM user_roles
WHERE user_id = auth.uid() AND role = 'admin'
```

### Indexes

Migration creates:

- exam_type, state, city, status (individual)
- exam_type + state + city (combined)
- center_name, address (full-text)
- is_confirmed_current_year

This supports:

- Filter by exam_type
- Filter by state
- Filter by city
- Search by name/address
- Show confirmed centers

### Performance Tips

- Use pagination to limit results
- Filter early in query
- Use indexed columns
- Avoid expensive calculations in queries

---

## 🎨 UI Design System

### Colors

- Primary: Blue (#3B82F6)
- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Danger: Red (#EF4444)
- Info: Indigo (#4F46E5)

### Status Badge Colors

- Active: Green
- Inactive: Yellow
- Discontinued: Gray/Red

### Typography

- Headings: Bold, 24px/18px/16px
- Body: Regular, 14px
- Labels: Medium, 12px
- Links: Underline on hover

---

## 📋 Deliverables Checklist

When implementing, ensure:

- [ ] All API routes working
- [ ] All components rendering
- [ ] Form validation working
- [ ] CSV import working
- [ ] CSV export working
- [ ] Filtering working
- [ ] Pagination working
- [ ] Authentication checks
- [ ] Error handling
- [ ] Loading states
- [ ] Success messages
- [ ] Type safety (no `any`)
- [ ] TypeScript errors: 0
- [ ] Responsive design verified
- [ ] Accessibility verified

---

## 🚀 Implementation Order

1. **Start with API routes** (backend foundation)
2. **Create utilities** (CSV, validation)
3. **Build components** (form, list, filters)
4. **Create pages** (wrappers)
5. **Add hooks** (state management)
6. **Test everything** (validation, API, UI)
7. **Polish UI** (responsive, styling, feedback)
8. **Deploy** (test on staging)

---

## 📞 Notes

- This is a **separate project** from neramclasses.com
- Share the data files (indian-states-cities.ts, exam-center.ts types)
- Share the Supabase database (already migrated)
- Keep admin logic separate from public logic
- Test thoroughly before deployment
- Monitor Supabase logs for errors

---

**Total Implementation Scope:**

- ~8 API routes
- ~6 components
- ~3 pages
- ~2 hooks
- ~3 utilities
- Full CRUD operations
- CSV import/export
- Admin dashboard with statistics

**Estimated Effort:** 3-4 days for experienced developer
**Lines of Code:** ~3,000-4,000 (including tests)

---

**This prompt is ready for implementation in your admin.neramclasses.com project folder.**
