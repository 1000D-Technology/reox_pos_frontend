import { useState, useEffect } from "react";
import { X, DollarSign, CreditCard, TrendingUp, ChevronRight, CheckCircle, Calendar, User, Store } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cashSessionService, type CashierCounter } from "../../services/cashSessionService";
import { authService } from "../../services/authService";

interface PosCashBalanceProps {
    onClose: () => void;
    onNavigateToPOS: () => void;
}

export default function PosCashBalance({ onClose, onNavigateToPOS }: PosCashBalanceProps) {
    const navigate = useNavigate();
    const [selectedCounter, setSelectedCounter] = useState<number | null>(null);
    const [openingBalance, setOpeningBalance] = useState<string>("");
    const [counters, setCounters] = useState<CashierCounter[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState(false);
    const [navigating, setNavigating] = useState(false);

    useEffect(() => {
        loadCounters();
    }, []);

    const loadCounters = async () => {
        try {
            const data = await cashSessionService.getCashierCounters();
            setCounters(data);
        } catch (error) {
            console.error('Error loading counters:', error);
            setError("Failed to load counters");
        }
    };
    const handleSubmit = async () => {
        if (!selectedCounter) {
            setError("Please select a counter");
            return;
        }

        if (!openingBalance || parseFloat(openingBalance) < 0) {
            setError("Please enter a valid opening balance");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const userId = authService.getUserId();
            if (!userId) {
                setError("User not found");
                setLoading(false);
                return;
            }

            // Get selected counter details
            const selectedCounterData = counters.find(c => c.id === selectedCounter);
            if (!selectedCounterData) {
                setError("Invalid counter selected");
                setLoading(false);
                return;
            }

            const sessionData = {
                opening_date_time: new Date().toISOString(),
                user_id: userId,
                opening_balance: parseFloat(openingBalance),
                cash_total: 0,
                card_total: 0,
                bank_total: 0,
                cashier_counter_id: selectedCounter,
                cash_status_id: 1
            };

            await cashSessionService.createCashSession(sessionData);

            // Store counter code and date in localStorage
            localStorage.setItem('current_counter', selectedCounterData.cashier_counter);
            localStorage.setItem('session_date', new Date().toISOString().split('T')[0]);

            setSuccess(true);
            setLoading(false);

            setTimeout(() => {
                setNavigating(true);
                setTimeout(() => {
                    onClose();
                    onNavigateToPOS();
                    navigate('/pos');
                }, 800);
            }, 1000);
        } catch (error) {
            console.error('Error creating cash session:', error);
            setError("Failed to create cash session");
            setLoading(false);
        }
    };


    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Enter' && !loading && !success && selectedCounter && openingBalance) {
                event.preventDefault();
                handleSubmit();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [loading, success, selectedCounter, openingBalance]);

    return (
        <>
            <style>{`
                @keyframes slideInUp {
                    from {
                        transform: translateY(50px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes scaleIn {
                    from {
                        transform: scale(0.95);
                        opacity: 0;
                    }
                    to {
                        transform: scale(1);
                        opacity: 1;
                    }
                }

                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }

                @keyframes checkmark {
                    0% {
                        transform: scale(0) rotate(-45deg);
                        opacity: 0;
                    }
                    50% {
                        transform: scale(1.2) rotate(-45deg);
                        opacity: 1;
                    }
                    100% {
                        transform: scale(1) rotate(0deg);
                        opacity: 1;
                    }
                }

                @keyframes slideOut {
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }

                @keyframes shimmer {
                    0% {
                        background-position: -1000px 0;
                    }
                    100% {
                        background-position: 1000px 0;
                    }
                }

                .animate-slide-in {
                    animation: slideInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .animate-fade-in {
                    animation: fadeIn 0.4s ease-out;
                }

                .animate-scale-in {
                    animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .animate-pulse-scale {
                    animation: pulse 2s ease-in-out infinite;
                }

                .animate-checkmark {
                    animation: checkmark 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }

                .animate-slide-out {
                    animation: slideOut 0.6s ease-in forwards;
                }

                .gradient-bg {
                    background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
                }

                .gradient-border {
                    background: linear-gradient(135deg, #10b981, #059669);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .glass-effect {
                    backdrop-filter: blur(20px);
                    background: rgba(255, 255, 255, 0.98);
                }

                .counter-card {
                    position: relative;
                    overflow: hidden;
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .counter-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
                    transition: left 0.5s;
                }

                .counter-card:hover::before {
                    left: 100%;
                }

                .counter-card:hover {
                    transform: translateY(-4px) scale(1.02);
                    box-shadow: 0 12px 24px rgba(16, 185, 129, 0.25);
                }

                .counter-card.selected {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    color: white;
                    box-shadow: 0 12px 32px rgba(16, 185, 129, 0.5);
                    transform: scale(1.05);
                }

                .input-wrapper {
                    position: relative;
                    transition: all 0.3s ease;
                }

                .input-wrapper:focus-within {
                    transform: scale(1.01);
                }

                .input-focus {
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .input-focus:focus {
                    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15);
                    border-color: #10b981;
                }

                .shimmer-btn {
                    position: relative;
                    overflow: hidden;
                }

                .shimmer-btn::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
                    animation: shimmer 2s infinite;
                }

                .info-card {
                    transition: all 0.3s ease;
                }

                .info-card:hover {
                    transform: translateX(4px);
                    background: rgba(16, 185, 129, 0.05);
                }
            `}</style>

            <div className={`glass-effect rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden ${navigating ? 'animate-slide-out' : 'animate-slide-in'}`}>
                {/* Success Overlay */}
                {success && !navigating && (
                    <div className="absolute inset-0 gradient-bg flex items-center justify-center z-50 animate-fade-in">
                        <div className="text-center text-white space-y-6">
                            <CheckCircle size={100} className="mx-auto animate-checkmark drop-shadow-2xl" />
                            <div className="space-y-2">
                                <h3 className="text-4xl font-bold">Session Created Successfully!</h3>
                                <p className="text-xl text-emerald-100">Redirecting to POS terminal...</p>
                            </div>
                            <div className="flex items-center justify-center space-x-2">
                                <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                                <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="gradient-bg px-10 py-8">
                    <div className="flex justify-between items-start">
                        <div className="flex items-start space-x-4">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                <DollarSign size={32} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-2">Start New Cash Session</h2>
                                <div className="flex items-center space-x-4 text-emerald-100">
                                    <div className="flex items-center space-x-2">
                                        <Calendar size={16} />
                                        <span className="text-sm font-medium">{currentDate}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <User size={16} />
                                        <span className="text-sm font-medium">Cashier Session</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-3 hover:bg-white/20 rounded-xl transition-all duration-300 text-white hover:rotate-90 transform"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div><div className="p-10">
                <div className="grid grid-cols-3 gap-8">
                    {/* Left Section - Counter Selection */}
                    <div className="col-span-2 space-y-6">
                        {/* Error Message */}
                        {error && (
                            <div className="p-5 bg-red-50 border-l-4 border-red-500 rounded-r-xl animate-scale-in">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                        <X size={20} className="text-red-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-red-800">Error</p>
                                        <p className="text-sm text-red-600">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Counter Selection */}
                        <div>
                            <label className="flex items-center text-lg font-bold text-gray-800 mb-4">
                                <Store size={22} className="mr-3 text-emerald-600" />
                                Select Your Counter
                            </label>
                            <div className="grid grid-cols-3 gap-4">
                                {counters.map((counter, index) => (
                                    <button
                                        key={counter.id}
                                        onClick={() => setSelectedCounter(counter.id)}
                                        className={`counter-card p-6 rounded-2xl border-3 font-semibold transition animate-scale-in ${
                                            selectedCounter === counter.id
                                                ? 'selected border-emerald-600'
                                                : 'border-gray-200 hover:border-emerald-400 bg-white'
                                        }`}
                                        style={{animationDelay: `${index * 0.1}s`}}
                                    >
                                        <div className="flex flex-col items-center space-y-3">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                                selectedCounter === counter.id
                                                    ? 'bg-white/20'
                                                    : 'bg-emerald-50'
                                            }`}><CreditCard size={24} className={selectedCounter === counter.id ? 'text-white' : 'text-emerald-600'} />
                                            </div>
                                            <div className="text-center">
                                                <div className="text-xl font-bold">{counter.cashier_counter}</div>
                                                {selectedCounter === counter.id && (
                                                    <CheckCircle size={18} className="mx-auto mt-2 animate-checkmark" />
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Opening Balance */}
                        <div>
                            <label className="flex items-center text-lg font-bold text-gray-800 mb-4">
                                <TrendingUp size={22} className="mr-3 text-emerald-600" />
                                Opening Balance
                            </label>
                            <div className="input-wrapper">
                                <div className="relative">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 text-2xl font-bold">
                                            Rs
                                        </span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={openingBalance}
                                        onChange={(e) => setOpeningBalance(e.target.value)}
                                        placeholder="0.00"
                                        className="input-focus w-full pl-14 pr-6 py-5 border-3 border-gray-200 rounded-2xl focus:border-emerald-500 focus:outline-none text-2xl font-bold bg-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={loading || success}
                            className={`shimmer-btn w-full py-6 rounded-2xl font-bold text-white text-xl transition-all transform hover:scale-[1.02] flex items-center justify-center space-x-3 shadow-lg ${
                                loading || success
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'gradient-bg hover:shadow-2xl'
                            } ${loading ? 'animate-pulse-scale' : ''}`}
                        >
                            {loading ? (
                                <>
                                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Opening Session...</span>
                                </>
                            ) : (
                                <>
                                    <span>Start POS Terminal</span>
                                    <ChevronRight size={26} />
                                </>
                            )}
                        </button>
                    </div>

                    {/* Right Section - Info Cards */}
                    <div className="space-y-4">
                        <div className="info-card p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border-2 border-emerald-100">
                            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                                <CheckCircle size={24} className="text-emerald-600" />
                            </div>
                            <h3 className="font-bold text-gray-800 mb-2">Session Tracking</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Your cash session will be securely tracked and monitored throughout the day.
                            </p>
                        </div>

                        <div className="info-card p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-100">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                                <DollarSign size={24} className="text-blue-600" />
                            </div>
                            <h3 className="font-bold text-gray-800 mb-2">Balance Management</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Track cash, card, and bank transactions with real-time balance updates.
                            </p>
                        </div>

                        <div className="info-card p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-100">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                                <Store size={24} className="text-purple-600" />
                            </div>
                            <h3 className="font-bold text-gray-800 mb-2">Counter Assignment</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Select your designated counter to begin processing transactions.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </>
    );
}