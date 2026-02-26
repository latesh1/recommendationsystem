# SaaS Recommendation Platform: Developer Guide

Welcome to the Multi-Tenant Recommendation Engine. This guide provides everything you need to integrate your platform and start receiving high-quality, personalized recommendations for your users.

## 🚀 Integration Checklist
- [ ] Register your tenant via the Admin Panel or API.
- [ ] Secure your `apiKey` and `tenantId`.
- [ ] Sync your content metadata.
- [ ] Ingest user behavioral events (views, clicks, etc.).
- [ ] Fetch tailored recommendations in your feed.

## 🔑 Authentication
All API requests must include your unique API Key in the headers.

| Header | Description | Required |
| --- | --- | --- |
| `x-api-key` | Your secure SaaS API Key | Yes |
| `x-tenant-id` | Your Tenant ID (optional if API Key is unique) | Recommended |

---

## 📡 Core API Endpoints

### 1. Ingest Behavioral Events
Capture how your users interact with content.

**POST** `/api/interactions/track`

**Payload Example:**
```json
{
  "userId": "u123",
  "streamId": "s456",
  "type": "WATCH_TIME",
  "duration": 120,
  "percentage": 85,
  "metadata": { "category": "Gaming", "region": "Global" }
}
```

### 2. Fetch Personalized Feed
Retrieve optimized content rankings for a specific user.

**GET** `/api/recommendations/{userId}?limit=20`

**Response Example:**
```json
[
  "stream_id_101",
  "stream_id_202",
  "stream_id_303"
]
```

---

## 🛠 SDK Examples

### Node.js (Axios)
```javascript
const axios = require('axios');

const client = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: { 'x-api-key': 'YOUR_API_KEY' }
});

// Track a click
await client.post('/interactions/track', {
  userId: 'user_99',
  streamId: 'video_1001',
  type: 'CLICK'
});

// Get feed
const { data: feed } = await client.get('/recommendations/user_99');
```

### React (Fetch API)
```javascript
const fetchFeed = async (userId) => {
  const response = await fetch(`http://localhost:3000/api/recommendations/${userId}`, {
    headers: { 'x-api-key': 'YOUR_API_KEY' }
  });
  return await response.json();
};
```

---

## 📊 Analytics & Rate Limits
- **Starter Plan**: 1M events/month.
- **Enterprise Plan**: Custom limits + dedicated support.
- View real-time performance inside your **Client Dashboard**.

## 🛑 Error Codes
- `401 Unauthorized`: Missing or invalid API Key.
- `403 Forbidden`: Tenant suspended or usage quota exceeded.
- `500 Internal Error`: System-wide issue or malformed request.
