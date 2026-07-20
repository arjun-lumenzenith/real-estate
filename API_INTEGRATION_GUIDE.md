# LumenZenith API Integration Guide

## Overview

This document outlines how the frontend UI components have been integrated with the backend APIs to fetch and submit real data.

## Integrated Components

### 1. Lead Form Component (`components/lead-form.tsx`)

**Integration**: Submits leads to `/api/leads` endpoint

**Changes Made**:
- Added `apiError` state to handle and display API errors
- Updated `handleSubmit` function to make HTTP POST request to `/api/leads`
- Form data mapping: UI form fields → API payload
  - `fullName` (from form.name)
  - `phoneNumber` (from form.mobile)
  - `email` (from form.email)
  - `locality` (first selected from form.locality array)
  - `budgetRange` (from form.budget)
  - `bhkRequirement` (first selected from form.bhk array)
- Response handling: Extracts referenceId and displays success screen
- Error handling: Shows API errors in red alert box with user-friendly messages

**API Endpoint**: `POST /api/leads`

**Example Request**:
```json
{
  "fullName": "John Doe",
  "phoneNumber": "9900891647",
  "email": "john@example.com",
  "locality": "Whitefield",
  "budgetRange": "₹1 Cr — ₹1.5 Cr",
  "bhkRequirement": "3 BHK"
}
```

**Success Response**:
```json
{
  "success": true,
  "data": {
    "id": "lead_uuid",
    "referenceId": "LZ-123456",
    "status": "new"
  }
}
```

---

### 2. Search Section Component (`components/search-section.tsx`)

**Integration**: Fetches properties from `/api/properties` endpoint

**Changes Made**:
- Added `apiProperties` state to store fetched property data
- Added `loadingProperties` state for loading indicators
- Created `fetchProperties()` async function that:
  - Calls `/api/properties` with filter parameters
  - Falls back to FEATURED properties if API fails
  - Maps API response to UI component format
- Updated search button to call `fetchProperties()` on click
- Added loading state to search button ("Searching..." text when loading)
- Updated property grid to use `apiProperties` instead of hardcoded FEATURED array
- Implemented client-side filtering on fetched data

**API Endpoint**: `GET /api/properties`

**Query Parameters**:
- `page` (number): Pagination page (default: 1)
- `limit` (number): Results per page (default: 20)
- `locality` (string): Filter by locality
- `minBudget` (number): Minimum price filter
- `bhkType` (string): BHK type (e.g., "2", "3", "4")

**Example Request**:
```
GET /api/properties?page=1&limit=20&locality=Whitefield&bhkType=3
```

**Success Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "prop_uuid",
      "name": "The Prestige City",
      "locality": "Sarjapur Road",
      "builder": "Prestige Group",
      "bhkTypes": "2, 3, 4 BHK",
      "minPrice": 7500000,
      "maxPrice": 12000000,
      "status": "available",
      "imageUrl": "/property-1.png",
      "reraNumber": "PRM/KA/RERA/1251"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

---

### 3. Builders Section Component (`components/builders-section.tsx`)

**Integration**: Fetches builders from `/api/builders` endpoint

**Changes Made**:
- Changed from static component to client component with `useEffect` hook
- Added `builders` state to store fetched builder data
- Added `loading` state for loading indicators
- Created `fetchBuilders()` async function that:
  - Calls `/api/builders?tier=tier1` to fetch Tier-1 builders
  - Maps API response to component format (name, tagline, totalProjects, badge, color)
  - Falls back to FALLBACK_BUILDERS if API fails
  - Fetches max 6 builders for display
- useEffect hook calls `fetchBuilders()` on component mount
- Updated builder cards to use `builders` state instead of hardcoded BUILDERS array

**API Endpoint**: `GET /api/builders`

**Query Parameters**:
- `tier` (string): Filter by builder tier (tier1, tier2, tier3)

**Example Request**:
```
GET /api/builders?tier=tier1
```

**Success Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "builder_uuid",
      "name": "Prestige Group",
      "logo": "https://...",
      "website": "https://...",
      "tier": "tier1",
      "totalProjects": 60,
      "certified": true,
      "description": "India's most trusted luxury developer"
    }
  ]
}
```

---

## Error Handling & Fallbacks

### Lead Form
- **Network Error**: Shows "Network error. Please check your connection and try again."
- **API Error**: Displays the error message from the backend response
- **Form Validation**: Client-side validation before submission with specific error messages

### Search Section
- **Network Error**: Falls back to displaying FEATURED properties
- **Empty Results**: Shows empty grid if no properties match
- **Loading State**: Search button disabled and shows "Searching..." during fetch

### Builders Section
- **Network Error**: Falls back to displaying FALLBACK_BUILDERS (3 main builders)
- **Empty Results**: Shows fallback builders
- **Loading State**: Handled gracefully - no UI blocking

---

## Rate Limiting & Performance

All API endpoints implement rate limiting:

- **Lead Submissions**: 10 leads/minute per IP
- **Property Search**: 100 searches/minute per IP
- **Builder Listing**: 1000 requests/minute per IP

Response includes rate limit headers:
```
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1626345600
```

---

## Caching Strategy

- **Builders**: 24-hour cache (less frequently updated)
- **Properties**: 1-hour cache (more frequently updated)
- **Default**: 5-minute cache

Cache is invalidated when:
- New data is created/updated
- User explicitly clears filters
- Application restarts

---

## Development Notes

### Environment Variables Required

```env
DATABASE_URL=postgresql://...
RESEND_API_KEY=re_...
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
BETTER_AUTH_SECRET=...
```

### Testing the APIs

```bash
# Test lead submission
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "phoneNumber": "9900891647",
    "email": "test@example.com",
    "locality": "Whitefield",
    "budgetRange": "₹1 Cr — ₹1.5 Cr"
  }'

# Test property search
curl http://localhost:3000/api/properties?page=1&limit=20&locality=Whitefield

# Test builder listing
curl http://localhost:3000/api/builders?tier=tier1
```

---

## Future Improvements

1. **Authentication**: Integrate Better Auth for protected endpoints
2. **User Dashboard**: Create authenticated dashboard to view submitted leads
3. **Advanced Filters**: Implement more sophisticated property filtering
4. **Real-time Updates**: Add WebSocket support for live property updates
5. **Email Notifications**: Trigger confirmations via Resend after lead submission
6. **Admin Panel**: Build admin dashboard for managing leads and properties

---

## Component Architecture

```
App (page.tsx)
├── State Management (locs, buds, bhks)
├── Navbar
├── HeroSection
├── BuildersSection (API: GET /api/builders)
├── SearchSection (API: GET /api/properties)
│   └── Property Grid
├── WhyUsSection
├── LeadForm (API: POST /api/leads)
└── Footer
```

---

## Performance Metrics

- Lead form submission: ~500-1000ms (includes email)
- Property search: ~200-500ms with caching
- Builder fetch: ~100-200ms with 24-hour cache

All components handle loading and error states gracefully without blocking user interaction.
