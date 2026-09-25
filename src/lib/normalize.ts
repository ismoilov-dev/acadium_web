/**
 * Tolerant readers for API payloads. The OpenAPI spec documents request bodies only,
 * so responses are parsed defensively: flat (`first_name`) and nested (`user.first_name`)
 * shapes are both accepted, and Go's `null` slices become `[]`.
 */
export type Rec = Record<string, unknown>

export function isRec(v: unknown): v is Rec {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

export function rec(v: unknown): Rec {
  return isRec(v) ? v : {}
}

/** Looks a key up on the object, then on common nested holders (user, profile, …). */
function lookup(o: Rec, key: string, nests: string[]): unknown {
  if (o[key] !== undefined && o[key] !== null) return o[key]
  for (const n of nests) {
    const inner = o[n]
    if (isRec(inner) && inner[key] !== undefined && inner[key] !== null) return inner[key]
  }
  return undefined
}

const NESTS = ['user', 'profile', 'student', 'teacher', 'parent']

export function str(o: Rec, keys: string | string[], nests: string[] = NESTS): string | undefined {
  for (const k of Array.isArray(keys) ? keys : [keys]) {
    const v = lookup(o, k, nests)
    if (typeof v === 'string') return v
    if (typeof v === 'number') return String(v)
  }
  return undefined
}

export function num(o: Rec, keys: string | string[], nests: string[] = NESTS): number | undefined {
  for (const k of Array.isArray(keys) ? keys : [keys]) {
    const v = lookup(o, k, nests)
    if (typeof v === 'number' && Number.isFinite(v)) return v
    if (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v))) return Number(v)
  }
  return undefined
}

export function bool(o: Rec, keys: string | string[]): boolean | undefined {
  for (const k of Array.isArray(keys) ? keys : [keys]) {
    const v = o[k]
    if (typeof v === 'boolean') return v
  }
  return undefined
}

const LIST_KEYS = [
  'items',
  'data',
  'results',
  'list',
  'students',
  'teachers',
  'parents',
  'groups',
  'homework',
  'homeworks',
  'members',
  'debates',
  'notifications',
  'devices',
  'requests',
  'grades',
  'children',
]

export function list(v: unknown, keys: string[] = LIST_KEYS): unknown[] {
  if (Array.isArray(v)) return v
  if (isRec(v)) {
    for (const k of keys) if (Array.isArray(v[k])) return v[k] as unknown[]
  }
  return []
}

export function arrOf(o: Rec, keys: string | string[]): unknown[] {
  for (const k of Array.isArray(keys) ? keys : [keys]) {
    if (Array.isArray(o[k])) return o[k] as unknown[]
  }
  return []
}

export function numArr(o: Rec, key: string): number[] {
  const v = o[key]
  if (Array.isArray(v)) return v.map(Number).filter((n) => Number.isFinite(n))
  // Postgres int[] may leak as "{1,3,5}"
  if (typeof v === 'string')
    return v
      .replace(/[{}[\]]/g, '')
      .split(',')
      .map(Number)
      .filter((n) => Number.isFinite(n) && n > 0)
  return []
}

export function strArr(o: Rec, key: string): string[] {
  const v = o[key]
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []
}
