import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env:{
    CONNECTION_URL: process.env.CONNECTION_URL,
    WEB3_AUTH_CLIENT_ID: process.env.WEB3_AUTH_CLIENT_ID,
    GEMINI_API_KEY:process.env.GEMINI_API_KEY,
    GOOGLE_MAPS_API_KEY:process.env.GOOGLE_MAPS_API_KEY
  }
};

export default nextConfig;
