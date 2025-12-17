# 📮 Postman Collection Import Guide

## ✅ Ready-to-Import Collection Created!

I've created a complete Postman collection with all API endpoints, test scripts, and environment variables.

---

## 🚀 How to Import into Postman

### Step 1: Open Postman

1. Launch Postman application
2. Click on **"Import"** button (top left)

### Step 2: Import the Collection

1. Click **"Upload Files"** or drag and drop
2. Select the file: **`Performance_Management_API.postman_collection.json`**
3. Click **"Import"**

### Step 3: Verify Import

You should see a new collection named **"Performance Management API"** with 5 folders:

1. ✅ **1. Feedback Management** (9 requests)
2. ✅ **2. Review Cycles** (2 requests)
3. ✅ **3. Self-Assessment (US-016)** (2 requests)
4. ✅ **4. Manager Assessment (US-017)** (3 requests)
5. ✅ **5. Health Check** (1 request)

**Total: 17 API requests ready to use!**

---

## 🎯 Quick Start Testing

### Test Sequence 1: Complete Feedback Workflow

Run these requests in order:

1. **1.1 Provide Positive Feedback** → Creates feedback, saves feedbackId
2. **1.4 Get Employee Feedback (Bob)** → View Bob's feedback
3. **1.6 Acknowledge Feedback** → Bob acknowledges it
4. **1.7 Respond to Feedback** → Bob responds
5. **1.8 Resolve Feedback** → Mark as resolved

### Test Sequence 2: Multiple Feedback Types

1. **1.1 Provide Positive Feedback** → Alice gives positive feedback
2. **1.2 Provide Constructive Feedback** → Manager gives constructive feedback
3. **1.3 Provide Developmental Feedback** → Manager gives developmental feedback
4. **1.4 Get Employee Feedback** → View all feedback

---

## 🔑 Pre-configured Variables

The collection includes these variables (already set!):

| Variable | Value | Description |
|----------|-------|-------------|
| `baseUrl` | `http://localhost:8081/api/v1/performance-management` | API base URL |
| `aliceId` | `550e8400-e29b-41d4-a716-446655440000` | Alice (Developer) |
| `bobId` | `550e8400-e29b-41d4-a716-446655440001` | Bob (Developer) |
| `charlieId` | `550e8400-e29b-41d4-a716-446655440002` | Charlie (Developer) |
| `managerId` | `660e8400-e29b-41d4-a716-446655440000` | John (Manager) |
| `kpiCodeQuality` | `770e8400-e29b-41d4-a716-446655440000` | Code Quality KPI |
| `kpiCommunication` | `770e8400-e29b-41d4-a716-446655440001` | Communication KPI |
| `kpiTeamwork` | `770e8400-e29b-41d4-a716-446655440002` | Teamwork KPI |
| `kpiInnovation` | `770e8400-e29b-41d4-a716-446655440003` | Innovation KPI |
| `feedbackId` | (auto-saved) | Saved from POST response |
| `cycleId` | `cycle-2024-q4` | Review cycle ID |

---

## ✨ Built-in Features

### 1. Automatic feedbackId Saving

When you run **"1.1 Provide Positive Feedback"**, the test script automatically saves the `feedbackId` to use in subsequent requests.

**Test Script (already included):**
```javascript
if (pm.response.code === 201) {
    var jsonData = pm.response.json();
    pm.environment.set("feedbackId", jsonData.feedbackId);
    console.log("✅ Feedback ID saved: " + jsonData.feedbackId);
}
```

### 2. Response Validation

Each request includes test scripts that validate:
- ✅ Correct HTTP status codes
- ✅ Response structure
- ✅ Required fields present

### 3. Console Logging

Check the Postman Console to see:
- Saved feedbackId values
- Test results
- Request/response details

---

## 📋 Collection Structure

### 1. Feedback Management (9 requests)
- **1.1** Provide Positive Feedback
- **1.2** Provide Constructive Feedback
- **1.3** Provide Developmental Feedback
- **1.4** Get Employee Feedback (Bob)
- **1.5** Get Specific Feedback Details
- **1.6** Acknowledge Feedback
- **1.7** Respond to Feedback
- **1.8** Resolve Feedback
- **1.9** Get Unresolved Feedback

### 2. Review Cycles (2 requests)
- **2.1** Get All Review Cycles
- **2.2** Get Specific Review Cycle

