import matplotlib.pyplot as plt
import pandas as pd
from sklearn import linear_model

param = 'age'
param_text = 'Age (months)'
# param = 'mileage'
# param_text = 'Mileage (kkm)'

df = pd.read_csv('octavia_data_kkm.csv')

X = df[param].values.reshape(-1, 1)
y = df['price_percent'].values

# Train

ols = linear_model.LinearRegression()
model = ols.fit(X, y)
response = model.predict(X)

# Evaluate

r2 = model.score(X, y)

# Plot

plt.style.use('default')
plt.style.use('ggplot')

fig, ax = plt.subplots(figsize=(8, 4))

ax.plot(X, response, color='k', label='Regression model')
ax.scatter(X, y, edgecolor='k', facecolor='grey', alpha=0.8,
           label='Sample data')
ax.set_ylabel('Price (%)', fontsize=14)
ax.set_xlabel(param_text, fontsize=14)
ax.legend(facecolor='white', fontsize=11)
ax.set_title('$R^2= %.2f$' % r2, fontsize=18)

fig.tight_layout()
plt.show()
