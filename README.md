# The Common Grounds — Cafe Management Software

A complete, self-hosted cafe management system: POS & billing, KOT/kitchen display,
inventory with recipe-based auto stock deduction, locked recipes, table management,
customers, suppliers, expenses, reports (with Excel/PDF export), backups, multi-user
roles, dark/light theme, and English/Urdu language toggle.

No tax/GST/VAT features are included, per spec.

Tech stack: **Node.js + Express + SQLite (better-sqlite3)** backend,
**React + Vite** frontend. Runs entirely on your own PC — no internet or
cloud subscription required.

---

## 1. Requirements

- [Node.js](https://nodejs.org) **22.x** (includes npm). The application is pinned to the Node 22 runtime for reliable native SQLite compatibility.
- That's it — SQLite is a plain file, no separate database server to install.

## 2. How this runs across multiple computers (important)

**Only ONE computer — the till PC — ever runs the actual software
(`Start-Cafe.bat`).** Every other device (a second till, a kitchen tablet, a
manager's laptop) is just a *client*: it connects to that one PC over your
Wi-Fi/network using a normal web browser. Nothing else needs to be installed
on those other devices — no Node.js, no copying the project folder, nothing.

- **On the till PC (the one and only server):** run `Start-Cafe.bat` as
  described below. Its terminal window will show two addresses:
  ```
  Local access:   http://localhost:4000
  Network access: http://192.168.x.x:4000
  ```
  Keep that window open while the cafe is operating.

- **On every other device:** copy just the single file **`Connect-To-Cafe.bat`**
  (found in this same folder) to that device — a USB stick, email, or shared
  drive is all it takes — and double-click it. The first time, it asks for
  the till PC's "Network access" address (shown above) and remembers it from
  then on, then opens the software in your browser. It never installs or
  runs anything itself; it's just a shortcut. (macOS/Linux equivalent:
  `connect-to-cafe.sh`.)

  You can also skip this file entirely and just type the Network access
  address straight into any browser on the other device, or save it as a
  browser bookmark/desktop shortcut — `Connect-To-Cafe.bat` just saves you
  from having to remember or retype the address each time.

## 3. Easiest way to run it — one click

**Windows:** double-click **`Start-Cafe.bat`** in this folder. The first time,
it will automatically install what it needs and create the database (this can
take a minute or two, depending on your internet connection, since npm needs
to download the packages once). Every time after that, it starts instantly.

**macOS/Linux:** run `./start-cafe.sh` in this folder the same way.

Keep the window it opens running while the cafe is open — closing it stops
the server. When it prints "Local access" and "Network access" addresses,
open the "Local access" one in your browser on the till PC.

That's it — skip to step 5 below. (Steps 3b/4 below are only needed if you
want to run the install/build steps manually instead of using the launcher.)

### 3b. Manual setup (optional — the launcher above does this for you)

Open a terminal (Command Prompt or PowerShell on Windows) in this folder.

```bash
# 1. Install and seed the backend
cd backend
npm install --ignore-scripts
npm run seed        # creates the database with default users & sample menu
```

