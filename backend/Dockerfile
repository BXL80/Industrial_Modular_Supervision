# Use an official Node.js runtime as the base image
FROM node:14-alpine

# Set the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /backend

# Install any needed packages specified in package.json
RUN npm install

# Make port 8080 available to the world outside this container
EXPOSE 8080

# Run the command to start your app when the container launches
CMD ["npm", "start"]
