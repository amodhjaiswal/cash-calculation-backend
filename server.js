require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const collectionRoutes = require("./routes/collection");
const AWS = require("aws-sdk");

const app = express();


// Set the region for AWS SDK
AWS.config.update({ region: process.env.AWS_REGION });

const secretsManager = new AWS.SecretsManager();

// Function to get secret from Secrets Manager
const getSecretValue = async (secretName) => {
  try {
    const data = await secretsManager.getSecretValue({ SecretId: secretName }).promise();
    if (data.SecretString) {
      return JSON.parse(data.SecretString);
    }
    throw new Error("Secret value is not a valid JSON string");
  } catch (err) {
    console.error("Error retrieving secret:", err);
    throw err;
  }
};

// Middleware
app.use(express.json());

// Middleware to allow cross-origin requests from CloudFront
app.use(cors({
  origin: process.env.CLOUDFRONT_DOMAIN,
}));

// Database Connection and Server Initialization
const initializeApp = async () => {
  try {
    const secrets = await getSecretValue(process.env.SECRET_NAME);  // Access secrets

    // Use the secret values directly
    mongoose
      .connect(secrets.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
      .then(() => console.log("Connected to MongoDB Atlas"))
      .catch((error) => console.error("MongoDB connection error:", error));

    // Routes
    app.use("/api/collection", collectionRoutes);

    // Start Server
    app.listen(secrets.PORT, () => console.log(`Server running on port ${secrets.PORT}`));

  } catch (error) {
    console.error("Error during initialization:", error);
  }
};

// Initialize the app
initializeApp();
