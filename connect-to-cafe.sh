#!/bin/bash
# Connect to The Common Grounds Cafe Software from another Mac/Linux device.
# This does NOT run its own server - only ONE computer (the till PC) should
# ever run start-cafe.sh. Copy just this one file to any other device.

DIR="$(cd "$(dirname "$0")" && pwd)"
CONFIG_FILE="$DIR/cafe-server-address.txt"

if [ -f "$CONFIG_FILE" ]; then
  SERVER_ADDRESS=$(cat "$CONFIG_FILE")
else
  echo "================================================="
  echo "  Connect to The Common Grounds Cafe Software"
  echo "================================================="
  echo
  echo "This computer needs the address of the till PC running the cafe"
  echo "software - shown in ITS terminal as 'Network access: http://x.x.x.x:4000'"
  echo
  read -p "Enter that address now (e.g. http://192.168.1.50:4000): " SERVER_ADDRESS
  echo "$SERVER_ADDRESS" > "$CONFIG_FILE"
  echo
  echo "Saved - this won't ask again next time."
  echo "(To change it later, edit or delete cafe-server-address.txt in this folder)"
  echo
fi

echo "Opening $SERVER_ADDRESS ..."
if which open >/dev/null 2>&1; then
  open "$SERVER_ADDRESS"       # macOS
else
  xdg-open "$SERVER_ADDRESS"   # Linux
fi
