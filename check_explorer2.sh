#!/bin/bash
docker exec explorer.mynetwork.com cat /opt/explorer/logs/console/console.log | grep -iE "sync|discover|block|insert|channel" | head -40
