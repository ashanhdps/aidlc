// Mock Socket.IO client for testing
export const io = jest.fn(() => ({
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn(),
  connected: true
}))