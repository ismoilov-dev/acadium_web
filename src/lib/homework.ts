import { now } from './date'
import type { Homework } from '@/types'

export type HomeworkState = 'active' | 'soon' | 'overdue' | 'none'

/** active → deadline in future; soon → within 24h; overdue → past; none → no deadline. */
export function homeworkState(h: Homework): HomeworkState {
  if (!h.deadline) return 'none'
  const diff = now().diff(h.deadline, 'minute')
  if (diff > 0) return 'overdue'
  if (diff > -24 * 60) return 'soon'
  return 'active'
}
