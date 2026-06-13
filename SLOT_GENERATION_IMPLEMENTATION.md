# Slot Generation System - Day 7 Implementation

## Overview
This document describes the Slot Generation System implemented for the Schedula project. The system allows doctors to set their availability (recurring and custom) and enables patients to view available appointment slots.

## Architecture

### Database Schema
The system uses four main entities:

#### 1. DoctorAvailability
Recurring availability patterns for doctors.

```sql
CREATE TABLE doctor_availabilities (
  id UUID PRIMARY KEY,
  doctorId UUID NOT NULL,
  dayOfWeek VARCHAR NOT NULL,
  startTime TIME NOT NULL,
  endTime TIME NOT NULL,
  slotDurationMinutes INT DEFAULT 30,
  isActive BOOLEAN DEFAULT true,
  createdAt DATETIME,
  updatedAt DATETIME
);
```

#### 2. CustomAvailability
Overrides for specific dates (e.g., special hours or days off).

```sql
CREATE TABLE custom_availabilities (
  id UUID PRIMARY KEY,
  doctorId UUID NOT NULL,
  date DATE NOT NULL,
  startTime TIME,
  endTime TIME,
  slotDurationMinutes INT,
  reason VARCHAR,
  createdAt DATETIME,
  updatedAt DATETIME
);
```

#### 3. Slot
Generated slots from availability.

```sql
CREATE TABLE slots (
  id UUID PRIMARY KEY,
  doctorId UUID NOT NULL,
  startTime DATETIME NOT NULL,
  endTime DATETIME NOT NULL,
  status VARCHAR DEFAULT 'AVAILABLE',
  patientId UUID,
  notes VARCHAR,
  createdAt DATETIME,
  updatedAt DATETIME
);
```

#### 4. Appointment
Scheduled appointments.

```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY,
  doctorId UUID NOT NULL,
  patientId UUID NOT NULL,
  slotId UUID NOT NULL,
  appointmentTime DATETIME NOT NULL,
  status VARCHAR DEFAULT 'SCHEDULED',
  notes VARCHAR,
  createdAt DATETIME,
  updatedAt DATETIME
);
```

## Key Features

### 1. Slot Generation Logic

#### Availability Resolution
The system prioritizes availability in this order:
1. **Custom Availability (Override)** - For specific dates
2. **Recurring Availability** - Regular weekly pattern

```
If custom availability exists for date:
  → Use custom availability
Else:
  → Use recurring availability for the day of week
```

#### Slot Generation Algorithm
1. Get availability for the requested date
2. Parse start and end times
3. Generate slots based on duration
4. Filter out:
   - Slots that extend beyond availability time
   - Past slots
   - Unavailable slots

**Example:**
```
Availability: 10:00 AM - 11:00 AM
Slot Duration: 15 minutes

Generated Slots:
- 10:00 - 10:15
- 10:15 - 10:30
- 10:30 - 10:45
- 10:45 - 11:00
```

### 2. Doctor Endpoints

#### Create Recurring Availability
```
POST /doctor/availability
Authorization: Bearer <token>
Content-Type: application/json

{
  "dayOfWeek": "MONDAY",
  "startTime": "10:00",
  "endTime": "11:00",
  "slotDurationMinutes": 30,
  "isActive": true
}

Response:
{
  "message": "Availability created successfully",
  "data": {
    "id": "uuid",
    "doctorId": "doctor-id",
    "dayOfWeek": "MONDAY",
    "startTime": "10:00:00",
    "endTime": "11:00:00",
    "slotDurationMinutes": 30,
    "isActive": true,
    "createdAt": "2026-06-12T10:00:00Z",
    "updatedAt": "2026-06-12T10:00:00Z"
  }
}
```

#### Get All Recurring Availabilities
```
GET /doctor/availabilities
Authorization: Bearer <token>

Response:
{
  "message": "Availabilities retrieved successfully",
  "data": [
    { ... },
    { ... }
  ]
}
```

#### Update Recurring Availability
```
PUT /doctor/availability/{availabilityId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "startTime": "10:30",
  "endTime": "11:30",
  "slotDurationMinutes": 20
}
```

#### Delete Recurring Availability
```
DELETE /doctor/availability/{availabilityId}
Authorization: Bearer <token>
```

