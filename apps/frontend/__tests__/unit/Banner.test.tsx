import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Banner } from '../../components/Banner/Banner';
import { BannerMedia } from '../../components/Banner/BannerMedia';

const imageItems = [
  { type: 'image' as const, src: '/img/banner1.jpg', alt: 'Banner 1' },
  { type: 'image' as const, src: '/img/banner2.jpg', alt: 'Banner 2' },
];

const videoItems = [
  { type: 'video' as const, src: '/video/banner.mp4', alt: 'Video Banner' },
];

const mixedItems = [
  { type: 'image' as const, src: '/img/banner1.jpg', alt: 'Image Banner' },
  { type: 'video' as const, src: '/video/banner.mp4', alt: 'Video Banner' },
];

describe('BannerMedia', () => {
  it('renders an image when type is "image"', () => {
    render(<BannerMedia type="image" src="/img/test.jpg" alt="Test Image" />);
    const img = screen.getByRole('img', { name: 'Test Image' });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/img/test.jpg');
  });

  it('renders a video when type is "video"', () => {
    render(<BannerMedia type="video" src="/video/test.mp4" alt="Test Video" />);
    const video = screen.getByTestId('banner-video');
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute('src', '/video/test.mp4');
  });

  it('video is muted and autoplays', () => {
    render(<BannerMedia type="video" src="/video/test.mp4" alt="Test Video" />);
    const video = screen.getByTestId('banner-video') as HTMLVideoElement;
    expect(video.muted).toBe(true);
    expect(video.autoplay).toBe(true);
  });

  it('image uses lazy loading', () => {
    render(<BannerMedia type="image" src="/img/test.jpg" alt="Test Image" />);
    const img = screen.getByRole('img', { name: 'Test Image' });
    expect(img).toHaveAttribute('loading', 'lazy');
  });

  it('renders fallback when src is empty', () => {
    render(<BannerMedia type="image" src="" alt="Missing" />);
    const fallback = screen.getByTestId('banner-fallback');
    expect(fallback).toBeInTheDocument();
  });
});

describe('Banner', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders the banner section', () => {
    render(<Banner items={imageItems} />);
    expect(screen.getByTestId('banner')).toBeInTheDocument();
  });

  it('renders the first item initially', () => {
    render(<Banner items={imageItems} />);
    const img = screen.getByRole('img', { name: 'Banner 1' });
    expect(img).toBeInTheDocument();
  });

  it('renders video item correctly', () => {
    render(<Banner items={videoItems} />);
    const video = screen.getByTestId('banner-video');
    expect(video).toBeInTheDocument();
  });

  it('supports mixed image and video items', () => {
    render(<Banner items={mixedItems} />);
    expect(screen.getByRole('img', { name: 'Image Banner' })).toBeInTheDocument();
  });

  it('auto-advances to next item', () => {
    render(<Banner items={imageItems} interval={3000} />);
    expect(screen.getByRole('img', { name: 'Banner 1' })).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(screen.getByRole('img', { name: 'Banner 2' })).toBeInTheDocument();
  });

  it('loops back to first item after last', () => {
    render(<Banner items={imageItems} interval={3000} />);

    act(() => {
      jest.advanceTimersByTime(6000);
    });

    expect(screen.getByRole('img', { name: 'Banner 1' })).toBeInTheDocument();
  });

  it('renders navigation dots for multiple items', () => {
    render(<Banner items={imageItems} />);
    const dots = screen.getAllByTestId('banner-dot');
    expect(dots).toHaveLength(2);
  });

  it('renders gracefully with empty items', () => {
    render(<Banner items={[]} />);
    const fallback = screen.getByTestId('banner-fallback');
    expect(fallback).toBeInTheDocument();
  });
});
