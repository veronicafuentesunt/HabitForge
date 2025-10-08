#!/bin/bash
set -euo pipefail

# Start a static file server for the example HTML
http-server ./example -p 8080 -c-1 &
HTTP_PID=$!

# Wait a moment for the server to come up
sleep 1

# Run backstop with whatever args passed
exec backstop "$@"
