const prisma = require("../config/prismaClient");

class Product {
  static async checkIdExists(tableName, idColumn, idValue) {
    // Using raw query for dynamic table names to match previous behavior safely
    const result = await prisma.$queryRawUnsafe(
      `SELECT 1 FROM ${tableName} WHERE ${idColumn} = ? LIMIT 1`,
      idValue
    );
    // Result is an array of objects.
    // If returning BigInt, serialize it. But standard check just needs length.
    return result.length > 0;
  }

  static async create(productData, variations) {
    try {
      const newProduct = await prisma.product.create({
        data: {
          product_name: productData.name,
          product_code: productData.code,
          category_id: productData.categoryId,
          brand_id: productData.brandId,
          unit_id: productData.unitId,
          product_type_id: productData.typeId,
          product_variations: {
            create: variations.map((variant) => ({
              barcode: variant.barcode,
              color: variant.color,
              size: variant.size,
              storage_capacity: variant.capacity,
              product_status_id: variant.statusId,
            })),
          },
        },
      });
      return newProduct.id;
    } catch (error) {
      throw error;
    }
  }

  static async getProductsByStatus(statusId = 1) {
    const variations = await prisma.product_variations.findMany({
      where: {
        product_status_id: statusId,
      },
      include: {
        product: {
          include: {
            category: true,
            brand: true,
            unit_id_product_unit_idTounit_id: true,
            product_type: true,
          },
        },
      },
      orderBy: [
        { product: { created_at: "desc" } },
        { id: "desc" },
      ],
    });

    return variations.map((pv) => {
      const p = pv.product;
      // Handle potential null relations safely
      const categoryName = p.category ? p.category.name : null;
      const brandName = p.brand ? p.brand.name : null;
      const unitName = p.unit_id_product_unit_idTounit_id ? p.unit_id_product_unit_idTounit_id.name : null;
      const typeName = p.product_type ? p.product_type.name : null;

      return {
        productID: pv.id,
        productName: p.product_name,
        productCode: p.product_code,
        barcode: pv.barcode,
        category: categoryName,
        categoryId: p.category_id,
        brand: brandName,
        brandId: p.brand_id,
        unit: unitName,
        unitId: p.unit_id,
        productType: typeName,
        productTypeId: p.product_type_id,
        color: pv.color,
        size: pv.size,
        storage: pv.storage_capacity,
        createdOn: p.created_at ? p.created_at.toISOString().split("T")[0] : null,
      };
    });
  }

  static async getProductsForDropdown(statusId = 1) {
    const products = await prisma.product.findMany({
      where: {
        product_variations: {
          some: {
            product_status_id: statusId,
          },
        },
      },
      select: {
        id: true,
        product_name: true,
        product_code: true,
      },
      orderBy: {
        product_name: "asc",
      },
    });
    return products;
  }

