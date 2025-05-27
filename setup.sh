#!/bin/bash

echo "🚀 Starting Portal Setup..."

# Step 1: Clone repository (if needed)
# git clone https://github.com/your-repo/portal-admin.git
# cd portal-admin

# Step 2: Install dependencies
echo "📦 Installing dependencies..."
npm install

# Step 3: Copy .env template if missing
if [ ! -f .env.local ]; then
  echo "🔧 Setting up environment..."
  cp .env.example .env.local
  echo "✅ Please update your .env.local with Supabase credentials"
fi

# Step 4: Run development server
echo "🧪 Launching local server..."
npm run dev