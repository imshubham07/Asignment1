import { Handle, Position, NodeProps } from 'reactflow';
import { useAppDispatch } from '../hooks';
import { fetchGraph, updateUser } from '../state/usersSlice';

export function HighScoreNode({ data }: NodeProps) {
  const dispatch = useAppDispatch();
  const score = data.user.popularityScore as number;
  const size = 40 + Math.min(40, score * 5);
  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const hobby = e.dataTransfer.getData('text/plain');
    const user = data.user as any;
    const hobbies = Array.from(new Set([...(user.hobbies as string[]), hobby]));
    dispatch(updateUser({ id: user.id, changes: { hobbies } })).then(() => dispatch(fetchGraph()));
  }
  return (
    <div style={{
      background: `rgba(0, 150, 255, 0.8)`,
      color: '#fff',
      padding: 8,
      borderRadius: 12,
      width: size + 40,
      transition: 'all 300ms ease'
    }} onDragOver={e => e.preventDefault()} onDrop={onDrop}>
      <div style={{ fontWeight: 700 }}>{data.label}</div>
      <div style={{ fontSize: 12 }}>Score: {score.toFixed(1)}</div>
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
    </div>
  );
}

export function LowScoreNode({ data }: NodeProps) {
  const dispatch = useAppDispatch();
  const score = data.user.popularityScore as number;
  const size = 20 + Math.min(20, score * 3);
  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const hobby = e.dataTransfer.getData('text/plain');
    const user = data.user as any;
    const hobbies = Array.from(new Set([...(user.hobbies as string[]), hobby]));
    dispatch(updateUser({ id: user.id, changes: { hobbies } })).then(() => dispatch(fetchGraph()));
  }
  return (
    <div style={{
      background: `rgba(150, 150, 150, 0.8)`,
      color: '#000',
      padding: 8,
      borderRadius: 8,
      width: size + 40,
      transition: 'all 300ms ease'
    }} onDragOver={e => e.preventDefault()} onDrop={onDrop}>
      <div style={{ fontWeight: 600 }}>{data.label}</div>
      <div style={{ fontSize: 12 }}>Score: {score.toFixed(1)}</div>
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
    </div>
  );
}


