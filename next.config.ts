/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // تعطيل type checking أثناء البناء مؤقتاً
    ignoreBuildErrors: true,
  },
  eslint: {
    // تعطيل ESLint checking أثناء البناء مؤقتاً
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
