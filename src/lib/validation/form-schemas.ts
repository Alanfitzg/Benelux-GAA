import { z } from 'zod'
import {
  emailSchema,
  passwordSchema,
  usernameSchema,
  phoneSchema,
  urlSchema,
  coordinateSchema,
  TeamTypeSchema,
} from './schemas'

// Sign In Form Schema
export const SignInFormSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
})

// Sign Up Form Schema  
export const SignUpFormSchema = z.object({
  email: emailSchema,
  username: usernameSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be no more than 100 characters'),
  clubId: z.string().cuid().optional().nullable(),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

// Contact Form Schema
export const ContactFormFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be no more than 100 characters'),
  email: emailSchema,
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject must be no more than 200 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message must be no more than 2000 characters'),
  type: z.enum(['general', 'club', 'event', 'technical', 'partnership', 'feedback']).optional().default('general'),
})

// Club Registration Form Schema
export const ClubRegistrationFormSchema = z.object({
  name: z.string().min(1, 'Club name is required').max(200, 'Club name must be no more than 200 characters'),
  region: z.string().max(100).optional(),
  subRegion: z.string().max(100).optional(),
  location: z.string().max(500).optional(),
  latitude: coordinateSchema,
  longitude: coordinateSchema,
  teamTypes: z.array(TeamTypeSchema).min(1, 'Please select at least one team type'),
  
  // Contact information
  contactFirstName: z.string().max(50).optional(),
  contactLastName: z.string().max(50).optional(),
  contactEmail: emailSchema.optional(),
  contactPhone: phoneSchema,
  contactCountryCode: z.string().max(5).optional(),
  isContactWilling: z.boolean().default(false),
  
  // Social media and web presence
  website: urlSchema,
  facebook: urlSchema,
  instagram: urlSchema,
  
  // Additional information
  description: z.string().max(1000).optional(),
  foundedYear: z.number().min(1800).max(new Date().getFullYear()).optional(),
  
  // File upload
  clubImage: z.any().optional(),
  
  // Agreements
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
  agreeToDataSharing: z.boolean().default(false),
})

// Event Creation Form Schema
export const EventCreationFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be no more than 200 characters'),
  eventType: z.string().min(1, 'Event type is required'),
  description: z.string().max(2000, 'Description must be no more than 2000 characters').optional(),
  
  // Location
  location: z.string().min(1, 'Location is required').max(500, 'Location must be no more than 500 characters'),
  latitude: coordinateSchema,
  longitude: coordinateSchema,
  
  // Dates and times
  startDate: z.string().min(1, 'Start date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endDate: z.string().optional(),
  endTime: z.string().optional(),
  
  // Event details
  cost: z.number().min(0, 'Cost cannot be negative').optional().nullable(),
  maxParticipants: z.number().min(1, 'Maximum participants must be at least 1').optional(),
  isRecurring: z.boolean().default(false),
  recurringPattern: z.enum(['weekly', 'monthly', 'yearly']).optional(),
  
  // Contact and registration
  contactEmail: emailSchema.optional(),
  contactPhone: phoneSchema,
  registrationRequired: z.boolean().default(false),
  registrationDeadline: z.string().optional(),
  
  // Media
  eventImage: z.any().optional(),
  
  // Additional requirements
  ageRestrictions: z.string().max(200).optional(),
  skillLevel: z.enum(['beginner', 'intermediate', 'advanced', 'all']).optional().default('all'),
  equipment: z.string().max(500).optional(),
}).refine((data) => {
  // Validate end date is after start date if provided
  if (data.endDate && data.startDate) {
    const start = new Date(`${data.startDate}T${data.startTime || '00:00'}`)
    const end = new Date(`${data.endDate}T${data.endTime || '23:59'}`)
    return end > start
  }
  return true
}, {
  message: 'End date and time must be after start date and time',
  path: ['endDate'],
}).refine((data) => {
  // Validate registration deadline is before event start if provided
  if (data.registrationDeadline && data.startDate) {
    const deadline = new Date(data.registrationDeadline)
    const start = new Date(data.startDate)
    return deadline <= start
  }
  return true
}, {
  message: 'Registration deadline must be before the event start date',
  path: ['registrationDeadline'],
})

// Event Interest Form Schema
export const EventInterestFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be no more than 100 characters'),
  email: emailSchema,
  message: z.string().max(1000, 'Message must be no more than 1000 characters').optional(),
  phone: phoneSchema,
  numberOfParticipants: z.number().min(1, 'Number of participants must be at least 1').default(1),
})

// Profile Update Form Schema
export const ProfileUpdateFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be no more than 100 characters'),
  email: emailSchema,
  clubId: z.string().cuid().optional().nullable(),
  bio: z.string().max(500, 'Bio must be no more than 500 characters').optional(),
  location: z.string().max(100).optional(),
  website: urlSchema,
  profileImage: z.any().optional(),
})

// Password Change Form Schema
export const PasswordChangeFormSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'New passwords do not match',
  path: ['confirmNewPassword'],
})

