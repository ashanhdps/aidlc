# ✅ CORRECTED Postman Examples - UUID Format Required

## ⚠️ Important: All IDs Must Be UUIDs!

The application requires **UUID format** for ALL IDs including `kpiId`.

**UUID Format:** `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

---

## 📮 Corrected API Examples

### 1️⃣ Provide Feedback (POST) - CORRECTED

**URL:** `http://localhost:8081/api/v1/performance-management/feedback`

**Method:** `POST`

**Headers:**
```
Content-Type: application/json
X-User-Id: 550e8400-e29b-41d4-a716-446655440000
```

**Body (raw JSON) - CORRECTED:**
```json
{
  "receiverId": "550e8400-e29b-41d4-a716-446655440001",
  "kpiId": "770e8400-e29b-41d4-a716-446655440000",
  "kpiName": "Code Quality",
  "feedbackType": "POSITIVE",
  "contentText": "Excellent code reviews! Your attention to detail caught several bugs before production."
}
```

**Key Change:** `kpiId` is now a UUID: `770e8400-e29b-41d4-a716-446655440000` instead of `kpi-code-quality`

---

## 🔑 Test UUIDs - Copy These!

### Employee IDs
- **Alice (Developer):** `550e8400-e29b-41d4-a716-446655440000`
- **Bob (Developer):** `550e8400-e29b-41d4-a716-446655440001`
- **Charlie (Developer):** `550e8400-e29b-41d4-a716-446655440002`
- **Diana (Developer):** `550e8400-e29b-41d4-a716-446655440003`

### Manager IDs
- **John (Manager):** `660e8400-e29b-41d4-a716-446655440000`
- **Sarah (Manager):** `660e8400-e29b-41d4-a716-446655440001`

### KPI IDs (Use These UUIDs!)
- **Code Quality:** `770e8400-e29b-41d4-a716-446655440000`
- **Team Communication:** `770e8400-e29b-41d4-a716-446655440001`
- **Teamwork:** `770e8400-e29b-41d4-a716-446655440002`
- **Innovation:** `770e8400-e29b-41d4-a716-446655440003`
- **Delivery:** `770e8400-e29b-41d4-a716-446655440004`

---

## ✅ Complete Working Examples

### Example 1: Alice Gives Positive Feedback to Bob

**POST** `http://localhost:8081/api/v1/performance-management/feedback`

**Headers:**
```
Content-Type: application/json
X-User-Id: 550e8400-e29b-41d4-a716-446655440000
```

**Body:**
```json
{
  "receiverId": "550e8400-e29b-41d4-a716-446655440001",
  "kpiId": "770e8400-e29b-41d4-a716-446655440000",
  "kpiName": "Code Quality",
  "feedbackType": "POSITIVE",
  "contentText": "Excellent code reviews! Your attention to detail caught several bugs before production."
}
```

**Expected Response:** `201 Created`
```json
{
  "message": "Feedback provided successfully",
  "feedbackId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "giverId": "550e8400-e29b-41d4-a716-446655440000",
  "receiverId": "550e8400-e29b-41d4-a716-446655440001",
  "status": "CREATED"
}
```

---

### Example 2: Manager Gives Constructive Feedback

**POST** `http://localhost:8081/api/v1/performance-management/feedback`

**Headers:**
```
Content-Type: application/json
X-User-Id: 660e8400-e29b-41d4-a716-446655440000
```

**Body:**
```json
{
  "receiverId": "550e8400-e29b-41d4-a716-446655440001",
  "kpiId": "770e8400-e29b-41d4-a716-446655440001",
  "kpiName": "Team Communication",
  "feedbackType": "CONSTRUCTIVE",
  "contentText": "Good progress on documentation. Consider adding more examples in your technical specs to help new team members."
}
```

---

### Example 3: Developmental Feedback

**POST** `http://localhost:8081/api/v1/performance-management/feedback`

**Headers:**
```
Content-Type: application/json
X-User-Id: 660e8400-e29b-41d4-a716-446655440000
```

**Body:**
```json
{
  "receiverId": "550e8400-e29b-41d4-a716-446655440002",
  "kpiId": "770e8400-e29b-41d4-a716-446655440003",
  "kpiName": "Innovation",
  "feedbackType": "DEVELOPMENTAL",
  "contentText": "Great potential in proposing new solutions. Let's work together on developing your technical leadership skills."
}
```

---

### Example 4: Get Bob's Feedback

**GET** `http://localhost:8081/api/v1/performance-management/feedback/employee/550e8400-e29b-41d4-a716-446655440001`

**Headers:** (none required)

---

### Example 5: Acknowledge Feedback

**PUT** `http://localhost:8081/api/v1/performance-management/feedback/{feedbackId}/acknowledge`

Replace `{feedbackId}` with the actual ID from the POST response.

---

### Example 6: Respond to Feedback

