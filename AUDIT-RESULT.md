# Final Demo Audit — The Common Grounds v36

## What was tested in the build review

- Backend source/route/schema consistency
- Frontend API wiring and HR employee form wiring
- Existing automated test suite inventory
- Employee persistence regression coverage added in `backend/tests/hr-employees.test.js`
- Frontend production build configuration reviewed
- Windows one-click launcher reviewed

## Runtime limitation in the audit environment

The supplied project did not contain `node_modules`. This environment could not complete `npm ci` because package downloads did not finish, so the 31 existing integration tests plus the new HR regression test could not be executed here.

This is an environment/dependency limitation, not a claim that those tests failed because of application logic.

## New critical regression test

The new HR test verifies:

1. Create Position.
2. Load active login roles.
3. Create Employee with Position, salary, working-hours data and Employee login role.
4. Verify HTTP 201 and returned employee.
5. Re-fetch employees and verify the employee still exists.
6. Verify position, role and salary persisted.
7. Edit employee and salary.
8. Re-fetch and verify edited values persist.
9. Log in using the employee account.
10. Verify the Employee role grants expected HR self-service permissions and does not grant employee-delete permission.

## How to run the complete executable audit on Windows

Run `RUN-FULL-AUDIT.bat` from the project root. It installs exact lock-file dependencies, runs every backend test, installs frontend dependencies, and runs the Vite production build.

The integration tests use a temporary database and do not modify the real cafe database.


## Follow-up fixes in HR employee/permission test package
- Fixed employee creation transaction execution so the database INSERT actually runs before the 201 response.
- Added the missing `recipes.lock` permission to the permission catalog; Admin receives it while Cashier does not.
- Made test-server health polling use `127.0.0.1` and `/api/health` to avoid localhost startup flakiness on Windows.


## v39 follow-up fixes
- Salary pay sheet now includes Present/Absent/Leave/OT columns and totals.
- Locked payroll can be paid; unlocking is available before any payment is recorded.
- Overtime is recalculated from IN/OUT for attendance views, payroll, and employee day-close PDFs.
