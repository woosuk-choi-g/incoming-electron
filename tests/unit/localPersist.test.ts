import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createLocalPersist,
  createLocalPersistedData,
} from '../../electron/localPersist';

const temporaryDirectories: string[] = [];

async function createTemporaryFilePath(): Promise<string> {
  const directory = await mkdtemp(path.join(tmpdir(), 'timer-overlay-'));
  temporaryDirectories.push(directory);
  return path.join(directory, 'timers.json');
}

describe('local persist', () => {
  afterEach(async () => {
    vi.useRealTimers();
    await Promise.all(
      temporaryDirectories
        .splice(0)
        .map((directory) => rm(directory, { recursive: true, force: true }))
    );
  });

  it('creates persisted data with an ISO timestamp', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-27T00:00:00.000Z'));

    expect(createLocalPersistedData([])).toEqual({
      saveAt: '2026-08-27T00:00:00.000Z',
      data: [],
    });
  });

  it('saves and loads validated timer data', async () => {
    const filename = await createTemporaryFilePath();
    const persist = createLocalPersist(filename);
    const data = createLocalPersistedData([
      {
        id: 'timer-1',
        title: 'Respawn',
        duration: 30_000,
        repeat: false,
        state: { type: 'paused', duration: 30_000 },
      },
    ]);

    await persist.save(data);

    expect(JSON.parse(await readFile(filename, 'utf8'))).toEqual(data);
    await expect(persist.load()).resolves.toEqual(data);
  });

  it('returns undefined when the persisted file does not exist', async () => {
    const filename = await createTemporaryFilePath();
    const persist = createLocalPersist(filename);

    await expect(persist.load()).resolves.toBeUndefined();
  });

  it('rejects malformed persisted data', async () => {
    const filename = await createTemporaryFilePath();
    const persist = createLocalPersist(filename);
    await writeFile(filename, JSON.stringify({ saveAt: null, data: [] }));

    await expect(persist.load()).rejects.toThrow();
  });
});
