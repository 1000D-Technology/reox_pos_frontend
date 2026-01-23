# Reox POS - Desktop Application

A robust Point of Sale (POS) system built with **React**, **Node.js**, and **Electron**. This application is designed to run as a local desktop executable with a bundled backend and a local MySQL database.

---

## 🚀 Quick Start Guide

### 1. Prerequisites

Ensure you have the following installed on your machine:

- **Node.js** (v18 or higher recommended)
- **MySQL Server** (Running locally)
- **npm** (Comes with Node.js)

### 2. Physical Setup (Hardware)

- **POS Printer**: Recommended for receipt printing.
- **Barcode Scanner**: Standard USB/HID scanner supported.

---

## 🛠️ Development Environment Setup

### 1. Clone & Install

```bash
# Clone the repository
git clone <repository-url>
cd reox_pos_frontend

# Install root & frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Environment Configuration

Create or update the following `.env` files:

#### Backend: `backend/.env`

```ini
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=reox
DB_PORT=3306
PORT=3000
```

_Note: Our custom scripts handle the Prisma connection string automatically._

#### Frontend: `.env`

```ini
VITE_API_URL=http://localhost:3000/api
```

### 3. Database Initialization (Prisma)

We use Prisma ORM for database management. **Do not run `npx prisma` directly.** Use the following custom scripts from the root:

| Task                  | Command                   |
| :-------------------- | :------------------------ |
| **Sync Schema**       | `npm run prisma:push`     |
| **Generate Client**   | `npm run prisma:generate` |
| **Open Database UI**  | `npm run prisma:studio`   |
| **Seed Default Data** | `npm run seed`            |

**Typical Workflow:**

```bash
# Push schema to MySQL
npm run prisma:push

# Generate the types
npm run prisma:generate

# Seed essential data (Roles, Statuses, Default Admin)
npm run seed
```

### 4. Run Development Mode

```bash
npm run electron:dev
```

This command concurrently starts the backend, the Vite dev server, and launches the Electron application with Hot Module Replacement (HMR).

---

## 📦 Building for Production (.exe)

To package the application into a standalone Windows executable:

```bash
# Build for Windows
npm run electron:build:win
```

**What this does:**

1. Compiles the React frontend into static assets (`dist/`).
2. Installs production-only dependencies in the `backend/` folder.
3. Bundles the frontend, backend, and Electron into an installer.
4. Generates an installer in the `release/` folder.

---

## 📂 Project Structure

- `src/` - React frontend (Pages, Components, Services).
- `backend/` - Node.js Express server & Business logic.
- `backend/prisma/` - Database schema and seed scripts.
- `electron/` - Main process and Preload security scripts.
- `release/` - Built executables (Generated after build).
- `dist/` - Production-ready frontend assets (Generated after build).

---

## 🔧 Troubleshooting

#### Backend Not Starting

- Check if MySQL service is running.
- Verify `backend/.env` credentials.
- Ensure port `3000` is not being used by another process.

#### Prisma Errors

- If you change the database schema, always run `npm run prisma:generate`.
- If you get "Environment variable not found: DATABASE_URL", ensure you are using `npm run prisma:push` instead of the raw prisma command.

#### Build Fails

- Clear the cache: `rm -rf dist release`.
- Reinstall dependencies: `rm -rf node_modules && npm install`.

---

## 🔐 Security

- The backend is restricted to `localhost`.
- Preload scripts are used to bridge Electron's main and renderer processes securely.
- Sensitive database operations are handled exclusively on the backend.

---

**License**: Proprietary - Reox POS Systems.
