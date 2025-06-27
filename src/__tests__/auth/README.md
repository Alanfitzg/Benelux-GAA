# Authentication Test Suite

This directory contains comprehensive test cases for the user accounts and authentication system of the GAA Trips platform.

## Test Structure

### 1. **auth-unit.test.ts** ✅ Working
Unit tests for core authentication logic including:
- **User Roles & Permissions**: Role hierarchy and access control logic
- **Account Status Management**: Status transitions and validation
- **Password Validation**: Strong password requirements and validation logic
- **Username Validation**: Username format and security validation
- **Email Validation**: Email format verification
- **Rate Limiting Logic**: Request throttling and abuse prevention
- **Session Security**: Session creation, validation, and expiry
- **Input Sanitization**: XSS and injection prevention

### 2. **auth-flows.test.ts** ⚠️ Integration Issues
API-level tests for authentication flows (currently has module import issues):
- User registration workflow
- Account status checking
- Duplicate user prevention
- Input validation on API endpoints
- Error handling for registration failures

### 3. **auth-helpers.test.ts** ⚠️ Integration Issues
Tests for authentication helper functions (currently has module import issues):
- `getServerSession()` functionality
- Role-based access control helpers
- Permission enforcement functions
- Account approval status checking
- Error handling for auth failures

### 4. **admin-user-management.test.ts** ⚠️ Integration Issues
Tests for admin-only user management features (currently has module import issues):
- User CRUD operations (Create, Read, Update, Delete)
- User approval and rejection workflows
- Password reset functionality
- Permission enforcement for admin actions
- Bulk user operations

### 5. **rate-limiting.test.ts** ⚠️ Integration Issues
Tests for rate limiting functionality (currently has module import issues):
- Authentication endpoint rate limiting
- Registration rate limiting
- Admin API rate limiting
- IP-based tracking
- Rate limit headers and responses

### 6. **security.test.ts** ⚠️ Syntax Issues
Security-focused tests (currently has string escaping issues):
- Password hashing and verification
- SQL injection prevention
- XSS (Cross-Site Scripting) prevention
- Session security
- Input validation and sanitization
- CSRF protection
- Security headers

### 7. **integration.test.ts** ⚠️ Integration Issues
End-to-end integration tests (currently has module import issues):
- Complete user registration and approval workflow
- Role-based access control integration
- Password management workflows
- User lifecycle management
- Error handling across the entire flow

## Running Tests

### Run All Auth Tests
```bash
npm test -- --testPathPattern=auth
```

### Run Specific Test Files
```bash
# Working unit tests
npm test -- --testPathPattern=auth-unit

# Individual test files (currently have issues)
npm test -- --testPathPattern=auth-flows
npm test -- --testPathPattern=auth-helpers
npm test -- --testPathPattern=admin-user-management
npm test -- --testPathPattern=rate-limiting
npm test -- --testPathPattern=security
npm test -- --testPathPattern=integration
```

## Test Coverage

The test suite covers the following authentication features:

### ✅ **Working Coverage (auth-unit.test.ts)**
- [x] User role hierarchy validation
- [x] Account status transitions
- [x] Password strength validation
- [x] Username format validation
- [x] Email format validation
- [x] Permission checking logic
- [x] Rate limiting algorithms
- [x] Session security logic
- [x] Input sanitization

### ⚠️ **Planned Coverage (Integration Tests)**
- [ ] User registration API endpoints
- [ ] Authentication middleware
- [ ] Role-based access control
- [ ] Admin user management APIs
- [ ] Account approval workflows
- [ ] Password reset functionality
- [ ] Rate limiting enforcement
- [ ] Security header validation
- [ ] End-to-end user workflows

## Known Issues

### Module Import Issues
Several test files have issues importing Next.js and NextAuth modules in the Jest environment. This is a common issue with:
- Next.js App Router API routes
- NextAuth.js authentication
- Server-side components

**Potential Solutions:**
1. Configure Jest to better handle ES modules
2. Mock problematic dependencies more thoroughly
3. Use integration testing tools like Playwright for full API testing
4. Separate unit tests from integration tests

### NextAuth Module Conflicts
The NextAuth library uses ES modules which conflict with Jest's CommonJS environment.

**Workarounds:**
1. Mock the entire NextAuth module
2. Use dynamic imports in tests
3. Configure Jest's `transformIgnorePatterns`
4. Use a different testing approach for authentication

## Test Data and Mocking

### Mock Data Patterns
```typescript
// User mock data
const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  username: 'testuser',
  role: UserRole.USER,
  accountStatus: AccountStatus.APPROVED,
};

// Session mock data
const mockSession = {
  user: {
    id: 'user-123',
    role: UserRole.USER,
    accountStatus: AccountStatus.APPROVED,
  },
};
```

### Database Mocking
Tests use Jest mocks for Prisma database operations:
```typescript
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      // ... other methods
    },
  },
}));
```

## Security Test Categories

### Authentication Security
- Password hashing with bcrypt
- Session token generation and validation
- Account status enforcement
- Role-based access control

### Input Security
- SQL injection prevention (Prisma protection)
- XSS prevention in user inputs
- Command injection prevention
- Path traversal prevention

### Rate Limiting Security
- Brute force attack prevention
- Registration abuse prevention
- API endpoint protection
- IP-based tracking

### Session Security
- Secure cookie configuration
- CSRF token validation
- Session timeout enforcement
- Session hijacking prevention

## Best Practices

### Test Organization
1. **Unit Tests**: Test individual functions and logic
2. **Integration Tests**: Test API endpoints and workflows
3. **Security Tests**: Test security measures and attack prevention
4. **End-to-End Tests**: Test complete user journeys

### Mock Strategy
1. Mock external dependencies (database, auth services)
2. Use realistic test data
3. Test both success and failure scenarios
4. Verify security boundaries

### Assertion Patterns
1. Test positive cases (valid inputs)
2. Test negative cases (invalid inputs)
3. Test edge cases (boundary conditions)
4. Test error handling (graceful failures)

## Future Improvements

1. **Fix Module Import Issues**: Resolve NextAuth and Next.js import conflicts
2. **Add E2E Tests**: Use Playwright for full user journey testing
3. **Improve Coverage**: Add tests for missing edge cases
4. **Performance Tests**: Add tests for authentication performance
5. **Security Audits**: Regular security testing and validation

## Contributing

When adding new authentication features:

1. **Add Unit Tests**: Start with unit tests for core logic
2. **Add Integration Tests**: Test API endpoints and workflows
3. **Add Security Tests**: Test security implications
4. **Update Documentation**: Update this README with new test coverage

### Test Naming Conventions
- Use descriptive test names: `should validate strong passwords`
- Group related tests in `describe` blocks
- Use consistent mock data patterns
- Follow arrange-act-assert pattern