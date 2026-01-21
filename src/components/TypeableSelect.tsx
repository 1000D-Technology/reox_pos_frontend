import { useEffect, useRef, useState } from 'react';
import { X } from "lucide-react";

interface SelectOption {
    value: string | number;
    label: string;
}

interface TypeableSelectProps {
    options?: SelectOption[];
    value?: string | number | null;
    onChange?: (option: SelectOption | null) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

export default function TypeableSelect({
                                           options = [],
                                           value = null,
                                           onChange = () => {},
                                           placeholder = 'Select or type...',
                                           className = "",
                                           disabled = false
                                       }: TypeableSelectProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [highlight, setHighlight] = useState(0);
    const [selected, setSelected] = useState<SelectOption | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const dropdownId = useRef(`typeable-select-${Math.random().toString(36).substr(2, 9)}`);

    // Sync with external value changes
    useEffect(() => {
        if (value == null) {
            setSelected(null);
            setQuery('');
            return;
        }
        const opt = options.find(o => o.value === value);
        if (opt) {
            setSelected(opt);
            setQuery(opt.label);
        }
    }, [value, options]);

    // Handle clicks outside
    useEffect(() => {
        function onDocClick(e: MouseEvent) {
            if (!wrapperRef.current) return;
            if (!wrapperRef.current.contains(e.target as Node)) {
                setOpen(false);
                // Restore selected value when clicking outside
                if (selected) {
                    setQuery(selected.label);
                }
            }
        }
        document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, [selected]);

    const filtered = options.filter(o => {
        // If query matches the selected label exactly (case-insensitive), show all options
        if (selected && query.toLowerCase() === selected.label.toLowerCase()) {
            return true;
        }
        return o && o.label && o.label.toLowerCase().includes(query.trim().toLowerCase());
    });

    function handleSelect(option: SelectOption) {
        setSelected(option);
        setQuery(option.label);
        setOpen(false);
        onChange(option);
    }

    function handleClear(e?: React.SyntheticEvent | React.MouseEvent | React.KeyboardEvent) {
       if (e) e.preventDefault();
        setSelected(null);
        setQuery('');
        onChange(null);
        inputRef.current?.focus();
    }

    function onKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setOpen(true);
            const maxIndex = filtered.length - 1;
            setHighlight((h) => Math.min(h + 1, maxIndex));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlight((h) => Math.max(h - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (!open) {
                setOpen(query.trim() !== '');
                return;
            }
            if (filtered.length > 0 && highlight < filtered.length) {
                handleSelect(filtered[highlight]);
            }
        } else if (e.key === 'Escape') {
            e.preventDefault();
            setOpen(false);
            // Restore selected value on escape
            if (selected) {
                setQuery(selected.label);
            }
        } else if (e.key === 'Tab') {
            setOpen(false);
            // Restore selected value on tab
            if (selected) {
                setQuery(selected.label);
            }
        } else if (e.key === 'Backspace' && query === '' && selected) {
            handleClear();
        }
    }

    function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        const newQuery = e.target.value;
        setQuery(newQuery);
        setOpen(true);
        setHighlight(0);
    }

    function onInputFocus() {
            setOpen(true);
    }

    // Auto-scroll highlighted item into view
    useEffect(() => {
        if (open && listRef.current) {
            const highlightedElement = listRef.current.children[highlight] as HTMLElement;
            if (highlightedElement) {
                highlightedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        }
    }, [highlight, open]);

    return (
        <div ref={wrapperRef} className={`relative w-full ${className}`}>
            <div className="flex items-center gap-2">
                <input
                    ref={inputRef}
                    type="text"
                    className={`w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-400 focus:outline-none transition-all ${
                        disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'bg-white'
                    }`}
                    placeholder={placeholder}
                    value={query}
                    onChange={onInputChange}
                    onKeyDown={onKeyDown}
                    onFocus={onInputFocus}
                    disabled={disabled}
                    autoComplete="off"
                    aria-autocomplete="list"
                    aria-controls={dropdownId.current}
                    aria-expanded={open}
                />
                {selected && !disabled && (
                    <button
                        type="button"
                        title="Clear selection"
                        onClick={handleClear}
                        className="flex-shrink-0 hover:bg-red-50 rounded-full p-1 transition-colors"
                    >
                        <X size={16} className="text-red-500"/>
                    </button>
                )}
            </div>

            {open && (
                <ul
                    ref={listRef}
                    id={dropdownId.current}
                    className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto text-sm rounded-lg border-2 border-gray-200 bg-white shadow-lg"
                    role="listbox"
                >
                    {filtered.length === 0 && (
                        <li className="px-3 py-2 text-gray-500 text-center">No results found</li>
                    )}

                    {filtered.map((opt, i) => (
                        <li
                            key={`${opt.value}_${i}`}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                handleSelect(opt);
                            }}
                            onMouseEnter={() => setHighlight(i)}
                            className={`cursor-pointer px-3 py-2 text-sm transition-colors ${
                                highlight === i
                                    ? 'bg-emerald-50 text-emerald-700 font-medium'
                                    : 'hover:bg-gray-50'
                            }`}
                            role="option"
                            aria-selected={highlight === i}
                        >
                            {opt.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}