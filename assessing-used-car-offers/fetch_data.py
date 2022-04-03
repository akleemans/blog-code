# Fetch data from occasionen.caroffer.ch
import datetime
import json

import requests


def get_price(p: str) -> int:
    p = p.replace('CHF ', '').replace("'", '').replace('.-', '') \
        .replace('.–', '').strip()
    if p == '':
        return 0
    else:
        return int(p)


url = 'https://occasionen.caroffer.ch/skoda_de.php#group=group1&modelfilter=octavia&yearfilter=&pricefilter=&mainsortfilter=year_asc&leasingfilter=0&dwafilter=0&fuelfilter=&drivetypefilter=&transmissionfilter=&psfilter=&kmfilter=&bodyfilter=&mainpagination=0-50'
content = requests.get(url).text

items = content.split('class="object-list-item">')[1:]
entries = []

for item in items:
    if 'OCTAVIA' not in item:
        continue

    link = item.split('<a href="')[1].split('"')[0]
    print('Checking', link)

    mileage = item.split('mileage')[1].split('>')[2].split('<')[0]
    mileage = mileage.replace("'", '').replace(' km', '')
    mileage = int(mileage)

    registration = \
        item.split('a_firstreg desktop-only')[1].split('>')[1].split('<')[0]
    month, year = registration.split('.')
    now = datetime.datetime.now()

    years = now.year - int(year)
    months = now.month - int(month)
    age = years * 12 + months

    price = item.split('prop-list-item price')[1].split('>')[2].split('<')[0]
    price = get_price(price)

    single_car = requests.get(link).text
    if 'Fahrzeug ist nicht verfügbar' in single_car:
        print('Ingoring unavailable entry.')
        continue

    price_original = single_car.split('Neupreis')[1].split('>')[2].split('<')[0]
    price_original = get_price(price_original)

    if price_original == 0:
        print('Ingoring entry with empty original price.')
        continue
    else:
        price_percent = price / price_original

    entry = {}
    entry['link'] = link
    entry['mileage'] = mileage
    entry['age'] = age
    entry['price_percent'] = price_percent
    entry['price'] = price
    entry['price_original'] = price_original
    entries.append(entry)

with open('octavia.json', 'w') as write_file:
    write_file.write(json.dumps(entries))
