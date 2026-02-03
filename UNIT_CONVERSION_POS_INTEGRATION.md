# Unit Conversion Integration Guide for POS Terminal

## Overview
This guide explains how to complete the unit conversion integration for the POS terminal. The system allows products with defined unit conversions to be added to the cart using sub-units (e.g., adding 24 Pieces when the base unit is Box, where 1 Box = 12 Pieces).

## Changes Already Made

### 1. ProductAddModal.tsx
✅ Added import for `unitConversionService` and `ArrowRight` icon
✅ Added `unitId` to Product interface
✅ Added optional `selectedUnitConversion` parameter to `onAddToCart` callback
✅ Added state variables:
   - `unitConversions`: stores available conversions
   - `loadingConversions`: loading state
   - `selectedConversion`: currently selected conversion
   - `subUnitQuantity`: quantity in sub-unit terms
   - `useSubUnit`: flag indicating if sub-unit is being used

✅ Added useEffect to fetch unit conversions from API
✅ Modified `handleAddToCart` to pass conversion info
✅ Added `handleSubUnitQuantityChange` function to handle sub-unit input
✅ Modified `incrementQty` and `decrementQty` to reset sub-unit states

## Remaining Tasks

### Task 1: Add Unit Conversion UI to ProductAddModal

**Location**: `src/components/pos/ProductAddModal.tsx`, after line 430 (after the hardcoded Quick Convert section)

**Add this UI code**:
```tsx
                                    {/* Database-Driven Unit Conversions */}
                                    {unitConversions.length > 0 && (
                                        <div className="mt-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                                            <div className="flex items-center gap-2 mb-3">
                                                <ArrowRight className="w-4 h-4 text-blue-600" />
                                                <span className="text-sm font-bold text-blue-700 uppercase tracking-wide">
                                                    Unit Conversions Available
                                                </span>
                                            </div>
                                            
                                            {loadingConversions ? (
                                                <div className="flex items-center justify-center py-2">
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                                </div>
                                            ) : (
                                                <>
                                                    {/* Select Sub-Unit */}
                                                    <div className="mb-3">
                                                        <label className="block text-xs font-semibold text-blue-700 mb-1">
                                                            Select Sub-Unit
                                                        </label>
                                                        <select
                                                            value={selectedConversion?.id || ''}
                                                            onChange={(e) => {
                                                                const conversion = unitConversions.find(c => c.id === Number(e.target.value));
                                                                setSelectedConversion(conversion || null);
                                                                setSubUnitQuantity('');
                                                                setUseSubUnit(false);
                                                            }}
                                                            className="w-full px-3 py-2 bg-white border-2 border-blue-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-all font-semibold"
                                                        >
                                                            {unitConversions.map((conversion) => (
                                                                <option key={conversion.id} value={conversion.id}>
                                                                    {conversion.child_unit_name} (1 {product.category} = {conversion.conversion_factor} {conversion.child_unit_name})
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* Enter Sub-Unit Quantity */}
                                                    {selectedConversion && (
                                                        <div>
                                                            <label className="block text-xs font-semibold text-blue-700 mb-1">
                                                                Enter Quantity in {selectedConversion.child_unit_name}
                                                            </label>
                                                            <div className="relative">
                                                                <input
                                                                    type="number"
                                                                    value={subUnitQuantity}
                                                                    onChange={(e) => handleSubUnitQuantityChange(e.target.value)}
                                                                    placeholder={`e.g., ${selectedConversion.conversion_factor} = 1 ${product.category}`}
                                                                    step="any"
                                                                    min="0"
                                                                    className="w-full px-3 py-2.5 bg-white border-2 border-blue-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-all font-bold"
                                                                />
                                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-blue-600 flex items-center gap-1">
                                                                    <Calculator className="w-3 h-3" />
                                                                    {selectedConversion.child_unit_name}
                                                                </div>
                                                            </div>
                                                            
                                                            {/* Conversion Preview */}
                                                            {useSubUnit && subUnitQuantity && (
                                                                <div className="mt-2 p-2 bg-white rounded-lg border border-blue-300">
                                                                    <div className="flex items-center justify-between text-xs">
                                                                        <span className="text-blue-600 font-semibold">
                                                                            {subUnitQuantity} {selectedConversion.child_unit_name}
                                                                        </span>
                                                                        <ArrowRight className="w-3 h-3 text-blue-400" />
                                                                        <span className="text-blue-800 font-bold">
                                                                            {quantity} {product.category}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            
                                                            <p className="mt-2 text-[10px] text-blue-600 font-medium">
                                                                💡 Conversion: {selectedConversion.conversion_factor} {selectedConversion.child_unit_name} = 1 {product.category}
                                                            </p>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )}
```

**Insert this code right after the closing of the "Quick Convert" section** (around line 430).

### Task 2: Update POS.tsx to Handle Unit Conversions

**File**: `src/pages/dashboard/POS.tsx`

**Changes needed**:

1. Update `CartItem` interface in `types.ts` or inline to include:
```tsx
interface CartItem extends Product {
    quantity: number;
    discount: number;
    discountType: 'percentage' | 'price';
    discountAmount: number;
    discountedPrice: number;
    // Add these fields:
    subUnitName?: string;        // e.g., "Pieces"
    subUnitQuantity?: number;    // e.g., 24
    conversionFactor?: number;   // e.g., 12
}
```

