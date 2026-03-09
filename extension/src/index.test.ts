import { describe, expect, it } from 'vitest';

import { extensionReady } from './index';

describe('extensionReady', () => {
  it('returns true to indicate extension workspace is wired', () => {
    expect(extensionReady()).toBe(true);
  });
});

