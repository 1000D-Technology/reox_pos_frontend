import {
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Loader2,
    DollarSign,
    Package,
    Clock,
    Star,
    Laptop,
    FileSpreadsheet,
    UserCheck,
    Users,
    Zap,
    BadgeInfo,
    PieChart as PieChartIcon,
    BarChart3
} from "lucide-react";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import { useEffect, useState } from "react";
import { reportService } from "../../services/reportService";
import { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

export default function Dashboard() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [chartData, setChartData] = useState<any>(null);

    const fetchDashboardData = async () => {
        try {
            setIsLoading(true);
            const [detailed, trend] = await Promise.all([
                reportService.getDetailedDashboardData(),
                reportService.getDashboardData()
            ]);

            if (detailed.success) setDashboardData(detailed.data);
            if (trend.success) setChartData(trend.data);
        } catch (error) {
            console.error("Dashboard load error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
            </div>
        );
    }

    const { stats, summary, topProducts, categories } = dashboardData || {};

    const metrics = [
        { icon: DollarSign, label: "Today's Sales", value: `Rs. ${stats?.todaySales.toLocaleString()}`, trend: stats?.trends.sales, color: "text-emerald-600", bg: "bg-emerald-50" },
        { icon: FileSpreadsheet, label: "Invoices", value: stats?.todayInvoices.toString(), trend: stats?.trends.invoices, color: "text-blue-600", bg: "bg-blue-50" },
        { icon: UserCheck, label: "Suppliers", value: stats?.supplierCount.toString(), trend: stats?.trends.suppliers, color: "text-indigo-600", bg: "bg-indigo-50" },
        { icon: Package, label: "Products", value: stats?.productCount.toString(), trend: stats?.trends.products, color: "text-purple-600", bg: "bg-purple-50" },
        { icon: Users, label: "Customers", value: stats?.customerCount.toString(), trend: stats?.trends.customers, color: "text-cyan-600", bg: "bg-cyan-50" },
        { icon: Zap, label: "Staff", value: stats?.employeeCount.toString(), trend: stats?.trends.employees, color: "text-amber-600", bg: "bg-amber-50" },
        { icon: BadgeInfo, label: "Low Stock", value: stats?.lowStockCount.toString(), trend: stats?.trends.lowStock, color: "text-rose-600", bg: "bg-rose-50" },
    ];

    return (
        <div className="p-1 space-y-6">
            <Toaster position="top-right" />
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 tracking-tight">System Overview</h1>
                    <p className="text-sm text-gray-500">Real-time business intelligence dashboard</p>
                </div>
                <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                    <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600">
                        <Clock size={20} />
                    </div>
                    <div className="pr-2">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Current Time</p>
                        <p className="text-sm font-bold text-gray-700 tabular-nums"><CurrentTime /></p>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                {metrics.map((m, i) => (
                    <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex items-start justify-between mb-3">
                            <div className={`${m.bg} ${m.color} p-2.5 rounded-xl transition-transform group-hover:scale-110 duration-300`}>
                                <m.icon size={20} />
                            </div>
                            <div className={`flex items-center text-[10px] font-bold ${m.trend?.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {m.trend?.startsWith('+') ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                {m.trend}
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">{m.label}</p>
                            <p className="text-lg font-bold text-gray-800 tracking-tight">{m.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts & Summary Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <TrendingUp size={20} className="text-emerald-500" />
                                Sales Performance
                            </h3>
                            <p className="text-xs text-gray-500">Daily revenue trends</p>
                        </div>
                        <div className="flex gap-2 p-1 bg-gray-50 rounded-lg border border-gray-100">
                             <span className="px-3 py-1 text-[10px] font-bold bg-white text-emerald-600 shadow-sm border border-gray-100 rounded-md">Last 30 Days</span>
                        </div>
                    </div>
                    <div className="h-[300px]">
                        <SalesTrendChart data={chartData?.dailySales} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <DollarSign size={20} className="text-blue-500" />
                        Monthly Summary
                    </h3>
                    <div className="space-y-4 flex-1">
                        <SummaryItem label="Gross Sales" value={summary?.totalSales} color="text-emerald-600" />
                        <SummaryItem label="Total Discounts" value={summary?.totalDiscount} color="text-blue-400" />
                        <SummaryItem label="Net Profit" value={summary?.totalProfit} color="text-indigo-600" isMain />
                        <div className="pt-4 mt-2 border-t border-gray-50">
                             <SummaryItem label="Misc. Expenses" value={summary?.totalExpenses} color="text-gray-400" isSmall />
                        </div>
                    </div>
                    <div className="mt-6 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                         <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Current Cycle</p>
                         <p className="text-sm font-bold text-emerald-900">{summary?.monthName} {summary?.year}</p>
                    </div>
                </div>
            </div>

            {/* Middle Row: New Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <PieChartIcon size={20} className="text-purple-500" />
                        Stock Allocation by Category
                    </h3>
                    <div className="h-[300px]">
                        <CategoryDistChart data={categories} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <BarChart3 size={20} className="text-amber-500" />
                        Inventory Health Metrics
                    </h3>
                    <div className="h-[300px]">
                         <InventoryHealthChart lowStock={stats?.lowStockCount} totalProducts={stats?.productCount} />
                    </div>
                </div>
            </div>

            {/* Bottom Row: Top Products & Infrastructure */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <Star size={20} className="text-amber-400 fill-amber-400" />
                            Elite Product Matrix
                        </h3>
                        <button 
                            onClick={() => navigate('/stock')}
                            className="text-xs font-bold text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors border border-emerald-100"
                        >
                            Explore Inventory
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                <tr>
                                    <th className="px-6 py-4 rounded-l-xl">SKU REF</th>
                                    <th className="px-6 py-4">Product Name</th>
                                    <th className="px-6 py-4 text-right">Unit Price</th>
                                    <th className="px-6 py-4 text-center rounded-r-xl">Sales Volume</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {topProducts?.map((p: any, i: number) => (
                                    <tr key={i} className="hover:bg-gray-50/30 transition-colors group">
                                        <td className="px-6 py-4 text-xs font-mono font-bold text-gray-300">{p.id}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-700">{p.name}</td>
                                        <td className="px-6 py-4 text-sm font-black text-right text-gray-800 tracking-tight">Rs. {p.mrp}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm">{p.quantity} Units</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-4">
                     <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full flex flex-col">
                        <h3 className="text-sm font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <Laptop size={18} className="text-blue-500" />
                            Engine Health
                        </h3>
                        <div className="space-y-8 flex-1">
                             <HealthBar label="Database Cluster" value={22} color="bg-indigo-500" />
                             <HealthBar label="Memory Utilization" value={58} color="bg-blue-500" />
                             <HealthBar label="Compute Load" value={34} color="bg-emerald-500" />
                        </div>
                        <div className="mt-8 pt-6 border-t border-gray-50 flex items-center gap-3">
                             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sytem Operational</span>
                        </div>
                     </div>
                </div>
            </div>
        </div>
    );
}

function SummaryItem({ label, value, color, isMain = false, isSmall = false }: any) {
    return (
        <div className={`flex justify-between items-center ${isMain ? 'p-5 bg-gradient-to-br from-emerald-50 to-white rounded-2xl border border-emerald-100 shadow-sm shadow-emerald-50' : 'px-2'}`}>
            <span className={`font-bold transition-all ${isSmall ? 'text-[10px] text-gray-400 uppercase tracking-widest' : 'text-xs text-gray-500'}`}>{label}</span>
            <span className={`font-black tracking-tighter ${color || 'text-gray-800'} ${isMain ? 'text-2xl' : 'text-sm'}`}>
                Rs. {value?.toLocaleString() || "0"}
            </span>
        </div>
    );
}

function HealthBar({ label, value, color }: any) {
    return (
        <div className="space-y-3">
            <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-gray-400">
                <span>{label}</span>
                <span className="text-gray-800 font-black">{value}%</span>
            </div>
            <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                <div className={`h-full ${color} rounded-full transition-all duration-1000 shadow-sm`} style={{ width: `${value}%` }} />
            </div>
        </div>
    );
}

function SalesTrendChart({ data }: { data: any[] }) {
    if (!data || data.length === 0) return <div className="h-full flex items-center justify-center text-gray-300 font-bold italic">No transaction records found...</div>;

    const chartData = {
        labels: data.map(d => d.date.split('-').slice(1).join('/')),
        datasets: [{
            label: 'Sales (Rs.)',
            data: data.map(d => d.totalSales),
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.05)',
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            pointRadius: 4,
            pointBackgroundColor: '#fff',
            pointBorderColor: '#10b981',
            pointBorderWidth: 2,
            pointHoverRadius: 6,
            pointHoverBorderWidth: 3,
        }]
    };

    return (
        <Line 
            data={chartData} 
            options={{ 
                responsive: true, 
                maintainAspectRatio: false, 
                plugins: { legend: { display: false } },
                scales: { 
                    y: { grid: { color: '#f3f4f6', borderDash: [5, 5] }, ticks: { font: { size: 10, weight: 'bold' } } },
                    x: { grid: { display: false }, ticks: { font: { size: 10, weight: 'bold' } } }
                }
            } as any} 
        />
    );
}

function CategoryDistChart({ data }: { data: any[] }) {
    if (!data || data.length === 0) return <div className="h-full flex items-center justify-center text-gray-300 font-bold">Data loading...</div>;
    return (
        <Doughnut 
            data={{
                labels: data.map(d => d.name),
                datasets: [{ 
                    data: data.map(d => d.value), 
                    backgroundColor: ['#10b981', '#3b82f6', '#6366f1', '#a855f7', '#f59e0b', '#ec4899'],
                    hoverOffset: 20,
                    borderWidth: 4,
                    borderColor: '#fff'
                }]
            }}
            options={{ 
                responsive: true, 
                maintainAspectRatio: false, 
                cutout: '70%',
                plugins: { 
                    legend: { 
                        position: 'right',
                        labels: { boxWidth: 12, padding: 20, font: { weight: 'bold', size: 11 } }
                    } 
                } 
            } as any}
        />
    );
}

function InventoryHealthChart({ lowStock, totalProducts }: { lowStock: number, totalProducts: number }) {
    const normalStock = Math.max(0, totalProducts - lowStock);
    return (
        <Bar 
            data={{
                labels: ['Low Stock', 'Stable Stock'],
                datasets: [{
                    label: 'Items',
                    data: [lowStock, normalStock],
                    backgroundColor: ['#f43f5e', '#10b981'],
                    borderRadius: 12,
                    barThickness: 40
                }]
            }}
            options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: '#f3f4f6' }, ticks: { font: { weight: 'bold' } } },
                    x: { grid: { display: false }, ticks: { font: { weight: 'bold' } } }
                }
            } as any}
        />
    );
}

function CurrentTime() {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);
    return <>{time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</>;
}