# Gemma-3-12B Heretic Uncensored Thinking Model Setup

## Model Overview
**Model:** [DavidAU/gemma-3-12b-it-vl-GLM-4.7-Flash-Heretic-Uncensored-Thinking](https://huggingface.co/DavidAU/gemma-3-12b-it-vl-GLM-4.7-Flash-Heretic-Uncensored-Thinking)

- **Size:** 12B parameters (fits your RTX 4080 12GB!)
- **Features:** 
  - Fully uncensored (98/100 vs 2/100 refusals)
  - Deep thinking/reasoning capability
  - 128k context window
  - Vision (image-text-to-text) support
  - Temperature stable reasoning (0.1 - 2.5)

## LM Studio Setup Steps

### 1. Download LM Studio
- Go to: https://lmstudio.ai
- Download and install for Windows

### 2. Find the Model in LM Studio
- Open LM Studio
- Click **"Search"** tab (top)
- Search for: `DavidAU/gemma-3-12b-it-vl-GLM-4.7-Flash-Heretic-Uncensored-Thinking`

### 3. Which Quantization (GGUF) to Download?

For your **RTX 4080 12GB**, choose one of these:

| Quantization | File Size | VRAM Usage | Quality | Recommended |
|--------------|-----------|------------|---------|-------------|
| Q4_K_M       | ~7-8 GB   | ~8-9 GB    | Good    | ✅ **SAFE CHOICE** |
| Q5_K_M       | ~8-9 GB   | ~9-10 GB   | Better  | ⚠️ Tight fit, test it |
| Q6_K         | ~10 GB    | ~11-12 GB  | Best    | ❌ May not fit |

**Start with Q4_K_M** - it's guaranteed to work smoothly on your 12GB card.

### 4. Download & Load
1. Click the quantization you want (e.g., `Q4_K_M`)
2. Click **Download**
3. Wait for download to complete
4. Go to **Chat** tab
5. Select the model from the dropdown
6. Start chatting!

## Model Usage Tips

### Basic Prompting
Just ask questions normally - reasoning activates automatically in most cases.

### Force Deep Thinking
Use this prompt when you need extra reasoning:
```
think deeply: <your question>
```

### Optional System Prompts

**For structured thinking:**
```
Think deeply and carefully about the user's request. Compose your thoughts about the user's prompt between <think> and </think> tags, then output the final answer based on your thoughts.
```

**For roleplay (example - Joker character):**
```
You are the JOKER from Batman. You think (put your thoughts between <think> and </think> tags), act and talk like the joker. Be Evil.
```

### Recommended Settings in LM Studio
- **Temperature:** 0.7 - 1.5 (stable across range)
- **Top P:** 0.95
- **Repeat Penalty:** 1.0 - 1.1
- **Context Length:** Up to 128k (adjust based on VRAM)

### Advanced: Smoothing (if available)
If LM Studio supports "Smoothing Factor", set it to **1.5** for better output quality.

## Notes on "Uncensored" Behavior
- Model will NOT refuse most requests (2% refusal rate vs 98% in base model)
- For explicit content, you may need to be more direct:
  - Specify tone/style you want
  - Include specific words/terms if needed
  - Default output can be "tame" without direction

## Vision Support
This model supports image inputs! In LM Studio:
1. Look for image upload option in chat
2. Upload an image
3. Ask questions about it
4. Reasoning enhances image processing too

## Troubleshooting

**Out of Memory Error:**
- Download a smaller quantization (Q4_K_M or Q4_K_S)
- Reduce context length in settings
- Close other GPU-intensive apps

**Model too slow:**
- Use Q4 instead of Q5/Q6
- Reduce context length
- Check GPU utilization in Task Manager

**Model output seems censored:**
- Add more specific direction to your prompts
- Use system prompts above
- Be explicit about what you want

## File Storage
- Model files will be stored in: `C:\Users\<YourUser>\.cache\lm-studio\models\`
- You can optionally move them to: `e:\LLM\models\`

## Next Steps
1. Download LM Studio now
2. Search for the model
3. Download Q4_K_M quantization
4. Test it out!

Enjoy your uncensored thinking model! 🎉
