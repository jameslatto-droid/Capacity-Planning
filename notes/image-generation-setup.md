# Image Generation Setup for Home LLM

## Overview
Your Gemma-3 12B model will detect when you ask for image generation and automatically call a local Stable Diffusion API.

## Hardware Check
- RTX 4080 12GB: ✅ Perfect for Stable Diffusion
- Can run SDXL or SD 1.5 models

## Setup Steps

### 1. Install Stable Diffusion WebUI (Automatic1111)
This is the most popular and feature-rich option with API support.

**Installation:**
```powershell
cd e:\LLM\runners
git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui.git
cd stable-diffusion-webui
.\webui.bat --api --listen
```

**First run will:**
- Download Python dependencies
- Download a default SD model (~4-7 GB)
- Start the WebUI on http://localhost:7860
- Enable API on http://localhost:7860

### 2. How It Works
When you ask the LLM: "Generate an image of a sunset over mountains"
1. Chat interface detects keywords like "generate", "create", "draw"
2. Automatically calls Stable Diffusion API
3. Returns the generated image in the chat
4. LLM can also describe/refine the image

### 3. Model Recommendations for RTX 4080 12GB
- **SDXL** (~6-7 GB VRAM): Best quality, slower
- **SD 1.5** (~3-4 GB VRAM): Fast, good quality
- Models download automatically or from Hugging Face/Civitai

### 4. Starting Both Services
Run `START-HOME-LLM.ps1` which starts:
1. Ollama server (port 11434)
2. Stable Diffusion WebUI (port 7860)
3. Web chat interface (port 8080)

## Next Steps
1. Install git if not already: `winget install Git.Git`
2. Run the installation commands above
3. I'll modify chat.html to auto-detect and call image gen

Ready to proceed?
