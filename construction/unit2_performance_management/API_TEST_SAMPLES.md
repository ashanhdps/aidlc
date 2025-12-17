# API Test Samples - Complete Payloads

## Quick Test Guide

Your server is running at: `http://localhost:8081`

---

## 🎯 Scenario 1: Provide Feedback (US-019)

### Employee "Alice" gives positive feedback to "Bob"

**Windows CMD:**
```cmd
curl -X POST http://localhost:8081/api/v1/performance-management/feedback ^
  -H "Content-Type: application/json" ^
  -H "X-User-Id: alice-001" ^
  -d "{\"receiverId\":\"bob-002\",\"kpiId\":\"kpi-code-quality\",\"kpiName\":\"Code Quality\",\"feedbackType\":\"POSITIVE\",\"contentText\":\"Excellent code reviews! Your attention to detail caught several bugs before production.\"}"
```

**Windows PowerShell:**
```powershell
curl -X POST http://localhost:8081/api/v1/performance-management/feedback `
  -H "Content-Type: application/json" `
  -H "X-User-Id: alice-001" `
  -d '{"receiverId":"bob-002","kpiId":"kpi-code-quality","kpiName":"Code Quality","feedbackType":"POSITIVE","contentText":"Excellent code reviews! Your attention to detail caught several bugs before production."}'
```

**Expected Response:**
```json
{
  "message": "Feedback provided successfully",
  "feedbackId": "feedback-abc123",
  "giverId": "alice-001",
  "receiverId": "bob-002",
  "status": "CREATED"
}
```

---

## 🎯 Scenario 2: Manager gives constructive feedback

**Windows CMD:**
```cmd
curl -X POST http://localhost:8081/api/v1/performance-management/feedback ^
  -H "Content-Type: application/json" ^
  -H "X-User-Id: manager-john" ^
  -d "{\"receiverId\":\"bob-002\",\"kpiId\":\"kpi-communication\",\"kpiName\":\"Team Communication\",\"feedbackType\":\"CONSTRUCTIVE\",\"contentText\":\"Good progress on documentation. Consider adding more examples in your technical specs.\"}"
```

**Windows PowerShell:**
```powershell
curl -X POST http://localhost:8081/api/v1/performance-management/feedback `
  -H "Content-Type: application/json" `
  -H "X-User-Id: manager-john" `
  -d '{"receiverId":"bob-002","kpiId":"kpi-communication","kpiName":"Team Communication","feedbackType":"CONSTRUCTIVE","contentText":"Good progress on documentation. Consider adding more examples in your technical specs."}'
```

---

## 🎯 Scenario 3: Get All Feedback for Bob

**Windows CMD/PowerShell (same):**
```cmd
curl http://localhost:8081/api/v1/performance-management/feedback/employee/bob-002
```

**Expected Response:**
```json
{
  "feedback": [
    {
      "feedbackId": "feedback-abc123",
      "giverId": "alice-001",
      "receiverId": "bob-002",
      "kpiId": "kpi-code-quality",
      "kpiName": "Code Quality",
      "feedbackType": "POSITIVE",
      "contentText": "Excellent code reviews!...",
      "status": "PENDING",
      "createdDate": "2024-12-16T14:30:00",
      "responseCount": 0
    },
    {
      "feedbackId": "feedback-xyz789",
      "giverId": "manager-john",
      "receiverId": "bob-002",
      "kpiId": "kpi-communication",
      "kpiName": "Team Communication",
      "feedbackType": "CONSTRUCTIVE",
      "contentText": "Good progress on documentation...",
      "status": "PENDING",
      "createdDate": "2024-12-16T14:31:00",
      "responseCount": 0
    }
  ],
  "totalCount": 2
}
```

---

## 🎯 Scenario 4: Bob Acknowledges Feedback (US-020)

**Windows CMD:**
```cmd
curl -X PUT http://localhost:8081/api/v1/performance-management/feedback/feedback-abc123/acknowledge
```

**Expected Response:**
```json
{
  "message": "Feedback acknowledged successfully",
  "feedbackId": "feedback-abc123",
  "status": "ACKNOWLEDGED"
}
```

---

## 🎯 Scenario 5: Bob Responds to Feedback (US-020)

**Windows CMD:**
```cmd
curl -X POST http://localhost:8081/api/v1/performance-management/feedback/feedback-abc123/responses ^
  -H "Content-Type: application/json" ^
  -H "X-User-Id: bob-002" ^
  -d "{\"responseText\":\"Thank you Alice! I appreciate the feedback. I'll continue focusing on thorough code reviews.\"}"
