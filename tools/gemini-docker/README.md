# gemini Docker wrapper

This folder contains a small Docker image that installs `gemini` (the visual regression tool) into a Node 14 container so you can run it without changing your Windows host toolchain.

Build the image:

```bash
cd tools/gemini-docker
docker build -t gemini14 .
```

Run `gemini --version` inside the container:

```bash
docker run --rm gemini14 --version
```

Run a local gemini command (example: run tests in current directory):

```bash
# Mount current directory into /work and run gemini command
docker run --rm -v "$(pwd):/work" -w /work gemini14 <gemini-args>
```

Notes:
- The image uses Node 14 on Debian bullseye and installs system build tools so the native modules (like png-img) can compile inside the container.
- If you need a different Node version, edit the Dockerfile FROM image.
