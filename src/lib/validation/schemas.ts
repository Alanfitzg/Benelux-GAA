import { z } from 'zod'

// Common validation patterns
export const emailSchema = z.string().email('Please enter a valid email address')
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be no more than 30 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number')
  .optional()

export const urlSchema = z
  .string()
  .url('Please enter a valid URL')
  .optional()
  .or(z.literal(''))

export const coordinateSchema = z
  .number()
  .min(-180, 'Invalid coordinate')
  .max(180, 'Invalid coordinate')
  .optional()

// Enum schemas
export const UserRoleSchema = z.enum(['SUPER_ADMIN', 'CLUB_ADMIN', 'GUEST_ADMIN', 'USER'])
export const AccountStatusSchema = z.enum(['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'])

// Team types validation
export const TeamTypeSchema = z.enum([
  'Senior Mens Gaelic Football',
  'Senior Ladies Gaelic Football', 
  'Senior Mens Hurling',
  'Senior Ladies Hurling (Camogie)',
  'Junior Mens Gaelic Football',
  'Junior Ladies Gaelic Football',
  'Junior Mens Hurling',
  'Junior Ladies Hurling (Camogie)',
  'Youth/Underage',
  'Mixed/Social',
  'Other'
])

// Event schemas
const EventBaseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be no more than 200 characters'),
  eventType: z.string().min(1, 'Event type is required'),
  location: z.string().min(1, 'Location is required').max(500, 'Location must be no more than 500 characters'),
  latitude: coordinateSchema,
  longitude: coordinateSchema,
  startDate: z.string().datetime('Invalid start date'),
  endDate: z.string().datetime('Invalid end date').optional().nullable(),
  cost: z.number().min(0, 'Cost cannot be negative').optional().nullable(),
  description: z.string().max(2000, 'Description must be no more than 2000 characters').optional().nullable(),
  isRecurring: z.boolean().default(false),
  imageUrl: urlSchema.nullable(),
})

export const EventCreateSchema = EventBaseSchema.refine((data) => {
  if (data.endDate && data.startDate) {
    return new Date(data.endDate) > new Date(data.startDate)
  }
  return true
}, {
  message: 'End date must be after start date',
  path: ['endDate']
})

export const EventUpdateSchema = EventBaseSchema.partial().merge(z.object({
  id: z.string().cuid('Invalid event ID'),
})).refine((data) => {
  if (data.endDate && data.startDate) {
    return new Date(data.endDate) > new Date(data.startDate)
  }
  return true
}, {
  message: 'End date must be after start date',
  path: ['endDate']
})

export const EventQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  eventType: z.string().optional(),
  location: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  search: z.string().max(100).optional(),
})

// Interest (event interest) schemas
export const InterestCreateSchema = z.object({
  eventId: z.string().cuid('Invalid event ID'),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be no more than 100 characters'),
  email: emailSchema,
  message: z.string().max(1000, 'Message must be no more than 1000 characters').optional().nullable(),
})

// Club schemas
export const ClubCreateSchema = z.object({
  name: z.string().min(1, 'Club name is required').max(200, 'Club name must be no more than 200 characters'),
  region: z.string().max(100).optional().nullable(),
  subRegion: z.string().max(100).optional().nullable(),
  map: z.string().max(500).optional().nullable(),
  facebook: urlSchema.nullable(),
  instagram: urlSchema.nullable(),
  website: urlSchema.nullable(),
  codes: z.string().max(100).optional().nullable(),
  imageUrl: urlSchema.nullable(),
  location: z.string().max(500).optional().nullable(),
  latitude: coordinateSchema,
  longitude: coordinateSchema,
  teamTypes: z.array(TeamTypeSchema).default([]),
  contactFirstName: z.string().max(50).optional().nullable(),
  contactLastName: z.string().max(50).optional().nullable(),
  contactEmail: emailSchema.optional().nullable(),
  contactPhone: phoneSchema.nullable(),
  contactCountryCode: z.string().max(5).optional().nullable(),
  isContactWilling: z.boolean().default(false),
})

export const ClubUpdateSchema = ClubCreateSchema.partial().merge(z.object({
  id: z.string().cuid('Invalid club ID'),
}))

export const ClubQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  region: z.string().optional(),
  subRegion: z.string().optional(),
  teamTypes: z.string().optional(), // Comma-separated team types
  search: z.string().max(100).optional(),
  hasLocation: z.coerce.boolean().optional(),
})

// User schemas
export const UserRegistrationSchema = z.object({
  email: emailSchema,
  username: usernameSchema,
  password: passwordSchema,
  name: z.string().max(100, 'Name must be no more than 100 characters').optional(),
  clubId: z.string().cuid('Invalid club ID').optional().nullable(),
})

export const UserLoginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

