#!/usr/bin/env python3
"""
Setup script for Gemini API key configuration
"""
import os
import sys

def create_env_file():
    """Create .env file with Gemini API key configuration"""
    env_content = """# Gemini API Configuration
# Get your API key from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# Other environment variables can be added here
"""
    
    env_file_path = os.path.join(os.path.dirname(__file__), '.env')
    
    if os.path.exists(env_file_path):
        print(f"⚠️  .env file already exists at: {env_file_path}")
        print("Please edit it manually to add your Gemini API key.")
        return
    
    try:
        with open(env_file_path, 'w') as f:
            f.write(env_content)
        print(f"✅ Created .env file at: {env_file_path}")
        print("📝 Please edit the file and replace 'your_gemini_api_key_here' with your actual Gemini API key")
        print("🔑 Get your API key from: https://makersuite.google.com/app/apikey")
    except Exception as e:
        print(f"❌ Error creating .env file: {e}")

def main():
    print("🚀 Gemini API Setup")
    print("=" * 50)
    
    # Check if .env already exists
    env_file_path = os.path.join(os.path.dirname(__file__), '.env')
    if os.path.exists(env_file_path):
        print(f"📁 .env file found at: {env_file_path}")
        
        # Check if API key is configured
        with open(env_file_path, 'r') as f:
            content = f.read()
            if 'your_gemini_api_key_here' in content:
                print("⚠️  API key not configured yet!")
                print("📝 Please edit the .env file and replace 'your_gemini_api_key_here' with your actual API key")
            else:
                print("✅ API key appears to be configured!")
    else:
        print("📁 No .env file found. Creating one...")
        create_env_file()
    
    print("\n📋 Next steps:")
    print("1. Get your Gemini API key from: https://makersuite.google.com/app/apikey")
    print("2. Edit the .env file and replace 'your_gemini_api_key_here' with your actual key")
    print("3. Restart the backend server")
    print("4. Test the diagram generation feature!")

if __name__ == "__main__":
    main() 