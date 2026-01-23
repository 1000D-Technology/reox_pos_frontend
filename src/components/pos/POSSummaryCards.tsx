import { ShoppingBag, DollarSign, Tag, Receipt } from 'lucide-react';
interface POSSummaryCardsProps {
    itemsCount: number;
    subtotal: number;
    discount: number;
    total: number;
}

export const POSSummaryCards = ({
    itemsCount,
    subtotal,
    discount,
    total
}: POSSummaryCardsProps) => {
    const summaryCards = [
        { label: 'Items', value: itemsCount, icon: ShoppingBag, color: 'text-emerald-600' },
        { label: 'Subtotal', value: `Rs ${subtotal.toFixed(2)}`, icon: DollarSign, color: 'text-blue-600' },
        { label: 'Discount', value: `${discount}%`, icon: Tag, color: 'text-orange-600' },
        { label: 'Total', value: `Rs ${total.toFixed(2)}`, icon: Receipt, color: 'text-purple-600' },
    ];

    return (

        <div className="grid grid-cols-4 gap-3 mb-3">
            {summaryCards.map((stat, i) => (
                <div
                    key={i}
                    className="flex items-center p-3 space-x-3 transition-all bg-white rounded-2xl border border-gray-200 cursor-pointer group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-emerald-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className={`p-2.5 rounded-full ${stat.color} bg-opacity-10 shadow-md relative z-10`}>
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div className="w-px h-8 bg-gray-200"></div>
                    <div className="relative z-10 flex-1">
                        <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                        <p className="text-lg font-bold text-gray-800">{stat.value}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};
