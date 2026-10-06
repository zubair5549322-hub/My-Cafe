# v24 — Employee Save / SQLite Binding Hardening

Fixes the recurring `SQLite3 can only bind numbers, strings, bigints, buffers, and null` error during employee creation.

- Employee POST now normalizes every final SQLite parameter, not only undefined values.
- Booleans become 0/1; NaN/Infinity become NULL; accidental objects are JSON encoded.
- Added a final supported-type assertion with the employee field name for diagnostics.
- Existing employee save, optional login, salary calculations, working days/month and working hours/day behavior preserved.
