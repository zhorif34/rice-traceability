#!/bin/bash
docker exec explorer.mynetwork.com grep -iE "block|transaction" /opt/explorer/logs/console/console.log | tail -20
