import { useState } from 'react';
import { Calendar, Download, Filter, TrendingUp, DollarSign, ShoppingCart, Users, Package, BarChart3, PieChart, LineChart, FileText, Eye } from 'lucide-react';

interface ReportData {
    id: string;
    date: string;
    totalSales: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
    profit: number;
    tax: number;
    discount: number;
}

interface ReportFilter {
    dateFrom: string;
    dateTo: string;
    reportType: string;
    category: string;
    status: string;
}

interface ChartData {
    label: string;
    value: number;
    color: string;
}

function Reports() {
    const [selectedReport, setSelectedReport] = useState<string>('daily');
    const [filter, setFilter] = useState<ReportFilter>({
        dateFrom: new Date().toISOString().split('T')[0],
        dateTo: new Date().toISOString().split('T')[0],
        reportType: 'daily',
        category: 'all',
        status: 'all'
    });
    const [showFilter, setShowFilter] = useState<boolean>(true);
    const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');

    const reportTypes = [
        { id: 'daily', name: 'Daily Sales Report', icon: Calendar, color: 'bg-green-500', desc: 'Daily sales analysis' },
        { id: 'weekly', name: 'Weekly Sales Report', icon: TrendingUp, color: 'bg-green-600', desc: 'Weekly performance' },
        { id: 'monthly', name: 'Monthly Sales Report', icon: DollarSign, color: 'bg-green-700', desc: 'Monthly overview' },
        { id: 'products', name: 'Product Sales Report', icon: Package, color: 'bg-emerald-500', desc: 'Product performance' },
        { id: 'customers', name: 'Customer Report', icon: Users, color: 'bg-emerald-600', desc: 'Customer insights' },
        { id: 'orders', name: 'Order History Report', icon: ShoppingCart, color: 'bg-emerald-700', desc: 'Order analytics' },
        { id: 'profit', name: 'Profit & Loss Report', icon: TrendingUp, color: 'bg-green-500', desc: 'P&L statement' },
        { id: 'tax', name: 'Tax Report', icon: FileText, color: 'bg-green-600', desc: 'Tax calculations' },
        { id: 'inventory', name: 'Inventory Report', icon: Package, color: 'bg-green-700', desc: 'Stock analysis' }
    ];

    const mockReportData: ReportData[] = [
        { id: '1', date: '2024-01-15', totalSales: 5420.50, totalOrders: 45, totalCustomers: 38, totalProducts: 120, profit: 1250.30, tax: 542.05, discount: 120.00 },
        { id: '2', date: '2024-01-14', totalSales: 4890.25, totalOrders: 39, totalCustomers: 35, totalProducts: 98, profit: 1100.50, tax: 489.03, discount: 95.50 },
        { id: '3', date: '2024-01-13', totalSales: 6150.75, totalOrders: 52, totalCustomers: 42, totalProducts: 145, profit: 1580.20, tax: 615.08, discount: 150.00 },
        { id: '4', date: '2024-01-12', totalSales: 3890.00, totalOrders: 31, totalCustomers: 28, totalProducts: 85, profit: 920.40, tax: 389.00, discount: 75.00 },
        { id: '5', date: '2024-01-11', totalSales: 5680.90, totalOrders: 48, totalCustomers: 40, totalProducts: 132, profit: 1340.60, tax: 568.09, discount: 110.00 }
    ];

    const chartData: ChartData[] = [
        { label: 'Sales', value: 26032.40, color: 'bg-green-500' },
        { label: 'Profit', value: 6191.00, color: 'bg-emerald-500' },
        { label: 'Tax', value: 2603.25, color: 'bg-lime-500' },
        { label: 'Discount', value: 550.50, color: 'bg-teal-500' }
    ];

    const topProducts = [
        { name: 'Product A', sales: 1250, revenue: 15000, percentage: 28 },
        { name: 'Product B', sales: 980, revenue: 12500, percentage: 23 },
        { name: 'Product C', sales: 750, revenue: 9800, percentage: 18 },
        { name: 'Product D', sales: 620, revenue: 7500, percentage: 14 },
        { name: 'Product E', sales: 450, revenue: 5200, percentage: 10 }
    ];

    const handleFilterChange = (field: keyof ReportFilter, value: string) => {
        setFilter(prev => ({ ...prev, [field]: value }));
    };

    const generateReport = () => {
        console.log('Generating report with filter:', filter);
    };

    const exportReport = (format: 'pdf' | 'excel' | 'csv') => {
        console.log(`Exporting report as ${format}`);
    };

    const totalSales = mockReportData.reduce((sum, item) => sum + item.totalSales, 0);
    const totalProfit = mockReportData.reduce((sum, item) => sum + item.profit, 0);
    const totalOrders = mockReportData.reduce((sum, item) => sum + item.totalOrders, 0);
    const avgOrderValue = totalSales / totalOrders;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Advanced Reports & Analytics</h1>
                <p className="text-gray-600">Comprehensive business intelligence and reporting system</p>
            </div>

            {/* Summary Cards - Accounts Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {[
                    {
                        icon: DollarSign,
                        label: 'Total Sales',
                        value: `Rs. ${totalSales.toFixed(2)}`,
                        trend: '+12.5%',
                        color: 'bg-gradient-to-br from-green-500 to-green-600',
                        iconColor: 'text-white',
                        bgGlow: ''
                    },
                    {
                        icon: TrendingUp,
                        label: 'Total Profit',
                        value: `Rs. ${totalProfit.toFixed(2)}`,
                        trend: '+8.3%',
                        color: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
                        iconColor: 'text-white',
                        bgGlow: ''
                    },
                    {
                        icon: ShoppingCart,
                        label: 'Total Orders',
                        value: totalOrders.toString(),
                        trend: '+15.7%',
                        color: 'bg-gradient-to-br from-green-500 to-green-600',
                        iconColor: 'text-white',
                        bgGlow: ''
                    },
                    {
                        icon: BarChart3,
                        label: 'Avg Order Value',
                        value: `Rs. ${avgOrderValue.toFixed(2)}`,
                        trend: '+5.2%',
                        color: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
                        iconColor: 'text-white',
                        bgGlow: ''
                    }
                ].map((stat, i) => (
                    <div
                        key={i}
                        className={`flex items-center p-4 space-x-3 bg-white rounded-2xl border border-gray-200 cursor-pointer group relative overflow-hidden`}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-gray-50/50 to-transparent opacity-0 group-hover:opacity-100 duration-300"></div>

                        <div className={`p-3 rounded-full ${stat.color} relative z-10`}>
                            <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                        </div>

                        <div className="w-px h-10 bg-gray-200"></div>

                        <div className="relative z-10 flex-1">
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-gray-500">{stat.label}</p>
                                <span className="text-xs font-semibold text-green-600 flex items-center">
                                    {stat.trend}
                                </span>
                            </div>
                            <p className="text-sm font-bold text-gray-700">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                        <Filter className="w-5 h-5 text-green-600" />
                        Advanced Filters
                    </h2>
                    <button
                        onClick={() => setShowFilter(!showFilter)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                        {showFilter ? 'Hide Filters' : 'Show Filters'}
                    </button>
                </div>

                {showFilter && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                                <input
                                    type="date"
                                    value={filter.dateFrom}
                                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                                <input
                                    type="date"
                                    value={filter.dateTo}
                                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                                <select
                                    value={filter.reportType}
                                    onChange={(e) => handleFilterChange('reportType', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="quarterly">Quarterly</option>
                                    <option value="yearly">Yearly</option>
                                    <option value="custom">Custom Range</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                <select
                                    value={filter.category}
                                    onChange={(e) => handleFilterChange('category', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    <option value="all">All Categories</option>
                                    <option value="electronics">Electronics</option>
                                    <option value="clothing">Clothing</option>
                                    <option value="food">Food & Beverage</option>
                                    <option value="accessories">Accessories</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                <select
                                    value={filter.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    <option value="all">All Status</option>
                                    <option value="completed">Completed</option>
                                    <option value="pending">Pending</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={generateReport}
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                            >
                                Generate Report
                            </button>
                            <button
                                onClick={() => exportReport('pdf')}
                                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                            >
                                Export PDF
                            </button>
                            <button
                                onClick={() => exportReport('excel')}
                                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
                            >
                                Export Excel
                            </button>
                            <button
                                onClick={() => exportReport('csv')}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                            >
                                Export CSV
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Report Type Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {reportTypes.map((report) => (
                    <div
                        key={report.id}
                        onClick={() => setSelectedReport(report.id)}
                        className={`bg-white rounded-lg border border-gray-200 p-6 cursor-pointer hover:bg-gray-50 ${selectedReport === report.id ? 'ring-2 ring-green-500' : ''
                            }`}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`${report.color} p-3 rounded-lg`}>
                                <report.icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex gap-2">
                                <Eye className="w-5 h-5 text-gray-400 hover:text-green-600 cursor-pointer" />
                                <Download className="w-5 h-5 text-gray-400 hover:text-green-600 cursor-pointer" />
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">{report.name}</h3>
                        <p className="text-sm text-gray-600">{report.desc}</p>
                        {selectedReport === report.id && (
                            <div className="mt-3 text-xs text-green-600 font-medium">
                                ✓ Currently Selected
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Chart and Top Products Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Visual Analytics Chart */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-gray-800">Financial Overview</h3>
                        <PieChart className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="space-y-4">
                        {chartData.map((item, index) => (
                            <div key={index}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                                    <span className="text-sm font-bold text-gray-900">Rs. {item.value.toFixed(2)}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className={`${item.color} h-3 rounded-full`}
                                        style={{ width: `${(item.value / chartData[0].value) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-gray-800">Top Selling Products</h3>
                        <Package className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="space-y-4">
                        {topProducts.map((product, index) => (
                            <div key={index} className="flex items-center gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <span className="text-green-600 font-bold text-sm">{index + 1}</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium text-gray-800">{product.name}</span>
                                        <span className="text-sm font-bold text-green-600">Rs. {product.revenue.toFixed(0)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-green-500 h-2 rounded-full"
                                                style={{ width: `${product.percentage}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-gray-500">{product.percentage}%</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* View Mode Toggle */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">Report Data View</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setViewMode('table')}
                            className={`px-4 py-2 rounded-lg ${viewMode === 'table' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <FileText className="w-5 h-5 inline mr-2" />
                            Table View
                        </button>
                        <button
                            onClick={() => setViewMode('chart')}
                            className={`px-4 py-2 rounded-lg ${viewMode === 'chart' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <LineChart className="w-5 h-5 inline mr-2" />
                            Chart View
                        </button>
                    </div>
                </div>
            </div>

            {/* Report Data Table */}
            {viewMode === 'table' && (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="p-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                        <h3 className="text-xl font-semibold">Detailed Report - {reportTypes.find(r => r.id === selectedReport)?.name}</h3>
                        <p className="text-sm text-green-100 mt-1">Showing {mockReportData.length} entries</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b-2 border-green-600">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Total Sales</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Profit</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Orders</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Customers</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Products</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Tax</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Discount</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {mockReportData.map((data) => (
                                    <tr key={data.id} className="hover:bg-green-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{data.date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">Rs. {data.totalSales.toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-emerald-600">Rs. {data.profit.toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{data.totalOrders}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{data.totalCustomers}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{data.totalProducts}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">Rs. {data.tax.toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">-Rs. {data.discount.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-green-50 border-t-2 border-green-600">
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">TOTALS</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">Rs. {totalSales.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-600">Rs. {totalProfit.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{totalOrders}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900" colSpan={4}></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}

            {/* Chart View */}
            {viewMode === 'chart' && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-6">Sales Trend Analysis</h3>
                    <div className="h-96 flex items-end justify-between gap-4">
                        {mockReportData.map((data) => {
                            const maxSales = Math.max(...mockReportData.map(d => d.totalSales));
                            const height = (data.totalSales / maxSales) * 100;
                            return (
                                <div key={data.id} className="flex-1 flex flex-col items-center">
                                    <div className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg hover:from-green-600 hover:to-green-500 cursor-pointer relative group" style={{ height: `${height}%` }}>
                                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 whitespace-nowrap">
                                            Rs. {data.totalSales.toFixed(2)}
                                        </div>
                                    </div>
                                    <div className="mt-2 text-xs text-gray-600 font-medium">{data.date.slice(5)}</div>
                                    <div className="text-xs text-gray-500">{data.totalOrders} orders</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Reports;