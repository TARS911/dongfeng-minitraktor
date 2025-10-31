#!/bin/bash

echo "🚀 Starting DONGFENG Backend..."
echo "📂 Installing dependencies..."

cd backend
npm install

echo "✅ Dependencies installed!"
echo "🌐 Starting server..."

node server.js
