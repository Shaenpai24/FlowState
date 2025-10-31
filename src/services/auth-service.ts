import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy 
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export interface UserRole {
  uid: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: Date;
  lastLogin?: Date;
}

export interface FeedbackDoc {
  id: string;
  type: 'bug' | 'feature' | 'improvement' | 'general';
  title: string;
  description: string;
  rating: number;
  userEmail?: string;
  userId?: string;
  createdAt: Date;
  status: 'pending' | 'reviewed' | 'resolved';
}

class AuthService {
  // Authentication methods
  async signIn(email: string, password: string) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await this.updateLastLogin(result.user.uid);
      return result.user;
    } catch (error) {
      throw error;
    }
  }

  async signUp(email: string, password: string) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user role document
      await this.createUserRole(result.user.uid, email, 'user');
      
      return result.user;
    } catch (error) {
      throw error;
    }
  }

  async signOut() {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  }

  // User role management
  async createUserRole(uid: string, email: string, role: 'user' | 'admin' = 'user') {
    try {
      const userRole: Omit<UserRole, 'uid'> = {
        email,
        role,
        createdAt: new Date(),
        lastLogin: new Date()
      };
      
      await setDoc(doc(db, 'users', uid), userRole);
    } catch (error) {
      console.error('Error creating user role:', error);
      throw error;
    }
  }

  async getUserRole(uid: string): Promise<UserRole | null> {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          uid,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate(),
          lastLogin: docSnap.data().lastLogin?.toDate()
        } as UserRole;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user role:', error);
      return null;
    }
  }

  async updateUserRole(uid: string, role: 'user' | 'admin') {
    try {
      const docRef = doc(db, 'users', uid);
      await updateDoc(docRef, { role });
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  async updateLastLogin(uid: string) {
    try {
      const docRef = doc(db, 'users', uid);
      await updateDoc(docRef, { lastLogin: new Date() });
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  }

  async isAdmin(uid: string): Promise<boolean> {
    const userRole = await this.getUserRole(uid);
    return userRole?.role === 'admin';
  }

  // Feedback management
  async submitFeedback(feedback: Omit<FeedbackDoc, 'id' | 'createdAt' | 'status'>) {
    try {
      const feedbackData = {
        ...feedback,
        createdAt: new Date(),
        status: 'pending' as const,
        userId: auth.currentUser?.uid
      };
      
      const docRef = await addDoc(collection(db, 'feedback'), feedbackData);
      return docRef.id;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  }

  async getFeedback(): Promise<FeedbackDoc[]> {
    try {
      const q = query(collection(db, 'feedback'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      })) as FeedbackDoc[];
    } catch (error) {
      console.error('Error getting feedback:', error);
      return [];
    }
  }

  async updateFeedbackStatus(feedbackId: string, status: 'pending' | 'reviewed' | 'resolved') {
    try {
      const docRef = doc(db, 'feedback', feedbackId);
      await updateDoc(docRef, { status });
    } catch (error) {
      console.error('Error updating feedback status:', error);
      throw error;
    }
  }

  async deleteFeedback(feedbackId: string) {
    try {
      await deleteDoc(doc(db, 'feedback', feedbackId));
    } catch (error) {
      console.error('Error deleting feedback:', error);
      throw error;
    }
  }

  // Auth state observer
  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  getCurrentUser() {
    return auth.currentUser;
  }
}

export const authService = new AuthService();