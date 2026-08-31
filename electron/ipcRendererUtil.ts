import { ipcRenderer } from 'electron';
import type { IpcBroadcast, IpcFunction } from '../shared/ipcUtil';

export function invokeIpc<Args extends unknown[], Result>(
  definition: IpcFunction<Args, Result>,
  ...args: Args
): Promise<Result> {
  return ipcRenderer.invoke(definition.channel, ...args);
}

export function onBroadcast<Args extends unknown[]>(
  definition: IpcBroadcast<Args>,
  listener: (...args: Args) => void
) {
  const handler = (_event: unknown, ...args: unknown[]) => {
    listener(...(args as Args));
  };
  ipcRenderer.on(definition.channel, handler);

  return () => {
    ipcRenderer.removeListener(definition.channel, handler);
  };
}
