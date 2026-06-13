# API Testing Guide - Slot Generation System

## Test Environment Setup

### Prerequisites
1. Node.js 16+ installed
2. NestJS project running on `http://localhost:3000`
3. Database configured and migrations run
4. Authentication tokens obtained

### Sample Auth Tokens

For testing, you'll need JWT tokens. Here's how to get them:

1. **Register as Doctor:**
   ```bash
   POST /auth/register
   {
     "email": "doctor@example.com",
     "password": "password123",
     "role": "DOCTOR"
   }
   ```

2. **Register as Patient:**
   ```bash
   POST /auth/register
   {
     "email": "patient@example.com",
     "password": "password123",
     "role": "PATIENT"
   }
   ```

3. **Login:**
   ```bash
   POST /auth/login
   {
     "email": "doctor@example.com",
     "password": "password123"
   }
   
   Response:
   {
     "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   }
   ```

---

## Test Cases

### 1. Create Recurring Availability

**Scenario:** Doctor sets availability for Monday 10:00-11:00 with 30-minute slots

**Request:**
```bash
curl -X POST http://localhost:3000/doctor/availability \
  -H "Authorization: Bearer YOUR_DOCTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dayOfWeek": "MONDAY",
    "startTime": "10:00",
    "endTime": "11:00",
    "slotDurationMinutes": 30,
    "isActive": true
  }'
```

**Expected Response:** 201 Created
```json
{
  "message": "Availability created successfully",
  "data": {
    "id": "a1b2c3d4-e5f6-47g8-h9i0-j1k2l3m4n5o6",
    "doctorId": "doctor-id",
    "dayOfWeek": "MONDAY",
    "startTime": "10:00:00",
    "endTime": "11:00:00",
    "slotDurationMinutes": 30,
    "isActive": true,
    "createdAt": "2026-06-12T10:30:00Z",
    "updatedAt": "2026-06-12T10:30:00Z"
  }
}
```

---

### 2. Get All Recurring Availabilities

**Scenario:** Doctor retrieves all their availability settings

**Request:**
```bash
curl -X GET http://localhost:3000/doctor/availabilities \
  -H "Authorization: Bearer YOUR_DOCTOR_TOKEN"
```

**Expected Response:** 200 OK
```json
{
  "message": "Availabilities retrieved successfully",
  "data": [
    {
      "id": "a1b2c3d4-e5f6-47g8-h9i0-j1k2l3m4n5o6",
      "doctorId": "doctor-id",
      "dayOfWeek": "MONDAY",
      "startTime": "10:00:00",
      "endTime": "11:00:00",
      "slotDurationMinutes": 30,
      "isActive": true,
      "createdAt": "2026-06-12T10:30:00Z",
      "updatedAt": "2026-06-12T10:30:00Z"
    },
    {
      "id": "b2c3d4e5-f6g7-48h9-i0j1-k2l3m4n5o6p7",
      "doctorId": "doctor-id",
      "dayOfWeek": "WEDNESDAY",
      "startTime": "14:00:00",
      "endTime": "17:00:00",
      "slotDurationMinutes": 15,
      "isActive": true,
      "createdAt": "2026-06-12T10:35:00Z",
      "updatedAt": "2026-06-12T10:35:00Z"
    }
  ]
}
```

---

### 3. Update Recurring Availability

**Scenario:** Doctor changes Monday availability to 10:30-11:30

**Request:**
```bash
curl -X PUT http://localhost:3000/doctor/availability/a1b2c3d4-e5f6-47g8-h9i0-j1k2l3m4n5o6 \
  -H "Authorization: Bearer YOUR_DOCTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "startTime": "10:30",
    "endTime": "11:30",
    "slotDurationMinutes": 20
  }'
```

