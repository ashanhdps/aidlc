# UUID Reference for Testing

## What are UUIDs?

UUIDs (Universally Unique Identifiers) are 128-bit identifiers that look like this:
```
550e8400-e29b-41d4-a716-446655440000
```

Format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` (8-4-4-4-12 hexadecimal digits)

## Test User UUIDs

Use these UUIDs for testing (they're made up but valid format):

### Employees:
- **Alice** (Developer): `550e8400-e29b-41d4-a716-446655440000`
- **Bob** (Developer): `550e8400-e29b-41d4-a716-446655440001`
- **Charlie** (Developer): `550e8400-e29b-41d4-a716-446655440002`
- **Diana** (Developer): `550e8400-e29b-41d4-a716-446655440003`

### Managers:
- **John** (Manager): `660e8400-e29b-41d4-a716-446655440000`
- **Sarah** (Manager): `660e8400-e29b-41d4-a716-446655440001`

## Quick Test Commands

### 1. Alice gives feedback to Bob:
```cmd
curl -X POST http://localhost:8081/api/v1/performance-management/feedback ^
  -H "Content-Type: application/json" ^
  -H "X-User-Id: 550e8400-e29b-41d4-a716-446655440000" ^
  --data @test-payloads/provide-feedback.json
```

### 2. Manager John gives constructive feedback to Bob:
```cmd
curl -X POST http://localhost:8081/api/v1/performance-management/feedback ^
  -H "Content-Type: application/json" ^
  -H "X-User-Id: 660e8400-e29b-41d4-a716-446655440000" ^
  --data @test-payloads/provide-feedback-constructive.json
```

### 3. Get all feedback for Bob:
```cmd
curl http://localhost:8081/api/v1/performance-management/feedback/employee/550e8400-e29b-41d4-a716-446655440001
```

### 4. Bob acknowledges feedback (replace FEEDBACK_ID with actual ID from response):
```cmd
curl -X PUT http://localhost:8081/api/v1/performance-management/feedback/FEEDBACK_ID/acknowledge
```

### 5. Bob responds to feedback:
```cmd
curl -X POST http://localhost:8081/api/v1/performance-management/feedback/FEEDBACK_ID/responses ^
  -H "Content-Type: application/json" ^
  -H "X-User-Id: 550e8400-e29b-41d4-a716-446655440001" ^
  --data @test-payloads/respond-to-feedback.json
```

### 6. Resolve feedback:
```cmd
curl -X PUT http://localhost:8081/api/v1/performance-management/feedback/FEEDBACK_ID/resolve
```

### 7. Get unresolved feedback for Bob:
```cmd
curl http://localhost:8081/api/v1/performance-management/feedback/employee/550e8400-e29b-41d4-a716-446655440001/unresolved
```

## Complete Test Workflow

```cmd
REM Step 1: Alice gives positive feedback to Bob
curl -X POST http://localhost:8081/api/v1/performance-management/feedback ^
  -H "Content-Type: application/json" ^
  -H "X-User-Id: 550e8400-e29b-41d4-a716-446655440000" ^
  --data @test-payloads/provide-feedback.json

REM Step 2: Check Bob's feedback
curl http://localhost:8081/api/v1/performance-management/feedback/employee/550e8400-e29b-41d4-a716-446655440001

REM Step 3: Copy the feedbackId from the response (e.g., "a1b2c3d4-e5f6-7890-abcd-ef1234567890")

REM Step 4: Bob acknowledges the feedback
curl -X PUT http://localhost:8081/api/v1/performance-management/feedback/a1b2c3d4-e5f6-7890-abcd-ef1234567890/acknowledge

REM Step 5: Bob responds to the feedback
curl -X POST http://localhost:8081/api/v1/performance-management/feedback/a1b2c3d4-e5f6-7890-abcd-ef1234567890/responses ^
  -H "Content-Type: application/json" ^
  -H "X-User-Id: 550e8400-e29b-41d4-a716-446655440001" ^
  --data @test-payloads/respond-to-feedback.json

REM Step 6: Resolve the feedback
curl -X PUT http://localhost:8081/api/v1/performance-management/feedback/a1b2c3d4-e5f6-7890-abcd-ef1234567890/resolve
```

## PowerShell Version

```powershell
# Step 1: Alice gives positive feedback to Bob
curl -X POST http://localhost:8081/api/v1/performance-management/feedback `
  -H "Content-Type: application/json" `
  -H "X-User-Id: 550e8400-e29b-41d4-a716-446655440000" `
  --data '@test-payloads/provide-feedback.json'

# Step 2: Check Bob's feedback
curl http://localhost:8081/api/v1/performance-management/feedback/employee/550e8400-e29b-41d4-a716-446655440001

# Step 3: Copy the feedbackId from the response

# Step 4: Bob acknowledges the feedback
curl -X PUT http://localhost:8081/api/v1/performance-management/feedback/FEEDBACK_ID/acknowledge

# Step 5: Bob responds to the feedback
curl -X POST http://localhost:8081/api/v1/performance-management/feedback/FEEDBACK_ID/responses `
  -H "Content-Type: application/json" `
  -H "X-User-Id: 550e8400-e29b-41d4-a716-446655440001" `
  --data '@test-payloads/respond-to-feedback.json'

# Step 6: Resolve the feedback
curl -X PUT http://localhost:8081/api/v1/performance-management/feedback/FEEDBACK_ID/resolve
```

## Generating Your Own UUIDs

### Online:
- Visit: https://www.uuidgenerator.net/
- Click "Generate" to get new UUIDs

### Command Line:

**PowerShell:**
```powershell
[guid]::NewGuid()
```

**Linux/Mac:**
```bash
uuidgen
```

**Python:**
```python
import uuid
print(uuid.uuid4())
```

## Important Notes

1. **UUIDs are case-insensitive** but typically lowercase
2. **Format must be exact**: 8-4-4-4-12 hexadecimal digits with hyphens
3. **Use the same UUID consistently** for the same user across tests
4. **Copy actual feedback IDs** from responses - they're also UUIDs
5. **The system generates UUIDs** for feedback IDs automatically

## Common Errors

### ❌ Invalid UUID:
```
"emp-001"  // Too short, not UUID format
"12345"    // Not UUID format
```

### ✅ Valid UUID:
```
"550e8400-e29b-41d4-a716-446655440000"  // Correct format
```
