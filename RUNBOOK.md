# RUNBOOK

Date: February 8, 2026

## Setup (first run)
- Prereqs: Docker Desktop + WSL2, PowerShell 7+, Ollama installed on host and listening on 11434 with OLLAMA_HOST=0.0.0.0:11434.
- ./scripts/setup.ps1 (creates data dirs, copies .env.example → .env, pulls images).
- Edit .env:
  - Set JWT_SECRET / JWT_REFRESH_SECRET to strong random strings.
  - Adjust DOMAIN_CLIENT/DOMAIN_SERVER if LAN IP changes.
  - Keep MIN_PASSWORD_LENGTH=1 and long session expiries for PIN-style logins.
- Optional: add a Windows Firewall inbound allow rule for port 3080 (TCP) to your private network.

## Start / Stop
- Start: ./scripts/start.ps1 [-WithSD]  (add -WithSD to launch Automatic1111 with API)
- Stop: ./scripts/stop.ps1
- Health: ./scripts/healthcheck.ps1 (checks Docker, LibreChat health, Ollama reachability, ports 3080/11434/7860).

## Updating Containers
- Pull new images: docker compose pull
- Restart with new images: ./scripts/stop.ps1 then ./scripts/start.ps1
- If configs change (e.g., librechat.yaml), restart LibreChat container: docker compose restart librechat.

## User Creation & Auth
- LibreChat UI → Sign Up (allowed because ALLOW_REGISTRATION=true).
- 1-character PINs allowed (MIN_PASSWORD_LENGTH=1). No email verification, no password reset.
- Session lifetime: 30 days (SESSION_EXPIRY), refresh: 90 days (REFRESH_TOKEN_EXPIRY).
- To reset a user PIN: use MongoDB users collection (manual) or delete the user and recreate.

## Backups
- Run ./scripts/backup.ps1 while stack is up.
  - Produces backups/mongo-<timestamp>.archive via mongodump and librechat-files-<timestamp>.zip for uploads/logs.
- Restore outline:
  - docker compose cp <archive> mongo:/data/restore.archive
  - docker compose exec mongo mongorestore --drop --archive=/data/restore.archive
  - Extract uploads zip back into data/librechat/uploads.

## Logs & Data Paths
- LibreChat app logs: data/librechat/logs
- Container logs: docker compose logs -f librechat
- Mongo data: data/mongo
- Redis data: data/redis
- Meilisearch data: data/meili

## Troubleshooting Ollama Connectivity
- From host: curl http://localhost:11434/api/tags
- From container: docker compose exec librechat curl -s http://host.docker.internal:11434/api/tags
- If blocked:
  - Ensure Ollama started with OLLAMA_HOST=0.0.0.0:11434 and firewall allows 11434 on LAN.
  - Verify extra_hosts: host.docker.internal:host-gateway exists in docker-compose.yml.

## Stable Diffusion Integration (Automatic1111)
- Current stance: Option A (external, selected)
  - Run Automatic1111 on host with `--api` (port 7860). Use `./scripts/start.ps1 -WithSD` (which calls `scripts/start-stable-diffusion.ps1`) or run that script directly.
  - Set `SD_WEBUI_URL` in `.env` (default: http://host.docker.internal:7860).
  - In LibreChat UI: Plugins → Store → enable “Stable Diffusion” plugin; it will call `SD_WEBUI_URL` for txt2img/img2img.
  - Keeps GPU sharing explicit; avoids container duplication.
- Option B (containerize) left for future; expect heavier GPU contention and larger image pulls.
- Option C (defer) possible: legacy proxy remains in legacy-ui for rapid reuse.

## LAN Test Checklist
- Test-NetConnection 192.168.1.66 -Port 3080 from another LAN device.
- Browser → http://192.168.1.66:3080 loads LibreChat UI.
- Start a chat with model gemma3-heretic:latest; confirm response.
- Upload an image in the chat (vision) to confirm multimodal routing works.
- If SD running: POST to http://192.168.1.66:7860/sdapi/v1/txt2img via a tool call and check image return.

## GitHub Sync
- .env, data/, backups/ are git-ignored; keep secrets out of commits.
- Recommended workflow:
  - git add docker-compose.yml librechat.yaml scripts/*.ps1 README.md RUNBOOK.md .gitignore legacy-ui
  - git commit -m "migrate to dockerized librechat stack"
  - Push to private repo.

## Optional Enhancements
- HTTPS reverse proxy: add Traefik/Caddy in compose, terminate TLS locally, keep WAN closed.
- Tailscale/ZeroTier: expose port 3080 to yourself remotely without opening WAN.
- Multi-node Ollama: point baseURL to a load balancer or per-model endpoints; update librechat.yaml accordingly.
- GPU offload: if another GPU host exists, change OLLAMA_BASE_URL to that host IP and keep LibreChat static.
