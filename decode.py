#!/usr/bin/env python3
import binascii
h = "12202f4368616e6e656c2f4170706c69636174696f6e2f456e646f7273656d656e74"
print(binascii.unhexlify(h).decode())
