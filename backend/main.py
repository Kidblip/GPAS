from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.utils.db import database, engine
from backend.utils import models
from backend.Routes.auth import router as auth_router
from backend.Routes.images import router as images_router
from backend.Routes.user import router as user_router
# Mount the 'static' folder at the root path


app = FastAPI(title="Graphical Password Backend", version="1.0.0")


# CORS (allow all for dev; restrict in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

# Startup/shutdown
@app.on_event("startup")
async def on_startup():
    models.metadata.create_all(engine)  # 👈 CREATE TABLES
    await database.connect()

@app.on_event("shutdown")
async def on_shutdown():
    await database.disconnect()

# Routers
app.include_router(auth_router)
app.include_router(images_router)
app.include_router(user_router)

@app.get("/health")
async def health():
    return {"status": "ok"}
