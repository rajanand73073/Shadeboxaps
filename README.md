# ShadeBox (Anonymous Message + Realtime Chat)

ShadeBox is a full-stack app where users can:

- Create an account (credentials + email verification or Google OAuth)
- send message anonymously to anyone by username without expose of sender details.
- Share a public anonymous message link
- Receive and manage anonymous messages in a dashboard
- Create temporary realtime chat rooms powered by Socket.IO + Redis
- Both Public and Private chat rooms are available

## Live Links 🌐

- Production: [https://shadeboxapp.vercel.app/](https://shadeboxapp.vercel.app/)
- Preview (Git main): [https://shadeboxaps-rz22-git-main-rajanand73073s-projects.vercel.app](https://shadeboxaps-rz22-git-main-rajanand73073s-projects.vercel.app)
- Preview (Deployment): [https://shadeboxaps-rz22-3135e4qhf-rajanand73073s-projects.vercel.app](https://shadeboxaps-rz22-3135e4qhf-rajanand73073s-projects.vercel.app)

## Tech Stack 🧰

- Frontend/API: Next.js (App Router), React, TypeScript
- Auth: NextAuth (Credentials + Google)
- Database: MongoDB (Mongoose)
- Realtime: Socket.IO
- Realtime storage/TTL: Redis
- Styling/UI: Tailwind CSS + ShadCN

## Project Structure

```text
anonymous_message/
  nextfolder/      # Next.js app (UI + API routes + auth + MongoDB models)
  socketserver/    # Express + Socket.IO server (Redis-backed room chat)
  Functional_Decisions.md
  Readme.md
```

## Features ✨

### Implemented

- Credentials signup with OTP verification (`/api/sign-up`, `/api/verify-code`)
- Google OAuth signup/sign-in via NextAuth
- Anonymous message submission to a user by username
- Dashboard inbox with:
  - newest-first message retrieval
  - permanent delete
  - accept/reject incoming anonymous messages toggle
- Temporary room chat with Socket.IO + Redis:
  - room join with shareable `roomId`
  - room chat history
  - anonymous per-room identity
  - message delete broadcast to participants
  - room TTL event and local identity cleanup

### Product Rules (from `Functional_Decisions.md`)

- Auth is required for receiving messages and using protected features
- Anonymous messages can be sent by authenticated and unauthenticated users
- Sender identity remains hidden from receiver
- Public profile/message link is one-per-user and immutable in MVP
- Inbox behavior:
  - newest messages first
  - delete is permanent

### MVP Spec / Planned (not fully implemented yet)

- Anonymous reply flow constraints:
  - only authenticated anonymous senders can receive replies
  - guest anonymous messages are one-way
- Abuse handling:
  - block/report abusive identities
  - threshold-based restriction/removal after repeated reports
- Rich media support in messages (photos/videos/GIFs) with limits
- Private room policy hardening:
  - one active private room per user
  - fixed expiry window (target 1-2 hours)
  - auth-only membership
  - no public discovery
- Public geo-chat rooms:
  - location-based room assignment
  - radius-based room creation/join rules
  - room auto-cleanup
  - 2dsphere-based geospatial lookup

## Prerequisites

- Node.js 18+ (Node.js 20 recommended)
- npm
- MongoDB Atlas/local MongoDB instance
- Redis instance (local or managed)

## Environment Variables

Create `.env` files in both services.

### `nextfolder/.env`

```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXT_PUBLIC_APP_URL=http://localhost:8000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### `socketserver/.env`

```env
REDIS_URL=redis://user:password@host:port
PORT=8000
CORS_ORIGIN=*
```

Note: Keep secrets out of git. Rotate any credentials that were previously committed.

## Install Dependencies

```bash
cd nextfolder
npm install

cd ../socketserver
npm install
```

## Run Locally ▶️

Run both services in separate terminals.

### Terminal 1: Socket server

```bash
cd socketserver
npm run server
```

Runs on `http://localhost:8000` by default.

### Terminal 2: Next.js app

```bash
cd nextfolder
npm run dev
```

Runs on `http://localhost:3000` by default.

## Available Scripts

### `nextfolder`

- `npm run dev` - start Next.js dev server
- `npm run build` - production build
- `npm run start` - run built app
- `npm run lint` - lint
- `npm run format` - prettier write

### `socketserver`

- `npm run server` - dev server via `tsx watch`
- `npm run build` - compile TypeScript
- `npm run start` - run compiled output

## API Routes (Next.js)

- `POST /api/sign-up` - create account + send verification code
- `POST /api/verify-code` - verify OTP
- `GET /api/check-uniqueusername` - username availability
- `POST /api/send-message` - send anonymous message
- `GET /api/get-messages` - fetch logged-in user messages
- `POST /api/delete-messages` - delete message from inbox
- `GET /api/accept-message` - read message acceptance status
- `POST /api/accept-message` - toggle message acceptance

## Core Behavior Details

### Authentication and verification

- `credentials` users must verify OTP before login is allowed
- `google` users are treated as verified on provider sign-in
- Session strategy is JWT via NextAuth

### Anonymous messaging

- Anyone who knows a username can submit a message
- Recipient can disable incoming messages via dashboard switch
- Messages are stored in recipient document and shown newest-first

### Room chat lifecycle

- Users join rooms with `join-room`
- Room messages are stored in Redis list (`room:{roomId}`)
- TTL is set when a room is first created (current code: 5 minutes)
- Server emits `room-ttl` to clients for countdown/cleanup behavior

## Realtime Events (Socket Server)

- `join-room`
- `send-message`
- `receive-message`
- `chat-history`
- `delete-message`
- `message-deleted`
- `room-ttl`

## Deployment Notes 🚀

- Deploy `nextfolder` and `socketserver` as two services.
- Ensure `NEXT_PUBLIC_APP_URL` points to the deployed socket server URL.
- Set production-safe `CORS_ORIGIN` (avoid `*` in production).
- Provision Redis with persistence/availability matching your chat needs.

## Current Known Gaps ⚠️

- No global rate limiting on anonymous message endpoint yet
- No moderation/reporting pipeline implemented in code yet
- Public link format in dashboard should be verified against actual route usage before production
- Functional spec and implementation differ on room expiry (spec targets 1-2 hours; current socket code uses 5 minutes)
