const Product = require('../models/productModel');

exports.addProduct = async(req , res) => {
    try {
        const { productData, variations } = req.body;

        let finalVariations = [];
        if (!variations || variations.length === 0) {
            finalVariations.push({
                barcode: productData.barcode,
                color: 'Default', size: 'Default', capacity: 'N/A', statusId: 1
            });
        } else {
            finalVariations = variations;
        }

        const id = await Product.create(productData, finalVariations);
        res.status(201).json({ success: true, message: "Product saved successfully!" });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: "Barcode or Product Code already exists!", errors: [{ field: "code/barcode", message: "Already exists!" }] });
        }
        res.status(500).json({ success: false, message: "Database Error", error: error.message });
    }
}

exports.getProducts = async (req, res) => {
    try {
        const products = await Product.getAllProducts();
        res.status(200).json({
            success: true,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching products",
            error: error.message
        });
    }
};

exports.updateProduct = async (req, res) => {
    try{
        const {pvId} = req.params;
        const {productData, variationData} = req.body;

        await Product.updateProductVariation(pvId, productData, variationData);
        res.status(200).json({success: true, message: "Product updated successfully!"});
    }catch(error){
        if(error.code === 'ER_DUP_ENTRY'){
            return res.status(400).json({success: false, message: "Barcode or Product Code already exists!", errors: [{field: "code/barcode", message: "Already exists!"}]});
        }
        res.status(500).json({success: false, message: "Error updating product", error: error.message});
    }
}

exports.searchProducts = async (req, res) =>{
    try{

        const {productTypeId, searchTerm} = req.query;
        const products = await Product.searchProducts({productTypeId, searchTerm});

        res.status(200).json({success: true, data: products});

    }catch(error){
        res.status(500).json({success: false, message: "Error searching products", error: error.message});
    }
}