# Use an official Node.js runtime as the base image
FROM node:18-slim as build-stage

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY ./ .

# Copy the custom .env.docker file
COPY .env.production .env.production

# set the base URL environment variable
ENV BASE_URL=zora

# Build the Vue.js app
RUN npm run build

# Set a label
LABEL org.opencontainers.image.source https://github.com/sdss/zora
LABEL org.opencontainers.image.description "zora production image"

# Copy the files to mountable directory
RUN mkdir -p /app/html
CMD ["cp", "-r", "/app/dist/.", "/app/html"]
