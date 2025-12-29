const Product = require('../models/productModel');

exports.addProduct = async(req , res) => {
    try{
        const { productData, variations } = req.body; 

        let finalVariations = [];

        if (!variations || variations.length === 0) {
            finalVariations.push({
                barcode: productData.barcode,
                color: 'Default',
                size: 'Default',
                capacity: 'N/A',
                statusId: 1
            });
        } else {
            finalVariations = variations;
        }

        const id = await Product.create(productData, finalVariations);
        res.status(201).json({ success: true, message: "Product saved!" });
    }catch(error){
        res.status(500).json({ success: false, message: error.message });
    }
}