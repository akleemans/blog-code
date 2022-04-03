# Transform JSON to CSV
import csv
import json

with open('octavia.json') as read_file:
    content = json.loads(read_file.read())

age = [car['age'] for car in content]
mileage = [int(car['mileage']) / 1000 for car in content]
price_percent = [car['price_percent'] for car in content]

with open('octavia_data_kkm.csv', 'w', newline='') as csvfile:
    spamwriter = csv.writer(csvfile, delimiter=',', quotechar='"',
                            quoting=csv.QUOTE_MINIMAL)
    spamwriter.writerow(['age', 'mileage', 'price_percent'])
    for i in range(len(age)):
        if age[i] >= 12 and mileage[i] > 15:
            spamwriter.writerow([age[i], mileage[i], price_percent[i]])
