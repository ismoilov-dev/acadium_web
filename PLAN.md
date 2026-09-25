# Acadium Web Panel — plan

Web panel for **CENTER_ADMIN** and **TEACHER**. STUDENT / PARENT get a "use the mobile app" screen.

## Routes

| Route                        | Page                                                                                                           | Roles                                 | API                                                                                                                  |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `/login`                     | Phone login + device-approval state                                                                            | public                                | `POST /auth/login`                                                                                                   |
| `/dashboard`                 | Admin: KPIs, today's attendance card, recent homework/grades · Teacher: today's lessons, deadlines, attendance | A, T                                  | `/teachers`, `/students`, `/centers/me/members`, `/groups`, `/homework`, `/teacher/attendance`, `/teacher/dashboard` |
| `/students` (`?id=` drawer)  | Table, search, group filter, add, edit, change group, grades/attendance/parents tabs                           | A                                     | `GET /students`, `GET/PATCH /students/{id}`, `PATCH /students/{id}/group`, `POST /centers/me/students`               |
| `/teachers` (`?id=` drawer)  | Table, add, edit (spec/avatar), groups                                                                         | A                                     | `GET /teachers`, `GET/PATCH /teachers/{id}`, `POST /centers/me/teachers`                                             |
| `/parents`                   | Members filtered by PARENT, add with children multi-select                                                     | A                                     | `GET /centers/me/members`, `POST /centers/me/parents`                                                                |
| `/groups`, `/groups/:id`     | Cards; create/edit/delete (admin); detail: students (add new / move existing), homework, week strip            | A (T read-only via `/teacher/groups`) | `/groups*`, `/teacher/groups`                                                                                        |
| `/schedule`                  | Week calendar from `days_of_week` + times; mobile agenda                                                       | A, T                                  | `/groups` or `/teacher/groups`                                                                                       |
| `/attendance`                | Date + group + status filters, Kelgan/Kechikkan/Kelmagan, per-group present/total                              | A, T                                  | `GET /teacher/attendance`                                                                                            |
| `/homework`, `/homework/:id` | List with group + active/overdue filters, create/edit/delete, detail with embedded gradebook                   | A, T                                  | `/homework*`                                                                                                         |
| `/grades`                    | Gradebook grid: group → homework (optional) → score/comment per student, Save all                              | A, T                                  | `POST /grades`, `PATCH /grades/{id}`                                                                                 |
| `/arena`, `/arena/:id`       | Debates list/create, live chat (moderator)                                                                     | A, T                                  | `/arena/debates*`, `wss /ws/arena/{id}`                                                                              |
| `/settings`                  | Center profile + Leaflet map picker with geofence circle                                                       | A                                     | `GET/PATCH /centers/me`                                                                                              |
| `/payments`                  | Placeholder ("Tez orada")                                                                                      | A                                     | —                                                                                                                    |
| `/profile` (`?tab=devices`)  | Me, trusted devices (revoke), pending device requests (approve/reject)                                         | A, T                                  | `/auth/me`, `/auth/devices*`, `/auth/device-requests*`                                                               |

Global: topbar with center name, UZ/RU/EN switcher, notification bell (`GET /notifications`, `wss /ws/notifications`, read / read-all), user menu (profile, devices, dark mode, logout).

## Architecture

```
src/
  api/          client.ts (envelope unwrap, 401 → refresh once → logout), parsers.ts, one module per resource
  hooks/        TanStack Query hooks + useApiMutation (invalidate + toast)
  types/        domain types
  features/     auth, dashboard, students, teachers, parents, groups, schedule, attendance,
                homework, grades, arena, settings, notifications, profile, payments
  components/   ui (shadcn-style on Radix), layout, shared (DataTable, StatCard, States, ConfirmDialog,
                PhoneInput, WeekdayPicker, GroupSelect, StudentMultiSelect, Field, StatusBadge)
  lib/          ws (reconnect w/ backoff), device id, phone, date (Asia/Tashkent), normalize, gradeCache, attendance, roles
  i18n/         uz.json (default), ru.json, en.json
```

### Response parsing

The spec documents request bodies but not most responses. `api/parsers.ts` reads every entity
tolerantly (flat `first_name` or nested `user.first_name`, `null` slices → `[]`, list wrapped in
`{items|students|groups…}` or bare arrays). When the live shapes are confirmed, the parsers are
the single place to tighten.

### Decisions

- **Login polling removed**: every `POST /auth/login` from an untrusted device creates a new pending request, so the waiting screen retries only when the user presses "Tasdiqladim — kirish".
- **Grades**: no list endpoint → grade ids from `POST /grades` are cached in `localStorage` (`lib/gradeCache.ts`) so re-grading the same homework PATCHes instead of duplicating. Server-side `student.grades` (if the API includes them) take priority.
- **Absent count**: the attendance feed only has check-ins, so "Kelmagan" = students of groups scheduled that weekday − present − late (labelled as derived in the UI).
- **Chart**: single-series 7-day "attended" bars in the brand gradient (as on the landing). Status red/amber fail the normal-vision colour separation check, so the breakdown lives in the tooltip instead of a 3-colour stack.
- **CORS**: the API returns `Access-Control-Allow-Origin: *`, so no dev proxy is needed.

## Known backend gaps

See `BACKEND_TODO.md`.
