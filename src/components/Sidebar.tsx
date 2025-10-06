import {Link, useLocation} from "react-router-dom";
import {
    LayoutDashboard,

    Users,
    User,
    CreditCard,
    BarChart,
    Settings,
    LogOut,
    Truck,
    ChevronDown, AudioWaveform, BadgePlus, FolderTree, Boxes, UserCog
} from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

interface NavItemChild {
    label: string;
    path: string;
}

interface NavItem {
    label: string;
    path?: string;
    icon: ReactNode;
    children?: NavItemChild[];
}

interface SidebarProps {
    isOpen: boolean;
    toggle?: () => void;
}

export default function Sidebar({isOpen}: SidebarProps) {
    const location = useLocation();
    const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

    const toggleDropdown = (label: string, event: React.MouseEvent) => {
        if (!isOpen) return;
        event.preventDefault();
        event.stopPropagation();
        setExpandedItems(prev => ({
            ...prev,
            [label]: !prev[label]
        }));
    };

    const navItems: NavItem[] = [
        {label: "Dashboard", path: "/", icon: <LayoutDashboard size={20}/>},
        {
            label: "Sales",
            path: "/sales",
            icon: <AudioWaveform size={20}/>,
            children: [
                {label: "Manage Invoice", path: "/sales/manage-invoice"},
                {label: "Manage Sales", path: "/sales/manage-sales"},
                {label: "User Sales", path: "/sales/manage-user-sales"},
            ],
        },
        {
            label: "Quotation",
            path: "/quotation",
            icon: <BadgePlus size={20}/>,
            children: [
                {label: "Create Quotation", path: "/quotation/create-quotation"},
                {label: "Quotation List", path: "/quotation/quotation-list"},
            ],
        },
        {
            label: "Stock",
            path: "/stock",
            icon: <FolderTree size={20}/>,
            children: [
                {label: "Stock List", path: "/stock/stock-list"},
                {label: "Out of Stock", path: "/stock/out-of-stock"},
                {label: "Damaged Stock", path: "/stock/damaged-stock"},
                {label: "Low Stock", path: "/stock/low-stock"},
            ],
        },
        {
            label: "Products",
            path: "/products",
            icon: <Boxes size={20}/>,
            children: [
                {label: "Create Product", path: "/products/create-product"},
                {label: "Product List", path: "/products/product-list"},
                {label: "Manage Unit", path: "/products/manage-unit"},
                {label: "Manage Category", path: "/products/manage-category"},
                {label: "Removed Products", path: "/products/removed-products"},
            ],
        },
        {
            label: "Supplier",
            path: "/supplier",
            icon: <Truck size={20}/>,
            children: [
                {label: "Create Supplier", path: "/supplier/create-supplier"},
                {label: "Manage Supplier", path: "/supplier/manage-supplier"},
                {label: "Supplier GRN History", path: "/supplier/supplier-grn"},
                {label: "Supplier Payments", path: "/supplier/supplier-payments"},
                {label: "Bank Management", path: "/supplier/bank-management"},
            ],
        },
        {
            label: "Customer",
            path: "/customer",
            icon: <Users size={20}/>,
            children: [
                {label: "Manage Customer", path: "/customer/manage-customer"},
                {label: "Customer Sales", path: "/customer/customer-sales"},
            ],
        },
        {
            label: "Employee",
            path: "/employee",
            icon: <User size={20}/>,
            children: [
                {label: "Manage Employee", path: "/employee/manage-employee"},
                {label: "Attendance Mark", path: "/employee/attendance-mark"},
                {label: "Attendance Report", path: "/employee/attendance-report"},
                {label: "Employee Salary", path: "/employee/employee-salary"},
            ],
        },
        {
            label: "Manage User",
            path: "/manage-users",
            icon: <UserCog size={20}/>,
        },
        {label: "Accounts", path: "/accounts", icon: <CreditCard size={20}/>},
        {label: "Reports", path: "/reports", icon: <BarChart size={20}/>},
        {label: "Settings", path: "/settings", icon: <Settings size={20}/>},
    ];

    return (
        <aside
            className={`p-3 transition-all duration-500 ease-in-out
        ${isOpen ? "w-72" : "w-20"}`}
        >
            <div className="h-full flex flex-col transition-all duration-500 rounded-xl bg-white">
                {/* Logo */}
                <div className="flex items-center justify-center h-16">
                    {isOpen ? (
                        <img src="/logo.png" alt="" className="h-8"/>
                    ) : (
                        <img src="/logo.png" alt="" className="h-3"/>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 items-center overflow-y-auto ps-2 py-4">
                    <ul className="space-y-2">
                        {navItems.map((item, index) => (
                            <li key={index}>
                                {item.children ? (
                                    <div className="mb-1">
                                        <Link
                                            to={item.path || "#"}
                                            className={`flex items-center justify-between ${
                                                isOpen ? "pr-2" : "justify-center"
                                            } gap-3 px-3 py-2 text-sm transition 
                                            ${(location.pathname === item.path || location.pathname.startsWith(item.path + "/"))
                                                ? "bg-gradient-to-l from-emerald-200 font-semibold"
                                                : "text-gray-700 hover:bg-green-50"}`}
                                            onClick={(e) => toggleDropdown(item.label, e)}
                                        >
                                            <span className="flex items-center gap-3">
                                                {item.icon}
                                                {isOpen && item.label}
                                            </span>
                                            {isOpen && (
                                                <ChevronDown
                                                    size={16}
                                                    className={`transition-transform duration-300 ${
                                                        expandedItems[item.label] ? "transform rotate-180" : ""
                                                    }`}
                                                />
                                            )}
                                        </Link>

                                        {/* Dropdown menu */}
                                        {isOpen && (
                                            <ul className={`ml-7 mt-1 space-y-1 overflow-hidden transition-all duration-300 ease-in-out
    ${expandedItems[item.label] ? "max-h-48 opacity-100" : "max-h-0 opacity-0"}`}>
                                                {item.children.map((child, childIndex) => (
                                                    <li key={childIndex} className="relative">
                                                        <div
                                                            className="absolute left-0 top-0 bottom-0 w-px bg-gray-200 ml-1"></div>
                                                        <Link
                                                            to={child.path}
                                                            className={`flex items-center gap-2 px-3 py-1.5 text-xs  transition pl-6
            ${location.pathname === child.path
                                                                ? "bg-gradient-to-l from-emerald-200 text-black font-medium"
                                                                : "text-gray-600 hover:bg-emerald-50"}`}
                                                        >
                                                            {child.label}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ) : (
                                    <Link
                                        to={item.path || "#"}
                                        className={`flex items-center ${
                                            isOpen ? "justify-start" : "justify-center"
                                        } gap-3 px-3 py-2 text-sm transition
                                        ${location.pathname === item.path
                                            ? "bg-gradient-to-l from-emerald-200 text-black font-semibold"
                                            : "text-gray-700 hover:bg-green-50"}`}
                                    >
                                        {item.icon}
                                        {isOpen && item.label}
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* User Section */}
                <div className="p-2 flex items-center justify-between shadow-2xl m-2 rounded-full">
                    {isOpen && (
                        <div className="flex items-center gap-2">
                            <img
                                src="https://i.pravatar.cc/40?img=1"
                                alt="user"
                                className="w-8 h-8 rounded-full"
                            />
                            <div>
                                <p className="text-sm font-medium">John Jonson</p>
                                <p className="text-xs text-gray-500">Admin</p>
                            </div>
                        </div>
                    )}
                    <button
                        className={`p-2 rounded-full bg-red-500 text-white hover:bg-red-600 ${
                            isOpen ? "ml-auto" : "mx-auto"
                        }`}
                    >
                        <LogOut size={16}/>
                    </button>
                </div>
            </div>
        </aside>
    );
}