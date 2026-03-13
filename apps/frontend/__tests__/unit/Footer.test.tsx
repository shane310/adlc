import React from 'react';
import { render, screen } from '@testing-library/react';
import { Footer } from '../../components/Footer/Footer';

describe('Footer', () => {
  it('renders the footer element', () => {
    render(<Footer />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('renders copyright text', () => {
    render(<Footer />);
    expect(screen.getByTestId('footer-copyright')).toBeInTheDocument();
  });

  it('renders social links', () => {
    render(<Footer />);
    expect(screen.getByTestId('footer-social')).toBeInTheDocument();
  });
});
