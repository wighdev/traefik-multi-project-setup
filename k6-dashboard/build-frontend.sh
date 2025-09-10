#!/bin/bash

echo "🔧 Building K6 Dashboard Frontend..."

cd frontend

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Please run this from the k6-dashboard directory."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the React app
echo "🏗️  Building React application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Frontend build completed successfully!"
    echo "📁 Build files are in: frontend/build/"
else
    echo "❌ Build failed!"
    exit 1
fi

cd ..

echo "🎉 K6 Dashboard is ready to deploy!"