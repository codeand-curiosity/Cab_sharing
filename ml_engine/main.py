from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import uvicorn
import pandas as pd
import json 
import math
app = FastAPI(title="TransitCore Carbon API")
print("🧠 Loading Random Forest Model...")
model = joblib.load('traffic_model.joblib')


class RideRequest(BaseModel):
    hour: int
    is_weekend: int
    is_raining: int
    distance_km: float
    vehicle_type: str  


EMISSION_FACTORS = {
    "Petrol": 0.165,
    "Diesel": 0.167,
    "EV": 0.050
}


@app.post("/calculate_savings")
def calculate_savings(ride: RideRequest):
    
    input_features = pd.DataFrame([{
        'hour': ride.hour,
        'is_weekend': ride.is_weekend,
        'is_raining': ride.is_raining
    }])
    
   
    predicted_multiplier = model.predict(input_features)[0]
 
   
    base_factor = EMISSION_FACTORS.get(ride.vehicle_type, 0.165)
    
 
    base_co2 = ride.distance_km * base_factor
    
    
    actual_co2_per_car = base_co2 * predicted_multiplier
    
   
    two_solo_cabs = actual_co2_per_car * 2
    detour_penalty=1.15
    one_shared_cab = actual_co2_per_car * detour_penalty
    total_saved = two_solo_cabs - one_shared_cab
    
    return {
        "status": "success",
        "predicted_traffic_multiplier": round(predicted_multiplier, 2),
        "actual_co2_emitted_kg": round(one_shared_cab, 2),
        "total_co2_saved_kg": round(total_saved, 2)
    }



class MatchRequest(BaseModel):
    passenger_gender: str  
    passenger_lat: float
    passenger_lon: float
    hour: int
    pink_protocol_active: bool


try:
    with open('hosts_db.json', 'r') as f:
        AVAILABLE_HOSTS = json.load(f)
    print(f"✅ Loaded {len(AVAILABLE_HOSTS)} active hosts into the grid.")
except FileNotFoundError:
    print("⚠️ WARNING: hosts_db.json not found! Did you run generate_hosts.py?")
    AVAILABLE_HOSTS = []


def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371 
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (math.sin(d_lat / 2) * math.sin(d_lat / 2) +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(d_lon / 2) * math.sin(d_lon / 2))
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


@app.post("/find_match")
def find_match(request: MatchRequest):
    
    eligible_hosts = []
    
    
    is_night = request.hour >= 20 or request.hour < 5
    strict_pink = request.pink_protocol_active or (request.passenger_gender == "F" and is_night)

    for host in AVAILABLE_HOSTS:
        
        if strict_pink and host["gender"] != "F":
            continue 
        
        if is_night and host['trust_score']<4.5:
            continue
            
        eligible_hosts.append(host)

    
    if not eligible_hosts:
        return {"status": "failed", "message": "No safe matches found matching your protocol criteria."}

    
   
    best_match = None
    shortest_distance = float('inf')
    MAX_RADIUS_KM = 5.0  
    
    for host in eligible_hosts:
        dist = calculate_distance(request.passenger_lat, request.passenger_lon, host["lat"], host["lon"])
        
        
        if dist <= MAX_RADIUS_KM and dist < shortest_distance:
            shortest_distance = dist
            best_match = host

    
    if best_match is None:
        return {"status": "failed", "message": f"No safe hosts available within {MAX_RADIUS_KM}km of your location."}
   
    is_rush_hour = request.hour in [8, 9, 17, 18, 19]
    discount_percentage = 40 if is_rush_hour else 20
    
    return {
        "status": "success",
        "match_found": True,
        "host_name": best_match["name"],
        "host_trust_score": best_match["trust_score"],
        "distance_to_host_km": round(shortest_distance, 2),
        "applied_protocol": "Pink Protocol (Strict Female-Only)" if strict_pink else "Standard",
        "co2_discount_offered": f"{discount_percentage}%"
    }


if __name__ == "__main__":
    print(" Starting TransitCore API on http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)