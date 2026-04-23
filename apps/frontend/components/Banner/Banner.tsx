import React, { useState, useEffect, useCallback } from 'react';
import { BannerMedia, BannerMediaProps } from './BannerMedia';
import styles from '../../styles/homepage.module.scss';

export interface BannerItem {
  type: 'image' | 'video';
  src: string;
  alt: string;
}

export interface BannerProps {
  items: BannerItem[];
  interval?: number;
}

export const Banner: React.FC<BannerProps> = ({ items, interval = 5000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const advance = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(advance, interval);
    return () => clearInterval(timer);
  }, [advance, interval, items.length]);

  if (!items.length) {
    return (
      <section className={styles.banner} data-testid="banner">
        <div className={styles.bannerFallback} data-testid="banner-fallback">
          <span>暂无内容</span>
        </div>
      </section>
    );
  }

  const currentItem = items[currentIndex];

  return (
    <section className={styles.banner} data-testid="banner">
      <BannerMedia
        type={currentItem.type}
        src={currentItem.src}
        alt={currentItem.alt}
      />
      {items.length > 1 && (
        <div className={styles.bannerDots}>
          {items.map((_, index) => (
            <button
              key={index}
              className={`${styles.bannerDot} ${index === currentIndex ? styles.bannerDotActive : ''}`}
              data-testid="banner-dot"
              onClick={() => setCurrentIndex(index)}
              aria-label={`切换到第${index + 1}张`}
            />
          ))}
        </div>
      )}
    </section>
  );
};
