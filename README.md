# Project Setup
    
    To run this project, follow these steps:
    
    1. Extract the zip file.
    2. Run `npm install` to install dependencies.
    3. Run `npm run dev` to start the development server.
    
    This project was generated through Alpha. For more information, visit [dualite.dev](https://dualite.dev).

## Video conversion & local testing

If you want the background video to work in all browsers, convert the provided `AdobeStock_686650638.mov` to `mp4` and `webm` and place the outputs in the project root as `bg-video.mp4` and `bg-video.webm`.

Install `ffmpeg` on macOS (recommended via Homebrew):

```bash
# Install Homebrew first if you don't have it, see https://brew.sh/
brew install ffmpeg
```

Conversion commands (lossy but web-friendly presets):

```bash
cd "$(dirname "${BASH_SOURCE[0]:-$0}")"
ffmpeg -i AdobeStock_686650638.mov -c:v libx264 -crf 22 -preset medium -c:a aac -b:a 128k bg-video.mp4
ffmpeg -i AdobeStock_686650638.mov -c:v libvpx-vp9 -b:v 2M -c:a libopus bg-video.webm
```

If `ffmpeg` is not available and you cannot install Homebrew, download a static build from https://ffmpeg.org/download.html.

Quick local test (serve files and open browser):

```bash
# from project root
# using npm package 'serve' (install globally once: npm i -g serve)
serve -s .

# or with Python 3 built-in server
python3 -m http.server 8000

# open http://localhost:5000 (serve) or http://localhost:8000 (python)
```

Notes:
- The page already includes `bg-video.webm` and `bg-video.mp4` sources and falls back to the original `.mov`.
- Keep `muted` and `playsinline` on the `<video>` element to ensure autoplay works on mobile.