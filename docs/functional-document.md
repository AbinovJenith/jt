# Jothi Traders – Functional Document

---

## 1. What is Jothi Traders?

Jothi Traders is a **B2B (Business-to-Business) trading management platform**. It is designed for a trading company that buys goods from suppliers and sells them to business customers.

The platform replaces manual spreadsheets and email chains with a structured digital workflow — from receiving a customer enquiry all the way through to shipping the goods and collecting payment.

**Live Application:** https://jothi-traders.netlify.app

---

## 2. User Roles

The platform has four types of users. Each type sees only what is relevant to their job.

| Role | Who uses it | What they can do |
|---|---|---|
| **ADMIN** | Business owner / manager | Full access to everything — products, customers, suppliers, orders, finance, reports, settings |
| **STAFF** | Internal employees | Same as admin but cannot manage users or see sensitive settings |
| **SUPPLIER** | External supplier companies | Log in to the Supplier Portal — view their assigned purchase orders and update status |
| **CUSTOMER** | External customer companies | Log in to the Customer Portal — view their own orders, invoices, and payment status |

> Currently ADMIN is the primary working role. Supplier and Customer portal access is available but the portal pages are being expanded.

---

## 3. Logging In

1. Open https://jothi-traders.netlify.app
2. Enter your **email** and **password**
3. Click **Sign In**

**Default admin credentials (first-time setup):**
- Email: `admin@jothitraders.com`
- Password: `Admin@123`

> Change the admin password after first login.

**What happens after login:**
- You are taken to the **Dashboard** showing a summary of the business
- Your session stays active for 15 minutes; it automatically refreshes in the background as long as you are using the app
- Clicking **Logout** ends your session and returns you to the login page

---

## 4. Dashboard

The dashboard is the home screen after login. It shows a **real-time summary** of the business.

| Card | What it shows |
|---|---|
| Total Products | Number of active products in the catalogue |
| Total Customers | Number of registered customers |
| Total Suppliers | Number of registered suppliers |
| Pending Orders | Orders that have been placed but not yet dispatched |
| Revenue (This Month) | Total invoiced amount for the current month |
| Outstanding Payments | Amount not yet collected from customers |

A **revenue chart** shows the trend over recent months so you can see whether business is growing or declining.

---

## 5. Categories

Categories are used to organise products. They work like folders — you can have a main category with sub-categories inside it.

**Example structure:**
```
Grains & Cereals
  ├── Rice
  │   ├── Basmati
  │   └── Sona Masoori
  └── Wheat
Spices
  └── Whole Spices
```

### How to add a Category

1. Go to **Categories** in the left menu
2. Click **New Category**
3. Enter the **Category Name**
4. If it is a sub-category, select the **Parent Category** from the dropdown — leave it blank for a top-level category
5. Click **Create**

### What Categories are used for

- When adding a product, you must select a category
- Categories can have **attribute groups** attached to them — this means every product in that category will have the same set of custom fields (e.g., a Rice category might have attributes like Grain Type, Moisture Content, Grade)

---

## 6. Products

A product is any item that the company trades. Each product can have multiple **Specifications** (e.g., the same rice sold in 25 kg bags and 50 kg bags are two specifications of the same product).

### Key terms

| Term | Meaning |
|---|---|
| **Product** | The master item (e.g., Basmati Rice) |
| **Specification** | A specific size or variant of the product (e.g., 25 kg, 50 kg) |
| **Product Code** | A unique code you assign to each specification (like a SKU) — used for tracking |
| **Supplier Price** | The price at which a supplier sells this specification to you |

### How to add a Product

1. Go to **Products** in the left menu
2. Click **New Product**
3. Fill in:
   - **Product Name** — e.g., `Basmati Rice`
   - **Category** — select from the dropdown (e.g., Rice)
   - **Description** — optional, free text describing the product
4. Under **Specifications**, add at least one:
   - **Product Code** — e.g., `BR-001`
   - **Quantity** — the number (e.g., `25`)
   - **Unit** — select the unit (kg, litre, metre, units, box, piece, ton, gram, ml)
   - Click **+ Add Specification** to add more sizes
5. Click **Create Product**

After creating, you are taken to the product detail page where you can:
- View all specifications and their stock levels
- Set supplier prices (see Suppliers section)
- Upload product images and documents (datasheets, certificates)

### Viewing a Product

The product detail page shows:
- All specifications with their Product Codes
- Available stock per warehouse
- Supplier prices for each specification
- Product images
- Attached documents

---

## 7. Suppliers

Suppliers are the companies that sell goods to Jothi Traders.

### How to add a Supplier

1. Go to **Suppliers** in the left menu
2. Click **New Supplier**
3. Fill in:
   - **Company Name** — the supplier's business name
   - **Contact Person** — name of the primary contact
   - **Email**, **Phone** — contact details
   - **Address** — supplier location
4. Click **Create**

