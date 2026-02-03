const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const { globalErrorHandler, AppError } = require('./middleware/errorHandler');
const productRoutes = require('./routes/productRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const grnRoutes = require('./routes/grnRouters');
const brandRoutes = require('./routes/brandRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const unitRoutes = require('./routes/unitRoutes');
const unitConversionRoutes = require('./routes/unitConversionRoutes');
const productTypeRoutes = require('./routes/productTypeRoutes');
const paymentTypeRoutes = require('./routes/paymentTypeRoutes');
const stockRoutes = require('./routes/stockRoutes');
const resonRoutes = require('./routes/reasonRoutes');
const returnStatusRoutes = require('./routes/returnStatusRoutes');
const damagedRoutes = require('./routes/damagedRoutes');
const setupRoutes = require('./routes/setup');
const backupRoutes = require('./routes/backup.routes');
const posRoutes = require('./routes/posRoutes');
const customerRoutes = require('./routes/customerRoutes');
const userRoutes = require('./routes/userRoutes');
const roleRoutes = require('./routes/roleRoutes');
const { scheduleBackup } = require('./schedulers/backupScheduler');
const { scheduleSessionClosure } = require('./schedulers/sessionClosureScheduler');
const moneyExchangeRoutes = require('./routes/moneyExchangeRoutes');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const seedDatabase = require('./config/dbInit');
const cashSessionRoutes = require('./routes/cashSessionRoutes');
const quotationRoutes = require('./routes/quotationRoutes');
const reportRoutes = require('./routes/reportRoutes');
const analyticsRoutes = require('./routes/reportRoutes'); // Using the same file for now
const subscriptionRoutes = require('./routes/subscriptionRoutes');


// Middleware
const app = express();
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173'],
    credentials: true
}));
const authRoutes = require('./routes/auth');
app.use(express.json());

// Health check endpoint for Electron
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Backend is running' });
});

// Routes
app.use('/api/analytics', analyticsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/grn', grnRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/unit-conversions', unitConversionRoutes);
app.use('/api/product-types', productTypeRoutes);
app.use('/api/payment-types', paymentTypeRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/reasons', resonRoutes);
app.use('/api/return-status', returnStatusRoutes);
app.use('/api/damaged', damagedRoutes);
app.use('/api/setup', setupRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/pos', posRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/money-exchange', moneyExchangeRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api', cashSessionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);

// Handle undefined routes
app.use((req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware (MUST BE LAST)
app.use(globalErrorHandler);

const PORT = process.env.PORT || 3000;

seedDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`✅ Server is running on port ${PORT}`);

        // Initialize backup scheduler
        try {
            scheduleBackup();
            console.log('✅ Backup scheduler started successfully');
        } catch (error) {
            console.error('❌ Failed to start backup scheduler:', error.message);
        }

        // Initialize session auto-close scheduler
        try {
            scheduleSessionClosure();
            console.log('✅ Session auto-close scheduler started successfully');
        } catch (error) {
            console.error('❌ Failed to start session auto-close scheduler:', error.message);
        }
    });
}).catch(err => {
    console.error("❌ Failed to seed database, server not started:", err);
});

// Swagger definition
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'POS System API',
            version: '1.0.0',
            description: 'API documentation for Product and Inventory Management',
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
            },
        ],
    },
    apis: ['./routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down gracefully...');
    process.exit(0);
});