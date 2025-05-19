#!/bin/bash

# Build backend
echo "Building backend..."
cd back
mvn clean package
cd ..

# Build frontend
echo "Building frontend..."
cd sleep-tracker
npm install
npm run build
cd ..

# Prepare files for Docker
echo "Preparing files for Docker..."
mkdir -p back/target
cp back/target/*.jar back/target/

mkdir -p sleep-tracker/.next
cp -r sleep-tracker/.next sleep-tracker/
cp -r sleep-tracker/public sleep-tracker/
cp sleep-tracker/package*.json sleep-tracker/
cp -r sleep-tracker/node_modules sleep-tracker/

echo "Files prepared. You can now run docker-compose build"