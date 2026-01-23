import { ShoppingCart, RotateCcw, BanknoteIcon, ArrowUpDown } from 'lucide-react';

interface POSHeaderProps {
    billingMode: 'retail' | 'wholesale';
    onBillingModeChange: (mode: 'retail' | 'wholesale') => void;
    onCashManage: () => void;
    onBulkLoose: () => void;
    onReturn: () => void;
}

export const POSHeader = ({
    billingMode,
    onBillingModeChange,
    onCashManage,
    onBulkLoose,
    onReturn
}: POSHeaderProps) => {
    return (
        <div className="mb-3 flex items-center justify-between bg-white rounded-2xl border border-gray-200 p-3">
            <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-md">
                    <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-800">POS Terminal</h1>
                    <p className="text-xs text-gray-500">Fast Billing System</p>
                </div>
            </div>

            {/* Billing Mode Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-xl">
                <button
                    onClick={() => onBillingModeChange('retail')}
                    className={`px-5 py-2 rounded-lg font-semibold transition-all text-sm ${billingMode === 'retail'
                        ? 'bg-emerald-500 text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    Retail
                </button>
                <button
                    onClick={() => onBillingModeChange('wholesale')}
                    className={`px-5 py-2 rounded-lg font-semibold transition-all text-sm ${billingMode === 'wholesale'
                        ? 'bg-emerald-500 text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    Wholesale
                </button>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={onCashManage}
                    className="px-4 py-2.5 bg-cyan-50 hover:bg-cyan-100 rounded-xl transition-colors flex items-center gap-2 text-cyan-700 font-semibold group"
                >
                    <BanknoteIcon className="w-4 h-4" />
                    Cash Manage
                    <span className="text-xs bg-cyan-200 px-1.5 py-0.5 rounded">F1</span>
                </button>
                <button
                    onClick={onBulkLoose}
                    className="px-4 py-2.5 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors flex items-center gap-2 text-purple-700 font-semibold"
                >
                    <ArrowUpDown className="w-4 h-4" />
                    Bulk-Loose
                    <span className="text-xs bg-purple-200 px-1.5 py-0.5 rounded">F2</span>
                </button>
                <button
                    onClick={onReturn}
                    className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors flex items-center gap-2 text-amber-700 font-semibold"
                >
                    <RotateCcw className="w-4 h-4" />
                    Return
                    <span className="text-xs bg-amber-200 px-1.5 py-0.5 rounded">F3</span>
                </button>
            </div>
        </div>
    );
};