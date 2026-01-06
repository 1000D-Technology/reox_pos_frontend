import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface PosCashBalanceProps {
    onClose: () => void;
    onNavigateToPOS?: () => void;
}

const PosCashBalance = ({ onClose, onNavigateToPOS }: PosCashBalanceProps) => {
    const navigate = useNavigate();
    const [currentBalance, setCurrentBalance] = useState<string>("");
    const [selectedCounter, setSelectedCounter] = useState<string>("Counter 1");

    const counters = ["Counter 1", "Counter 2", "Counter 3", "Counter 4"];

    const handleUpdateBalance = () => {
        const newBalance = parseFloat(currentBalance);
        if (!isNaN(newBalance) && currentBalance) {
            onClose();

            if (onNavigateToPOS) {
                onNavigateToPOS();
            }

            navigate('/pos');
        }
    };

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === "Enter" && currentBalance) {
                e.preventDefault();
                handleUpdateBalance();
            } else if (e.key === "Escape") {
                e.preventDefault();
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, [currentBalance, onClose]);

    return (
        <div className="bg-white rounded-2xl shadow-2xl w-[500px] max-w-[90vw] overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">POS Cash Balance</h2>
                <button
                    onClick={onClose}
                    className="text-white hover:bg-white/20 rounded-full p-1 transition"
                >
                    <X size={24} />
                </button>
            </div>

            <div className="p-6">
                <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <label className="block text-gray-700 font-medium mb-2">
                            Select Cashier Counter:
                        </label>
                        <select
                            value={selectedCounter}
                            onChange={(e) => setSelectedCounter(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        >
                            {counters.map((counter) => (
                                <option key={counter} value={counter}>
                                    {counter}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="p-4 bg-emerald-50 rounded-lg">
                        <label className="block text-emerald-700 font-medium mb-2">
                            Current Balance:
                        </label>
                        <input
                            type="number"
                            value={currentBalance}
                            onChange={(e) => setCurrentBalance(e.target.value)}
                            placeholder="Enter current balance"
                            className="w-full px-4 py-2 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            autoFocus
                        />
                    </div>
                </div>

                <div className="mt-6 flex gap-3">
                    <button
                        onClick={handleUpdateBalance}
                        className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium flex items-center justify-center gap-2"
                    >
                        <span>Save Balance</span>
                        <kbd className="px-2 py-0.5 text-xs bg-emerald-700 rounded border border-emerald-800">
                            Enter
                        </kbd>
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium flex items-center justify-center gap-2"
                    >
                        <span>Close</span>
                        <kbd className="px-1.5 py-0.5 text-xs bg-gray-300 rounded border border-gray-400">
                            Esc
                        </kbd>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PosCashBalance;