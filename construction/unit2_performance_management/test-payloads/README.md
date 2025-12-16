# Test Payloads - JSON Files

These are clean JSON files you can use with curl to test the API.

## ⚠️ IMPORTANT: Use UUIDs!

The system requires **UUID format** for user IDs:
- ✅ Valid: `550e8400-e29b-41d4-a716-446655440000`
- ❌ Invalid: `emp-001`, `alice`, `bob-002`

See `UUID_REFERENCE.md` for test UUIDs to use.

## Test Users (UUIDs)

### Employees:
- **Alice**: `550e8400-e29b-41d4-a716-446655440000`
- **Bob**: `550e8400-e29b-41d4-a716-446655440001`
- **Charlie**: `550e8400-e29b-41d4-a716-446655440002`

### Managers:
- **John**: `660e8400-e29b-41d4-a716-446655440000`
- **Sarah**: `660e8400-e29b-41d4-a716-446655440001`

## Quick Start

### 1. Alice gives feedback to Bob:
```cmd
curl -X POST http://localhost:8081/api/v1/performance-management/feedback ^
  -H "Content-Type: application/json" ^
  -H "X-User-Id: 550e8400-e29b-41d4-a716-446655440000" ^
  --data @test-payloads/provide-feedback.json
```

### 2. Check Bob's feedback:
```cmd
curl http://localhost:8081/api/v1/performance-management/feedback/employee/550e8400-e29b-41d4-a716-446655440001
```

### 3. Bob acknowledges feedback (replace FEEDBACK_ID):
```cmd
curl -X PUT http://localhost:8081/api/v1/performance-management/feedback/FEEDBACK_ID/acknowledge
```

### 4. Bob responds to feedback:
```cmd
curl -X POST http://localhost:8081/api/v1/performance-management/feedback/FEEDBACK_ID/responses ^
  -H "Content-Type: application/json" ^
  -H "X-User-Id: 550e8400-e29b-41d4-a716-446655440001" ^
  --data @test-payloads/respond-to-feedback.json
```

## Available JSON Files

1. **provide-feedback.json** - Positive feedback from Alice to Bob
2. **provide-feedback-constructive.json** - Constructive feedback
3. **respond-to-feedback.json** - Response to feedback
4. **self-assessment.json** - Employee self-assessment
5. **manager-assessment.json** - Manager assessment

## Complete Workflow

See `UUID_REFERENCE.md` for the complete step-by-step workflow with all commands.
