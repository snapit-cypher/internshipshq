# InternshipsHQ (Next.js Project)

## Developement Tools

- Node v20.16.0
- pnpm 10.6.2

## Heading Utility Classes

The following utility classes are used for responsive headings throughout the project:

| Class                     | Typical Pixel Size (max) | Usage Example                                                    |
| ------------------------- | ------------------------ | ---------------------------------------------------------------- |
| `.text-heading-h1`        | 64px                     | Hero Title                                                       |
| `.text-heading-h2`        | 24px                     | Section titles                                                   |
| `.text-heading-h3`        | 18x                      | subtile title (Latest job posts)                                 |
| `.text-heading-h4`        | 16px                     | Used Here "Entry level software developer jobs (Remote & Hybrid) |
| `.text-heading-h5`        | 15px                     | Faq Titles                                                       |
| `.text-paragraph-section` | 18px - Regular           | Section lead paragraphs(For Hero TitleWrapper para)              |
| `.text-paragraph`         | 15px - Regular           | Inner Wrapper Text                                               |

- These sizes are the maximum values as defined by the `clamp` function in the CSS.
- The actual size will be responsive and may scale down on smaller screens.
- See `src/styles/globals.css` for the exact clamp values and responsive behavior.

## Colors Relationship to Figma File

| Color Name   | Hex Value |
| ------------ | --------- |
| `Muted`      | #f2f2f4   |
| `Secondary`  | #f9f9f9   |
| `Foreground` | #1A1B25   |
| `Accent`     | #fff0ce   |

## Backend Architecture (RapidAPI Integration)

### Overview

InternshipsHQ fetches job data from RapidAPI Active Jobs DB and stores it in PostgreSQL. The system is designed to work within a monthly budget of **20,000 requests** and **20,000 jobs**.

### System Flow

```
Cron Schedule → API Endpoints → Job Sync Service → Components → Database
                                       ↓
                     ┌─────────────────┼─────────────────┐
                     ↓                 ↓                 ↓
              RapidAPI Client   Job Processor   Usage Tracker
                     ↓                 ↓                 ↓
                  Fetch Jobs    Transform & Upsert   Track Budget
                                       ↓
                                   LogSnag
                                (Monitoring)
```

### Core Components

#### 1. **RapidAPI Client** (`src/lib/rapidapi-client.ts`)

- Handles all HTTP requests to RapidAPI
- 4 endpoints: Hourly (1h), Daily (1d), Modified, Expired
- 30-second timeout with abort handling
- Parses rate limit headers from API responses
- Returns: Job data + real-time usage info

#### 2. **Job Processor** (`src/lib/job-processor.ts`)

- Transforms API format → Database format (68 fields)
- **Upsert Strategy**: `ON CONFLICT DO UPDATE` prevents duplicates
- Handles: NULL values, JSONB arrays, type conversions
- Soft deletes: Marks jobs as expired instead of deleting

#### 3. **Usage Tracker** (`src/lib/usage-tracker.ts`)

