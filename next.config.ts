import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse usa caminho interno e leitura de arquivo — mantém externo pra resolver do node_modules no serverless
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
