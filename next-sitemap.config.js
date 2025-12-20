/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.SITE_URL || 'https://example.com',
    generateRobotsTxt: true,
    generateIndexSitemap: false,
    // 排除不需要被索引的路径
    exclude: [
        '/api/*',
        '/dashboard/*',
        '/admin/*',
        '/auth/*',
        '/login',
    ],
    robotsTxtOptions: {
        policies: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/dashboard/', '/admin/', '/auth/', '/login'],
            },
        ],
    },
}
