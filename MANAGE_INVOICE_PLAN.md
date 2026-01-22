# Manage Invoice - Database Integration Summary

## Database Schema Analysis

### Invoice Table Structure

```prisma
model invoice {
  id               Int
  invoice_number   String
  customer_id      Int?
  sub_total        Float
  discount         Float
  extra_discount   Float
  total            Float
  refunded_amount  Float          @default(0)
  created_at       DateTime
  cash_sessions_id Int
  invoice_type_id  Int

  // Relations
  customer         customer?
  invoice_type     invoice_type
  invoice_items    invoice_items[]
  invoice_payments invoice_payments[]
  creadit_book     creadit_book[]
  return_goods     return_goods[]
}
```

### Related Tables

- `invoice_items` - Line items for each invoice
- `invoice_payments` - Payment records (cash/card/bank)
- `customer` - Customer information
- `cash_sessions` - Session that created the invoice
- `invoice_type` - Type of invoice

## Implementation Status

### ✅ What Exists

1. Backend route: `GET /api/pos/invoice/:invoiceNo` (single invoice)
2. Backend route: `POST /api/pos/invoice` (create invoice)
3. Database schema is complete
4. Frontend component skeleton exists

### ❌ What's Missing

1. Backend route for listing/filtering invoices
2. Backend route for invoice statistics
3. Frontend service layer
4. Database integration in component
5. Search/filter functionality
6. Pagination with real data
7. Print functionality
8. Export to Excel functionality

## Required Implementation

### Phase 1: Backend API (Priority: HIGH)

**File:** `backend/controllers/posController.js`

Add methods:

1. `getAllInvoices(req, res)` - List invoices with filters
   - Filters: invoice_number, fromDate, toDate
   - Pagination: page, limit
   - Include: customer, items count, total payments
2. `getInvoiceStats(req, res)` - Get statistics
   - Total sales (sum of totals)
   - Invoice count
   - Date range analysis

**File:** `backend/routes/posRoutes.js`

Add routes:

```javascript
router.get("/invoices", posController.getAllInvoices);
router.get("/invoices/stats", posController.getInvoiceStats);
```

### Phase 2: Frontend Service (Priority: HIGH)

**File:** `src/services/invoiceService.ts`

Create service with methods:

```typescript
export const invoiceService = {
  getAllInvoices(filters: InvoiceFilters): Promise<InvoiceResponse>
  getInvoiceStats(): Promise<InvoiceStats>
  getInvoiceDetails(invoiceNo: string): Promise<InvoiceDetail>
}
```

### Phase 3: Component Integration (Priority: HIGH)

**File:** `src/pages/dashboard/Sales/ManageInvoice.tsx`

Updates needed:

1. Replace static data with API calls
2. Implement search/filter with real data
3. Add loading states
4. Add error handling
5. Implement real pagination
6. Connect view/print buttons

### Phase 4: Additional Features (Priority: MEDIUM)

1. Invoice detail modal
2. Print invoice functionality
3. Export to Excel
4. Keyboard shortcuts (already partially done)

## Data Flow

```
User Action → Component → Service → Backend → Database
                ↓
            Update UI with results
```

## Next Steps (In Order)

1. **Create backend getAllInvoices method**
   - Query invoices with filters
   - Include customer data
   - Calculate totals
   - Implement pagination

2. **Create backend getInvoiceStats method**
   - Calculate total sales
   - Count invoices
   - Return summary data

3. **Create frontend invoiceService.ts**
   - Define TypeScript interfaces
   - Implement API calls
   - Handle errors

4. **Update ManageInvoice component**
   - Remove static data
   - Integrate service calls
   - Add loading states
   - Implement real search/filter
   - Fix pagination

5. **Test all functionality**
   - Load invoices
   - Filter by number
   - Filter by date
   - Pagination
   - Statistics

## Test Data Availability

Current database should have invoices from POS transactions.
If not, create test invoices using the POS system first.

## Estimated Complexity

- Backend: ~2-3 hours
- Frontend Service: ~1 hour
- Component Integration: ~2-3 hours
- Testing: ~1-2 hours

**Total: ~6-9 hours of development**

## Files to Modify

1. `backend/controllers/posController.js` (add methods)
2. `backend/routes/posRoutes.js` (add routes)
3. `src/services/invoiceService.ts` (CREATE NEW)
4. `src/pages/dashboard/Sales/ManageInvoice.tsx` (major updates)

## Quick Start Command

To begin implementation, user should:

1. Confirm this plan
2. I'll create the backend API first
3. Then frontend service
4. Then integrate component
5. Finally test everything
