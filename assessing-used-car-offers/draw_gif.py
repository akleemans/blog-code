import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn import linear_model

# Data preparation

file = 'octavia_data_kkm.csv'
df = pd.read_csv(file)

X = df[['age', 'mileage']].values.reshape(-1, 2)
Y = df['price_percent']

# Prepare model data point for visualization

x = X[:, 0]
y = X[:, 1]
z = Y

x_pred = np.linspace(0, 91, 30)  # range of age values
y_pred = np.linspace(0, 150, 30)  # range of mileage values
xx_pred, yy_pred = np.meshgrid(x_pred, y_pred)
model_viz = np.array([xx_pred.flatten(), yy_pred.flatten()]).T

# Train

ols = linear_model.LinearRegression()
model = ols.fit(X, Y)
print('coef:', ols.coef_, 'intercept:', ols.intercept_)

predicted = model.predict(model_viz)
# print('predicted:', predicted)

# Evaluate

r2 = model.score(X, Y)

# Plot

plt.style.use('default')
fig = plt.figure(figsize=(4, 4))
ax = fig.add_subplot(111, projection='3d')
ax.plot(x, y, z, color='k', zorder=15, linestyle='none', marker='o', alpha=0.5)
ax.set_xlabel('Age (months)', fontsize=10)
ax.set_ylabel('Mileage (kkm)', fontsize=10)
ax.set_zlabel('Price (%)', fontsize=10)
ax.locator_params(nbins=4, axis='x')
ax.locator_params(nbins=5, axis='x')
ax.scatter(xx_pred.flatten(), yy_pred.flatten(), predicted,
           facecolor=(0, 0, 0, 0), s=20, edgecolor='#70b3f0')

for ii in np.arange(0, 360, 3):
    ax.view_init(elev=32, azim=ii)
    fig.savefig('gif/gif_image%d.png' % ii)
