import { z } from "zod"
import { UserRole } from "@prisma/client"

// Common validation patterns
const emailSchema = z.string().email("Please enter a valid email address")
const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")

const usernameSchema = z.string()
  .min(3, "Username must be at least 3 characters long")
  .max(20, "Username must not exceed 20 characters")
  .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens")

const urlSchema = z.string().url("Please enter a valid URL").optional().or(z.literal(""))

const coordinateSchema = z.number()
  .min(-90, "Latitude must be between -90 and 90")
  .max(90, "Latitude must be between -90 and 90")

const longitudeSchema = z.number()
  .min(-180, "Longitude must be between -180 and 180")
  .max(180, "Longitude must be between -180 and 180")

// User validation schemas
export const createUserSchema = z.object({
  email: emailSchema,
  username: usernameSchema,
  password: passwordSchema,
  name: z.string().min(1, "Name is required").max(100, "Name must not exceed 100 characters"),
  role: z.nativeEnum(UserRole),
  clubIds: z.array(z.string().cuid("Invalid club ID")).optional().default([]),
})

export const updateUserSchema = z.object({
  email: emailSchema.optional(),
  username: usernameSchema.optional(),
  name: z.string().min(1, "Name is required").max(100, "Name must not exceed 100 characters").optional(),
  role: z.nativeEnum(UserRole).optional(),
  clubIds: z.array(z.string().cuid("Invalid club ID")).optional(),
})

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
})

// Club validation schemas
export const createClubSchema = z.object({
  name: z.string()
    .min(1, "Club name is required")
    .max(100, "Club name must not exceed 100 characters")
    .trim(),
  location: z.string()
    .min(1, "Location is required")
    .max(200, "Location must not exceed 200 characters")
    .trim(),
  region: z.string().max(100, "Region must not exceed 100 characters").optional(),
  subRegion: z.string().max(100, "Sub-region must not exceed 100 characters").optional(),
  latitude: coordinateSchema.optional(),
  longitude: longitudeSchema.optional(),
  facebook: urlSchema,
  instagram: urlSchema,
  website: urlSchema,
  codes: z.string().max(50, "Codes must not exceed 50 characters").optional(),
  imageUrl: urlSchema,
  teamTypes: z.array(z.string().max(50, "Team type must not exceed 50 characters")).default([]),
  map: z.string().max(500, "Map description must not exceed 500 characters").optional(),
})

export const updateClubSchema = createClubSchema.partial()

// Event validation schemas
const baseEventSchema = z.object({
  title: z.string()
    .min(1, "Event title is required")
    .max(200, "Event title must not exceed 200 characters")
    .trim(),
  eventType: z.string()
    .min(1, "Event type is required")
    .max(50, "Event type must not exceed 50 characters"),
  location: z.string()
    .min(1, "Location is required")
    .max(200, "Location must not exceed 200 characters")
    .trim(),
  startDate: z.string().datetime("Please enter a valid date and time"),
  endDate: z.string().datetime("Please enter a valid date and time").optional(),
  cost: z.number()
    .min(0, "Cost cannot be negative")
    .max(10000, "Cost cannot exceed €10,000")
    .optional(),
  description: z.string()
    .max(2000, "Description must not exceed 2000 characters")
    .optional(),
  imageUrl: urlSchema,
  latitude: coordinateSchema.optional(),
  longitude: longitudeSchema.optional(),
})

export const createEventSchema = baseEventSchema.refine(
  (data) => {
    if (data.endDate && data.startDate) {
      return new Date(data.endDate) >= new Date(data.startDate)
    }
    return true
  },
  {
    message: "End date must be after start date",
    path: ["endDate"],
  }
)

export const updateEventSchema = baseEventSchema.partial().refine(
  (data) => {
    if (data.endDate && data.startDate) {
      return new Date(data.endDate) >= new Date(data.startDate)
    }
    return true
  },
  {
    message: "End date must be after start date",
    path: ["endDate"],
  }
)

// Image upload validation
export const imageUploadSchema = z.object({
  imageUrl: z.string().url("Please enter a valid image URL"),
})

// Search and filter validation
export const searchParamsSchema = z.object({
  q: z.string().max(100, "Search query too long").optional(),
  type: z.string().max(50, "Invalid type filter").optional(),
  location: z.string().max(100, "Invalid location filter").optional(),
  page: z.coerce.number().min(1, "Page must be at least 1").max(1000, "Page too high").default(1),
  limit: z.coerce.number().min(1, "Limit must be at least 1").max(100, "Limit too high").default(20),
})

// Contact form validation
export const contactSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .max(100, "Name must not exceed 100 characters")
    .trim(),
  email: emailSchema,
  subject: z.string()
    .min(1, "Subject is required")
    .max(200, "Subject must not exceed 200 characters")
    .trim(),
  message: z.string()
    .min(10, "Message must be at least 10 characters long")
    .max(2000, "Message must not exceed 2000 characters")
    .trim(),
})

// Validation helper functions
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
      return { success: false, error: errorMessages }
    }
    return { success: false, error: "Validation failed" }
  }
}

export function sanitizeHtml(input: string): string {
  // Basic HTML sanitization - remove script tags and dangerous attributes
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
}

export function sanitizeInput(input: string): string {
  // Basic input sanitization
  return input
    .trim()
    .replace(/[<>'"&]/g, (match) => {
      const htmlEntities: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      }
      return htmlEntities[match] || match
    })
}

// Type exports for TypeScript
export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type CreateClubInput = z.infer<typeof createClubSchema>
export type UpdateClubInput = z.infer<typeof updateClubSchema>
export type CreateEventInput = z.infer<typeof createEventSchema>
export type UpdateEventInput = z.infer<typeof updateEventSchema>
export type ImageUploadInput = z.infer<typeof imageUploadSchema>
export type SearchParamsInput = z.infer<typeof searchParamsSchema>
export type ContactInput = z.infer<typeof contactSchema>