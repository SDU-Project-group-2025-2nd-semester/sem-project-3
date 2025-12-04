# Database Seed Data

This document contains information about the seeded data in the development database.

## Users

All users have **email confirmed** and can log in immediately.

| Email | Password | First Name | Last Name | User ID | Company |
|-------|----------|------------|-----------|---------|---------|
| admin@techcoworking.com | `Admin123!` | Admin | User | a1111111-1111-1111-1111-111111111111 | Tech Co-Working Space |
| john.doe@techcoworking.com | `JohnDoe123!` | John | Doe | b1111111-1111-1111-1111-111111111111 | Tech Co-Working Space |
| jane.doe@techcoworking.com | `JaneDoe123!` | Jane | Doe | c1111111-1111-1111-1111-111111111111 | Tech Co-Working Space |
| bob.smith@innovationhub.com | `BobSmith123!` | Bob | Smith | d1111111-1111-1111-1111-111111111111 | Innovation Hub |
| alice.johnson@startupcenter.com | `AliceJohnson123!` | Alice | Johnson | e1111111-1111-1111-1111-111111111111 | Startup Center |

### User Details

#### Admin User
- **Standing Height**: 750mm
- **Sitting Height**: 650mm
- **Health Reminders**: Medium
- **Sitting Time**: 30 min
- **Standing Time**: 15 min

#### John Doe
- **Standing Height**: 720mm
- **Sitting Height**: 630mm
- **Health Reminders**: High
- **Sitting Time**: 25 min
- **Standing Time**: 10 min
- **Has Reservations**: Yes (today and future)

#### Jane Doe
- **Standing Height**: 680mm
- **Sitting Height**: 600mm
- **Health Reminders**: Medium
- **Sitting Time**: 30 min
- **Standing Time**: 15 min
- **Has Reservations**: Yes (future)

#### Bob Smith
- **Standing Height**: 740mm
- **Sitting Height**: 650mm
- **Health Reminders**: Low
- **Sitting Time**: 45 min
- **Standing Time**: 20 min
- **Has Reservations**: Yes (future)

#### Alice Johnson
- **Standing Height**: 700mm
- **Sitting Height**: 620mm
- **Health Reminders**: High
- **Sitting Time**: 20 min
- **Standing Time**: 10 min
- **Has Reservations**: Yes (future)

---

## Companies

| Company Name | ID | Secret Invite Code | Description | SimulatorLink | SimulatorApiKey |
|--------------|----|--------------------|-------------|
| Tech Co-Working Space | 11111111-1111-1111-1111-111111111111 | `TECH2024` | Main company with multiple rooms | http://s3-sproj-techcowork.michalvalko.eu | tba |
| Innovation Hub | 22222222-2222-2222-2222-222222222222 | `INNOVATE` | Secondary company | http://s3-sproj-innovationhub.michalvalko.eu | tba |
| Startup Center | 33333333-3333-3333-3333-333333333333 | *(None)* | Email verification required | http://s3-sproj-startupcenter.michalvalko.eu | tba |

---

## Rooms

### Tech Co-Working Space - Room 1
- **ID**: a1111111-1111-1111-1111-111111111111
- **Opening Hours**: 08:00 - 18:00
- **Days**: Monday - Friday
- **Desks**: 3

### Tech Co-Working Space - Room 2
- **ID**: a2222222-2222-2222-2222-222222222222
- **Opening Hours**: 07:00 - 20:00
- **Days**: Monday - Saturday
- **Desks**: 2

### Innovation Hub - Room 1
- **ID**: b1111111-1111-1111-1111-111111111111
- **Opening Hours**: 09:00 - 17:00
- **Days**: Monday - Friday
- **Desks**: 2

### Startup Center - Room 1
- **ID**: c1111111-1111-1111-1111-111111111111
- **Opening Hours**: 00:00 - 23:59 (24/7)
- **Days**: Monday - Sunday
- **Desks**: 2

---

## Desks

### Tech Co-Working Space

#### Room 1
| Desk ID | MAC Address | Height | Min Height | Max Height | Status |
|---------|-------------|--------|------------|------------|--------|
| d1111111-1111-1111-1111-111111111111 | AA:BB:CC:DD:EE:01 | 700mm | 600mm | 1200mm | Has damage report |
| d1111111-2222-2222-2222-222222222222 | AA:BB:CC:DD:EE:02 | 650mm | 600mm | 1200mm | Resolved damage |
| d1111111-3333-3333-3333-333333333333 | AA:BB:CC:DD:EE:03 | 720mm | 600mm | 1200mm | Available |

#### Room 2
| Desk ID | MAC Address | Height | Min Height | Max Height | Status |
|---------|-------------|--------|------------|------------|--------|
| d2222222-1111-1111-1111-111111111111 | AA:BB:CC:DD:EE:04 | 680mm | 600mm | 1200mm | Available |
| d2222222-2222-2222-2222-222222222222 | AA:BB:CC:DD:EE:05 | 710mm | 600mm | 1200mm | Available |

