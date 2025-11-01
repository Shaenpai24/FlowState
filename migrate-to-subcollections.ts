/**
 * Migration Script: Array-based Responses → Subcollections
 * 
 * This script migrates existing feedback with responses arrays
 * to the new subcollection structure.
 * 
 * Run this ONCE to migrate existing data.
 */

import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  addDoc,
  deleteField 
} from 'firebase/firestore';
import { db } from './src/lib/firebase';

interface OldFeedbackResponse {
  id: string;
  message: string;
  adminEmail: string;
  adminId?: string;
  createdAt: any;
}

interface OldFeedback {
  id: string;
  responses?: OldFeedbackResponse[];
  [key: string]: any;
}

async function migrateToSubcollections() {
  console.log('🚀 Starting migration to subcollections...\n');
  
  try {
    // Get all feedback documents
    const feedbackRef = collection(db, 'feedback');
    const feedbackSnapshot = await getDocs(feedbackRef);
    
    console.log(`📊 Found ${feedbackSnapshot.size} feedback documents\n`);
    
    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const feedbackDoc of feedbackSnapshot.docs) {
      const feedbackId = feedbackDoc.id;
      const data = feedbackDoc.data() as OldFeedback;
      
      console.log(`\n📝 Processing feedback: ${feedbackId}`);
      console.log(`   Title: ${data.title || 'Untitled'}`);
      
      // Check if has old responses array
      if (data.responses && Array.isArray(data.responses) && data.responses.length > 0) {
        console.log(`   ✓ Found ${data.responses.length} responses to migrate`);
        
        try {
          // Create subcollection for responses
          const responsesRef = collection(db, `feedback/${feedbackId}/responses`);
          
          // Migrate each response
          for (const response of data.responses) {
            const newResponse = {
              message: response.message,
              adminId: response.adminId || 'unknown',
              adminEmail: response.adminEmail,
              createdAt: response.createdAt,
              feedbackId: feedbackId
            };
            
            await addDoc(responsesRef, newResponse);
            console.log(`     → Migrated response: "${response.message.substring(0, 50)}..."`);
          }
          
          // Update feedback document
          await updateDoc(doc(db, 'feedback', feedbackId), {
            responseCount: data.responses.length,
            updatedAt: new Date(),
            responses: deleteField() // Remove old array
          });
          
          console.log(`   ✅ Successfully migrated ${data.responses.length} responses`);
          migratedCount++;
          
        } catch (error) {
          console.error(`   ❌ Error migrating feedback ${feedbackId}:`, error);
          errorCount++;
        }
        
      } else if (data.responses && Array.isArray(data.responses) && data.responses.length === 0) {
        // Has empty responses array - just update to new structure
        try {
          await updateDoc(doc(db, 'feedback', feedbackId), {
            responseCount: 0,
            updatedAt: data.createdAt || new Date(),
            responses: deleteField()
          });
          console.log(`   ✓ Updated to new structure (no responses)`);
          migratedCount++;
        } catch (error) {
          console.error(`   ❌ Error updating feedback ${feedbackId}:`, error);
          errorCount++;
        }
        
      } else {
        // Already in new format or no responses field
        console.log(`   ⊘ Already in new format or no responses - skipped`);
        
        // Ensure it has responseCount field
        if (typeof data.responseCount !== 'number') {
          try {
            await updateDoc(doc(db, 'feedback', feedbackId), {
              responseCount: 0,
              updatedAt: data.updatedAt || data.createdAt || new Date()
            });
            console.log(`   ✓ Added responseCount field`);
          } catch (error) {
            console.error(`   ❌ Error adding responseCount:`, error);
          }
        }
        
        skippedCount++;
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully migrated: ${migratedCount}`);
    console.log(`⊘  Skipped (already migrated): ${skippedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📝 Total processed: ${feedbackSnapshot.size}`);
    console.log('='.repeat(60));
    
    if (errorCount === 0) {
      console.log('\n🎉 Migration completed successfully!');
      console.log('\n✅ Next steps:');
      console.log('   1. Check Firestore Console to verify subcollections');
      console.log('   2. Test the app to ensure everything works');
      console.log('   3. Delete this migration script if no longer needed');
    } else {
      console.log('\n⚠️  Migration completed with errors. Please review the logs above.');
    }
    
  } catch (error) {
    console.error('\n❌ Fatal error during migration:', error);
    throw error;
  }
}

// Run migration
console.log('⚠️  WARNING: This will modify your Firestore database!');
console.log('⚠️  Make sure you have a backup before proceeding.\n');

// Uncomment the line below to run the migration
// migrateToSubcollections();

export { migrateToSubcollections };
