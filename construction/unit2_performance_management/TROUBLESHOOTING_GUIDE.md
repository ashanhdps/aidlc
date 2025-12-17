# 🔧 Troubleshooting Guide - "No static resource" Error

## ❌ Error: "An unexpected error occurred: No static resource"

This error means you're trying to access a URL that doesn't have an API endpoint.

---

## ✅ Common Causes & Solutions

### 1. Accessing Root URL

**❌ Wrong:**
```
http://localhost:8081/
```

**✅ Correct:**
```
http://localhost:8081/api/v1/performance-management/feedback
```

**Solution:** Always include the full API path starting with `/api/v1/performance-management`

---

### 2. Missing API Prefix

**❌ Wrong:**
```
http://localhost:8081/feedback
```

**✅ Correct:**
```
http://localhost:8081/api/v1/performance-management/feedback
```

**Solution:** Use the complete base URL: `http://localhost:8081/api/v1/performance-management`

---

### 3. Typo in Endpoint

**❌ Wrong:**
```
http://localhost:8081/api/v1/performance-management/feedbacks
```

**✅ Correct:**
```
http://localhost:8081/api/v1/performance-management/feedback
```

**Solution:** Check spelling - it's `feedback` not `feedbacks`

---

### 4. Wrong HTTP Method

**❌ Wrong:**
```
GET http://localhost:8081/api/v1/performance-management/feedback
(without employee ID)
```

**✅ Correct:**
```
POST http://localhost:8081/api/v1/performance-management/feedback
(to create feedback)

OR

GET http://localhost:8081/api/v1/performance-management/feedback/employee/{employeeId}
(to get feedback)
```

**Solution:** Use the correct HTTP method for each endpoint

---

## 📋 Valid Endpoints Reference

### ✅ Feedback Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/performance-management/feedback` | Provide feedback |
| GET | `/api/v1/performance-management/feedback/employee/{employeeId}` | Get employee feedback |
| GET | `/api/v1/performance-management/feedback/{feedbackId}` | Get specific feedback |
| PUT | `/api/v1/performance-management/feedback/{feedbackId}/acknowledge` | Acknowledge feedback |
| POST | `/api/v1/performance-management/feedback/{feedbackId}/responses` | Respond to feedback |
| PUT | `/api/v1/performance-management/feedback/{feedbackId}/resolve` | Resolve feedback |
| GET | `/api/v1/performance-management/feedback/employee/{employeeId}/unresolved` | Get unresolved feedback |

### ✅ Review Cycle Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/performance-management/cycles` | Get all cycles |
| GET | `/api/v1/performance-management/cycles/{cycleId}` | Get specific cycle |
| POST | `/api/v1/performance-management/cycles/{cycleId}/participants/{participantId}/self-assessment` | Submit self-assessment |
| POST | `/api/v1/performance-management/cycles/{cycleId}/participants/{participantId}/manager-assessment` | Submit manager assessment |
| PUT | `/api/v1/performance-management/cycles/{cycleId}/complete` | Complete cycle |

---

## 🧪 Test Each Endpoint

### Test 1: Health Check (Should Work)

**URL:** `http://localhost:8081/actuator/health`  
**Method:** GET  
**Expected:** `{"status":"UP"}`

If this works, your server is running correctly.

---

### Test 2: Get All Cycles (Should Return Empty Array)

**URL:** `http://localhost:8081/api/v1/performance-management/cycles`  
**Method:** GET  
**Expected:** 
```json
{
  "cycles": [],
  "totalCount": 0
}
```

If this works, your API is accessible.

---

### Test 3: Provide Feedback (Should Create Feedback)

**URL:** `http://localhost:8081/api/v1/performance-management/feedback`  
**Method:** POST  
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
  "contentText": "Great work!"
}
```

**Expected:** `201 Created` with feedbackId

---

## 🔍 Debugging Steps

### Step 1: Verify Server is Running

Check the terminal where you started the application. You should see:
```
Started PerformanceManagementApplication in X.XXX seconds
Server started successfully. API available at: http://localhost:8081/api/v1/performance-management
```

### Step 2: Test Base URL

Try accessing: `http://localhost:8081/actuator/health`

- ✅ If it works → Server is running
- ❌ If it fails → Server is not running or wrong port

