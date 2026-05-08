#!/bin/bash
docker exec explorer.mynetwork.com cat /opt/explorer/logs/console/console.log | grep -A30 "15:05:52"
