import { ipcMain, type IpcMainInvokeEvent } from 'electron';
import type { IpcFunction } from '../shared/ipcUtil';

export function handleIpc<Args extends unknown[], Result>(
  definition: IpcFunction<Args, Result>,
  handler: (
    event: IpcMainInvokeEvent,
    ...args: Args
  ) => Result | Promise<Result>
): void {
  ipcMain.handle(definition.channel, handler);
}
