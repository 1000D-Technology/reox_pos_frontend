const prisma = require('../config/prismaClient');
const localDb = require('../config/localDb');
const cron = require('node-cron');

class SyncService {
    static async syncAll() {
        console.log('🔄 Starting full data sync from Hostinger...');
        const startTime = Date.now();

        try {
            // 1. Sync Reference Tables in parallel
            await Promise.all([
                this.syncTable('brand', 'idbrand'),
                this.syncTable('category', 'idcategory'),
                this.syncTable('unit_id', 'idunit_id'),
                this.syncTable('batch', 'id'),
                this.syncTable('status', 'id'),
                this.syncTable('payment_types', 'id'),
                this.syncTable('company', 'id'),
                this.syncTable('supplier', 'id'),
                this.syncTable('customer', 'id'),
                this.syncTable('user', 'id')
            ]);

            // 2. Sync Core Product Tables
            await this.syncTable('product', 'id');
            await this.syncTable('product_variations', 'id');
            
            // 3. Sync Stock (with quantity > 0 for POS performance)
            await this.syncStock();

            const duration = (Date.now() - startTime) / 1000;
            console.log(`✅ Full sync completed in ${duration}s`);
        } catch (error) {
            console.error('❌ Sync failed:', error.message);
        }
    }

    static async syncTable(tableName, idColumn) {
        console.log(`   Syncing table: ${tableName}...`);
        
        // Fetch all from remote
        const remoteData = await prisma[tableName].findMany();
        
        if (remoteData.length === 0) return;

        // Get table info to see which columns exist in SQLite
        const tableInfo = localDb.prepare(`PRAGMA table_info(${tableName})`).all();
        const existingColumns = tableInfo.map(c => c.name);

        // Filter columns to only those that exist in both
        const columns = Object.keys(remoteData[0]).filter(col => existingColumns.includes(col));
        const placeholders = columns.map(() => '?').join(',');
        const sql = `INSERT OR REPLACE INTO ${tableName} (${columns.join(',')}) VALUES (${placeholders})`;
        
        const insert = localDb.prepare(sql);
        
        const transaction = localDb.transaction((rows) => {
            for (const row of rows) {
                const values = columns.map(col => {
                    const val = row[col];
                    if (val instanceof Date) return val.toISOString();
                    return val;
                });
                insert.run(...values);
            }
        });

        transaction(remoteData);
    }

    static async syncStock() {
        console.log('   Syncing available stock...');
        
        // Only sync stock with qty > 0 to keep local DB small and fast for scanning
        const remoteStock = await prisma.stock.findMany({
            where: {
                qty: { gt: 0 }
            }
        });

        if (remoteStock.length === 0) {
            localDb.prepare('DELETE FROM stock').run();
            return;
        }

        localDb.prepare('DELETE FROM stock').run();

        // Get table info for stock
        const tableInfo = localDb.prepare(`PRAGMA table_info(stock)`).all();
        const existingColumns = tableInfo.map(c => c.name);

        const columns = Object.keys(remoteStock[0]).filter(col => existingColumns.includes(col));
        const placeholders = columns.map(() => '?').join(',');
        const sql = `INSERT INTO stock (${columns.join(',')}) VALUES (${placeholders})`;
        
        const insert = localDb.prepare(sql);
        
        const transaction = localDb.transaction((rows) => {
            for (const row of rows) {
                const values = columns.map(col => {
                    const val = row[col];
                    if (val instanceof Date) return val.toISOString();
                    return val;
                });
                insert.run(...values);
            }
        });

        transaction(remoteStock);
    }

    static startScheduledSync() {
        // Sync on startup
        this.syncAll();

        // Schedule sync every 5 minutes
        cron.schedule('*/5 * * * *', () => {
            console.log('⏰ Running scheduled inventory sync...');
            this.syncAll();
        });
    }
}

module.exports = SyncService;
