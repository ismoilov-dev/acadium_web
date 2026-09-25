# Backend TODO (Go API)

Gaps hit while building the web panel. The UI is already wired so each item is a small frontend change once the endpoint exists.

## 1. Login creates a new pending request on every call — **high**

`POST /api/v1/auth/login` with an untrusted `device_id` returns a **new** `request_id` each time.
Retrying login (or polling) floods the trusted device with duplicate requests.

- Reuse the existing `PENDING` request for the same `(user_id, device_id)` and return its `request_id`.
- Add a status endpoint so the web can poll safely:
  ```
  GET /api/v1/auth/device-requests/{request_id}/status?device_id=<id>   (no auth)
  → { "status": "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED", "token"?: "<jwt when APPROVED>" }
  ```
  Frontend: `LoginPage` then polls every 3–5 s instead of the manual "Tasdiqladim — kirish" button.
- Optionally expire pending requests after ~10 min.

## 2. Assign a teacher to a group

`CreateGroupRequest` has no teacher field; the form shows a disabled "O‘qituvchi — Tez orada" select.

```
POST/PATCH /api/v1/groups[/{id}]   + "teacher_id": "uuid"
GET  /api/v1/groups[/{id}]         → include "teacher_id", "teacher": { "id", "first_name", "last_name" }, "student_count"
```

## 3. List grades

There is no way to read existing grades for a group/homework (only `GET /grades/{id}`). The gradebook caches ids it created in localStorage as a stop-gap.

```
GET /api/v1/grades?group_id=&homework_id=&student_id=&limit=&offset=
→ [{ "id", "student_id", "student_name", "homework_id", "homework_title", "score", "comment", "created_at", "created_by" }]
```

Also: return `grades` and `attendance` arrays in `GET /api/v1/students/{id}` (the student drawer already renders them if present).

## 4. Manual attendance marking (teacher)

Attendance is read-only today (geofence check-in only).

```
POST /api/v1/attendance            { "student_id", "group_id", "date": "YYYY-MM-DD", "status": "PRESENT|LATE|ABSENT" }
PATCH /api/v1/attendance/{id}      { "status" }
GET  /api/v1/teacher/attendance?date=YYYY-MM-DD&group_id=   → confirm these filters; include ABSENT rows (students with no check-in)
```

## 5. Delete / deactivate people

No endpoint to remove a student, teacher or parent from the center (the UI hides the action).

```
DELETE /api/v1/students/{id}
DELETE /api/v1/teachers/{id}
DELETE /api/v1/centers/me/members/{user_id}     (or PATCH …/status { "status": "INACTIVE" })
```

## 6. Parent ↔ student links

`GET /centers/me/members` doesn't expose which children a parent has; there's no way to change links after creation.

```
GET   /api/v1/parents                 → [{ "id", "first_name", "last_name", "phone", "children": [{ "id", "first_name", "last_name", "group_name" }] }]
PUT   /api/v1/parents/{id}/children   { "student_ids": [] }
GET   /api/v1/students/{id}           → include "parents": [...]
```

## 7. Homework submissions

No submissions model — grading is per student + optional `homework_id`.

```
GET  /api/v1/homework/{id}/submissions → [{ "student_id", "submitted_at", "text", "file_url", "grade_id" }]
POST /api/v1/student/homework/{id}/submit (mobile)
```

## 8. Homework list filtering

Confirm `GET /api/v1/homework?group_id=` is supported (the web sends it and also filters client-side). Add `?status=active|overdue` and pagination if lists grow.

## 9. Payments ("To‘lovlar va qarzdorlik")

Placeholder page only.

```
GET  /api/v1/payments?student_id=&month=YYYY-MM
POST /api/v1/payments        { "student_id", "amount", "paid_at", "method", "comment" }
GET  /api/v1/payments/debts  → [{ "student_id", "student_name", "group_name", "amount_due", "months" }]
PATCH /api/v1/groups/{id}    + "monthly_fee": 0
```

## 10. File uploads

`file_url`, `logo_url`, `avatar_url` are plain URL inputs.

```
POST /api/v1/uploads  multipart/form-data { file } → { "url" }
```

## 11. Pagination & search

`/students`, `/teachers`, `/centers/me/members`, `/homework`, `/notifications` return everything; the web paginates client-side.
Add `?search=&limit=&offset=` and return `{ items, total }`.

## 12. Response schemas in Swagger

Most `200` responses have no schema. Please add response models (`User`, `Student`, `Group`, `Homework`, `Grade`, `Attendance`, `Debate`, `Notification`, `Device`, `DeviceRequest`, `TeacherDashboard`) so the frontend types can be generated instead of parsed defensively.

## 13. Arena

- `GET /api/v1/arena/debates/{id}/messages?limit=50` — chat history (the socket only streams new messages).
- A moderator action over WS, e.g. `{"type":"DELETE","message_id"}` / `{"type":"END"}`.

## 14. Teacher access to center info

`GET /centers/me` is admin-only in practice; teachers need at least the center `name` / `logo_url` for the topbar (e.g. include `center` in `/auth/me`).

## CORS

Currently `Access-Control-Allow-Origin: *` with `Content-Type, Authorization` — works as-is. For production, restrict to the panel origins (`https://<panel>.netlify.app`, `http://localhost:5173`) and keep methods `GET, POST, PATCH, DELETE, OPTIONS`.
