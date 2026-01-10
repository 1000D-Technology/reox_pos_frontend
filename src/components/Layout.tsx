// src/components/Layout.tsx
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { Bell, Calculator, ClipboardPlus, PanelLeft, Power, RotateCcw } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";
import InvoiceModal from "./models/InvoiceModal.tsx";
import { AnimatePresence, motion } from "framer-motion";
import QuotationModal from "./models/QuotationsModel.tsx";
import PosCashBalance from "./models/PosCashBalance.tsx";
import CalculatorModal from "./models/CalculatorModal.tsx";

const OPEN_INVOICE_MODAL_EVENT = "openInvoiceModal";
const OPEN_QUOTATION_MODAL_EVENT = "openQuotationModal";

export default function Layout() {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(true);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isPosCashBalanceOpen, setIsPosCashBalanceOpen] = useState(false);
    const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

    useEffect(() => {
        if (location.pathname === '/pos') {
            setIsOpen(false);
        }
    }, [location.pathname]);

    // Disable body scroll when calculator is open
    useEffect(() => {
        if (isCalculatorOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isCalculatorOpen]);

    useEffect(() => {
        const handleScroll = (e: Event) => {
            const target = e.target as HTMLElement;
            setIsScrolled(target.scrollTop > 0);
        };

        const mainContent = document.querySelector('main');
        mainContent?.addEventListener('scroll', handleScroll);

        const handleOpenInvoiceModal = () => setIsInvoiceModalOpen(true);
        const handleOpenQuotationModal = () => setIsQuotationModalOpen(true);

        window.addEventListener(OPEN_INVOICE_MODAL_EVENT, handleOpenInvoiceModal);
        window.addEventListener(OPEN_QUOTATION_MODAL_EVENT, handleOpenQuotationModal);

        return () => {
            mainContent?.removeEventListener('scroll', handleScroll);
            window.removeEventListener(OPEN_INVOICE_MODAL_EVENT, handleOpenInvoiceModal);
            window.removeEventListener(OPEN_QUOTATION_MODAL_EVENT, handleOpenQuotationModal);
        };
    }, []);

    return (
        <div className="flex h-screen w-full bg-gradient-to-r from-emerald-50 to-yellow-50">
            <Sidebar isOpen={isOpen} toggle={() => setIsOpen(!isOpen)} />

            <div className="flex-1 flex flex-col pt-3 pe-1">
                <header className={`h-16 flex items-center px-4 justify-between backdrop-blur-sm rounded-xl transition-colors duration-300 ${
                    isScrolled ? 'bg-white/30' : 'bg-white/10'
                }`}>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="text-gray-400 hover:text-emerald-600 transition hover:cursor-pointer"
                    >
                        <PanelLeft />
                    </button>

                    <div className="flex items-center justify-between gap-3 bg-white px-3 py-2 rounded-full">
                        <button
                            onClick={() => setIsPosCashBalanceOpen(true)}
                            className="px-7 py-2 bg-gray-800 text-white rounded-full flex items-center gap-4 hover:bg-gray-900 transition"
                        >
                            <ClipboardPlus size={18} />POS
                        </button>

                        <div className={'flex items-center gap-3 text-gray-400'}>
                            <button onClick={() => setIsCalculatorOpen(true)}>
                                <Calculator size={15} />
                            </button>
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
                                    src={'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500'}
                                    alt={'User'}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto ps-3 pe-1 my-3 me-3 h-full hide-scrollbar">
                    <Outlet/>
                </main>

                <AnimatePresence>
                    {isInvoiceModalOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center w-full h-full"
                            onClick={() => setIsInvoiceModalOpen(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.7, y: 50 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.7, y: 50 }}
                                transition={{ type: "spring", damping: 20 }}
                                onClick={e => e.stopPropagation()}
                                className={'w-full h-full'}
                            >
                                <InvoiceModal onClose={() => setIsInvoiceModalOpen(false)} />
                            </motion.div>
                        </motion.div>
                    )}
                    {isQuotationModalOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center w-full h-full"
                            onClick={() => setIsQuotationModalOpen(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.7, y: 50 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.7, y: 50 }}
                                transition={{ type: "spring", damping: 20 }}
                                onClick={e => e.stopPropagation()}
                                className={'w-full h-full'}
                            >
                                <QuotationModal onClose={() => setIsQuotationModalOpen(false)} />
                            </motion.div>
                        </motion.div>
                    )}
                    {isPosCashBalanceOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                            onClick={() => setIsPosCashBalanceOpen(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.7, y: 50 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.7, y: 50 }}
                                transition={{ type: "spring", damping: 20 }}
                                onClick={e => e.stopPropagation()}
                            >
                                <PosCashBalance
                                    onClose={() => setIsPosCashBalanceOpen(false)}
                                    initialAmount={0}
                                />
                            </motion.div>
                        </motion.div>
                    )}
                    {isCalculatorOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
                            onClick={() => setIsCalculatorOpen(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.7, y: 50 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.7, y: 50 }}
                                transition={{ type: "spring", damping: 20 }}
                                onClick={e => e.stopPropagation()}
                            >
                                <CalculatorModal onClose={() => setIsCalculatorOpen(false)} />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}