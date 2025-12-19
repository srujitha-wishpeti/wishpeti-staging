// components/AddItemButton.jsx
import { Plus } from 'lucide-react';

export default function AddItemButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1.5rem',
        backgroundColor: '#4f46e5',
        color: 'white',
        fontWeight: '600',
        borderRadius: '0.75rem',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s',
        boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = '#4338ca';
        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = '#4f46e5';
        e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0,0,0,0.05)';
      }}
    >
      <Plus size={20} />
      Add Item
    </button>
  );
}