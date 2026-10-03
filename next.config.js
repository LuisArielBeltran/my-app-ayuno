const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  disable: true, // ¡Activado nuevamente para la versión final de producción!
  register: true,
  workboxOptions: {
    disableDevLogs: true,
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = withPWA(nextConfig);
