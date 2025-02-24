from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import recipes, suggestions, customer_chat
import uvicorn
from db.base import init_db


app = FastAPI()

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
app.include_router(customer_chat.router)

@app.on_event("startup")
async def startup():
    await init_db()

if __name__ == "__main__":
    print("Starting server")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)