2. Modify `addToCartWithDetails` function signature (around line 274):
```tsx
const addToCartWithDetails = (
    product: Product,
    quantity: number,
    discount: number,
    discountType: 'percentage' | 'price',
    discountAmount: number,
    discountedPrice: number,
    selectedUnitConversion?: { unitName: string; conversionFactor: number } | null
) => {
    if (quantity <= 0) {
        toast.error("Quantity must be greater than 0");
        return;
    }

    if (product.stock <= 0) {
        toast.error("Product is out of stock!");
        return;
    }

    if (quantity > product.stock) {
        toast.error("Cannot add more than available stock");
        return;
    }

    setCartItems(prevCart => {
        const existingItem = prevCart.find(item => item.id === product.id);

        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            if (newQuantity > product.stock) {
                toast.error("Cannot add more than available stock");
                return prevCart;
            } 
            return prevCart.map(item =>
                item.id === product.id
                    ? {
                        ...item,
                        quantity: newQuantity,
                        discount,
                        discountType,
                        discountAmount,
                        discountedPrice: discountedPrice * (newQuantity / quantity),
                        // Update unit conversion if provided
                        ...(selectedUnitConversion ? {
                            subUnitName: selectedUnitConversion.unitName,
                            subUnitQuantity: (item.subUnitQuantity || 0) + (quantity * selectedUnitConversion.conversionFactor),
                            conversionFactor: selectedUnitConversion.conversionFactor
                        } : {})
                    }
                    : item
            );
        }

        const priceToUse = billingMode === 'wholesale' ? product.wholesalePrice : product.price;
        return [...prevCart, {
            ...product,
            price: priceToUse,
            quantity,
            discount,
            discountType,
            discountAmount,
            discountedPrice,
            isBulk: product.isBulk,
            // Add unit conversion data if provided
            ...(selectedUnitConversion ? {
                subUnitName: selectedUnitConversion.unitName,
                subUnitQuantity: quantity * selectedUnitConversion.conversionFactor,
                conversionFactor: selectedUnitConversion.conversionFactor
            } : {})
        }];
    });

    // Show toast with unit conversion info
    if (selectedUnitConversion) {
        toast.success(`${product.name} added: ${quantity * selectedUnitConversion.conversionFactor} ${selectedUnitConversion.unitName}`);
    } else {
        toast. success(`${product.name} added to cart`);
    }
};
```

### Task 3: Update Cart Display to Show Sub-Units

**File**: `src/components/pos/CartPanel.tsx`

Modify the cart item display to show sub-unit information when available:

```tsx
{/* In the cart item row, add this after the quantity display */}
{item.subUnitName && item.subUnitQuantity && (
    <div className="text-[10px] text-gray-500">
        ({item.subUnitQuantity} {item.subUnitName})
    </div>
)}
```

### Task 4: Ensure Products Have unitId

**File**: `src/pages/dashboard/POS.tsx`

In the `mapAPIProductToProduct` function (around line 31), ensure `unitId` is included:

```tsx
const mapAPIProductToProduct = (apiData: any): Product => {
    const item = Array.isArray(apiData) ? apiData[0] : apiData;

    let name = item.displayName || item.productName || item.name;
    if (name) {
        name = name.replace(/ - (N\/A|NA|N\.A\.|None|Default|Not Applicable)/gi, '');
    }

    return {
        id: item.stockID || item.stock_id || item.productID || item.id,
        name: name,
        barcode: item.barcode || '',
        price: parseFloat(item.price || item.Price || item.selling_price) || 0,
        wholesalePrice: parseFloat(item.wholesalePrice || item.wsp) || 0,
        stock: parseInt(item.currentStock || item.stockQty || item.stock || item.qty) || 0,
        category: item.unit || item.category || 'Pcs',
        productCode: item.productCode || item.productID || item.product_id_code || item.product_code || '',
        isBulk: Boolean(item.isBulk) || String(item.unit || '').toLowerCase().includes('kg') || String(item.unit || '').toLowerCase().includes('bag'),
        batch: item.batchName || item.batch || item.batch_name || '',
        expiry: item.expiry || item.exp || null,
        unitId: item.unitId || item.unit_id || item.unit_id_value || undefined  // ADD THIS LINE
    };
};
```

### Task 5: Backend - Ensure Unit ID is in POS Product Response

**File**: `backend/routes/posRoutes.js` or relevant POS product endpoint

Make sure the POS product list includes the `unit_id` field in the response.

##How It Works

1. **User selects a product** in POS
2. **ProductAddModal opens** and fetches unit conversions for the product's unitId
3. **If conversions exist**, a blue "Unit Conversions Available" section appears
4. **User can select a sub-unit** from the dropdown (e.g., "Pieces")
5. **User enters quantity in sub-units** (e.g., "24 Pieces")
6. **System automatically calculates base quantity** (e.g., 24 ÷ 12 = 2 Boxes)
7. **Frontend displays both units** (2 Boxes / 24 Pieces)
8. **Backend receives base quantity** (2) for stock calculations
9. **Invoice shows base units** but display can show sub-units for clarity

## Testing

1. Create a unit conversion: `1 Box = 12 Pieces` in Manage Unit Conversions
2. Ensure a product with "Box" as unit exists
3. Open POS and add that product
4. You should see the blue "Unit Conversions Available" section
5. Select "Pieces" and enter "24"
6. Observe that quantity becomes "2" (Base units)
7. Add to cart and verify the cart shows "2 Boxes (24 Pieces)"
8. Complete the sale and verify invoice is correct

## Summary

- **Frontend**: Shows sub-units for user convenience
- **Backend**: Always receives and processes base unit quantities
- **Database**: Stores base unit quantities
- **Display**: Can show both for clarity (e.g., "2 Boxes (24 Pieces)")

This approach ensures data integrity while providing a user-friendly interface.
