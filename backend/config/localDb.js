const Database = require('better-sqlite3');
const path = require('path');

// Store the database in the backend folder for now. 
// In a real production Electron app, this should probably be in app.getPath('userData')
const dbPath = path.join(__dirname, '../local_pos.db');

const localDb = new Database(dbPath);

// Initialize schema for tables we need to sync
const initSchema = () => {
    // Enable WAL mode for better performance
    localDb.pragma('journal_mode = WAL');

    // Create tables matching the remote production schema (only necessary columns for search/scan)
    localDb.exec(`
        CREATE TABLE IF NOT EXISTS product (
            id INTEGER PRIMARY KEY,
            product_name TEXT,
            product_code TEXT UNIQUE,
            category_id INTEGER,
            brand_id INTEGER,
            unit_id INTEGER,
            product_type_id INTEGER,
            created_at TEXT
        );

        CREATE TABLE IF NOT EXISTS product_variations (
            id INTEGER PRIMARY KEY,
            product_id INTEGER,
            barcode TEXT,
            color TEXT,
            size TEXT,
            storage_capacity TEXT,
            product_status_id INTEGER,
            FOREIGN KEY(product_id) REFERENCES product(id)
        );

        CREATE TABLE IF NOT EXISTS stock (
            id INTEGER PRIMARY KEY,
            product_variations_id INTEGER,
            barcode TEXT,
            batch_id INTEGER,
            mfd TEXT,
            exp TEXT,
            cost_price REAL,
            mrp REAL,
            rsp REAL,
            wsp REAL,
            qty REAL,
            FOREIGN KEY(product_variations_id) REFERENCES product_variations(id)
        );

        CREATE TABLE IF NOT EXISTS batch (
            id INTEGER PRIMARY KEY,
            batch_name TEXT
        );

        CREATE TABLE IF NOT EXISTS brand (
            idbrand INTEGER PRIMARY KEY,
            name TEXT
        );

        CREATE TABLE IF NOT EXISTS category (
            idcategory INTEGER PRIMARY KEY,
            name TEXT
        );

        CREATE TABLE IF NOT EXISTS unit_id (
            idunit_id INTEGER PRIMARY KEY,
            name TEXT
        );

        CREATE TABLE IF NOT EXISTS customer (
            id INTEGER PRIMARY KEY,
            name TEXT,
            contact TEXT,
            email TEXT,
            status_id INTEGER
        );

        CREATE TABLE IF NOT EXISTS supplier (
            id INTEGER PRIMARY KEY,
            supplier_name TEXT,
            contact_number TEXT,
            email TEXT,
            company_id INTEGER,
            status_id INTEGER
        );

        CREATE TABLE IF NOT EXISTS company (
            id INTEGER PRIMARY KEY,
            company_name TEXT,
            company_contact TEXT
        );

        CREATE TABLE IF NOT EXISTS status (
            id INTEGER PRIMARY KEY,
            ststus TEXT
        );

        CREATE TABLE IF NOT EXISTS payment_types (
            id INTEGER PRIMARY KEY,
            payment_types TEXT
        );

        CREATE TABLE IF NOT EXISTS user (
            id INTEGER PRIMARY KEY,
            name TEXT,
            role_id INTEGER,
            status_id INTEGER
        );

        -- Indices for fast searching
        CREATE INDEX IF NOT EXISTS idx_product_variations_barcode ON product_variations(barcode);
        CREATE INDEX IF NOT EXISTS idx_stock_barcode ON stock(barcode);
        CREATE INDEX IF NOT EXISTS idx_product_product_code ON product(product_code);
        CREATE INDEX IF NOT EXISTS idx_customer_contact ON customer(contact);
        CREATE INDEX IF NOT EXISTS idx_supplier_contact ON supplier(contact_number);
    `);
    
    console.log('✅ Local SQLite schema initialized');
};

initSchema();

module.exports = localDb;
