/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    images: {
        domains: ["linktree.sirv.com", "firebasestorage.googleapis.com"],
    }
}

module.exports = nextConfig