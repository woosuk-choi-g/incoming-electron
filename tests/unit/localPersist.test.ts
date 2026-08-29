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

  it('serializes saves in call order', async () => {
    const writtenSaveTimes: string[] = [];
    let activeWrites = 0;
    let maximumActiveWrites = 0;
    const persist = createLocalPersist('timers.json', async (_, contents) => {
      activeWrites += 1;
      maximumActiveWrites = Math.max(maximumActiveWrites, activeWrites);
      await new Promise((resolve) => setTimeout(resolve, 5));
      writtenSaveTimes.push(JSON.parse(contents).saveAt);
      activeWrites -= 1;
    });

    const saves = [
      persist.save({ saveAt: 'first', data: [] }),
      persist.save({ saveAt: 'second', data: [] }),
      persist.save({ saveAt: 'third', data: [] }),
    ];

    await persist.flush();
    await Promise.all(saves);

    expect(maximumActiveWrites).toBe(1);
    expect(writtenSaveTimes).toEqual(['first', 'second', 'third']);
  });

  it('keeps the latest state after consecutive atomic saves', async () => {
    const filename = await createTemporaryFilePath();
    const persist = createLocalPersist(filename);

    void persist.save({ saveAt: 'first', data: [] });
    void persist.save({ saveAt: 'second', data: [] });
    await persist.flush();

    await expect(persist.load()).resolves.toEqual({
      saveAt: 'second',
      data: [],
    });
  });

  it('continues queued saves after a write fails', async () => {
    let writeCount = 0;
    const persist = createLocalPersist('timers.json', async () => {
      writeCount += 1;
      if (writeCount === 1) {
        throw new Error('disk full');
      }
    });

    const failedSave = persist.save({ saveAt: 'first', data: [] });
    const recoveredSave = persist.save({ saveAt: 'second', data: [] });

    await expect(failedSave).rejects.toThrow('disk full');
    await expect(recoveredSave).resolves.toBeUndefined();
    expect(writeCount).toBe(2);
  });

  it('returns undefined when the persisted file does not exist', async () => {
    const filename = await createTemporaryFilePath();
    const persist = createLocalPersist(filename);

    await expect(persist.load()).resolves.toBeUndefined();
  });

  it('returns undefined for malformed persisted data', async () => {
    const filename = await createTemporaryFilePath();
    const persist = createLocalPersist(filename);
    await writeFile(filename, JSON.stringify({ saveAt: null, data: [] }));
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    await expect(persist.load()).resolves.toBeUndefined();
    expect(consoleError).toHaveBeenCalledOnce();
  });
});
