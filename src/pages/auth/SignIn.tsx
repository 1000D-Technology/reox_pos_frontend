import { Link, useNavigate } from "react-router-dom";
import { ChartLine, Cloudy, Lock, Phone, Rocket } from "lucide-react";
import { type ReactNode, useState, type FormEvent, useEffect } from "react";
import { authService } from "../../services/authService";

function SignIn() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Redirect if already logged in
    useEffect(() => {
        if (authService.isAuthenticated()) {
            navigate('/dashboard', { replace: true });
        }
    }, [navigate]);

    interface Options {
        icon: ReactNode;
        description: string;
    }

    const options: Options[] = [
        { icon: <Rocket size={15} />, description: 'Experience lightning fast performance with seamless speed, efficiency, and reliability.' },
        { icon: <Lock size={15} />, description: 'Protecting your data with advanced encryption and trusted bank-level security.' },
        { icon: <ChartLine size={15} />, description: 'Gain instant insights and make smarter business decisions with real-time analytics.' },
        { icon: <Cloudy size={15} />, description: 'Access your data anywhere, anytime with secure cloud synchronized storage.' },
    ];

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

                if (rememberMe) {
                    localStorage.setItem('rememberMe', 'true');
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
        <div className={'md:flex w-full h-screen'}>
            <div className={'flex md:w-1/2 md:h-screen bg-white justify-center'}>
                <div className={'md:w-1/2 md:h-screen py-10 md:py-0'}>
                    <div className={'md:h-1/5 w-full'}></div>
                    <div className={'md:h-3/5 w-full'}>
                        <div className={'h-1/5 w-full mb-8 md:mb-0'}>
                            <h1 className={'text-3xl font-semibold'}>Sign In</h1>
                            <span className={'text-sm text-gray-500'}>
                                Enter your Username and password to sign in!
                            </span>
                        </div>

                        <form onSubmit={handleSubmit} className={'h-4/5 w-full flex flex-col gap-5'}>
                            {error && (
                                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label htmlFor="username" className="block mb-2 text-sm font-medium">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="border border-gray-300 text-sm rounded-md w-full p-2.5"
                                    placeholder="Username"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block mb-2 text-sm font-medium">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="border border-gray-300 text-sm rounded-md w-full p-2.5"
                                    placeholder="Password"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            {/*<div className={'flex justify-between items-center mt-3'}>*/}
                            {/*    <div className="flex items-start">*/}
                            {/*        <div className="flex items-center h-5">*/}
                            {/*            <input*/}
                            {/*                id="remember"*/}
                            {/*                type="checkbox"*/}
                            {/*                checked={rememberMe}*/}
                            {/*                onChange={(e) => setRememberMe(e.target.checked)}*/}
                            {/*                className="w-4 h-4 border border-gray-300 rounded-sm bg-gray-50"*/}
                            {/*                disabled={loading}*/}
                            {/*            />*/}
                            {/*        </div>*/}
                            {/*        <label htmlFor="remember" className="ms-2 text-sm font-medium">*/}
                            {/*            Keep me Logged In*/}
                            {/*        </label>*/}
                            {/*    </div>*/}
                            {/*    <div>*/}
                            {/*        <Link to={'/forgot-password'} className={'text-sm text-emerald-500 hover:underline font-medium'}>*/}
                            {/*            Forgot Password?*/}
                            {/*        </Link>*/}
                            {/*    </div>*/}
                            {/*</div>*/}

                            <div className={'h-full flex items-center'}>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full bg-emerald-400 hover:bg-emerald-500 p-2 font-medium text-white rounded-md cursor-pointer ${
                                        loading ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                >
                                    {loading ? 'Signing In...' : 'Sign In'}
                                </button>
                            </div>
                        </form>
                    </div>
                    <div className={'md:h-1/5 w-full flex items-center justify-center mt-4 md:mt-0'}>
                        <p className={'text-sm text-gray-400'}>
                            &copy; 2026 <a href="#">1000D Technology PVT LTD</a>. All rights Reserved
                        </p>
                    </div>
                </div>
            </div>
            <div className={'flex flex-col md:w-1/2 md:h-screen bg-emerald-400 md:rounded-bl-[100px] rounded-t-3xl lg:rounded-t-none'}>
                <div className={'flex flex-col items-center justify-end h-1/2 md:px-10 pt-8 md:pt-0'}>
                    <img src="/logow.png" alt="reox pos logo" className={'md:h-24 h-12'} />
                    <p className={'md:px-10 px-4 text-center text-sm text-white'}>
                        Secure and seamless access to your retail management system. Designed for speed, simplicity, and reliability, Reox ensures that only authorized users can manage sales, inventory, and transactions with ease.
                    </p>
                </div>
                <div className={'flex flex-col w-full h-1/2'}>
                    <div className={'md:px-10 px-4 grid md:grid-cols-4 grid-cols-2 md:gap-8 gap-1'}>
                        {options.map((option, index) => (
                            <div key={index} className={'flex flex-col items-center text-center gap-2 md:mt-10 mt-4'}>
                                <div className={'p-2 bg-white/20 rounded-full text-white'}>
                                    {option.icon}
                                </div>
                                <p className={'text-[13px] text-white'}>{option.description}</p>
                            </div>
                        ))}
                    </div>
                    <div className={'flex h-full justify-end items-end p-10'}>
                        <a href="#" className={'flex items-center gap-3 text-white'}>
                            Contact Support
                            <div className={'h-12 w-12 rounded-full bg-gradient-to-r from-emerald-300 to-emerald-600 flex justify-center items-center'}>
                                <Phone size={15} />
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignIn;