// Mock for auth providers
const providerMock = jest.fn(() => ({
  id: 'credentials',
  name: 'credentials',
  type: 'credentials',
  credentials: {},
  authorize: jest.fn(),
}));

module.exports = providerMock;
module.exports.default = providerMock;