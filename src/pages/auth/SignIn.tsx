import { useNavigate } from "react-router-dom";
import { User, Lock, ArrowRight, Phone, Mail, Globe, HelpCircle, ChevronDown } from "lucide-react";
import { useState, type FormEvent, useEffect } from "react";
import { authService } from "../../services/authService";
import { motion, AnimatePresence } from "framer-motion";
import logo from "/logo.png";

function SignIn() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showContact, setShowContact] = useState(false);

    useEffect(() => {
        if (authService.isAuthenticated()) {
            navigate('/dashboard', { replace: true });
        }
    }, [navigate]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authService.login({ username, password });

            if (response.success) {
                if (response.user.status_id !== 1) {
                    setError('Your account is inactive. Please contact support.');
                    sessionStorage.clear();
                    return;
                }
                navigate('/dashboard', { replace: true });
            } else {
                setError(response.message || 'Login failed');
            }
        } catch (err: any) {
            const message = err.response?.data?.message || err.message || 'An unexpected error occurred';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#0F172A] relative flex items-center justify-center p-4 overflow-hidden">
            {/* Ambient Background Effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
            
            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-soft-light" />

            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-lg bg-white relative z-10 rounded-3xl shadow-2xl overflow-hidden"
            >
                {/* Decorative Top Bar */}
                <div className="h-2 w-full bg-linear-to-r from-emerald-400 via-teal-500 to-cyan-500" />

                <div className="p-8 md:p-12">
                    <div className="flex flex-col items-center text-center mb-10">
                        <img src={logo} alt="ReoxPOS" className="h-12 w-auto mb-6" />
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome Back</h2>
                        <p className="text-gray-500 mt-2 text-sm">Sign in to access your dashboard</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <AnimatePresence>
                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
                                        {error}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-4">
                            <div className="group relative">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Username</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                                        placeholder="Enter your username"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="group relative">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                                        <Lock className="h-5 w-5" />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                                        placeholder="••••••••"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gray-900 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 gap-2 items-center group"
                        >
                            {loading ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <>
                                    Log In 
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer / Toggle Section */}
                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <button
                            onClick={() => setShowContact(!showContact)}
                            className="flex items-center justify-center gap-2 w-full text-sm text-gray-500 hover:text-emerald-600 transition-colors py-2 group"
                        >
                            <HelpCircle className="w-4 h-4" />
                            <span className="font-medium">Having trouble signing in?</span>
                            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showContact ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {showContact && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                    animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <a href="tel:+94774227449" className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 hover:bg-emerald-50 border border-gray-100 hover:border-emerald-200 transition-all group">
                                            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 group-hover:text-emerald-600 mb-2 transition-colors">
                                                <Phone className="w-5 h-5" />
                                            </div>
                                            <span className="text-xs font-bold text-gray-600 group-hover:text-emerald-700">Call Us</span>
                                            <span className="text-[10px] text-gray-400 mt-1">077 422 7449</span>
                                        </a>

                                        <a href="mailto:info@1000d.tech" className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 hover:bg-emerald-50 border border-gray-100 hover:border-emerald-200 transition-all group">
                                            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 group-hover:text-emerald-600 mb-2 transition-colors">
                                                <Mail className="w-5 h-5" />
                                            </div>
                                            <span className="text-xs font-bold text-gray-600 group-hover:text-emerald-700">Email</span>
                                            <span className="text-[10px] text-gray-400 mt-1">info@1000d.tech</span>
                                        </a>

                                        <a href="https://1000d.tech" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 hover:bg-emerald-50 border border-gray-100 hover:border-emerald-200 transition-all group">
                                            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 group-hover:text-emerald-600 mb-2 transition-colors">
                                                <Globe className="w-5 h-5" />
                                            </div>
                                            <span className="text-xs font-bold text-gray-600 group-hover:text-emerald-700">Website</span>
                                            <span className="text-[10px] text-gray-400 mt-1">1000d.tech</span>
                                        </a>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-xs text-gray-300 font-medium">
                            &copy; 2026 1000D Technology.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default SignIn;