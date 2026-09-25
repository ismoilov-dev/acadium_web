import type { Grade } from '@/types'

/**
 * The API has no "list grades by group/homework" endpoint yet (see BACKEND_TODO.md),
 * so grade ids returned by POST /grades are remembered per browser. This lets the
 * gradebook show and PATCH grades it created earlier instead of creating duplicates.
 */
const KEY = 'acadium.grades.v1'

export interface CachedGrade {
  id: string
  score: number
  comment?: string
  at: string
}

type Store = Record<string, CachedGrade>

export const gradeKey = (studentId: string, homeworkId?: string) =>
  `${studentId}|${homeworkId ?? 'general'}`

function read(): Store {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Store) : {}
  } catch {
    return {}
  }
}

function write(s: Store) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch {
    /* storage full / blocked — grades still saved server-side */
  }
}

export const gradeCache = {
  get(studentId: string, homeworkId?: string): CachedGrade | undefined {
    return read()[gradeKey(studentId, homeworkId)]
  },
  put(
    studentId: string,
    homeworkId: string | undefined,
    g: Pick<Grade, 'id' | 'score' | 'comment'>,
  ) {
    const s = read()
    s[gradeKey(studentId, homeworkId)] = {
      id: g.id,
      score: g.score,
      comment: g.comment,
      at: new Date().toISOString(),
    }
    write(s)
  },
}
