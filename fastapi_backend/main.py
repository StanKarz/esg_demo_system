from fastapi import FastAPI, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorClient
import os
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
from bson.objectid import ObjectId
from dotenv import load_dotenv
from typing import List, Optional

load_dotenv()

# Intialise FastAPI app
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow React app's origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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


# Search endpoint
@app.get("/search")
async def search_companies(
    query: Optional[str] = Query(None, min_length=1),
    sectors: Optional[str] = Query(None),
    exchanges: Optional[str] = Query(None),
):
    # Build the search filter based on query, sectors, and exchanges
    search_filter = {}
    if query:
        search_filter["$or"] = [
            {"company_name": {"$regex": query, "$options": "i"}},
            {"company_introduction": {"$regex": query, "$options": "i"}},
        ]
    if sectors:
        sector_list = sectors.split(",")
        search_filter["sector"] = {"$in": sector_list}
    if exchanges:
        exchange_list = exchanges.split(",")
        search_filter["exchange"] = {"$in": exchange_list}

    # Execute the search on the companies collection
    results = await db["companies"].find(search_filter).to_list(100)
    if not results:
        raise HTTPException(status_code=404, detail="No companies found")

    return jsonable_encoder(results, custom_encoder={ObjectId: str})
