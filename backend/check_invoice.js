const prisma = require('./config/prismaClient');

async function checkInvoice() {
    try {
        // Get the latest invoice
        const invoice = await prisma.invoice.findFirst({
            orderBy: { id: 'desc' },
            include: {
                invoice_items: {
                    include: {
                        stock: {
                            include: {
                                product_variations: {
                                    include: {
                                        product: true
                                    }
                                }
                            }
                        }
                    }
                },
                invoice_payments: {
                    include: {
                        payment_types: true
                    }
                }
            }
        });
        
        if (!invoice) {
            console.log('❌ No invoices found');
            return;
        }
        
        console.log('📋 Latest Invoice Details:');
        console.log('Invoice Number:', invoice.invoice_number);
        console.log('Sub Total:', invoice.sub_total);
        console.log('Discount:', invoice.discount);
        console.log('Total:', invoice.total);
        console.log('\n📦 Items:');
        
        let calculatedSubtotal = 0;
        invoice.invoice_items.forEach((item, index) => {
            const itemTotal = item.current_price * item.qty;
            const itemDiscount = (itemTotal * item.discount_percentage / 100) + item.discount_amount;
            const itemFinal = itemTotal - itemDiscount;
            calculatedSubtotal += itemFinal;
            
            console.log(`  ${index + 1}. ${item.stock.product_variations.product.product_name}`);
            console.log(`     Price: ${item.current_price} x Qty: ${item.qty} = ${itemTotal}`);
            console.log(`     Discount: ${item.discount_percentage}% + ${item.discount_amount} = ${itemDiscount}`);
            console.log(`     Item Total: ${itemFinal}`);
        });
        
        console.log('\n💰 Payments:');
        invoice.invoice_payments.forEach((payment) => {
            console.log(`  ${payment.payment_types.payment_types}: ${payment.amount}`);
        });
        
        console.log('\n🧮 Calculation Check:');
        console.log('Calculated Subtotal:', calculatedSubtotal);
        console.log('Stored Subtotal:', invoice.sub_total);
        console.log('Stored Total:', invoice.total);
        console.log('Expected Total (Subtotal - Discount):', calculatedSubtotal - invoice.discount);
        
        if (invoice.total !== calculatedSubtotal - invoice.discount) {
            console.log('\n⚠️  MISMATCH DETECTED!');
            console.log('Difference:', invoice.total - (calculatedSubtotal - invoice.discount));
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkInvoice();
