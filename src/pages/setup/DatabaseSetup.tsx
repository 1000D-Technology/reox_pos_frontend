import { useState, useEffect } from 'react';
import { Check, Database, Loader2, Lock, Terminal, Shield, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '/logo.png';

interface DBConfig {
    DB_HOST: string;
    DB_USER: string;
    DB_PASSWORD: string;
    DB_NAME: string;
    PORT: string;
    DB_PORT: string;
}

function DatabaseSetup() {
    const navigate = useNavigate();
    const DEFAULT_PIN = '271618';
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [pin, setPin] = useState('');
    const [pinError, setPinError] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [config, setConfig] = useState<DBConfig>({
        DB_HOST: 'localhost',
        DB_USER: '',
        DB_PASSWORD: '',
        DB_NAME: '',
        PORT: '5000',
        DB_PORT: '3306'
    });
    const [isChecking, setIsChecking] = useState(true);
    const [isTesting, setIsTesting] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState('');
    const [logs, setLogs] = useState<string[]>([]);

    useEffect(() => {
        checkEnvExists();
    }, []);

    const addLog = (message: string) => {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
    };

    const checkEnvExists = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/setup/check-env');
            const data = await response.json();

            if (data.exists && data.connected) {
                setIsConnected(true);
                setTimeout(() => navigate('/signin'), 1500);
            } else {
                setIsChecking(false);
            }
        } catch {
            setIsChecking(false);
        }
    };

    const handlePinSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsValidating(true);
        setPinError('');

        // Simulate validation with animation
        await new Promise(resolve => setTimeout(resolve, 1200));

        if (pin === DEFAULT_PIN) {
            setIsUnlocked(true);
        } else {
            setPinError('Invalid PIN. Please try again.');
            setPin('');
            setIsValidating(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfig({ ...config, [e.target.name]: e.target.value });
        setError('');
    };

    const testConnection = async () => {
        setIsTesting(true);
        setError('');
        setLogs([]);

        try {
            addLog('⚡ Initializing connection test...');
            await new Promise(resolve => setTimeout(resolve, 300));
            addLog(`📡 Connecting to ${config.DB_HOST}...`);
            await new Promise(resolve => setTimeout(resolve, 300));
            addLog(`👤 Authenticating user: ${config.DB_USER}`);
            await new Promise(resolve => setTimeout(resolve, 300));
            addLog(`🗄️  Accessing database: ${config.DB_NAME}`);
            await new Promise(resolve => setTimeout(resolve, 500));

            const response = await fetch('http://localhost:5000/api/setup/test-connection', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });

            const data = await response.json();

            if (data.success) {
                addLog('✓ Connection established successfully!');
                await new Promise(resolve => setTimeout(resolve, 300));
                addLog('💾 Writing configuration to .env file...');
                await new Promise(resolve => setTimeout(resolve, 500));
                addLog('✓ Configuration saved successfully!');
                await new Promise(resolve => setTimeout(resolve, 300));
                addLog('🔄 Server restart required: node index.js');
                await new Promise(resolve => setTimeout(resolve, 300));
                addLog('✓ Setup completed! Redirecting...');

                setTimeout(() => {
                    setIsConnected(true);
                    setTimeout(() => navigate('/signin'), 1500);
                }, 1000);
            } else {
                addLog(`✗ Connection failed: ${data.message}`);
                setError(data.message || 'Connection failed');
            }
        } catch {
            addLog('✗ Failed to reach server');
            setError('Failed to connect to server');
        } finally {
            setIsTesting(false);
        }
    };

    if (isChecking) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-emerald-50 to-green-100">
                <img src={logo} alt="REOX" className="h-20 mb-6 animate-pulse" />
                <Loader2 className="animate-spin text-emerald-600" size={40} />
                <p className="mt-4 text-gray-700 font-medium">Checking configuration...</p>
            </div>
        );
    }

    if (isConnected) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-emerald-50 to-green-100">
                <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-md">
                    <div className="h-20 w-20 mx-auto bg-emerald-500 rounded-full flex items-center justify-center mb-6 animate-bounce">
                        <Check className="text-white" size={40} />
                    </div>
                    <h2 className="text-3xl font-bold text-emerald-600 mb-3">Success!</h2>
                    <p className="text-gray-600 text-lg">Database connected successfully</p>
                    <p className="text-gray-500 text-sm mt-2">Redirecting to sign in...</p>
                </div>
            </div>
        );
    }

    if (!isUnlocked) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 p-4">
                <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md border-2 border-emerald-100">
                    <div className="flex flex-col items-center mb-8">
                        <img src={logo} alt="REOX" className="h-16 mb-6" />
                        <div className="h-20 w-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                            <Shield className="text-white" size={40} />
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold text-center mb-2 text-emerald-600">
                        Security Access
                    </h1>
                    <p className="text-sm text-gray-600 text-center mb-8">Enter your PIN to access database setup</p>

                    <form onSubmit={handlePinSubmit} className="space-y-6">
                        <div className="relative">
                            <input
                                type="password"
                                value={pin}
                                onChange={(e) => {
                                    setPin(e.target.value);
                                    setPinError('');
                                }}
                                maxLength={6}
                                disabled={isValidating}
                                className="bg-emerald-50 border-2 border-emerald-300 focus:border-emerald-500 text-gray-800 text-center text-3xl tracking-widest rounded-2xl w-full p-4 focus:ring-4 focus:ring-emerald-200 transition-all disabled:opacity-50"
                                placeholder="● ● ● ● ● ●"
                                autoFocus
                            />
                            {isValidating && (
                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                                    <Loader2 className="animate-spin text-emerald-600" size={24} />
                                </div>
                            )}
                        </div>

                        {pinError && (
                            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg animate-shake">
                                <p className="font-medium">{pinError}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isValidating || pin.length !== 6}
                            className="relative w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 p-4 font-semibold text-white rounded-2xl overflow-hidden transition-all transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed group"
                        >
                            {isValidating ? (
                                <>
                                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-400 animate-shimmer" />
                                    <div className="relative flex items-center justify-center gap-2">
                                        <Loader2 className="animate-spin" size={20} />
                                        <span>Validating PIN...</span>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    <Lock size={20} />
                                    <span>Unlock Setup</span>
                                </div>
                            )}
                        </button>

                        <p className="text-xs text-center text-gray-400 mt-6">
                            🔒 Contact system administrator if you forgot the PIN
                        </p>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 p-6">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-7xl overflow-hidden border-2 border-emerald-100">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-8 text-white">
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <img src={logo} alt="REOX" className="h-12" />
                        <Database size={40} />
                    </div>
                    <h1 className="text-3xl font-bold text-center">Database Configuration</h1>
                    <p className="text-center text-emerald-50 mt-2">Set up your database connection securely</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 p-8">
                    {/* Configuration Form */}
                    <div className="space-y-5">
                        <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-gray-800">
                                <Database size={20} className="text-emerald-600" />
                                Connection Details
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700">Database Host</label>
                                    <input
                                        type="text"
                                        name="DB_HOST"
                                        value={config.DB_HOST}
                                        onChange={handleInputChange}
                                        className="bg-white border-2 border-emerald-200 focus:border-emerald-500 text-sm rounded-xl w-full p-3 focus:ring-4 focus:ring-emerald-100 transition-all"
                                        placeholder="localhost"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700">Database User</label>
                                    <input
                                        type="text"
                                        name="DB_USER"
                                        value={config.DB_USER}
                                        onChange={handleInputChange}
                                        className="bg-white border-2 border-emerald-200 focus:border-emerald-500 text-sm rounded-xl w-full p-3 focus:ring-4 focus:ring-emerald-100 transition-all"
                                        placeholder="root"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700">Database Password</label>
                                    <input
                                        type="password"
                                        name="DB_PASSWORD"
                                        value={config.DB_PASSWORD}
                                        onChange={handleInputChange}
                                        className="bg-white border-2 border-emerald-200 focus:border-emerald-500 text-sm rounded-xl w-full p-3 focus:ring-4 focus:ring-emerald-100 transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700">Database Name</label>
                                    <input
                                        type="text"
                                        name="DB_NAME"
                                        value={config.DB_NAME}
                                        onChange={handleInputChange}
                                        className="bg-white border-2 border-emerald-200 focus:border-emerald-500 text-sm rounded-xl w-full p-3 focus:ring-4 focus:ring-emerald-100 transition-all"
                                        placeholder="reox_db"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700">Database Port</label>
                                    <input
                                        type="text"
                                        name="DB_PORT"
                                        value={config.DB_PORT}
                                        onChange={handleInputChange}
                                        className="bg-white border-2 border-emerald-200 focus:border-emerald-500 text-sm rounded-xl w-full p-3 focus:ring-4 focus:ring-emerald-100 transition-all"
                                        placeholder="3306"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700">Server Port</label>
                                    <input
                                        type="text"
                                        name="PORT"
                                        value={config.PORT}
                                        onChange={handleInputChange}
                                        className="bg-white border-2 border-emerald-200 focus:border-emerald-500 text-sm rounded-xl w-full p-3 focus:ring-4 focus:ring-emerald-100 transition-all"
                                        placeholder="5000"
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-xl">
                                <p className="font-medium">{error}</p>
                            </div>
                        )}

                        <button
                            onClick={testConnection}
                            disabled={isTesting}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 p-4 font-semibold text-white rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                        >
                            {isTesting ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Testing Connection...
                                </>
                            ) : (
                                <>
                                    <CheckCircle size={20} />
                                    Test & Save Configuration
                                </>
                            )}
                        </button>
                    </div>

                    {/* Terminal Output */}
                    <div className="bg-white rounded-2xl p-6 border-2 border-emerald-100">
                        <div className="flex items-center gap-2 mb-4 pb-4 border-b-2 border-emerald-100">
                            <Terminal size={20} className="text-emerald-600" />
                            <span className="font-semibold text-gray-800">Configuration Terminal</span>
                            {isTesting && <div className="ml-auto h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />}
                        </div>

                        <div className="h-96 overflow-y-auto space-y-2 font-mono text-sm">
                            {logs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <Terminal size={48} className="mb-3 opacity-20" />
                                    <p>Waiting for connection test...</p>
                                    <p className="text-xs mt-2">Click "Test & Save Configuration" to begin</p>
                                </div>
                            ) : (
                                logs.map((log, index) => (
                                    <div key={index} className="animate-slideIn text-gray-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100">
                                        {log}
                                    </div>
                                ))
                            )}
                            {isTesting && logs.length > 0 && (
                                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-100 px-3 py-2 rounded-lg animate-pulse">
                                    <span>▸</span>
                                    <Loader2 className="animate-spin" size={14} />
                                    <span>Processing...</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DatabaseSetup;