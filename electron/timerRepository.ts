import { randomUUID } from 'node:crypto';
import { CreateTimerOption, Timer } from '../shared/timer';

export function createTimerRepository() {
  const timers = new Map<string, Timer>();

  function generateTimerId() {
    for (let i = 0; i < 100; i++) {
      const id = randomUUID();
      if (!timers.has(id)) {
        return id;
      }
    }
    throw new Error('Failed to generate timer id');
  }

  function get(timerId: string) {
    return timers.get(timerId);
  }

  function getAll() {
    return [...timers.values()];
  }

  function add(option: CreateTimerOption) {
    const timer: Timer = {
      ...option,
      id: generateTimerId(),
    };
    timers.set(timer.id, timer);
    return timer;
  }

  function update(timerId: string, option: CreateTimerOption) {
    const timer = timers.get(timerId);
    if (!timer) {
      throw new Error(`not found timer: ${timerId}`);
    }

    timers.set(timerId, {
      ...timer,
      ...option,
    });
  }

  function remove(id: string) {
    timers.delete(id);
  }

  return {
    generateTimerId,
    get,
    getAll,
    add,
    update,
    remove,
  };
}
