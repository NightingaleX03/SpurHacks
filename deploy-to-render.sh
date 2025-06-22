#!/bin/bash

echo "🚀 StackSketch Render Deployment Helper"
echo "========================================"
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Error: This directory is not a git repository."
    echo "Please initialize git and push your code to GitHub first."
    exit 1
fi

# Check if remote origin exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "❌ Error: No remote origin found."
    echo "Please add your GitHub repository as origin:"
    echo "git remote add origin https://github.com/yourusername/your-repo.git"
    exit 1
fi

echo "✅ Git repository found"
echo ""

# Check for required files
echo "📋 Checking required files..."

# Backend files
if [ ! -f "backend/requirements.txt" ]; then
    echo "❌ Missing: backend/requirements.txt"
    exit 1
fi

if [ ! -f "backend/main.py" ]; then
    echo "❌ Missing: backend/main.py"
    exit 1
fi

# Frontend files
if [ ! -f "client/package.json" ]; then
    echo "❌ Missing: client/package.json"
    exit 1
fi

if [ ! -f "client/angular.json" ]; then
    echo "❌ Missing: client/angular.json"
    exit 1
fi

echo "✅ All required files found"
echo ""

# Check for environment files
echo "🔧 Environment Configuration:"
if [ -f "client/src/environments/environment.prod.ts" ]; then
    echo "✅ Production environment file exists"
else
    echo "⚠️  Production environment file missing - will be created"
fi

echo ""

# Display deployment instructions
echo "📖 Deployment Instructions:"
echo "=========================="
echo ""
echo "1. 🎯 Deploy Backend API:"
echo "   - Go to https://dashboard.render.com"
echo "   - Click 'New +' → 'Web Service'"
echo "   - Connect your GitHub repository"
echo "   - Set root directory to: backend"
echo "   - Build Command: pip install -r requirements.txt"
echo "   - Start Command: uvicorn main:app --host 0.0.0.0 --port \$PORT"
echo "   - Add environment variable: GEMINI_API_KEY"
echo ""
echo "2. 🎨 Deploy Frontend:"
echo "   - Go to https://dashboard.render.com"
echo "   - Click 'New +' → 'Static Site'"
echo "   - Connect your GitHub repository"
echo "   - Set root directory to: client"
echo "   - Build Command: npm install && npm run build"
echo "   - Publish Directory: dist/stacksketch/browser"
echo ""
echo "3. 🔗 Update API URL:"
echo "   - After backend deployment, update:"
echo "   - client/src/environments/environment.prod.ts"
echo "   - Replace apiUrl with your backend URL"
echo ""
echo "4. 🚀 Deploy Frontend:"
echo "   - Deploy the frontend service"
echo "   - Your app will be live!"
echo ""

# Check if user wants to proceed
read -p "Do you want to check your current git status? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "📊 Current Git Status:"
    echo "====================="
    git status --porcelain
    echo ""
    echo "🌿 Current Branch: $(git branch --show-current)"
    echo "🔗 Remote URL: $(git remote get-url origin)"
    echo ""
fi

echo "🎉 Ready to deploy! Follow the instructions above."
echo ""
echo "📚 For detailed instructions, see: DEPLOYMENT.md"
echo "🆘 For help, check: https://docs.render.com" 