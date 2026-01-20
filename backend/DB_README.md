# Database Configuration & Setup Guide

This guide explains how to configure, generate, and seed the database for the Reox POS backend using Prisma and MySQL.

## 1. Prerequisites

- **Node.js** installed (v16+ recommended).
- **MySQL Server** installed and running locally.
- **MySQL Client** (optional but recommended for manual imports).

## 2. Environment Configuration

Ensure your `backend/.env` file is configured correctly. The application and seeds rely on these individual variables to construct the valid connection string properly.

```ini
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=reox
DB_PORT=3306
PORT=5000
```

> **Note:** Password encoding is handled automatically by the application code. You don't need to manually encode special characters.

## 3. Database Generation

You have two options for setting up the database: **Importing a Full Dump** (Recommended for dev) or **Syncing Schema** (Fresh start).

### Option A: Import Full Database Dump (Production-like Data)

If you have a SQL dump file (e.g., `full_db_dump_compatible.sql`), you can import it directly into MySQL. This gives you the complete data structure and content.

**Using Command Line:**

```bash
# 1. Login to MySQL
mysql -u root -p

# 2. Create the database (if it doesn't exist)
DROP DATABASE IF EXISTS reox;
CREATE DATABASE reox;
EXIT;

# 3. Import the file
mysql -u root -p reox < full_db_dump_compatible.sql
```

**Using GUI (HeidiSQL / Workbench):**

1.  Create a database named `reox`.
2.  Open the SQL file.
3.  Run the script against the `reox` database.

After importing, run this to ensure Prisma is in sync:

```bash
npx prisma db pull
npx prisma generate
```

### Option B: Fresh Schema Setup (Using Prisma)

If you just want the table structure defined in `prisma/schema.prisma` without the data:

```bash
npx prisma db push
npx prisma generate
```

## 4. Seeding the Database

To populate the database with initial sample data (Roles, Statuses, Default Admin User, Sample Products), use the seed command.

> **Note:** The seed script is safe to run multiple times; it checks if records exist before creating them.

Run:

```bash
npx prisma db seed
```

**What gets seeded?**

- **Roles:** Admin, Cashier, Manager
- **Statuses:** Active, Inactive, Suspended
- **User:** Super Admin (Email: `admin@reox.com`, Password: `123456`)
- **Product Metadata:** Categories, Brands, Units, etc.
- **Sample Product:** "Sample T-Shirt"

## 5. Typical Workflow

1.  **Clone/Pull latest code.**
2.  **Install dependencies:** `npm install`
3.  **Generate Client:** `npx prisma generate`
4.  **Start Server:** `node index.js` (or `npm run dev`)

## Troubleshooting

- **Connection Errors:** Double-check `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` in `.env`. Password encoding is handled automatically.
- **Prisma Client Errors:** If you change `schema.prisma` or the database structure, ANYTIME, you must run `npx prisma generate` to update the client.