export const UserUpdateSchema = z.object({
  id: z.string().cuid('Invalid user ID'),
  email: emailSchema.optional(),
  username: usernameSchema.optional(),
  name: z.string().min(1).max(100).optional(),
  role: UserRoleSchema.optional(),
  accountStatus: AccountStatusSchema.optional(),
  clubId: z.string().cuid().optional().nullable(),
  rejectionReason: z.string().max(500).optional().nullable(),
})

export const UserQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  role: UserRoleSchema.optional(),
  accountStatus: AccountStatusSchema.optional(),
  clubId: z.string().cuid().optional(),
  search: z.string().max(100).optional(),
})

// Password change schema
export const PasswordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

// Contact form schema
export const ContactFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be no more than 100 characters'),
  email: emailSchema,
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject must be no more than 200 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message must be no more than 2000 characters'),
})

// File upload schema
export const FileUploadSchema = z.object({
  file: z.object({
    name: z.string(),
    size: z.number().max(5 * 1024 * 1024, 'File must be no larger than 5MB'),
    type: z.string().regex(/^image\/(jpeg|jpg|png|webp)$/, 'File must be a valid image (JPEG, PNG, or WebP)'),
  }),
  folder: z.enum(['clubs', 'events', 'users']).optional().default('clubs'),
})

// Admin action schemas
export const UserApprovalSchema = z.object({
  userId: z.string().cuid('Invalid user ID'),
  action: z.enum(['approve', 'reject']),
  rejectionReason: z.string().max(500).optional(),
})

export const BulkUserActionSchema = z.object({
  userIds: z.array(z.string().cuid()),
  action: z.enum(['approve', 'reject', 'suspend']),
  rejectionReason: z.string().max(500).optional(),
})

// Search and filtering schemas
export const SearchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(100),
  type: z.enum(['clubs', 'events', 'users']).optional(),
  filters: z.record(z.string()).optional(),
})

export const LocationSearchSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radius: z.number().min(1).max(1000).default(50), // km
  type: z.enum(['clubs', 'events']).optional(),
})

// Image processing schema
export const ImageProcessingSchema = z.object({
  url: z.string().url(),
  width: z.number().min(50).max(2000).optional(),
  height: z.number().min(50).max(2000).optional(),
  quality: z.number().min(1).max(100).default(80),
  format: z.enum(['webp', 'jpeg', 'png']).default('webp'),
})

// API response schemas for type safety
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }).optional(),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }).optional(),
})

export const ErrorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
})

// Export types for TypeScript
export type EventCreate = z.infer<typeof EventCreateSchema>
export type EventUpdate = z.infer<typeof EventUpdateSchema>
export type EventQuery = z.infer<typeof EventQuerySchema>

export type InterestCreate = z.infer<typeof InterestCreateSchema>

export type ClubCreate = z.infer<typeof ClubCreateSchema>
export type ClubUpdate = z.infer<typeof ClubUpdateSchema>
export type ClubQuery = z.infer<typeof ClubQuerySchema>

export type UserRegistration = z.infer<typeof UserRegistrationSchema>
export type UserLogin = z.infer<typeof UserLoginSchema>
export type UserUpdate = z.infer<typeof UserUpdateSchema>
export type UserQuery = z.infer<typeof UserQuerySchema>

export type PasswordChange = z.infer<typeof PasswordChangeSchema>
export type ContactForm = z.infer<typeof ContactFormSchema>
export type FileUpload = z.infer<typeof FileUploadSchema>

export type UserApproval = z.infer<typeof UserApprovalSchema>
export type BulkUserAction = z.infer<typeof BulkUserActionSchema>

export type Search = z.infer<typeof SearchSchema>
export type LocationSearch = z.infer<typeof LocationSearchSchema>
export type ImageProcessing = z.infer<typeof ImageProcessingSchema>

export type ApiResponse = z.infer<typeof ApiResponseSchema>
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>

// Validation helper functions
export function validateEventDates(startDate: string, endDate?: string | null) {
  const start = new Date(startDate)
  const now = new Date()
  
  if (start < now) {
    throw new Error('Event start date cannot be in the past')
  }
  
  if (endDate) {
    const end = new Date(endDate)
    if (end <= start) {
      throw new Error('Event end date must be after start date')
    }
  }
}

export function validateCoordinates(latitude?: number, longitude?: number) {
  if ((latitude !== undefined && longitude === undefined) || 
      (latitude === undefined && longitude !== undefined)) {
    throw new Error('Both latitude and longitude must be provided together')
  }
}

export function validateTeamTypes(teamTypes: string[]) {
  const validTypes = TeamTypeSchema.options
  const invalidTypes = teamTypes.filter(type => !validTypes.includes(type as (typeof validTypes)[number]))
  
  if (invalidTypes.length > 0) {
    throw new Error(`Invalid team types: ${invalidTypes.join(', ')}`)
  }
}