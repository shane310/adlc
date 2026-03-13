import React from 'react';
import styles from '../../styles/homepage.module.scss';

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface ServicesProductsProps {
  services: ServiceItem[];
}

export const ServicesProducts: React.FC<ServicesProductsProps> = ({ services }) => {
  return (
    <section className={styles.servicesProducts} data-testid="services-products">
      <h2 className={styles.sectionTitle}>服务与产品</h2>
      <div className={styles.servicesGrid}>
        {services.map((service) => (
          <div
            key={service.id}
            className={styles.serviceCard}
            data-testid="service-card"
          >
            <span className={styles.serviceIcon}>{service.icon}</span>
            <h3 className={styles.serviceTitle}>{service.title}</h3>
            <p className={styles.serviceDescription}>{service.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
