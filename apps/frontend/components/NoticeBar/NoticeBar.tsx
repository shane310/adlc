import React, { useState, useEffect } from 'react';
import styles from '../../styles/homepage.module.scss';

export interface NoticeItem {
  id: string;
  text: string;
}

export interface NoticeBarProps {
  notices: NoticeItem[];
  speed?: number;
}

export const NoticeBar: React.FC<NoticeBarProps> = ({ notices, speed = 4000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (notices.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % notices.length);
    }, speed);
    return () => clearInterval(timer);
  }, [notices.length, speed]);

  if (!notices.length) return null;

  return (
    <div className={styles.noticeBar} data-testid="notice-bar">
      <span className={styles.noticeBarIcon}>📢</span>
      <span className={styles.noticeBarText}>{notices[currentIndex].text}</span>
    </div>
  );
};
