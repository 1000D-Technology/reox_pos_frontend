// src/components/models/CalculatorModal.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Delete, RotateCcw, History, X } from 'lucide-react';

interface HistoryItem {
    expression: string;
    result: string;
    timestamp: Date;
}

interface CalculatorModalProps {
    onClose: () => void;
}

const CalculatorModal = ({ onClose }: CalculatorModalProps) => {
    const [display, setDisplay] = useState('0');
    const [previousValue, setPreviousValue] = useState<string | null>(null);
    const [operation, setOperation] = useState<string | null>(null);
    const [waitingForOperand, setWaitingForOperand] = useState(false);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [memory, setMemory] = useState(0);

    const handleNumberClick = (num: string) => {
        if (waitingForOperand) {
            setDisplay(num);
            setWaitingForOperand(false);
        } else {
            setDisplay(display === '0' ? num : display + num);
        }
    };

    const handleDecimalClick = () => {
        if (waitingForOperand) {
            setDisplay('0.');
            setWaitingForOperand(false);
        } else if (display.indexOf('.') === -1) {
            setDisplay(display + '.');
        }
    };

    const handleOperationClick = (nextOperation: string) => {
        const inputValue = parseFloat(display);

        if (previousValue === null) {
            setPreviousValue(display);
        } else if (operation) {
            const currentValue = parseFloat(previousValue);
            const newValue = performOperation(currentValue, inputValue, operation);

            setDisplay(String(newValue));
            setPreviousValue(String(newValue));
        }

        setWaitingForOperand(true);
        setOperation(nextOperation);
    };

    const performOperation = (firstValue: number, secondValue: number, operation: string): number => {
        switch (operation) {
            case '+':
                return firstValue + secondValue;
            case '-':
                return firstValue - secondValue;
            case '×':
                return firstValue * secondValue;
            case '÷':
                return secondValue !== 0 ? firstValue / secondValue : 0;
            case '%':
                return firstValue % secondValue;
            default:
                return secondValue;
        }
    };

    const handleEquals = () => {
        const inputValue = parseFloat(display);

        if (previousValue !== null && operation) {
            const currentValue = parseFloat(previousValue);
            const result = performOperation(currentValue, inputValue, operation);

            const historyItem: HistoryItem = {
                expression: `${previousValue} ${operation} ${display}`,
                result: String(result),
                timestamp: new Date()
            };
            setHistory([historyItem, ...history].slice(0, 20));

            setDisplay(String(result));
            setPreviousValue(null);
            setOperation(null);
            setWaitingForOperand(true);
        }
    };

    const handleClear = () => {
        setDisplay('0');
        setPreviousValue(null);
        setOperation(null);
        setWaitingForOperand(false);
    };

    const handleBackspace = () => {
        if (display.length > 1) {
            setDisplay(display.slice(0, -1));
        } else {
            setDisplay('0');
        }
    };

    const handlePercentage = () => {
        const value = parseFloat(display);
        setDisplay(String(value / 100));
    };

    const handleSignChange = () => {
        const value = parseFloat(display);
        setDisplay(String(value * -1));
    };

    const handleSquareRoot = () => {
        const value = parseFloat(display);
        if (value >= 0) {
            setDisplay(String(Math.sqrt(value)));
        }
    };

    const handleSquare = () => {
        const value = parseFloat(display);
        setDisplay(String(value * value));
    };

    const handleMemoryClear = () => setMemory(0);
    const handleMemoryRecall = () => setDisplay(String(memory));
    const handleMemoryAdd = () => setMemory(memory + parseFloat(display));
    const handleMemorySubtract = () => setMemory(memory - parseFloat(display));

    const clearHistory = () => {
        setHistory([]);
        setShowHistory(false);
    };


    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            // Stop propagation to prevent other key handlers from running
            e.stopPropagation();

            if (e.key >= '0' && e.key <= '9') {
                e.preventDefault();
                handleNumberClick(e.key);
            }

            switch (e.key) {
                case '+':
                    e.preventDefault();
                    handleOperationClick('+');
                    break;
                case '-':
                    e.preventDefault();
                    handleOperationClick('-');
                    break;
                case '*':
                    e.preventDefault();
                    handleOperationClick('×');
                    break;
                case '/':
                    e.preventDefault();
                    handleOperationClick('÷');
                    break;
                case '%':
                    e.preventDefault();
                    handlePercentage();
                    break;
                case '.':
                    e.preventDefault();
                    handleDecimalClick();
                    break;
                case 'Enter':
                case '=':
                    e.preventDefault();
                    handleEquals();
                    break;
                case 'Escape':
                    e.preventDefault();
                    onClose();
                    break;
                case 'c':
                case 'C':
                    e.preventDefault();
                    handleClear();
                    break;
                case 'Backspace':
                    e.preventDefault();
                    handleBackspace();
                    break;
            }
        };

        // Add event listener with capture phase to intercept before other handlers
        window.addEventListener('keydown', handleKeyPress, true);
        return () => window.removeEventListener('keydown', handleKeyPress, true);
    }, [display, previousValue, operation, waitingForOperand, onClose]);

    const buttons = [
        { label: 'MC', action: handleMemoryClear, className: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
        { label: 'MR', action: handleMemoryRecall, className: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
        { label: 'M+', action: handleMemoryAdd, className: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
        { label: 'M-', action: handleMemorySubtract, className: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },

        { label: '√', action: handleSquareRoot, className: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' },
        { label: 'x²', action: handleSquare, className: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' },
        { label: '%', action: handlePercentage, className: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' },
        { label: '÷', action: () => handleOperationClick('÷'), className: 'bg-emerald-500 text-white hover:bg-emerald-600' },

        { label: '7', action: () => handleNumberClick('7'), className: 'bg-white hover:bg-gray-50 border border-gray-200' },
        { label: '8', action: () => handleNumberClick('8'), className: 'bg-white hover:bg-gray-50 border border-gray-200' },
        { label: '9', action: () => handleNumberClick('9'), className: 'bg-white hover:bg-gray-50 border border-gray-200' },
        { label: '×', action: () => handleOperationClick('×'), className: 'bg-emerald-500 text-white hover:bg-emerald-600' },

        { label: '4', action: () => handleNumberClick('4'), className: 'bg-white hover:bg-gray-50 border border-gray-200' },
        { label: '5', action: () => handleNumberClick('5'), className: 'bg-white hover:bg-gray-50 border border-gray-200' },
        { label: '6', action: () => handleNumberClick('6'), className: 'bg-white hover:bg-gray-50 border border-gray-200' },
        { label: '-', action: () => handleOperationClick('-'), className: 'bg-emerald-500 text-white hover:bg-emerald-600' },

        { label: '1', action: () => handleNumberClick('1'), className: 'bg-white hover:bg-gray-50 border border-gray-200' },
        { label: '2', action: () => handleNumberClick('2'), className: 'bg-white hover:bg-gray-50 border border-gray-200' },
        { label: '3', action: () => handleNumberClick('3'), className: 'bg-white hover:bg-gray-50 border border-gray-200' },
        { label: '+', action: () => handleOperationClick('+'), className: 'bg-emerald-500 text-white hover:bg-emerald-600' },

        { label: '±', action: handleSignChange, className: 'bg-white hover:bg-gray-50 border border-gray-200' },
        { label: '0', action: () => handleNumberClick('0'), className: 'bg-white hover:bg-gray-50 border border-gray-200' },
        { label: '.', action: handleDecimalClick, className: 'bg-white hover:bg-gray-50 border border-gray-200' },
        { label: '=', action: handleEquals, className: 'bg-emerald-600 text-white hover:bg-emerald-700' },
    ];

    return (
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-4xl mx-4">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Calculator</h2>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                    <X className="w-5 h-5 text-white" />
                </button>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Calculator */}
                    <div className="lg:col-span-2">
                        {/* Display */}
                        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl mb-4 shadow-lg">
                            <div className="text-right">
                                {previousValue && operation && (
                                    <div className="text-gray-400 text-lg mb-2 font-mono">
                                        {parseFloat(previousValue).toLocaleString('en-US', { maximumFractionDigits: 10 })} {operation}
                                    </div>
                                )}
                                <div className="text-white text-5xl font-light break-all font-mono">
                                    {parseFloat(display).toLocaleString('en-US', {
                                        maximumFractionDigits: 10
                                    })}
                                </div>
                                {memory !== 0 && (
                                    <div className="text-emerald-400 text-sm mt-3 font-mono">
                                        M: {memory.toLocaleString('en-US', { maximumFractionDigits: 10 })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="p-4 bg-gray-50 flex items-center justify-between rounded-xl mb-4">
                            <button
                                onClick={handleClear}
                                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                            >
                                <RotateCcw size={16} />
                                Clear
                            </button>

                            <button
                                onClick={handleBackspace}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm font-medium"
                            >
                                <Delete size={16} />
                                Delete
                            </button>

                            <button
                                onClick={() => setShowHistory(!showHistory)}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium"
                            >
                                <History size={16} />
                                {showHistory ? 'Hide' : 'Show'}
                            </button>
                        </div>

                        {/* Buttons */}
                        <div className="grid grid-cols-4 gap-2">
                            {buttons.map((button, index) => (
                                <motion.button
                                    key={index}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={button.action}
                                    className={`${button.className} rounded-lg p-5 text-xl font-semibold shadow-sm transition-all duration-150`}
                                >
                                    {button.label}
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* History Sidebar */}
                    {showHistory && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="bg-gray-50 rounded-xl p-4 max-h-[600px] flex flex-col"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                    <History size={18} />
                                    History
                                </h3>
                                {history.length > 0 && (
                                    <button
                                        onClick={clearHistory}
                                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>

                            <div className="space-y-2 overflow-y-auto flex-1">
                                <AnimatePresence>
                                    {history.length === 0 ? (
                                        <div className="text-center text-gray-400 py-12">
                                            <History size={40} className="mx-auto mb-3 opacity-50" />
                                            <p className="text-sm">No calculations yet</p>
                                        </div>
                                    ) : (
                                        history.map((item, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="p-3 bg-white rounded-lg border border-gray-200 hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer"
                                                onClick={() => {
                                                    setDisplay(item.result);
                                                    setWaitingForOperand(true);
                                                }}
                                            >
                                                <div className="text-sm text-gray-600 mb-1 font-mono">
                                                    {item.expression}
                                                </div>
                                                <div className="font-bold text-gray-900 font-mono">
                                                    = {parseFloat(item.result).toLocaleString('en-US', {
                                                    maximumFractionDigits: 10
                                                })}
                                                </div>
                                                <div className="text-xs text-gray-400 mt-1">
                                                    {item.timestamp.toLocaleTimeString()}
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CalculatorModal;