/** @type {import('next').NextConfig} */
const nextConfig = {

  // ✅ تحسينات آمنة ومجربة
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  
  // ✅ تحسينات أداء محسنة
  experimental: {
    optimizePackageImports: ['lucide-react'],
    typedRoutes: false
  },
  
  // 🚀 تحسينات إضافية للإنتاج
  output: 'standalone', // للـ deployment
  
  // 📊 env variables
  env: {
    BUILD_PHASE: 'PHASE_2_PRODUCTION_READY'
  }
}

module.exports = nextConfig