import logging
import sys
import os

# Configure logging at the root level
logging.basicConfig(
    level=os.getenv('LOG_LEVEL', 'INFO'),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    force=True
)

# Explicitly configure the root logger to use sys.stdout
root_logger = logging.getLogger()
if not root_logger.handlers:
    root_logger.addHandler(logging.StreamHandler(sys.stdout))

# Create logger for this file
logger = logging.getLogger(__name__)

# Test log at startup
logger.info("FastAPI application starting up")

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from routes import recipes, suggestions
import uvicorn
from db.base import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up database connection")
    try:
        await init_db()
        logger.info("Database initialization successful")
    except Exception as e:
        logger.error(f"Database initialization failed: {str(e)}")
        raise
    yield

# Create the FastAPI app with the correct root_path
app = FastAPI(
    lifespan=lifespan,
    root_path="/prod" # if this works, get it from the ENV, from the terraform config
)

# Add error middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    # Add more detailed logging
    logger.info(f"Request: {request.method} {request.url.path} (Full URL: {request.url})")
    try:
        response = await call_next(request)
        logger.info(f"Response: {request.method} {request.url.path} - Status: {response.status_code}")
        return response
    except Exception as e:
        logger.error(f"Error: {request.method} {request.url.path} - {str(e)}")
        raise

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(recipes.router)
app.include_router(suggestions.router)

# Create the handler without the base_path since we're using root_path
handler = Mangum(app)

@app.get("/")
async def root():
    logger.info("Root endpoint called")
    return {"message": "Hello World"}

@app.get("/test")
async def test():
    logger.info("Test endpoint called")
    return {"status": "ok"}

if __name__ == "__main__":
    print("Starting server")
    uvicorn.run('main:app', host="0.0.0.0", port=8000, reload=True)
