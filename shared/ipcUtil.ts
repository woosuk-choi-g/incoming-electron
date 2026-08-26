export interface IpcFunction<
  Args extends unknown[],
  Result
> {
  channel: string;
  __args?: Args;
  __result?: Result;
}

export function defineIpcFunction<
  Args extends unknown[],
  Result
>(channel: string): IpcFunction<Args, Result> {
  return { channel };
}