/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    env: {
        FILE_STORAGE_PATH: process.env.FILE_STORAGE_PATH,
    },
};


export default nextConfig;