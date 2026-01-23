import { useState, useEffect } from 'react';
import { 
    Calendar, 
    Download, 
    Filter, 
    TrendingUp, 
    DollarSign, 
    Package, 
    Loader2,
    PieChart as PieChartIcon,
    ChevronRight
} from 'lucide-react';
import { reportService } from '../../services/reportService';
import toast, { Toaster } from 'react-hot-toast';
import * as XLSX from 'xlsx';
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
    Filler
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

interface ReportData {
    id: string;
    date: string;
    totalSales: number;
    totalOrders: number;
    profit: number;
    totalProducts: number;
    tax: number;
    discount: number;
}

interface ReportFilter {
    dateFrom: string;
    dateTo: string;
    reportType: string;
}

function Reports() {
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [filteredData, setFilteredData] = useState<ReportData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFiltering, setIsFiltering] = useState(false);
    const [selectedReportId, setSelectedReportId] = useState<string>('daily');
    const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
    const [filter, setFilter] = useState<ReportFilter>({
        dateFrom: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        dateTo: new Date().toISOString().split('T')[0],
        reportType: 'daily'
    });

    const reportHub = [
        { id: 'daily', name: 'Daily Sales', icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50', desc: 'Daily efficiency metrics' },
        { id: 'monthly', name: 'Monthly Summary', icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50', desc: 'Month-over-month yield' },
        { id: 'financial', name: 'Profit Matrix', icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50', desc: 'Net margin analysis' },
        { id: 'top_products', name: 'Elite Inventory', icon: Package, color: 'text-purple-600', bg: 'bg-purple-50', desc: 'High volume inventory' }
    ];

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [dash, filtered] = await Promise.all([
                reportService.getDashboardData(),
                reportService.getFilteredReport(filter)
            ]);
            if (dash.success) setDashboardData(dash.data);
            if (filtered.success) setFilteredData(filtered.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            // toast.error('Failed to sync report data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleFilterChange = (field: keyof ReportFilter, value: string) => {
        setFilter(prev => ({ ...prev, [field]: value }));
    };

    const handleFilterApply = async () => {
        try {
            setIsFiltering(true);
            const response = await reportService.getFilteredReport(filter);
            if (response.success) setFilteredData(response.data);
        } finally {
            setIsFiltering(false);
        }
    };

    const handleDownload = async (reportId: string) => {
        try {
            toast.loading(`Preparing ${reportId.replace('_', ' ')} export...`);
            let dataToExport = [];
            const fileName = `${reportId}_report_${new Date().toISOString().split('T')[0]}`;

            if (reportId === 'financial') {
                const stats = dashboardData?.summary || {};
                dataToExport = [{ Metric: 'Gross Revenue', Value: stats.totalSales }, { Metric: 'Net Profit', Value: stats.totalProfit }, { Metric: 'Volume', Value: stats.totalOrders }];
            } else if (reportId === 'top_products') {
                dataToExport = dashboardData.topProducts.map((p: any) => ({ 'Product': p.name, 'Revenue': p.revenue, 'Quantity': p.sales }));
            } else {
                const res = await reportService.getFilteredReport({ ...filter, reportType: reportId });
                if (res.success) dataToExport = res.data.map((r: any) => ({ 'Date/Period': r.date, 'Sales': r.totalSales, 'Profit': r.profit, 'Invoices': r.totalOrders }));
            }

            if (dataToExport.length === 0) { toast.dismiss(); toast.error('No records to export'); return; }

            const ws = XLSX.utils.json_to_sheet(dataToExport);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
            XLSX.writeFile(wb, `${fileName}.xlsx`);
            toast.dismiss();
            toast.success('Ready for download');
        } catch (error) { toast.dismiss(); toast.error('Export interrupted'); }
    };

    if (isLoading) return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-emerald-500" /></div>;

    return (
        <div className="p-1 space-y-6">
            <Toaster position="top-right" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Financial Intelligence</h1>
                    <p className="text-sm text-gray-500">Analyze business dynamics and export granular records</p>
                </div>
                <div className="flex gap-2">
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm text-xs font-bold text-gray-500">
                        <TrendingUp size={14} className="text-emerald-500" />
                        Live Status
                    </div>
                </div>
            </div>

            {/* Quick Export Hub - Redesigned */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {reportHub.map((r) => (
                    <div 
                        key={r.id}
                        className={`bg-white p-5 rounded-xl border transition-all group relative overflow-hidden ${selectedReportId === r.id ? 'border-emerald-500 ring-4 ring-emerald-50' : 'border-gray-100 hover:border-emerald-200'}`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`${r.bg} ${r.color} p-2.5 rounded-xl transition-transform group-hover:scale-110`}>
                                <r.icon size={20} />
                            </div>
                            <button 
                                onClick={() => handleDownload(r.id)}
                                className="p-2 text-gray-300 hover:text-emerald-500 transition-colors"
                                title="Download Excel"
                            >
                                <Download size={16} />
                            </button>
                        </div>
                        <div>
                             <h4 className="text-sm font-bold text-gray-800 mb-1">{r.name}</h4>
                             <p className="text-[10px] font-medium text-gray-400">{r.desc}</p>
                        </div>
                        <button 
                            onClick={() => setSelectedReportId(r.id)}
                            className="absolute bottom-4 right-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-6">
                    {/* Charts Section */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                         <div className="flex items-center justify-between mb-8">
                             <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <TrendingUp size={18} className="text-emerald-500" />
                                Interactive Yield Analytics
                             </h3>
                             <div className="flex gap-2 bg-gray-50 p-1 rounded-lg border border-gray-100">
                                <button onClick={() => setViewMode('chart')} className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${viewMode === 'chart' ? 'bg-white text-emerald-600 shadow-sm border border-gray-100' : 'text-gray-400'}`}>Visualize</button>
                                <button onClick={() => setViewMode('table')} className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${viewMode === 'table' ? 'bg-white text-emerald-600 shadow-sm border border-gray-100' : 'text-gray-400'}`}>Records</button>
                             </div>
                         </div>
                         <div className="min-h-[350px]">
                            {viewMode === 'chart' ? (
                                <Bar 
                                    data={{
                                        labels: filteredData.map(d => d.date.split('-').slice(1).join('/')),
                                        datasets: [{ label: 'Sales Yield', data: filteredData.map(d => d.totalSales), backgroundColor: '#10b981', borderRadius: 8, barThickness: 15 }]
                                    }}
                                    options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { display: false }, x: { grid: { display: false }, ticks: { font: { size: 9, weight: 'bold' } } } } } as any}
                                />
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            <tr>
                                                <th className="px-4 py-3">Date</th>
                                                <th className="px-4 py-3 text-right">Yield</th>
                                                <th className="px-4 py-3 text-right">Margin</th>
                                                <th className="px-4 py-3 text-center">Volume</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {filteredData.map((r, i) => (
                                                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-4 py-4 text-xs font-mono font-bold text-gray-400">{r.date}</td>
                                                    <td className="px-4 py-4 text-sm font-bold text-right text-gray-900">Rs. {r.totalSales.toLocaleString()}</td>
                                                    <td className="px-4 py-4 text-sm font-bold text-right text-emerald-600">Rs. {r.profit.toLocaleString()}</td>
                                                    <td className="px-4 py-4 text-center">
                                                        <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">{r.totalOrders} INV</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                         </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                    {/* Filters Section */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <Filter size={16} className="text-emerald-500" />
                            Configuration
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Start Date</label>
                                <input type="date" value={filter.dateFrom} onChange={(e) => handleFilterChange('dateFrom', e.target.value)} className="w-full text-xs font-bold bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/10" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">End Date</label>
                                <input type="date" value={filter.dateTo} onChange={(e) => handleFilterChange('dateTo', e.target.value)} className="w-full text-xs font-bold bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/10" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Aggregation</label>
                                <select value={filter.reportType} onChange={(e) => handleFilterChange('reportType', e.target.value)} className="w-full text-xs font-bold bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/10">
                                    <option value="daily">Daily Periodic</option>
                                    <option value="weekly">Weekly Summary</option>
                                    <option value="monthly">Monthly Overview</option>
                                </select>
                            </div>
                            <button onClick={handleFilterApply} className="w-full py-3 bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all">
                                {isFiltering ? <Loader2 className="animate-spin mx-auto" size={16} /> : "Update Analytics"}
                            </button>
                        </div>
                    </div>

                    {/* Doughnut Distribution */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                         <h3 className="text-sm font-bold text-gray-800 mb-6 flex items-center gap-2">
                             <PieChartIcon size={16} className="text-purple-500" />
                             Elite Composition
                         </h3>
                         <div className="h-[200px] flex items-center justify-center">
                            {dashboardData?.topProducts?.length > 0 ? (
                                <Doughnut 
                                    data={{
                                        labels: dashboardData.topProducts.map((p: any) => p.name),
                                        datasets: [{ data: dashboardData.topProducts.map((p: any) => p.revenue), backgroundColor: ['#10b981', '#3b82f6', '#6366f1', '#a855f7', '#f59e0b'], borderWidth: 0 }]
                                    }}
                                    options={{ responsive: true, cutout: '75%', plugins: { legend: { display: false } } }}
                                />
                            ) : (
                                <p className="text-xs text-gray-300 italic">Composition data loading...</p>
                            )}
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Reports;