```

**Windows PowerShell:**
```powershell
curl -X POST http://localhost:8081/api/v1/performance-management/feedback/feedback-abc123/responses `
  -H "Content-Type: application/json" `
  -H "X-User-Id: bob-002" `
  -d '{"responseText":"Thank you Alice! I appreciate the feedback. I will continue focusing on thorough code reviews."}'
```

**Expected Response:**
```json
{
  "message": "Response submitted successfully",
  "feedbackId": "feedback-abc123",
  "responderId": "bob-002",
  "status": "RESPONDED"
}
```

---

## 🎯 Scenario 6: Get Specific Feedback Details

**Windows CMD/PowerShell:**
```cmd
curl http://localhost:8081/api/v1/performance-management/feedback/feedback-abc123
```

**Expected Response:**
```json
{
  "feedbackId": "feedback-abc123",
  "giverId": "alice-001",
  "receiverId": "bob-002",
  "kpiId": "kpi-code-quality",
  "kpiName": "Code Quality",
  "feedbackType": "POSITIVE",
  "contentText": "Excellent code reviews!...",
  "status": "ACKNOWLEDGED",
  "createdDate": "2024-12-16T14:30:00",
  "responseCount": 1
}
```

---

## 🎯 Scenario 7: Resolve Feedback

**Windows CMD/PowerShell:**
```cmd
curl -X PUT http://localhost:8081/api/v1/performance-management/feedback/feedback-abc123/resolve
```

**Expected Response:**
```json
{
  "message": "Feedback resolved successfully",
  "feedbackId": "feedback-abc123",
  "status": "RESOLVED"
}
```

---

## 🎯 Scenario 8: Get Unresolved Feedback

**Windows CMD/PowerShell:**
```cmd
curl http://localhost:8081/api/v1/performance-management/feedback/employee/bob-002/unresolved
```

**Expected Response:**
```json
{
  "feedback": [
    {
      "feedbackId": "feedback-xyz789",
      "giverId": "manager-john",
      "receiverId": "bob-002",
      "kpiId": "kpi-communication",
      "kpiName": "Team Communication",
      "feedbackType": "CONSTRUCTIVE",
      "contentText": "Good progress on documentation...",
      "status": "PENDING",
      "createdDate": "2024-12-16T14:31:00",
      "responseCount": 0
    }
  ],
  "totalCount": 1
}
```

---

## 🎯 Scenario 9: Submit Self-Assessment (US-016)

**Note:** This requires a review cycle to exist first. For now, this will return an error since we don't have cycles created yet.

**Windows CMD:**
```cmd
curl -X POST http://localhost:8081/api/v1/performance-management/cycles/cycle-2024-q4/participants/bob-002/self-assessment ^
  -H "Content-Type: application/json" ^
  -d "{\"kpiScores\":[{\"kpiId\":\"kpi-code-quality\",\"ratingValue\":4,\"achievementPercentage\":90.0,\"comment\":\"Delivered high-quality code with minimal bugs\"},{\"kpiId\":\"kpi-communication\",\"ratingValue\":5,\"achievementPercentage\":95.0,\"comment\":\"Improved team collaboration through better documentation\"}],\"comments\":\"Strong quarter with focus on code quality and team collaboration\",\"extraMileEfforts\":\"Mentored 2 junior developers, improved CI/CD pipeline\"}"
```

**Windows PowerShell:**
```powershell
curl -X POST http://localhost:8081/api/v1/performance-management/cycles/cycle-2024-q4/participants/bob-002/self-assessment `
  -H "Content-Type: application/json" `
  -d '{
    "kpiScores": [
      {
        "kpiId": "kpi-code-quality",
        "ratingValue": 4,
        "achievementPercentage": 90.0,
        "comment": "Delivered high-quality code with minimal bugs"
      },
      {
        "kpiId": "kpi-communication",
        "ratingValue": 5,
        "achievementPercentage": 95.0,
        "comment": "Improved team collaboration through better documentation"
      }
    ],
    "comments": "Strong quarter with focus on code quality and team collaboration",
    "extraMileEfforts": "Mentored 2 junior developers, improved CI/CD pipeline"
  }'
```

**Expected Response (if cycle exists):**
```json
{
  "message": "Self-assessment submitted successfully",
  "cycleId": "cycle-2024-q4",
  "participantId": "bob-002",
  "status": "SELF_ASSESSMENT_SUBMITTED"
}
```

---

## 🎯 Scenario 10: Submit Manager Assessment (US-017)

