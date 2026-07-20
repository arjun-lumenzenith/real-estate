# LumenZenith Real Estate Backend API Documentation

## Overview

This document describes the REST API endpoints, authentication, and data models for the LumenZenith real estate platform.

## Base URL

```
http://localhost:3000/api
https://api.lumenzenith.in
```

## Authentication

The API uses Better Auth for session-based authentication. Public endpoints don't require authentication, while protected endpoints require a valid session cookie.

### Session-Based Auth
- Endpoints automatically receive session from `Authorization` header or cookies
- Sessions expire after 7 days of inactivity
- Use `/api/auth/sign-in` and `/api/auth/sign-up` for authentication

## Rate Limiting

All API endpoints are rate-limited to prevent abuse:

| Endpoint Type | Limit | Window |
|---|---|---|
| API General | 1000 requests | 60 seconds |
| Lead Creation | 10 requests | 60 seconds |
| Search | 100 requests | 60 seconds |
| Authentication | 5 attempts | 300 seconds |

Rate limit headers are included in responses:
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Seconds until reset

## Leads API

### Create Lead (Public)

**POST** `/leads`

Creates a new lead from public inquiry form submissions.

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "+919876543210",
  "locality": "Koramangala",
  "budgetRange": "50-75 Lakhs",
  "bhkRequirement": "2 BHK"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "fullName": "John Doe",
    "email": "john@example.com",
    "status": "new",
    "createdAt": "2024-01-01T10:00:00Z"
  },
  "referenceId": "REF-1704110400000-ABC123",
  "message": "Lead created successfully. Please check your email for confirmation."
}
```

**Status Codes:**
- `201`: Lead created successfully
- `400`: Validation error
- `429`: Rate limit exceeded

**Example:**
```bash
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "+919876543210",
    "locality": "Koramangala",
    "budgetRange": "50-75 Lakhs",
    "bhkRequirement": "2 BHK"
  }'
```

### Get Leads (Public)

**GET** `/leads`

Retrieves recent leads. Public endpoint for search/display.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page, max 100 (default: 20)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "fullName": "John Doe",
      "email": "john@example.com",
      "status": "new",
      "createdAt": "2024-01-01T10:00:00Z"
    }
  ]
}
```

## Properties API

### Search Properties (Public)

**GET** `/properties`

Searches available properties with optional filters.

**Query Parameters:**
- `locality` (optional): Filter by locality
- `minBudget` (optional): Minimum price in rupees
- `maxBudget` (optional): Maximum price in rupees
- `bhkType` (optional): Filter by BHK type (1, 2, 3, 4, 4+)
- `builderId` (optional): Filter by builder ID
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page, max 100 (default: 20)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Luxury Apartments",
      "locality": "Koramangala",
      "bhkTypes": "2,3",
      "minPrice": 5000000,
      "maxPrice": 7500000,
      "status": "available",
      "totalUnits": 150,
      "reraNumber": "PRM/KA/RERA/123/2024",
      "createdAt": "2024-01-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  },
  "fromCache": false
}
```

**Example:**
```bash
curl "http://localhost:3000/api/properties?locality=Koramangala&minBudget=5000000&maxBudget=7500000"
```

### Get Property Details

**GET** `/properties/:id`

Retrieves detailed information for a specific property.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Luxury Apartments",
    "locality": "Koramangala",
    "address": "123 Main Street",
    "description": "Premium residential complex",
    "bhkTypes": "2,3",
    "minPrice": 5000000,
    "maxPrice": 7500000,
    "status": "available",
    "totalUnits": 150,
    "soldUnits": 25,
    "reraNumber": "PRM/KA/RERA/123/2024",
    "amenities": "Pool, Gym, Security",
    "builderId": "uuid",
    "createdAt": "2024-01-01T10:00:00Z"
  }
}
```

**Status Codes:**
- `200`: Success
- `404`: Property not found

## Builders API

### Get Builders (Public)

**GET** `/builders`

Retrieves list of Tier-1 builders.

**Query Parameters:**
- `tier` (optional): Filter by tier (tier1, tier2, tier3)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Prestige Group",
      "logo": "https://...",
      "website": "https://prestigegroup.com",
      "tier": "tier1",
      "established": 1995,
      "totalProjects": 45,
      "certified": true,
      "description": "Leading real estate developer",
      "createdAt": "2024-01-01T10:00:00Z"
    }
  ],
  "fromCache": true
}
```

**Example:**
```bash
curl "http://localhost:3000/api/builders?tier=tier1"
```

## Data Models

### Lead
```typescript
{
  id: string (UUID)
  userId: string
  fullName: string
  email: string
  phoneNumber: string (+91 format)
  locality: string | null
  budgetRange: string | null
  bhkRequirement: string | null
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
  referenceId: string (unique)
  notes: string | null
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Property
```typescript
{
  id: string (UUID)
  builderId: string (FK)
  name: string
  locality: string
  address: string | null
  description: string | null
  bhkTypes: string (comma-separated)
  minPrice: decimal | null
  maxPrice: decimal | null
  status: 'available' | 'sold_out' | 'upcoming' | 'archived'
  totalUnits: integer | null
  soldUnits: integer (default: 0)
  reraNumber: string | null
  amenities: string | null
  imageUrl: string | null
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Builder
```typescript
{
  id: string (UUID)
  name: string (unique)
  logo: string | null
  website: string | null
  contact: string | null
  email: string | null
  tier: 'tier1' | 'tier2' | 'tier3'
  established: integer | null
  totalProjects: integer (default: 0)
  certified: boolean (default: false)
  description: string | null
  createdAt: timestamp
  updatedAt: timestamp
}
```

## Error Handling

All errors follow this format:

```json
{
  "error": "Error message",
  "details": "Additional context (optional)",
  "statusCode": 400
}
```

### Common Status Codes

| Code | Meaning |
|---|---|
| `200` | OK |
| `201` | Created |
| `400` | Bad Request (validation error) |
| `401` | Unauthorized |
| `404` | Not Found |
| `429` | Too Many Requests (rate limited) |
| `500` | Internal Server Error |

## Caching

The API uses Redis for caching:

- **Properties**: Cached for 1 hour
- **Builders**: Cached for 24 hours
- **Default**: Cached for 5 minutes

Cache is invalidated when data is updated.

## Performance Tuning

### Database Connection Pooling
- Minimum connections: 2
- Maximum connections: 20
- Connection timeout: 10 seconds
- Idle timeout: 30 seconds
- Query timeout: 10 seconds

### Request Timeouts
- API request timeout: 30 seconds
- Database query timeout: 10 seconds

### Indexes
- Leads: `userId`, `email`, `status`
- Properties: `builderId`, `locality`, `status`
- Builders: `tier`

## Authentication Endpoints

### Sign Up

**POST** `/auth/sign-up`

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "name": "John Doe"
}
```

### Sign In

**POST** `/auth/sign-in`

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

### Sign Out

**POST** `/auth/sign-out`

## Webhooks & Notifications

Leads submission triggers:
1. **Email confirmation** sent to subscriber
2. **Audit log** created for tracking
3. **Cache invalidation** for lead lists

## Support

For API support and issues:
- Email: support@lumenzenith.in
- Documentation: https://docs.lumenzenith.in
