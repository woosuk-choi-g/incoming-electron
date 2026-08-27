import * as fs from 'fs';
import { Timer, timerSchema } from '../shared/timer';
import z from 'zod';

export const localPersistedDataSchema = z.object({
  saveAt: z.string(),
  data: z.array(timerSchema),
})

export type LocalPersistedData = z.infer<typeof localPersistedDataSchema>;

export function createLocalPersistedData(data: Timer[]) {
  return {
    saveAt: new Date().toISOString(),
    data,
  }
}

export function createLocalPersist(filename: string) {
  async function save(data: LocalPersistedData) {
    await fs.promises.writeFile(filename, JSON.stringify(data));
  }

  async function load(): Promise<LocalPersistedData | undefined> {
    if (!await fs.promises.stat(filename)) {
      return undefined;
    }
    const json = await fs.promises.readFile(filename, 'utf-8');
    return localPersistedDataSchema.parse(JSON.parse(json));
  }

  return {
    filename,
    save,
    load,
  }
}