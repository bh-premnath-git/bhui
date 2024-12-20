import React from "react";

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Flow Error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div 
                    style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        padding: '2rem', 
                        backgroundColor: '#f9f9f9', 
                        color: '#333',
                    }}
                >
                    <h1 style={{ marginBottom: '1rem', fontSize: '2rem', color: '#cc0000' }}>Oops...</h1>
                    <p style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>
                        Something went wrong with the Application.
                    </p>
                    <p style={{ fontSize: '0.9rem', color: '#666' }}>
                        Please try refreshing the page or come back later.
                    </p>
                </div>
            );
        }

        return this.props.children;
    }
}