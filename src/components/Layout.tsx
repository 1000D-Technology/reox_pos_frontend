import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { Bell, Calculator, ClipboardPlus, Maximize, Minimize, PanelLeft, Power, RotateCcw } from "lucide-react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import InvoiceModal from "./models/InvoiceModal.tsx";
import { AnimatePresence, motion } from "framer-motion";
import QuotationModal from "./models/QuotationsModel.tsx";
import PosCashBalance from "./models/PosCashBalance.tsx";
import CalculatorModal from "./models/CalculatorModal.tsx";
import ShutdownModal from "./ShutdownModal.tsx";
import { authService } from "../services/authService";
import { cashSessionService } from "../services/cashSessionService";

const OPEN_INVOICE_MODAL_EVENT = "openInvoiceModal";
const OPEN_QUOTATION_MODAL_EVENT = "openQuotationModal";

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    role_id: number;
}

export default function Layout() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(true);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isPosCashBalanceOpen, setIsPosCashBalanceOpen] = useState(false);
    const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
    const [isShutdownModalOpen, setIsShutdownModalOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
    }, []);

    const handleShutdown = () => {
        authService.logout();
        window.close();
        setTimeout(() => {
            navigate('/signin', { replace: true });
        }, 100);
    };

    const handleRefresh = () => {
        navigate(location.pathname, { replace: true });
        window.location.reload();
    };

    const handlePOSClick = async () => {
        const userId = authService.getUserId();
        if (!userId) {
            navigate('/signin');
            return;
        }

        try {
            // Get counter from localStorage
            const counterCode = localStorage.getItem('current_counter');
            const sessionDate = localStorage.getItem('session_date');
            const today = new Date().toISOString().split('T')[0];

            // If no counter or date changed, show modal
            if (!counterCode || sessionDate !== today) {
                localStorage.removeItem('current_counter');
                localStorage.removeItem('session_date');
                setIsPosCashBalanceOpen(true);
                return;
            }

            // Check backend for active session
            const { hasActiveSession } = await cashSessionService.checkActiveCashSession(
                userId,
                counterCode
            );

            if (hasActiveSession) {
                setIsOpen(false);
                navigate('/pos');
            } else {
                localStorage.removeItem('current_counter');
                localStorage.removeItem('session_date');
                setIsPosCashBalanceOpen(true);
            }
        } catch (error) {
            console.error('Error checking cash session:', error);
            setIsPosCashBalanceOpen(true);
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);



    useEffect(() => {
        if (location.pathname === '/pos') {
            setIsOpen(false);
        }
    }, [location.pathname]);

    useEffect(() => {
        if (isCalculatorOpen || isShutdownModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isCalculatorOpen, isShutdownModalOpen]);

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
        <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
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

                    <div className="flex items-center justify-between gap-3 bg-white px-3 py-2 rounded-full border-2 border-gray-200">
                        <button
                            onClick={handlePOSClick}
                            className="px-7 py-2 bg-gray-800 text-white rounded-full flex items-center gap-4 hover:bg-gray-900 transition cursor-pointer"
                        >
                            <ClipboardPlus size={18} />POS
                        </button>

                        <div className={'flex items-center gap-3 text-gray-400'}>
                            
                            <button onClick={() => setIsCalculatorOpen(true)} className={'cursor-pointer'}>
                                <Calculator size={15} />
                            </button>
                            <button
                                onClick={() => setIsShutdownModalOpen(true)}
                                className="p-2 rounded-full bg-red-50 hover:bg-red-100 transition cursor-pointer"
                                title="Shut Down"
                            >
                                <Power size={15} />
                            </button>
                            <button
                                onClick={handleRefresh}
                                className={"p-2 rounded-full bg-emerald-50 hover:bg-emerald-100 transition cursor-pointer"}
                            >
                                <RotateCcw size={15} />
                            </button>
                            <Link to={'#'} >
                                <Bell size={15} />
                            </Link>
                            
                            <button
                                onClick={toggleFullscreen}
                                className="p-2 rounded-full hover:bg-gray-100 transition cursor-pointer me-1"
                                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                            >
                                {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
                            </button>
                            {user && (
                                <>
                                    <div className={'flex flex-col leading-1 items-end border-s-2 ps-5 border-gray-200'}>
                                        <span className="text-sm font-medium text-black">{user.name}</span>
                                        <br />
                                        <span className="text-xs text-gray-500">{user.role}</span>
                                    </div>
                                    <div className="w-12 h-12 rounded-full flex justify-center items-center bg-emerald-500 text-white font-semibold text-lg">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                </>
                            )}
                            
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto ps-3 pe-1 mb-3 me-3 hide-scrollbar flex flex-col">
                    <Outlet/>
                </main>

                <AnimatePresence>
                    {isShutdownModalOpen && (
                        <ShutdownModal
                            onClose={() => setIsShutdownModalOpen(false)}
                            onShutdown={handleShutdown}
                        />
                    )}
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
                                    onNavigateToPOS={() => setIsOpen(false)}
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