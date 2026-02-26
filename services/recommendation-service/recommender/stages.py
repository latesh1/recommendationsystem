from pymongo import MongoClient
import numpy as np
from config import Config
import random
from bson import ObjectId

class RecommenderStages:
    def __init__(self, db, redis_client, tenant_id):
        self.db = db
        self.redis = redis_client
        self.tenant_id = tenant_id

    def _get_tenant_config(self, key, default):
        # Redis key format: tenant:{id}:{key}
        tenant_key = f"tenant:{self.tenant_id}:config:{key}"
        val = self.redis.get(tenant_key)
        return float(val) if val is not None else default

    def get_candidates(self, user_id):
        """Stage 1: Candidate Generation (Tenant-Specific)"""
        candidates = set()
        
        try:
            u_oid = ObjectId(user_id) if isinstance(user_id, str) else user_id
        except:
            print(f"[REC] Invalid User ID format: {user_id}")
            return []

        print(f"[REC] Fetching candidates for {u_oid} in tenant {self.tenant_id}")
        
        # 1. Content-Based (User Interests within Tenant)
        user = self.db.users.find_one({"_id": u_oid, "tenantId": self.tenant_id})
        
        if user and "interests" in user:

            print(f"[REC] User Interests: {user['interests']}")
            interest_streams = self.db.streams.find({
                "tenantId": self.tenant_id,
                "category": {"$in": user["interests"]},
                "isLive": True
            }).limit(200)
            for s in interest_streams:
                candidates.add(str(s["_id"]))

        # 2. Trending Streams (Tenant-Specific)
        trending = self.db.streams.find({
            "tenantId": self.tenant_id,
            "isLive": True
        }).sort("trendingScore", -1).limit(100)
        for s in trending:
            candidates.add(str(s["_id"]))

        print(f"[REC] Candidates generated: {len(candidates)}")
        return list(candidates)


    def rank_candidates(self, user_id, candidate_ids):
        """Stage 2: Ranking Model (Tenant-Specific Weights)"""
        if not candidate_ids:
            return []

        try:
            u_oid = ObjectId(user_id) if isinstance(user_id, str) else user_id
        except:
            u_oid = user_id

        # Only find streams belonging to this tenant
        streams = list(self.db.streams.find({
            "_id": {"$in": [ObjectId(cid) for cid in candidate_ids]},
            "tenantId": self.tenant_id
        }))
        user = self.db.users.find_one({"_id": u_oid, "tenantId": self.tenant_id})

        
        # Fetch weights from Redis using tenant prefix
        eng_w = self._get_tenant_config('engagement_weight', Config.ENGAGEMENT_WEIGHT)
        watch_w = self._get_tenant_config('watch_time_weight', Config.WATCH_TIME_WEIGHT)
        rec_w = self._get_tenant_config('recency_weight', Config.RECENCY_WEIGHT)
        pers_w = self._get_tenant_config('personalization_weight', Config.PERSONALIZATION_WEIGHT)

        ranked_list = []
        for stream in streams:
            score = 0
            engagement_score = stream.get("engagementRate", 0) / 1000
            score += eng_w * engagement_score

            viewer_score = min(stream.get("viewerCount", 0) / 10000, 1)
            score += watch_w * viewer_score

            if user and stream["category"] in user.get("interests", []):
                score += pers_w * 1.0
            
            score += rec_w * 0.5 

            ranked_list.append({
                "stream_id": str(stream["_id"]),
                "score": score,
                "category": stream.get("category", "Uncategorized"),
                "reason": "personalized_ranking"
            })

        return sorted(ranked_list, key=lambda x: x["score"], reverse=True)

    def rerank_and_filter(self, ranked_list, user_id):
        """Stage 3: Re-ranking (Tenant-Specific Diversity)"""
        max_same_cat = int(self._get_tenant_config('diversity_factor', Config.MAX_SAME_CATEGORY))
        explore_rate = self._get_tenant_config('exploration_rate', Config.EXPLORATION_FACTOR)
        
        final_list = []
        category_counts = {}
        
        discovery_pool = ranked_list[int(len(ranked_list)*0.3):] 
        primary_candidates = ranked_list[:int(len(ranked_list)*0.3)]

        for item in primary_candidates:
            cat = item["category"]
            if category_counts.get(cat, 0) < max_same_cat:
                final_list.append(item)
                category_counts[cat] = category_counts.get(cat, 0) + 1
            
            if len(final_list) >= Config.TOP_N_RECOMMENDATIONS * (1 - explore_rate):
                break

        if discovery_pool and explore_rate > 0:
            num_explore = int(Config.TOP_N_RECOMMENDATIONS * explore_rate)
            explorers = random.sample(discovery_pool, min(len(discovery_pool), num_explore))
            for item in explorers:
                item["reason"] = "discovery_boost"
                final_list.append(item)

        return final_list[:Config.TOP_N_RECOMMENDATIONS]
