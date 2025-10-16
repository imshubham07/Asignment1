import { useEffect, useMemo, useCallback } from 'react';
import ReactFlow, { Background, Controls, Node, Edge, Connection, addEdge, useNodesState, useEdgesState } from 'reactflow';
import 'reactflow/dist/style.css';
import { useAppDispatch, useAppSelector } from '../hooks';
import { fetchGraph, linkUsers } from '../state/usersSlice';
import { HighScoreNode, LowScoreNode } from './Nodes';

export default function GraphView() {
  const dispatch = useAppDispatch();
  const { nodes: users, edges: rels, loading, error } = useAppSelector(s => s.users);

  useEffect(() => { dispatch(fetchGraph()); }, [dispatch]);

  const rfNodes = useMemo<Node[]>(() => users.map(u => ({
    id: u.id,
    type: u.popularityScore > 5 ? 'high' : 'low',
    data: { label: `${u.username} (${u.age})`, user: u },
    position: { x: Math.random() * 600, y: Math.random() * 400 },
  })), [users]);

  const rfEdges = useMemo<Edge[]>(() => rels.map(e => ({ id: e.id, source: e.source, target: e.target })), [rels]);

  const nodeTypes = useMemo(() => ({ high: HighScoreNode, low: LowScoreNode }), []);

  const [nodes, setNodes, onNodesChange] = useNodesState(rfNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(rfEdges);

  useEffect(() => { setNodes(rfNodes); }, [rfNodes, setNodes]);
  useEffect(() => { setEdges(rfEdges); }, [rfEdges, setEdges]);

  const onConnect = useCallback((connection: Connection) => {
    if (!connection.source || !connection.target) return;
    // Optimistically add the edge locally for instant feedback
    setEdges(prev => {
      const exists = prev.some(e => (e.source === connection.source && e.target === connection.target) || (e.source === connection.target && e.target === connection.source));
      if (exists) return prev;
      const tempId = `temp-${Date.now()}`;
      //@ts-ignore
      return addEdge({ id: tempId, source: connection.source, target: connection.target }, prev);
    });
    // Persist on server, then refresh graph to reconcile
    dispatch(linkUsers({ aId: connection.source, bId: connection.target }))
      .then(() => dispatch(fetchGraph()));
  }, [dispatch, setEdges]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {!!error && (
        <div style={{
          position: 'absolute',
          top: 10,
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#ffe1e1',
          color: '#a40000',
          padding: '8px 12px',
          borderRadius: 8,
          zIndex: 10,
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
        }}>
          {error}
        </div>
      )}
      <div style={{ position: 'absolute', top: 10, right: 10, background: '#fff', border: '1px solid #eee', borderRadius: 8, padding: '6px 10px', fontSize: 12, color: '#555', zIndex: 10 }}>
        - Drag from one node handle to another to connect
        <br />- Select a user (right panel) to manage and unlink friends
        <br />- Drag a hobby chip onto a node to add it
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
        {loading && <div style={{ position: 'absolute', top: 10, left: 10, background: '#fff' }}>Loading...</div>}
        {!loading && users.length === 0 && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#ffffff',
            border: '1px solid #eee',
            borderRadius: 12,
            padding: 16,
            color: '#666'
          }}>
            No users yet. Use the panel on the right to create one.
          </div>
        )}
      </ReactFlow>
    </div>
  );
}