### How to link a Supplier to a Product (Set Price)

This step connects a supplier to a specific product specification and records the price they charge you.

1. Go to **Products** and open the product
2. Find the specification (e.g., 25 kg bag)
3. Click the **Set Price** button next to it
4. In the popup:
   - Select the **Supplier** from the dropdown
   - Enter the **Base Price (₹)** — what the supplier charges per unit
   - Enter **Min. Order Qty** — minimum quantity you must order from this supplier
   - Enter **Lead Time (days)** — how many days the supplier takes to deliver (optional)
5. Click **Save Price**

You can set prices from multiple suppliers for the same specification — this lets you compare and choose the best supplier when creating a Purchase Order.

---

## 8. Customers

Customers are the businesses that buy from Jothi Traders.

### How to add a Customer

1. Go to **Customers** in the left menu
2. Click **New Customer**
3. Fill in:
   - **Company Name**
   - **Contact Person**, **Email**, **Phone**
   - **Billing Address**
   - **Credit Limit (₹)** — maximum outstanding balance allowed
   - **Payment Terms** — e.g., Net 30 (customer pays within 30 days)
4. Click **Create**

---

## 9. The Order Workflow

This is the core business process. It follows the standard B2B trading flow:

```
Customer Request
      │
      ▼
  RFQ (Request for Quotation)   ← Customer asks for a price
      │
      ▼
  Quotation                     ← You reply with your price
      │
      ▼
  Order                         ← Customer confirms the order
      │
      ├──▶ Purchase Order       ← You order from your supplier
      │
      ├──▶ Invoice              ← You bill the customer
      │
      ├──▶ Payment              ← Customer pays
      │
      └──▶ Shipment             ← Goods are dispatched
```

### 9.1 RFQ (Request for Quotation)

An RFQ is created when a customer asks for a price before committing to buy.

**How to create an RFQ:**
1. Go to **RFQ** in the left menu
2. Click **New RFQ**
3. Select the **Customer**
4. Add line items — each item is a product specification + quantity requested
5. Save the RFQ

The RFQ gets a unique number like `RFQ-0001`.

### 9.2 Quotation

A quotation is your price response to an RFQ.

**How to create a Quotation:**
1. Go to **Quotations** → **New Quotation**
2. Link it to an existing RFQ (or create independently)
3. Add line items with your **selling price** per unit and quantity
4. Set the **validity date** (how long this price is valid)
5. Save — it gets a number like `QUO-0001`

You can then send/share this quotation with the customer.

### 9.3 Order

An order is created when the customer confirms they want to buy.

**How to create an Order:**
1. Go to **Orders** → **New Order**
2. Link it to an accepted quotation (or create directly)
3. Select the **Customer**
4. Confirm line items, quantities, and prices
5. Save — it gets a number like `ORD-0001`

The order status tracks progress: `PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED`.

### 9.4 Purchase Order

A Purchase Order (PO) is sent to your supplier to procure the goods needed for a customer order.

**How to create a Purchase Order:**
1. Go to **Purchase Orders** → **New PO**
2. Link it to an order
3. Select the **Supplier**
4. Add line items — the products/specifications to order from the supplier
5. Save — it gets a number like `PO-0001`

### 9.5 Invoice

An invoice is the bill you send to the customer.

**How to create an Invoice:**
1. Go to **Invoices** → **New Invoice**
2. Link it to an order
3. The line items and prices are pre-filled from the order
4. Set the **due date**
5. Save — it gets a number like `INV-0001`

Invoice status: `DRAFT → SENT → PARTIALLY_PAID → PAID → OVERDUE`.

### 9.6 Payment

When a customer makes a payment, record it here.

**How to record a Payment:**
1. Go to **Payments** → **New Payment**
2. Select the **Invoice** being paid
3. Enter the **amount paid**, **date**, and **payment method**
4. Save

The invoice status updates automatically (Partially Paid / Paid).

### 9.7 Shipment

A shipment records when goods are dispatched to the customer.

**How to create a Shipment:**
1. Go to **Shipments** (under Orders or the Shipments menu)
2. Link it to an order
3. Enter **carrier**, **tracking number**, **dispatch date**, **estimated delivery date**
4. Save

Shipment status: `PENDING → DISPATCHED → IN_TRANSIT → DELIVERED`.

---

## 10. Inventory

Inventory tracks the physical stock of products across warehouses.

| Term | Meaning |
|---|---|
| **Warehouse** | A physical storage location |
| **Qty on Hand** | Total stock currently in the warehouse |
| **Qty Reserved** | Stock already allocated to confirmed orders (not available for new orders) |
| **Available** | Qty on Hand minus Qty Reserved |

### Viewing Inventory

1. Go to **Inventory** in the left menu
2. See all products and their stock levels per warehouse
3. Filter by product, category, or warehouse

