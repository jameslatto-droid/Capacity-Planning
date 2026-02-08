# Quick Start (LibreChat + Ollama)

1) Prereqs
- Windows 11, WSL2, Docker Desktop running
- Ollama on host, listening on 11434, model gemma3-heretic:latest pulled

2) First run
- cd e:\LLM
- ./scripts/setup.ps1
- Edit .env (set secrets + LAN IP if different)

3) Start
- ./scripts/start.ps1 [-WithSD]   # add -WithSD to auto-launch Automatic1111
- Open http://192.168.1.66:3080

4) Use
- Select endpoint "Ollama"
- Choose model gemma3-heretic:latest (auto-discovered) or any other installed model
- Vision: attach an image in the chat composer
- Image gen (Option A): run Automatic1111 on host with `--api` (port 7860), set SD_WEBUI_URL in .env (defaults to host.docker.internal:7860), then enable the Stable Diffusion plugin inside LibreChat (Plugins → Store).

5) Stop
- ./scripts/stop.ps1

6) Health & backups
- Health: ./scripts/healthcheck.ps1
- Backup: ./scripts/backup.ps1 (mongodump + uploads zip)

Notes
- Sessions last 30d; PIN-length passwords allowed (MIN_PASSWORD_LENGTH=1).
- Stack listens on 3080 only; WAN exposure intentionally disabled.
