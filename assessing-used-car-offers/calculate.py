# Example usages of the linear regression parameters

def calculate(age, mileage):
    return 0.83015 - 0.0032555 * age - 2.101e-06 * mileage


def calculate_sklearn(age, mileage):
    return 0.8389196635376021 - 3.58489815e-03 * age - 2.08519818e-06 * mileage


print('Expected price:', calculate(58, 62309) * 39890)
print('Expected price sklearn:', calculate_sklearn(58, 62309) * 39890)
