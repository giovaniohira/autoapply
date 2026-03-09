import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: [
      'backend/src/**/*.test.{ts,tsx}',
      'extension/src/**/*.test.{ts,tsx}',
      'shared/src/**/*.test.{ts,tsx}',
    ],
    environment: 'node',
  },
});
