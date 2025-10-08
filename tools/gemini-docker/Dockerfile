# Small Docker image to run gemini without changing the host toolchain
# Uses Node 14 (compatible V8 ABI for older native addons) and system Python/build tools
# Use Node 10 so native addons with older V8/NAN APIs can compile
# (gemini depends on ancient native modules). Node 10 includes an
# older V8 that is compatible with png-img's code.
FROM node:10-buster

LABEL maintainer="habitforge-help@example.com"

# Install python, build tools and libraries needed to compile native addons
# Buster is archived; point apt to archive.debian.org and disable 'Valid-Until' checks
RUN sed -i 's|deb.debian.org|archive.debian.org|g' /etc/apt/sources.list || true \
 && sed -i 's|security.debian.org|archive.debian.org|g' /etc/apt/sources.list || true \
 && printf 'Acquire::Check-Valid-Until "false";\n' > /etc/apt/apt.conf.d/99no-check-valid-until \
 && apt-get update -o Acquire::Check-Valid-Until=false \
 && apt-get install -y --no-install-recommends \
    python \
    python-dev \
    build-essential \
    libpng-dev \
    zlib1g-dev \
    ca-certificates \
 && rm -rf /var/lib/apt/lists/*


# Install gemini globally. --legacy-peer-deps helps with older deps.
# Use --unsafe-perm so lifecycle scripts run as root inside the container
# (prevents node-gyp permission issues where npm switches to 'nobody').
RUN npm install -g --unsafe-perm gemini --legacy-peer-deps

# Default entrypoint is the gemini CLI
ENTRYPOINT ["gemini"]
CMD ["--help"]
