/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use serverComponentsExternalPackages for App Router
  serverComponentsExternalPackages: ['paymongo'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize paymongo for server-side to avoid bundling issues
      config.externals = config.externals || []
      
      // More aggressive externalization - treat as external function
      config.externals.push(({ request }, callback) => {
        if (request === 'paymongo') {
          return callback(null, 'commonjs ' + request)
        }
        callback()
      })
    }
    return config
  },
};

export default nextConfig;
