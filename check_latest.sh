#!/bin/bash
docker exec explorer.mynetwork.com cat /opt/explorer/logs/console/console.log | grep "15:05\|15:06\|15:07\|15:08" | head -30
