#!/bin/bash
docker exec explorerdb.mynetwork.com psql -U postgres -d postgres -c "DROP DATABASE IF EXISTS fabricexplorer;"
docker exec explorerdb.mynetwork.com psql -U postgres -d postgres -c "CREATE DATABASE fabricexplorer OWNER hppoc;"
echo "Database reset done"
