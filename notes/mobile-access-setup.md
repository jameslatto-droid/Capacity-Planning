# Access LLM from iPhone on Home Network

## Your PC's IP Addresses
- **WiFi:** 192.168.1.242
- **LAN:** 192.168.1.66

Use the one that matches your active connection.

## Setup Steps

### On Windows PC (Ollama):
1. Ollama is running on port 11434
2. Gemma-3-12B Heretic model is loaded
3. Server automatically binds to 0.0.0.0 (accessible from network)
4. Access web chat interface at: http://192.168.1.66:8080/chat.html

### On iPhone:
Open Safari and go to:
- Chat Interface: `http://192.168.1.66:8080/chat.html`
- Ollama API: `http://192.168.1.66:11434`
- Stable Diffusion: `http://192.168.1.66:7860`

## Web Chat Interface
A custom web chat interface is already set up that connects to Ollama.
Access it at: http://192.168.1.66:8080/chat.html

Features:
- Text chat with Gemma-3 12B Heretic
- Image generation via Stable Diffusion
- Vision/image analysis

## Firewall Note
If iPhone can't connect, allow ports through Windows Firewall:
```powershell
New-NetFirewallRule -DisplayName "Ollama Server" -Direction Inbound -LocalPort 11434 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Chat WebUI" -Direction Inbound -LocalPort 8080 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Stable Diffusion" -Direction Inbound -LocalPort 7860 -Protocol TCP -Action Allow
```

## API Endpoints
Ollama server is OpenAI-compatible:
- Base URL: `http://192.168.1.66:11434/v1`
- Models endpoint: `http://192.168.1.66:11434/api/tags`
- Chat endpoint: `/v1/chat/completions`

Want me to create a simple HTML chat interface you can use from your iPhone?
