# Inspired by https://bitcoin.stackexchange.com/a/3170
import hashlib

from bitcoinaddress import Wallet

word = '777'

# 1. Create hash
# -> 30caae2fcb7c34ecadfddc45e0a27e9103bd7cfc87730d7818cc096b1266a683
private_hash = hashlib.sha256(bytes(word, 'ascii')).hexdigest()
print('private_hash:', private_hash)

# 2. Create public wallet key
# -> 1TnnhMEgic5g4ttrCQyDopwqTs4hheuNZ
wallet = Wallet(private_hash)
print('wallet:', wallet)

parts = str(wallet).split('\n\n')[1].split('\n')
print('parts:', parts)

addresses = [part.split(':')[1].strip() for part in parts[:-1]]
print('public addresses:', addresses)

# 3. Check blockchain for current balance
# print('Open https://blockchain.info/rawaddr/')