**Expected Response:** 200 OK
```json
{
  "message": "Availability updated successfully",
  "data": {
    "id": "a1b2c3d4-e5f6-47g8-h9i0-j1k2l3m4n5o6",
    "doctorId": "doctor-id",
    "dayOfWeek": "MONDAY",
    "startTime": "10:30:00",
    "endTime": "11:30:00",
    "slotDurationMinutes": 20,
    "isActive": true,
    "createdAt": "2026-06-12T10:30:00Z",
    "updatedAt": "2026-06-12T10:45:00Z"
  }
}
```

---

### 4. Create Custom Availability (Special Hours)

**Scenario:** Doctor sets special availability for June 20, 2026 (09:00-10:00)

**Request:**
```bash
curl -X POST http://localhost:3000/doctor/custom-availability \
  -H "Authorization: Bearer YOUR_DOCTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-06-20",
    "startTime": "09:00",
    "endTime": "10:00",
    "slotDurationMinutes": 15,
    "reason": "Special clinic hours"
  }'
```

**Expected Response:** 201 Created
```json
{
  "message": "Custom availability created successfully",
  "data": {
    "id": "c3d4e5f6-g7h8-49i0-j1k2-l3m4n5o6p7q8",
    "doctorId": "doctor-id",
    "date": "2026-06-20",
    "startTime": "09:00:00",
    "endTime": "10:00:00",
    "slotDurationMinutes": 15,
    "reason": "Special clinic hours",
    "createdAt": "2026-06-12T11:00:00Z",
    "updatedAt": "2026-06-12T11:00:00Z"
  }
}
```

---

### 5. Create Custom Availability (Doctor Unavailable)

**Scenario:** Doctor marks June 25, 2026 as unavailable (on leave)

**Request:**
```bash
curl -X POST http://localhost:3000/doctor/custom-availability \
  -H "Authorization: Bearer YOUR_DOCTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-06-25",
    "reason": "Doctor on annual leave"
  }'
```

**Expected Response:** 201 Created
```json
{
  "message": "Custom availability created successfully",
  "data": {
    "id": "d4e5f6g7-h8i9-50j1-k2l3-m4n5o6p7q8r9",
    "doctorId": "doctor-id",
    "date": "2026-06-25",
    "startTime": null,
    "endTime": null,
    "slotDurationMinutes": null,
    "reason": "Doctor on annual leave",
    "createdAt": "2026-06-12T11:05:00Z",
    "updatedAt": "2026-06-12T11:05:00Z"
  }
}
```

---

### 6. Get Available Slots (Single Date)

**Scenario:** Patient requests available slots for doctor on June 20, 2026

**Request:**
```bash
curl -X GET "http://localhost:3000/patient/doctor/doctor-id/slots?date=2026-06-20" \
  -H "Authorization: Bearer YOUR_PATIENT_TOKEN"
```

**Expected Response:** 200 OK
```json
{
  "message": "Available slots retrieved successfully",
  "data": [
    {
      "id": "slot-1",
      "startTime": "2026-06-20T09:00:00Z",
      "endTime": "2026-06-20T09:15:00Z",
      "status": "AVAILABLE"
    },
    {
      "id": "slot-2",
      "startTime": "2026-06-20T09:15:00Z",
      "endTime": "2026-06-20T09:30:00Z",
      "status": "AVAILABLE"
    },
    {
      "id": "slot-3",
      "startTime": "2026-06-20T09:30:00Z",
      "endTime": "2026-06-20T09:45:00Z",
      "status": "AVAILABLE"
    },
    {
      "id": "slot-4",
      "startTime": "2026-06-20T09:45:00Z",
      "endTime": "2026-06-20T10:00:00Z",
      "status": "AVAILABLE"
    }
  ],
  "count": 4
}
```

**Note:** These are 15-minute slots from the custom availability (09:00-10:00)

---

### 7. Get Available Slots (Date Range)

**Scenario:** Patient requests available slots for a week

**Request:**
```bash
curl -X GET "http://localhost:3000/patient/doctor/doctor-id/slots/range?startDate=2026-06-15&endDate=2026-06-22" \
  -H "Authorization: Bearer YOUR_PATIENT_TOKEN"
```

