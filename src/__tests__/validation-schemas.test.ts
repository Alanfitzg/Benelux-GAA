import { describe, it, expect } from '@jest/globals'
import {
  UserRegistrationSchema,
  EventCreateSchema,
  ClubCreateSchema,
  ContactFormSchema,
  PasswordChangeSchema,
  TeamTypeSchema,
  validateEventDates,
  validateCoordinates,
  validateTeamTypes,
} from '@/lib/validation/schemas'

describe('Zod Validation Schemas', () => {
  describe('UserRegistrationSchema', () => {
    it('validates correct user registration data', () => {
      const validData = {
        email: 'test@example.com',
        username: 'testuser123',
        password: 'StrongPass123',
        name: 'Test User',
        clubId: null,
      }

      const result = UserRegistrationSchema.parse(validData)
      expect(result).toEqual(validData)
    })

    it('rejects invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        username: 'testuser123',
        password: 'StrongPass123',
        name: 'Test User',
      }

      expect(() => UserRegistrationSchema.parse(invalidData)).toThrow()
    })

    it('rejects weak password', () => {
      const invalidData = {
        email: 'test@example.com',
        username: 'testuser123',
        password: 'weak',
        name: 'Test User',
      }

      expect(() => UserRegistrationSchema.parse(invalidData)).toThrow()
    })

    it('rejects invalid username', () => {
      const invalidData = {
        email: 'test@example.com',
        username: 'ab', // Too short
        password: 'StrongPass123',
        name: 'Test User',
      }

      expect(() => UserRegistrationSchema.parse(invalidData)).toThrow()
    })
  })

  describe('EventCreateSchema', () => {
    it('validates correct event data', () => {
      const validData = {
        title: 'GAA Tournament',
        eventType: 'Tournament',
        location: 'Dublin, Ireland',
        latitude: 53.3498,
        longitude: -6.2603,
        startDate: '2024-12-01T10:00:00Z',
        endDate: '2024-12-01T18:00:00Z',
        cost: 25.50,
        description: 'Annual GAA tournament',
        isRecurring: false,
        imageUrl: 'https://example.com/image.jpg',
      }

      const result = EventCreateSchema.parse(validData)
      expect(result.title).toBe(validData.title)
      expect(result.cost).toBe(validData.cost)
    })

    it('rejects event with end date before start date', () => {
      const invalidData = {
        title: 'GAA Tournament',
        eventType: 'Tournament',
        location: 'Dublin, Ireland',
        startDate: '2024-12-01T18:00:00Z',
        endDate: '2024-12-01T10:00:00Z', // Before start date
        description: 'Annual GAA tournament',
      }

      expect(() => EventCreateSchema.parse(invalidData)).toThrow()
    })

    it('accepts event without end date', () => {
      const validData = {
        title: 'GAA Training',
        eventType: 'Training',
        location: 'Dublin, Ireland',
        startDate: '2024-12-01T10:00:00Z',
        description: 'Weekly training session',
      }

      const result = EventCreateSchema.parse(validData)
      expect(result.endDate).toBeUndefined()
    })
  })

  describe('ClubCreateSchema', () => {
    it('validates correct club data', () => {
      const validData = {
        name: 'Dublin GAA Club',
        region: 'Leinster',
        subRegion: 'Dublin',
        location: 'Dublin, Ireland',
        latitude: 53.3498,
        longitude: -6.2603,
        teamTypes: ['Senior Mens Gaelic Football', 'Senior Ladies Gaelic Football'],
        contactFirstName: 'John',
        contactLastName: 'Doe',
        contactEmail: 'john@dublingaa.ie',
        contactPhone: '+353851234567',
        isContactWilling: true,
        website: 'https://dublingaa.ie',
        facebook: 'https://facebook.com/dublingaa',
      }

      const result = ClubCreateSchema.parse(validData)
      expect(result.name).toBe(validData.name)
      expect(result.teamTypes).toEqual(validData.teamTypes)
    })

    it('accepts empty team types array', () => {
      const validData = {
        name: 'New GAA Club',
        teamTypes: [],
      }

      const result = ClubCreateSchema.parse(validData)
      expect(result.teamTypes).toEqual([])
    })
  })

  describe('ContactFormSchema', () => {
    it('validates correct contact form data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Question about events',
        message: 'I have a question about upcoming GAA events in my area.',
      }

      const result = ContactFormSchema.parse(validData)
      expect(result).toEqual(validData)
    })

    it('rejects message that is too short', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Question',
        message: 'Short', // Too short
      }

      expect(() => ContactFormSchema.parse(invalidData)).toThrow()
    })
  })

  describe('PasswordChangeSchema', () => {
    it('validates correct password change data', () => {
      const validData = {
        currentPassword: 'oldPassword123',
        newPassword: 'NewStrongPass456',
        confirmPassword: 'NewStrongPass456',
      }

      const result = PasswordChangeSchema.parse(validData)
      expect(result.newPassword).toBe(validData.newPassword)
    })

    it('rejects mismatched passwords', () => {
      const invalidData = {
        currentPassword: 'oldPassword123',
        newPassword: 'NewStrongPass456',
        confirmPassword: 'DifferentPassword789',
      }

      expect(() => PasswordChangeSchema.parse(invalidData)).toThrow()
    })
  })

  describe('TeamTypeSchema', () => {
    it('accepts valid team types', () => {
      const validTypes = [
        'Senior Mens Gaelic Football',
        'Senior Ladies Gaelic Football',
        'Senior Mens Hurling',
        'Senior Ladies Hurling (Camogie)',
        'Youth/Underage',
        'Mixed/Social',
        'Other'
      ]

      validTypes.forEach(type => {
        expect(() => TeamTypeSchema.parse(type)).not.toThrow()
      })
    })

    it('rejects invalid team type', () => {
      expect(() => TeamTypeSchema.parse('Invalid Team Type')).toThrow()
    })
  })
})

describe('Validation Helper Functions', () => {
  describe('validateEventDates', () => {
    it('accepts future start date', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 7)
      
      expect(() => validateEventDates(futureDate.toISOString())).not.toThrow()
    })

    it('rejects past start date', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 7)
      
      expect(() => validateEventDates(pastDate.toISOString())).toThrow()
    })

    it('accepts valid date range', () => {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() + 7)
      const endDate = new Date()
      endDate.setDate(endDate.getDate() + 8)
      
      expect(() => validateEventDates(startDate.toISOString(), endDate.toISOString())).not.toThrow()
    })
  })

  describe('validateCoordinates', () => {
    it('accepts valid coordinates', () => {
      expect(() => validateCoordinates(53.3498, -6.2603)).not.toThrow()
    })

    it('rejects incomplete coordinates', () => {
      expect(() => validateCoordinates(53.3498)).toThrow()
      expect(() => validateCoordinates(undefined, -6.2603)).toThrow()
    })
  })

  describe('validateTeamTypes', () => {
    it('accepts valid team types array', () => {
      const validTypes = ['Senior Mens Gaelic Football', 'Senior Ladies Gaelic Football']
      expect(() => validateTeamTypes(validTypes)).not.toThrow()
    })

    it('rejects array with invalid team type', () => {
      const invalidTypes = ['Senior Mens Gaelic Football', 'Invalid Type']
      expect(() => validateTeamTypes(invalidTypes)).toThrow()
    })
  })
})