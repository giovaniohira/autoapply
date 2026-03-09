import { describe, expect, it } from 'vitest';

import { sharedReady } from './index';

describe('sharedReady', () => {
  it('returns true to indicate shared workspace is wired', () => {
    expect(sharedReady()).toBe(true);
  });
});