// Search Form Schema
export const SearchFormSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(100),
  type: z.enum(['clubs', 'events', 'all']).default('all'),
  location: z.string().max(100).optional(),
  radius: z.number().min(1).max(1000).default(50),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  eventType: z.string().optional(),
  teamTypes: z.array(TeamTypeSchema).optional(),
})

// Newsletter Subscription Schema
export const NewsletterSubscriptionFormSchema = z.object({
  email: emailSchema,
  frequency: z.enum(['weekly', 'monthly', 'events-only']).default('monthly'),
  interests: z.array(z.enum(['events', 'clubs', 'news', 'tips'])).min(1, 'Please select at least one interest'),
  agreeToMarketing: z.boolean().refine(val => val === true, {
    message: 'You must agree to receive marketing communications',
  }),
})

// Admin User Approval Form Schema
export const UserApprovalFormSchema = z.object({
  action: z.enum(['approve', 'reject']),
  rejectionReason: z.string().max(500).optional(),
  notifyUser: z.boolean().default(true),
  addToClub: z.string().cuid().optional(),
})

// Bulk Actions Form Schema
export const BulkActionsFormSchema = z.object({
  action: z.enum(['approve', 'reject', 'suspend', 'delete']),
  userIds: z.array(z.string().cuid()).min(1, 'Please select at least one user'),
  reason: z.string().max(500).optional(),
  confirmAction: z.boolean().refine(val => val === true, {
    message: 'You must confirm this action',
  }),
})

// File Upload Form Schema
export const FileUploadFormSchema = z.object({
  file: z.any().refine((file) => file instanceof File, {
    message: 'Please select a file',
  }),
  description: z.string().max(200).optional(),
  isPublic: z.boolean().default(false),
  category: z.enum(['club-images', 'event-images', 'profile-images', 'documents']).default('club-images'),
})

// Export types for form usage
export type SignInForm = z.infer<typeof SignInFormSchema>
export type SignUpForm = z.infer<typeof SignUpFormSchema>
export type ContactFormForm = z.infer<typeof ContactFormFormSchema>
export type ClubRegistrationForm = z.infer<typeof ClubRegistrationFormSchema>
export type EventCreationForm = z.infer<typeof EventCreationFormSchema>
export type EventInterestForm = z.infer<typeof EventInterestFormSchema>
export type ProfileUpdateForm = z.infer<typeof ProfileUpdateFormSchema>
export type PasswordChangeForm = z.infer<typeof PasswordChangeFormSchema>
export type SearchForm = z.infer<typeof SearchFormSchema>
export type NewsletterSubscriptionForm = z.infer<typeof NewsletterSubscriptionFormSchema>
export type UserApprovalForm = z.infer<typeof UserApprovalFormSchema>
export type BulkActionsForm = z.infer<typeof BulkActionsFormSchema>
export type FileUploadForm = z.infer<typeof FileUploadFormSchema>

// Form field configurations for dynamic form generation
export const FormFieldConfigs = {
  SignIn: {
    username: { type: 'text', label: 'Username', placeholder: 'Enter your username', autoComplete: 'username' },
    password: { type: 'password', label: 'Password', placeholder: 'Enter your password', autoComplete: 'current-password' },
    rememberMe: { type: 'checkbox', label: 'Remember me' },
  },
  
  SignUp: {
    email: { type: 'email', label: 'Email Address', placeholder: 'Enter your email', autoComplete: 'email' },
    username: { type: 'text', label: 'Username', placeholder: 'Choose a username', autoComplete: 'username' },
    password: { type: 'password', label: 'Password', placeholder: 'Create a password', autoComplete: 'new-password' },
    confirmPassword: { type: 'password', label: 'Confirm Password', placeholder: 'Confirm your password', autoComplete: 'new-password' },
    name: { type: 'text', label: 'Full Name', placeholder: 'Enter your full name', autoComplete: 'name' },
    clubId: { type: 'select', label: 'Associated Club (Optional)', placeholder: 'Select a club' },
    agreeToTerms: { type: 'checkbox', label: 'I agree to the Terms and Conditions' },
  },
  
  Contact: {
    name: { type: 'text', label: 'Name', placeholder: 'Enter your name', autoComplete: 'name' },
    email: { type: 'email', label: 'Email', placeholder: 'Enter your email', autoComplete: 'email' },
    subject: { type: 'text', label: 'Subject', placeholder: 'What is this about?' },
    message: { type: 'textarea', label: 'Message', placeholder: 'Enter your message', rows: 5 },
    type: { type: 'select', label: 'Inquiry Type', options: [
      { value: 'general', label: 'General Inquiry' },
      { value: 'club', label: 'Club Related' },
      { value: 'event', label: 'Event Related' },
      { value: 'technical', label: 'Technical Support' },
      { value: 'partnership', label: 'Partnership' },
      { value: 'feedback', label: 'Feedback' },
    ]},
  },
} as const