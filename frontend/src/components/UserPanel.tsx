import { useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { createUser, deleteUser, fetchGraph, unlinkUsers, updateUser, linkUsers } from '../state/usersSlice';
import toast from 'react-hot-toast';

export default function UserPanel() {
  const dispatch = useAppDispatch();
  const users = useAppSelector(s => s.users.nodes);
  const [form, setForm] = useState({ username: '', age: 18, hobbies: '' });
  const [selected, setSelected] = useState<string | undefined>();
  const [connectTo, setConnectTo] = useState<string>('');

  const selectedUser = useMemo(() => users.find(u => u.id === selected), [users, selected]);
  const connectOptions = useMemo(() => users.filter(u => u.id !== selected), [users, selected]);

  async function handleCreate() {
    try {
      const hobbies = form.hobbies.split(',').map(s => s.trim()).filter(Boolean);
      await dispatch(createUser({ username: form.username, age: Number(form.age), hobbies })).unwrap();
      toast.success('User created');
      setForm({ username: '', age: 18, hobbies: '' });
      dispatch(fetchGraph());
    } catch (e: any) { toast.error(e?.message || 'Create failed'); }
  }

  async function handleUpdate() {
    if (!selectedUser) return;
    try {
      const hobbies = form.hobbies.split(',').map(s => s.trim()).filter(Boolean);
      await dispatch(updateUser({ id: selectedUser.id, changes: { username: form.username, age: Number(form.age), hobbies } })).unwrap();
      toast.success('User updated');
      dispatch(fetchGraph());
    } catch (e: any) { toast.error(e?.message || 'Update failed'); }
  }

  async function handleDelete() {
    if (!selectedUser) return;
    if (selectedUser.friends.length > 0) {
      toast.error('Unlink all friends before deleting this user.');
      return;
    }
    if (!confirm('Delete this user?')) return;
    try {
      await dispatch(deleteUser(selectedUser.id)).unwrap();
      toast.success('User deleted');
      setSelected(undefined);
      dispatch(fetchGraph());
    } catch (e: any) { toast.error(e?.message || 'Delete failed'); }
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    if (!selectedUser) return;
    const hobby = e.dataTransfer.getData('text/plain');
    const hobbies = Array.from(new Set([...selectedUser.hobbies, hobby]));
    try {
      await dispatch(updateUser({ id: selectedUser.id, changes: { hobbies } })).unwrap();
      toast.success(`Added hobby ${hobby}`);
      dispatch(fetchGraph());
    } catch (e: any) { toast.error(e?.message || 'Failed to add hobby'); }
  }

  async function handleConnect() {
    if (!selectedUser || !connectTo) return;
    try {
      await dispatch(linkUsers({ aId: selectedUser.id, bId: connectTo })).unwrap();
      toast.success('Users connected');
      setConnectTo('');
      dispatch(fetchGraph());
    } catch (e: any) {
      toast.error(e?.message || 'Connect failed');
    }
  }

  return (
    <div style={{ width: 320, borderLeft: '1px solid #eee', padding: 12 }} onDragOver={e => e.preventDefault()} onDrop={handleDrop}>
      <h3>User Panel</h3>
      <select value={selected || ''} onChange={e => {
        const id = e.target.value || undefined; setSelected(id);
        const u = users.find(x => x.id === id);
        if (u) setForm({ username: u.username, age: u.age, hobbies: u.hobbies.join(', ') });
      }} style={{ width: '100%', marginBottom: 8 }}>
        <option value="">Select user</option>
        {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
      </select>

      <input placeholder="Username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} style={{ width: '100%', marginBottom: 6 }} />
      <input placeholder="Age" type="number" value={form.age} onChange={e => setForm({ ...form, age: Number(e.target.value) })} style={{ width: '100%', marginBottom: 6 }} />
      <input placeholder="hobby1, hobby2" value={form.hobbies} onChange={e => setForm({ ...form, hobbies: e.target.value })} style={{ width: '100%', marginBottom: 6 }} />

      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <button onClick={handleCreate}>Create</button>
        <button onClick={handleUpdate} disabled={!selectedUser}>Save</button>
        <button onClick={handleDelete} disabled={!selectedUser}>Delete</button>
      </div>

      <div style={{ borderTop: '1px solid #eee', paddingTop: 10, marginTop: 10 }}>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>Connect users</div>
        <div style={{ display: 'flex', gap: 6 }}>
          <select value={connectTo} onChange={e => setConnectTo(e.target.value)} style={{ flex: 1 }} disabled={!selectedUser}>
            <option value="">Select user to connect</option>
            {connectOptions.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
          </select>
          <button onClick={handleConnect} disabled={!selectedUser || !connectTo}>Connect</button>
        </div>
        <div style={{ fontSize: 12, color: '#666', marginTop: 6 }}>
          Tip: You can also connect by dragging from one node to another in the graph.
        </div>
      </div>

      {selectedUser && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 600 }}>Friends</div>
          <ul>
            {selectedUser.friends.map(fid => (
              <li key={fid} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <span>{users.find(u => u.id === fid)?.username || fid}</span>
                <button onClick={() => dispatch(unlinkUsers({ aId: selectedUser.id, bId: fid })).then(() => dispatch(fetchGraph()))}>Unlink</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}


