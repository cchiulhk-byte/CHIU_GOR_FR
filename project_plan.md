# Chiu Gor French - Trilingual Portfolio Website

## 1. Project Description
A vibrant, fun yet professional portfolio website for "Chiu Gor French" - a French language teaching business. The site showcases the teacher's background, experience, courses offered, and contact information. Target audience: students in Hong Kong/Taiwan interested in learning French. Core value: making French learning accessible, fun, and engaging.

## 2. Page Structure
- `/` - Home (single-page with sections: About Me, My Experience, My Courses, Contact)
- `/booking` - Course Booking Page (date/time selection, student info)
- `/payment` - Payment Page (credit card via Stripe, FPS, PayMe, AlipayHK)

## 3. Core Features
- [x] Trilingual support (Traditional Chinese, French, English) with language switcher
- [x] Single-page scrollable layout with 4 main sections
- [x] Responsive design for mobile/tablet/desktop
- [x] Contact form with WhatsApp, Instagram, Threads links in footer
- [x] Fun, colorful but professional design
- [x] Custom fonts: Candara (EN/FR), Chiron GoRound TC (ZH)
- [x] Course booking system with Supabase database
- [x] Google Calendar sync Edge Function (deployed, needs credentials)
- [x] Payment system (FPS, PayMe, AlipayHK) with Supabase updates
- [ ] Credit card payments via Stripe (waiting for user authentication)
- [ ] Google Calendar API credentials setup (waiting for user)

## 4. Data Model Design

### Table: bookings (CREATED)
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| student_name | text | Student's name |
| student_email | text | Student's email |
| student_phone | text | Student's phone |
| course_type | text | Selected course type |
| preferred_date | date | Preferred lesson date |
| preferred_time | text | Preferred time slot |
| status | text | pending / confirmed / cancelled |
| payment_method | text | stripe / fps / payme / alipayhk |
| payment_status | text | pending / paid / failed |
| google_event_id | text | Google Calendar event ID |
| created_at | timestamp | Booking creation time |

RLS Policies: Allow anonymous insert, select, update for booking flow.

## 5. Backend / Third-party Integration Plan
- Supabase: **CONNECTED** - Database for bookings, Edge Functions for Google Calendar API
- Google Calendar API: **Edge Function DEPLOYED** - Needs service account credentials (GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_CALENDAR_ID secrets)
- Stripe: **PENDING** - Credit card payments (user has account, needs authentication)
- HK Payment Methods: FPS (61985259), PayMe, AlipayHK - manual QR code / redirect flow, payment status tracked in Supabase

## 6. Development Phase Plan

### Phase 1: Foundation & Homepage (COMPLETED)
- Goal: Set up i18n, fonts, design system, and build the complete homepage
- Deliverable: Fully functional single-page website with all 4 sections, footer, language switcher, and contact form

### Phase 2: Booking System (COMPLETED)
- Goal: Build course booking flow with form, database storage, and Google Calendar sync
- Deliverable: /booking page with date/time picker, form validation, Supabase storage, Google Calendar integration Edge Function
- Status: Bookings save to Supabase. Calendar sync Edge Function deployed. Needs Google Cloud service account credentials.

### Phase 3: Payment System (COMPLETED - partial)
- Goal: Build payment page supporting credit card (Stripe), FPS, PayMe, AlipayHK
- Deliverable: /payment page with multiple payment options, Supabase payment tracking
- Status: FPS, PayMe, AlipayHK working with Supabase updates. Stripe credit card pending user authentication.
