import { useMemo, useState } from 'react';
import { useAppSelector } from '../hooks';

export default function Sidebar() {
  const hobbies = useAppSelector(s => s.users.hobbies);
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => hobbies.filter(h => h.toLowerCase().includes(query.toLowerCase())), [hobbies, query]);

  return (
    <div style={{ width: 240, borderRight: '1px solid #eee', padding: 12 }}>
      <h3>Hobbies</h3>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search hobbies"
        style={{ width: '100%', marginBottom: 8 }}
      />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {filtered.map(h => (
          <div key={h}
               draggable
               onDragStart={(e) => { e.dataTransfer.setData('text/plain', h); }}
               style={{ padding: '4px 8px', background: '#f5f5f5', borderRadius: 6, cursor: 'grab' }}>
            {h}
          </div>
        ))}
      </div>
    </div>
  );
}