### 3. Self-Assessment (2 requests)
- **3.1** Submit Self-Assessment (US-016)
- **3.2** Get Self-Assessment

### 4. Manager Assessment (3 requests)
- **4.1** Submit Manager Assessment (US-017)
- **4.2** Get Manager Assessment
- **4.3** Get Assessment Comparison

### 5. Health Check (1 request)
- **5.1** API Health Check

---

## 🎓 Usage Tips

### Tip 1: Run Requests in Order

For the best experience, run requests in the numbered order within each folder.

### Tip 2: Check Console for Saved Variables

Open Postman Console (View → Show Postman Console) to see:
```
✅ Feedback ID saved: a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

### Tip 3: Use Collection Runner

1. Click on the collection name
2. Click **"Run"**
3. Select requests to run
4. Click **"Run Performance Management API"**

This will run all selected requests in sequence!

### Tip 4: View Variables

Click on the collection → **Variables** tab to see all pre-configured values.

### Tip 5: Duplicate Requests

Right-click any request → **Duplicate** to create variations with different data.

---

## 🔧 Customization

### Change User IDs

Edit the collection variables:
1. Click on collection name
2. Go to **Variables** tab
3. Update values as needed
4. Click **Save**

### Add New KPIs

Add new KPI UUID variables:
1. Go to Variables tab
2. Add new variable (e.g., `kpiDelivery`)
3. Set value (e.g., `770e8400-e29b-41d4-a716-446655440004`)
4. Use in requests: `{{kpiDelivery}}`

---

## ⚠️ Important Notes

### Review Cycle Endpoints

Requests in folders **3** and **4** (Self-Assessment and Manager Assessment) require a valid `cycleId`. 

These will return **404 Not Found** if no review cycle exists. Focus on **Feedback Management** (folder 1) for immediate testing.

### UUID Format Required

All IDs must be in UUID format:
- ✅ `550e8400-e29b-41d4-a716-446655440000`
- ❌ `alice-001` or `kpi-code-quality`

---

## 🐛 Troubleshooting

### Collection Not Showing

- Make sure you imported the `.json` file
- Check Collections tab (left sidebar)
- Try refreshing Postman

### Variables Not Working

- Click collection → Variables tab
- Verify all variables have values
- Click **Save** after any changes

### Requests Failing

1. Check server is running: `http://localhost:8081`
2. Run **5.1 API Health Check** first
3. Verify variable values are correct
4. Check Postman Console for errors

---

## 📊 Expected Results

### After Running "1.1 Provide Positive Feedback"

**Status:** `201 Created`

**Response:**
```json
{
  "message": "Feedback provided successfully",
  "feedbackId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "giverId": "550e8400-e29b-41d4-a716-446655440000",
  "receiverId": "550e8400-e29b-41d4-a716-446655440001",
  "status": "CREATED"
}
```

**Console:**
```
✅ Feedback ID saved: a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

### After Running "1.4 Get Employee Feedback"

**Status:** `200 OK`

**Response:**
```json
{
  "feedback": [
    {
      "feedbackId": "...",
      "giverId": "550e8400-e29b-41d4-a716-446655440000",
      "receiverId": "550e8400-e29b-41d4-a716-446655440001",
      "kpiId": "770e8400-e29b-41d4-a716-446655440000",
      "kpiName": "Code Quality",
      "feedbackType": "POSITIVE",
      "contentText": "Excellent code reviews!...",
      "status": "PENDING",
      "createdDate": "2024-12-16T...",
      "responseCount": 0
    }
  ],
  "totalCount": 1
}
```

---

## 🎉 You're All Set!

1. ✅ Import the collection
2. ✅ Verify 17 requests are loaded
3. ✅ Run **"1.1 Provide Positive Feedback"**
4. ✅ Check Console for saved feedbackId
5. ✅ Continue with other requests

**Happy Testing!** 🚀

---

## 📚 Additional Resources

- **POSTMAN_CORRECTED_EXAMPLES.md** - Detailed examples with explanations
- **API_DOCUMENTATION.md** - Complete API reference
- **API_TEST_SAMPLES.md** - curl command examples

---

**Collection File:** `Performance_Management_API.postman_collection.json`  
**Server:** `http://localhost:8081` ✅ Running  
**Ready to Import!** 📮