**POST** `http://localhost:8081/api/v1/performance-management/feedback/{feedbackId}/responses`

**Headers:**
```
Content-Type: application/json
X-User-Id: 550e8400-e29b-41d4-a716-446655440001
```

**Body:**
```json
{
  "responseText": "Thank you for the feedback! I appreciate the recognition and will continue focusing on thorough code reviews."
}
```

---

### Example 7: Resolve Feedback

**PUT** `http://localhost:8081/api/v1/performance-management/feedback/{feedbackId}/resolve`

---

## 📋 Field Requirements Summary

| Field | Type | Format | Example |
|-------|------|--------|---------|
| `receiverId` | UUID | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` | `550e8400-e29b-41d4-a716-446655440001` |
| `kpiId` | UUID | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` | `770e8400-e29b-41d4-a716-446655440000` |
| `kpiName` | String | Any text | `Code Quality` |
| `feedbackType` | Enum | `POSITIVE`, `CONSTRUCTIVE`, `DEVELOPMENTAL` | `POSITIVE` |
| `contentText` | String | Max 5000 chars | `Excellent work...` |

---

## 🎯 Complete Test Workflow

### Step 1: Provide Feedback
```json
POST /feedback
{
  "receiverId": "550e8400-e29b-41d4-a716-446655440001",
  "kpiId": "770e8400-e29b-41d4-a716-446655440000",
  "kpiName": "Code Quality",
  "feedbackType": "POSITIVE",
  "contentText": "Great work!"
}
```
**→ Save the `feedbackId` from response**

### Step 2: Get Bob's Feedback
```
GET /feedback/employee/550e8400-e29b-41d4-a716-446655440001
```

### Step 3: Acknowledge Feedback
```
PUT /feedback/{feedbackId}/acknowledge
```

### Step 4: Bob Responds
```json
POST /feedback/{feedbackId}/responses
{
  "responseText": "Thank you!"
}
```

### Step 5: Resolve Feedback
```
PUT /feedback/{feedbackId}/resolve
```

---

## 💡 Postman Environment Variables

Set these in your Postman environment:

| Variable | Value |
|----------|-------|
| `baseUrl` | `http://localhost:8081/api/v1/performance-management` |
| `aliceId` | `550e8400-e29b-41d4-a716-446655440000` |
| `bobId` | `550e8400-e29b-41d4-a716-446655440001` |
| `charlieId` | `550e8400-e29b-41d4-a716-446655440002` |
| `managerId` | `660e8400-e29b-41d4-a716-446655440000` |
| `kpiCodeQuality` | `770e8400-e29b-41d4-a716-446655440000` |
| `kpiCommunication` | `770e8400-e29b-41d4-a716-446655440001` |
| `kpiTeamwork` | `770e8400-e29b-41d4-a716-446655440002` |

Then use: `{{baseUrl}}/feedback`, `{{aliceId}}`, `{{kpiCodeQuality}}`, etc.

---

## 🔧 Postman Test Script

Add this to your POST feedback request to automatically save the feedbackId:

```javascript
if (pm.response.code === 201) {
    var jsonData = pm.response.json();
    pm.environment.set("feedbackId", jsonData.feedbackId);
    console.log("✅ Feedback ID saved: " + jsonData.feedbackId);
}
```

---

## ❌ Common Errors Fixed

### Error: "Invalid UUID string: kpi-code-quality"
**Problem:** Using string instead of UUID for `kpiId`  
**Solution:** Use UUID format: `770e8400-e29b-41d4-a716-446655440000`

### Error: "Invalid UUID string: alice-001"
**Problem:** Using string instead of UUID for user IDs  
**Solution:** Use UUID format: `550e8400-e29b-41d4-a716-446655440000`

---

## 🎓 Quick Copy-Paste for Postman

### Positive Feedback (Ready to Use)
```json
{
  "receiverId": "550e8400-e29b-41d4-a716-446655440001",
  "kpiId": "770e8400-e29b-41d4-a716-446655440000",
  "kpiName": "Code Quality",
  "feedbackType": "POSITIVE",
  "contentText": "Excellent code reviews! Your attention to detail caught several bugs before production."
}
```

### Constructive Feedback (Ready to Use)
```json
{
  "receiverId": "550e8400-e29b-41d4-a716-446655440001",
  "kpiId": "770e8400-e29b-41d4-a716-446655440001",
  "kpiName": "Team Communication",
  "feedbackType": "CONSTRUCTIVE",
  "contentText": "Consider adding more details in your pull request descriptions to help reviewers understand the context."
}
```

### Response (Ready to Use)
```json
{
  "responseText": "Thank you for the feedback! I'll make sure to add more context in my PRs going forward."
}
```

---

## ✅ You're All Set!

Use the corrected examples above with **UUID format for all IDs** and your tests will work perfectly!

**Server:** `http://localhost:8081` ✅ Running  
**Ready to test!** 🚀
