from fastapi import FastAPI
from api.routes import router

app = FastAPI(
    title="StackSketch API",
    description="API backend for StackSketch architecture diagram and code analysis tool.",
    version="1.0.0"
)

app.include_router(router)