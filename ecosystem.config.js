require('dotenv').config();

module.exports = {
  apps: [
    {
      name: "web",
      cwd: "/home/azureuser/codePro",
      script: "node_modules/next/dist/bin/next",
      args: "start apps/web -p 3000",
      env: {
        PORT: 3000,
        NODE_ENV: "production",
        DATABASE_URL: process.env.DATABASE_URL,
        AUTH_SECRET: process.env.AUTH_SECRET,
        AUTH_URL: process.env.AUTH_URL,
        AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST,
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
        JUDGE0_API_URL: process.env.JUDGE0_API_URL,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
        JUDGE0_CALLBACK_SECRET: process.env.JUDGE0_CALLBACK_SECRET,
      },
    },
    {
      name: "api",
      cwd: "/home/azureuser/codePro",
      script: "apps/api/dist/index.js",
      env: {
        PORT: 4000,
        NODE_ENV: "production",
        DATABASE_URL: process.env.DATABASE_URL,
        JWT_SECRET: process.env.JWT_SECRET,
        JUDGE0_API_URL: process.env.JUDGE0_API_URL,
        FRONTEND_URL: process.env.FRONTEND_URL,
      },
    },
  ],
};
