FROM node:20-bullseye

LABEL maintainer="habitforge-help@example.com"
ENV DEBIAN_FRONTEND=noninteractive

# Install minimal dependencies and Chromium for Puppeteer
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
    ca-certificates \
    wget \
    fonts-liberation \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libxss1 \
    libasound2 \
    libgtk-3-0 \
 && rm -rf /var/lib/apt/lists/*

# Install Chromium (Debian package)
RUN apt-get update && apt-get install -y --no-install-recommends chromium && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Install BackstopJS and a simple HTTP server globally
RUN npm install -g backstopjs http-server

WORKDIR /work

# Add entrypoint which starts a static http server and then runs backstop
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
COPY backstop.json /work/backstop.json
COPY example /work/example
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["--help"]
