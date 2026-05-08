#!/bin/bash
docker logs rice-traceability-backend-1 2>&1 | grep -iE "error|fail|disconnect|wallet|connect" | tail -20
