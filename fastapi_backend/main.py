from fastapi import FastAPI
from motor.motor_asyncio import AsyncIOMotorClient
import os
from fastapi import HTTPException
from fastapi.encoders import jsonable_encoder
from bson.objectid import ObjectId
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Intialise FastAPI app
app = FastAPI()

# MongoDB connection
MONGODB_URI = os.getenv("MONGODB_URI")
client = AsyncIOMotorClient(MONGODB_URI)
db = client["test"]  # Specify your MongoDB database name


# Root endpoint
@app.get("/")
async def read_root():
    return {"message": "Welcome to the FastAPI ESG Demo System!"}


@app.get("/test-connection")
async def test_connection():
    # Try to retrieve a single document from companies collection
    company = await db["companies"].find_one()
    if company:
        return {
            "message": "Connection to MongoDB is successful!",
            "company": jsonable_encoder(company, custom_encoder={ObjectId: str}),
        }
    raise HTTPException(status_code=404, detail="No data found in the collection")


@app.get("/list-databases/")
async def list_databases():
    databases = await client.list_database_names()
    return {"databases": databases}


@app.get("/list-collections/")
async def list_collections():
    collections = await db.list_collection_names()
    return {"collections": collections}
