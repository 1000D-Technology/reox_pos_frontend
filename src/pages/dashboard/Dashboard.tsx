import { motion, type Variants } from "framer-motion";
import {ChartNoAxesCombined, FileSpreadsheet, UserCheck, Boxes, Users, Zap, BadgeInfo, SunDim, Star, Laptop, Moon, type LucideIcon,} from "lucide-react";
import { Line } from "react-chartjs-2";
import {Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, ArcElement, BarElement,} from "chart.js";
import { useEffect, useState } from "react";


ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, ArcElement, BarElement);

export default function Dashboard() {
    const stats = [
        { icon: ChartNoAxesCombined, label: "Today Sales", value: "LKR 500,000.00", color: "bg-emerald-200", iconColor: "text-gray-700" },
        { icon: FileSpreadsheet, label: "Today Invoice", value: "20", color: "bg-emerald-200", iconColor: "text-gray-700" },
        { icon: UserCheck, label: "Supplier", value: "20", color: "bg-emerald-200", iconColor: "text-gray-700" },
        { icon: Boxes, label: "Product", value: "20", color: "bg-emerald-200", iconColor: "text-gray-700" },
        { icon: Users, label: "Customer", value: "20", color: "bg-emerald-200", iconColor: "text-gray-700" },
        { icon: Zap, label: "Employee", value: "5000", color: "bg-emerald-200", iconColor: "text-gray-700" },
        { icon: BadgeInfo, label: "Low Stock", value: "37", color: "bg-yellow-200", iconColor: "text-gray-700" },
    ];

    return (
        <div className="min-h-screen  flex flex-col gap-3 overflow-x-auto">
            <div>
                <div className="text-sm text-gray-500 flex items-center">
                    <span>Pages</span>
                    <span className="mx-2">›</span>
                    <span className="text-black">Main Dashboard</span>
                </div>
                <h1 className="text-3xl font-semibold text-gray-500">
                    Main Dashboard
                </h1>
            </div>


            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        transition={{delay: i * 0.1}}
                        whileHover={{scale: 1.05}}
                        className="flex items-center p-4 space-x-3 transition-all bg-white  rounded-2xl "
                    >
                        <div className={`p-3 rounded-full ${stat.color}`}>
                            <stat.icon className={`w-6 h-6 ${stat.iconColor}`}/>
                        </div>

                        {/* Divider */}
                        <div className="w-px h-10 bg-gray-300"></div>

                        <div>
                            <p className="text-sm text-gray-500">{stat.label}</p>
                            <p className="text-sm font-bold text-gray-700">{stat.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="flex flex-col gap-6">
                <SalesChart/>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="col-span-1">
                    <Summary/>
                </div>

                <div className="grid grid-cols-[230px_1fr] col-span-1 gap-3">
                    <ClockCard/>
                    <CalendarCard/>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[450px_1fr] gap-3 w-full md:col-span-2">
                    <SystemStatus/>
                    <TopProducts/>
                </div>
            </div>
        </div>
    );
}

//SALES CHART
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
                borderColor: "hsl(153,64%,52%)",
                backgroundColor: "rgb(255,255,255)",
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: "hsl(162,64%,52%)",
                pointBorderColor: "#fff",
                pointBorderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
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
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 bg-white rounded-xl "
        >
            <div className="flex flex-col mb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">Sales Analyze</h3>
                    <p className="text-sm text-gray-500">
                        Sales for the last <span className="font-medium text-emerald-600">{filter}</span>
                    </p>
                </div>
                <div className="flex gap-2 mt-3 sm:mt-0">
                    {filters.map((item) => (
                        <button
                            key={item}
                            onClick={() => setFilter(item)}
                            className={`px-3 py-1 text-xs font-medium rounded-xl border transition-all ${
                                filter === item
                                    ? "bg-emerald-400 text-white border-emerald-400 shadow-sm"
                                    : "text-gray-600 border-gray-200 hover:bg-gray-100"
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
        </motion.div>
    );
}

//SUMMARY
export function Summary() {
    const summary = [
        { label: "Total Sales", value: "LKR.14500.00", bgColor: "bg-emerald-100" },
        { label: "Total Discount", value: "LKR.14500.00", bgColor: "" },
        { label: "Total Profit", value: "LKR.14500.00", bgColor: "bg-emerald-100" },
        { label: "Total Expenses", value: "LKR.14500.00", bgColor: "" },
        { label: "Net Profit", value: "LKR.14500.00", bgColor: "bg-emerald-100" },

    ];

    const [clickedIndex, setClickedIndex] = useState<number | null>(null);

    const itemVariants: Variants = {
        visible: { opacity: 1, y: 0 },
        clicked: { scale: 1.05, transition: { duration: 0.3 } },
    };

    return (
        <motion.div
            className="p-6 bg-white rounded-xl h-[320px] overflow-y-auto "
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <h2 className="mb-4 text-lg font-semibold text-gray-800 ">
                Summary of October 2025 Sales
            </h2>
            <div className="">
                {summary.map((item, index) => (
                    <motion.div
                        key={index}
                        className={`flex justify-between items-center py-3 px-4 rounded-lg  cursor-pointer ${item.bgColor}`}
                        variants={itemVariants}
                        animate={clickedIndex === index ? "clicked" : "visible"}
                        onClick={() => setClickedIndex(index)}
                    >
                        <span className="font-medium text-gray-700">{item.label}</span>
                        <span className="font-semibold text-gray-800">{item.value}</span>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}

//CLOCK CARD
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
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center justify-center h-full p-6 text-black bg-white rounded-xl"
        >
            <Icon className={` mb-2 ${isDayTime ? "text-emerald-400" : "text-emerald-400"}`} size={100}/>
            {/* <SunDim className="w-40 h-40 mb-2 text-emerald-400" /> */}

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

            <div className="mt-1 text-2xl font-semibold text-emerald-400">{getGreeting()}</div>
        </motion.div>
    );
}

//CALENDAR CARD
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
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className=" h-full p-5 bg-white rounded-xl "
        >
            <div className="flex items-center justify-between mb-2">
                <button onClick={() => changeMonth(-1)} className="text-gray-700 hover:text-emerald-200">
                    ‹
                </button>
                <span className="text-xl font-semibold text-gray-900 ">
                    {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                </span>
                <button onClick={() => changeMonth(1)} className="text-gray-700 hover:text-emerald-200 ">
                    ›
                </button>
            </div>
            <div className="grid grid-cols-7 gap-y-6 gap-x-1 text-center ">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                    <div key={day} className="py-1 text-xs font-semibold text-gray-600">
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
                            className={`rounded-lg text-sm py-1.5 ${
                                isToday
                                    ? "bg-black text-white font-bold"
                                    : "text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>
        </motion.div>
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
        {
            label: "Load Status",
            value: metrics.loadStatus,
            ringColor: metrics.loadStatus > 80 ? "rgb(239,68,68)" : metrics.loadStatus > 60 ? "rgb(251,146,60)" : "rgb(134,239,172)"
        },
        {
            label: "CPU Usage",
            value: metrics.cpuUsage,
            ringColor: metrics.cpuUsage > 80 ? "rgb(239,68,68)" : metrics.cpuUsage > 60 ? "rgb(251,146,60)" : "rgb(134,239,172)"
        },
        {
            label: "RAM Usage",
            value: metrics.ramUsage,
            ringColor: metrics.ramUsage > 80 ? "rgb(239,68,68)" : metrics.ramUsage > 60 ? "rgb(251,146,60)" : "rgb(134,239,172)"
        },
        {
            label: "Disk Usage",
            value: metrics.diskUsage,
            ringColor: metrics.diskUsage > 80 ? "rgb(239,68,68)" : metrics.diskUsage > 60 ? "rgb(251,146,60)" : "rgb(134,239,172)"
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.36 }}
            className="p-6 transition-all bg-white rounded-xl"
        >
            <div className="flex items-center justify-between mb-4">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-600">
                    <Laptop className="w-8 h-8 text-emerald-400" />
                    System Status
                </h2>
            </div>

            <div className="grid grid-cols-2 gap-2">
                {status.map((item, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ scale: 1 }}
                        animate={{ scale: [1, 1.02, 1] }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col items-center justify-center p-4 text-center bg-white shadow-gray-200 shadow-2xl rounded-xl"
                    >
                        <div className="relative mb-3">
                            <svg width="72" height="72" viewBox="0 0 96 96" className="-rotate-90">
                                <circle cx="48" cy="48" r="38" stroke="#e6eef0" strokeWidth="10" fill="none" />
                                <motion.circle
                                    cx="48"
                                    cy="48"
                                    r="38"
                                    stroke={item.ringColor}
                                    strokeWidth="10"
                                    fill="none"
                                    strokeDasharray={2 * Math.PI * 38}
                                    strokeDashoffset={`${2 * Math.PI * 38 * (1 - item.value / 100)}`}
                                    strokeLinecap="round"
                                    initial={{ strokeDashoffset: 2 * Math.PI * 38 }}
                                    animate={{ strokeDashoffset: `${2 * Math.PI * 38 * (1 - item.value / 100)}` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <motion.span
                                    className="text-sm font-bold text-gray-600"
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {item.value}%
                                </motion.span>
                            </div>
                        </div>

                        <div>
                            <div className="text-sm font-medium text-gray-700">{item.label}</div>
                            <div className={`mt-1 text-xs ${
                                item.value > 80 ? "text-red-500" :
                                    item.value > 60 ? "text-orange-500" :
                                        "text-emerald-500"
                            }`}>
                                {getStatusText(item.value)}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}


// TOP PRODUCTS TABLE
export function TopProducts() {
    const products = [
        { id: "P001", name: "Table", category: "Table", mrp: "1500.00", barcode: "1234567890", quantity: 150 },
        { id: "P002", name: "Chair", category: "Chair", mrp: "1200.00", barcode: "9876543210", quantity: 120 },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="w-full h-full p-6 transition-all bg-white rounded-xl hover:shadow-md "
        >
            <div className="flex items-center justify-between mb-4">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-600">
                    Top Products
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                </h2>
            </div>

            <div className="overflow-x-auto overflow-y-hidden w-full">
                <table className="w-full min-w-max overflow-hidden border border-gray-100 rounded-lg">
                    <thead>
                    <tr className="bg-emerald-400">
                        <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">
                            Product ID
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">
                            Name
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">
                            MRP
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">
                            Barcode
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">
                            Quantity
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {products.map((product, index) => (
                        <motion.tr
                            key={product.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="transition-colors border-b border-gray-100 hover:bg-gray-50"
                        >
                            <td className="px-4 py-3 text-sm font-medium text-gray-600">{product.id}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-600">{product.name}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-600 ">{product.mrp}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-600">{product.barcode}</td>
                            <td className="px-4 py-3 text-sm">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-gray-600">
                                    {product.quantity}
                                </span>
                            </td>
                        </motion.tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
}