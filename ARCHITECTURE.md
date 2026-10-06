# Architecture — The Common Grounds Cafe Management Software

## 1. System Overview

```
 ┌─────────────────────────────┐        ┌───────────────────────────────┐
 │   Browser (till PC/tablet)   │◄──────►│   Node.js + Express (backend)  │
 │   React SPA (Vite build)     │  HTTP   │   /api/*  REST endpoints       │
 │   served as static files     │ (LAN)   │   JWT auth, role middleware    │
 └─────────────────────────────┘        │   better-sqlite3 (sync driver) │
                                          └───────────────┬─────────────────┘
                                                           │
                                                  ┌────────▼────────┐
                                                  │  cafe.db (SQLite)│
                                                  │  single file,     │
                                                  │  WAL journal mode │
                                                  └───────────────────┘
```

- **Single process, single file database.** Everything the cafe needs runs from
  one `node server.js` process and one SQLite file. This is what makes
  **Offline Mode** (feature 13) trivial: there is no cloud dependency to lose
  connection to. The "sync later" requirement from the original spec is
  satisfied differently and more reliably for a single-till cafe: the server
  *is* the source of truth on the local network, so every device just talks to
  it directly over Wi-Fi — there's nothing to reconcile after the fact. If the
  cafe later opens a second branch and wants cross-branch cloud sync, that's a
  separate, larger project (replacing SQLite with a syncing store) — noted as
  a "Phase 2" idea below.
- **Multi-device (feature 14):** any device on the same Wi-Fi network opens
  `http://<till-pc-ip>:4000` in a browser. No installation needed on tablets.
- **Why better-sqlite3 over a client/server DB (MySQL etc.):** zero
  configuration, zero separate service to keep running, synchronous API (no
  race conditions from async transactions), and it's genuinely fast enough for
  a single-cafe workload (thousands, not millions, of rows).

## 2. Backend module map

| Module | File | Responsibility |
|---|---|---|
| Auth | `routes/auth.js`, `middleware/auth.js` | Login, JWT issuing, role guard (`admin`/`cashier`/`kitchen`), user management |
| Menu | `routes/products.js` | Categories, products, variants, add-ons |
| Recipes | `routes/recipes.js` | Recipe CRUD, lock/unlock (admin-only once locked), cost roll-up |
| Inventory | `routes/inventory.js` | Raw materials, stock ledger, manual stock entries, low-stock queries |
| POS/Orders | `routes/orders.js` | Order lifecycle: create → add items → discount → KOT (stock deduction) → hold/resume → split → complete/pay |
| Tables | `routes/tables.js` | Floor plan CRUD, table merge/unmerge |
| Customers | `routes/customers.js` | CRM + loyalty points (auto-accrued on completed orders) |
| Suppliers | `routes/suppliers.js` | Suppliers, purchase entries (auto stock-in), due payments |
| Expenses | `routes/expenses.js` | Operating expense log |
| Reports | `routes/reports.js` | Daily/monthly sales, expenses, overall profit, **category-wise profit** (Kitchen/Cold Bar/Bakery etc.), **product-wise profit**, closing stock, top-selling + Excel (ExcelJS) + PDF (PDFKit) export + dashboard |
| Settings | `routes/settings.js` | Branding, theme, language, currency symbol |
| Backup | `routes/backup.js` | Download/restore the live `.db` file |
| HR & Payroll | `routes/hr.js` | Admin-only employee master, attendance, advances/recovery, monthly payroll |

## 3. Data flow: the core POS → KOT → Inventory loop

This is the heart of the system, and the part most cafe software gets wrong,
so it's worth spelling out:

1. Cashier creates an order (`POST /orders`) — optionally tied to a table.
2. Cashier adds items (`POST /orders/:id/items`) — these sit as `kot_status:
   'pending'`. Nothing is deducted from stock yet, because the order might
   still be edited (feature: staff can freely change qty/remove items while
   pending).