#### Create Custom Availability
```
POST /doctor/custom-availability
Authorization: Bearer <token>
Content-Type: application/json

{
  "date": "2026-06-20",
  "startTime": "09:00",
  "endTime": "10:00",
  "slotDurationMinutes": 15,
  "reason": "Special clinic hours"
}

Response:
{
  "message": "Custom availability created successfully",
  "data": {
    "id": "uuid",
    "doctorId": "doctor-id",
    "date": "2026-06-20",
    "startTime": "09:00:00",
    "endTime": "10:00:00",
    "slotDurationMinutes": 15,
    "reason": "Special clinic hours",
    "createdAt": "2026-06-12T10:00:00Z",
    "updatedAt": "2026-06-12T10:00:00Z"
  }
}
```

#### Make Doctor Unavailable on Specific Date
```
POST /doctor/custom-availability
Authorization: Bearer <token>
Content-Type: application/json

{
  "date": "2026-06-25",
  "reason": "Doctor on leave"
}

Response: {
  "id": "uuid",
  "doctorId": "doctor-id",
  "date": "2026-06-25",
  "startTime": null,
  "endTime": null,
  "slotDurationMinutes": null,
  "reason": "Doctor on leave"
}
```

#### Get Custom Availabilities
```
GET /doctor/custom-availabilities
Authorization: Bearer <token>

Response:
{
  "message": "Custom availabilities retrieved successfully",
  "data": [ ... ]
}
```

#### Delete Custom Availability
```
DELETE /doctor/custom-availability/{customAvailabilityId}
Authorization: Bearer <token>
```

### 3. Patient Endpoints

#### Get Available Slots for Doctor (Single Date)
```
GET /patient/doctor/{doctorId}/slots?date=2026-06-20
Authorization: Bearer <token>

Response:
{
  "message": "Available slots retrieved successfully",
  "data": [
    {
      "id": "slot-id-1",
      "startTime": "2026-06-20T10:00:00Z",
      "endTime": "2026-06-20T10:30:00Z",
      "status": "AVAILABLE"
    },
    {
      "id": "slot-id-2",
      "startTime": "2026-06-20T10:30:00Z",
      "endTime": "2026-06-20T11:00:00Z",
      "status": "AVAILABLE"
    }
  ],
  "count": 2
}
```

#### Get Available Slots for Doctor (Date Range)
```
GET /patient/doctor/{doctorId}/slots/range?startDate=2026-06-20&endDate=2026-06-27
Authorization: Bearer <token>

Response:
{
  "message": "Available slots retrieved successfully",
  "data": [ ... ],
  "count": 15
}
```

## Edge Cases Handled

### 1. Doctor Not Found
```
Response:
{
  "message": "No availability found for this doctor",
  "data": [],
  "count": 0
}
```

### 2. Invalid Date Format
```
{
  "statusCode": 400,
  "message": "Invalid date format. Use YYYY-MM-DD"
}
```

### 3. Past Date
```
{
  "statusCode": 400,
  "message": "Cannot fetch slots for past dates"
}
```

### 4. Missing Date Parameter
```
{
  "statusCode": 400,
  "message": "Date parameter is required (format: YYYY-MM-DD)"
}
```

### 5. Invalid Time Format
```
{
  "statusCode": 400,
  "message": "Invalid time format. Use HH:mm or HH:mm:ss"
}
```

### 6. No Availability
```
{
  "message": "No availability found for this doctor",
  "data": []
}
```

### 7. Invalid Duration
```
{
  "statusCode": 400,
  "message": "Slot duration must be greater than 0"
}
```

### 8. Start Time After End Time
```
{
  "statusCode": 400,
  "message": "Start time must be before end time"
}
```

### 9. Booked Slots Filtering
- Only slots with status "AVAILABLE" are returned
- Booked slots are excluded from patient view

### 10. Past Slots Filtering
- Slots that end before the current time are not included
- Even if generated, they are filtered out during retrieval

## Services

### SlotGenerationService
Handles slot generation logic and retrieval.

**Key Methods:**
- `generateSlotsForDate()` - Generate slots for a specific date
- `getAvailableSlotsForDate()` - Get available, future slots for a date
- `getAvailableSlotsForDateRange()` - Get slots across multiple dates
- `getAvailabilityForDate()` - Get effective availability (custom > recurring)
- `doctorHasAvailability()` - Check if doctor has any availability

### AvailabilityService
Manages doctor and custom availability.

