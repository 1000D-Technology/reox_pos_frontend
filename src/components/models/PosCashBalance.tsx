import { useState, useEffect } from "react";
import { X } from "lucide-react";
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

            onClose();
            onNavigateToPOS();
            navigate('/pos');
        } catch (error) {
            console.error('Error creating cash session:', error);
            setError("Failed to create cash session");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Open Cash Session</h2>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full transition"
                >
                    <X size={20} />
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Counter
                    </label>
                    <select
                        value={selectedCounter || ""}
                        onChange={(e) => setSelectedCounter(Number(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                        <option value="">Choose a counter</option>
                        {counters.map((counter) => (
                            <option key={counter.id} value={counter.id}>
                                {counter.cashier_counter}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Opening Balance
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        value={openingBalance}
                        onChange={(e) => setOpeningBalance(e.target.value)}
                        placeholder="Enter opening balance"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "Opening..." : "Open POS"}
                </button>
            </div>
        </div>
    );
}