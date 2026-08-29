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

async function readFileIfExists(
  filename: string
): Promise<string | undefined> {
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

export function createLocalPersist(filename: string) {
  async function save(data: LocalPersistedData) {
    await fs.promises.writeFile(filename, JSON.stringify(data));
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
    load,
  };
}
