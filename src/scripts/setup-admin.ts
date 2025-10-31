// This script sets up the demo admin user
// Run this once to create the admin account in Firebase

import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export async function setupDemoAdmin() {
  try {
    console.log('Creating demo admin user...');
    
    // Create admin user
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      'admin@flowstate.com', 
      'admin123'
    );
    
    const user = userCredential.user;
    
    // Set admin role in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: 'admin@flowstate.com',
      role: 'admin',
      createdAt: new Date(),
      lastLogin: new Date()
    });
    
    console.log('Demo admin user created successfully!');
    console.log('Email: admin@flowstate.com');
    console.log('Password: admin123');
    
    return user;
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('Admin user already exists');
      return null;
    }
    console.error('Error creating admin user:', error);
    throw error;
  }
}

// Auto-run setup when this file is imported
if (typeof window !== 'undefined') {
  // Only run in browser environment
  setupDemoAdmin().catch(console.error);
}