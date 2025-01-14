import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env:{
    CONNECTION_URL: process.env.CONNECTION_URL,
    WEB3_AUTH_CLIENT_ID: process.env.WEB3_AUTH_CLIENT_ID,

  }
};

export default nextConfig;
