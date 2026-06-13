# Quick Setup Guide - Slot Generation System

## Prerequisites
- Node.js 16+ installed
- npm or yarn package manager

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

This will install:
- NestJS framework
- TypeORM for database
- SQLite3 database
- date-fns for date utilities
- JWT for authentication
- Passport for authorization
- All other required dependencies

### 2. Start the Application

#### Development Mode (with auto-reload)
```bash
npm run start:dev
```

#### Production Mode
```bash
npm run build
npm run start:prod
```

#### Debug Mode
```bash
npm run start:debug
```

### 3. Access the Application
- Server runs on: `http://localhost:3000`
- Database created as: `schedula.db` (SQLite)

## Project Structure

```
src/
├── entities/              # Database entities
├── dto/                   # Data Transfer Objects
├── services/              # Business logic
├── doctor/                # Doctor endpoints
├── patient/               # Patient endpoints
├── auth/                  # Authentication
├── database/migrations/   # DB migrations
└── app.module.ts          # Main app module
```

## API Endpoints

### Doctor Endpoints (Requires DOCTOR role)
- `POST /doctor/availability` - Create recurring availability
- `GET /doctor/availabilities` - List all availabilities
- `PUT /doctor/availability/:id` - Update availability
- `DELETE /doctor/availability/:id` - Delete availability
- `POST /doctor/custom-availability` - Create custom availability
- `GET /doctor/custom-availabilities` - List custom availabilities
- `DELETE /doctor/custom-availability/:id` - Delete custom availability

### Patient Endpoints (Requires PATIENT role)
- `GET /patient/doctor/:doctorId/slots?date=YYYY-MM-DD` - Get slots for date
- `GET /patient/doctor/:doctorId/slots/range?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` - Get slots for range

## Testing

### Run Unit Tests
```bash
npm run test
```

### Run E2E Tests
```bash
npm run test:e2e
```

### Run Tests with Coverage
```bash
npm run test:cov
```

## Authentication

### Get Auth Token

1. **Register as Doctor:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@example.com",
    "password": "password123",
    "role": "DOCTOR"
  }'
```

2. **Login:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@example.com",
    "password": "password123"
  }'
```

3. **Use Token:**
```bash
# Store the token
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Use in requests
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/doctor/availabilities
```

## Example Workflow

### 1. Create Recurring Availability
```bash
TOKEN="your_doctor_token"

curl -X POST http://localhost:3000/doctor/availability \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dayOfWeek": "MONDAY",
    "startTime": "10:00",
    "endTime": "11:00",
    "slotDurationMinutes": 30
  }'
```

### 2. Create Custom Availability (Special Date)
```bash
curl -X POST http://localhost:3000/doctor/custom-availability \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-06-20",
    "startTime": "09:00",
    "endTime": "10:00",
    "slotDurationMinutes": 15
  }'
```

### 3. Patient Views Available Slots
```bash
PATIENT_TOKEN="your_patient_token"
DOCTOR_ID="doctor_id_from_profile"

curl "http://localhost:3000/patient/doctor/$DOCTOR_ID/slots?date=2026-06-20" \
  -H "Authorization: Bearer $PATIENT_TOKEN"
```

## Database

### SQLite
- Database file: `schedula.db`
- Auto-created on first run
- Schema auto-synchronized from entities

### Tables Created
1. `doctor_availabilities` - Recurring availability
2. `custom_availabilities` - Date-specific overrides
3. `slots` - Generated appointment slots
4. `appointments` - Scheduled appointments

### View Database
```bash
# Install sqlite3 CLI if not present
sqlite3 schedula.db

# View all tables
.tables

# View doctor availabilities
SELECT * FROM doctor_availabilities;

# View custom availabilities
SELECT * FROM custom_availabilities;

# View generated slots
SELECT * FROM slots;
```

## Common Commands

### Format Code
```bash
npm run format
```

### Lint Code
```bash
npm run lint
```

### Build Project
```bash
npm run build
```

## Troubleshooting

### Port 3000 Already in Use
```bash
# Use different port
PORT=3001 npm run start:dev
```

### Database Lock Error
```bash
# Delete database and restart
rm schedula.db
npm run start:dev
```

### Dependency Issues
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## Documentation Files

- `IMPLEMENTATION_SUMMARY.md` - Project overview
- `SLOT_GENERATION_IMPLEMENTATION.md` - Detailed documentation
- `API_TESTING_GUIDE.md` - Complete API test cases

## Performance Tips

1. **Batch Requests** - Use date range endpoint for multiple days
2. **Cache Slots** - Pre-generate slots for the week
3. **Add Indexes** - On `doctorId` and `date` columns for faster queries

## Next Steps

1. Follow `API_TESTING_GUIDE.md` to test all endpoints
2. Review `SLOT_GENERATION_IMPLEMENTATION.md` for detailed docs
3. Run unit tests to verify implementation
4. Deploy to production

## Support

For issues or questions:
1. Check `IMPLEMENTATION_SUMMARY.md` for overview
2. Review `API_TESTING_GUIDE.md` for API details
3. Check error messages in server logs
4. Verify database is properly initialized

## Production Checklist

- [ ] Environment variables configured
- [ ] JWT secret updated
- [ ] Database backups configured
- [ ] Error logging implemented
- [ ] Rate limiting added
- [ ] HTTPS enabled
- [ ] CORS configured
- [ ] Input validation enabled
- [ ] Tests passing
- [ ] Documentation complete
