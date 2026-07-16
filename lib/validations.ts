import { z } from 'zod'

// Lead validation
export const createLeadSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phoneNumber: z
    .string()
    .regex(/^\+91[6-9]\d{9}$/, 'Invalid Indian phone number'),
  locality: z.union([z.string(), z.array(z.string())]).optional().nullable(),
  budgetRange: z.string().optional().nullable(),
  bhkRequirement: z.union([z.string(), z.array(z.string())]).optional().nullable(),
})

export const updateLeadSchema = createLeadSchema.partial().extend({
  status: z.enum(['new', 'contacted', 'qualified', 'converted', 'lost']).optional(),
  notes: z.string().optional().nullable(),
})

export type CreateLeadInput = z.infer<typeof createLeadSchema>
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>

// Property validation
export const createPropertySchema = z.object({
  builderId: z.string().min(1, 'Builder ID is required'),
  name: z.string().min(2, 'Property name is required').max(255),
  locality: z.string().min(2, 'Locality is required'),
  address: z.string().optional(),
  description: z.string().optional(),
  bhkTypes: z.string().min(1, 'BHK types are required'),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  status: z.enum(['available', 'sold_out', 'upcoming', 'archived']).optional(),
  totalUnits: z.number().positive().optional(),
  reraNumber: z.string().optional(),
  amenities: z.string().optional(),
  imageUrl: z.string().url().optional(),
})

export const updatePropertySchema = createPropertySchema.partial()
export type CreatePropertyInput = z.infer<typeof createPropertySchema>
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>

// Search validation
export const searchPropertiesSchema = z.object({
  localities: z.array(z.string()).optional().default([]),
  minBudget: z.number().positive().optional(),
  maxBudget: z.number().positive().optional(),
  bhkTypes: z.array(z.string()).optional().default([]),
  builderId: z.number().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
})

export type SearchPropertiesInput = z.infer<typeof searchPropertiesSchema>

// Inquiry validation
export const createInquirySchema = z.object({
  leadId: z.string().min(1, 'Lead ID is required'),
  propertyId: z.string().min(1, 'Property ID is required'),
  type: z.enum(['view', 'inquiry', 'call', 'email', 'site_visit', 'offer']).default('inquiry'),
  message: z.string().optional(),
  notes: z.string().optional(),
})

export type CreateInquiryInput = z.infer<typeof createInquirySchema>
