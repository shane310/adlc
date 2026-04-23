import React from 'react';
import { render, screen } from '@testing-library/react';
import { CompanyIntro } from '../../components/CompanyIntro/CompanyIntro';

describe('CompanyIntro', () => {
  it('renders the company intro section', () => {
    render(<CompanyIntro />);
    expect(screen.getByTestId('company-intro')).toBeInTheDocument();
  });

  it('renders company description text', () => {
    render(<CompanyIntro />);
    expect(screen.getByTestId('company-intro-text')).toBeInTheDocument();
  });

  it('renders company image', () => {
    render(<CompanyIntro />);
    expect(screen.getByTestId('company-intro-image')).toBeInTheDocument();
  });
});