(The `--ignore-scripts` flag avoids an unnecessary native compile step that
can fail on Windows PCs without Visual Studio's C++ build tools installed —
it's not needed for anything this app actually does.)

The frontend is already pre-built and included in `frontend/dist`, so you
don't need Step 2's `npm install`/`npm run build` in the frontend folder
unless you plan to modify the UI source code yourself (see "Making changes"
below).


### 4b. Full software audit (recommended before first live use)

Run `RUN-FULL-AUDIT.bat` from the project root. It installs the lock-file dependencies, runs all backend integration tests (including the HR employee persistence regression test), and builds the frontend. The tests use a temporary database and do not modify real cafe data.

The current test suite contains 32 test cases. The HR regression specifically verifies employee create → database reload → edit → reload, Position persistence, login-role assignment, salary persistence, and employee-account permissions.

## 4. Running the software (manual, if not using the launcher)

```bash
cd backend
npm start
```

You'll see:

```
Local access:   http://localhost:4000
Network access: http://192.168.x.x:4000   (use this on tablets/other PCs)
```

Open `http://localhost:4000` in a browser on the till PC. To use it from a tablet
or a second PC in the cafe, connect that device to the **same Wi-Fi/router** and
open the "Network access" address shown in the terminal — no internet needed,
this is pure local network (LAN) access, which satisfies both the offline-mode
and multi-device requirements.

Keep the terminal window open while the cafe is running — closing it stops the
server. To make it start automatically with Windows, see "Auto-start on Windows"
below.

### Default logins

| Role    | Username | Password    |
|---------|----------|-------------|
| Admin   | admin    | admin123    |
| Cashier | cashier  | cashier123  |
| Kitchen | kitchen  | kitchen123  |

**Change these passwords immediately.** These defaults are only documented
here — they are never shown on the login screen or anywhere else in the app,
so make sure each staff member knows their own username/password. Each
person can set their own password themselves (My Account, in the sidebar
after logging in) without needing to know or see anyone else's — or an admin
can set/reset anyone's password from Settings → Users & Roles.

**Creating logins for new staff:** as admin, go to **Settings → Users &
Roles → + Add New Login**. Click **🎲 Generate Password** for a strong
random password instead of inventing one, pick whichever role fits the
person (Admin / Cashier / Kitchen Staff — a short description of what each
role can access shows right under the dropdown), and save. A one-time
screen then shows the exact username and password to hand to that person —
write it down or copy it now, since the password can never be viewed again
after you close that screen (it's not stored anywhere in readable form).
They can change it themselves later from My Account whenever they like.

## 5. Day-to-day use

- **Staff access:** Admin logins see every module. Every other login gets
  its own tailored set of modules matching their actual job — not one
  generic restricted view:
  - **Cashier** — Dashboard, POS/Billing, Tables, Order Log, Day Close (their
    billing workflow: seat guests, take and pay orders, look up recent
    bills, close the till).
  - **Kitchen** — Dashboard, Kitchen Display only (they don't handle
    payments, so POS/Day Close aren't shown to them).

  This is enforced on the actual page routing, not just by hiding menu
  links — typing a restricted page's address directly redirects back to
  Dashboard. To change what any role can see, edit the `ROLE_ROUTES` map in
  `frontend/src/roleAccess.js` (one array of page paths per role) and
  rebuild the frontend.
- **POS / Billing** — start an order (dine-in + table, takeaway, or delivery), tap
  products to add them, apply a discount, hold the order to serve another table,
  split the bill, send the KOT to the kitchen, then take payment and print the
  receipt. A **Print Bill (Provisional)** button is available any time the
  cart has items — it prints a clearly-labeled "PROVISIONAL BILL — NOT A
  FINAL RECEIPT" for the customer to review (handy for takeaway/dine-in
  before they've paid), separate from the final invoice that prints once
  payment is taken. A **Cancel Order** button (admin login only) is available
  at the bottom of the cart to void an order entirely — if any items in it
  had already been sent to the kitchen, the app warns that those raw
  materials were already deducted from inventory and won't be automatically
  restored.
- **Order Log** — a full list of every order (any status) for a chosen date
  range, with a **Void** button (admin only) that works even on orders that
  were already paid and completed — voiding removes it from all sales
  reports and asks for a reason, which shows up in the Cancelled Orders
  report. This is the place to cancel an order *after* it's already been
  booked/paid, as opposed to the in-progress Cancel Order button in POS.
- **Day Close** — end-of-day cash reconciliation. Shows expected sales/cash/
  card totals for the chosen date from completed orders; enter the cash you
  physically counted and click Close Day to lock in that day's numbers and
  see the variance. A date can only be closed once (contact admin/reopen the
  database backup if a correction is truly needed). A running history for
  the current month is shown below.
- **Kitchen Display** — open this screen on a kitchen tablet/monitor; it shows
  live KOT tickets and auto-refreshes.
- **Recipes / Lock Sheet** — define what raw materials go into each product.
  Once a recipe is locked (admin only), cashiers can view it but not change it.
  Stock is deducted automatically from these recipes every time an order's KOT
  is sent.
- **Inventory** — add raw materials, do manual stock-in/purchase/wastage entries,
  and see low-stock alerts on the dashboard.
- **Expenses** — for a plain bill (rent, salary, a utility bill), just enter
  the category and amount as before. For a bill that's actually **kitchen,
  bakery, or other supplies** you bought, switch to **Inventory Item
  Purchase** in the Add Expense screen instead: add each item (picking an
  existing Inventory item, or typing a new one if it isn't in Inventory
  yet), its quantity, and cost per unit. Saving it does two things at once:
  records the spend, and automatically adds that quantity into Inventory
  stock — so you never have to enter the same purchase twice. The total
  amount is calculated for you from the items. One accounting detail worth
  knowing: these item-based expenses are intentionally **left out of the
  "Total Expenses" figure in the Sale vs Expense Profit report** (though
  they still show fully in the plain Expense Report for your own
  bill-tracking) — that's because the cost of an ingredient is already
  counted correctly in that profit report at the moment it's actually used
  in a sale (as Cost of Goods Sold); counting it again when you buy it would
  overstate your costs.
- **Reports** — Daily Sale, Monthly Sale (with a graph), **Profit by Category**
  (group your menu into departments like Kitchen / Cold Bar / Bakery and see
  each one's sales, cost, and gross profit side by side), **Profit by
  Product** (same breakdown per menu item), Expense, overall Sale vs Expense
  Profit, **Closing Inventory Stock (Audit)** — a full reconciliation per raw
  material showing Opening → Stock In → Used in Sales → Wastage → Stock Out
  → Adjustments → Expected Closing vs. Actual Closing, with any variance
  called out so a manager can audit whether the physical stock actually
  matches what the system expects — Top Selling Items, and **Cancelled
  Orders** (who cancelled what, when, and why). Every date-range report has
  quick **Today** / **This Month** buttons for daily vs monthly views, plus
  one-click **Excel** and **PDF** export.
  - To use category profit for your own departments: go to **Menu & Products
    → Categories** and rename/add categories to match how you organize your
    menu (e.g. "Kitchen", "Cold Bar", "Bakery") — the report picks up
    whatever categories your products are assigned to automatically.
- **Settings → Backup & Restore** — download a full backup of the database with
  one click. To restore, upload a previously downloaded `.db` file (a safety
  copy of your current data is kept automatically before restoring).

## 6. Printing: two separate receipts

There are two different printable slips, both styled for an 80mm thermal
printer, and they show deliberately different information:

- **Customer Receipt** — prices, totals, discount, and payment method. Prints
  automatically-offered after completing payment (**Print Receipt** button),
  or anytime before payment via **Print Bill (Provisional)** in the cart —
  clearly labeled "PROVISIONAL BILL" so it's obviously not the final receipt.
- **Kitchen Ticket** — items and quantities only, **no prices or money shown
  at all** — exactly what the kitchen needs to prepare the order and nothing
  else. This opens automatically whenever you click **Send KOT**, and also
  automatically if a payment is taken before KOT was ever explicitly sent
  (nothing is ever missed).

Click **Print** in whichever slip's window, and select your thermal printer
(most 80mm USB/Bluetooth thermal printers install as a normal Windows
printer). If your printer is 58mm, edit the `@page` width in
`frontend/src/components/Receipt.jsx` and `KitchenTicket.jsx` from `80mm` to
`58mm` and rebuild (`npm run build` in `/frontend`).

## 7. Backing up

**Automatic, no action needed:** the software saves a backup of the database
once when it starts up, and then once every 24 hours after that, into
`backend/data/auto-backups/`. The most recent 30 are kept; older ones are
pruned automatically. You can see this running for yourself in **Settings →
Backup & Restore**.

**Manual backup:** the same screen has a **Download Backup** button for
taking a copy right now (e.g. before trying something risky). The live
database file itself always lives at:

```
backend/data/cafe.db
```

You can also just copy this file elsewhere (e.g. a USB drive or cloud folder)
while the app is stopped.

## 8. Auto-start on Windows (optional)

To avoid opening a terminal every morning, install [PM2](https://pm2.keymetrics.io/)
or create a `.bat` file with:

```bat
cd /d C:\path\to\cafe-management\backend
node server.js
```

...and place a shortcut to it in your Windows Startup folder
(`shell:startup` in the Run dialog).

## 9. Security & auditability

- **Unique login security per install.** The secret used to sign login
  sessions is randomly generated the first time the server starts and saved
  to `backend/data/.jwt-secret` — it's unique to your install, not a shared
  hardcoded value, and never leaves this PC.
- **Brute-force login protection.** After 20 failed login attempts within 15
  minutes (from the same device), further attempts are blocked for a while
  — including with the correct password, so it can't be worked around once
  triggered. This is set generously enough that it won't get in the way of
  a busy multi-staff shift, while still shutting down any real password-guessing attempt.
- **Standard web security headers** (via [helmet](https://helmetjs.github.io/))
  are applied to every response.
- **Activity Log** (Settings → Activity Log, admin only) — a real audit
  trail: every login, password change, recipe lock/unlock, order
  cancellation/void, day close, login creation or role change, and backup/restore
  is recorded with who did it and when, filterable by date range and action
  type. This was previously being recorded in the database with no way to
  actually view it — now there's a proper screen for it.
- **Automated test suite** ships with the code (`backend/tests/`, run with
  `npm test` inside `/backend`) — 33 tests covering the core order/KOT/stock and HR/payroll persistence
  flow, recipe lock enforcement, role permissions, report accuracy (checked
  against manual arithmetic, not just "did it return 200"), day close,
  go-live, and the rate limiter itself. This means future changes to the
  code can be verified automatically instead of relying on manual clicking
  through the app.
- **Known limitation, documented honestly:** one transitive dependency
  (`exceljs`, used for Excel report export, via its own `uuid` dependency)
  has an unpatched moderate-severity advisory as of this writing. We're
  already on the latest version of exceljs — there's currently no newer
  release that fixes it, and npm's suggested "fix" would downgrade exceljs
  to a much older, more broken version, which is worse. It isn't exposed to
  any user-controllable input in this app. Worth revisiting if exceljs
  ships a fix later — check with `npm audit` inside `/backend`.
- **This app is built for a private local network (LAN), not the public
  internet.** It doesn't have HTTPS/TLS, so don't expose it directly to the
  internet (e.g. via port forwarding) without putting a proper reverse proxy
  with TLS in front of it first.


## 10. Secure access from outside the cafe network

The application can be deployed for secure Internet access without changing the existing POS, HR, payroll, salary payment, expense, or reporting workflows. The recommended production layout is:

```
Internet → HTTPS (Caddy) → Node.js application → persistent SQLite database
```

See `deploy/README.md` for the production Docker/VPS deployment. Caddy automatically
handles HTTPS certificates. If you want to keep the server on the existing Windows
pc, see `deploy/cloudflare/README.md` for the safer Cloudflare Tunnel approach; do
not expose/port-forward TCP 4000 directly to the public Internet.

The existing local/LAN `Start-Cafe.bat` workflow remains available.

## 11. Going live (clearing the sample/demo data)

The software ships with a sample menu (Cappuccino, Latte, a sandwich, sample
raw materials, and example recipes) so you can click around and see how
everything works before committing to real data. When you're ready to
actually run your cafe on it, go to **Settings → Go Live** (admin login) —
it shows exactly what will be cleared and what's kept, then requires you to
type `RESET` to confirm. This wipes the sample menu, inventory, recipes, and
any test orders/purchases/expenses, but **keeps your staff logins, branding,
theme, and any real customers/suppliers you've already added.** Take a
backup first (Settings → Backup & Restore) if you'd like to keep the sample
data around for reference — this action cannot be undone otherwise.

## 12. Project structure

```
cafe-management/
  backend/          Express API + SQLite database
    db/             schema.sql, db bootstrap, seed script
    routes/         one file per feature area
    server.js        entrypoint — also serves the built frontend
  frontend/         React + Vite app (source in src/, builds to dist/)
  ARCHITECTURE.md    full architecture + ER diagram description + screen list
```

## 13. Updating the menu, prices, users, etc.

Everything is manageable from the UI once logged in as admin — no code changes
needed for day-to-day cafe operations (adding products, recipes, raw materials,
users, tables, suppliers, etc). Code changes are only needed if you want to
change the receipt paper size, add a new report type, or customize styling
beyond what Settings → Branding offers.

## 14. Making UI code changes (optional, for developers)

The app ships with the frontend already built (`frontend/dist`), so normal
day-to-day running never touches the frontend source. If you (or a developer
you hire later) want to change the UI code in `frontend/src`:

```bash
cd frontend
npm install
npm run build     # rebuilds frontend/dist — restart the backend afterward
```

## 15. HR & Payroll (Additive Module)

The HR & Payroll module is included as a separate admin-only module. It adds employee master data, attendance, employee advances/recovery, and monthly payroll generation/finalization/payment. Existing POS, menu, recipes, inventory, orders, suppliers, expenses, reports, settings and day-close modules are retained unchanged.

Payroll uses the employee basic salary plus overtime, with deductions for recorded absences/half-days and open employee advances. Advance balances are recovered when payroll is marked paid.

## 16. HR, Attendance & Payroll update

The HR module now uses configurable employee shifts/working hours, IN/OUT attendance, automatic regular/OT calculations, overtime rules, leave records, monthly attendance processing, individual and all-employee payroll generation, payroll approval/lock/payment states, salary-slip PDFs, Excel/PDF HR reports, and employee-specific salary/working-hour overrides. Payroll calculations are stored as finalized snapshots and therefore do not change merely because later attendance is edited.

HR access is permission-driven. Employees with self-service permissions can read their own attendance/salary-slip information; they cannot edit their own attendance or payroll.


## 17. HR Command Center upgrade
The HR workspace now uses a People Operations command-center layout with attendance readiness KPIs, exception visibility, monthly payroll flow, self-service IN/OUT clocking for linked employee accounts, and a warmer cafe-inspired theme. Attendance processing can populate missing working-day records for active employees and approved leave.

## 18. Windows / Node 22 dependency note
The backend uses the better-sqlite3 12.11.1 line for a more reliable Windows Node.js 22 installation path. Start-Cafe.bat validates the actual SQLite binding before launching the application.
