import { Component, ErrorInfo, ReactNode } from 'react';

interface ReactErrorBoundaryProps {
  children: ReactNode;
}

interface ReactErrorBoundaryState {
  hasError: boolean;
}

class ReactErrorBoundary extends Component<
  ReactErrorBoundaryProps,
  ReactErrorBoundaryState
> {
  state: ReactErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ReactErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, errorInfo: ErrorInfo) {
    console.error('React 렌더링 오류:', error);
    console.error('React 컴포넌트 스택:', errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="react-error" role="alert">
          <h1>화면을 표시하지 못했습니다</h1>
          <p>자세한 오류는 개발자 콘솔에서 확인할 수 있습니다.</p>
        </main>
      );
    }

    return this.props.children;
  }
}

export default ReactErrorBoundary;