- Manages monthly budget (20k requests, 20k jobs)
- **Before API call**: Checks if budget allows request
- **After success**: Records usage to database
- **On failure**: Logs error (doesn't count against budget)
- **Important**: Modified/Expired endpoints count towards Requests ONLY

#### 4. **LogSnag** (`src/lib/logsnag.ts`)

- Sends events to LogSnag for monitoring
- Channels: jobs, budget, sync, errors
- Budget warnings at 80% usage
- Never throws - fails silently to avoid breaking sync

#### 5. **Job Sync Service** (`src/server/services/job-sync.ts`)

- **Main orchestrator** - coordinates all components
- Flow for each sync:
  1. Check budget (blocks if exceeded)
  2. Fetch from RapidAPI
  3. Process jobs (upsert)
  4. Record usage
  5. Log to LogSnag
  6. Return detailed result

### API Endpoints

All endpoints require authentication: `Authorization: Bearer CRON_SECRET`

| Endpoint              | Purpose             | Schedule      | Budget Impact       |
| --------------------- | ------------------- | ------------- | ------------------- |
| `/api/cron/firehose`  | Hourly jobs (1h)    | Every hour    | Requests + Jobs     |
| `/api/cron/daily`     | Daily jobs (24h)    | Once daily    | Requests + Jobs     |
| `/api/cron/modified`  | Modified jobs       | Twice weekly  | Requests ONLY       |
| `/api/cron/expired`   | Mark expired jobs   | Daily at 2 AM | Requests ONLY       |
| `/api/admin/backfill` | Manual sync (admin) | On-demand     | Depends on endpoint |

### Production Cron Schedules

**Recommended Production Schedule:**

| Endpoint             | Schedule (UTC) | Frequency | Jobs/Call       | Total Jobs/Month | Rationale                                              |
| -------------------- | -------------- | --------- | --------------- | ---------------- | ------------------------------------------------------ |
| `/api/cron/firehose` | `0 */4 * * *`  | Every 4h  | 100             | ~18,000          | Fresh jobs every 4 hours, no pagination needed         |
| `/api/cron/daily`    | `0 6 * * *`    | Daily 6AM | 200 (paginated) | ~6,000           | Catch-all for missed jobs, runs during low traffic     |
| `/api/cron/modified` | `0 2 * * 1,4`  | Mon & Thu | 500             | 0                | Update existing jobs twice weekly (doesn't count jobs) |
| `/api/cron/expired`  | `0 3 * * *`    | Daily 3AM | 0 (IDs only)    | 0                | Clean up expired jobs daily (doesn't count jobs)       |

**Budget Impact Analysis:**

- **Hourly**: 6 calls/day × 30 days = 180 requests, ~18,000 jobs
- **Daily**: 30 requests, ~6,000 jobs (200 jobs/call × 30 days)
- **Modified**: 8 requests/month (2/week × 4 weeks), 0 jobs
- **Expired**: 30 requests/month, 0 jobs
- **Total**: ~248 requests/month, ~24,000 jobs/month

**⚠️ Adjusted Schedule (Within 20k Budget):**

Since the above exceeds the 20k jobs limit, use this adjusted schedule:

| Endpoint             | Schedule (UTC) | Frequency | Jobs/Call       | Total Jobs/Month | Notes                                             |
| -------------------- | -------------- | --------- | --------------- | ---------------- | ------------------------------------------------- |
| `/api/cron/firehose` | `0 */6 * * *`  | Every 6h  | 100             | ~12,000          | 4 calls/day = fresh jobs without exceeding budget |
| `/api/cron/daily`    | `0 6 * * *`    | Daily 6AM | 200 (paginated) | ~6,000           | 2 API calls per sync (offset pagination)          |
| `/api/cron/modified` | `0 2 * * 1,4`  | Mon & Thu | 500             | 0                | Doesn't consume jobs budget - updates only        |
| `/api/cron/expired`  | `0 3 * * *`    | Daily 3AM | 0 (IDs only)    | 0                | Doesn't consume jobs budget - IDs only            |

**Final Budget**: ~278 requests/month, ~18,000 jobs/month ✅ (Within 20k limit)

**Pagination Strategy:**

- **Hourly**: Single call (limit=100, no pagination - API hard limit)
- **Daily**: Automatic pagination to fetch 200 jobs (2 calls with offset: 0, 100)
- **Modified**: Single call (limit=500, usually sufficient for 24h changes)
- **Expired**: Single call (returns all expired job IDs, no pagination supported)

**Why This Works:**

1. **Hourly firehose** catches fresh jobs throughout the day (every 6 hours)
2. **Daily sync** fills gaps with pagination (2 API calls for 200 jobs)
3. **Modified endpoint** is budget-friendly (doesn't count towards jobs)
4. **Expired endpoint** keeps database clean (doesn't count towards jobs)
5. **Total usage** stays comfortably under 20k requests + 20k jobs limit

### Budget Strategy

**Monthly Limits**: 20,000 requests | 20,000 jobs

**Key Rules**:

1. **Hourly/Daily endpoints**: Count towards BOTH Requests AND Jobs
2. **Modified/Expired endpoints**: Count towards Requests ONLY (NOT Jobs)
3. **Failed API calls**: Don't count against budget
4. **Upsert**: Running sync twice doesn't create duplicates

**Why This Matters**:

- Can make **20,000 Modified calls/month** without burning Jobs budget
- Expired endpoint can run daily without affecting Jobs count
- Budget resets automatically each month (query-based, no manual reset)

### Database Tables

| Table               | Purpose                       |
| ------------------- | ----------------------------- |
| `jobs`              | Job listings (68 fields)      |
| `api_usage_logs`    | Tracks all API calls + usage  |
| `pending_payments`  | Payment sync (guest → user)   |
| `email_subscribers` | Daily digest subscribers      |
| `alert_preferences` | Custom job alerts (pro users) |

### Database Views (Monitoring)

Query these directly from database manager:

- `api_usage_monthly` - Monthly usage summary
- `api_usage_daily` - Daily breakdown by endpoint
- `job_stats_daily` - Daily job statistics
- `job_stats_by_source` - Stats grouped by source
- `budget_status_current` - Real-time budget at a glance

### Upsert Logic (Prevents Duplicates)

**Problem**: Running sync twice would create duplicate jobs

**Solution**: `ON CONFLICT DO UPDATE`

```typescript
await db.insert(jobs).values(job).onConflictDoUpdate({
  target: jobs.id, // Conflict on job ID
  set: {
    /* update all 68 fields */
  },
});
```

**Result**: If job exists, updates it. If new, inserts it. No duplicates!

### Error Handling

1. **Budget exceeded**: Blocks API call, sends alert to LogSnag
2. **API timeout**: Aborts after 30 seconds, logs error
3. **Failed requests**: Recorded but don't count against budget
4. **LogSnag failures**: Logged to console, doesn't break sync

### Testing Strategy

1. **Budget check**: `GET /api/admin/backfill` (no API calls)
2. **Small test**: `POST /api/admin/backfill` with `limit: 10`
3. **Upsert test**: Run same request twice, verify `inserted: 0, updated: 10`
4. **Monitor**: Check database views and LogSnag dashboard

### Production Deployment

1. Set `CRON_SECRET` in environment
2. Configure Railway cron jobs with schedules
3. Monitor via database views and LogSnag
4. Budget warnings trigger at 80% usage

### Key Files Reference

- **Types**: `src/lib/types.ts`
- **Schema**: `src/server/db/schema/business.ts`
- **Migrations**: `src/server/db/migrations/`
- **Cron Endpoints**: `src/app/api/cron/`
- **Admin API**: `src/app/api/admin/backfill/route.ts`

For detailed implementation guide, see `mds/MILESTONE_2_COMPLETE.md`

## Authentication System

### Overview

InternshipsHQ uses NextAuth.js v5 with three authentication providers:

1. **Email/Password** (Credentials) - For traditional signup/login
2. **Google OAuth** - For Google sign-in

### Authentication Providers

#### 1. Email/Password Authentication

**Signup Flow:**

- User calls `/api/auth/signup` with email + password (min 6 characters)
- System checks if email already exists → Error if yes
- Password is hashed using bcrypt (10 salt rounds)
- User record created with `emailVerified` set to current timestamp (no verification email sent)
- Database trigger checks for completed payments and auto-grants Pro status
- User then signs in via credentials provider

**Login Flow:**

- User provides email + password via NextAuth credentials provider
- System checks if user exists → Error if no
- If user has no password (OAuth user), returns error message
- Verifies password using bcrypt
- Creates session on success

**Key Files:**

- `/src/app/api/auth/signup/route.ts` - Signup API endpoint
- `/src/server/auth/config.ts` - NextAuth configuration (login only)
- `/src/lib/password.ts` - Password hashing utilities (bcrypt)

#### 2. Google OAuth

**Setup:**

- Requires `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` environment variables
- OAuth flow handled by NextAuth GoogleProvider
- User profile data auto-populated from Google

**To Get Google OAuth Credentials:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Set authorized redirect URI: `{YOUR_DOMAIN}/api/auth/callback/google`

#### 3. Discord OAuth

**Setup:**

- Already configured with `AUTH_DISCORD_ID` and `AUTH_DISCORD_SECRET`
- OAuth flow handled by NextAuth DiscordProvider

### Payment → User Account Linking

**Problem:** User can purchase Pro plan BEFORE creating an account (guest checkout).

**Solution:** Database trigger automatically links completed payments to new accounts.

**Flow:**

1. Guest purchases Pro plan → Payment marked as `completed` in `pending_payments` table
2. User signs up with same email → Trigger fires
3. Trigger finds matching `completed` payment
4. Sets `hasPro = true` and `proPurchasedAt` on user record
5. Marks payment as linked (`syncedAt` timestamp updated)

**Migration File:** `/src/server/db/migrations/update_payment_link_trigger.sql`

**Trigger Details:**

- **Function:** `sync_pending_payment_on_user_insert()`
- **Fires:** AFTER INSERT on `users` table
- **Looks for:** Payments with `status = 'completed'` (case-insensitive email match)
- **Race condition protection:** Uses `FOR UPDATE` lock
- **Order:** Most recent payment first (`ORDER BY created_at DESC`)

### Database Schema

**Users Table Fields:**

- `id` - UUID primary key
- `email` - Unique, not null
- `password` - VARCHAR(255), nullable (null for OAuth users)
- `name`, `image` - Profile data (from OAuth or manual)
- `emailVerified` - Timestamp (set immediately, no verification email)
- `hasPro` - Boolean (upgraded via payment linking)
- `proPurchasedAt` - Timestamp of Pro upgrade
- `stripeCustomerId`, `stripeSubscriptionId` - For subscription management
- `subscriptionStatus`, `subscriptionPeriodEnd` - Alert subscription tracking

**Migration File:** `/src/server/db/migrations/add_password_field_to_users.sql`

### Session Management

**Session Callback:** Enriches session with full user data from database.

**Session Object Includes:**

- `user.id` - User UUID
- `user.email`, `user.name`, `user.image` - Profile
- `user.hasPro` - Pro plan status (boolean)
- `user.proPurchasedAt` - When Pro was purchased
- `user.stripeCustomerId` - For customer portal access
- `user.subscriptionStatus` - Alert subscription status
- All other user table fields

### Security Features

1. **Password Hashing:** Bcrypt with 10 salt rounds (industry standard)
2. **Minimum Password Length:** 6 characters (enforced by Zod schema)
3. **OAuth Separation:** OAuth users cannot use email/password login
4. **Case-Insensitive Email:** Database trigger and lookups handle case variations
5. **Race Condition Protection:** Payment linking uses `FOR UPDATE` lock

### Environment Variables Required

```env
# NextAuth
AUTH_SECRET=<random-secret-string>

# Google OAuth
AUTH_GOOGLE_ID=<google-client-id>
AUTH_GOOGLE_SECRET=<google-client-secret>
```

### Key Files Reference

- **Signup API:** `/src/app/api/auth/signup/route.ts`
- **Auth Config:** `/src/server/auth/config.ts` (login only)
- **Password Utils:** `/src/lib/password.ts`
- **User Schema:** `/src/server/db/schema/users.ts`
- **Migrations:** `/src/server/db/migrations/`
  - `add_password_field_to_users.sql`
  - `update_payment_link_trigger.sql`
  - `sync_pending_payment_trigger.sql` (original trigger - replaced by update)

### Testing Authentication

**Test Email/Password Signup:**

1. Make sure `bcryptjs` is installed: `pnpm add bcryptjs @types/bcryptjs`
2. Run migrations to add password field
3. Call `/api/auth/signup` with email + password
4. Verify password is hashed in database (should start with `$2a$` or `$2b$`)
5. Sign in with same credentials using NextAuth

**Test Payment Linking:**

1. Create payment with status `completed` for test email
2. Sign up with same email
3. Verify user has `hasPro = true` and `proPurchasedAt` set
4. Verify payment has `syncedAt` timestamp

**Test OAuth:**

1. Ensure Google/Discord OAuth credentials are set
2. Test OAuth login flow
3. Verify user profile data populated from provider

For detailed authentication implementation, see `mds/MILESTONE_5_AUTHENTICATION.md`
