#!/bin/bash
docker exec explorer.mynetwork.com grep -E "saveBlock|saveTransaction|New Block" /opt/explorer/logs/console/console.log | tail -20
