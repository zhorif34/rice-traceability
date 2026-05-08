#!/bin/bash
docker exec explorer.mynetwork.com cat /opt/explorer/logs/console/console.log | grep -iE "syncBlock|insertBlock|blockNum|ledger|height|blocksSync" | head -30
