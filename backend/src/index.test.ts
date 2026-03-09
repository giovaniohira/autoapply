import { describe, expect, it } from 'vitest';

import { backendReady } from './index';

describe('backendReady', () => {
  it('returns true to indicate backend workspace is wired', () => {
    expect(backendReady()).toBe(true);
  });
});

