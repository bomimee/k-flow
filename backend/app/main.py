# backend/app/main.py
from fastapi import FastAPI
from app.api.youtube import router as youtube_router
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(youtube_router)

#uvicorn app.main:app --reload
