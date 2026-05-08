#!/bin/bash
docker exec explorerdb.mynetwork.com psql -U hppoc -d fabricexplorer -c "SELECT count(*) FROM blocks;"
