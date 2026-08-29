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
        DATABASE_URL: "postgresql://codepro:codepro_secret@localhost:5432/codepro",
        AUTH_SECRET: "codepro_prod_secret_32chars_long_key",
        AUTH_URL: "http://codepro.akshatg.codes",
        AUTH_TRUST_HOST: "true",
        JUDGE0_API_URL: "http://localhost:2358",
        NEXT_PUBLIC_APP_URL: "http://codepro.akshatg.codes",
        JUDGE0_CALLBACK_SECRET: "secure-random-string-for-webhook",
      },
    },
    {
      name: "api",
      cwd: "/home/azureuser/codePro",
      script: "apps/api/dist/index.js",
      env: {
        PORT: 4000,
        NODE_ENV: "production",
        DATABASE_URL: "postgresql://codepro:codepro_secret@localhost:5432/codepro",
        JWT_SECRET: "codepro_jwt_secret_replace_in_production",
        JUDGE0_API_URL: "http://localhost:2358",
        FRONTEND_URL: "http://codepro.akshatg.codes",
      },
    },
  ],
};