3. Cashier taps **Send KOT** (`POST /orders/:id/kot`). For every pending item,
   the server:
   - looks up the product's **locked/unlocked recipe**,
   - multiplies each raw-material quantity by the item's qty,
   - deducts it from `raw_materials.current_stock`,
   - writes an immutable row to `stock_transactions` (type `sale`) for
     full auditability,
   - flips the item to `kot_status: 'sent'` and `stock_deducted: 1` (so it can
     never be double-deducted, and can no longer be silently deleted from the
     cart — only an admin can cancel the whole order at that point).
4. The Kitchen Display polls `/kitchen/queue` and shows the ticket; kitchen
   staff mark it `preparing` → `ready`.
5. Cashier takes payment (`PUT /orders/:id/complete`). Any items that were
   *never* sent to the kitchen (e.g. a takeaway coffee that's rung up and paid
   instantly) are auto-KOT'd and stock-deducted at this point too, so nothing
   ever leaves the cafe without being deducted from inventory.
6. Loyalty points accrue, the table frees up if no other open order references
   it, and the invoice becomes printable.

Because deduction is driven by the recipe (not a hardcoded per-product number),
changing a recipe automatically changes future deductions — and locking a
recipe (feature 3) prevents a well-meaning but careless staff member from
quietly changing "18g coffee" to "10g coffee" to save money, which would
silently corrupt every future stock report.

## 4. Database schema (entity summary)

See `backend/db/schema.sql` for the full, commented SQL. Entity relationships:

```
users ──< orders ──< order_items >── products ──< variants
                │                        │
                │                        └──< recipes ──< recipe_items >── raw_materials
                │                                                              ▲
                ├──< order_splits                                              │
                │                                                     stock_transactions
floor_tables ──<┘                                                              ▲
                                                                                 │
customers ──< orders                                              purchases ──<┘
                                                                       │
suppliers ──<──────────────────────────────────────────────────────< purchase_items

expenses (standalone ledger)
settings (key/value: branding, theme, language)
HR/payroll: employees ──< attendance / advances; payroll_periods ──< payroll_entries >── employees
activity_log (audit trail: logins, recipe lock/unlock)
```

Key design choices:
- `order_items.product_name` and `.rate` are **snapshotted** at sale time, so
  changing a product's price later never rewrites historical invoices.
- `stock_transactions` is append-only — `raw_materials.current_stock` is a
  running total that's always derivable by summing the ledger, which makes
  audits and "what happened to my stock" questions answerable.
- No tax/GST/VAT column exists anywhere in the schema, per the requirement.

## 5. Frontend architecture

React + Vite SPA (`frontend/src`), talking to the backend purely over
`/api/*` (proxied to `:4000` in dev, same-origin in production since the
backend serves the built `dist/` folder directly — one process, one port).

- `context.jsx` — holds the logged-in user (JWT in `localStorage`) and global
  settings (cafe branding, theme, language), applied via `data-theme` /
  `data-lang` attributes on `<html>` so `theme.css` can react to them with
  plain CSS variables (no CSS-in-JS runtime needed).
- `theme.css` — a small design system (buttons, cards, tables, modals, POS
  grid, floor plan, KOT tickets, thermal receipt) styled around a warm
  coffee-brown/gold palette in both light and dark variants, plus a Noto
  Nastaliq Urdu font loaded for the Urdu toggle.
- Each feature area is one page under `src/pages/`, matching the sidebar.
- `components/Receipt.jsx` is a print-only styled 80mm thermal invoice
  template with cafe logo/name/tagline, order/table/customer info, itemized
  lines (with add-ons), discount, total, and payment breakdown.

## 6. Roles & permissions (feature 7)

Enforced **server-side** (never trust the client) via `allowRoles(...)` on
each route:

