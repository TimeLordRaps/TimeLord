# Use the official Node.js 18 image as a parent image
FROM node:18-alpine

# Install tmux
RUN apk update && apk add tmux

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to work directory
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Set the RUNNING_IN_DOCKER environment variable
ENV RUNNING_IN_DOCKER=true

# Expose port 3000 to access server
EXPOSE 3000

# Start the application
CMD ["npm", "run", "dev"]