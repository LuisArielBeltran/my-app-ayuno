const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  disable: true, // Lo desactivamos temporalmente en producción para forzar que el navegador lea siempre el código nuevo de Vercel
  register: true,
  workboxOptions: {
    disableDevLogs: true,
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = withPWA(nextConfig);
