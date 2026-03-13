import React from 'react';
import styles from '../../styles/homepage.module.scss';

export interface CompanyIntroProps {
  title?: string;
  description?: string;
  imageUrl?: string;
  imageAlt?: string;
}

const DEFAULT_TITLE = '关于我们';
const DEFAULT_DESCRIPTION =
  '我们是一家专注于数字化解决方案的科技公司，致力于为客户提供高品质的产品与服务。';
const DEFAULT_IMAGE = '/images/company.jpg';

export const CompanyIntro: React.FC<CompanyIntroProps> = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  imageUrl = DEFAULT_IMAGE,
  imageAlt = '公司介绍',
}) => {
  return (
    <section className={styles.companyIntro} data-testid="company-intro">
      <div className={styles.companyIntroContent}>
        <div className={styles.companyIntroText} data-testid="company-intro-text">
          <h2 className={styles.sectionTitle}>{title}</h2>
          <p>{description}</p>
        </div>
        <div className={styles.companyIntroImageWrap} data-testid="company-intro-image">
          <img
            src={imageUrl}
            alt={imageAlt}
            loading="lazy"
            className={styles.companyIntroImg}
          />
        </div>
      </div>
    </section>
  );
};
