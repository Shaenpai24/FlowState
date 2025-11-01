# Admin Setup Guide

## Creating Your First Admin User

Since the app defaults all new users to the 'user' role, you'll need to manually promote your first admin user.

### Method 1: Firebase Console (Recommended)

1. **Create a user account**
   - Open your app
   - Click "Sign In" → "Sign Up"
   - Create an account with your admin email

2. **Promote to admin in Firebase Console**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Select your project: `love-da-code`
   - Navigate to Firestore Database
   - Find the `users` collection
   - Locate your user document (by email)
   - Edit the document
   - Change `role` field from `"user"` to `"admin"`
   - Save changes

3. **Verify admin access**
   - Refresh your app
   - You should now have admin privileges
   - Access the admin dashboard to manage feedback

### Method 2: Using Firebase Admin SDK (For Developers)

If you have Node.js and Firebase Admin SDK set up:

```javascript
const admin = require('firebase-admin');

// Initialize admin SDK
admin.initializeApp({
  credential: admin.credential.applicationDefault()
});

const db = admin.firestore();

// Update user role
async function makeAdmin(email) {
  const usersRef = db.collection('users');
  const snapshot = await usersRef.where('email', '==', email).get();
  
  if (snapshot.empty) {
    console.log('User not found');
    return;
  }
  
  snapshot.forEach(async (doc) => {
    await doc.ref.update({ role: 'admin' });
    console.log(`User ${email} is now an admin`);
  });
}

// Usage
makeAdmin('your-admin@email.com');
```

## Admin Features

Once you have admin access, you can:

1. **View All Feedback**
   - Access admin dashboard (password: admin123)
   - See all user feedback with filters

2. **Respond to Users**
   - Click expand on any feedback
   - Type and send responses
   - Users see responses in "My Feedback"

3. **Manage Status**
   - Update feedback status (pending/reviewed/resolved)
   - Track resolution timestamps
   - Delete inappropriate feedback

4. **Monitor Metrics**
   - Total feedback count
   - Pending reviews
   - Average rating
   - Bug report count

## Security Notes

- Only users with `role: 'admin'` can access admin features
- Firestore rules enforce admin-only operations
- Regular users cannot modify their own role
- Admin responses are attributed to admin email
- All admin actions are logged with timestamps

## Troubleshooting

**Can't access admin dashboard?**
- Verify your user role is set to 'admin' in Firestore
- Try logging out and back in
- Check browser console for errors

**Responses not showing?**
- Ensure Firestore rules are deployed
- Check Firebase console for rule errors
- Verify admin is logged in when responding

**Users can't see responses?**
- Users must be logged in
- Feedback must have been submitted while logged in
- Check Firestore rules allow user read access
