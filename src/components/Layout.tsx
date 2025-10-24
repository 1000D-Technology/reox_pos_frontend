import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { Bell, Calculator, ClipboardPlus, PanelLeft, Power, RotateCcw } from "lucide-react";
import { Link, Outlet } from "react-router-dom";
import InvoiceModal from "./InvoiceModal";
import QuotationModal from "./QuotationsModel";
import { AnimatePresence, motion } from "framer-motion";

// Event name constant (moved to prevent ESLint fast refresh issues)
const OPEN_INVOICE_MODAL_EVENT = "openInvoiceModal";
const OPEN_QUOTATION_MODAL_EVENT = "openQuotationModal";

export default function Layout() {
    const [isOpen, setIsOpen] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fixed: Using useEffect instead of useState for event listener
    useEffect(() => {
        const handleOpenModal = () => setIsModalOpen(true);
        window.addEventListener(OPEN_INVOICE_MODAL_EVENT, handleOpenModal);
        return () => window.removeEventListener(OPEN_INVOICE_MODAL_EVENT, handleOpenModal);
    }, []);

    useEffect(() => {
        const handleOpenModal = () => setIsModalOpen(true);
        window.addEventListener(OPEN_QUOTATION_MODAL_EVENT, handleOpenModal);
        return () => window.removeEventListener(OPEN_QUOTATION_MODAL_EVENT, handleOpenModal);
    }, []);

    return (
        <div className="flex h-screen w-full bg-gradient-to-r from-emerald-50 to-yellow-50" style={{ fontSize: "10px", fontFamily: "Riope, sans-serif" }}>
            {/* Sidebar */}
            <Sidebar isOpen={isOpen} toggle={() => setIsOpen(!isOpen)} />

            {/* Main content */}
            <div className="flex-1 flex flex-col pt-3 pe-1">
                {/* Header */}
                <header className="h-16 flex items-center px-4 justify-between bg-white/10 backdrop-blur-md rounded-xl">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="text-gray-400 hover:text-emerald-600 transition hover:cursor-pointer"
                    >
                        <PanelLeft />
                    </button>

                    <div className="flex items-center justify-between gap-3 bg-white px-3 py-2 rounded-full">
                        <Link to={"#"} className="px-7 py-2 bg-gray-800 text-white rounded-full flex items-center gap-4">
                            <ClipboardPlus size={18} />POS
                        </Link>
                        <div className={'flex items-center gap-3 text-gray-400'}>
                            <Link to={'#'}>
                                <Calculator size={15} />
                            </Link>
                            <Link to={'#'} className={"p-2 rounded-full bg-red-50"}>
                                <Power size={15} />
                            </Link>
                            <Link to={'#'} className={"p-2 rounded-full bg-emerald-50"}>
                                <RotateCcw size={15} />
                            </Link>
                            <Link to={'#'} className={'me-3'}>
                                <Bell size={15} />
                            </Link>
                            <div className={'flex flex-col leading-1 items-end border-s-2 ps-5 border-gray-200'}>
                                <span className="text-sm font-medium text-black">John Doe</span>
                                <br />
                                <span className="text-xs text-gray-500">Admin</span>
                            </div>
                            <div className="w-12 h-12 rounded-full flex justify-center items-center">
                                <img
                                    src="https://i.pravatar.cc/40?img=1"
                                    alt="user"
                                    className="w-12 h-12 rounded-full"
                                />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto ps-4 pe-1  my-3 me-3 h-full">
                    <Outlet/>
                </main>

                {/* Invoice Modal with Animation */}
                <AnimatePresence>
                    {isModalOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center w-full h-full"
                            onClick={() => setIsModalOpen(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.7, y: 50 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.7, y: 50 }}
                                transition={{ type: "spring", damping: 20 }}
                                onClick={e => e.stopPropagation()}
                                className={'w-full h-full'}
                            >
                                <InvoiceModal onClose={() => setIsModalOpen(false)} />
                                <QuotationModal onClose={() => setIsModalOpen(false)} />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
