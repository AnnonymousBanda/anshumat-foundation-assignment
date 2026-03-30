from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv
load_dotenv()

from db.prisma_client import db
from router.imports import auth_router, form_router

@asynccontextmanager
async def lifespan(_app: FastAPI):
    await db.connect()
    try:
        yield
    finally:
        await db.disconnect()

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(form_router)

@app.get("/")
async def root():
    return {"message": "Server is running"}


def get_port() -> int:
    raw_port = os.getenv("PORT", "8000")
    try:
        return int(raw_port)
    except ValueError:
        return 8000


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("server:app", host="0.0.0.0", port=get_port(), reload=True)

