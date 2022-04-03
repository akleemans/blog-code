# Do linear regression on the car data
import numpy as np
import pandas as pd
import statsmodels.api as sm

df = pd.read_csv('octavia_data_kkm.csv')
x = np.array([df['age'].values, df['mileage'].values]).T
x = sm.add_constant(x)

y = np.array(df['price_percent'].values)

results = sm.OLS(endog=y, exog=x).fit()
print(results.summary())
