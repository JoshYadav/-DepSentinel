import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split

# 1. READ THE CSV FILE AND PREPROCESS
df = pd.read_csv('network_data.csv')

# Handle missing values (drop any rows with missing data)
df = df.dropna()

X = df[['Packets']] 
y = df['Latency']

# 2. TRAIN / TEST SPLIT
# We split the data so we can train on one portion and test the model's accuracy on unseen data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 3. TRAIN THE ML MODEL
model = LinearRegression()
model.fit(X_train, y_train)

# Get predictions on the test set
y_pred = model.predict(X_test)

# 4. CALCULATE ERRORS
mae = mean_absolute_error(y_test, y_pred)
mse = mean_squared_error(y_test, y_pred)
rmse = np.sqrt(mse)
r2 = r2_score(y_test, y_pred)

print("--- NETWORK MODEL ERRORS (TEST SET) ---")
print(f"R-Squared (Accuracy): {r2:.4f}")
print(f"Mean Absolute Error (MAE): {mae:.2f}")
print(f"Mean Squared Error (MSE): {mse:.2f}")
print(f"Root Mean Squared Error (RMSE): {rmse:.2f}")

# ==========================================
# 5. VISUALIZATIONS (GRAPHS)
# ==========================================
plt.style.use('ggplot')

# GRAPH 1: The Baseline Model (Test Set vs Predictions)
plt.figure(figsize=(10, 5))
plt.scatter(X_test, y_test, alpha=0.6, label='Normal Traffic (Test Data)', color='blue')
plt.plot(X_test, y_pred, color='green', linewidth=2, label='Predicted Baseline (Regression Line)')
plt.title('Network Performance Baseline: Packets vs. Latency')
plt.xlabel('Total Packets')
plt.ylabel('Latency (ms)')
plt.legend()
plt.tight_layout()
plt.show()

# GRAPH 2: Error Metrics Comparison
plt.figure(figsize=(8, 5))
metrics_names = ['MAE', 'RMSE']
metrics_values = [mae, rmse] # Excluding MSE from graph as it's squared and ruins the scale
plt.bar(metrics_names, metrics_values, color=['#3498db', '#e74c3c'])
plt.title('Baseline Error Metrics (Lower is Better)')
plt.ylabel('Error Value')
for i, v in enumerate(metrics_values):
    plt.text(i, v + 2, f"{v:.2f}", ha='center', fontweight='bold')
plt.tight_layout()
plt.show()

# GRAPH 3: Anomaly Detection (Residuals)
plt.figure(figsize=(10, 5))

# Plot normal residuals (close to 0)
normal_residuals = y_test - y_pred
plt.scatter(range(len(normal_residuals)), normal_residuals, color='green', label='Normal Traffic', alpha=0.6)

# Let's inject a couple of fake "Attack" samples to show how anomaly detection would catch them
attack_X = pd.DataFrame({'Packets': [20, 50, 80]})
attack_y_actual = [3000, 4500, 5000] # Massive latency spikes
attack_y_pred = model.predict(attack_X)
attack_residuals = attack_y_actual - attack_y_pred

# Plot attack residuals (massive spikes)
plt.scatter(range(len(normal_residuals), len(normal_residuals) + len(attack_residuals)), attack_residuals, color='red', label='DoS Attack (Injected)', marker='x')

plt.axhline(0, color='black', linestyle='--')
plt.axhline(1000, color='orange', linestyle=':', label='Alert Threshold')
plt.title('Residual Analysis: Detecting the Attack')
plt.xlabel('Traffic Sample ID')
plt.ylabel('Residual Error (Actual Latency - Predicted)')
plt.legend()
plt.tight_layout()
plt.show()
