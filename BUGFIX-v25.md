# v25 — Definitive Employee Save Binding Fix

The recurring SQLite binding error is addressed at both sides of the employee-save boundary.

- Frontend strips `_roles` (UI-only state) before POST/PUT.
- Backend normalizes every employee value to an actual SQLite scalar.
- Empty optional text values become NULL.
- Optional numeric IDs/overrides become NULL instead of empty/undefined values.
- IDs returned by SQLite are explicitly converted to Number before subsequent binds.
- Login role and employee-role inserts use numeric IDs.
- Automatic salary calculation remains based on configured working days/month and working hours/day.
- Shift and weekly-off settings remain available and continue to drive the automatic calculation when overrides are blank.
