import { useNavigate } from "react-router-dom";
import { User, Lock, ArrowRight, Phone, Mail, Globe, CheckCircle2 } from "lucide-react";
import { useState, type FormEvent, useEffect } from "react";
import { authService } from "../../services/authService";
import { motion, AnimatePresence } from "framer-motion";

function SignIn() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
            }
        } catch (err: unknown) {
            if (err instanceof Error && 'response' in err) {
                const axiosError = err as { response?: { data?: { message?: string } } };
                setError(axiosError.response?.data?.message || 'Invalid username or password');
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-white font-sans text-gray-900">
            {/* Left Side - Login Form (w-full on mobile, 1/2 on desktop) */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 bg-white relative">
                <div className="w-full max-w-sm space-y-10">
                    
                    {/* Mobile Logo (Visible only on small screens) */}
                    <div className="lg:hidden text-center mb-8">
                         <img src="/logo.png" alt="ReoxPOS" className="h-10 w-auto mx-auto mb-6" />
                    </div>

                    <div className="text-center lg:text-left">
                        <img src="/logo.png" alt="ReoxPOS" className="hidden lg:block h-8 w-auto mb-8" />
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                            Welcome back
                        </h2>
                        <p className="mt-2 text-sm text-gray-500">
                            Please enter your details to sign in.
                        </p>
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
                                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm flex items-start gap-3">
                                        <div className="mt-0.5"><div className="h-1.5 w-1.5 rounded-full bg-red-600" /></div>
                                        {error}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Username
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-600 transition-colors">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white"
                                        placeholder="Enter your username"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Password
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-600 transition-colors">
                                        <Lock className="h-5 w-5" />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white"
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
                            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-slate-900 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed items-center gap-2 transform hover:-translate-y-0.5"
                        >
                             {loading ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <>
                                    Log In 
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                    
                    <div className="mt-8 text-center lg:hidden">
                        <p className="text-xs text-gray-400">
                            &copy; 2026 1000D Technology.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side - Brand Area (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#0F172A] relative overflow-hidden flex-col justify-between p-16 text-white">
                {/* Background Decoration */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
                
                <div className="relative z-10">
                 
                    
                    <div className="mt-20">
                        <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-6">
                            Smart POS for <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Modern Retail</span>
                        </h1>
                        <p className="text-slate-400 text-lg max-w-md leading-relaxed mb-8">
                            Experience the power of a fully integrated point of sale system. Fast, secure, and reliable.
                        </p>
                        
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3 text-slate-300 bg-white/5 w-fit px-4 py-2 rounded-full border border-white/10 backdrop-blur-sm">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                <span className="text-sm">Real-time Inventory Sync</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-300 bg-white/5 w-fit px-4 py-2 rounded-full border border-white/10 backdrop-blur-sm">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                <span className="text-sm">Bank-grade Security</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Always Visible Contact Details */}
                <div className="relative z-10 mt-auto pt-10 border-t border-white/10">
                    <p className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">Contact Support</p>
                    <div className="grid grid-cols-2 gap-4">
                        <a href="tel:+94774227449" className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-500/50 transition-all group">
                            <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                <Phone className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-slate-400">Call Us</span>
                                <span className="text-sm font-medium text-slate-200">077 422 7449</span>
                            </div>
                        </a>
                        
                        <a href="mailto:info@1000d.tech" className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-500/50 transition-all group">
                            <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                <Mail className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-slate-400">Email Us</span>
                                <span className="text-sm font-medium text-slate-200">info@1000d.tech</span>
                            </div>
                        </a>
                        
                         <a href="https://1000d.tech" target="_blank" rel="noopener noreferrer" className="col-span-2 flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-500/50 transition-all group">
                            <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                <Globe className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-slate-400">Visit Website</span>
                                <span className="text-sm font-medium text-slate-200">www.1000d.tech</span>
                            </div>
                        </a>
                    </div>
                    <div className="mt-8 text-slate-600 text-xs">
                        &copy; 2026 1000D Technology. All rights reserved.
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignIn;