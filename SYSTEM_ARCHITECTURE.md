# System Architecture - Feedback System

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Top Bar     │  │  Auth Dialog │  │  Feedback    │         │
│  │  - Sign In   │  │  - Sign Up   │  │  Dialog      │         │
│  │  - User Menu │  │  - Sign In   │  │  - Submit    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐                           │
│  │ My Feedback  │  │    Admin     │                           │
│  │ - View Own   │  │  Dashboard   │                           │
│  │ - See Reply  │  │  - Respond   │                           │
│  └──────────────┘  └──────────────┘                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      STATE MANAGEMENT                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Zustand Store (flow-store.ts)               │  │
│  │  - Local state management                                │  │
│  │  - Feedback array with responses                         │  │
│  │  - Sync with Firebase                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           Auth Service (auth-service.ts)                 │  │
│  │                                                          │  │
│  │  Authentication:                                         │  │
│  │  • signIn(email, password)                              │  │
│  │  • signUp(email, password)                              │  │
│  │  • signOut()                                            │  │
│  │  • onAuthStateChanged()                                 │  │
│  │                                                          │  │
│  │  User Management:                                        │  │
│  │  • getUserRole(uid)                                     │  │
│  │  • updateUserRole(uid, role)                           │  │
│  │  • isAdmin(uid)                                         │  │
│  │                                                          │  │
│  │  Feedback Management:                                    │  │
│  │  • submitFeedback(feedback)                             │  │
│  │  • getFeedback()                                        │  │
│  │  • getUserFeedback(userId)                              │  │
│  │  • updateFeedbackStatus(id, status)                    │  │
│  │  • addFeedbackResponse(id, message)                    │  │
│  │  • deleteFeedback(id)                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FIREBASE BACKEND                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────┐         ┌────────────────────┐         │
│  │  Authentication    │         │    Firestore DB    │         │
│  │  ───────────────   │         │  ───────────────   │         │
│  │  • User accounts   │         │  Collections:      │         │
│  │  • Email/Password  │         │                    │         │
│  │  • Session mgmt    │         │  📁 users/         │         │
│  └────────────────────┘         │    {userId}        │         │
│                                 │    - email         │         │
│                                 │    - role          │         │
│                                 │    - createdAt     │         │
│                                 │    - lastLogin     │         │
│                                 │                    │         │
│                                 │  📁 feedback/      │         │
│                                 │    {feedbackId}    │         │
│                                 │    - type          │         │
│                                 │    - title         │         │
│                                 │    - description   │         │
│                                 │    - rating        │         │
│                                 │    - status        │         │
│                                 │    - userId        │         │
│                                 │    - responses[]   │         │
│                                 │    - resolvedAt    │         │
│                                 │    - resolvedBy    │         │
│                                 └────────────────────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### User Submits Feedback

```
User fills form
      │
      ▼
FeedbackDialog
      │
      ├─► authService.submitFeedback()
      │         │
      │         ▼
      │   Firebase Firestore
      │   (feedback collection)
      │
      └─► useFlowStore.createFeedback()
            │
            ▼
      Local State Updated
```

### Admin Responds to Feedback

```
Admin clicks expand
      │
      ▼
AdminDashboard
      │
      ├─► Types response
      │
      ▼
authService.addFeedbackResponse()
      │
      ▼
Firebase Firestore
(updates feedback doc)
      │
      ▼
Admin sees confirmation
      │
      ▼
User sees response in "My Feedback"
```

### User Views Their Feedback

```
User clicks "My Feedback"
      │
      ▼
MyFeedbackDialog opens
      │
      ▼
authService.getUserFeedback(userId)
      │
      ▼
Firebase Firestore query
(filter by userId)
      │
      ▼
Returns feedback with responses
      │
      ▼
Display in dialog with admin responses
```

## Security Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Firestore Rules                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Request comes in                                           │
│       │                                                     │
│       ▼                                                     │
│  Check authentication                                       │
│       │                                                     │
│       ├─► Anonymous? ──► Can only CREATE feedback          │
│       │                                                     │
│       ├─► User? ──────► Can READ own feedback              │
│       │                 Can CREATE feedback                │
│       │                                                     │
│       └─► Admin? ─────► Can READ all feedback              │
│                         Can UPDATE feedback                │
│                         Can DELETE feedback                │
│                         Can ADD responses                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
App
 │
 ├─ TopBar
 │   ├─ AuthDialog (sign in/up)
 │   ├─ FeedbackDialog (submit)
 │   ├─ MyFeedbackDialog (view own)
 │   └─ User Menu
 │
 ├─ Sidebar
 │
 ├─ Main Content
 │   ├─ Kanban View
 │   ├─ List View
 │   ├─ Calendar View
 │   └─ Admin View
 │       └─ AdminDashboard
 │           └─ Feedback Items
 │               └─ Response Form
 │
 └─ Command Palette
```

## State Management Flow

```
┌──────────────────────────────────────────────────────────┐
│                    Zustand Store                         │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  State:                                                  │
│  • feedback: Feedback[]                                  │
│  • projects, tasks, notes, etc.                         │
│                                                          │
│  Actions:                                                │
│  • createFeedback()                                      │
│  • updateFeedback()                                      │
│  • deleteFeedback()                                      │
│  • addFeedbackResponse()                                 │
│  • loadFeedbackFromFirebase()                           │
│                                                          │
│  Persistence:                                            │
│  • localStorage (via persist middleware)                │
│  • Firebase Firestore (via auth-service)                │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## Authentication Flow

```
┌─────────────────────────────────────────────────────────┐
│                  Authentication Flow                    │
└─────────────────────────────────────────────────────────┘

Sign Up:
  User enters email/password
       │
       ▼
  authService.signUp()
       │
       ▼
  Firebase creates user
       │
       ▼
  Create user doc in Firestore
  (role: 'user')
       │
       ▼
  User logged in

Sign In:
  User enters email/password
       │
       ▼
  authService.signIn()
       │
       ▼
  Firebase validates
       │
       ▼
  Update lastLogin
       │
       ▼
  User logged in

Auth State:
  onAuthStateChanged listener
       │
       ▼
  Updates currentUser in TopBar
       │
       ▼
  UI updates (show/hide features)
```

## Key Design Decisions

### 1. Dual Storage Strategy
- **Local (Zustand)**: Fast access, offline capability
- **Remote (Firebase)**: Persistence, sync across devices

### 2. Role-Based Access
- **User**: Can view own feedback
- **Admin**: Can manage all feedback
- **Anonymous**: Can submit feedback

### 3. Response Architecture
- Responses stored as array in feedback document
- Each response has ID, message, admin email, timestamp
- Allows multiple responses per feedback

### 4. Status Workflow
```
pending → reviewed → resolved
   ↓         ↓          ↓
 New    Admin saw   Fixed/Done
```

### 5. Security Layers
- Firebase Authentication (who you are)
- Firestore Rules (what you can do)
- Client-side checks (UI optimization)

## Performance Considerations

### Optimizations
- Lazy loading of dialogs
- Pagination ready (not implemented yet)
- Indexed queries in Firestore
- Local state caching

### Potential Bottlenecks
- Loading all feedback at once
- Large response arrays
- No pagination
- Bundle size (1.6MB)

### Future Improvements
- Implement pagination
- Add real-time listeners
- Optimize bundle splitting
- Add service worker for offline
