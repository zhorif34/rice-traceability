#!/bin/bash
docker logs --since 3m peer0.org1.example.com 2>&1 | grep -A 2 "018e\|018f\|0190\|0191\|0192\|0193\|0194\|0195\|0196\|0197\|0198\|0199" | tail -30