### Step 3: Check Full URL in Postman

Make sure your Postman request shows:
```
POST http://localhost:8081/api/v1/performance-management/feedback
```

NOT:
```
POST http://localhost:8081/feedback
POST http://localhost:8081/api/feedback
POST http://localhost:8081/performance-management/feedback
```

### Step 4: Verify HTTP Method

- POST for creating (feedback, assessments)
- GET for retrieving (feedback list, specific feedback)
- PUT for updating (acknowledge, resolve)

### Step 5: Check Postman Console

Open Postman Console (View → Show Postman Console) to see:
- Actual URL being called
- Request headers
- Response details

---

## 🎯 Quick Fix Checklist

- [ ] Server is running on port 8081
- [ ] Using full URL: `http://localhost:8081/api/v1/performance-management/...`
- [ ] Correct HTTP method (POST, GET, PUT)
- [ ] Correct endpoint path (no typos)
- [ ] Required headers included (Content-Type, X-User-Id)
- [ ] Valid JSON body for POST requests

---

## 💡 Common Mistakes in Postman

### Mistake 1: Wrong Base URL in Variables

**Check:** Collection Variables → `baseUrl`  
**Should be:** `http://localhost:8081/api/v1/performance-management`  
**NOT:** `http://localhost:8081`

### Mistake 2: Extra Slashes

**❌ Wrong:** `{{baseUrl}}//feedback`  
**✅ Correct:** `{{baseUrl}}/feedback`

### Mistake 3: Missing Headers

For POST requests, you need:
```
Content-Type: application/json
X-User-Id: {some-uuid}
```

---

## 📊 Expected Responses

### ✅ Success Responses

**200 OK** - GET requests
```json
{
  "feedback": [...],
  "totalCount": 1
}
```

**201 Created** - POST requests
```json
{
  "message": "Feedback provided successfully",
  "feedbackId": "...",
  "status": "CREATED"
}
```

### ❌ Error Responses

**404 Not Found** - Wrong URL or resource doesn't exist
```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "...",
    "status": 404
  }
}
```

**400 Bad Request** - Invalid data
```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Invalid UUID string: ...",
    "status": 400
  }
}
```

**"No static resource"** - Wrong URL (not an API endpoint)

---

## 🔧 Fix for Postman Collection

If you imported the collection and getting errors, verify:

### 1. Check Collection Variables

Click collection name → **Variables** tab

Verify `baseUrl` is:
```
http://localhost:8081/api/v1/performance-management
```

### 2. Check Request URLs

Each request should show:
```
{{baseUrl}}/feedback
{{baseUrl}}/cycles
{{baseUrl}}/feedback/employee/{{bobId}}
```

NOT:
```
http://localhost:8081/feedback
/feedback
feedback
```

### 3. Re-import Collection

If variables are wrong:
1. Delete the collection
2. Re-import `Performance_Management_API.postman_collection.json`
3. Verify variables are set correctly

---

## 🎓 Testing Order

Test in this order to verify everything works:

1. ✅ **Health Check** - `GET /actuator/health`
2. ✅ **Get All Cycles** - `GET /cycles`
3. ✅ **Provide Feedback** - `POST /feedback`
4. ✅ **Get Employee Feedback** - `GET /feedback/employee/{id}`
5. ✅ **Acknowledge Feedback** - `PUT /feedback/{id}/acknowledge`

If step 1 fails → Server not running  
If step 2 fails → Wrong base URL  
If step 3 fails → Check headers and body  

---

## 📞 Still Having Issues?

### Check Server Logs

Look at the terminal where the application is running for error messages.

### Verify Port

Make sure nothing else is using port 8081:
```cmd
netstat -ano | findstr :8081
```

### Restart Server

Stop the application (Ctrl+C) and restart it.

### Check Postman Console

View → Show Postman Console to see actual requests being sent.

---

## ✅ Working Example

Here's a complete working example you can copy-paste into Postman:

**URL:**
```
http://localhost:8081/api/v1/performance-management/feedback
```

**Method:** POST

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
  "contentText": "Excellent code reviews!"
}
```

**Expected Response:** 201 Created
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

**If this example works, your setup is correct!** 🎉

**If it doesn't work, check the server logs and verify the server is running.**
