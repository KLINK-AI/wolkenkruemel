import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  collection,
  getDocs,
  query,
  where, 
  documentId,
  deleteDoc
} from 'firebase/firestore';
import { User, RegisterCredentials, Activity } from '../types';
import { auth, db } from './firebaseConfig';

export const checkAdminStatus = async (): Promise<void> => {
  const user = auth.currentUser;
  console.log('auth.currentUser:', user); // Add this line to log the user object
  if (!user) {
    throw new Error('Sie müssen angemeldet sein, um diese Aktion auszuführen.');
  }

  const userDoc = await getDoc(doc(db, 'users', user.uid));
  if (!userDoc.exists() || userDoc.data().role !== 'admin') {
    throw new Error('Sie benötigen Administrator-Rechte, um diese Aktion auszuführen.');
  }
};

export const registerUser = async (credentials: RegisterCredentials): Promise<User> => {
  try {
    const { email, password, displayName, agreedToTerms, agreedToNewsletter } = credentials;
    
    if (!agreedToTerms) {
      throw new Error('Sie müssen den Nutzungsbedingungen zustimmen');
    }
    
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    // Update profile if display name is provided
    if (displayName) {
      await updateProfile(firebaseUser, { displayName });
    }
    
    // Send email verification
    await sendEmailVerification(firebaseUser);
    
    // Create user document in Firestore
    const userData: User = {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName: displayName || null,
      photoURL: firebaseUser.photoURL,
      isEmailVerified: firebaseUser.emailVerified,
      role: 'free',
      createdAt: new Date().toISOString(),
      agreedToTerms,
      agreedToNewsletter,
      favorites: []
    };
    
    await setDoc(doc(db, 'users', firebaseUser.uid), userData);
    
    return userData;
  } catch (error: any) {
    console.error('Registration error:', error);
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('Diese E-Mail-Adresse wird bereits verwendet');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Ungültige E-Mail-Adresse');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('Das Passwort muss mindestens 6 Zeichen lang sein');
    }
    throw new Error('Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.');
  }
};

export const loginUser = async (email: string, password: string): Promise<FirebaseUser> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    // Update email verification status in Firestore
    await updateDoc(doc(db, 'users', firebaseUser.uid), {
      isEmailVerified: firebaseUser.emailVerified,
      updatedAt: new Date().toISOString()
    });
    
    return firebaseUser;
  } catch (error: any) {
    console.error('Login error:', error);
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      throw new Error('Ungültige E-Mail oder Passwort');
    }
    throw new Error('Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.');
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
    throw new Error('Abmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.');
  }
};

export const sendPasswordReset = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error('Password reset error:', error);
    if (error.code === 'auth/user-not-found') {
      throw new Error('Kein Benutzer mit dieser E-Mail-Adresse gefunden');
    }
    throw new Error('Passwort zurücksetzen fehlgeschlagen. Bitte versuchen Sie es erneut.');
  }
};

export const getUserData = async (uid: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const userData = userDoc.data() as User;
      
      // Get current Firebase user
      const currentUser = auth.currentUser;
      if (currentUser) {
        // Update email verification status if it's different
        if (userData.isEmailVerified !== currentUser.emailVerified) {
          await updateDoc(doc(db, 'users', uid), {
            isEmailVerified: currentUser.emailVerified,
            updatedAt: new Date().toISOString()
          });
          userData.isEmailVerified = currentUser.emailVerified;
        }
      }
      
      return userData;
    }
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

export const updateUserData = async (uid: string, data: Partial<User>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', uid), {
      ...data,
      updatedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error updating user data:', error);
    throw new Error('Aktualisierung fehlgeschlagen. Bitte versuchen Sie es erneut.');
  }
};

export const addToFavorites = async (userId: string, activityId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      favorites: arrayUnion(activityId),
      updatedAt: new Date().toISOString()
    });
  } catch (error: any) {
    throw new Error('Fehler beim Hinzufügen zu Favoriten: ' + error.message);
  }
};

export const removeFromFavorites = async (userId: string, activityId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      favorites: arrayRemove(activityId),
      updatedAt: new Date().toISOString()
    });
  } catch (error: any) {
    throw new Error('Fehler beim Entfernen aus Favoriten: ' + error.message);
  }
};

export const getUserFavorites = async (userId: string): Promise<string[]> => {
  try {
    const userData = await getUserData(userId);
    return userData?.favorites || [];
  } catch (error) {
    console.error('Error getting favorites:', error);
    return [];
  }
};

export const saveUserProgress = async (userId: string, activityId: string, progressData: any): Promise<void> => {
  try {
    // Get the current user document
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      throw new Error(`Benutzer mit ID ${userId} nicht gefunden`);
    }

    // Get the existing progress map or initialize an empty one
    const existingProgress = userDoc.data().progress || {};

    // Update the specific activity's progress within the map
    await updateDoc(userDocRef, {
      progress: { ...existingProgress, [activityId]: progressData },
      updatedAt: new Date().toISOString()
    });
    console.log(`User progress for activity ${activityId} saved for user ${userId}`);
  } catch (error: any) {
    console.error('Error saving user progress:', error);
    throw new Error('Fehler beim Speichern des Fortschritts: ' + error.message);
  }
};

