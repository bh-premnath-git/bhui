import React, { useState, useRef, useEffect } from 'react';

interface Option {
  value: string;
  label: string;
  logo?: string;
}

interface SearchableDropdownProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({ options, value, onChange, placeholder }) => {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const filtered = options.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const selected = options.find(opt => opt.value === value);

  return (
    <div className="relative" ref={rootRef}>
      <div
        className="w-full border rounded p-2 flex items-center cursor-pointer bg-white"
        onClick={() => setOpen(o => !o)}
        tabIndex={0}
      >
        {selected?.logo && <span className="mr-2">{selected.logo}</span>}
        <span className={selected ? '' : 'text-gray-400'}>
          {selected ? selected.label : placeholder || 'Select...'}
        </span>
        <span className="ml-auto text-gray-400">▼</span>
      </div>
      {open && (
        <div className="absolute z-10 w-full bg-white border rounded shadow mt-1 max-h-48 overflow-auto">
          <input
            className="w-full p-2 border-b outline-none"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
          {filtered.length === 0 ? (
            <div className="p-2 text-gray-400">No options</div>
          ) : (
            filtered.map(opt => (
              <div
                key={opt.value}
                className={`p-2 flex items-center cursor-pointer hover:bg-gray-100 ${opt.value === value ? 'bg-gray-100' : ''}`}
                onClick={() => { onChange(opt.value); setOpen(false); setSearch(''); }}
              >
                {opt.logo && <span className="mr-2">{opt.logo}</span>}
                {opt.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;