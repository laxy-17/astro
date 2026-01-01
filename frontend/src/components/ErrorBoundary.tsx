import React from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * Error Boundary component to catch React rendering errors
 * Prevents white screen of death by showing user-friendly error message
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error);
    console.error('Error info:', errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          <div
            style={{
              maxWidth: '600px',
              background: 'white',
              borderRadius: '12px',
              padding: '40px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>😞</div>
            <h1 style={{ color: '#2d3748', marginBottom: '10px' }}>
              Something went wrong
            </h1>
            <p style={{ color: '#718096', marginBottom: '20px', lineHeight: '1.6' }}>
              The application encountered an unexpected error. Please try refreshing the page.
            </p>

            {this.state.error && (
              <details
                style={{
                  marginBottom: '30px',
                  textAlign: 'left',
                  background: '#f7fafc',
                  padding: '15px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <summary
                  style={{
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    color: '#2d3748',
                    marginBottom: '10px',
                  }}
                >
                  Error details (for developers)
                </summary>
                <pre
                  style={{
                    overflow: 'auto',
                    fontSize: '12px',
                    color: '#742a2a',
                    margin: '10px 0 0 0',
                    fontFamily: 'Monaco, Courier New, monospace',
                  }}
                >
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack && (
                    <>\n\n{this.state.errorInfo.componentStack}</>
                  )}
                </pre>
              </details>
            )}

            <div
              style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <button
                onClick={this.handleReset}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                }}
                onMouseOver={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                }}
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '12px 24px',
                  background: '#f7fafc',
                  color: '#2d3748',
                  border: '2px solid #e2e8f0',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#e2e8f0';
                }}
                onMouseOut={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#f7fafc';
                }}
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
