/** @type {import('next').NextConfig} */
import NextPWA from 'next-pwa'

const nextConfig = {
  reactStrictMode: true,
}

const withPWA = NextPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})

export default withPWA(nextConfig);