**Key Methods:**
- `createDoctorAvailability()` - Create recurring availability
- `updateDoctorAvailability()` - Update recurring availability
- `deleteDoctorAvailability()` - Delete recurring availability
- `getDoctorAvailabilities()` - Get all recurring availabilities
- `createCustomAvailability()` - Create custom availability override
- `getCustomAvailabilities()` - Get custom availabilities
- `deleteCustomAvailability()` - Delete custom availability

## Data Validation

### Time Format
- Accepts: "HH:mm" or "HH:mm:ss"
- Example: "10:30" or "10:30:00"

### Date Format
- Format: YYYY-MM-DD
- Example: "2026-06-20"

### Slot Duration
- Minimum: 1 minute
- Recommended: 15, 30, 60 minutes

### Day of Week
- Valid values: MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY

## Testing Scenarios

### Test 1: Generate Slots from Recurring Availability
```
Given: Doctor has recurring availability on Monday 10:00-11:00, 30-min slots
When: Patient requests slots for Monday
Then: 2 slots are returned (10:00-10:30, 10:30-11:00)
```

### Test 2: Custom Override
```
Given: Doctor has recurring Monday 10:00-11:00 availability
  AND: Doctor sets custom availability for specific Monday as 09:00-10:00
When: Patient requests slots for that specific Monday
Then: Slots from 09:00-10:00 are returned (custom overrides recurring)
```

### Test 3: Slot Generation with Different Durations
```
Given: Available time 10:00-10:45
When: Slot duration is 30 minutes
Then: Only 1 slot is generated (10:00-10:30)
  AND: No slot extends beyond availability (10:30-11:00 is not created)
```

### Test 4: Doctor Unavailable on Specific Date
```
Given: Doctor sets custom availability with no times (null)
When: Patient requests slots for that date
Then: No slots are returned for that date
```

### Test 5: Future Slots Only
```
Given: Current time is 10:15
  AND: Available slots are 10:00-10:30, 10:30-11:00, 11:00-11:30
When: Patient requests slots
Then: Only slots after current time are returned
  AND: 10:00-10:30 slot is NOT returned (ends at 10:30, not future)
  AND: 10:30-11:00 slot IS returned
```

### Test 6: Booked Slots Hidden
```
Given: Slot 10:00-10:30 is booked (status = BOOKED)
  AND: Slot 10:30-11:00 is available
When: Patient requests slots
Then: Only available slots are returned
  AND: Booked slot is NOT returned
```

### Test 7: Invalid Date Handling
```
When: Patient requests slots with invalid date "2026-13-45"
Then: Bad request error is returned
```

### Test 8: Past Date Handling
```
When: Patient requests slots for past date "2026-01-01"
Then: Bad request error is returned
```

## Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Database
Update `src/app.module.ts` for your database (currently SQLite).

### 3. Run Migrations
```bash
npm run typeorm migration:run
```

### 4. Start Application
```bash
npm run start:dev
```

## API Testing with cURL

### Create Recurring Availability
```bash
curl -X POST http://localhost:3000/doctor/availability \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "dayOfWeek": "MONDAY",
    "startTime": "10:00",
    "endTime": "11:00",
    "slotDurationMinutes": 30
  }'
```

### Get Slots for Patient
```bash
curl http://localhost:3000/patient/doctor/<doctorId>/slots?date=2026-06-20 \
  -H "Authorization: Bearer <token>"
```

## Performance Considerations

1. **Database Indexes**: Add indexes on:
   - `doctor_availabilities(doctorId, dayOfWeek)`
   - `custom_availabilities(doctorId, date)`
   - `slots(doctorId, startTime)`

2. **Caching**: Consider caching slots for frequently requested dates

3. **Batch Slot Generation**: Pre-generate slots for upcoming weeks during off-peak hours

## Future Enhancements

1. Slot blocking for specific times
2. Buffer time between appointments
3. Maximum appointments per day limit
4. Slot templates for recurring patterns
5. Timezone support
6. Bulk availability import
7. Availability export/report

## Summary

The Slot Generation System provides:
- ✅ Recurring availability support
- ✅ Custom override support  
- ✅ Configurable slot duration
- ✅ Future slots only
- ✅ Booked slots filtering
- ✅ Comprehensive edge case handling
- ✅ Doctor and patient APIs
- ✅ Full validation
- ✅ Database migrations
- ✅ Test coverage
