import z from 'zod';
import { reset, timerStateSchema } from './timerState';

export const timerSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1),
  duration: z.number().positive(),
  repeat: z.boolean(),
  state: timerStateSchema,
});

export type Timer = z.infer<typeof timerSchema>;

export const createTimerOptionSchema = timerSchema.pick({
  title: true,
  duration: true,
  repeat: true,
});

export type CreateTimerOption = z.infer<typeof createTimerOptionSchema>;

export const updateTimerOptionSchema = timerSchema.omit({ id: true });

export type UpdateTimerOption = z.infer<typeof updateTimerOptionSchema>;

export function createTimer(id: string, option: CreateTimerOption): Timer {
  return timerSchema.parse({
    id,
    ...option,
    state: reset(option.duration),
  });
}
