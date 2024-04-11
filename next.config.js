/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/sign-in',
        destination: '/api/auth/login',
        permanent: true,
      },
      {
        source: '/sign-up',
        destination: '/api/auth/register',
        permanent: true,
      },
    ]
  },

  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Existing alias configurations
    config.resolve.alias.canvas = false
    config.resolve.alias.encoding = false

    // Ignore the specified modules
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^original-fs$|^zipfile$/,
      }),
    )

    return config
  },

  images: {
    domains: [
      'lh3.googleusercontent.com',
      'tailwindui.com',
      'images.unsplash.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.example.com',
        port: '',
        pathname: '/account123/**',
      },
    ],
  },
}

module.exports = nextConfig
