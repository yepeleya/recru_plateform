import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // /profils était un second annuaire, alimenté par des profils fictifs.
      // Un seul annuaire subsiste : /candidats. 308 = redirection permanente.
      // /profils/:slug n'est pas redirigé : ces profils n'ont jamais existé (404).
      { source: "/profils", destination: "/candidats", permanent: true },
    ];
  },
};

export default nextConfig;
