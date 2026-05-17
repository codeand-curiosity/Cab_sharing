import json
import random
from faker import Faker


fake=Faker('en_IN')

MIN_LAT, MAX_LAT = 24.5000, 24.6500
MIN_LON, MAX_LON = 80.7500, 80.9000

def generate_synthetic_hosts(num_hosts=10000):
    hosts = []
    print(f"🧬 Generating {num_hosts} synthetic host profiles...")
    
    for i in range(num_hosts):
        gender = random.choice(['M', 'F'])
        
        name = fake.first_name_male() if gender == 'M' else fake.first_name_female()
        
        
        if random.random() > 0.3:
            trust_score = round(random.uniform(4.5, 5.0), 1)
        else:
            trust_score = round(random.uniform(3.0, 4.4), 1)
            
      
        lat = round(random.uniform(MIN_LAT, MAX_LAT), 6)
        lon = round(random.uniform(MIN_LON, MAX_LON), 6)
        
        hosts.append({
            "host_id": f"H{str(i).zfill(5)}",
            "name": name,
            "gender": gender,
            "trust_score": trust_score,
            "lat": lat,
            "lon": lon
        })
        
   
    with open('hosts_db.json', 'w') as f:
        json.dump(hosts, f, indent=4)
        
    print("✅ Successfully generated 'hosts_db.json'!")

if __name__ == "__main__":
   
    generate_synthetic_hosts(10000)