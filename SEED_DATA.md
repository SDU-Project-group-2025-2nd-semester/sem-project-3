# Database Seed Data

This document contains information about the seeded data in the development database.

## Users

All users have **email confirmed** and can log in immediately.

| Email | Password | First Name | Last Name | User ID | Company | Role |
|-------|----------|------------|-----------|---------|---------|------|
| admin@techcoworking.com | `Admin123!` | Admin | User | a1111111-1111-1111-1111-111111111111 | Tech Co-Working Space | Admin |
| staff@techcoworking.com | `Staff123!` | Staff | Staffy | f1111111-1111-1111-1111-111111111111 | Tech Co-Working Space | Janitor |
| john.doe@techcoworking.com | `JohnDoe123!` | John | Doe | b1111111-1111-1111-1111-111111111111 | Tech Co-Working Space | User |
| jane.doe@techcoworking.com | `JaneDoe123!` | Jane | Doe | c1111111-1111-1111-1111-111111111111 | Tech Co-Working Space | User |
| multiuser1@example.com | `MultiUser123!` | Multi | User1 | k1111111-1111-1111-1111-111111111111 | Tech Co-Working Space, Innovation Hub | User |
| multiuser3@example.com | `MultiUser123!` | Multi | User3 | m1111111-1111-1111-1111-111111111111 | Tech Co-Working Space, Innovation Hub, Startup Center | User |
| admin@innovationhub.com | `Admin123!` | Admin | Innovation | g1111111-1111-1111-1111-111111111111 | Innovation Hub | Admin |
| staff@innovationhub.com | `Staff123!` | Staff | Innovation | i1111111-1111-1111-1111-111111111111 | Innovation Hub | Janitor |
| bob.smith@innovationhub.com | `BobSmith123!` | Bob | Smith | d1111111-1111-1111-1111-111111111111 | Innovation Hub | User |
| multiuser1@example.com | `MultiUser123!` | Multi | User1 | k1111111-1111-1111-1111-111111111111 | Tech Co-Working Space, Innovation Hub | User |
| multiuser2@example.com | `MultiUser123!` | Multi | User2 | l1111111-1111-1111-1111-111111111111 | Innovation Hub, Startup Center | User |
| multiuser3@example.com | `MultiUser123!` | Multi | User3 | m1111111-1111-1111-1111-111111111111 | Tech Co-Working Space, Innovation Hub, Startup Center | User |
| admin@startupcenter.com | `Admin123!` | Admin | Startup | h1111111-1111-1111-1111-111111111111 | Startup Center | Admin |
| staff@startupcenter.com | `Staff123!` | Staff | Startup | j1111111-1111-1111-1111-111111111111 | Startup Center | Janitor |
| alice.johnson@startupcenter.com | `AliceJohnson123!` | Alice | Johnson | e1111111-1111-1111-1111-111111111111 | Startup Center | User |
| multiuser2@example.com | `MultiUser123!` | Multi | User2 | l1111111-1111-1111-1111-111111111111 | Innovation Hub, Startup Center | User |
| multiuser3@example.com | `MultiUser123!` | Multi | User3 | m1111111-1111-1111-1111-111111111111 | Tech Co-Working Space, Innovation Hub, Startup Center | User |

### User Details

#### Admin User (Tech Co-Working Space)
- **Standing Height**: 750mm
- **Sitting Height**: 650mm
- **Health Reminders**: Medium
- **Sitting Time**: 30 min
- **Standing Time**: 15 min
- **Role**: Admin

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

#### Staff Staffy (Tech Co-Working Space)
- **Standing Height**: 750mm
- **Sitting Height**: 650mm
- **Health Reminders**: Medium
- **Sitting Time**: 30 min
- **Standing Time**: 15 min
- **Has Reservations**: No

#### Admin Innovation (Innovation Hub)
- **Standing Height**: 750mm
- **Sitting Height**: 650mm
- **Health Reminders**: Medium
- **Sitting Time**: 30 min
- **Standing Time**: 15 min
- **Role**: Admin

#### Admin Startup (Startup Center)
- **Standing Height**: 750mm
- **Sitting Height**: 650mm
- **Health Reminders**: Medium
- **Sitting Time**: 30 min
- **Standing Time**: 15 min
- **Role**: Admin

#### Staff Innovation (Innovation Hub)
- **Standing Height**: 750mm
- **Sitting Height**: 650mm
- **Health Reminders**: Medium
- **Sitting Time**: 30 min
- **Standing Time**: 15 min
- **Role**: Janitor

#### Staff Startup (Startup Center)
- **Standing Height**: 750mm
- **Sitting Height**: 650mm
- **Health Reminders**: Medium
- **Sitting Time**: 30 min
- **Standing Time**: 15 min
- **Role**: Janitor

#### Multi User1
- **Standing Height**: 720mm
- **Sitting Height**: 630mm
- **Health Reminders**: High
- **Sitting Time**: 25 min
- **Standing Time**: 10 min
- **Companies**: Tech Co-Working Space, Innovation Hub
- **Has Reservations**: No

#### Multi User2
- **Standing Height**: 700mm
- **Sitting Height**: 620mm
- **Health Reminders**: Medium
- **Sitting Time**: 30 min
- **Standing Time**: 15 min
- **Companies**: Innovation Hub, Startup Center
- **Has Reservations**: No

