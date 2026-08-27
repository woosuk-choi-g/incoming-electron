import { timerStateSchema } from './timerState';
import z from 'zod';

export const timerSchema = z.object({
  id: z.string(),
  title: z.string(),
  state: timerStateSchema,
});

export type Timer = z.infer<typeof timerSchema>;

export const createTimerOptionSchema = z.object({
  title: z.string(),
  state: timerStateSchema,
});

export type CreateTimerOption = z.infer<typeof createTimerOptionSchema>;
