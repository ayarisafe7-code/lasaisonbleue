#!/usr/bin/env bash
# Start a simple Ruby HTTP server in background and save PID
PORT=8000
cd "$(dirname "$0")/.."
nohup ruby -run -e httpd . -p "$PORT" > /dev/null 2>&1 &
echo $! > .server.pid
echo "Started server on http://127.0.0.1:$PORT (pid=$(cat .server.pid))"
