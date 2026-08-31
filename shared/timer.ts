import z from 'zod';
import { timerStateSchema } from './timerState';

export const baseTimerSchema = z.object({
  title: z.string().trim().min(1),
  duration: z.number().positive(),
  repeat: z.boolean(),
  state: timerStateSchema,
});

export type BaseTimer = z.infer<typeof baseTimerSchema>;

export const timerSchema = baseTimerSchema.extend({
  id: z.string().min(1),
});

export type Timer = z.infer<typeof timerSchema>;

export function createTimer(id: string, option: BaseTimer): Timer {
  return timerSchema.parse({
    ...option,
    id,
  });
}
