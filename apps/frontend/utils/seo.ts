export interface SeoMeta {
  title: string;
  description: string;
  openGraph: {
    title: string;
    description: string;
    type: string;
    locale: string;
  };
}

const DEFAULT_TITLE = '公司官网 - 首页';
const DEFAULT_DESCRIPTION = '欢迎访问公司官网，了解我们的产品与服务。';

export function generateSeoMeta(
  title?: string,
  description?: string
): SeoMeta {
  const resolvedTitle = title || DEFAULT_TITLE;
  const resolvedDescription = description || DEFAULT_DESCRIPTION;

  return {
    title: resolvedTitle,
    description: resolvedDescription,
    openGraph: {
      title: resolvedTitle,
      description: resolvedDescription,
      type: 'website',
      locale: 'zh_CN',
    },
  };
}
