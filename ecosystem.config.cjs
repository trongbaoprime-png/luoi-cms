const path = require("path");

module.exports = {
  apps: [
    {
      name: "luoi-cms",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
    {
      name: "luoi-crm-sync",
      script: "scripts/auto-sync-worker.js",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "256M",
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "luoi-mcp",
      script: "server/mcp-server.mjs",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "384M",
      kill_timeout: 10000,
      env: {
        NODE_ENV: "production",
        MCP_HOST: "127.0.0.1",
        MCP_PORT: 3100,
      },
    },
  ],
};
