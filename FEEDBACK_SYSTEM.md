# Feedback System with Admin Responses

## Overview
The feedback system now includes full Firebase integration with admin response capabilities and email/password authentication.

## Features

### 1. Email/Password Authentication
- Users can sign up and sign in with email/password
- Firebase Authentication handles all auth logic
- User roles stored in Firestore (`users` collection)
- Automatic role assignment (default: 'user', can be upgraded to 'admin')

### 2. User Feedback Submission
- Users can submit feedback (bug reports, feature requests, improvements, general)
- Feedback synced to Firebase Firestore
- Users can submit feedback anonymously or while logged in
- Logged-in users can track their feedback

### 3. Admin Response System
- Admins can view all feedback in the admin dashboard
- Admins can respond to feedback with messages
- Multiple responses per feedback item supported
- Status tracking: pending → reviewed → resolved
- Resolution tracking with timestamp and admin email

### 4. User Feedback View
- Logged-in users can view their submitted feedback
- Users see all admin responses to their feedback
- Real-time status updates (pending/reviewed/resolved)
- Resolution timestamps displayed

## Firebase Structure

### Collections

#### `users/{userId}`
```typescript
{
  email: string
  role: 'user' | 'admin'
  createdAt: Date
  lastLogin: Date
}
```

#### `feedback/{feedbackId}`
```typescript
{
  type: 'bug' | 'feature' | 'improvement' | 'general'
  title: string
  description: string
  rating: number
  userEmail?: string
  userId?: string
  createdAt: Date
  status: 'pending' | 'reviewed' | 'resolved'
  responses: Array<{
    id: string
    message: string
    adminEmail: string
    createdAt: Date
  }>
  resolvedAt?: Date
  resolvedBy?: string
}
```

## Firestore Security Rules

The security rules ensure:
- Users can read/write their own user documents
- Admins can read all user documents
- Anyone can create feedback (even anonymous)
- Users can read their own feedback to see responses
- Only admins can update/delete feedback
- Only admins can add responses

## Usage

### For Users

1. **Sign Up/Sign In**
   - Click "Sign In" button in top bar
   - Choose "Sign Up" to create account or "Sign In" to login
   - Email and password required (min 6 characters)

2. **Submit Feedback**
   - Click feedback icon or use user menu → "Send Feedback"
   - Choose feedback type (bug, feature, improvement, general)
   - Fill in title, description, and rating
   - Submit (works with or without login)

3. **View Your Feedback**
   - Login required
   - User menu → "My Feedback"
   - See all your feedback with admin responses
   - Track status changes and resolutions

### For Admins

1. **Access Admin Dashboard**
   - Navigate to admin panel (password: admin123)
   - View all feedback with filters and search

2. **Respond to Feedback**
   - Click expand button (chevron) on any feedback
   - Type response message
   - Click "Send Response"
   - Response visible to user immediately

3. **Manage Feedback Status**
   - Change status dropdown: Pending → Reviewed → Resolved
   - Resolved status automatically adds timestamp
   - Delete feedback if needed

## Setup Instructions

1. **Firebase Configuration**
   - Firebase project already configured in `src/lib/firebase.ts`
   - Firestore and Authentication enabled

2. **Deploy Firestore Rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

3. **Create First Admin User**
   - Sign up normally through the app
   - Manually update user role in Firestore console:
     - Go to Firestore → users → {userId}
     - Change `role` field from 'user' to 'admin'

## API Methods

### Auth Service (`src/services/auth-service.ts`)

```typescript
// Authentication
authService.signIn(email, password)
authService.signUp(email, password)
authService.signOut()
authService.onAuthStateChanged(callback)

// User Management
authService.getUserRole(uid)
authService.updateUserRole(uid, role)
authService.isAdmin(uid)

// Feedback Management
authService.submitFeedback(feedback)
authService.getFeedback()
authService.getUserFeedback(userId)
authService.updateFeedbackStatus(feedbackId, status)
authService.addFeedbackResponse(feedbackId, message)
authService.deleteFeedback(feedbackId)
```

## Components

- `AuthDialog` - Email/password login and signup
- `FeedbackDialog` - Submit new feedback
- `MyFeedbackDialog` - View user's feedback with responses
- `AdminDashboard` - Admin panel with response functionality
- `TopBar` - Updated with auth state and user menu

## Notes

- Feedback syncs to both local storage (Zustand) and Firebase
- Admin responses are real-time via Firebase
- Users must be logged in to see their feedback history
- Anonymous feedback submission still supported
- All dates stored as Firebase Timestamps for consistency
