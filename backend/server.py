from fastapi import FastAPI
from contextlib import asynccontextmanager
from dotenv import load_dotenv
load_dotenv()

from db.prisma_client import db
from router.user_router import router as user_router


@asynccontextmanager
async def lifespan(_app: FastAPI):
    await db.connect()
    try:
        yield
    finally:
        await db.disconnect()


app = FastAPI(lifespan=lifespan)
app.include_router(user_router, prefix="/users", tags=["users"])


@app.get("/")
async def root():
    return {"message": "Hello World"}
