## 1. Authentication

- Users must authenticate to RECEIVE messages/Crete private or public chat room and use other benefits
- Permissions are requested only when required by a feature
- Anonymous messages can be sent by:
  - Unauthenticated users (guest anonymous)
  - Authenticated users (anonymous identity)
- If sender is authenticated:
  - Sender may receive replies
  - Sender identity remains hidden from receiver
- If sender is unauthenticated:
  - Sender cannot receive replies
  - Message is strictly one-way
- If user SIGNUP using credentials then receive OTP for verified user.
- BUT if User SigUp Using Oauth Provider then Verified User without OTP
- If User SignIN using Googleauth or credntial email and both have same email then return same token
## 2.Reply Rules (Anonymous Messaging)

- Replies are allowed only to authenticated anonymous senders
- Replies are delivered via in-app inbox
- Receiver never sees sender’s real identity
- Unauthenticated anonymous messages cannot be replied to
  
## 3. Public Link
- One link per user
- Link is auto-generated
- Link is immutable in MVP

## 4. Messaging
- Anyone with link/Username can send message
- Messages can be text-only or photos or videos or all
- Max length: 500 chars

## 5. Inbox
- Messages are shown newest first
- Deleted messages are permanently removed

## 6. Abuse Protection
- Block abusive Ids
- permanently Delete Ids if more than 10 Report happen in that account

## 7. Private Chat Room
 ### Functionalities
- Only once user can create private chat room within expiry time
- Other members can join room with sharable link
- Chat room is available  only for 1-2 hr

- Report Abusive Ids if report > 10
 ###  Message Snippet 
- reply
- delete(only own message)
- copy
- max length : 200 character

## 8. Private Chat Room (MVP)

### Core Rules
- A user can create only one private room at a time
- Room expires after a fixed duration (1–2 hours)
- Room is accessible only via invite link
- Rooms are deleted after expiry

### Membership
- Only authenticated users can join
- No public discovery

### Messages
- Messages can be text-only, photos,videos or gifs
- Messages cannot be edited
- Users can delete only their own messages
- Allow GIFs only via Giphy API (no uploads)

### Message Actions
- Reply (inline, no threads)
- Copy text
- Delete own message

### Abuse Handling
- Users can report participants
- ≥10 reports (global) → temporary restriction from private rooms

### Non-Goals (MVP)
- Threads
- Read receipts
- Typing indicators


## 9. Public Chat Room
- Dynamic Geo Public Rooms (MVP)
- Users grant location permission after signup
- Public rooms are created dynamically
- First user in an area creates the room
- Room center = creator's location
- Room radius = 5/10 km
- User joins nearest room within 5 km
- If no room is found, a new one is created
- Location is checked only at join time
- Rooms auto-delete after 1/2 hr in MVP
- Users have pseudo-anonymous nicknames/avatar
- use Geolocation feature and MongoDB2Dsphere index for navigation 
### Messages
- Messages can be text-only, photos,videos or gifs
- Messages cannot be edited
- Users can delete only their own messages
- Allow GIFs only via Giphy API (no uploads)

### Message Actions
- Reply (inline, no threads)
- Copy text
- Delete own message

### Abuse Handling
- Users can report participants
- ≥10 reports (global) → temporary restriction from private rooms


