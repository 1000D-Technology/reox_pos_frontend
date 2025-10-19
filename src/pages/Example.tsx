import { useState } from 'react';
import TypeableSelect from '../components/TypeableSelect.jsx';


export default function Example() {
    const options = [
        { value: 'apple', label: 'Apple' },
        { value: 'banana', label: 'Banana' },
        { value: 'orange', label: 'Orange' },
    ];
    type SelectOption = {
        value: string;
        label: string;
    };
    const [selected, setSelected] = useState<SelectOption | null>(null);


    return (
        <div className="p-8">
            <TypeableSelect
                options={options}
                value={selected?.value || null}
                onChange={(opt) => opt ? setSelected({ value: String(opt.value), label: opt.label }) : setSelected(null)}
                placeholder="Search fruits..."
                allowCreate={true}
            />
        </div>
    );
}