### Innovation Hub

#### Room 1
| Desk ID | MAC Address | Height | Min Height | Max Height | Status |
|---------|-------------|--------|------------|------------|--------|
| db111111-1111-1111-1111-111111111111 | BB:CC:DD:EE:FF:01 | 700mm | 600mm | 1200mm | Has damage report |
| db111111-2222-2222-2222-222222222222 | BB:CC:DD:EE:FF:02 | 730mm | 600mm | 1200mm | Available |

### Startup Center

#### Room 1
| Desk ID | MAC Address | Height | Min Height | Max Height | Status |
|---------|-------------|--------|------------|------------|--------|
| dc111111-1111-1111-1111-111111111111 | CC:DD:EE:FF:AA:01 | 690mm | 600mm | 1200mm | Resolved damage |
| dc111111-2222-2222-2222-222222222222 | CC:DD:EE:FF:AA:02 | 705mm | 600mm | 1200mm | Available |

---

## Reservations

| ID | User | Desk | Start | End | Status |
|----|------|------|-------|-----|--------|
| a1111111-1111-1111-1111-111111111111 | John Doe | AA:BB:CC:DD:EE:01 | 7 days ago, 09:00 | 7 days ago, 17:00 | Past |
| b2222222-2222-2222-2222-222222222222 | John Doe | AA:BB:CC:DD:EE:01 | Today, 08:00 | Today, 16:00 | Active |
| c3333333-3333-3333-3333-333333333333 | Jane Doe | AA:BB:CC:DD:EE:02 | Tomorrow, 09:00 | Tomorrow, 17:00 | Future |
| d4444444-4444-4444-4444-444444444444 | John Doe | AA:BB:CC:DD:EE:03 | In 2 days, 10:00 | In 2 days, 15:00 | Future |
| e5555555-5555-5555-5555-555555555555 | Bob Smith | BB:CC:DD:EE:FF:01 | In 3 days, 09:00 | In 3 days, 18:00 | Future |
| f6666666-6666-6666-6666-666666666666 | Alice Johnson | CC:DD:EE:FF:AA:01 | In 5 days, 08:00 | In 5 days, 12:00 | Future |

---

## Damage Reports

| ID | Desk | Description | Submitted By | Submit Time | Status | Resolved By | Resolve Time |
|----|------|-------------|--------------|-------------|--------|-------------|--------------|
| a1111111-1111-1111-1111-111111111111 | AA:BB:CC:DD:EE:01 | The desk height adjustment button is stuck and won't respond to presses. | John Doe | 5 days ago | **Unresolved** | - | - |
| b1111111-1111-1111-1111-111111111111 | AA:BB:CC:DD:EE:02 | Desk surface has a scratch on the left side. | Jane Doe | 10 days ago | **Resolved** | Admin User | 3 days ago |
| c1111111-1111-1111-1111-111111111111 | BB:CC:DD:EE:FF:01 | BLE connection keeps disconnecting. Might need battery replacement. | Bob Smith | 2 days ago | **Unresolved** | - | - |
| d1111111-1111-1111-1111-111111111111 | CC:DD:EE:FF:AA:01 | Power outlet near desk not working. | Alice Johnson | 15 days ago | **Resolved** | Admin User | 14 days ago |

---

## Quick Test Scenarios

### Login Testing
```bash
# Test with any user account
POST /api/auth/login
{
  "email": "john.doe@techcoworking.com",
  "password": "JohnDoe123!"
}
```

### Join Company with Invite Code -- not implemented
```bash
# Use invite code for Tech Co-Working Space
POST /api/company/join
{
  "inviteCode": "TECH2024"
}
```

### View Available Desks
- Room 1 (Tech Co-Working): 3 desks
- Check desk `d1111111-1111-1111-1111-111111111111` for active damage report

### Create Reservation
- Any available desk without existing reservations
- Make sure to respect room opening hours

### Submit Damage Report
- Report damage for any desk
- Check existing unresolved reports for testing resolution flow

---

## Notes

- **Database is seeded only in Development environment**
- Seeding runs automatically after migrations on application startup
- If data already exists, seeding is skipped
- All passwords follow the format: `{FirstName}{LastName}123!` or `Admin123!`
- MAC addresses follow format: `XX:XX:XX:XX:XX:XX`
- All heights are in millimeters (mm)
- All times are in UTC
- Secret invite codes are optional (Startup Center doesn't have one)

---

## Resetting Seed Data

To reset the seed data:

1. Drop the database or run down migration
2. Restart the application
3. Migrations will run and seed data will be recreated

```bash
# Using dotnet ef tools
dotnet ef database drop
dotnet run
```
