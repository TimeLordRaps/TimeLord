# Use the official Node.js 18 image as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to work directory
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Expose port 3000 to access server
EXPOSE 3000

# Command to run your app
CMD ["npm", "run", "dev"]
