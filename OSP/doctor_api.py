from fastapi import FastAPI
import requests
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app = FastAPI()


@app.get("/get-doctors")
def get_doctors(lat: float, lng: float):
    overpass_url = "https://overpass-api.de/api/interpreter"

    query = f"""
    [out:json];
    (
      node["amenity"="hospital"](around:5000,{lat},{lng});
      node["amenity"="clinic"](around:5000,{lat},{lng});
    );
    out;
    """

    response = requests.get(overpass_url, params={"data": query})
    data = response.json()

    doctors = []

    for place in data.get("elements", [])[:5]:
        doctors.append({
            "name": place.get("tags", {}).get("name", "Unknown Hospital"),
            "address": place.get("tags", {}).get("addr:full", "Address not available"),
            "lat": place.get("lat"),
            "lng": place.get("lon")
        })

    return {"doctors": doctors}