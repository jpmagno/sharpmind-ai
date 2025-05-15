from fastapi import FastAPI
from app.api.endpoints import router

app = FastAPI(title="Sharpmind AI")

app.include_router(router, prefix="/api")

