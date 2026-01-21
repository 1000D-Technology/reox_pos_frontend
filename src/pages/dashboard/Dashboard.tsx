import {
    ChartNoAxesCombined,
    FileSpreadsheet,
    UserCheck,
    Boxes,
    Users,
    Zap,
    BadgeInfo,
    SunDim,
    Star,
    Laptop,
    Moon,
    type LucideIcon,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ArcElement,
    BarElement,
} from "chart.js";
import { useEffect, useState } from "react";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, ArcElement, BarElement);

export default function Dashboard() {
    const stats = [
        { icon: ChartNoAxesCombined, label: "Today Sales", value: "LKR 500,000.00", trend: "+12%", color: "bg-gradient-to-br from-emerald-400 to-emerald-500", iconColor: "text-white" },
        { icon: FileSpreadsheet, label: "Today Invoice", value: "20", trend: "+8%", color: "bg-gradient-to-br from-blue-400 to-blue-500", iconColor: "text-white" },
        { icon: UserCheck, label: "Supplier", value: "20", trend: "+5%", color: "bg-gradient-to-br from-red-400 to-red-500", iconColor: "text-white" },
        { icon: Boxes, label: "Product", value: "20", trend: "+15%", color: "bg-gradient-to-br from-purple-400 to-purple-500", iconColor: "text-white" },
        { icon: Users, label: "Customer", value: "20", trend: "+10%", color: "bg-gradient-to-br from-cyan-400 to-cyan-500", iconColor: "text-white" },
        { icon: Zap, label: "Employee", value: "5000", trend: "+3%", color: "bg-gradient-to-br from-orange-400 to-orange-500", iconColor: "text-white" },
        { icon: BadgeInfo, label: "Low Stock", value: "37", trend: "-5%", color: "bg-gradient-to-br from-yellow-400 to-yellow-500", iconColor: "text-white" },
    ];

    return (
        <div className="min-h-screen flex flex-col gap-3 overflow-x-auto">
            <div>
                <div className="text-sm text-gray-400 flex items-center">
                    <span>Pages</span>
                    <span className="mx-2">›</span>
                    <span className="text-gray-700 font-medium">Main Dashboard</span>
                </div>
                <h1 className="text-3xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    Main Dashboard
                </h1>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7">
                {stats.map((stat, i) => (
                    <div
                        key={i}
                        className={`flex items-center p-4 space-x-3 transition-all bg-white rounded-xl border border-gray-200 cursor-pointer group relative overflow-hidden`}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-gray-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        <div className={`p-3 rounded-full ${stat.color} relative z-10`}>
                            <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                        </div>

                        <div className="w-px h-10 bg-gray-200"></div>

                        <div className="relative z-10 flex-1">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-500">{stat.label}</p>
                                <div className={`flex items-center gap-0.5 text-[10px] font-semibold ${stat.trend.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {stat.trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                    {stat.trend}
                                </div>
                            </div>
                            <p className="text-sm font-bold text-gray-700">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-6">
                <SalesChart />
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="col-span-1">
                    <Summary />
                </div>

                <div className="grid grid-cols-[230px_1fr] col-span-1 gap-3">
                    <ClockCard />
                    <CalendarCard />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[450px_1fr] gap-3 w-full md:col-span-2">
                    <SystemStatus />
                    <TopProducts />
                </div>
            </div>
        </div>
    );
}

export function SalesChart() {
    const filters = ["1 Week", "1 Month", "1 Year", "Custom"] as const;
    type FilterType = typeof filters[number];
    const [filter, setFilter] = useState<FilterType>("1 Year");

    const datasets: Record<FilterType, number[]> = {
        "1 Week": [40, 45, 35, 50, 60, 55, 70],
        "1 Month": [80, 70, 90, 100, 120, 150, 130, 160, 180, 200, 220, 210],
        "1 Year": [120, 190, 170, 220, 180, 250, 210, 280, 240, 290, 260, 310],
        "Custom": [150, 200, 230, 180, 260, 310, 290, 330],
    };

    const data = {
        labels:
            filter === "1 Week"
                ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
                : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        datasets: [
            {
                label: "Sales",
                data: datasets[filter],
                borderColor: "rgb(52,211,153)",
                backgroundColor: "rgba(52,211,153,0.1)",
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointHoverRadius: 7,
                pointBackgroundColor: "rgb(16,185,129)",
                pointBorderColor: "#fff",
                pointBorderWidth: 3,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: "rgba(0,0,0,0.8)",
                padding: 12,
                borderRadius: 8,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: "rgba(0,0,0,0.05)", drawBorder: false },
                ticks: { color: "#6B7280" },
            },
            x: {
                grid: { color: "rgba(0,0,0,0.05)", display: false },
                ticks: { color: "#6B7280" },
            },
        },
    };

    return (
        <div
            className="p-6 bg-white rounded-xl border border-gray-200 transition-all"
        >
            <div className="flex flex-col mb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                        <h3 className="text-lg font-semibold text-gray-800">Sales Analyze</h3>
                    </div>
                    <p className="text-sm text-gray-500">
                        Sales for the last <span className="font-semibold text-emerald-600">{filter}</span>
                    </p>
                </div>
                <div className="flex gap-2 mt-3 sm:mt-0">
                    {filters.map((item) => (
                        <button
                            key={item}
                            onClick={() => setFilter(item)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg border-2 transition-all ${filter === item
                                ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-emerald-500"
                                : "text-gray-600 border-gray-200 hover:border-emerald-300 hover:text-emerald-600"
                                }`}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </div>
            <div className="h-[390px] w-[95%] mx-auto overflow-y-hidden">
                <Line data={data} options={options} />
            </div>
        </div>
    );
}

export function Summary() {
    const summary = [
        { label: "Total Sales", value: "LKR.14500.00", bgColor: "bg-gradient-to-r from-emerald-50 to-emerald-100", textColor: "text-emerald-700", borderColor: "border-emerald-200" },
        { label: "Total Discount", value: "LKR.14500.00", bgColor: "bg-gradient-to-r from-blue-50 to-blue-100", textColor: "text-blue-700", borderColor: "border-blue-200" },
        { label: "Total Profit", value: "LKR.14500.00", bgColor: "bg-gradient-to-r from-purple-50 to-purple-100", textColor: "text-purple-700", borderColor: "border-purple-200" },
        { label: "Total Expenses", value: "LKR.14500.00", bgColor: "bg-gradient-to-r from-orange-50 to-orange-100", textColor: "text-orange-700", borderColor: "border-orange-200" },
        { label: "Net Profit", value: "LKR.14500.00", bgColor: "bg-gradient-to-r from-cyan-50 to-cyan-100", textColor: "text-cyan-700", borderColor: "border-cyan-200" },
    ];

    return (
        <div className="p-6 bg-white rounded-xl h-[320px] overflow-y-auto border border-gray-200 transition-all">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">
                Summary of October 2025 Sales
            </h2>
            <div className="space-y-2">
                {summary.map((item, index) => (
                    <div
                        key={index}
                        className={`flex justify-between items-center py-3 px-4 rounded-xl cursor-pointer border-2 ${item.bgColor} ${item.borderColor}`}
                    >
                        <span className={`font-semibold text-sm ${item.textColor}`}>{item.label}</span>
                        <span className={`font-bold text-sm ${item.textColor}`}>{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function ClockCard() {
    const [currentTime, setCurrentTime] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date: Date) => {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? "PM" : "AM";
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
    };

    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return "Good Morning!";
        if (hour < 17) return "Good Afternoon!";
        return "Good Evening!";
    };

    const hour = currentTime.getHours();
    const isDayTime = hour >= 6 && hour < 18;
    const Icon: LucideIcon = isDayTime ? SunDim : Moon;

    return (
        <div
            className={`flex flex-col items-center justify-center h-full p-6 text-white rounded-xl border border-gray-200 transition-all ${isDayTime ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                }`}
        >
            <div
            >
                <Icon className="mb-2" size={100} />
            </div>

            <div className="mt-2 text-sm opacity-90">
                {currentTime.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                })}
            </div>

            <div className="text-2xl font-bold tracking-tight">
                {formatTime(currentTime)}
            </div>

            <div className="mt-1 text-2xl font-semibold">{getGreeting()}</div>
        </div>
    );
}

export function CalendarCard() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const { firstDay, daysInMonth } = getDaysInMonth(selectedDate);
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    function getDaysInMonth(date: Date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        return { firstDay, daysInMonth };
    }

    function changeMonth(direction: number) {
        const newDate = new Date(selectedDate);
        newDate.setMonth(newDate.getMonth() + direction);
        setSelectedDate(newDate);
    }

    const today = new Date();

    return (
        <div
            className="h-full p-5 bg-white rounded-xl border border-gray-200 transition-all"
        >
            <div className="flex items-center justify-between mb-2">
                <button
                    onClick={() => changeMonth(-1)}
                    className="text-gray-600 hover:text-emerald-500 font-bold text-2xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-emerald-50 transition-all"
                >
                    ‹
                </button>
                <span className="text-lg font-semibold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                    {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                </span>
                <button
                    onClick={() => changeMonth(1)}
                    className="text-gray-600 hover:text-emerald-500 font-bold text-2xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-emerald-50 transition-all"
                >
                    ›
                </button>
            </div>
            <div className="grid grid-cols-7 gap-y-6 gap-x-1 text-center">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                    <div key={day} className="py-2 text-xs font-bold text-gray-500">
                        {day}
                    </div>
                ))}

                {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const isToday =
                        day === today.getDate() &&
                        selectedDate.getMonth() === today.getMonth() &&
                        selectedDate.getFullYear() === today.getFullYear();
                    return (
                        <button
                            key={day}
                            className={`rounded-xl text-sm py-2 font-medium transition-all ${isToday
                                ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white"
                                : "hover:bg-emerald-50 text-gray-700 hover:text-emerald-600"
                                }`}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export function SystemStatus() {
    const [metrics, setMetrics] = useState({
        loadStatus: 0,
        cpuUsage: 0,
        ramUsage: 0,
        diskUsage: 0
    });

    const getStatusText = (value: number) => {
        if (value > 80) return "Critical";
        if (value > 60) return "Warning";
        return "Normal";
    };

    const getStatusColor = (value: number) => {
        if (value > 80) return { ring: "rgb(239,68,68)", bg: "from-red-400 to-red-500" };
        if (value > 60) return { ring: "rgb(251,146,60)", bg: "from-orange-400 to-orange-500" };
        return { ring: "rgb(52,211,153)", bg: "from-emerald-400 to-emerald-500" };
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setMetrics({
                loadStatus: Math.floor(Math.random() * 100),
                cpuUsage: Math.floor(Math.random() * 100),
                ramUsage: Math.floor(Math.random() * 100),
                diskUsage: Math.floor(Math.random() * 100)
            });
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    const status = [
        { label: "Load Status", value: metrics.loadStatus, ...getStatusColor(metrics.loadStatus) },
        { label: "CPU Usage", value: metrics.cpuUsage, ...getStatusColor(metrics.cpuUsage) },
        { label: "RAM Usage", value: metrics.ramUsage, ...getStatusColor(metrics.ramUsage) },
        { label: "Disk Usage", value: metrics.diskUsage, ...getStatusColor(metrics.diskUsage) }
    ];

    return (
        <div
            className="p-6 transition-all bg-white rounded-xl border border-gray-200"
        >
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl">
                    <Laptop className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-600">
                    System Status
                </h2>
            </div>

            <div className="grid grid-cols-2 gap-2">
                {status.map((item, idx) => (
                    <div
                        key={idx}
                        className="flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl transition-all"
                    >
                        <div className="relative mb-2">
                            <svg width="80" height="80" viewBox="0 0 96 96" className="-rotate-90">
                                <circle cx="48" cy="48" r="38" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                                <circle
                                    cx="48"
                                    cy="48"
                                    r="38"
                                    stroke={item.ring}
                                    strokeWidth="8"
                                    fill="none"
                                    strokeDasharray={2 * Math.PI * 38}
                                    strokeDashoffset={`${2 * Math.PI * 38 * (1 - item.value / 100)}`}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-lg font-bold text-gray-800">{item.value}%</span>
                            </div>
                        </div>

                        <div>
                            <div className="text-sm font-semibold text-gray-700 mb-1">{item.label}</div>
                            <div className={`px-2 py-1 rounded-full text-xs font-semibold ${item.value > 80 ? "bg-red-100 text-red-600" :
                                item.value > 60 ? "bg-orange-100 text-orange-600" :
                                    "bg-emerald-100 text-emerald-600"
                                }`}>
                                {getStatusText(item.value)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function TopProducts() {
    const products = [
        { id: "P001", name: "Table", category: "Table", mrp: "1500.00", barcode: "1234567890", quantity: 150 },
        { id: "P002", name: "Chair", category: "Chair", mrp: "1200.00", barcode: "9876543210", quantity: 120 },
    ];

    return (
        <div
            className="w-full h-full p-6 transition-all bg-white rounded-xl border border-gray-200"
        >
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl">
                    <Star className="w-5 h-5 text-white fill-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-600">
                    Top Products
                </h2>
            </div>

            <div className="overflow-x-auto overflow-y-hidden w-full">
                <table className="w-full min-w-max border-separate border-spacing-0">
                    <thead>
                        <tr className="bg-gradient-to-r from-emerald-400 to-emerald-500">
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-white uppercase rounded-tl-lg">
                                Product ID
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-white uppercase">
                                Name
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-white uppercase">
                                MRP
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-white uppercase">
                                Barcode
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-white uppercase rounded-tr-lg">
                                Quantity
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr
                                key={product.id}
                                className="border-b border-gray-100 transition-colors cursor-pointer"
                            >
                                <td className="px-4 py-3 text-sm font-semibold text-gray-700">{product.id}</td>
                                <td className="px-4 py-3 text-sm font-semibold text-gray-700">{product.name}</td>
                                <td className="px-4 py-3 text-sm font-semibold text-emerald-600">LKR {product.mrp}</td>
                                <td className="px-4 py-3 text-sm font-medium text-gray-600">{product.barcode}</td>
                                <td className="px-4 py-3 text-sm">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700">
                                        {product.quantity}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}