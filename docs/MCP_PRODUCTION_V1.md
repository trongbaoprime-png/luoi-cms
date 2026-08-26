# LƯỜI Business OS — MCP Production V1

## Goal

Expose a read-only remote MCP endpoint for ChatGPT without exposing PostgreSQL or granting write access to CRM/Omnichannel in V1.

## Runtime

- Next.js app: `127.0.0.1:3000` (`luoi-cms`)
- CRM sync worker: `luoi-crm-sync`
- MCP service: `127.0.0.1:3100` (`luoi-mcp`)
- Public MCP path through Nginx: `https://<your-domain>/mcp`

The MCP process binds to loopback only. Never open port 3100 publicly.

## Required environment variables

Add to `/var/www/app/path-app/.env` on the VPS. Do not commit values to Git.

```bash
MCP_API_KEY=<random-secret-at-least-32-bytes>
MCP_HOST=127.0.0.1
MCP_PORT=3100
CRM_POSTGRES_URL=<existing-crm-postgres-url>
OMNI_POSTGRES_URL=<existing-omni-postgres-url>

# Admin authentication: use Argon2id hash, not a plaintext password.
ADMIN_USER=<admin-login>
ADMIN_PASS_HASH=<argon2id-hash>
ADMIN_EMAIL=<optional-admin-email>

# Legacy internal /api/mcp/execute is disabled by default.
ENABLE_LEGACY_MCP_EXECUTE=false
MCP_WORKSPACE_ID=ws_default_001
```

Generate a strong MCP key on the VPS:

```bash
openssl rand -hex 32
```

Do not paste the generated value into GitHub issues, source files, screenshots or chat logs.

## Nginx

Add this inside the existing HTTPS `server {}` block for the production domain:

```nginx
location = /mcp {
    proxy_pass http://127.0.0.1:3100/mcp;
    proxy_http_version 1.1;

    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    proxy_buffering off;
    proxy_read_timeout 300s;
    proxy_send_timeout 300s;

    client_max_body_size 1m;
}
```

Then validate before reload:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Safe deployment sequence

Run from `/var/www/app/path-app`:

```bash
git fetch origin
git checkout feat/mcp-production-v1
npm ci
npm run prisma:generate
npm run audit
npm run build
pm2 startOrReload ecosystem.config.cjs --update-env
pm2 save
```

Do not run `prisma migrate`, `db push`, destructive SQL, or database reset as part of this MCP deployment.

## Validation

### 1. Check process

```bash
pm2 status
pm2 logs luoi-mcp --lines 100
```

Expected process: `luoi-mcp` online.

### 2. Health check from the VPS

```bash
curl -sS http://127.0.0.1:3100/healthz
```

Expected: `ok: true`, plus CRM/Omni configured flags.

### 3. Verify unauthenticated MCP is rejected

```bash
curl -i http://127.0.0.1:3100/mcp \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

Expected HTTP `401`.

### 4. Smoke test with the MCP key

```bash
export MCP_API_KEY='<value-from-env>'
npm run mcp:test
```

The test initializes the MCP connection, lists tools and calls `analytics.crm_summary`.

### 5. Verify external HTTPS endpoint

```bash
curl -i https://<your-domain>/mcp \
  -H "Authorization: Bearer $MCP_API_KEY" \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

## V1 tools

Read-only only:

- `crm.search_leads`
- `crm.get_lead`
- `crm.get_customer_360`
- `crm.list_appointments`
- `omni.search_conversations`
- `omni.get_conversation`
- `analytics.crm_summary`
- `analytics.revenue_by_dimension`

No write, delete, bulk-message or advertising-budget tools are exposed in V1.

## ChatGPT connection

Use the public HTTPS endpoint:

```text
https://<your-domain>/mcp
```

Authentication is currently a Bearer secret at the MCP gateway. If the ChatGPT custom-app configuration used by the account requires OAuth rather than a static secret, deploy OAuth in a follow-up phase rather than making the endpoint anonymous.

## Security changes included in this branch

1. Removed hardcoded master admin passwords from the login route.
2. Admin auth now fails closed if a server-side session is missing/unknown.
3. Legacy `/api/mcp/execute` no longer trusts `userId`, `userRole` or `workspaceId` supplied by the client.
4. Legacy MCP execution is disabled unless `ENABLE_LEGACY_MCP_EXECUTE=true`.
5. Password-reset script requires an explicit password argument and no longer prints the password.
6. MCP V1 binds to `127.0.0.1`, requires a Bearer key and exposes read-only tools.

## Credential rotation required

Credentials that have ever appeared in source history, screenshots or chat messages must be considered compromised. Before production exposure:

- rotate the VPS root password;
- revoke the previously shared SSH private key and create a new deployment key;
- rotate any admin password that was previously hardcoded in Git history;
- remove plaintext secrets from old deployment notes/backups where practical;
- preferably disable SSH password login after confirming the new key works.

## Rollback

If the MCP process causes issues, stop only MCP first:

```bash
pm2 stop luoi-mcp
```

This does not stop `luoi-cms` or `luoi-crm-sync`.

To return the code checkout to production branch after investigation:

```bash
git checkout main
npm ci
npm run prisma:generate
npm run build
pm2 startOrReload ecosystem.config.cjs --update-env
```
