import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from '../../components/Header/Header';

describe('Header', () => {
  it('renders the header element', () => {
    render(<Header />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('renders the logo', () => {
    render(<Header />);
    expect(screen.getByTestId('header-logo')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<Header />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('renders mobile menu toggle button', () => {
    render(<Header />);
    expect(screen.getByTestId('menu-toggle')).toBeInTheDocument();
  });
});
