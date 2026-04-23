import React from 'react';
import styles from '../../styles/homepage.module.scss';

export interface BannerMediaProps {
  type: 'image' | 'video';
  src: string;
  alt: string;
}

export const BannerMedia: React.FC<BannerMediaProps> = ({ type, src, alt }) => {
  if (!src) {
    return (
      <div className={styles.bannerFallback} data-testid="banner-fallback">
        <span>{alt || '暂无内容'}</span>
      </div>
    );
  }

  if (type === 'video') {
    return (
      <video
        className={styles.bannerVideo}
        data-testid="banner-video"
        src={src}
        autoPlay
        muted
        loop
        playsInline
        aria-label={alt}
      />
    );
  }

  return (
    <img
      className={styles.bannerImage}
      src={src}
      alt={alt}
      loading="lazy"
    />
  );
};
