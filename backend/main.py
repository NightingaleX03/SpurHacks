from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router
from dotenv import load_dotenv
import os

load_dotenv()  # Load environment variables from .env file

app = FastAPI(
    title="StackSketch API",
    description="API backend for StackSketch architecture diagram and code analysis tool.",
    version="1.0.0"
)

# Get allowed origins from environment or use defaults
allowed_origins = [
    "http://localhost:4200",  # Angular dev server
    "https://stacksketch-frontend.onrender.com",  # Render frontend
    "https://stacksketch.onrender.com",  # Alternative frontend URL
]

# Add any additional origins from environment variable
if os.getenv("ADDITIONAL_ORIGINS"):
    additional_origins = os.getenv("ADDITIONAL_ORIGINS").split(",")
    allowed_origins.extend(additional_origins)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)