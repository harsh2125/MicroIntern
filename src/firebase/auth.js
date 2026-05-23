import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';

/**
 * Register a new user (student or company)
 * Creates Firebase Auth account + Firestore profile document
 */
export const registerUser = async ({ email, password, name, role, extra = {} }) => {
  // Step 1: Create Firebase Auth account
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Step 2: Set display name in Firebase Auth
  await updateProfile(user, { displayName: name });

  // Step 3: Create Firestore user profile document
  // Document ID = user's UID (links Auth and Firestore)
  await setDoc(doc(db, 'users', user.uid), {
    uid:         user.uid,
    email:       email.toLowerCase(),
    name,
    role,              // 'student' | 'company' | 'admin'
    isBlocked:   false,
    photoURL:    '',
    createdAt:   serverTimestamp(),
    ...extra,          // role-specific fields (university, companyName, etc.)
  });

  return user;
};

/**
 * Login existing user with email + password
 */
export const loginUser = async ({ email, password }) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

/**
 * Send password reset email
 */
export const resetPassword = async (email) => {
  await sendPasswordResetEmail(auth, email);
};

/**
 * Logout current user
 */
export const logoutUser = async () => {
  await signOut(auth);
};