| Action | Admin | Cashier | Kitchen |
|---|---|---|---|
| POS billing, discounts, payments | ✅ | ✅ | ❌ |
| Edit an **unlocked** recipe | ✅ | ✅ | ❌ |
| Edit a **locked** recipe / lock-unlock | ✅ | ❌ | ❌ |
| Delete products/customers/raw materials | ✅ | ❌ | ❌ |
| Cancel/void an order | ✅ | ❌ | ❌ |
| Manage users, view Settings | ✅ | ❌ | ❌ |
| Kitchen display (view + update ticket status) | ✅ | ✅ | ✅ |
| Backup / restore database | ✅ | ❌ | ❌ |

## 7. Sample UI screens

1. **Login** — cafe logo, name & tagline, username/password.
2. **Dashboard** — today's sale, today's profit, orders count, occupied
   tables, low-stock list, top 5 products — one screen, no scrolling needed
   on a normal laptop display.
3. **POS** — left: category pills + product tile grid (image, name, price);
   right: live cart with qty steppers, discount button, Hold / Split / Send
   KOT / Pay buttons. Variant/add-on picker opens as a modal when a product
   has options.
4. **Kitchen Display** — a wall of ticket cards, grouped by order, auto
   refreshing, with Start/Ready buttons per line item.
5. **Menu & Products** — tabbed: Products (table with inline recipe-lock
   status badge), Categories, Add-ons. Product editor supports image upload,
   variants, and add-on attachment.
6. **Recipes / Lock Sheet** — a card per product listing its raw materials
   and quantities, a computed cost-per-unit, and a prominent lock/unlock
   control that's disabled for non-admins.
7. **Inventory** — stock table with a red "Low Stock" badge, a Stock Entry
   modal (in/out/wastage/adjustment), and a per-item movement history modal.
8. **Tables** — a draggable-feeling floor plan (absolute-positioned tiles),
   green = free / red = occupied / faded = merged, live running total shown
   on occupied tiles.
9. **Suppliers** — Suppliers tab + Purchase History tab; a purchase entry
   modal that adds line items and immediately stock-ins the inventory.
10. **Customers** — search, add, and a detail modal showing order history and
    loyalty points.
11. **Expenses** — simple ledger with category, description, amount, date.
12. **Reports** — pill selector across the 6 report types, date/range
    pickers, summary stat cards, a line chart for the monthly view, a data
    table, and Excel/PDF export buttons that hit the export endpoints
    directly.
13. **Settings** — Branding (logo/name/tagline/address/phone/currency/receipt
    footer), Appearance (light/dark, English/Urdu), Users & Roles, and
    Backup & Restore.

## 8. Possible Phase 2 (not built, out of scope for this delivery)

- True background sync engine for a **multi-branch** cloud setup (would
  replace/augment SQLite with a syncing layer — a materially different and
  much larger project than a single-till offline app).
- Native installer/executable wrapper (e.g. via Electron) so the cafe owner
  doesn't need to open a terminal at all — currently it's a one-line
  `node server.js`, or a `.bat` shortcut for Windows auto-start.
- SMS/WhatsApp receipt delivery, loyalty-point redemption at checkout,
  ingredient-level supplier price-comparison — all straightforward additions
  on top of the existing schema if you want them later.

## Configurable Employee Roles & Permissions

Access is resolved centrally as **Employee → Role(s) → Permissions → Module/API Access**.

- `backend/permissions.js` is the single permission catalog and route-to-permission map.
- `roles`, `role_permissions`, `employee_roles`, and `employee_permission_overrides` store configurable access in SQLite.
- Multiple employee roles are combined; an explicit employee override (`Allow` or `Deny`) takes priority over role permissions.
- Permission checks run server-side on every authenticated API request and client-side for navigation/button visibility.
- Super Admin is protected separately and is the only account allowed to manage roles, assign roles, change overrides, manage login accounts, and access critical settings/backup functions.
- Employee role/permission changes are written to `activity_log` with the actor, previous/new role state, and previous/new effective permissions.
- Legacy `admin`, `cashier`, and `kitchen` login roles remain as a migration fallback for existing installations; linked employees use their explicitly assigned configurable roles instead of designation or department.