  static async getProductVariantsByProductId(productId) {
    const variants = await prisma.product_variations.findMany({
      where: {
        product_id: parseInt(productId),
        product_status_id: 1,
      },
      select: {
        id: true,
        product_id: true,
        barcode: true,
        color: true,
        size: true,
        storage_capacity: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    return variants.map((row) => ({
      ...row,
      variant_name: `${row.color || "Default"} - ${row.size || "Default"} - ${
        row.storage_capacity || "N/A"
      }`,
    }));
  }

  static async updateProductVariation(pvID, productData, variationData) {
    return await prisma.$transaction(async (tx) => {
      const parsedPvID = parseInt(pvID);
      if (isNaN(parsedPvID)) {
        throw new Error("Invalid product variation ID");
      }

      const variation = await tx.product_variations.findUnique({
        where: { id: parsedPvID },
        select: { product_id: true },
      });

      if (!variation) {
        throw new Error("Product variation not found");
      }

      const productId = variation.product_id;

      // Parse and validate IDs
      const categoryId = parseInt(productData.categoryId);
      const brandId = parseInt(productData.brandId);
      const unitId = parseInt(productData.unitId);
      const typeId = parseInt(productData.typeId);

      if (isNaN(categoryId) || isNaN(brandId) || isNaN(unitId) || isNaN(typeId)) {
        throw new Error("Invalid product data: category, brand, unit, or type ID is not a valid number");
      }

      await tx.product.update({
        where: { id: productId },
        data: {
          product_name: productData.name,
          product_code: productData.code,
          category_id: categoryId,
          brand_id: brandId,
          unit_id: unitId,
          product_type_id: typeId,
        },
      });

      const statusId = parseInt(variationData.statusId);
      
      await tx.product_variations.update({
        where: { id: parsedPvID },
        data: {
          barcode: variationData.barcode,
          color: variationData.color || 'Default',
          size: variationData.size || 'Default',
          storage_capacity: variationData.storage || 'N/A',
          product_status_id: isNaN(statusId) ? 1 : statusId,
        },
      });

      return true;
    });
  }

  static async searchProducts(filter, statusId = 1) {
    const whereClause = {
      product_status_id: statusId,
    };

    // Initialize product filter inside whereClause if needed, 
    // but we can pass a product object to the where clause of product_variations
    
    // Construct product related filters
    const productWhere = {};

    if (
      filter.productTypeId &&
      filter.productTypeId !== "null" &&
      filter.productTypeId !== "undefined"
    ) {
      productWhere.product_type_id = Number(filter.productTypeId);
    }

    if (
      filter.unitId &&
      filter.unitId !== "null" &&
      filter.unitId !== "undefined"
    ) {
      productWhere.unit_id = Number(filter.unitId);
    }

    // Apply product filters if any
    if (Object.keys(productWhere).length > 0) {
        whereClause.product = productWhere;
    }

    if (
      filter.searchTerm &&
      filter.searchTerm !== "null" &&
      filter.searchTerm !== "undefined"
    ) {
      const search = filter.searchTerm;
      const searchConditions = [
        { product: { product_name: { contains: search } } },
        { product: { product_code: { contains: search } } },
        { barcode: { contains: search } },
      ];

      if (!isNaN(parseInt(search))) {
        searchConditions.push({ id: parseInt(search) });
      }

      whereClause.AND = {
        OR: searchConditions,
      };
    }
    
    // To ensure we combine the 'product' filter and the 'AND' search correctly:
    // If whereClause.product exists, Prisma handles it. 
    // If 'AND' also exists, Prisma combines them with implicit AND.

    const variations = await prisma.product_variations.findMany({
      where: whereClause,
      include: {
        product: {
          include: {
            category: true,
            brand: true,
            unit_id_product_unit_idTounit_id: true,
            product_type: true,
          },
        },
      },
      orderBy: [
        { product: { created_at: "desc" } },
        { id: "desc" },
      ],
    });

    return variations.map((pv) => {
      const p = pv.product;
      const categoryName = p.category ? p.category.name : null;
      const brandName = p.brand ? p.brand.name : null;
      const unitName = p.unit_id_product_unit_idTounit_id ? p.unit_id_product_unit_idTounit_id.name : null;
      const typeName = p.product_type ? p.product_type.name : null;
      
      return {
        productID: pv.id,
        productName: p.product_name,
        productCode: p.product_code,
        barcode: pv.barcode,
        category: categoryName,
        brand: brandName,
        unit: unitName,
        productType: typeName,
        color: pv.color,
        size: pv.size,
        storage: pv.storage_capacity,
        createdOn: p.created_at ? p.created_at.toISOString().split("T")[0] : null,
      };
    });
  }

  static async updateProductStatus(pvId, statusId) {
    try {
      await prisma.product_variations.update({
        where: { id: parseInt(pvId) },
        data: { product_status_id: parseInt(statusId) },
      });
      return { affectedRows: 1 };
    } catch (error) {
      if (error.code === 'P2025') {
        return { affectedRows: 0 };
      }
      throw error;
    }
  }
}

module.exports = Product;
