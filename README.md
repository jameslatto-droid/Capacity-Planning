# Home LLM Stack (LibreChat + Ollama)

Dockerized replacement for the original chat.html+proxy stack. LibreChat runs in containers, talks to the host's Ollama at host.docker.internal:11434, and keeps conversation history with lightweight PIN-style accounts. Stable Diffusion (Automatic1111) remains optional.

## Requirements
- Windows 11 with WSL2 + Docker Desktop
- Ollama installed on the host; port 11434 open to LAN; model gemma3-heretic:latest pulled
- PowerShell 7+ recommended

## Quick Start
1. cd e:\LLM
2. ./scripts/setup.ps1 (creates .env, data dirs, pulls images)
3. Edit .env (set secrets, tweak LAN IP if needed; SD_WEBUI_URL defaults to host.docker.internal:7860)
4. ./scripts/start.ps1 [-WithSD]   # pass -WithSD to auto-launch Automatic1111 on the host
5. Open http://192.168.1.66:3080

## Repo Layout
- docker-compose.yml – LibreChat + Mongo + Redis + Meilisearch
- librechat.yaml – endpoint config targeting Ollama
- .env.example – baseline env; copy to .env
- scripts/ – setup, start/stop, backup, healthcheck
- legacy-ui/ – archived chat.html, proxy server, old launcher
- data/ – bind-mounted volumes (ignored by git)
- ackups/ – mongodump + uploads archives (ignored by git)

## Authentication Model
LibreChat lacks true passwordless today. Config uses:
- Registration enabled, social logins disabled
- MIN_PASSWORD_LENGTH=1 → allows 1-character PINs
- Long-lived sessions (30d access, 90d refresh) set in .env
Documented trade-offs in RUNBOOK.md.

## Stable Diffusion: Option A (selected)
- Keep Automatic1111 running on the host with `--api` (port 7860). Use `./scripts/start.ps1 -WithSD` to launch it.
- Set `SD_WEBUI_URL` in `.env` (default: `http://host.docker.internal:7860`).
- In LibreChat, enable the Stable Diffusion plugin (Plugins → Store → Stable Diffusion) and use it for txt2img/img2img calls.
- Option B/C remain documented in RUNBOOK for future changes.

## LAN Access & Security
- UI bound to port 3080; add Windows Firewall rule to allow LAN access if blocked.
- WAN exposure is intentionally absent; use Tailscale/ZeroTier if remote access is needed (see RUNBOOK optional enhancements).

## Next Steps
- Finish .env secrets
- Run ./scripts/start.ps1
- Create first user via LibreChat UI (PIN allowed)
