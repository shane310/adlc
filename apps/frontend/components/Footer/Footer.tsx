import React from 'react';
import styles from '../../styles/homepage.module.scss';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerSocial} data-testid="footer-social">
          <a href="#" aria-label="微信" className={styles.socialLink}>微信</a>
          <a href="#" aria-label="微博" className={styles.socialLink}>微博</a>
          <a href="#" aria-label="邮箱" className={styles.socialLink}>邮箱</a>
        </div>
        <div className={styles.footerCopyright} data-testid="footer-copyright">
          <p>&copy; {currentYear} 公司名称 版权所有</p>
        </div>
      </div>
    </footer>
  );
};
