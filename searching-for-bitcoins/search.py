# Idea: Calculate hashes (precalculate or on the fly)
# and compare to list with current balances: http://addresses.loyce.club/
# from: https://bitcointalk.org/index.php?topic=5254914.0
import hashlib
import time
from bisect import bisect_left
from typing import List

from bitcoinaddress import Wallet

addresses_file = 'blockchair_bitcoin_addresses_and_balance_LATEST.tsv'
#addresses_file = 'test_addresses.tsv'

def get_addresses(private_hash: str) -> List[str]:
    wallet = Wallet(private_hash)
    parts = str(wallet).split('\n\n')[1].split('\n')
    addresses = [part.split(':')[1].strip() for part in parts[:-1]]
    return addresses


# Load current balances
start_time = time.time()
print('Loading current addresses with balance, this might take a while...')

with open(addresses_file) as read_file:
    content = read_file.read()
balance_addresses = [x.split('\t')[0].strip() for x in content.split('\n')]

print('Done loading', len(balance_addresses), 'addresses in',
      round(time.time() - start_time, 2), 's')
start_time = time.time()
print('First 5 addresses:', balance_addresses[:5], ', start sorting...')

balance_addresses.sort()

print('Sorting finished in', round(time.time() - start_time, 2),
      's, searching candidates...')


def binary_search(x):
    i = bisect_left(balance_addresses, x)
    if i != len(balance_addresses) and balance_addresses[i] == x:
        return i
    else:
        return -1


# Check candidates, line by line
candidate_file = 'cit0day-premium_pws.txt'
#candidate_file = 'ncsc_100k.txt'

count = 0
skip_count = 4391000
skip = True

with open(candidate_file, encoding='ascii', errors='ignore') as read_file:
    for line in read_file.readlines():
        count += 1
        if count == skip_count:
            skip = False
        if skip:
            continue

        word = line.strip()

        if count % 1000 == 0:
            print('count:', count, ', checking', word)

        private_hash = hashlib.sha256(bytes(word, 'ascii')).hexdigest()
        public_addresses = get_addresses(private_hash)

        for public_address in public_addresses:
            if binary_search(public_address) != -1:
                print('===> BOOM! public_address=', public_address,
                      'candidate=', word, 'private_hash=', private_hash)
                with open('found.txt', 'a') as write_file:
                    write_file.write(','.join([word, private_hash, public_address]) + '\n')

print('Done.')
