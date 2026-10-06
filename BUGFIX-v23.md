# v23 — Employee Save / SQLite Binding Reliability Fix

## Fixed
- Resolved the `SQLite3 can only bind numbers, strings, bigints, buffers, and null` error that could appear when saving an employee with optional form fields omitted.
- All employee INSERT parameters are normalized so JavaScript `undefined` values become SQLite `NULL` values.
- Employee creation remains transactional, including optional login creation.
- Audit logging is now best-effort after a successful employee transaction and can no longer make an already-saved employee appear to have failed to save.
- The POST `/hr/employees` endpoint continues to return the saved employee record.

## Salary / working-time behavior retained
- Working days/month can be set per employee.
- Working hours/day can be set per employee or inherited from the selected shift/default.
- Daily salary = monthly basic salary / configured working days (or actual scheduled working days when no override is supplied).
- Hourly salary = daily salary / configured working hours.
- OT rate remains a direct configured hourly rate, falling back to the calculated hourly rate when not configured.