**Windows CMD:**
```cmd
curl -X POST http://localhost:8081/api/v1/performance-management/cycles/cycle-2024-q4/participants/bob-002/manager-assessment ^
  -H "Content-Type: application/json" ^
  -d "{\"kpiScores\":[{\"kpiId\":\"kpi-code-quality\",\"ratingValue\":4,\"achievementPercentage\":88.0,\"comment\":\"Consistently delivers quality code\"},{\"kpiId\":\"kpi-communication\",\"ratingValue\":5,\"achievementPercentage\":92.0,\"comment\":\"Excellent communicator and team player\"}],\"overallComments\":\"Strong performer with excellent technical and soft skills\"}"
```

**Windows PowerShell:**
```powershell
curl -X POST http://localhost:8081/api/v1/performance-management/cycles/cycle-2024-q4/participants/bob-002/manager-assessment `
  -H "Content-Type: application/json" `
  -d '{
    "kpiScores": [
      {
        "kpiId": "kpi-code-quality",
        "ratingValue": 4,
        "achievementPercentage": 88.0,
        "comment": "Consistently delivers quality code"
      },
      {
        "kpiId": "kpi-communication",
        "ratingValue": 5,
        "achievementPercentage": 92.0,
        "comment": "Excellent communicator and team player"
      }
    ],
    "overallComments": "Strong performer with excellent technical and soft skills"
  }'
```

**Expected Response (if cycle exists):**
```json
{
  "message": "Manager assessment submitted successfully",
  "cycleId": "cycle-2024-q4",
  "participantId": "bob-002",
  "finalScore": 4.5,
  "status": "MANAGER_ASSESSMENT_SUBMITTED"
}
```

---

## 🎯 Scenario 11: Check All Review Cycles

**Windows CMD/PowerShell:**
```cmd
curl http://localhost:8081/api/v1/performance-management/cycles
```

**Expected Response (empty initially):**
```json
{
  "cycles": [],
  "totalCount": 0
}
```

---

## 📋 Complete Test Workflow

### Step-by-Step Testing:

1. **Start with Feedback (works immediately):**
   ```cmd
   curl -X POST http://localhost:8081/api/v1/performance-management/feedback ^
     -H "Content-Type: application/json" ^
     -H "X-User-Id: alice-001" ^
     -d "{\"receiverId\":\"bob-002\",\"kpiId\":\"kpi-001\",\"kpiName\":\"Code Quality\",\"feedbackType\":\"POSITIVE\",\"contentText\":\"Great work!\"}"
   ```

2. **Check the feedback was created:**
   ```cmd
   curl http://localhost:8081/api/v1/performance-management/feedback/employee/bob-002
   ```

3. **Copy the feedbackId from response** (e.g., `feedback-abc123`)

4. **Acknowledge the feedback:**
   ```cmd
   curl -X PUT http://localhost:8081/api/v1/performance-management/feedback/feedback-abc123/acknowledge
   ```

5. **Respond to the feedback:**
   ```cmd
   curl -X POST http://localhost:8081/api/v1/performance-management/feedback/feedback-abc123/responses ^
     -H "Content-Type: application/json" ^
     -H "X-User-Id: bob-002" ^
     -d "{\"responseText\":\"Thank you for the feedback!\"}"
   ```

6. **Resolve the feedback:**
   ```cmd
   curl -X PUT http://localhost:8081/api/v1/performance-management/feedback/feedback-abc123/resolve
   ```

---

## 🔑 Key Points

### Feedback Types:
- `POSITIVE` - Positive reinforcement
- `CONSTRUCTIVE` - Areas for improvement
- `DEVELOPMENTAL` - Growth opportunities

### User IDs (you make these up):
- `alice-001`, `bob-002`, `charlie-003`
- `manager-john`, `manager-sarah`
- Any string works!

### KPI IDs (you make these up):
- `kpi-code-quality`
- `kpi-communication`
- `kpi-teamwork`
- `kpi-001`, `kpi-002`
- Any string works!

### Rating Values:
- Must be integers: `1`, `2`, `3`, `4`, or `5`

### Achievement Percentages:
- Must be decimals: `0.0` to `100.0`
- Examples: `85.5`, `92.0`, `100.0`

---

## ⚠️ Important Notes

1. **In-Memory Storage**: All data is lost when you restart the server
2. **No Authentication**: The `X-User-Id` header is trusted without validation
3. **Review Cycles**: Currently empty - you'd need to populate them through the demo or create an endpoint
4. **Feedback IDs**: Copy the actual `feedbackId` from responses to use in subsequent requests

---

## 🐛 Troubleshooting

**If you get "404 Not Found":**
- Check the URL is correct
- Make sure the server is running on port 8081

**If you get "400 Bad Request":**
- Check your JSON syntax (especially quotes and commas)
- Ensure all required fields are present

**If you get "500 Internal Server Error":**
- Check the server logs in your terminal
- The feedbackId or cycleId might not exist
