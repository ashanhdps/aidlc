# 🚀 Postman Quick Start Guide

## ✅ Your Setup Status

- **Server**: Running on `http://localhost:8081` ✅
- **Postman Collection**: Created and ready ✅
- **Variables**: All configured correctly ✅

---

## 🎯 How to Fix "No static resource" Error

This error happens when you access a URL without the proper API endpoint path.

### ✅ Solution: Use the Postman Collection

The collection has all URLs pre-configured correctly. Here's how:

---

## 📥 Step 1: Import the Collection

1. Open Postman
2. Click **Import** button (top left)
3. Select **File** tab
4. Browse to: `construction/unit2_performance_management/Performance_Management_API.postman_collection.json`
5. Click **Import**

---

## 🔍 Step 2: Verify Collection Variables

After importing:

1. Click on **Performance Management API** collection name
2. Go to **Variables** tab
3. Verify `baseUrl` shows:
   ```
   http://localhost:8081/api/v1/performance-management
   ```

If it's different, update it and click **Save**.

---

## 🧪 Step 3: Test with Simple Request

### Test: Get All Review Cycles

1. In the collection, expand **"2. Review Cycles"** folder
2. Click **"2.1 Get All Review Cycles"**
3. Click **Send**

**Expected Response:**
```json
{
  "cycles": [],
  "totalCount": 0
}
```

✅ If you get this response → Your setup is working!

❌ If you get "No static resource" → Check the URL in the request

---

## 📝 Step 4: Create Your First Feedback

### Test: Provide Positive Feedback

1. Expand **"1. Feedback Management"** folder
2. Click **"1.1 Provide Positive Feedback"**
3. Click **Send**

**Expected Response:** `201 Created`
```json
{
  "message": "Feedback provided successfully",
  "feedbackId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "giverId": "550e8400-e29b-41d4-a716-446655440000",
  "receiverId": "550e8400-e29b-41d4-a716-446655440001",
  "status": "CREATED"
}
```

The `feedbackId` is automatically saved to collection variables for use in other requests!

---

## 🔧 Common Issues & Fixes

### Issue 1: "No static resource" Error

**Cause:** Wrong URL format

**Check:** Open the request and look at the URL bar. It should show:
```
{{baseUrl}}/feedback
```

NOT:
```
http://localhost:8081/feedback
/feedback
feedback
```

**Fix:** 
1. Delete the collection
2. Re-import the JSON file
3. Verify variables are set

---

### Issue 2: "Invalid UUID string" Error

**Cause:** Using string IDs instead of UUIDs

**Fix:** The collection already has correct UUIDs in variables. Make sure you're using:
- `{{aliceId}}` not `"alice-001"`
- `{{bobId}}` not `"bob-001"`
- `{{kpiCodeQuality}}` not `"kpi-code-quality"`

---

### Issue 3: 404 Not Found

**Cause:** Endpoint doesn't exist or typo in URL

**Fix:** Use the pre-configured requests in the collection. They all have correct URLs.

---

## 📋 All Available Requests in Collection

### 1️⃣ Feedback Management (9 requests)
- ✅ 1.1 Provide Positive Feedback
- ✅ 1.2 Provide Constructive Feedback
- ✅ 1.3 Get Bob's Feedback
- ✅ 1.4 Get Specific Feedback
- ✅ 1.5 Acknowledge Feedback
- ✅ 1.6 Respond to Feedback
- ✅ 1.7 Resolve Feedback
- ✅ 1.8 Get Unresolved Feedback
- ✅ 1.9 Provide Feedback on Teamwork

### 2️⃣ Review Cycles (2 requests)
- ✅ 2.1 Get All Review Cycles
- ✅ 2.2 Get Specific Cycle

### 3️⃣ Self-Assessment (2 requests)
- ✅ 3.1 Submit Self-Assessment
- ✅ 3.2 Submit Self-Assessment (Multiple KPIs)

### 4️⃣ Manager Assessment (3 requests)
- ✅ 4.1 Submit Manager Assessment
- ✅ 4.2 Submit Manager Assessment (Multiple KPIs)
- ✅ 4.3 Complete Review Cycle

### 5️⃣ Health Check (1 request)
- ✅ 5.1 Health Check

---

## 🎓 Recommended Testing Order

Test in this order to verify everything works:

1. **Health Check** → Verify server is running
2. **Get All Cycles** → Verify API is accessible
3. **Provide Positive Feedback** → Create first feedback
4. **Get Bob's Feedback** → Retrieve the feedback you just created
5. **Acknowledge Feedback** → Update feedback status
6. **Respond to Feedback** → Add a response
7. **Resolve Feedback** → Mark as resolved

---

## 💡 Pro Tips

### Tip 1: Use Collection Runner
Run all requests at once:
1. Click collection name
2. Click **Run** button
3. Select requests to run
4. Click **Run Performance Management API**

### Tip 2: Check Postman Console
See actual requests being sent:
1. Click **Console** button (bottom left)
2. View request/response details
3. Check for URL issues

### Tip 3: Save Responses
After creating feedback:
1. The `feedbackId` is auto-saved to variables
2. Use it in subsequent requests like "Get Specific Feedback"
3. No need to copy-paste IDs manually!

---

## 🐛 Still Getting "No static resource"?

### Debug Checklist:

- [ ] Server is running (check terminal shows "Server started successfully")
- [ ] Imported the Postman collection (not creating requests manually)
- [ ] Collection variable `baseUrl` is set correctly
- [ ] Using requests from the collection (not typing URLs manually)
- [ ] Request URL shows `{{baseUrl}}/...` format

### Manual Test:

If collection doesn't work, try this manual request:

**URL:** `http://localhost:8081/api/v1/performance-management/cycles`  
**Method:** GET  
**Headers:** None needed

**Expected:** 
```json
{
  "cycles": [],
  "totalCount": 0
}
```

If this works but collection doesn't → Re-import the collection

If this doesn't work → Check server logs for errors

---

## 📞 Need More Help?

### Check Server Logs
Look at the terminal where the application is running. You should see:
```
Server started successfully. API available at: http://localhost:8081/api/v1/performance-management
```

### Verify Server is Responding
Open browser and go to:
```
http://localhost:8081/actuator/health
```

Should show: `{"status":"UP"}`

### Check Port
Make sure port 8081 is not blocked:
```cmd
netstat -ano | findstr :8081
```

---

## ✅ Success Indicators

You'll know everything is working when:

1. ✅ Health check returns `{"status":"UP"}`
2. ✅ Get All Cycles returns `{"cycles":[],"totalCount":0}`
3. ✅ Provide Feedback returns `201 Created` with a `feedbackId`
4. ✅ Get Bob's Feedback returns the feedback you just created

---

## 🎉 You're Ready!

Your server is running and the Postman collection is ready. Just import it and start testing!

**Next Steps:**
1. Import the collection
2. Run "Get All Cycles" to verify
3. Run "Provide Positive Feedback" to create data
4. Explore other endpoints

Happy testing! 🚀
