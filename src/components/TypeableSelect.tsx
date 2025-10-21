import { useEffect, useRef, useState } from 'react';
import {X} from "lucide-react";

interface SelectOption {
    value: string | number;
    label: string;
}

interface TypeableSelectProps {
    options?: SelectOption[];
    value?: string | number | null;
    onChange?: (option: SelectOption | null) => void;
    placeholder?: string;
    allowCreate?: boolean;
    className?: string;
}

export default function TypeableSelect({
                                           options = [],
                                           value = null,
                                           onChange = () => {},
                                           placeholder = 'Select or type...',
                                           allowCreate = true,
                                           className = ''
                                       }: TypeableSelectProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [highlight, setHighlight] = useState(0);
    const [selected, setSelected] = useState<SelectOption | null>(() => {
        if (value == null) return null;
        return options.find(o => o.value === value) || null;
    });

    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // keep selected in sync if parent controls `value`
        if (value == null) return;
        const opt = options.find(o => o.value === value) || null;
        setSelected(opt);
        if (opt) setQuery(opt.label);
    }, [value, options]);

    useEffect(() => {
        function onDocClick(e: MouseEvent) {
            if (!wrapperRef.current) return;
            if (!wrapperRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('click', onDocClick);
        return () => document.removeEventListener('click', onDocClick);
    }, []);

    const filtered = options.filter(o =>
        o.label.toLowerCase().includes(query.trim().toLowerCase())
    );

    const canCreate = allowCreate && query.trim() && !filtered.some(f => f.label.toLowerCase() === query.trim().toLowerCase());

    function handleSelect(option: SelectOption) {
        setSelected(option);
        setQuery(option.label);
        setOpen(false);
        onChange(option);
    }

    function handleCreate() {
        const newOption = { value: query.trim(), label: query.trim() };
        handleSelect(newOption);
    }

    function onKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setOpen(true);
            setHighlight((h) => Math.min(h + 1, (filtered.length + (canCreate ? 0 : -1))));
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
            } else if (canCreate) {
                handleCreate();
            }
        } else if (e.key === 'Escape') {
            setOpen(false);
        } else if (e.key === 'Backspace' && query === '') {
            // clear selection when Backspace on empty input
            setSelected(null);
            onChange(null);
        }
    }

    useEffect(() => {
        // reset highlight when filtered changes
        setHighlight(0);

        // Only open dropdown when there's a query
        setOpen(query.trim() !== '');
    }, [query]);

    return (
        <div ref={wrapperRef} className={` w-full max-w-sm relative z-50 ${className}`}>
            <div className="flex items-center gap-2">
                <input
                    ref={inputRef}
                    type="text"
                    className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 bg-white"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setQuery(e.target.value); }}
                    onKeyDown={onKeyDown}
                />
                {selected && (
                    <button
                        title="Clear"
                        onClick={() => { setSelected(null); setQuery(''); onChange(null); inputRef.current?.focus(); }}
                    >
                        <X size={14} className="text-red-500 cursor-pointer"/>
                    </button>
                )}
            </div>

            {open && query.trim() !== '' && (
                <ul
                    ref={listRef}
                    className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 bg-white"
                >
                    {filtered.length === 0 && !canCreate && (
                        <li className="">No results</li>
                    )}

                    {filtered.map((opt, i) => (
                        <li
                            key={opt.value + '_' + i}
                            onMouseDown={(e) => { e.preventDefault(); handleSelect(opt); }}
                            onMouseEnter={() => setHighlight(i)}
                            className={`cursor-pointer px-3 py-2 text-sm ${highlight === i ? 'bg-green-100 rounded-md' : 'hover:bg-gray-50'}`}
                        >
                            {opt.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}