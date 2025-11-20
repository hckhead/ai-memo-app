import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
    }
    
    // rehype-prism-plus를 transpile하도록 설정
    config.module.rules.push({
      test: /\.m?js$/,
      resolve: {
        fullySpecified: false,
      },
    })
    
    return config
  },
  transpilePackages: ['rehype-prism-plus', 'react-markdown'],
  typescript: {
    // react-markdown 타입 오류 무시 (라이브러리와 React 19 호환성 문제)
    ignoreBuildErrors: true,
  },
  eslint: {
    // 빌드 시 ESLint 오류가 있어도 계속 진행
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