#### Multi User3
- **Standing Height**: 680mm
- **Sitting Height**: 600mm
- **Health Reminders**: Low
- **Sitting Time**: 45 min
- **Standing Time**: 20 min
- **Companies**: Tech Co-Working Space, Innovation Hub, Startup Center
- **Has Reservations**: No

---

## Companies

| Company Name           | ID                                      | Secret Invite Code | Description                     | SimulatorLink                                          | SimulatorApiKey |
|------------------------|-------------------------------------------|---------------------|---------------------------------|--------------------------------------------------------|------------------|
| Tech Co-Working Space  | 11111111-1111-1111-1111-111111111111      | `TECH2024`         | Main company with multiple rooms | https://s3-sproj-techcowork.michalvalko.eu             | E9Y2LxT4g1hQZ7aD8nR3mWx5P0qK6pV7              |
| Innovation Hub         | 22222222-2222-2222-2222-222222222222      | `INNOVATE`         | Secondary company                | https://s3-sproj-innovationhub.michalvalko.eu          | F7H1vM3kQ5rW8zT9xG2pJ6nY4dL0aZ3K              |
| Startup Center         | 33333333-3333-3333-3333-333333333333      | *(None)*           | Email verification required      | https://s3-sproj-startupcenter.michalvalko.eu          | A3B5C7D9E1F2G4H6I8J0K2L4M6N8O0P2              |

Yes, I did publish the api key to that and no, I do not care :D they are also in the docker-compose so any scrapers, be my guests. 
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

---

## Reservations [ Desk mack addresses are incorrect ]

| ID | User | Desk | Start | End | Status |
|----|------|------|-------|-----|--------|
| a1111111-1111-1111-1111-111111111111 | John Doe | ee:62:5b:b8:73:1d (D-102) | 3 hours ago | In 3 hours | Active |
| b2222222-2222-2222-2222-222222222222 | John Doe | cd:fb:1a:53:fb:e6 (D-101) | Today, 08:00 | Today, 16:00 | Active |
| c3333333-3333-3333-3333-333333333333 | Jane Doe | ee:62:5b:b8:73:1d (D-102) | Tomorrow, 09:00 | Tomorrow, 17:00 | Future |
| d4444444-4444-4444-4444-444444444444 | John Doe | 70:9e:d5:e7:8c:98 (D-103) | In 2 days, 10:00 | In 2 days, 15:00 | Future |
| e5555555-5555-5555-5555-555555555555 | Bob Smith | ce:38:a6:30:af:1d (D-101) | In 3 days, 09:00 | In 3 days, 18:00 | Future |
| f6666666-6666-6666-6666-666666666666 | Jane Doe | 70:9e:d5:e7:8c:98 (D-103) | 35 minutes ago | In 2 hours | **Active - Needs Health Reminder** |

**Note:** The last reservation (f6666666...) is specifically set up to trigger a health reminder on the next system check (every minute). Jane Doe has a Medium health reminder frequency (30 minutes), and her desk (D-103) has `LastHeightChangeTime` set to 35 minutes ago, which exceeds the reminder threshold.

---

## Damage Reports

| ID | Desk | Description | Submitted By | Submit Time | Status | Resolved By | Resolve Time |
|----|------|-------------|--------------|-------------|--------|-------------|--------------|
| a1111111-1111-1111-1111-111111111111 | AA:BB:CC:DD:EE:01 | The desk height adjustment button is stuck and won't respond to presses. | John Doe | 5 days ago | **Unresolved** | - | - |
| b1111111-1111-1111-1111-111111111111 | AA:BB:CC:DD:EE:02 | Desk surface has a scratch on the left side. | Jane Doe | 10 days ago | **Resolved** | Admin User | 3 days ago |
| c1111111-1111-1111-1111-111111111111 | BB:CC:DD:EE:FF:01 | BLE connection keeps disconnecting. Might need battery replacement. | Bob Smith | 2 days ago | **Unresolved** | - | - |

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
- MAC addresses follow format: `xx:xx:xx:xx:xx:xx`
- All heights are in millimeters (mm)
- All times are in UTC
- Secret invite codes are optional (Startup Center doesn't have one)
- **Each company has an Admin and Janitor (Staff) user**
- **Some users belong to multiple companies** (Multi User1, Multi User2, Multi User3) - these users can access resources from all their associated companies

## Health Reminder Testing

The seed data includes a test scenario for the health reminder feature:

- **User:** Jane Doe (Medium frequency = 30 minutes between reminders)
- **Desk:** D-103 (MAC: 70:9e:d5:e7:8c:98)
- **Reservation ID:** f6666666-6666-6666-6666-666666666666
- **Reservation:** Started 35 minutes ago, ends in 2 hours
- **Status:** Desk `LastHeightChangeTime` is set to 35 minutes ago
- **Expected Behavior:** On the next system check (every minute), a buzz reminder will be sent via MQTT to the desk's buzzer because the time since last height change (35 minutes) exceeds Jane's reminder threshold (30 minutes)

To test:
1. Start the application
2. Wait for the next desk height check cycle (up to 1 minute)
3. The system should send a buzz message to desk D-103's buzzer (70:9e:d5:e7:8c:98/buzzer)
4. Change the desk height (via API or simulator) to reset the reminder cycle
5. The buzzer will continue to buzz every minute until the desk height is changed (due to a known bug; this will be fixed in a future update)

**Other reservations remain unchanged for normal testing purposes.**

---
