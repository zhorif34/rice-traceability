#!/bin/bash
docker exec explorer.mynetwork.com cat /opt/explorer/logs/console/console.log | grep -A2 "13:42\|13:43\|13:44\|13:45" | head -60
