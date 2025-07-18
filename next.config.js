/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features
  experimental: {
    mdxRs: true,
    // Enable Server Components
    serverComponents: true,
    // Enable App Router
    appDir: true,
    // Enable static optimization
    optimizePackageImports: ['lucide-react', 'date-fns', 'lodash'],
    // Enable React Server Components
    serverComponentsExternalPackages: ['sharp', 'ioredis'],
    // Enable turbopack in development
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js'
        }
      }
    }
  },
  
  // Configure MDX support
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    domains: [
      'localhost',
      'images.unsplash.com',
      'via.placeholder.com',
      'cdn.example.com',
      'res.cloudinary.com'
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
    quality: 85,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Bundle optimization
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Production optimizations
    if (!dev && !isServer) {
      // Enable bundle splitting
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            reuseExistingChunk: true
          },
          common: {
            name: 'common',
            minChunks: 2,
            priority: 5,
            reuseExistingChunk: true
          },
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            priority: 20,
            reuseExistingChunk: true
          },
          ui: {
            test: /[\\/]node_modules[\\/](@radix-ui|@headlessui)[\\/]/,
            name: 'ui',
            priority: 15,
            reuseExistingChunk: true
          },
          utils: {
            test: /[\\/]node_modules[\\/](lodash|date-fns|classnames)[\\/]/,
            name: 'utils',
            priority: 12,
            reuseExistingChunk: true
          }
        }
      }

      config.optimization.runtimeChunk = { name: 'runtime' }
      config.optimization.usedExports = true
      config.optimization.sideEffects = false
      config.optimization.concatenateModules = true
      config.optimization.minimize = true
    }

    // Configure module resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': '.',
      '@/components': './components',
      '@/lib': './lib',
      '@/app': './app',
      '@/types': './types',
      '@/styles': './styles',
      '@/public': './public',
      '@/utils': './utils',
      '@/hooks': './hooks',
      '@/data': './data',
      '@/config': './config'
    }

    // Configure externals for server-side
    if (isServer) {
      config.externals = [...config.externals, 'sharp', 'ioredis']
    }

    // Add custom webpack plugins
    config.plugins.push(
      new webpack.DefinePlugin({
        __BUILD_ID__: JSON.stringify(buildId),
        __DEV__: JSON.stringify(dev),
        __BUILD_TIME__: JSON.stringify(new Date().toISOString())
      })
    )

    // Configure module rules
    config.module.rules.push(
      {
        test: /\.svg$/,
        use: ['@svgr/webpack']
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                auto: true,
                localIdentName: dev ? '[local]' : '[hash:base64:5]'
              }
            }
          }
        ]
      }
    )

    // Ignore moment.js locales (reduces bundle size)
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/locale$/,
        contextRegExp: /moment$/
      })
    )

    return config
  },

  // Compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
    reactRemoveProperties: process.env.NODE_ENV === 'production',
    styledComponents: true,
    swcMinify: true,
  },

  // Performance optimizations
  swcMinify: true,
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=300'
          }
        ]
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000'
          }
        ]
      }
    ];
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/recipe/:slug',
        destination: '/recipes/:slug',
        permanent: true
      },
      {
        source: '/post/:slug',
        destination: '/blog/:slug',
        permanent: true
      }
    ];
  },
  
  // Rewrites for API routes
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap'
      },
      {
        source: '/robots.txt',
        destination: '/api/robots'
      },
      {
        source: '/rss.xml',
        destination: '/api/rss'
      }
    ];
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    BUILD_TIME: new Date().toISOString(),
    BUILD_ID: process.env.BUILD_ID || 'development'
  },

  // ESLint configuration
  eslint: {
    dirs: ['app', 'components', 'lib', 'hooks', 'utils'],
    ignoreDuringBuilds: false
  },

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
    tsconfigPath: './tsconfig.json'
  },

  // Logging
  logging: {
    fetches: {
      fullUrl: true
    }
  },

  // Configure API routes
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    },
    responseLimit: '10mb'
  },

  // Configure internationalization
  i18n: {
    locales: ['en'],
    defaultLocale: 'en'
  }
};

module.exports = nextConfig;