**Expected Response:** 200 OK
```json
{
  "message": "Available slots retrieved successfully",
  "data": [
    {
      "id": "slot-1",
      "startTime": "2026-06-15T10:30:00Z",
      "endTime": "2026-06-15T10:50:00Z",
      "status": "AVAILABLE"
    },
    {
      "id": "slot-2",
      "startTime": "2026-06-15T10:50:00Z",
      "endTime": "2026-06-15T11:10:00Z",
      "status": "AVAILABLE"
    },
    {
      "id": "slot-3",
      "startTime": "2026-06-15T11:10:00Z",
      "endTime": "2026-06-15T11:30:00Z",
      "status": "AVAILABLE"
    },
    {
      "id": "slot-4",
      "startTime": "2026-06-20T09:00:00Z",
      "endTime": "2026-06-20T09:15:00Z",
      "status": "AVAILABLE"
    }
  ],
  "count": 4
}
```

---

### 8. Get Custom Availabilities

**Scenario:** Doctor retrieves all custom availability records

**Request:**
```bash
curl -X GET http://localhost:3000/doctor/custom-availabilities \
  -H "Authorization: Bearer YOUR_DOCTOR_TOKEN"
```

**Expected Response:** 200 OK
```json
{
  "message": "Custom availabilities retrieved successfully",
  "data": [
    {
      "id": "c3d4e5f6-g7h8-49i0-j1k2-l3m4n5o6p7q8",
      "doctorId": "doctor-id",
      "date": "2026-06-20",
      "startTime": "09:00:00",
      "endTime": "10:00:00",
      "slotDurationMinutes": 15,
      "reason": "Special clinic hours",
      "createdAt": "2026-06-12T11:00:00Z",
      "updatedAt": "2026-06-12T11:00:00Z"
    },
    {
      "id": "d4e5f6g7-h8i9-50j1-k2l3-m4n5o6p7q8r9",
      "doctorId": "doctor-id",
      "date": "2026-06-25",
      "startTime": null,
      "endTime": null,
      "slotDurationMinutes": null,
      "reason": "Doctor on annual leave",
      "createdAt": "2026-06-12T11:05:00Z",
      "updatedAt": "2026-06-12T11:05:00Z"
    }
  ]
}
```

---

## Error Test Cases

### 9. Invalid Date Format

**Request:**
```bash
curl -X GET "http://localhost:3000/patient/doctor/doctor-id/slots?date=20-06-2026" \
  -H "Authorization: Bearer YOUR_PATIENT_TOKEN"
```

**Expected Response:** 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Invalid date format. Use YYYY-MM-DD",
  "error": "Bad Request"
}
```

---

### 10. Past Date

**Request:**
```bash
curl -X GET "http://localhost:3000/patient/doctor/doctor-id/slots?date=2025-01-01" \
  -H "Authorization: Bearer YOUR_PATIENT_TOKEN"
```

**Expected Response:** 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Cannot fetch slots for past dates",
  "error": "Bad Request"
}
```

---

### 11. Missing Date Parameter

**Request:**
```bash
curl -X GET "http://localhost:3000/patient/doctor/doctor-id/slots" \
  -H "Authorization: Bearer YOUR_PATIENT_TOKEN"
```

**Expected Response:** 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Date parameter is required (format: YYYY-MM-DD)",
  "error": "Bad Request"
}
```

---

### 12. Invalid Time Format

**Request:**
```bash
curl -X POST http://localhost:3000/doctor/availability \
  -H "Authorization: Bearer YOUR_DOCTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dayOfWeek": "MONDAY",
    "startTime": "25:00",
    "endTime": "26:00",
    "slotDurationMinutes": 30
  }'
```

**Expected Response:** 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Invalid time format. Use HH:mm or HH:mm:ss",
  "error": "Bad Request"
}
```

---

### 13. Start Time After End Time

**Request:**
```bash
curl -X POST http://localhost:3000/doctor/availability \
  -H "Authorization: Bearer YOUR_DOCTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dayOfWeek": "MONDAY",
    "startTime": "11:00",
    "endTime": "10:00",
    "slotDurationMinutes": 30
  }'
```

