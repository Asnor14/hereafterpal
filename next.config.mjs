/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize paymongo for server-side to avoid bundling issues
      config.externals = config.externals || []
      config.externals.push('paymongo')
    }
    return config
  },
};

export default nextConfig;
