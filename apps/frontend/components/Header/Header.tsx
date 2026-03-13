import React, { useState } from 'react';
import styles from '../../styles/homepage.module.scss';

const NAV_ITEMS = [
  { label: '首页', href: '/' },
  { label: '关于我们', href: '/about' },
  { label: '产品服务', href: '/services' },
  { label: '联系我们', href: '/contact' },
];

export const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <div className={styles.headerLogo} data-testid="header-logo">
          <a href="/">Logo</a>
        </div>
        <button
          className={styles.menuToggle}
          data-testid="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? '关闭菜单' : '打开菜单'}
          aria-expanded={menuOpen}
        >
          <span className={styles.menuToggleBar} />
          <span className={styles.menuToggleBar} />
          <span className={styles.menuToggleBar} />
        </button>
        <nav
          className={`${styles.headerNav} ${menuOpen ? styles.headerNavOpen : ''}`}
          aria-label="主导航"
        >
          <ul className={styles.navList}>
            {NAV_ITEMS.map((item) => (
              <li key={item.href} className={styles.navItem}>
                <a href={item.href} className={styles.navLink}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};
