import os

class Config:
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/recommendation_db')
    REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
    REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
    
    # Ranking Weights
    ENGAGEMENT_WEIGHT = 0.3
    WATCH_TIME_WEIGHT = 0.3
    RECENCY_WEIGHT = 0.2
    PERSONALIZATION_WEIGHT = 0.2
    
    # Candidate Generation Thresholds
    MAX_CANDIDATES = 1000
    TOP_N_RECOMMENDATIONS = 20
    
    # Diversity Settings
    MAX_SAME_CATEGORY = 2
    EXPLORATION_FACTOR = 0.1

    @classmethod
    def get_dynamic_config(cls, redis_client, key, default):
        try:
            val = redis_client.get(f"config:{key}")
            if val:
                import json
                return json.loads(val)
        except Exception as e:
            print(f"Error fetching config {key} from Redis: {e}")
        return default
