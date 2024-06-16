/** @type {import('next').NextConfig} */
const nextConfig = {
  rewrites: async () => [
    {
      source: "/github/:path",
      destination: "https://github.com/users/:path/contributions",
    },
    {
      source: "/gitlab/:path",
      destination: "https://gitlab.com/users/:path/calendar.json",
    },
  ],
};

export default nextConfig;
