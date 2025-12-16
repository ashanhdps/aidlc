#!/bin/bash

echo "Installing dependencies for Unit 4 Frontend Application..."

# Remove existing node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Install dependencies
npm install

echo "Dependencies installed successfully!"
echo "To start the development server, run: npm run dev"