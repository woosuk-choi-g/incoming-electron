import { describe, expect, it } from 'vitest';
import { createTimerRepository } from '../../electron/timerRepository';

const pausedTimer = {
  title: 'Respawn',
  duration: 30_000,
  repeat: false,
};

describe('timer repository', () => {
  it('adds and retrieves a timer with a generated id', () => {
    const repository = createTimerRepository();

    const timer = repository.add(pausedTimer);

    expect(timer.id).toEqual(expect.any(String));
    expect(timer.state).toEqual({ type: 'paused', duration: 30_000 });
    expect(repository.get(timer.id)).toEqual(timer);
    expect(repository.getAll()).toEqual([timer]);
  });

  it('generates a distinct id for each timer', () => {
    const repository = createTimerRepository();

    const first = repository.add(pausedTimer);
    const second = repository.add(pausedTimer);

    expect(second.id).not.toBe(first.id);
  });

  it('updates a timer without changing its id', () => {
    const repository = createTimerRepository();
    const timer = repository.add(pausedTimer);

    repository.update(timer.id, {
      title: 'Updated respawn',
      duration: 45_000,
      repeat: true,
      state: { type: 'paused', duration: 45_000 },
    });

    expect(repository.get(timer.id)).toEqual({
      id: timer.id,
      title: 'Updated respawn',
      duration: 45_000,
      repeat: true,
      state: { type: 'paused', duration: 45_000 },
    });
  });

  it('throws when updating a missing timer', () => {
    const repository = createTimerRepository();

    expect(() =>
      repository.update('missing', {
        ...pausedTimer,
        state: { type: 'paused', duration: pausedTimer.duration },
      })
    ).toThrow('not found timer: missing');
  });

  it('removes a timer', () => {
    const repository = createTimerRepository();
    const timer = repository.add(pausedTimer);

    repository.remove(timer.id);

    expect(repository.get(timer.id)).toBeUndefined();
    expect(repository.getAll()).toEqual([]);
  });
});