### Stock is updated automatically when:
- A purchase order is received (stock goes up)
- An order is confirmed (stock is reserved)
- An order is shipped (reserved stock is consumed)

---

## 11. Reports

Reports give you a business overview for a selected date range.

| Report | What it shows |
|---|---|
| **Sales Report** | Revenue, order count, top customers, top products — for a selected period |
| **Inventory Report** | Current stock levels, low-stock alerts, stock value |
| **Supplier Report** | Purchase volumes, amounts spent per supplier |
| **Customer Report** | Revenue per customer, payment performance, outstanding balances |

**How to view a report:**
1. Go to **Reports** in the left menu
2. Select the report type
3. Set the **date range**
4. The data loads automatically

---

## 12. Audit Log

Every action in the system is recorded with:
- Who did it (user name and role)
- What they did (created, updated, deleted)
- Which record was affected
- What the data looked like before and after the change

**How to view Audit Logs:**
1. Go to **Audit** in the left menu
2. Browse the log entries, newest first
3. Each entry shows the action type, user, date/time, and the changes made

This is useful for:
- Tracking who changed a price
- Investigating a mistake
- Compliance and accountability

---

## 13. File Uploads

You can attach files to products:

**Product Images:**
- Uploaded to Cloudflare R2 (cloud storage)
- Displayed on the product detail page
- Supports JPG, PNG, WebP

**Product Documents:**
- Datasheets, certificates, compliance documents
- Attached to a product and available for download
- Supports PDF and common document formats

**How to upload:**
1. Open a product detail page
2. Use the Images or Documents section
3. Click upload and select your file
4. The file is stored in cloud storage and the URL is saved to the database

---

## 14. Admin Functions

### Managing Users
- Navigate to the Users section (Admin only)
- Create new staff accounts with email and temporary password
- Assign roles: ADMIN, STAFF, SUPPLIER, or CUSTOMER
- Deactivate accounts when staff leave

### Resetting Passwords
Currently done directly in the database or by the admin creating a new user record. A password reset email flow is planned.

---

## 15. Supplier Portal

When a supplier is created as a user (role = SUPPLIER), they can log in and:
- View Purchase Orders addressed to them
- See the items, quantities, and required delivery dates
- Update the PO status (e.g., mark as dispatched)

This replaces email and WhatsApp communication with suppliers for order tracking.

---

## 16. Customer Portal

When a customer is created as a user (role = CUSTOMER), they can log in and:
- View their own orders and order status
- Download their invoices
- See payment history and outstanding balance
- Track shipments

Customers **cannot** see other customers' data, pricing for other customers, or any internal business information.

---

## 17. Navigation Reference

| Menu Item | Section | Purpose |
|---|---|---|
| Dashboard | Home | Business overview and KPI cards |
| Products | Catalogue | Add and manage product catalogue |
| Categories | Catalogue | Organise products into categories |
| Suppliers | Procurement | Manage supplier companies and prices |
| Customers | Sales | Manage customer companies |
| Inventory | Stock | View and manage stock levels |
| RFQ | Orders | Customer price enquiries |
| Quotations | Orders | Price quotes sent to customers |
| Orders | Orders | Confirmed customer orders |
| Purchase Orders | Orders | Orders placed to suppliers |
| Invoices | Finance | Bills sent to customers |
| Reports | Analytics | Business performance reports |
| Audit | System | Activity and change log |

---

## 18. Common Tasks — Quick Reference

| I want to... | Steps |
|---|---|
| Add a new product | Products → New Product → fill name, category, specs → Create |
| Set a supplier price | Products → open product → Set Price on a specification |
| Record a customer enquiry | RFQ → New RFQ → select customer → add items → Save |
| Create a quotation | Quotations → New Quotation → link RFQ → add prices → Save |
| Confirm an order | Orders → New Order → link quotation → Save |
| Order from supplier | Purchase Orders → New PO → link order → select supplier → Save |
| Bill the customer | Invoices → New Invoice → link order → set due date → Save |
| Record payment received | Payments → New Payment → select invoice → enter amount → Save |
| Check stock levels | Inventory → view stock per warehouse |
| See who changed what | Audit → browse log |
| Download a report | Reports → select type → set date range → export |

---

## 19. Glossary

| Term | Plain English meaning |
|---|---|
| B2B | Business selling to another business (not to individual consumers) |
| RFQ | Request For Quotation — a customer asking "how much will you charge me for X?" |
| Quotation | Your reply to an RFQ with your price |
| PO | Purchase Order — the document you send to your supplier to order goods |
| MOQ | Minimum Order Quantity — the smallest amount a supplier will sell |
| Lead Time | Days from ordering to delivery |
| SKU / Product Code | A unique code to identify a specific product specification |
| Credit Limit | The maximum unpaid balance you allow a customer to carry |
| Net 30 | Payment terms meaning the customer must pay within 30 days of the invoice date |
| Audit Log | A complete record of every change made in the system |
