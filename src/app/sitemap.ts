import { MetadataRoute } from 'next';
import { getServices, getProjects } from '@/lib/data/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://speederspider.com';
  const services = await getServices();
  const projects = await getProjects();
  const now = new Date();

  const staticPages = ['', '/about', '/services', '/our-work', '/contact', '/privacy-policy', '/terms'];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Static pages in both en and ar
  ['en', 'ar'].forEach((lang) => {
    staticPages.forEach((path) => {
      sitemapEntries.push({
        url: `${siteUrl}/${lang}${path}`,
        lastModified: now,
        changeFrequency: path === '' ? 'daily' : 'weekly',
        priority: path === '' ? 1.0 : path === '/services' || path === '/contact' ? 0.9 : 0.7,
      });
    });
  });

  // Services dynamic detail pages
  services.forEach((service) => {
    sitemapEntries.push(
      {
        url: `${siteUrl}/en/services/${service.slug_en}`,
        lastModified: new Date(service.updated_at || now),
        changeFrequency: 'weekly',
        priority: 0.85,
      },
      {
        url: `${siteUrl}/ar/services/${service.slug_ar}`,
        lastModified: new Date(service.updated_at || now),
        changeFrequency: 'weekly',
        priority: 0.85,
      }
    );
  });

  // Portfolio dynamic detail pages
  projects.forEach((project) => {
    sitemapEntries.push(
      {
        url: `${siteUrl}/en/our-work/${project.slug}`,
        lastModified: new Date(project.updated_at || now),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${siteUrl}/ar/our-work/${project.slug}`,
        lastModified: new Date(project.updated_at || now),
        changeFrequency: 'weekly',
        priority: 0.8,
      }
    );
  });

  return sitemapEntries;
}
