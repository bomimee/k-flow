# backend/app/main.py
from fastapi import FastAPI
from app.api.youtube import router as youtube_router

app = FastAPI()
app.include_router(youtube_router)
