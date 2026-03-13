import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FirstVisitOverlay } from '../../components/FirstVisitOverlay/FirstVisitOverlay';

describe('FirstVisitOverlay', () => {
  it('renders the overlay when visible', () => {
    render(<FirstVisitOverlay visible={true} onClose={jest.fn()} />);
    expect(screen.getByTestId('first-visit-overlay')).toBeInTheDocument();
  });

  it('does not render when not visible', () => {
    render(<FirstVisitOverlay visible={false} onClose={jest.fn()} />);
    expect(screen.queryByTestId('first-visit-overlay')).toBeNull();
  });

  it('calls onClose when clicked', async () => {
    const onClose = jest.fn();
    render(<FirstVisitOverlay visible={true} onClose={onClose} />);

    const overlay = screen.getByTestId('first-visit-overlay');
    await userEvent.click(overlay);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders enter button', () => {
    render(<FirstVisitOverlay visible={true} onClose={jest.fn()} />);
    expect(screen.getByRole('button', { name: /进入/i })).toBeInTheDocument();
  });
});
