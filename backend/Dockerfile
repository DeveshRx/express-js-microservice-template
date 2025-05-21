# Use a lightweight Node.js base image
# Using a specific version and '-alpine' is recommended for smaller image sizes

FROM node:alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) to the working directory
# This step is crucial for leveraging Docker's build cache
# It ensures that npm install is only re-run if your dependencies change
COPY package*.json ./

# Install application dependencies
# Use 'npm ci' for clean and reproducible installs, especially in CI/CD
# For production, consider adding '--only=production' to only install production dependencies
RUN npm install
RUN npm ci --only=production
# RUN npm ci

# Copy the rest of your application code to the working directory
COPY . .

# Expose the port your Express.js application listens on
EXPOSE 3000

# Define the command to run your application
# 'node index.js' assumes your main application file is index.js
CMD [ "node", "app.js" ]