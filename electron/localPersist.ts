import * as fs from 'fs';
import { Timer, timerSchema } from '../shared/timer';
import z from 'zod';

export const localPersistedDataSchema = z.object({
  saveAt: z.string(),
  data: z.array(timerSchema),
});

export type LocalPersistedData = z.infer<typeof localPersistedDataSchema>;

function isNodeError(error: unknown): error is Error & { code: unknown } {
  return error instanceof Error && 'code' in error;
}

async function readFileIfExists(filename: string): Promise<string | undefined> {
  try {
    return await fs.promises.readFile(filename, 'utf-8');
  } catch (error) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      return undefined;
    }

    throw error;
  }
}

export function createLocalPersistedData(data: Timer[]) {
  return {
    saveAt: new Date().toISOString(),
    data,
  };
}

type PersistWriter = (filename: string, contents: string) => Promise<void>;

async function writeFileAtomically(filename: string, contents: string) {
  const temporaryFilename = `${filename}.tmp`;

  await fs.promises.writeFile(temporaryFilename, contents);
  await fs.promises.rename(temporaryFilename, filename);
}

export function createLocalPersist(
  filename: string,
  writePersistedFile: PersistWriter = writeFileAtomically
) {
  let saveQueue = Promise.resolve();

  function save(data: LocalPersistedData): Promise<void> {
    const contents = JSON.stringify(data);
    const saveTask = saveQueue.then(() =>
      writePersistedFile(filename, contents)
    );

    saveQueue = saveTask.catch(() => undefined);

    return saveTask;
  }

  async function flush(): Promise<void> {
    let pendingQueue: Promise<void>;

    do {
      pendingQueue = saveQueue;
      await pendingQueue;
    } while (pendingQueue !== saveQueue);
  }

  async function load(): Promise<LocalPersistedData | undefined> {
    const json = await readFileIfExists(filename);

    if (json === undefined) {
      return undefined;
    }

    try {
      return localPersistedDataSchema.parse(JSON.parse(json));
    } catch (e) {
      console.error(`타이머 목록 로드 실패: ${String(e)}`);
      return undefined;
    }
  }

  return {
    filename,
    save,
    flush,
    load,
  };
}
