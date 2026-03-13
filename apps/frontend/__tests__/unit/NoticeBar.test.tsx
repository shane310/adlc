import React from 'react';
import { render, screen } from '@testing-library/react';
import { NoticeBar } from '../../components/NoticeBar/NoticeBar';

const notices = [
  { id: '1', text: '公告内容一' },
  { id: '2', text: '公告内容二' },
];

describe('NoticeBar', () => {
  it('renders the notice bar section', () => {
    render(<NoticeBar notices={notices} />);
    expect(screen.getByTestId('notice-bar')).toBeInTheDocument();
  });

  it('renders notice text', () => {
    render(<NoticeBar notices={notices} />);
    expect(screen.getByText('公告内容一')).toBeInTheDocument();
  });

  it('renders nothing when notices are empty', () => {
    const { container } = render(<NoticeBar notices={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
