#!/usr/bin/env bash
cd "$(dirname "$0")/.."
if [ -f .server.pid ]; then
  PID=$(cat .server.pid)
  echo "Stopping server pid=$PID"
  kill "$PID" 2>/dev/null || true
  rm -f .server.pid
  echo "Stopped."
else
  echo "No .server.pid found. Server may not be running."
fi
