# Home LLM App Spec & Current State

Date: February 8, 2026

## Overview
A local web chat interface serves as the single UI for:
- Text chat via Ollama
- Vision/image analysis via Ollama (model supports images)
- Image generation via Stable Diffusion (Automatic1111 API)

## UI
- Entry point: http://192.168.1.66:8080/chat.html
- File: chat.html
- Settings:
  - LLM Server URL defaults to: http://192.168.1.66:8080/ollama
  - Stable Diffusion URL defaults to: http://192.168.1.66:8080/sd

## Services & Connections
- Web server (Python) serves static UI and proxies API calls to avoid CORS.
  - Port: 8080
  - Proxy endpoints:
    - /ollama → http://192.168.1.66:11434
    - /sd → http://192.168.1.66:7860
- Ollama API
  - Port: 11434
  - Used for text chat and vision messages
- Stable Diffusion WebUI (Automatic1111)
  - Port: 7860
  - Used for image generation requests

## Models in Use
- Ollama model:
  - gemma3-heretic:latest
  - Backed by GGUF model file: models/gemma-3-12b-heretic-Q4_K_M.gguf
- Stable Diffusion model:
  - Not explicitly specified in the workspace; loaded model depends on the WebUI configuration.

## Dependencies
- Ollama (serving the LLM API)
- Python (for the web server in scripts/start-web-server.py)
- Stable Diffusion WebUI (Automatic1111) + Python (optional; used for image generation)
- Browser (Chrome/Edge/Safari) to access the UI

## Startup/Control
- Master script: START-HOME-LLM.ps1
  - Starts web server, Ollama, and Stable Diffusion WebUI
- Utility script: scripts/start-web-server.py
  - Hosts chat.html and proxies API calls for CORS safety

## Current Status (last observed)
- Ollama: reachable and responding through the proxy
- Web server: running on port 8080
- Stable Diffusion: may be offline; port 7860 previously failed connectivity tests

## Notes
- All LM Studio references were removed from docs and scripts.
- If chat shows 500 errors, the proxy now returns diagnostic error text in the UI.
