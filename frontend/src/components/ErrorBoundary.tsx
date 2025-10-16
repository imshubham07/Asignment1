import React from 'react';

type State = { hasError: boolean };

export default class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err: any) { console.error(err); }
  render() {
    if (this.state.hasError) return <div style={{ padding: 24 }}>Something went wrong.</div>;
    return this.props.children;
  }
}


