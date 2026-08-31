import { BrowserWindow, ipcMain, type IpcMainInvokeEvent } from 'electron';
import type { IpcBroadcast, IpcFunction } from '../shared/ipcUtil';

export function handleIpc<Args extends unknown[], Result>(
  definition: IpcFunction<Args, Result>,
  handler: (
    event: IpcMainInvokeEvent,
    ...args: Args
  ) => Result | Promise<Result>
): void {
  ipcMain.handle(definition.channel, handler);
}

export function broadcast<Args extends unknown[]>(
  definition: IpcBroadcast<Args>,
  ...args: Args
) {
  BrowserWindow.getAllWindows().forEach((win) => {
    win.webContents.send(definition.channel, ...args);
  });
}
