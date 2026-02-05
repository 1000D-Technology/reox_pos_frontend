import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    CreditCard,
    BarChart,
    Settings,
    LogOut,
    Truck,
    ChevronDown,
    AudioWaveform,
    BadgePlus,
    FolderTree,
    Boxes,
    UserCog,
    FolderSymlink,
    DatabaseBackup
} from "lucide-react";
import type { ReactNode } from "react";
import { useState, useEffect } from "react";
import { authService } from "../services/authService";
import logo from "/logo.png";
import icon from "/icon.png";

interface NavItemChild {
    label: string;
    path: string;
}

interface NavItem {
    label: string;
    path?: string;
    icon: ReactNode;
    children?: NavItemChild[];
    roles?: string[];
}

interface SidebarProps {
    isOpen: boolean;
    toggle?: () => void;
}

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    role_id: number;
}

export default function Sidebar({ isOpen }: SidebarProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
    }, []);

    const toggleDropdown = (label: string, event: React.MouseEvent) => {
        if (!isOpen) return;
        event.preventDefault();
        event.stopPropagation();
        setExpandedItems(prev => ({
            ...prev,
            [label]: !prev[label]
        }));
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/signin', { replace: true });
    };

    const userRole = user?.role || '';

    const allNavItems: NavItem[] = [
        { label: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} />, roles: ['Admin', 'Cashier', 'Storekeeper'] },
        {
            label: "Sales",
            path: "/sales",
            icon: <AudioWaveform size={20} />,
            roles: ['Admin', 'Cashier'],
            children: [
                { label: "Manage Invoice", path: "/sales/manage-invoice" },
                { label: "Manage Sales", path: "/sales/manage-sales" },
                { label: "User Sales", path: "/sales/manage-user-sales" },
                { label: "Return History", path: "/sales/return-history" },
            ],
        },
        {
            label: "Quotation",
            path: "/quotation",
            icon: <BadgePlus size={20} />,
            roles: ['Admin', 'Cashier', 'Storekeeper'],
            children: [
                { label: "Create Quotation", path: "/quotation/create-quotation" },
                { label: "Quotation List", path: "/quotation/quotation-list" },
            ],
        },
        {
            label: "Stock",
            path: "/stock",
            icon: <FolderTree size={20} />,
            roles: ['Admin', 'Cashier'],
            children: [
                { label: "Stock List", path: "/stock/stock-list" },
                { label: "Out of Stock", path: "/stock/out-of-stock" },
                { label: "Damaged Stock", path: "/stock/damaged-stock" },
                { label: "Low Stock", path: "/stock/low-stock" },
            ],
        },
        {
            label: "GRN",
            path: "/grn",
            icon: <FolderSymlink size={20} />,
            roles: ['Admin', 'Cashier'],
            children: [
                { label: "Create GRN", path: "/grn/create-grn" },
                { label: "GRN List", path: "/grn/grn-list" },
            ],
        },
        {
            label: "Products",
            path: "/products",
            icon: <Boxes size={20} />,
            roles: ['Admin', 'Cashier'],
            children: [
                { label: "Create Product", path: "/products/create-product" },
                { label: "Product List", path: "/products/product-list" },
                { label: "Manage Product Type", path: "/products/manage-product-type" },
                { label: "Manage Unit", path: "/products/manage-unit" },
                { label: "Manage Category", path: "/products/manage-category" },
                { label: "Manage Brand", path: "/products/manage-brand" },
                { label: "Deactivated Products", path: "/products/deactivated-products" },
            ],
        },
        {
            label: "Supplier",
            path: "/supplier",
            icon: <Truck size={20} />,
            roles: ['Admin'],
            children: [
                { label: "Create Supplier", path: "/supplier/create-supplier" },
                { label: "Manage Supplier", path: "/supplier/manage-supplier" },
                { label: "Manage Company", path: "/supplier/manage-company" },
                { label: "Supplier GRN History", path: "/supplier/supplier-grn" },
                { label: "Supplier Payments", path: "/supplier/supplier-payments" },
            ],
        },
        {
            label: "Manage Customer",
            path: "/customer/manage-customer",
            icon: <Users size={20} />,
            roles: ['Admin', 'Cashier'],
        },
        {
            label: "Manage User",
            path: "/manage-users",
            icon: <UserCog size={20} />,
            roles: ['Admin'],
        },
        { label: "Accounts", path: "/accounts", icon: <CreditCard size={20} />, roles: ['Admin'] },
        { label: "Reports", path: "/reports", icon: <BarChart size={20} />, roles: ['Admin'] },
        { label: "Settings", path: "/setting", icon: <Settings size={20} />, roles: ['Admin'] },
        { label: "Back-Up", path: "/back-up", icon: <DatabaseBackup size={20} />, roles: ['Admin'] },
    ];

    // Filter navigation items based on user role
    const navItems = allNavItems.filter(item => {
        if (!item.roles || item.roles.length === 0) return true;
        return item.roles.includes(userRole);
    });

    return (
        <aside
            className={`py-3 ps-2 transition-all duration-500 ease-in-out
        ${isOpen ? "w-76" : "w-20"}`}
        >
            <div className="h-full flex flex-col transition-all duration-500 rounded-xl bg-white border-gray-100 border-2">
                {/* Logo */}
                <div className="flex items-center justify-center h-20 px-2">
                    <img 
                        src={isOpen ? logo : icon} 
                        alt="ReoX POS" 
                        className={`transition-all duration-500 object-contain max-w-full px-2 ${isOpen ? "h-12" : "h-9"}`} 
                    />
                </div>

                {/* Navigation */}
                <nav className="flex-1 items-center overflow-y-auto ps-2 py-4 hide-scrollbar">
                    <ul className="space-y-2">
                        {navItems.map((item, index) => (
                            <li key={index}>
                                {item.children ? (
                                    <div className="mb-1">
                                        <Link
                                            to={item.path || "#"}
                                            className={`flex items-center justify-between ${isOpen ? "pr-2" : "justify-center"
                                                } gap-3 px-3 py-2 text-sm transition
                                            ${(location.pathname === item.path || location.pathname.startsWith(item.path + "/"))
                                                    ? "bg-linear-to-l from-emerald-200 font-semibold border-e-4 border-emerald-600"
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
                                                    className={`transition-transform duration-300 ${expandedItems[item.label] ? "transform rotate-180" : ""
                                                        }`}
                                                />
                                            )}
                                        </Link>

                                        {isOpen && (
                                            <ul className={`ml-7 mt-1 space-y-1 overflow-hidden transition-all duration-300 ease-in-out
    ${expandedItems[item.label] ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                                                {item.children.map((child, childIndex) => (
                                                    <li key={childIndex} className="relative">
                                                        <div
                                                            className="absolute left-0 top-0 bottom-0 w-px bg-gray-200 ml-1"></div>
                                                        <Link
                                                            to={child.path}
                                                            className={`flex items-center gap-2 px-3 py-1.5 text-xs transition pl-6
            ${location.pathname === child.path
                                                                    ? "bg-linear-to-l from-emerald-200 text-black font-medium"
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
                                        className={`flex items-center ${isOpen ? "justify-start" : "justify-center"
                                            } gap-3 px-3 py-2 text-sm transition
                                        ${location.pathname === item.path
                                                ? "bg-linear-to-l from-emerald-200 text-black font-semibold"
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
                <div className="p-2 flex items-center justify-between m-2">
                    {isOpen && user && (
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-semibold">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm font-medium truncate max-w-[120px]" title={user.name}>
                                    {user.name}
                                </p>
                                <p className="text-xs text-gray-500">{user.role}</p>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        className={`p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition ${isOpen ? "ml-auto" : "mx-auto"
                            }`}
                        title="Logout"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </aside>
    );
}