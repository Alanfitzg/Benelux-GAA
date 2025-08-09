// Mock for next-auth
const nextAuthMock = jest.fn(() => ({
  handlers: {
    GET: jest.fn(),
    POST: jest.fn(),
  },
  auth: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

module.exports = nextAuthMock;
module.exports.default = nextAuthMock;