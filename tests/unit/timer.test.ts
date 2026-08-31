import { describe, expect, it } from 'vitest';
import { createTimer } from '../../shared/timer';

describe('timer model', () => {
  it('creates a paused timer from its immutable configuration', () => {
    expect(
      createTimer('timer-1', {
        title: '  Respawn  ',
        duration: 30_000,
        repeat: true,
        state: { type: 'paused', duration: 30_000 },
      })
    ).toEqual({
      id: 'timer-1',
      title: 'Respawn',
      duration: 30_000,
      repeat: true,
      state: { type: 'paused', duration: 30_000 },
    });
  });

  it('rejects an empty title or invalid duration', () => {
    expect(() =>
      createTimer('timer-1', {
        title: ' ',
        duration: 30_000,
        repeat: false,
        state: { type: 'paused', duration: 30_000 },
      })
    ).toThrow();
    expect(() =>
      createTimer('timer-1', {
        title: 'Respawn',
        duration: 0,
        repeat: false,
        state: { type: 'paused', duration: 0 },
      })
    ).toThrow();
  });
});
