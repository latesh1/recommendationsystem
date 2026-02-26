import os
from flask import Flask, jsonify, request
from pymongo import MongoClient
import redis
import json
from config import Config
from recommender.stages import RecommenderStages
from bson import ObjectId

app = Flask(__name__)

# Connections
client = MongoClient(Config.MONGO_URI)
db = client.recommendation_db
cache = redis.Redis(host=Config.REDIS_HOST, port=Config.REDIS_PORT, decode_responses=True)

# RecommenderStages will be initialized per-request with tenant context
# recommender = RecommenderStages(db, cache)


@app.route('/<user_id>', methods=['GET'])
def get_recommendations(user_id):
    try:
        tenant_id = request.headers.get('x-tenant-id')
        if not tenant_id:
            return jsonify({"error": "x-tenant-id header required"}), 403

        # 1. Check Multi-Tenant Cache
        cache_key = f"tenant_v2:{tenant_id}:recs:{user_id}"
        cached_data = cache.get(cache_key)
        if cached_data:
            return jsonify(json.loads(cached_data))

        # 2. Generate Recommendations (Tenant-Aware)
        recommender = RecommenderStages(db, cache, tenant_id)
        uid = ObjectId(user_id)
        candidates = recommender.get_candidates(uid)
        ranked = recommender.rank_candidates(uid, candidates)
        final = recommender.rerank_and_filter(ranked, uid)

        # 3. Cache and Return
        results = final
        print(f"[REC] Returning {len(results)} items for {user_id}")
        if results:
            print(f"[REC] First item: {results[0]}")
            
        cache.setex(cache_key, 300, json.dumps(results)) # 5 mins cache

        return jsonify(results)


    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    port = int(os.getenv('RECOMMENDATION_SERVICE_PORT', 3004))
    app.run(host='0.0.0.0', port=port)
