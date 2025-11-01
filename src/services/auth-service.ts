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
  orderBy,
  increment,
  limit,
  where
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export interface UserRole {
  uid: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: Date;
  lastLogin?: Date;
}

export interface FeedbackResponse {
  id: string;
  feedbackId: string;
  message: string;
  adminId: string;
  adminEmail: string;
  createdAt: Date;
  edited?: boolean;
  editedAt?: Date;
}

export interface FeedbackDoc {
  id: string;
  type: 'bug' | 'feature' | 'improvement' | 'general';
  title: string;
  description: string;
  rating: number;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  userEmail?: string;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'pending' | 'reviewed' | 'resolved';
  responseCount: number;
  resolvedAt?: Date;
  resolvedBy?: string;
  tags?: string[];
  metadata?: {
    browser?: string;
    os?: string;
    appVersion?: string;
  };
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
  async submitFeedback(feedback: Omit<FeedbackDoc, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'responseCount'>) {
    try {
      // Remove undefined fields to avoid Firestore errors
      const cleanFeedback: any = {
        type: feedback.type,
        title: feedback.title,
        description: feedback.description,
        rating: feedback.rating,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'pending' as const,
        responseCount: 0
      };
      
      // Only add optional fields if they have values
      if (feedback.userEmail) {
        cleanFeedback.userEmail = feedback.userEmail;
      }
      if (auth.currentUser?.uid) {
        cleanFeedback.userId = auth.currentUser.uid;
      }
      if (feedback.priority) {
        cleanFeedback.priority = feedback.priority;
      }
      if (feedback.tags && feedback.tags.length > 0) {
        cleanFeedback.tags = feedback.tags;
      }
      if (feedback.metadata) {
        cleanFeedback.metadata = feedback.metadata;
      }
      
      const docRef = await addDoc(collection(db, 'feedback'), cleanFeedback);
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
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          resolvedAt: data.resolvedAt?.toDate(),
          responseCount: data.responseCount || 0
        };
      }) as FeedbackDoc[];
    } catch (error) {
      console.error('Error getting feedback:', error);
      return [];
    }
  }

  async getUserFeedback(userId: string): Promise<FeedbackDoc[]> {
    try {
      const q = query(
        collection(db, 'feedback'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          resolvedAt: data.resolvedAt?.toDate(),
          responseCount: data.responseCount || 0
        };
      }) as FeedbackDoc[];
    } catch (error) {
      console.error('Error getting user feedback:', error);
      return [];
    }
  }

  async updateFeedbackStatus(feedbackId: string, status: 'pending' | 'reviewed' | 'resolved') {
    try {
      const docRef = doc(db, 'feedback', feedbackId);
      const updates: any = { 
        status,
        updatedAt: new Date()
      };
      
      if (status === 'resolved') {
        updates.resolvedAt = new Date();
        updates.resolvedBy = auth.currentUser?.email || 'admin';
      }
      
      await updateDoc(docRef, updates);
    } catch (error) {
      console.error('Error updating feedback status:', error);
      throw error;
    }
  }

  // Add response to subcollection
  async addFeedbackResponse(feedbackId: string, message: string) {
    try {
      // Add response to subcollection
      const responsesRef = collection(db, `feedback/${feedbackId}/responses`);
      const newResponse = {
        message,
        adminId: auth.currentUser?.uid || 'unknown',
        adminEmail: auth.currentUser?.email || 'admin',
        createdAt: new Date()
      };
      
      const responseDoc = await addDoc(responsesRef, newResponse);
      
      // Update feedback document with response count and status
      const feedbackRef = doc(db, 'feedback', feedbackId);
      await updateDoc(feedbackRef, {
        responseCount: increment(1),
        status: 'reviewed',
        updatedAt: new Date()
      });
      
      return {
        id: responseDoc.id,
        feedbackId,
        ...newResponse
      };
    } catch (error) {
      console.error('Error adding feedback response:', error);
      throw error;
    }
  }

  // Get responses for a feedback item
  async getFeedbackResponses(feedbackId: string, limitCount?: number): Promise<FeedbackResponse[]> {
    try {
      const responsesRef = collection(db, `feedback/${feedbackId}/responses`);
      let q = query(responsesRef, orderBy('createdAt', 'asc'));
      
      if (limitCount) {
        q = query(q, limit(limitCount));
      }
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        feedbackId,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      })) as FeedbackResponse[];
    } catch (error) {
      console.error('Error getting feedback responses:', error);
      return [];
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