/**
 * Mock server setup for testing
 * This file sets up MSW for API mocking in tests
 * 
 * To use MSW in a test:
 * 1. Import { server } from './mocks/server'
 * 2. Add beforeAll(() => server.listen()) to your test suite
 * 3. Add afterEach(() => server.resetHandlers()) to reset handlers
 * 4. Add afterAll(() => server.close()) to clean up
 */

// For now, we'll export a simple mock object
// This can be updated when MSW compatibility issues are resolved
export const server = {
  listen: jest.fn(),
  resetHandlers: jest.fn(),
  close: jest.fn(),
  use: jest.fn(),
};