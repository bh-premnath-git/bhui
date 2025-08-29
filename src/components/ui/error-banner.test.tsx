import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBanner } from './error-banner';

describe('ErrorBanner', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('renders with title and description', () => {
    const title = 'Test Error';
    const description = 'This is a test error message';
    
    render(
      <ErrorBanner
        title={title}
        description={description}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <ErrorBanner
        title="Test Error"
        description="Test description"
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('shows expand/collapse for long messages', () => {
    const longDescription = 'A'.repeat(250); // Long message
    
    render(
      <ErrorBanner
        title="Test Error"
        description={longDescription}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/More/)).toBeInTheDocument();
  });

  it('shows copy button and copies text on click', async () => {
    const description = 'Test error message';
    
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(void 0),
      },
    });

    render(
      <ErrorBanner
        title="Test Error"
        description={description}
        onClose={mockOnClose}
      />
    );

    const copyButton = screen.getByText(/Copy/);
    fireEvent.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(description);
  });
});