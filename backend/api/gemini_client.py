import os
import json
import httpx
from typing import Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class GeminiClient:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("Gemini API key is required. Set GEMINI_API_KEY environment variable or pass it to the constructor.")
        
        # Updated to use the correct model name from the GeeksforGeeks article
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"
        self.model = "gemini-1.5-flash"  # Using the model from the article
    
    async def generate_content(self, prompt: str, context: str = "") -> str:
        """
        Generate content using the Gemini API via REST
        """
        # Fixed URL construction to avoid duplicate "models/"
        url = f"{self.base_url}/models/{self.model}:generateContent"
        
        # Prepare the full prompt with context
        full_prompt = f"""
        You are a helpful AI coding assistant. Based on the following code context, 
        answer the user's question. Be concise and helpful.

        CONTEXT:
        ---
        {context}
        ---

        QUESTION: {prompt}
        """
        
        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": full_prompt
                        }
                    ]
                }
            ]
        }
        
        headers = {
            "Content-Type": "application/json"
        }
        
        params = {
            "key": self.api_key
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=payload, headers=headers, params=params)
                print(f"[Gemini DEBUG] Status: {response.status_code}")
                print(f"[Gemini DEBUG] URL: {url}")
                print(f"[Gemini DEBUG] Response: {response.text[:200]}...")  # Truncate for readability
                response.raise_for_status()
                
                data = response.json()
                
                # Extract the generated text from the response
                if "candidates" in data and len(data["candidates"]) > 0:
                    candidate = data["candidates"][0]
                    if "content" in candidate and "parts" in candidate["content"]:
                        parts = candidate["content"]["parts"]
                        if len(parts) > 0 and "text" in parts[0]:
                            return parts[0]["text"]
                
                # Fallback if the response structure is different
                return "I apologize, but I couldn't generate a proper response. Please try again."
                
        except httpx.HTTPStatusError as e:
            print(f"[Gemini ERROR] HTTPStatusError: {e}")
            if e.response is not None:
                print(f"[Gemini ERROR] Response: {e.response.text}")
            if e.response.status_code == 400:
                return "I apologize, but your request couldn't be processed. Please check your question and try again."
            elif e.response.status_code == 403:
                return "I apologize, but there's an issue with the API access. Please check your API key."
            elif e.response.status_code == 404:
                return "I apologize, but the model endpoint was not found. This might be due to an incorrect model name or API version."
            else:
                return f"I apologize, but there was an error processing your request (HTTP {e.response.status_code})."
        except Exception as e:
            print(f"[Gemini ERROR] Exception: {e}")
            return f"I apologize, but there was an unexpected error: {str(e)}"

# Create a global instance
gemini_client = None

def get_gemini_client() -> Optional[GeminiClient]:
    """Get or create the Gemini client instance"""
    global gemini_client
    if gemini_client is None:
        try:
            gemini_client = GeminiClient()
        except ValueError:
            return None
    return gemini_client 