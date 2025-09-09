import { getSiteConfig, getNavigationItems } from '@/lib/site-config'

export async function GET() {
  const siteConfig = getSiteConfig()
  const navigationItems = getNavigationItems('menu')
  
  // Generate URLs for navigation items
  const navigationUrls = navigationItems.map(item => `
  <url>
    <loc>${siteConfig.url}${item.path}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${item.path === '/chat' ? 'daily' : 'weekly'}</changefreq>
    <priority>${item.path === '/chat' ? '0.9' : '0.7'}</priority>
  </url>`).join('')
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteConfig.url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>${navigationUrls}
</urlset>`

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}
