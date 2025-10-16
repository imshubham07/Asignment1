import { Toaster } from 'react-hot-toast';
import GraphView from './components/GraphView';
import Sidebar from './components/Sidebar';
import UserPanel from './components/UserPanel';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <div style={{ display: 'flex', height: '100vh' }}>
        <Sidebar />
        <div style={{ flex: 1, position: 'relative' }}>
          <GraphView />
        </div>
        <UserPanel />
      </div>
      <Toaster />
    </ErrorBoundary>
  );
}