**Expected Response:** 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Start time must be before end time",
  "error": "Bad Request"
}
```

---

### 14. Invalid Slot Duration

**Request:**
```bash
curl -X POST http://localhost:3000/doctor/availability \
  -H "Authorization: Bearer YOUR_DOCTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dayOfWeek": "MONDAY",
    "startTime": "10:00",
    "endTime": "11:00",
    "slotDurationMinutes": 0
  }'
```

**Expected Response:** 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Slot duration must be greater than 0",
  "error": "Bad Request"
}
```

---

### 15. No Availability for Doctor

**Scenario:** Patient requests slots for a doctor with no availability

**Request:**
```bash
curl -X GET "http://localhost:3000/patient/doctor/unknown-doctor/slots?date=2026-06-20" \
  -H "Authorization: Bearer YOUR_PATIENT_TOKEN"
```

**Expected Response:** 200 OK (but empty)
```json
{
  "message": "No availability found for this doctor",
  "data": [],
  "count": 0
}
```

---

### 16. Availability Not Found (Update)

**Request:**
```bash
curl -X PUT "http://localhost:3000/doctor/availability/invalid-id" \
  -H "Authorization: Bearer YOUR_DOCTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "startTime": "10:00",
    "endTime": "11:00"
  }'
```

**Expected Response:** 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Availability not found",
  "error": "Not Found"
}
```

---

### 17. Availability Not Found (Delete)

**Request:**
```bash
curl -X DELETE "http://localhost:3000/doctor/availability/invalid-id" \
  -H "Authorization: Bearer YOUR_DOCTOR_TOKEN"
```

**Expected Response:** 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Availability not found",
  "error": "Not Found"
}
```

---

## Expected Behavior Verification

### Verification Checklist

- [ ] Recurring availability is created successfully
- [ ] Slots are generated correctly based on availability
- [ ] Custom availability overrides recurring availability
- [ ] Doctor unavailable dates return 0 slots
- [ ] Only future slots are returned to patients
- [ ] Slot count matches expected duration divisions
- [ ] Past dates are rejected with proper error
- [ ] Invalid date formats are rejected
- [ ] Invalid times are rejected
- [ ] Start time before end time is enforced
- [ ] Slot duration must be positive
- [ ] Booked slots are not returned (status filtering)
- [ ] Proper error messages for all edge cases
- [ ] Database records are properly created
- [ ] Timestamps are accurate

---

## Slot Generation Examples

### Example 1: Standard 30-minute slots
```
Availability: 10:00 - 11:00
Duration: 30 minutes
Generated:
- 10:00 - 10:30 ✓
- 10:30 - 11:00 ✓
Total: 2 slots
```

### Example 2: 15-minute slots
```
Availability: 10:00 - 10:45
Duration: 15 minutes
Generated:
- 10:00 - 10:15 ✓
- 10:15 - 10:30 ✓
- 10:30 - 10:45 ✓
Total: 3 slots
```

### Example 3: Slot extending beyond availability
```
Availability: 10:00 - 10:45
Duration: 30 minutes
Generated:
- 10:00 - 10:30 ✓
- 10:30 - 11:00 ✗ (extends beyond)
Total: 1 slot
```

---

## Performance Testing

### Load Testing Commands
```bash
# Generate 100 requests for slots
for i in {1..100}; do
  curl -X GET "http://localhost:3000/patient/doctor/doctor-id/slots?date=2026-06-20" \
    -H "Authorization: Bearer YOUR_TOKEN" &
done
```

### Expected Performance
- Response time: < 500ms per request
- Database queries: Optimized with indexes
- No N+1 queries

---

## Summary

This testing guide covers:
1. ✅ Recurring availability CRUD operations
2. ✅ Custom availability management
3. ✅ Slot generation logic
4. ✅ Slot retrieval for patients
5. ✅ Override functionality
6. ✅ Edge case handling
7. ✅ Error responses
8. ✅ Future slots filtering
9. ✅ Validation tests
