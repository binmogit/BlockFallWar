// Shared mock for the 'color' module used in tests.
// This module sets up a jest mock for 'color' and exposes helpers to
// change the returned hex value during tests.

let mockHex = '#000';

export const setMockHex = (hex: string) => {
  mockHex = hex;
};

export const resetMockHex = () => {
  mockHex = '#000';
};

// Provide a top-level jest.mock so importing this helper applies the mock
// across tests that import it.
jest.mock('color', () => ({
  __esModule: true,
  // The 'amount' parameter to darken is intentionally ignored in these tests
  default: () => ({ darken: (_amount: number) => ({ hex: () => mockHex }) }),
}));
