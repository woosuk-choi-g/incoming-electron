// electron/invokeIpc.ts
import { ipcRenderer } from 'electron';
import type { IpcFunction } from '../shared/ipcUtil';

export function invokeIpc<Args extends unknown[], Result>(
  definition: IpcFunction<Args, Result>,
  ...args: Args
): Promise<Result> {
  return ipcRenderer.invoke(definition.channel, ...args);
}
