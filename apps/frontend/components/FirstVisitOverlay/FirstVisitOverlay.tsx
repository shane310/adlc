import React from 'react';
import styles from '../../styles/homepage.module.scss';

export interface FirstVisitOverlayProps {
  visible: boolean;
  onClose: () => void;
  imageUrl?: string;
}

export const FirstVisitOverlay: React.FC<FirstVisitOverlayProps> = ({
  visible,
  onClose,
  imageUrl = '/images/first-visit.jpg',
}) => {
  if (!visible) return null;

  return (
    <div
      className={styles.firstVisitOverlay}
      data-testid="first-visit-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="首次访问引导"
    >
      <div
        className={styles.firstVisitContent}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt="欢迎访问"
          className={styles.firstVisitImage}
        />
        <button
          className={styles.firstVisitButton}
          onClick={onClose}
        >
          进入网站
        </button>
      </div>
    </div>
  );
};
