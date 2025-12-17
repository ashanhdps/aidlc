# 📮 Postman Collection - Quick Reference

## ✅ Collection Created!

**File:** `Performance_Management_API.postman_collection.json`

---

## 🚀 3-Step Import Process

### 1. Open Postman
Launch Postman application

### 2. Import Collection
- Click **"Import"** button (top left)
- Select file: `Performance_Management_API.postman_collection.json`
- Click **"Import"**

### 3. Start Testing!
Run **"1.1 Provide Positive Feedback"** first

---

## 📦 What's Included

### 17 Ready-to-Use API Requests

#### 1. Feedback Management (9 requests)
- Provide Positive/Constructive/Developmental Feedback
- Get Employee Feedback
- Acknowledge, Respond, Resolve Feedback
- Get Unresolved Feedback

#### 2. Review Cycles (2 requests)
- Get All Cycles
- Get Specific Cycle

#### 3. Self-Assessment (2 requests)
- Submit Self-Assessment (US-016)
- Get Self-Assessment

#### 4. Manager Assessment (3 requests)
- Submit Manager Assessment (US-017)
- Get Manager Assessment
- Compare Assessments

#### 5. Health Check (1 request)
- API Health Check

---

## 🔑 Pre-configured Variables

All variables are already set! Just import and use.

**User IDs:**
- Alice: `550e8400-e29b-41d4-a716-446655440000`
- Bob: `550e8400-e29b-41d4-a716-446655440001`
- Charlie: `550e8400-e29b-41d4-a716-446655440002`
- Manager John: `660e8400-e29b-41d4-a716-446655440000`

**KPI IDs:**
- Code Quality: `770e8400-e29b-41d4-a716-446655440000`
- Communication: `770e8400-e29b-41d4-a716-446655440001`
- Teamwork: `770e8400-e29b-41d4-a716-446655440002`
- Innovation: `770e8400-e29b-41d4-a716-446655440003`

---

## ✨ Built-in Features

### ✅ Automatic Variable Saving
When you provide feedback, the `feedbackId` is automatically saved for use in subsequent requests.

### ✅ Response Validation
Each request includes test scripts that validate responses.

### ✅ Console Logging
Check Postman Console to see saved variables and test results.

---

## 🎯 Quick Test Workflow

### Complete Feedback Flow (5 steps)

1. **Provide Positive Feedback** → Creates feedback
2. **Get Employee Feedback** → View Bob's feedback
3. **Acknowledge Feedback** → Bob acknowledges
4. **Respond to Feedback** → Bob responds
5. **Resolve Feedback** → Mark as resolved

**Time:** ~2 minutes to complete all 5 steps!

---

## 📊 Expected First Response

After running **"1.1 Provide Positive Feedback"**:

```json
{
  "message": "Feedback provided successfully",
  "feedbackId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "giverId": "550e8400-e29b-41d4-a716-446655440000",
  "receiverId": "550e8400-e29b-41d4-a716-446655440001",
  "status": "CREATED"
}
```

**Console Output:**
```
✅ Feedback ID saved: a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

---

## 🐛 Troubleshooting

### Can't Find Collection After Import
- Check **Collections** tab (left sidebar)
- Look for "Performance Management API"

### Variables Not Working
- Click collection name → **Variables** tab
- Verify all values are present
- Click **Save**

### Requests Failing
1. Verify server is running: `http://localhost:8081`
2. Run **"5.1 API Health Check"** first
3. Check Postman Console for errors

---

## 📚 Documentation Files

1. **`Performance_Management_API.postman_collection.json`** ← Import this file
2. **`POSTMAN_IMPORT_GUIDE.md`** - Detailed import instructions
3. **`POSTMAN_CORRECTED_EXAMPLES.md`** - API examples with explanations
4. **`POSTMAN_COLLECTION_README.md`** - This file (quick reference)

---

## 💡 Pro Tips

### Tip 1: Use Collection Runner
Run multiple requests in sequence automatically:
1. Click collection name
2. Click **"Run"**
3. Select requests
4. Click **"Run Performance Management API"**

### Tip 2: View Console
Open Postman Console (View → Show Postman Console) to see:
- Saved variable values
- Test results
- Request/response details

### Tip 3: Duplicate Requests
Right-click any request → **Duplicate** to create variations.

---

## ✅ Checklist

- [ ] Import `Performance_Management_API.postman_collection.json`
- [ ] Verify 17 requests loaded
- [ ] Check Variables tab has all UUIDs
- [ ] Run "1.1 Provide Positive Feedback"
- [ ] Check Console for saved feedbackId
- [ ] Run "1.4 Get Employee Feedback"
- [ ] Complete the 5-step workflow

---

## 🎉 Ready to Test!

**Server:** `http://localhost:8081` ✅ Running  
**Collection:** Ready to import  
**Variables:** Pre-configured  
**Test Scripts:** Included  

**Import the collection and start testing!** 🚀

---

**Need Help?** See `POSTMAN_IMPORT_GUIDE.md` for detailed instructions.
