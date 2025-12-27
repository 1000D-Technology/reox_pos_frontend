
import { ChevronLeft, ChevronRight, Copy, DollarSign, FileText, Check, Coins, Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import TypeableSelect from '../../../components/TypeableSelect';

interface PaymentRow {
    id: string;
    name: string;
    billNumber: string;
    amount: string;
    paid: string;
    balance: string;
    date: string;
    status: 'Active' | 'Paid' | 'Pending';
}

function SupplierPayment() {
    const [supplierFilter, setSupplierFilter] = useState<string | number | null>('');
    const [billFilter, setBillFilter] = useState('');
    const [newPayment, setNewPayment] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);

    const sampleRows: PaymentRow[] = [
        {
            id: '458',
            name: 'Saman',
            billNumber: '42645456',
            amount: '45200.00',
            paid: '45200.00',
            balance: '0.00',
            date: '2025.05.01',
            status: 'Active',
        },
    ];

    // keyboard up/down navigation for table selection (same as QuatationList)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                setSelectedIndex((prev) => (prev < sampleRows.length - 1 ? prev + 1 : prev));
            } else if (e.key === 'ArrowUp') {
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [sampleRows.length]);

    return (
        <div className="flex flex-col gap-4 h-full">
            <div>
                <div className="text-sm text-gray-500 flex items-center">
                    <span>Pages</span>
                    <span className="mx-2">›</span>
                    <span className="text-black">Supplier Payments</span>
                </div>
                <h1 className="text-3xl font-semibold text-gray-500">Supplier Payments</h1>
            </div>

            {/* Top stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                {[
                    { title: 'Total Bills', value: '11', icon: <FileText size={18} />, bg: '#BBF7D0', fg: '#059669' },
                    { title: 'Total Amount', value: 'LKR.154250.00', icon: <DollarSign size={18} />, bg: '#D48AFE96', fg: '#8B5CF6' },
                    { title: 'Total Paid', value: 'LKR.154250.00', icon: <Download size={18} />, bg: '#FEF08A', fg: '#F59E0B' },
                    { title: 'Total Balance', value: 'LKR.154250.00', icon: <Coins size={18} />, bg: '#FEA18A', fg: '#EF4444' },
                    { title: 'Open Bills', value: '11', icon: <><Check size={12} /><Check size={12} /></>, bg: '#8ACAFEB2', fg: '#0284C7' },
                ].map((card) => (
                    <div key={card.title} className="bg-white rounded-md p-4 flex items-center">
                        <div style={{ background: card.bg }} className="rounded-full p-3 w-12 h-12 flex items-center justify-center">
                            <span style={{ color: card.fg }}>{card.icon}</span>
                        </div>
                        {/* vertical divider between icon and text (matches design) */}
                        {/* increased height to better match design screenshot */}
                        <div className="mx-3 w-px bg-gray-200 h-12" />
                        <div className="min-w-0">
                            <p className="text-sm truncate" style={{ color: '#8C8C8C' }}>{card.title}</p>
                            <p className="truncate text-[21px] font-semibold text-black">{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search / payment controls */}
            <div className="bg-white rounded-md p-4">

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">

                    {/* supplier filter - 3/12 */}
                    <div className="md:col-span-3 flex flex-col justify-center">
                        <label className="block text-[14px] text-gray-600 mb-1 font-bold">Supplier</label>
                        <div className="relative">
                            {/* Use reusable TypeableSelect */}
                            <TypeableSelect
                                options={sampleRows.map(s => ({ value: s.id, label: `${s.name} — ${s.id}` }))}
                                value={supplierFilter ?? ''}
                                onChange={(opt) => setSupplierFilter(opt ? opt.value : '')}
                                placeholder="Type to search supplier"
                                className="w-full text-[14px] h-10"
                            />
                        </div>
                    </div>
                    {/* bill filter - 3/12 */}
                    <div className="md:col-span-3 flex flex-col justify-center">
                        <label className="block text-[14px] text-gray-600 mb-1 font-bold">Bill Number</label>
                        <input
                            value={billFilter}
                            onChange={(e) => setBillFilter(e.target.value)}
                            placeholder="Type to select Bill Number"
                            className="w-full text-[14px] rounded-md h-10 px-4 border-2 border-gray-100"
                        />
                    </div>

                    {/* total and balance - 2/12 */}
                    <div className="md:col-span-2 flex flex-col justify-center">
                        <div className="text-[14px]" style={{ color: '#8C8C8C' }}>Total: LKR58400.00</div>
                        <div className="mt-1 text-[24px] font-semibold">
                            Balance: <span style={{ color: '#059669' }}>LKR5800.00</span>
                        </div>
                    </div>

                    {/* new payment input - 4/12 */}   
                    <div className="md:col-span-4 flex flex-col justify-center">
                        <label className="block text-[14px] text-gray-600 mb-1 font-bold">New Payment</label>
                        <div className="flex gap-2 items-center">
                            <input
                                value={newPayment}
                                onChange={(e) => setNewPayment(e.target.value)}
                                placeholder="Enter Amount"
                                className="h-10 flex-1 border border-gray-200 bg-white rounded-md text-[14px] px-4"
                                style={{ fontWeight: 600 }}
                            />
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button className="bg-emerald-600 text-white px-5 py-2 rounded-md font-semibold whitespace-nowrap">Pay Now</button>
                                <button className="px-5 py-2 rounded-md bg-gray-400 text-white whitespace-nowrap">Clear</button>
                            </div>
                        </div>
                    </div>
                    
                </div>
            </div>

            {/* Table container */}
            <div className="bg-white rounded-md p-3 flex flex-col flex-1">
                <div className="rounded-md p-2 flex-1">
                    <div className="overflow-auto h-full">
                        <div className="overflow-x-auto min-h-[360px]">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="bg-emerald-600 text-white text-left">
                                        {['Supplier ID', 'Name', 'Bill Number', 'Amount', 'Paid', 'Balance', 'Date', 'Status', 'Actions'].map((h) => (
                                            <th key={h} className="px-4 py-3 text-sm font-medium">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {sampleRows.map((r, idx) => (
                                        <tr key={r.id}
                                            onClick={() => setSelectedIndex(idx)}
                                            className={`cursor-pointer ${idx === selectedIndex ? 'bg-green-100 border-l-4 border-green-600' : 'hover:bg-green-50'}`}
                                        >
                                            <td className="px-4 py-3 text-sm">{r.id}</td>
                                            <td className="px-4 py-3 text-sm">{r.name}</td>
                                            <td className="px-4 py-3 text-sm">{r.billNumber}</td>
                                            <td className="px-4 py-3 text-sm">{r.amount}</td>
                                            <td className="px-4 py-3 text-sm">{r.paid}</td>
                                            <td className="px-4 py-3 text-sm">{r.balance}</td>
                                            <td className="px-4 py-3 text-sm">{r.date}</td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className="text-sm bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">{r.status}</span>
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        aria-label="save"
                                                        className="p-2 rounded-full flex items-center justify-center"
                                                        style={{ background: '#FFF1A8', color: '#D97706' }}
                                                    >
                                                        <FileText size={14} />
                                                    </button>

                                                    <button
                                                        aria-label="copy"
                                                        className="p-2 rounded-full flex items-center justify-center"
                                                        style={{ background: '#DFFFEA', color: '#059669' }}
                                                    >
                                                        <Copy size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                {/* Pagination placed below the bordered table with spacing */}
                <div className="flex items-center justify-center py-4">
                    <button className="flex items-center px-2 py-2 text-sm text-gray-500 hover:text-gray-700">
                        <ChevronLeft className="mr-2 h-5 w-5" /> Previous
                    </button>
                    <div className="mx-4">
                        <button className="px-4 py-2 border border-gray-300 text-sm rounded-md text-gray-700 bg-white">1</button>
                        <button className="px-4 py-2 border border-transparent text-sm rounded-md text-gray-500 hover:bg-gray-100">2</button>
                        <button className="px-4 py-2 border border-transparent text-sm rounded-md text-gray-500 hover:bg-gray-100">3</button>
                    </div>
                    <button className="flex items-center px-2 py-2 text-sm text-gray-500 hover:text-gray-700">
                        Next <ChevronRight className="ml-2 h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SupplierPayment;
