import React from 'react';
import { render, screen } from '@testing-library/react';
import { ServicesProducts } from '../../components/ServicesProducts/ServicesProducts';

const services = [
  { id: '1', title: '服务一', description: '服务描述一', icon: '🔧' },
  { id: '2', title: '服务二', description: '服务描述二', icon: '📦' },
  { id: '3', title: '服务三', description: '服务描述三', icon: '🚀' },
];

describe('ServicesProducts', () => {
  it('renders the services section', () => {
    render(<ServicesProducts services={services} />);
    expect(screen.getByTestId('services-products')).toBeInTheDocument();
  });

  it('renders all service cards', () => {
    render(<ServicesProducts services={services} />);
    const cards = screen.getAllByTestId('service-card');
    expect(cards).toHaveLength(3);
  });

  it('renders service titles', () => {
    render(<ServicesProducts services={services} />);
    expect(screen.getByText('服务一')).toBeInTheDocument();
    expect(screen.getByText('服务二')).toBeInTheDocument();
  });

  it('renders empty state when no services', () => {
    render(<ServicesProducts services={[]} />);
    expect(screen.queryAllByTestId('service-card')).toHaveLength(0);
  });
});