export const getUserProgress = async (userId: string): Promise<Map<string, any> | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const progressData = userData?.progress;
      
      if (progressData) {
        // Convert the plain object from Firestore into a Map
        const progressMap = new Map<string, any>();
        for (const activityId in progressData) {
          if (Object.hasOwnProperty.call(progressData, activityId)) {
            progressMap.set(activityId, progressData[activityId]);
          }
        }
        return progressMap;
      }
    }
    return null; // Return null if user or progress data does not exist
  } catch (error) {
    console.error('Error getting user progress:', error);
    return null;
  }
};

export const createActivity = async (activityData: Omit<Activity, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<Activity> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Sie müssen angemeldet sein, um eine Aktivität zu erstellen');
    }

    // Check if user has admin role in Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists() || userDoc.data().role !== 'admin') {
      throw new Error('Sie benötigen Administrator-Rechte zum Erstellen von Aktivitäten');
    }

    const activityWithMetadata = {
      ...activityData,
      createdBy: user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      imageUrl: activityData.imageUrl || ''
    };

    const docRef = doc(collection(db, 'activities'));
    const newActivity = {
      id: docRef.id,
      ...activityWithMetadata
    } as Activity;

    await setDoc(docRef, newActivity);

    console.log('Activity created:', newActivity);
    return newActivity;
  } catch (error: any) {
    console.error('Error creating activity:', error);
    throw new Error(`Aktivität konnte nicht erstellt werden: ${error.message}`);
  }
};

export const getAllActivities = async (): Promise<Activity[]> => {
  try {
    const activitiesCollection = collection(db, 'activities');
    const querySnapshot = await getDocs(activitiesCollection);
    const activities: Activity[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Activity[];

    console.log('Activities fetched:', activities.length);
    return activities;
  } catch (error: any) {
    console.error('Error getting all activities:', error);
    // Depending on requirements, you might want to re-throw or return an empty array
    throw error;
  }
};

export const getActivityById = async (activityId: string): Promise<Activity | null> => {
  try {
    const activityRef = doc(db, 'activities', activityId);
    const activityDoc = await getDoc(activityRef);

    if (activityDoc.exists()) {
      return { id: activityDoc.id, ...activityDoc.data() } as Activity;
    } else {
      return null;
    }
  } catch (error: any) {
    console.error(`Error getting activity with ID ${activityId}:`, error);
    throw error;
  }
};

export const getActivitiesByIds = async (activityIds: string[]): Promise<Activity[]> => {
  if (activityIds.length === 0) {
    return [];
  }
  
  try {
    const activitiesCollection = collection(db, 'activities');
    // Firestore 'in' query has a limit of 10 items
    // If you need to fetch more, you'll need to split the ids array and make multiple queries
    const q = query(activitiesCollection, where(documentId(), 'in', activityIds.slice(0, 10)));
    
    const querySnapshot = await getDocs(q);
    const activities: Activity[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Activity[];
    return activities;
  } catch (error: any) {
    console.error('Error getting activities by IDs:', error);
    throw new Error('Fehler beim Abrufen von Aktivitäten nach IDs: ' + error.message);
  }
};
export const updateActivity = async (activityId: string, activityData: Partial<Activity>): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Sie müssen angemeldet sein, um eine Aktivität zu aktualisieren');
    }

    // Check if user has admin role in Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists() || userDoc.data().role !== 'admin') {
      throw new Error('Sie benötigen Administrator-Rechte zum Aktualisieren von Aktivitäten');
    }

    // First check if the activity exists
    const activityRef = doc(db, 'activities', activityId);
    const activityDoc = await getDoc(activityRef);

    if (!activityDoc.exists()) {
      throw new Error(`Aktivität mit ID ${activityId} existiert nicht`);
    }

    // Update the activity
    await updateDoc(activityRef, {
      ...activityData,
      updatedAt: new Date().toISOString()
    });

    console.log('Activity updated:', activityId);
  } catch (error: any) {
    console.error('Error updating activity:', error);
    throw error;
  }
};

export const deleteActivity = async (activityId: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Sie müssen angemeldet sein, um eine Aktivität zu löschen');
    }

    // Check if user has admin role in Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists() || userDoc.data().role !== 'admin') {
      throw new Error('Sie benötigen Administrator-Rechte zum Löschen von Aktivitäten');
    }

    // Check if the activity exists before deleting
    const activityRef = doc(db, 'activities', activityId);
    const activityDoc = await getDoc(activityRef);

    if (!activityDoc.exists()) {
      throw new Error(`Aktivität mit ID ${activityId} existiert nicht`);
    }

    await deleteDoc(activityRef);
    console.log('Activity deleted:', activityId);
  } catch (error: any) {
    console.error('Error deleting activity:', error);
    throw error;
  }
};

// Re-export auth-related objects
export { auth };