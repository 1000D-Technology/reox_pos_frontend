const express = require('express');
const cors = require('cors');
const { globalErrorHandler, AppError } = require('./middleware/errorHandler');
const productRoutes = require('./routes/productRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const grnRoutes = require('./routes/grnRouters');
const brandRoutes = require('./routes/brandRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const unitRoutes = require('./routes/unitRoutes');
const productTypeRoutes = require('./routes/productTypeRoutes');
const paymentTypeRoutes = require('./routes/paymentTypeRoutes');


require('dotenv').config();
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const seedDatabase = require('./config/dbInit');

// Middleware
const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/grn', grnRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/product-types', productTypeRoutes);
app.use('/api/payment-types', paymentTypeRoutes);


// Handle undefined routes
app.use((req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware (MUST BE LAST)
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;
seedDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(err => {
    console.error("Failed to seed database, server not started:", err);
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