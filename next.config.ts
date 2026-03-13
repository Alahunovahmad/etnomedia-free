/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'etnomedia-cache.cdnvideo.ru',
      },
    ],
  },
  // Отключаем избыточное логирование
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  // Уменьшаем детализацию логов в development
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
    buildActivityPosition: 'bottom-right',
  },
}

export default nextConfig
