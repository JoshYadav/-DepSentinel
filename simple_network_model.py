import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error

# 1. GENERATE SYNTHETIC NETWORK DATA
np.random.seed(42)

# Packets per second (Input / X)
packets = np.random.randint(10, 500, 100) 

# Latency in ms (Output / y) - Normal latency increases with packets
latency = 3.0 * packets + np.random.normal(0, 50, 100) 

X = pd.DataFrame({'Packets': packets})
y = pd.Series(latency)

# 2. TRAIN THE ML MODEL
model = LinearRegression()
model.fit(X, y)

# Get predictions based on our model
y_pred = model.predict(X)

# 3. CALCULATE ERRORS
mae = mean_absolute_error(y, y_pred)
mse = mean_squared_error(y, y_pred)
rmse = np.sqrt(mse)

print("--- NETWORK MODEL ERRORS ---")
print(f"Mean Absolute Error (MAE): {mae:.2f}")
print(f"Mean Squared Error (MSE): {mse:.2f}")
print(f"Root Mean Squared Error (RMSE): {rmse:.2f}")

# 4. THE SIMPLEST POSSIBLE GRAPH
plt.scatter(X, y)                   # Blue dots = Actual Network Traffic
plt.plot(X, y_pred, color='black')  # Black line = ML Predicted Baseline
plt.title('Packets vs Latency')
plt.show()
