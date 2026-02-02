const db = require('../config/db');

const Subscription = {
    getStatus: async () => {
        const [rows] = await db.execute("SELECT * FROM subscription ORDER BY id DESC LIMIT 1");
        if (rows.length === 0) return null;
        
        const sub = rows[0];
        const now = new Date();
        const dueDate = new Date(sub.due_date);
        
        // Auto-update status if expired
        if (now > dueDate && sub.status !== 'Suspended') {
            await db.execute("UPDATE subscription SET status = 'Expired' WHERE id = ?", [sub.id]);
            sub.status = 'Expired';
        }
        
        return sub;
    },

    checkAccess: async () => {
        const sub = await Subscription.getStatus();
        if (!sub) return true; // Fail-safe: if no sub record, allow access
        
        if (sub.status === 'Suspended' || sub.status === 'Expired') {
            return false;
        }
        
        const now = new Date();
        const dueDate = new Date(sub.due_date);
        if (now > dueDate) {
            return false;
        }
        
        return true;
    }
};

module.exports = Subscription;
