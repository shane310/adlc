import React from 'react';
import Head from 'next/head';
import { Header } from '../components/Header/Header';
import { Banner, BannerItem } from '../components/Banner/Banner';
import { NoticeBar, NoticeItem } from '../components/NoticeBar/NoticeBar';
import { CompanyIntro } from '../components/CompanyIntro/CompanyIntro';
import { ServicesProducts, ServiceItem } from '../components/ServicesProducts/ServicesProducts';
import { Footer } from '../components/Footer/Footer';
import { FirstVisitOverlay } from '../components/FirstVisitOverlay/FirstVisitOverlay';
import { useFirstVisit } from '../hooks/useFirstVisit';
import { generateSeoMeta } from '../utils/seo';
import styles from '../styles/homepage.module.scss';

const bannerItems: BannerItem[] = [
  { type: 'image', src: '/images/banner1.jpg', alt: '轮播图1' },
  { type: 'image', src: '/images/banner2.jpg', alt: '轮播图2' },
  { type: 'video', src: '/videos/banner.mp4', alt: '宣传视频' },
];

const noticeItems: NoticeItem[] = [
  { id: '1', text: '欢迎访问公司官网，了解最新资讯！' },
  { id: '2', text: '新产品即将发布，敬请期待。' },
];

const serviceItems: ServiceItem[] = [
  { id: '1', title: '数字化咨询', description: '为企业提供全方位的数字化转型方案。', icon: '💡' },
  { id: '2', title: '软件开发', description: '定制化软件开发与系统集成服务。', icon: '🖥️' },
  { id: '3', title: '云服务', description: '安全可靠的云计算与数据管理服务。', icon: '☁️' },
];

export default function HomePage() {
  const { isFirstVisit, markVisited } = useFirstVisit();
  const seo = generateSeoMeta();

  return (
    <>
      <Head>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <meta property="og:title" content={seo.openGraph.title} />
        <meta property="og:description" content={seo.openGraph.description} />
        <meta property="og:type" content={seo.openGraph.type} />
        <meta property="og:locale" content={seo.openGraph.locale} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className={styles.homepageMain}>
        <Header />
        <main className={styles.homepageContent}>
          <Banner items={bannerItems} />
          <NoticeBar notices={noticeItems} />
          <section>
            <CompanyIntro />
          </section>
          <section>
            <ServicesProducts services={serviceItems} />
          </section>
        </main>
        <Footer />
      </div>

      <FirstVisitOverlay visible={isFirstVisit} onClose={markVisited} />
    </>
  );
}
